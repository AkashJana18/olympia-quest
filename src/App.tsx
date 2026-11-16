import { useCallback, useEffect, useRef, useState } from "react";
import { Game } from "./game/engine";
import { FLOORS } from "./game/world";
import { QUESTS } from "./game/quests";
import type { Booth, FloorId, Spot, Stage, Vec } from "./game/types";
import {
  applyEvent,
  attachSignature,
  clearPlayer,
  createPlayer,
  loadPlayer,
  recordBoothAction,
  recordBoothDwell,
  recordBoothOpen,
  savePlayer,
  type PlayerEvent,
  type PlayerState,
  type Receipt,
} from "./state/player";import { connectWallet, shortAddress, signReceipt } from "./state/wallet";
import { TitleScreen } from "./ui/TitleScreen";
import { TopBar } from "./ui/TopBar";
import { QuestTracker } from "./ui/QuestTracker";
import { Minimap } from "./ui/Minimap";
import { TouchControls } from "./ui/TouchControls";
import { Toasts, type ToastItem, type ToastTone } from "./ui/Toasts";
import { FloorFade } from "./ui/FloorFade";
import { QuestPanel } from "./ui/QuestPanel";
import { BoardPanel } from "./ui/BoardPanel";
import { ReportPanel } from "./ui/ReportPanel";
import { BoothPanel } from "./ui/BoothPanel";
import { StagePanel } from "./ui/StagePanel";
import { TriviaPanel } from "./ui/TriviaPanel";
import { AboutPanel } from "./ui/AboutPanel";
import { MenuPanel } from "./ui/MenuPanel";
import "./styles.css";

const GAME_URL = "https://breakpoint26.solanaconsensuslab.com/";

type Panel =
  | { kind: "quests" }
  | { kind: "board" }
  | { kind: "report" }
  | { kind: "about" }
  | { kind: "menu" }
  | { kind: "booth"; booth: Booth }
  | { kind: "stage"; stage: Stage }
  | { kind: "trivia" }
  | null;

