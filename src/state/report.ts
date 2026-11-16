import { FLOORS } from "../game/world";
import type { Booth } from "../game/types";
import type { PlayerState } from "./player";

type Seed = { opens: number; dwellSec: number; actions: number };

const SEED: Record<string, Seed> = {
  lumen: { opens: 142, dwellSec: 96, actions: 48 },
  northstar: { opens: 118, dwellSec: 74, actions: 33 },
  sable: { opens: 96, dwellSec: 88, actions: 29 },
  tessera: { opens: 164, dwellSec: 62, actions: 57 },
  orbit: { opens: 132, dwellSec: 70, actions: 41 },
  meridian: { opens: 88, dwellSec: 110, actions: 22 },
  keystone: { opens: 76, dwellSec: 84, actions: 18 },
  halcyon: { opens: 154, dwellSec: 128, actions: 63 },
  foundry: { opens: 102, dwellSec: 92, actions: 36 },
  aperture: { opens: 84, dwellSec: 66, actions: 24 },
  vaultline: { opens: 68, dwellSec: 78, actions: 16 },
  parallax: { opens: 122, dwellSec: 58, actions: 39 },
};

export const SAMPLE = {
  explorers: 1240,
  boothVisitors: 968,
  stamps: 611,
  demos: 274,
  signed: 138,
};

export type BoothRow = {
  booth: Booth;
  floor: "Ground" | "First";
  sampleOpens: number;
  sampleDwell: number;
  sampleActions: number;
  sessionOpens: number;
  sessionDwell: number;
  sessionActions: number;
  stamped: boolean;
};

const ALL: Array<{ booth: Booth; floor: "Ground" | "First" }> = [
  ...FLOORS.ground.booths.map((booth) => ({ booth, floor: "Ground" as const })),
  ...FLOORS.first.booths.map((booth) => ({ booth, floor: "First" as const })),
];

export function boothRows(player: PlayerState): BoothRow[] {
  return ALL.map(({ booth, floor }) => {
    const seed = SEED[booth.id] ?? { opens: 60, dwellSec: 70, actions: 14 };
    const stat = player.stats[booth.id];
    return {
      booth,
      floor,
      sampleOpens: seed.opens,
      sampleDwell: seed.dwellSec,
      sampleActions: seed.actions,
      sessionOpens: stat?.opens ?? 0,
      sessionDwell: Math.round((stat?.dwellMs ?? 0) / 1000),
      sessionActions: stat?.actions ?? 0,
      stamped: player.stamps.includes(booth.id),
    };
  });
}

export function sessionTotals(player: PlayerState) {
  const rows = boothRows(player);
  return {
    opens: rows.reduce((n, r) => n + r.sessionOpens, 0),
    actions: rows.reduce((n, r) => n + r.sessionActions, 0),
    dwell: rows.reduce((n, r) => n + r.sessionDwell, 0),
    stamps: player.stamps.length,
    signed: player.receipts.filter((r) => r.signature).length,
  };
}

export function toCsv(rows: BoothRow[]): string {
  const head = [
    "sponsor",
    "category",
    "floor",
    "sample_opens",
    "sample_avg_dwell_sec",
    "sample_demo_actions",
    "session_opens",
    "session_dwell_sec",
    "session_demo_actions",
    "stamped",
  ];
  const body = rows.map((r) =>
    [
      r.booth.sponsor,
      r.booth.category,
      r.floor,
      r.sampleOpens,
      r.sampleDwell,
      r.sampleActions,
      r.sessionOpens,
      r.sessionDwell,
      r.sessionActions,
      r.stamped ? "yes" : "no",
    ].join(","),
  );
  return [head.join(","), ...body].join("\n");
}
