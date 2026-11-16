import { useState } from "react";
import { MAX_POINTS, QUESTS, tierFor } from "../game/quests";
import type { PlayerState, Receipt } from "../state/player";
import { Sheet } from "./Sheet";
import { Icon } from "./icons";

type Props = {
  player: PlayerState;
  onClose: () => void;
  onSign: (receipt: Receipt) => void;
  signingId: string | null;
  wallet: { name: string; address: string } | null;
  onConnect: () => void;
  onShare: () => void;
};

export function QuestPanel({ player, onClose, onSign, signingId, wallet, onConnect, onShare }: Props) {
  const [tab, setTab] = useState<"quests" | "receipts">("quests");
  const done = player.completed.length;
  const pct = Math.round((done / QUESTS.length) * 100);

  return (
    <Sheet eyebrow="RUN LOG" onClose={onClose} className="quest-sheet">
      <h2>Your run so far</h2>
      <p className="sheet-lede">
        Twelve quests, twelve booths, two floors. No wallet needed to play. A wallet only turns a
        receipt into something provable.
      </p>

      <div className="stat-row">
        <div>
          <b>{player.points}</b>
          <span>points</span>
        </div>
        <div>
          <b>{tierFor(player.points).name}</b>
          <span>tier</span>
        </div>
        <div>
          <b>
            {player.stamps.length}
            <small>/12</small>
          </b>
          <span>stamps</span>
        </div>
        <div>
          <b>
            {done}
            <small>/{QUESTS.length}</small>
          </b>
          <span>quests</span>
        </div>
      </div>

      <div className="panel-progress">
        <div className="panel-progress-head">
          <span>{MAX_POINTS} points available</span>
          <span>{pct}% cleared</span>
        </div>
        <div className="progress">
          <span style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="tabs" role="tablist">
        <button
          role="tab"
          aria-selected={tab === "quests"}
          className={tab === "quests" ? "tab active" : "tab"}
          onClick={() => setTab("quests")}
        >
          Quests <span>{done}/{QUESTS.length}</span>
        </button>
        <button
          role="tab"
          aria-selected={tab === "receipts"}
          className={tab === "receipts" ? "tab active" : "tab"}
          onClick={() => setTab("receipts")}
        >
          Receipts <span>{player.receipts.length}</span>
        </button>
      </div>

      {tab === "quests" ? (
        <ul className="quest-list">
          {QUESTS.map((q) => {
            const isDone = player.completed.includes(q.id);
            return (
              <li key={q.id} className={isDone ? "done" : ""}>
                <span className={isDone ? "quest-check done" : "quest-check"}>
                  {isDone ? <Icon name="check" size={13} /> : null}
                </span>
                <div className="quest-copy">
                  <b>{q.title}</b>
                  <span>{q.detail}</span>
                  <em>{q.tag}</em>
                </div>
                <span className="quest-points">+{q.points}</span>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="receipts">
          {player.receipts.length === 0 && (
            <div className="empty">
              <Icon name="sign" size={26} />
              <b>No receipts yet</b>
              <span>Clear a quest and a receipt lands here.</span>
            </div>
          )}
          {player.receipts.map((r) => (
            <div key={r.id} className="receipt">
              <div className="receipt-top">
                <span className="receipt-code">{r.code}</span>
                <span className={r.signature ? "badge signed" : "badge"}>
                  {r.signature ? "SIGNED" : "LOCAL"}
                </span>
              </div>
              <b>{r.title}</b>
              <div className="receipt-meta">
                <span>{new Date(r.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                <span>+{r.points} pts</span>
                {r.signature && <span>{r.signer?.slice(0, 4)}…{r.signer?.slice(-4)}</span>}
              </div>
              {!r.signature && (
                <button
                  className="btn ghost small"
                  onClick={() => (wallet ? onSign(r) : onConnect())}
                  disabled={signingId === r.id}
                >
                  <Icon name="sign" size={15} />
                  {signingId === r.id
                    ? "Waiting for wallet…"
                    : wallet
                      ? "Sign with wallet"
                      : "Connect to sign"}
                </button>
              )}
            </div>
          ))}
          <p className="micro-note">
            Signing uses <code>signMessage</code>. It spends nothing and sends nothing. The signature
            is stored locally, next to the receipt.
          </p>
        </div>
      )}

      <div className="sheet-actions">
        <button className="btn primary" onClick={onShare}>
          <Icon name="share" size={16} />
          Share your run
        </button>
        <button className="btn ghost" onClick={onClose}>
          Back to the floor
        </button>
      </div>
    </Sheet>
  );
}
