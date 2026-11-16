import { useState } from "react";
import type { PlayerState } from "../state/player";
import { Icon, LogoMark } from "./icons";

type Props = {
  saved: PlayerState | null;
  onStart: (name: string) => void;
  onContinue: () => void;
  onShare: () => void;
  onAbout: () => void;
};

const TICKER = [
  "MAIN STAGE",
  "ROYAL EXCHANGE",
  "BUILDER ZONE",
  "MARKET SQUARE",
  "THE BOROUGH BLOCK",
  "THE PITSTOP",
  "OLYMPIA LONDON",
  "15 TO 17 NOV 2026",
];

export function TitleScreen({ saved, onStart, onContinue, onShare, onAbout }: Props) {
  const [name, setName] = useState("");

  const start = () => onStart(name.trim() || "remote");

  return (
    <div className="title">
      <div className="title-scrim" aria-hidden="true" />

      <header className="title-brand">
        <LogoMark size={34} />
        <div className="brand-copy">
          <b>OLYMPIA QUEST</b>
          <span>BP26 · REMOTE FLOOR</span>
        </div>
        <button className="icon-btn title-about" onClick={onAbout} aria-label="About this project">
          <Icon name="info" />
        </button>
      </header>

      <div className="title-body">
        <div className="eyebrow">
          <span className="live-dot" />
          UNOFFICIAL COMPANION · OLYMPIA LONDON
        </div>
        <h1>
          The halls
          <br />
          <span className="accent-word">are open.</span>
        </h1>
        <p className="lede">
          Breakpoint 2026 is live in London. If you are not in the room, this is the remote floor:
          two levels, twelve demo booths, twelve quests, and receipts you can sign with a Solana
          wallet.
        </p>

        <div className="title-stats">
          <div>
            <b>2</b>
            <span>floors</span>
          </div>
          <div>
            <b>12</b>
            <span>booths</span>
          </div>
          <div>
            <b>12</b>
            <span>quests</span>
          </div>
          <div>
            <b>0</b>
            <span>wallet required</span>
          </div>
        </div>

        <div className="enter-row">
          <label className="name-field">
            <span>Your name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") start();
              }}
              placeholder="remote"
              maxLength={22}
              autoComplete="off"
              spellCheck={false}
            />
          </label>
          <button className="btn primary enter-btn" onClick={start}>
            Enter the venue
            <Icon name="arrow" />
          </button>
        </div>

        {saved && (
          <button className="continue-row" onClick={onContinue}>
            <span className="continue-dot" />
            <span>
              Continue as <b>{saved.name}</b>
            </span>
            <span className="continue-meta">
              {saved.points} pts · {saved.stamps.length}/12 stamps
            </span>
            <Icon name="arrow" size={16} />
          </button>
        )}

        <div className="hints">
          <span>
            <kbd>W</kbd>
            <kbd>A</kbd>
            <kbd>S</kbd>
            <kbd>D</kbd> move
          </span>
          <span>
            <kbd>E</kbd> interact
          </span>
          <span className="hint-touch">
            <Icon name="map" size={14} /> tap to walk, joystick on mobile
          </span>
        </div>
      </div>

      <aside className="title-card">
        <div className="card-head">
          <span className="live-dot" />
          <span>LIVE FROM OLYMPIA</span>
          <span className="card-time">DAY 2</span>
        </div>
        <div className="card-floors">
          <div>
            <span className="floor-tag">GF</span>
            <div>
              <b>Main Stage</b>
              <span>Sponsor activations · The Pitstop</span>
            </div>
          </div>
          <div>
            <span className="floor-tag">1F</span>
            <div>
              <b>Royal Exchange</b>
              <span>Builder Zone · Market Square · Borough Block</span>
            </div>
          </div>
        </div>
        <div className="card-foot">
          <span>421 pts clears the board</span>
          <button className="text-btn" onClick={onShare}>
            Share <Icon name="share" size={14} />
          </button>
        </div>
      </aside>

      <div className="ticker" aria-hidden="true">
        <div className="ticker-track">
          {[0, 1].map((group) => (
            <div className="ticker-group" key={group}>
              {TICKER.map((t) => (
                <span key={`${group}-${t}`}>{t}</span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <p className="title-disclaimer">
        Unofficial fan project. Not affiliated with Solana Foundation or Olympia London. Sponsor
        booths are fictional demos.
      </p>
    </div>
  );
}