function useIsTouch() {
  const [touch, setTouch] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches,
  );
  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    const onChange = () => setTouch(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return touch;
}

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);
  const playerRef = useRef<PlayerState | null>(null);
  const interactRef = useRef<(spot: Spot) => void>(() => {});
  const fireRef = useRef<(e: PlayerEvent) => void>(() => {});
  const boothOpenedAt = useRef(0);
  const toastSeq = useRef(0);
  const isTouch = useIsTouch();

  const [saved, setSaved] = useState<PlayerState | null>(() => loadPlayer());
  const [player, setPlayer] = useState<PlayerState | null>(null);
  const [screen, setScreen] = useState<"title" | "game">("title");
  const [panel, setPanel] = useState<Panel>(null);
  const [nearby, setNearby] = useState<Spot | null>(null);
  const [floor, setFloor] = useState<FloorId>("ground");
  const [wallet, setWallet] = useState<{ name: string; address: string } | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [signingId, setSigningId] = useState<string | null>(null);
  const [transition, setTransition] = useState<{ label: string; sub: string; key: number } | null>(null);

  const nextQuest = player ? QUESTS.find((q) => !player.completed.includes(q.id)) : undefined;

  const toast = useCallback((title: string, tone: ToastTone = "info", sub?: string) => {
    const id = `t${++toastSeq.current}`;
    setToasts((prev) => [...prev, { id, title, sub, tone }].slice(-3));
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4400);
  }, []);

  const commit = useCallback((next: PlayerState) => {
    playerRef.current = next;
    setPlayer(next);
    setSaved(next);
    savePlayer(next);
  }, []);

  const fire = useCallback(
    (event: PlayerEvent, meta?: { boothName?: string }) => {
      const p = playerRef.current;
      if (!p) return;
      const result = applyEvent(p, event);
      commit(result.next);
      if (result.stamped && meta?.boothName) {
        toast(`Stamp collected · ${meta.boothName}`, "stamp", `${result.next.stamps.length}/12 booths`);
      }
      for (const q of result.completed) {
        toast(`Quest cleared · ${q.title}`, "quest", `+${q.points} points`);
      }
      if (result.next.stamps.length !== p.stamps.length) {
        gameRef.current?.setVisited(result.next.stamps.map((id) => `booth:${id}`));
      }
    },
    [commit, toast],
  );

  const goFloor = useCallback((to: FloorId, spawn: Vec) => {
    const f = FLOORS[to];
    setTransition({
      label: to === "first" ? "First floor" : "Ground floor",
      sub: f.subtitle,
      key: Date.now(),
    });
    setPanel(null);
    window.setTimeout(() => {
      gameRef.current?.teleport(to, spawn);
    }, 420);
    window.setTimeout(() => {
      setTransition(null);
    }, 1900);
  }, []);

  const handleInteract = useCallback(
    (spot: Spot) => {
      if (spot.kind === "stairs" && spot.stair) {
        goFloor(spot.stair.to, spot.stair.spawn);
        return;
      }

      if (spot.kind === "booth" && spot.booth) {
        const p = playerRef.current;
        if (!p) return;
        const opened = recordBoothOpen(p, spot.booth.id);
        playerRef.current = opened;
        setPlayer(opened);
        savePlayer(opened);
        boothOpenedAt.current = Date.now();
        setPanel({ kind: "booth", booth: spot.booth });
        fire({ type: "stamp", boothId: spot.booth.id }, { boothName: spot.booth.sponsor });
        return;
      }

      if (spot.kind === "stage" && spot.stage) {
        fire({ type: "spot", spotId: spot.id });
        setPanel({ kind: "stage", stage: spot.stage });
        return;
      }

      if (spot.kind === "terminal") {
        setPanel({ kind: "trivia" });
        return;
      }

      if (spot.kind === "secret") {
        fire({ type: "secret" });
      }
    },
    [fire, goFloor],
  );

  useEffect(() => {
    fireRef.current = fire;
  }, [fire]);

  useEffect(() => {
    interactRef.current = handleInteract;
  }, [handleInteract]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const game = new Game(canvas, {
      onNearby: setNearby,
      onZone: (zoneId) => fireRef.current({ type: "zone", zoneId }),
      onFloor: (floorId) => {
        setFloor(floorId);
        fireRef.current({ type: "floor", floorId });
      },
      onInteract: (spot) => interactRef.current(spot),
    });
    gameRef.current = game;
    return () => {
      game.destroy();
      gameRef.current = null;
    };
  }, []);

  useEffect(() => {
    gameRef.current?.setPaused(!!panel || !!transition);
  }, [panel, transition]);

  const begin = useCallback(
    (p: PlayerState) => {
      playerRef.current = p;
      setPlayer(p);
      setSaved(p);
      savePlayer(p);
      setScreen("game");
      setFloor(p.floor);
      setPanel(null);
      setNearby(null);
      const game = gameRef.current;
      if (game) {
        game.startAt(p.floor, undefined, p.name);
        game.setVisited(p.stamps.map((id) => `booth:${id}`));
      }
      fire({ type: "floor", floorId: p.floor });
      if (p.points === 0 && p.completed.length === 0 && p.stamps.length === 0) {
        toast(
          "You are in. Find the Main Stage.",
          "info",
          isTouch ? "Joystick to move, action button to interact." : "WASD to move, E to interact.",
        );
      }
    },
    [fire, isTouch, toast],
  );

  const startRun = useCallback(
    (name: string) => {
      begin(createPlayer(name));
    },
    [begin],
  );

  const continueRun = useCallback(() => {
    if (saved) begin(saved);
  }, [begin, saved]);

  const closePanel = useCallback(() => {
    if (panel?.kind === "booth" && boothOpenedAt.current) {
      const ms = Date.now() - boothOpenedAt.current;
      boothOpenedAt.current = 0;
      const p = playerRef.current;
      if (p) commit(recordBoothDwell(p, panel.booth.id, ms));
    }
    setPanel(null);
  }, [commit, panel]);

  const tryDemo = useCallback(() => {
    if (panel?.kind !== "booth") return;
    const p = playerRef.current;
    if (!p) return;
    commit(recordBoothAction(p, panel.booth.id));
    toast(`Demo logged · ${panel.booth.sponsor}`, "info", "Counted as a qualified lead.");
  }, [commit, panel, toast]);

  const openHub = useCallback(() => {
    if (panel?.kind !== "booth" || panel.booth.id !== "solflare") return;
    const p = playerRef.current;
    if (!p) return;
    commit(recordBoothAction(p, panel.booth.id));
    fire({ type: "spot", spotId: "hub:solflare" });
  }, [commit, fire, panel]);

  const copyBrief = useCallback(() => {
    if (panel?.kind !== "booth") return;
    const { sponsor, category, tagline, offer } = panel.booth;
    const text = `${sponsor} · ${category}\n${tagline}\nAt the booth: ${offer}\n\nSeen in Olympia Quest, the remote floor for Breakpoint 2026.`;
    navigator.clipboard
      .writeText(text)
      .then(() => toast("Booth brief copied", "info"))
      .catch(() => toast("Could not copy the brief", "error"));
  }, [panel, toast]);

  const connect = useCallback(async () => {
    if (wallet) {
      await navigator.clipboard.writeText(wallet.address).catch(() => null);
      toast("Wallet address copied", "info", shortAddress(wallet.address));
      return;
    }
    try {
      const w = await connectWallet();
      setWallet(w);
      toast(`Connected · ${w.name}`, "info", shortAddress(w.address));
    } catch (e) {
      toast("Wallet not connected", "error", (e as Error).message);
    }
  }, [toast, wallet]);

  const sign = useCallback(
    async (r: Receipt) => {
      const p = playerRef.current;
      if (!p) return;
      setSigningId(r.id);
      try {
        const message = [
          "Olympia Quest · Breakpoint 2026",
          `Receipt: ${r.code}`,
          `Quest: ${r.title}`,
          `Player: ${p.name}`,
          `Issued: ${new Date(r.at).toISOString()}`,
          "This signature proves this receipt belongs to this wallet. No transaction, no fee.",
        ].join("\n");
        const { signature, signer } = await signReceipt(message);
        commit(attachSignature(p, r.id, signature, signer));
        toast("Receipt signed", "quest", `${signature.slice(0, 8)}…`);
      } catch (e) {
        toast("Signature cancelled", "error", (e as Error).message.slice(0, 100));
      } finally {
        setSigningId(null);
      }
    },
    [commit, toast],
  );

  const share = useCallback(async () => {
    const p = playerRef.current;
    const text = p
      ? `I walked the remote floor of Breakpoint 2026: ${p.points} pts, ${p.stamps.length}/12 booth stamps, ${p.completed.length}/${QUESTS.length} quests.`
      : "Walk the remote floor of Breakpoint 2026: two levels, twelve booths, twelve quests.";
    if (navigator.share) {
      try {
        await navigator.share({ title: "Olympia Quest", text, url: GAME_URL });
        return;
      } catch {
        return;
      }
    }
    try {
      await navigator.clipboard.writeText(`${text} ${GAME_URL}`);
      toast("Share text copied", "info", "Paste it on X.");
    } catch {
      toast("Could not copy the link", "error", GAME_URL);
    }
  }, [toast]);

  const reset = useCallback(() => {
    clearPlayer();
    playerRef.current = null;
    setPlayer(null);
    setSaved(null);
    setPanel(null);
    setScreen("title");
    setFloor("ground");
    setWallet(null);
    setNearby(null);
    setTransition(null);
    gameRef.current?.attract();
  }, []);

  return (
    <div className={screen === "title" ? "app is-title" : "app is-game"}>
      <canvas ref={canvasRef} className="world-canvas" aria-label="Olympia Quest venue" />

      {screen === "title" ? (
        <TitleScreen
          saved={saved}
          onStart={startRun}
          onContinue={continueRun}
          onShare={share}
          onAbout={() => setPanel({ kind: "about" })}
        />
      ) : player ? (
        <>
          <TopBar
            player={player}
            floor={floor}
            wallet={wallet}
            onOpen={(kind) => setPanel({ kind })}
            onShare={share}
            onConnect={connect}
          />
          <QuestTracker player={player} onOpen={() => setPanel({ kind: "quests" })} />
          <Minimap gameRef={gameRef} floor={floor} />

          {isTouch && nextQuest && (
            <button className="mobile-objective" onClick={() => setPanel({ kind: "quests" })}>
              <span className="eyebrow">NEXT</span>
              <b>{nextQuest.title}</b>
              <em>+{nextQuest.points}</em>
            </button>
          )}

          {!isTouch && nearby && (
            <button className="prompt" onClick={() => handleInteract(nearby)}>
              <kbd>E</kbd>
              <span>
                <b>{nearby.label}</b>
                <em>{nearby.hint}</em>
              </span>
              <span className="prompt-go">
                Go
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 12h15m-5-5 5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </button>
          )}

          {!isTouch && (
            <div className="desk-hint">
              <kbd>W</kbd>
              <kbd>A</kbd>
              <kbd>S</kbd>
              <kbd>D</kbd>
              <span>move</span>
              <span className="dot-sep" />
              <kbd>Shift</kbd>
              <span>sprint</span>
              <span className="dot-sep" />
              <span>click the floor to walk</span>
            </div>
          )}

          {isTouch && (
            <TouchControls
              gameRef={gameRef}
              nearby={nearby}
              onInteract={() => {
                if (nearby) handleInteract(nearby);
              }}
            />
          )}
        </>
      ) : null}

      {panel?.kind === "quests" && player && (
        <QuestPanel
          player={player}
          onClose={closePanel}
          onSign={sign}
          signingId={signingId}
          wallet={wallet}
          onConnect={connect}
          onShare={share}
        />
      )}

      {panel?.kind === "board" && player && (
        <BoardPanel player={player} onClose={closePanel} onShare={share} />
      )}

      {panel?.kind === "report" && player && (
        <ReportPanel player={player} onClose={closePanel} />
      )}

      {panel?.kind === "booth" && player && (
        <BoothPanel
          booth={panel.booth}
          floorLabel={floor === "ground" ? "Ground floor" : "First floor"}
          stamped={player.stamps.includes(panel.booth.id)}
          stat={player.stats[panel.booth.id]}
          onTry={tryDemo}
          onCopy={copyBrief}
          onHub={openHub}
          onClose={closePanel}
        />
      )}

      {panel?.kind === "stage" && <StagePanel stage={panel.stage} onClose={closePanel} />}

      {panel?.kind === "trivia" && player && (
        <TriviaPanel
          done={player.triviaDone}
          onComplete={() => fire({ type: "trivia" })}
          onClose={closePanel}
        />
      )}

      {panel?.kind === "about" && (
        <AboutPanel
          player={player}
          onClose={closePanel}
          onReset={player ? reset : closePanel}
        />
      )}

      {panel?.kind === "menu" && player && (
        <MenuPanel
          player={player}
          onClose={closePanel}
          onShare={share}
          onNavigate={(kind) => setPanel({ kind })}
        />
      )}

      {transition && <FloorFade key={transition.key} label={transition.label} sub={transition.sub} />}

      <Toasts items={toasts} />
      <div className="grain" aria-hidden="true" />
    </div>
  );
}
