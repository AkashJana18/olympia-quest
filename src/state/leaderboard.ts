import { tierFor } from "../game/quests";
import type { PlayerState } from "./player";

type SeedRow = {
  name: string;
  points: number;
  floor: string;
  stamps: number;
};

const SEED: SeedRow[] = [
  { name: "gm_greg", points: 352, floor: "First floor", stamps: 12 },
  { name: "london.fog", points: 301, floor: "Ground floor", stamps: 11 },
  { name: "0xMira", points: 268, floor: "First floor", stamps: 10 },
  { name: "sunnyside", points: 240, floor: "Ground floor", stamps: 9 },
  { name: "builderbob", points: 198, floor: "First floor", stamps: 8 },
  { name: "solene", points: 171, floor: "Ground floor", stamps: 7 },
  { name: "remote_rhea", points: 144, floor: "First floor", stamps: 6 },
  { name: "anecdotal", points: 118, floor: "Ground floor", stamps: 5 },
  { name: "blockparty", points: 96, floor: "Ground floor", stamps: 4 },
  { name: "quietnode", points: 72, floor: "First floor", stamps: 3 },
];

export type BoardRow = {
  rank: number;
  name: string;
  points: number;
  tier: string;
  floor: string;
  stamps: number;
  me: boolean;
};

export function boardFor(player: PlayerState): BoardRow[] {
  const rows = SEED.map((s) => ({
    ...s,
    me: false,
    tier: tierFor(s.points).name,
  }));
  rows.push({
    name: player.name,
    points: player.points,
    tier: tierFor(player.points).name,
    floor: player.floor === "first" ? "First floor" : "Ground floor",
    stamps: player.stamps.length,
    me: true,
  });
  rows.sort((a, b) => b.points - a.points || a.name.localeCompare(b.name));
  return rows.map((r, i) => ({ ...r, rank: i + 1 }));
}
