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
  onHub?: () => void;
  onClose: () => void;
};

export function BoothPanel({
  booth,
  floorLabel,
  stamped,
  stat,
  onTry,
  onCopy,
  onHub,
  onClose,
}: Props) {
  const dwell = Math.round((stat?.dwellMs ?? 0) / 1000);
  const featured = !!booth.featured;

  return (
    <Sheet
      eyebrow={`${featured ? "REAL ACTIVATION" : "DEMO BOOTH"} · ${floorLabel.toUpperCase()}`}
      onClose={onClose}
      className={featured ? "booth-sheet featured" : "booth-sheet"}
    >
      {featured ? (
        <div className="hub-hero">
          <img
            src={`${import.meta.env.BASE_URL}${booth.image}`}
            alt="Solflare Breakpoint 2026 limited edition merch campaign"
          />
          <div className="hub-shade" aria-hidden="true" />
          <span className="hub-live">
            <span className="live-dot" />
            LIVE ACTIVATION
          </span>
          <span className={stamped ? "stamp-chip on" : "stamp-chip"}>
            {stamped ? <Icon name="check" size={13} /> : null}
            {stamped ? "STAMPED" : "NOT STAMPED"}
          </span>
          <div className="hub-hero-copy">
            <span className="booth-cat">{booth.category}</span>
            <h2>{booth.sponsor}</h2>
          </div>
          <span className="hub-credit">IMAGE: @SOLFLARE ON X</span>
        </div>
      ) : (
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
      )}

      <p className="booth-tagline">{booth.tagline}</p>

      {featured ? (
        <div className="hub-body">
          <div className="hub-steps">
            <div>
              <span>01</span>
              <div>
                <b>Sign in with X</b>
                <em>hub.solflare.com</em>
              </div>
            </div>
            <div>
              <span>02</span>
              <div>
                <b>Post tagging @solflare</b>
                <em>Stack points on the Hub</em>
              </div>
            </div>
            <div>
              <span>03</span>
              <div>
                <b>Claim tees, hoodies and more</b>
                <em>At the booth or shipped to you</em>
              </div>
            </div>
          </div>

          <div className="hub-note">
            <b>$150,000 merch activation.</b>
            <span>
              At Breakpoint? Collect at the Solflare booth. Everywhere else? Free shipping. Pick your
              tier by 18 November. First come, first served.
            </span>
          </div>

          <a
            className="btn primary hub-cta"
            href={booth.link}
            target="_blank"
            rel="noreferrer"
            onClick={onHub}
          >
            <Icon name="link" size={16} />
            Open the Community Hub
            <Icon name="arrow" size={16} />
          </a>

          <p className="micro-note">
            Unofficial demo. The Solflare Community Hub is a real Breakpoint 2026 activation, this
            booth is a mockup. Merch image credit: @solflare on X.
          </p>
        </div>
      ) : (
        <div className="offer-box" style={{ borderColor: `${booth.color}55` }}>
          <span className="eyebrow">AT THE BOOTH</span>
          <b>{booth.offer}</b>
          <p>
            A two minute demo, one wallet, no signup. In the real product this is where the sponsor
            captures a qualified remote lead.
          </p>
        </div>
      )}

      <div className="booth-stats">
        <div>
          <b>{stat?.opens ?? 0}</b>
          <span>opens by you</span>
        </div>
        <div>
          <b>{stat?.actions ?? 0}</b>
          <span>{featured ? "hub opens" : "demos tried"}</span>
        </div>
        <div>
          <b>{dwell}s</b>
          <span>dwell time</span>
        </div>
      </div>

      <div className="sheet-actions">
        {!featured && (
          <button className="btn primary" onClick={onTry} style={{ background: booth.color }}>
            <Icon name="spark" size={16} />
            Try the demo
          </button>
        )}
        <button className="btn ghost" onClick={onCopy}>
          <Icon name="copy" size={15} />
          Copy booth brief
        </button>
      </div>

      {!featured && (
        <p className="micro-note">
          Fictional demo sponsor. This booth, its offer and its metrics are illustrative. A stamp here
          counts toward the three, six and nine stamp quests.
        </p>
      )}
      <button className="btn subtle full" onClick={onClose}>
        Back to the floor
      </button>
    </Sheet>
  );
}
