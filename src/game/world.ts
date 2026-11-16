import type { Booth, Floor, FloorId, Prop, Spot } from "./types";

const booth = (
  id: string,
  sponsor: string,
  category: string,
  tagline: string,
  offer: string,
  color: string,
  x: number,
  y: number,
): Booth => ({ id, sponsor, category, tagline, offer, color, x, y, w: 200, h: 140 });

const plant = (id: string, x: number, y: number): Prop => ({ id, kind: "plant", x, y, w: 40, h: 40 });
const pillar = (id: string, x: number, y: number): Prop => ({ id, kind: "pillar", x, y, w: 40, h: 40 });
const table = (id: string, x: number, y: number): Prop => ({ id, kind: "table", x, y, w: 56, h: 56 });

export const GROUND: Floor = {
  id: "ground",
  name: "Ground Floor",
  subtitle: "Main Stage · Sponsor activations · The Pitstop",
  width: 2000,
  height: 1400,
  spawn: { x: 1000, y: 1170 },
  zones: [
    { id: "main-stage", name: "Main Stage", x: 600, y: 90, w: 800, h: 360, tone: "stage" },
    { id: "sponsor-left", name: "Sponsor Row · West", x: 120, y: 460, w: 520, h: 480, tone: "sponsor" },
    { id: "sponsor-right", name: "Sponsor Row · East", x: 1380, y: 460, w: 500, h: 480, tone: "sponsor" },
    { id: "pitstop", name: "The Pitstop", x: 140, y: 1010, w: 580, h: 340, tone: "food" },
    { id: "lounge", name: "The Lounge", x: 1280, y: 1010, w: 580, h: 340, tone: "lounge" },
    { id: "entry", name: "Entrance", x: 760, y: 1100, w: 480, h: 240, tone: "entry" },
  ],
  booths: [
    booth("lumen", "Lumen", "Private DeFi", "Shielded swaps with one signature.", "Private route builder", "#A78BFA", 170, 500),
    booth("northstar", "Northstar", "Infrastructure", "RPC that never blinks.", "Live latency board", "#5AA7FF", 410, 500),
    booth("sable", "Sable", "Privacy", "Prove it without showing it.", "ZK credential demo", "#FF6EC7", 170, 760),
    booth("tessera", "Tessera", "Payments", "Stablecoins at till speed.", "Tap-to-pay counter", "#14F195", 410, 760),
    booth("orbit", "Orbit", "Consumer", "Your wallet, on every app.", "One-tap onboarding", "#FFB347", 1430, 500),
    booth("meridian", "Meridian", "RWA", "London property, onchain.", "Fractional deed demo", "#2DD4BF", 1670, 500),
    booth("keystone", "Keystone", "Security", "Squads that sign safely.", "Multisig drill", "#FF7A70", 1430, 760),
    booth("halcyon", "Halcyon", "Gaming", "Playable worlds, real loot.", "Boss run", "#C084FC", 1670, 760),
  ],
  props: [
    plant("g-p1", 95, 95),
    plant("g-p2", 1865, 95),
    plant("g-p3", 95, 1300),
    plant("g-p4", 1865, 1300),
    plant("g-p5", 620, 430),
    plant("g-p6", 1340, 430),
    pillar("g-c1", 640, 970),
    pillar("g-c2", 1320, 970),
    plant("g-p7", 790, 540),
    plant("g-p8", 1210, 540),
    plant("g-p9", 790, 820),
    plant("g-p10", 1210, 820),
    { id: "g-bar", kind: "bar", x: 190, y: 1080, w: 480, h: 56, solid: true },
    table("g-t1", 250, 1190),
    table("g-t2", 410, 1190),
    table("g-t3", 250, 1270),
    table("g-t4", 410, 1270),
    { id: "g-sofa1", kind: "sofa", x: 1320, y: 1090, w: 240, h: 60, solid: true },
    { id: "g-sofa2", kind: "sofa", x: 1600, y: 1090, w: 210, h: 60, solid: true },
    { id: "g-sofa3", kind: "sofa", x: 1320, y: 1230, w: 240, h: 60, solid: true },
    { id: "g-sofa4", kind: "sofa", x: 1600, y: 1230, w: 210, h: 60, solid: true },
    { id: "g-coffee", kind: "table", x: 1460, y: 1170, w: 120, h: 60, solid: true },
  ],
  stages: [
    {
      id: "main-stage",
      room: "Main Stage",
      session: "The Token Supercycle",
      speaker: "Main Stage keynote",
      time: "Day 2 · 11:00",
      x: 660,
      y: 140,
      w: 680,
      h: 250,
      tone: "purple",
    },
  ],
  stairs: [
    {
      id: "ground-up",
      x: 900,
      y: 900,
      w: 200,
      h: 120,
      to: "first",
      spawn: { x: 800, y: 985 },
      label: "Up to Royal Exchange",
      direction: "up",
    },
  ],
  terminals: [
    {
      id: "archive",
      x: 1200,
      y: 920,
      w: 48,
      h: 56,
      title: "The Archive",
      subtitle: "A three-question detour",
    },
  ],
  secret: { id: "validator", x: 1848, y: 1310, label: "A validator, hiding in plain sight" },
};

