import type { CSSProperties } from "react";
import type { Booth } from "../game/types";
import type { BoothStat } from "../state/player";
import { Sheet } from "./Sheet";
import { Icon } from "./icons";

type Props = {
  booth: Booth;
  floorLabel: string;
  stamped: boolean;
  stat: BoothStat | undefined;
  onTry: () => void;
  onCopy: () => void;
  onClose: () => void;
};

export function BoothPanel({ booth, floorLabel, stamped, stat, onTry, onCopy, onClose }: Props) {
  const dwell = Math.round((stat?.dwellMs ?? 0) / 1000);
  return (
    <Sheet eyebrow={`DEMO BOOTH · ${floorLabel.toUpperCase()}`} onClose={onClose} className="booth-sheet">
      <div className="booth-hero" style={{ "--accent": booth.color } as CSSProperties}>
        <span className="booth-mark">{booth.sponsor.slice(0, 1)}</span>
        <div>
          <span className="booth-cat">{booth.category}</span>
          <h2>{booth.sponsor}</h2>
        </div>
        <span className={stamped ? "stamp-chip on" : "stamp-chip"}>
          {stamped ? <Icon name="check" size={13} /> : null}
          {stamped ? "STAMPED" : "NOT STAMPED"}
        </span>
      </div>

      <p className="booth-tagline">{booth.tagline}</p>

      <div className="offer-box" style={{ borderColor: `${booth.color}55` }}>
        <span className="eyebrow">AT THE BOOTH</span>
        <b>{booth.offer}</b>
        <p>
          A two minute demo, one wallet, no signup. In the real product this is where the sponsor
          captures a qualified remote lead.
        </p>
      </div>

      <div className="booth-stats">
        <div>
          <b>{stat?.opens ?? 0}</b>
          <span>opens by you</span>
        </div>
        <div>
          <b>{stat?.actions ?? 0}</b>
          <span>demos tried</span>
        </div>
        <div>
          <b>{dwell}s</b>
          <span>dwell time</span>
        </div>
      </div>

      <div className="sheet-actions">
        <button className="btn primary" onClick={onTry} style={{ background: booth.color }}>
          <Icon name="spark" size={16} />
          Try the demo
        </button>
        <button className="btn ghost" onClick={onCopy}>
          <Icon name="copy" size={15} />
          Copy booth brief
        </button>
      </div>

      <p className="micro-note">
        Fictional demo sponsor. This booth, its offer and its metrics are illustrative. A stamp here
        counts toward the three, six and nine stamp quests.
      </p>
      <button className="btn subtle full" onClick={onClose}>
        Back to the floor
      </button>
    </Sheet>
  );
}
