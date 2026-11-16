import type { FloorId } from "../game/types";
import { QUESTS, STAMP_POINTS, type Quest } from "../game/quests";

export type Receipt = {
  id: string;
  code: string;
  questId: string;
  title: string;
  points: number;
  at: number;
  signature?: string;
  signer?: string;
};

export type BoothStat = {
  opens: number;
  dwellMs: number;
  actions: number;
};

export type PlayerState = {
  version: 1;
  id: string;
  name: string;
  createdAt: number;
  points: number;
  completed: string[];
  stamps: string[];
  visitedZones: string[];
  visitedSpots: string[];
  visitedFloors: FloorId[];
  triviaDone: boolean;
  secretFound: boolean;
  receipts: Receipt[];
  stats: Record<string, BoothStat>;
  floor: FloorId;
};

export type PlayerEvent =
  | { type: "stamp"; boothId: string }
  | { type: "zone"; zoneId: string }
  | { type: "spot"; spotId: string }
  | { type: "trivia" }
  | { type: "secret" }
  | { type: "floor"; floorId: FloorId };

export type EventResult = {
  next: PlayerState;
  completed: Quest[];
  stamped: boolean;
};

const KEY = "olympia-quest:player:v1";

function uid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function shortCode() {
  return uid().replace(/-/g, "").slice(0, 10).toUpperCase();
}

export function emptyStats(): Record<string, BoothStat> {
  return {};
}

export function createPlayer(name: string): PlayerState {
  return {
    version: 1,
    id: uid(),
    name: name.trim().slice(0, 22) || "remote",
    createdAt: Date.now(),
    points: 0,
    completed: [],
    stamps: [],
    visitedZones: [],
    visitedSpots: [],
    visitedFloors: [],
    triviaDone: false,
    secretFound: false,
    receipts: [],
    stats: emptyStats(),
    floor: "ground",
  };
}

export function loadPlayer(): PlayerState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PlayerState;
    if (parsed?.version !== 1 || typeof parsed.id !== "string") return null;
    return {
      ...parsed,
      completed: parsed.completed ?? [],
      stamps: parsed.stamps ?? [],
      visitedZones: parsed.visitedZones ?? [],
      visitedSpots: parsed.visitedSpots ?? [],
      visitedFloors: parsed.visitedFloors ?? [],
      receipts: parsed.receipts ?? [],
      stats: parsed.stats ?? {},
      floor: parsed.floor === "first" ? "first" : "ground",
    };
  } catch {
    return null;
  }
}

export function savePlayer(player: PlayerState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(player));
  } catch {
    // Storage can be blocked in private modes; the session still works.
  }
}

export function clearPlayer() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

function questSatisfied(p: PlayerState, q: Quest): boolean {
  switch (q.kind) {
    case "stamps":
      return p.stamps.length >= (q.count ?? 0);
    case "zone":
      return !!q.zoneId && p.visitedZones.includes(q.zoneId);
    case "spot":
      return !!q.spotId && p.visitedSpots.includes(q.spotId);
    case "trivia":
      return p.triviaDone;
    case "secret":
      return p.secretFound;
    case "floors":
      return !!q.floorId && p.visitedFloors.includes(q.floorId);
    default:
      return false;
  }
}

function evaluate(p: PlayerState): { player: PlayerState; completed: Quest[] } {
  const done = new Set(p.completed);
  const newly: Quest[] = [];
  for (const q of QUESTS) {
    if (done.has(q.id)) continue;
    if (questSatisfied(p, q)) {
      done.add(q.id);
      newly.push(q);
    }
  }
  if (newly.length === 0) return { player: p, completed: [] };

  let points = p.points;
  const receipts = [...p.receipts];
  for (const q of newly) {
    points += q.points;
    receipts.unshift({
      id: uid(),
      code: shortCode(),
      questId: q.id,
      title: q.title,
      points: q.points,
      at: Date.now(),
    });
  }

  return {
    player: {
      ...p,
      points,
      completed: [...done],
      receipts: receipts.slice(0, 60),
    },
    completed: newly,
  };
}

export function applyEvent(p: PlayerState, e: PlayerEvent): EventResult {
  let next = p;
  let stamped = false;

  switch (e.type) {
    case "stamp": {
      if (!p.stamps.includes(e.boothId)) {
        next = { ...p, stamps: [...p.stamps, e.boothId], points: p.points + STAMP_POINTS };
        stamped = true;
      }
      break;
    }
    case "zone": {
      if (!p.visitedZones.includes(e.zoneId)) {
        next = { ...p, visitedZones: [...p.visitedZones, e.zoneId] };
      }
      break;
    }
    case "spot": {
      if (!p.visitedSpots.includes(e.spotId)) {
        next = { ...p, visitedSpots: [...p.visitedSpots, e.spotId] };
      }
      break;
    }
    case "trivia": {
      if (!p.triviaDone) next = { ...p, triviaDone: true };
      break;
    }
    case "secret": {
      if (!p.secretFound) next = { ...p, secretFound: true };
      break;
    }
    case "floor": {
      if (!p.visitedFloors.includes(e.floorId)) {
        next = { ...p, visitedFloors: [...p.visitedFloors, e.floorId], floor: e.floorId };
      } else if (p.floor !== e.floorId) {
        next = { ...p, floor: e.floorId };
      }
      break;
    }
    default:
      break;
  }

  const result = evaluate(next);
  return { next: result.player, completed: result.completed, stamped };
}

export function recordBoothOpen(p: PlayerState, boothId: string): PlayerState {
  const stat = p.stats[boothId] ?? { opens: 0, dwellMs: 0, actions: 0 };
  return { ...p, stats: { ...p.stats, [boothId]: { ...stat, opens: stat.opens + 1 } } };
}

export function recordBoothDwell(p: PlayerState, boothId: string, ms: number): PlayerState {
  if (ms <= 0) return p;
  const stat = p.stats[boothId] ?? { opens: 0, dwellMs: 0, actions: 0 };
  return {
    ...p,
    stats: { ...p.stats, [boothId]: { ...stat, dwellMs: stat.dwellMs + Math.min(ms, 10 * 60 * 1000) } },
  };
}

export function recordBoothAction(p: PlayerState, boothId: string): PlayerState {
  const stat = p.stats[boothId] ?? { opens: 0, dwellMs: 0, actions: 0 };
  return { ...p, stats: { ...p.stats, [boothId]: { ...stat, actions: stat.actions + 1 } } };
}

export function attachSignature(p: PlayerState, receiptId: string, signature: string, signer: string): PlayerState {
  return {
    ...p,
    receipts: p.receipts.map((r) => (r.id === receiptId ? { ...r, signature, signer } : r)),
  };
}

export function progressFor(p: PlayerState) {
  return { done: p.completed.length, total: QUESTS.length };
}