export const FIRST: Floor = {
  id: "first",
  name: "First Floor",
  subtitle: "Royal Exchange · Builder Zone · Market Square · The Borough Block",
  width: 1600,
  height: 1100,
  spawn: { x: 800, y: 985 },
  zones: [
    { id: "royal-exchange", name: "Royal Exchange", x: 90, y: 90, w: 660, h: 380, tone: "stage" },
    { id: "builder-zone", name: "Builder Zone", x: 810, y: 90, w: 700, h: 380, tone: "build" },
    { id: "market-square", name: "Market Square", x: 90, y: 560, w: 720, h: 400, tone: "market" },
    { id: "borough-block", name: "The Borough Block", x: 880, y: 560, w: 630, h: 400, tone: "food" },
  ],
  booths: [
    booth("foundry", "Foundry", "Devtools", "Ship in one command.", "Scaffold sprint", "#FACC15", 140, 620),
    booth("aperture", "Aperture", "Data", "Every block, indexed.", "Query playground", "#38BDF8", 380, 620),
    booth("vaultline", "Vaultline", "Custody", "Keys, without the panic.", "Recovery demo", "#818CF8", 140, 820),
    booth("parallax", "Parallax", "Mobile", "Seedless, on your phone.", "Tap to try", "#FB7185", 380, 820),
  ],
  props: [
    plant("f-p1", 80, 70),
    plant("f-p2", 1480, 70),
    plant("f-p3", 80, 990),
    plant("f-p4", 1480, 990),
    pillar("f-c1", 830, 520),
    pillar("f-c2", 1470, 520),
    { id: "f-desk1", kind: "desk", x: 860, y: 190, w: 240, h: 70, solid: true },
    { id: "f-desk2", kind: "desk", x: 1140, y: 190, w: 240, h: 70, solid: true },
    { id: "f-desk3", kind: "desk", x: 860, y: 320, w: 240, h: 70, solid: true },
    { id: "f-desk4", kind: "desk", x: 1140, y: 320, w: 240, h: 70, solid: true },
    { id: "f-bar", kind: "bar", x: 920, y: 610, w: 540, h: 56, solid: true },
    table("f-t1", 980, 700),
    table("f-t2", 1160, 700),
    table("f-t3", 1340, 700),
    table("f-t4", 980, 820),
    table("f-t5", 1160, 820),
    table("f-t6", 1340, 820),
    { id: "f-bench", kind: "bench", x: 950, y: 930, w: 260, h: 36, solid: true },
  ],
  stages: [
    {
      id: "royal-exchange",
      room: "Royal Exchange",
      session: "Founders on the record",
      speaker: "Royal Exchange panel",
      time: "Day 2 · 14:30",
      x: 130,
      y: 130,
      w: 580,
      h: 260,
      tone: "green",
    },
  ],
  stairs: [
    {
      id: "first-down",
      x: 710,
      y: 1000,
      w: 180,
      h: 70,
      to: "ground",
      spawn: { x: 1000, y: 860 },
      label: "Down to Main Stage",
      direction: "down",
    },
  ],
  terminals: [],
};

export const FLOORS: Record<FloorId, Floor> = { ground: GROUND, first: FIRST };

export function getSpots(floor: Floor): Spot[] {
  const spots: Spot[] = [];

  for (const b of floor.booths) {
    spots.push({
      id: `booth:${b.id}`,
      kind: "booth",
      label: `Visit ${b.sponsor}`,
      hint: b.category,
      x: b.x + b.w / 2,
      y: b.y + b.h + 34,
      radius: 80,
      booth: b,
    });
  }

  for (const s of floor.stages) {
    spots.push({
      id: `stage:${s.id}`,
      kind: "stage",
      label: `Attend ${s.room}`,
      hint: s.session,
      x: s.x + s.w / 2,
      y: s.y + s.h + 64,
      radius: 130,
      stage: s,
    });
  }

  for (const s of floor.stairs) {
    spots.push({
      id: `stairs:${s.id}`,
      kind: "stairs",
      label: s.label,
      hint: s.direction === "up" ? "First floor" : "Ground floor",
      x: s.x + s.w / 2,
      y: s.y + s.h / 2,
      radius: 78,
      stair: s,
    });
  }

  for (const t of floor.terminals) {
    spots.push({
      id: `terminal:${t.id}`,
      kind: "terminal",
      label: t.title,
      hint: t.subtitle,
      x: t.x + t.w / 2,
      y: t.y + t.h / 2,
      radius: 76,
      terminal: t,
    });
  }

  if (floor.secret) {
    spots.push({
      id: `secret:${floor.secret.id}`,
      kind: "secret",
      label: "Inspect the glitch",
      hint: "Something is humming here",
      x: floor.secret.x,
      y: floor.secret.y,
      radius: 82,
      secret: floor.secret,
    });
  }

  return spots;
}

export function solidRects(floor: Floor) {
  const rects = floor.booths.map((b) => ({ x: b.x, y: b.y, w: b.w, h: b.h }));
  rects.push(...floor.stages.map((s) => ({ x: s.x, y: s.y, w: s.w, h: s.h })));
  for (const p of floor.props) {
    if (p.solid !== false) rects.push({ x: p.x, y: p.y, w: p.w, h: p.h });
  }
  for (const t of floor.terminals) rects.push({ x: t.x, y: t.y, w: t.w, h: t.h });
  return rects;
}

export function zoneAt(floor: Floor, x: number, y: number) {
  return floor.zones.find((z) => x >= z.x && x <= z.x + z.w && y >= z.y && y <= z.y + z.h) ?? null;
}

export const TOTAL_BOOTHS = GROUND.booths.length + FIRST.booths.length;
