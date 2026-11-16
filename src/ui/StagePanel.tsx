import type { Stage } from "../game/types";
import { Sheet } from "./Sheet";
import { Icon } from "./icons";

type Props = {
  stage: Stage;
  onClose: () => void;
};

export function StagePanel({ stage, onClose }: Props) {
  return (
    <Sheet eyebrow={`SESSION · ${stage.room.toUpperCase()}`} onClose={onClose} className="stage-sheet">
      <div className={`stage-hero ${stage.tone}`}>
        <div className="stage-live">
          <span className="live-dot" />
          NOW ON STAGE
        </div>
        <h2>{stage.session}</h2>
        <p>{stage.speaker}</p>
        <div className="stage-time">
          <Icon name="clock" size={14} />
          {stage.time}
          <span className="sep" />
          Olympia London
        </div>
        <div className="stage-bars" aria-hidden="true">
          {Array.from({ length: 18 }).map((_, i) => (
            <span key={i} style={{ height: `${18 + ((i * 37) % 52)}%` }} />
          ))}
        </div>
      </div>

      <div className="attended">
        <Icon name="check" size={16} />
        <div>
          <b>Attendance marked</b>
          <span>This session counts toward your run. The remote receipt is already in your log.</span>
        </div>
      </div>

      <a className="btn primary full" href="https://solana.com/breakpoint" target="_blank" rel="noreferrer">
        <Icon name="link" size={16} />
        Watch the live stream
      </a>

      <p className="micro-note">
        The stream belongs to the Solana Foundation. This companion only marks that you showed up.
      </p>
      <button className="btn ghost full" onClick={onClose}>
        Back to the floor
      </button>
    </Sheet>
  );
}
