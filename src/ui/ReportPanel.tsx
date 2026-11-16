import { SAMPLE, boothRows, sessionTotals, toCsv } from "../state/report";
import type { PlayerState } from "../state/player";
import { Sheet } from "./Sheet";
import { Icon } from "./icons";

type Props = {
  player: PlayerState;
  onClose: () => void;
};

const FUNNEL = [
  { label: "Remote explorers", value: SAMPLE.explorers },
  { label: "Booth visitors", value: SAMPLE.boothVisitors },
  { label: "Stamps collected", value: SAMPLE.stamps },
  { label: "Demos tried", value: SAMPLE.demos },
  { label: "Wallet-signed receipts", value: SAMPLE.signed },
];

function nf(n: number) {
  return n.toLocaleString("en-GB");
}

export function ReportPanel({ player, onClose }: Props) {
  const rows = boothRows(player);
  const session = sessionTotals(player);
  const maxOpens = Math.max(...rows.map((r) => r.sampleOpens), 1);

  const exportCsv = () => {
    const blob = new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "olympia-quest-sponsor-report.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Sheet eyebrow="SPONSOR REPORT" onClose={onClose} className="report-sheet">
      <h2>The number a sponsor renews on</h2>
      <p className="sheet-lede">
        A booth that cannot report remote engagement is a poster. This is the dashboard that turns a
        quest into a lead. Values below are labelled sample data.
      </p>

      <div className="report-grid">
        <div className="report-card">
          <span>Remote explorers</span>
          <b>{nf(SAMPLE.explorers)}</b>
          <em>sample event</em>
        </div>
        <div className="report-card">
          <span>Booth visitors</span>
          <b>{nf(SAMPLE.boothVisitors)}</b>
          <em>{Math.round((SAMPLE.boothVisitors / SAMPLE.explorers) * 100)}% of explorers</em>
        </div>
        <div className="report-card">
          <span>Demo actions</span>
          <b>{nf(SAMPLE.demos)}</b>
          <em>qualified leads</em>
        </div>
        <div className="report-card accent">
          <span>Signed receipts</span>
          <b>{nf(SAMPLE.signed)}</b>
          <em>wallet-proven</em>
        </div>
      </div>

      <div className="session-strip">
        <span className="eyebrow">YOUR SESSION</span>
        <div>
          <b>{session.opens}</b> opens
          <b>{session.actions}</b> demo actions
          <b>{session.stamps}</b> stamps
          <b>{session.signed}</b> signed
        </div>
      </div>

      <div className="funnel">
        <div className="funnel-head">
          <span>Funnel</span>
          <span>sample</span>
        </div>
        {FUNNEL.map((f) => (
          <div className="funnel-row" key={f.label}>
            <span className="funnel-label">{f.label}</span>
            <div className="funnel-bar">
              <span style={{ width: `${Math.round((f.value / SAMPLE.explorers) * 100)}%` }} />
            </div>
            <b>{nf(f.value)}</b>
            <em>{Math.round((f.value / SAMPLE.explorers) * 100)}%</em>
          </div>
        ))}
      </div>

      <div className="report-table">
        <div className="report-row head">
          <span>Booth</span>
          <span>Opens</span>
          <span className="col-dwell">Dwell</span>
          <span>Demos</span>
          <span>You</span>
        </div>
        {rows.map((r) => (
          <div className="report-row" key={r.booth.id}>
            <span className="report-booth">
              <i style={{ background: r.booth.color }} />
              <span>
                <b>{r.booth.sponsor}</b>
                <em>{r.floor} floor</em>
              </span>
            </span>
            <span className="report-num">
              <b>{r.sampleOpens}</b>
              <span className="mini-bar">
                <i style={{ width: `${Math.round((r.sampleOpens / maxOpens) * 100)}%`, background: r.booth.color }} />
              </span>
            </span>
            <span className="col-dwell report-num">
              <b>{r.sampleDwell}s</b>
              <em>avg</em>
            </span>
            <span className="report-num">
              <b>{r.sampleActions}</b>
              <em>leads</em>
            </span>
            <span className={r.stamped ? "report-you stamped" : "report-you"}>
              {r.stamped ? <Icon name="check" size={14} /> : "-"}
              {r.sessionOpens > 0 && <em>{r.sessionOpens} open</em>}
            </span>
          </div>
        ))}
      </div>

      <div className="sheet-actions">
        <button className="btn primary" onClick={exportCsv}>
          <Icon name="report" size={16} />
          Export booth CSV
        </button>
        <button className="btn ghost" onClick={onClose}>
          Back to the floor
        </button>
      </div>

      <p className="micro-note">
        Sample values shown for the pitch. Your session column is real and stored in this browser.
        No analytics leave the page.
      </p>
    </Sheet>
  );
}
