import { useState } from "react";
import type { PlayerState } from "../state/player";
import { tierFor } from "../game/quests";
import { Sheet } from "./Sheet";
import { Icon } from "./icons";

type Props = {
  player: PlayerState | null;
  onClose: () => void;
  onReset: () => void;
};

export function AboutPanel({ player, onClose, onReset }: Props) {
  const [confirm, setConfirm] = useState(false);

  return (
    <Sheet eyebrow="ABOUT THIS BUILD" onClose={onClose} className="about-sheet">
      <h2>A remote floor for Breakpoint 2026</h2>
      <p className="sheet-lede">
        Breakpoint is in London, 15 to 17 November 2026. If you could not make it, this is a playable
        way to walk the venue, run the booths and leave with a receipt.
      </p>

      <div className="about-grid">
        <div>
          <span className="eyebrow">WHAT THIS IS</span>
          <p>
            An unofficial companion concept: two stylised floors of Olympia London, eleven fictional
            demo sponsors, a real Solflare Community Hub mockup, twelve quests, a leaderboard and a
            sponsor-facing report.
          </p>
        </div>
        <div>
          <span className="eyebrow">WHAT THIS IS NOT</span>
          <p>
            Not affiliated with Solana Foundation or Olympia London. No real sponsor paid for this.
            The venue is inspired by the public Breakpoint map, not a survey.
          </p>
        </div>
      </div>

      <h3>How to play</h3>
      <div className="control-grid">
        <div>
          <span className="control-key">WASD / arrows</span>
          <span>Move. Shift to sprint. Click the floor to walk there.</span>
        </div>
        <div>
          <span className="control-key">E / space</span>
          <span>Interact with the nearest booth, stage, stairs or terminal.</span>
        </div>
        <div>
          <span className="control-key">Mobile</span>
          <span>Left joystick to move, right button to interact. Tap to walk.</span>
        </div>
        <div>
          <span className="control-key">Stairs</span>
          <span>Walk onto the stairs and interact to change floor.</span>
        </div>
      </div>

      <h3>Receipts and wallets</h3>
      <p className="about-copy">
        Progress lives in <code>localStorage</code>. Nothing is sent. When you connect a Solana wallet
        (Phantom, Solflare or Backpack), a quest receipt can be signed with{" "}
        <code>signMessage</code>. That signature proves the receipt belongs to that address without a
        transaction, a fee or a network call.
      </p>

      <div className="danger-zone">
        <div>
          <b>Reset this run</b>
          <span>
            {player
              ? `${player.name} · ${player.points} pts · ${tierFor(player.points).name}`
              : "No run in progress yet."}
          </span>
        </div>
        {player &&
          (confirm ? (
            <div className="reset-confirm">
              <button className="btn ghost small" onClick={() => setConfirm(false)}>
                Cancel
              </button>
              <button className="btn danger small" onClick={onReset}>
                Clear progress
              </button>
            </div>
          ) : (
            <button className="btn ghost small" onClick={() => setConfirm(true)}>
              Reset
            </button>
          ))}
      </div>

      <div className="about-links">
        <a href="https://github.com/AkashJana18/olympia-quest" target="_blank" rel="noreferrer">
          <Icon name="link" size={14} /> Source on GitHub
        </a>
        <a href="https://solana.com/breakpoint" target="_blank" rel="noreferrer">
          <Icon name="link" size={14} /> Breakpoint 2026
        </a>
        <a href="https://www.olympia.co.uk/events/breakpoint" target="_blank" rel="noreferrer">
          <Icon name="link" size={14} /> Olympia London
        </a>
      </div>

      <p className="micro-note">
        Built with React, TypeScript and a hand-drawn canvas renderer. No backend, no tracking, no
        wallet gate. Demo sponsors are fictional.
      </p>
    </Sheet>
  );
}
