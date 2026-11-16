import { QUESTS } from "../game/quests";
import type { PlayerState } from "../state/player";
import { Icon } from "./icons";

type Props = {
  player: PlayerState;
  onOpen: () => void;
};

export function QuestTracker({ player, onOpen }: Props) {
  const active = QUESTS.filter((q) => !player.completed.includes(q.id)).slice(0, 3);
  const done = player.completed.length;
  const pct = Math.round((done / QUESTS.length) * 100);

  return (
    <section className="tracker" aria-label="Active quests">
      <div className="tracker-head">
        <div>
          <span className="eyebrow">NEXT UP</span>
          <b>
            {done} of {QUESTS.length} cleared
          </b>
        </div>
        <span className="tracker-pct">{pct}%</span>
      </div>
      <div className="progress">
        <span style={{ width: `${pct}%` }} />
      </div>
      <ul className="tracker-list">
        {active.map((q) => (
          <li key={q.id}>
            <span className="quest-dot" />
            <div>
              <b>{q.title}</b>
              <span>{q.detail}</span>
            </div>
            <em>+{q.points}</em>
          </li>
        ))}
        {active.length === 0 && <li className="tracker-done">Every quest is cleared. Legend.</li>}
      </ul>
      <button className="tracker-foot" onClick={onOpen}>
        All quests and receipts
        <Icon name="arrow" size={14} />
      </button>
    </section>
  );
}
