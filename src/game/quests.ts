import type { FloorId } from "./types";

export type QuestKind = "stamps" | "zone" | "spot" | "trivia" | "secret" | "floors";

export type Quest = {
  id: string;
  title: string;
  detail: string;
  points: number;
  kind: QuestKind;
  count?: number;
  zoneId?: string;
  spotId?: string;
  floorId?: FloorId;
  tag: string;
};

export const STAMP_POINTS = 8;

export const QUESTS: Quest[] = [
  {
    id: "main-stage",
    title: "Open the room",
    detail: "Attend the session at the Main Stage on the ground floor.",
    points: 15,
    kind: "spot",
    spotId: "stage:main-stage",
    tag: "Ground floor",
  },
  {
    id: "cross-floor",
    title: "Up and over",
    detail: "Take the stairs and set foot on the first floor.",
    points: 20,
    kind: "floors",
    floorId: "first",
    tag: "First floor",
  },
  {
    id: "royal-exchange",
    title: "The exchange",
    detail: "Attend the panel at the Royal Exchange.",
    points: 20,
    kind: "spot",
    spotId: "stage:royal-exchange",
    tag: "First floor",
  },
  {
    id: "pitstop",
    title: "Refuel",
    detail: "Find The Pitstop on the ground floor.",
    points: 10,
    kind: "zone",
    zoneId: "pitstop",
    tag: "Ground floor",
  },
  {
    id: "builder-zone",
    title: "Meet the builders",
    detail: "Walk through the Builder Zone upstairs.",
    points: 15,
    kind: "zone",
    zoneId: "builder-zone",
    tag: "First floor",
  },
  {
    id: "market-square",
    title: "Market sweep",
    detail: "Step into Market Square and browse the row.",
    points: 15,
    kind: "zone",
    zoneId: "market-square",
    tag: "First floor",
  },
  {
    id: "borough-block",
    title: "The Borough Block",
    detail: "Find the food hall at the far end of the first floor.",
    points: 15,
    kind: "zone",
    zoneId: "borough-block",
    tag: "First floor",
  },
  {
    id: "stamps-3",
    title: "Three stamps",
    detail: "Scan in at any three sponsor booths.",
    points: 25,
    kind: "stamps",
    count: 3,
    tag: "Stamps",
  },
  {
    id: "stamps-6",
    title: "Six stamps",
    detail: "Scan in at six sponsor booths.",
    points: 40,
    kind: "stamps",
    count: 6,
    tag: "Stamps",
  },
  {
    id: "stamps-9",
    title: "Nine stamps",
    detail: "Scan in at nine sponsor booths.",
    points: 60,
    kind: "stamps",
    count: 9,
    tag: "Stamps",
  },
  {
    id: "archive",
    title: "Crack The Archive",
    detail: "Answer three questions at the archive terminal near the stairs.",
    points: 25,
    kind: "trivia",
    tag: "Secret",
  },
  {
    id: "validator",
    title: "Find the hidden validator",
    detail: "Something is humming in the south-east corner of the ground floor.",
    points: 50,
    kind: "secret",
    tag: "Secret",
  },
];

export const QUEST_MAP = new Map(QUESTS.map((q) => [q.id, q]));

export const MAX_POINTS =
  QUESTS.reduce((sum, q) => sum + q.points, 0) + 12 * STAMP_POINTS;

export type Tier = { name: string; min: number };

export const TIERS: Tier[] = [
  { name: "Lurker", min: 0 },
  { name: "Explorer", min: 60 },
  { name: "Stamp collector", min: 150 },
  { name: "Floor walker", min: 250 },
  { name: "Olympia legend", min: 350 },
];

export function tierFor(points: number): Tier {
  let tier = TIERS[0];
  for (const t of TIERS) if (points >= t.min) tier = t;
  return tier;
}

export const TRIVIA = [
  {
    q: "Which city is hosting Breakpoint 2026?",
    answers: ["Berlin", "London", "Lisbon"],
    correct: 1,
  },
  {
    q: "Which zone is on the first floor?",
    answers: ["The Pitstop", "Royal Exchange", "Sponsor Row"],
    correct: 1,
  },
  {
    q: "What is the venue called?",
    answers: ["Olympia", "The O2", "ExCeL"],
    correct: 0,
  },
];
