import type { PlayerState } from "../state/player";
import { boardFor } from "../state/leaderboard";
import { Sheet } from "./Sheet";
import { Icon } from "./icons";

type Props = {
  player: PlayerState;
  onClose: () => void;
  onShare: () => void;
};

export function BoardPanel({ player, onClose, onShare }: Props) {
  const rows = boardFor(player);
  const max = Math.max(...rows.map((r) => r.points), 1);
  const me = rows.find((r) => r.me);

  return (
    <Sheet eyebrow="LEADERBOARD" onClose={onClose} className="board-sheet">
      <h2>Olympia board</h2>
      <p className="sheet-lede">
        You are rank <b>#{me?.rank}</b> with {player.points} points. The board is seeded with demo
        players and kept in your browser. There is no server to cheat.
      </p>

      <div className="board-list">
        {rows.map((r) => (
          <div key={`${r.name}-${r.rank}`} className={r.me ? "board-row me" : "board-row"}>
            <span className={r.rank <= 3 ? "rank top" : "rank"}>{r.rank}</span>
            <div className="board-name">
              <b>
                {r.name}
                {r.me && <em>you</em>}
              </b>
              <span>
                {r.tier} · {r.floor} · {r.stamps}/12 stamps
              </span>
              <div className="board-bar">
                <span style={{ width: `${Math.round((r.points / max) * 100)}%` }} />
              </div>
            </div>
            <span className="board-points">{r.points}</span>
          </div>
        ))}
      </div>

      <div className="sheet-actions">
        <button className="btn primary" onClick={onShare}>
          <Icon name="share" size={16} />
          Share your rank
        </button>
        <button className="btn ghost" onClick={onClose}>
          Back to the floor
        </button>
      </div>
    </Sheet>
  );
}
