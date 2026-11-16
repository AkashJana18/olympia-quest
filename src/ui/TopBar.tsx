import type { FloorId } from "../game/types";
import { tierFor } from "../game/quests";
import type { PlayerState } from "../state/player";
import { shortAddress } from "../state/wallet";
import { Icon, LogoMark } from "./icons";

type PanelTarget = "quests" | "board" | "report" | "about" | "menu";

type Props = {
  player: PlayerState;
  floor: FloorId;
  wallet: { name: string; address: string } | null;
  onOpen: (panel: PanelTarget) => void;
  onShare: () => void;
  onConnect: () => void;
};

export function TopBar({ player, floor, wallet, onOpen, onShare, onConnect }: Props) {
  const tier = tierFor(player.points);
  return (
    <header className="topbar">
      <div className="brand">
        <LogoMark size={28} />
        <div className="brand-copy">
          <b>OLYMPIA QUEST</b>
          <span>BP26 · REMOTE</span>
        </div>
      </div>

      <div className="topbar-mid">
        <span className="floor-pill">
          <Icon name="floor" size={14} />
          {floor === "ground" ? "Ground floor" : "First floor"}
        </span>
        <span className="live-pill">
          <span className="live-dot" />
          London · Day 2
        </span>
      </div>

      <div className="topbar-actions">
        <div className="points-pill">
          <Icon name="spark" size={14} />
          <b>{player.points}</b>
          <span>pts</span>
          <em>{tier.name}</em>
        </div>

        <nav className="topnav">
          <button className="nav-btn" onClick={() => onOpen("quests")} title="Quests and receipts">
            <Icon name="quest" size={16} />
            <span>Quests</span>
          </button>
          <button className="nav-btn" onClick={() => onOpen("board")} title="Leaderboard">
            <Icon name="board" size={16} />
            <span>Board</span>
          </button>
          <button className="nav-btn" onClick={() => onOpen("report")} title="Sponsor report">
            <Icon name="report" size={16} />
            <span>Report</span>
          </button>
        </nav>

        <button className={wallet ? "wallet-btn connected" : "wallet-btn"} onClick={onConnect}>
          <Icon name="wallet" size={15} />
          <span>{wallet ? shortAddress(wallet.address) : "Connect"}</span>
        </button>

        <button className="icon-btn share-btn" onClick={onShare} aria-label="Share this game">
          <Icon name="share" size={17} />
        </button>
        <button
          className="icon-btn about-btn"
          onClick={() => onOpen("about")}
          aria-label="About and controls"
        >
          <Icon name="info" size={17} />
        </button>
        <button
          className="icon-btn menu-btn"
          onClick={() => onOpen("menu")}
          aria-label="Open menu"
        >
          <Icon name="menu" size={19} />
        </button>
      </div>
    </header>
  );
}
