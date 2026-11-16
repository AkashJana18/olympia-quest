import { QUESTS, tierFor } from "../game/quests";
import type { PlayerState } from "../state/player";
import { Sheet } from "./Sheet";
import { Icon } from "./icons";

type Target = "quests" | "board" | "report" | "about";

type Props = {
  player: PlayerState;
  onClose: () => void;
  onNavigate: (panel: Target) => void;
  onShare: () => void;
};

export function MenuPanel({ player, onClose, onNavigate, onShare }: Props) {
  const items: Array<{ key: Target; icon: "quest" | "board" | "report" | "info"; label: string; sub: string }> = [
    { key: "quests", icon: "quest", label: "Quests and receipts", sub: `${player.completed.length} of ${QUESTS.length} cleared` },
    { key: "board", icon: "board", label: "Leaderboard", sub: `${player.points} points this run` },
    { key: "report", icon: "report", label: "Sponsor report", sub: "The booth dashboard" },
    { key: "about", icon: "info", label: "About and controls", sub: "What is real, what is demo" },
  ];

  return (
    <Sheet eyebrow="MENU" onClose={onClose} className="menu-sheet">
      <div className="menu-player">
        <div className="menu-avatar">{player.name.slice(0, 2).toUpperCase()}</div>
        <div>
          <span className="eyebrow">REMOTE ATTENDEE</span>
          <h2>{player.name}</h2>
          <p>
            {tierFor(player.points).name} · {player.stamps.length}/12 stamps ·{" "}
            {player.receipts.length} receipts
          </p>
        </div>
        <b className="menu-points">{player.points}</b>
      </div>

      <div className="menu-list">
        {items.map((it) => (
          <button key={it.key} className="menu-row" onClick={() => onNavigate(it.key)}>
            <span className="menu-icon">
              <Icon name={it.icon} size={18} />
            </span>
            <span>
              <b>{it.label}</b>
              <em>{it.sub}</em>
            </span>
            <Icon name="arrow" size={16} />
          </button>
        ))}
        <button className="menu-row" onClick={onShare}>
          <span className="menu-icon">
            <Icon name="share" size={18} />
          </span>
          <span>
            <b>Share this floor</b>
            <em>Post it on X</em>
          </span>
          <Icon name="arrow" size={16} />
        </button>
      </div>

      <p className="micro-note">
        Unofficial fan project. No wallet needed to play. Progress stays in this browser.
      </p>
    </Sheet>
  );
}
