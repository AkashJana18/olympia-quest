import type { Booth, Floor, Prop, Spot, Stage, Vec } from "./types";
import { getSpots } from "./world";

type NpcLike = {
  x: number;
  y: number;
  color: string;
  phase: number;
};

export type FrameOptions = {
  floor: Floor;
  player: Vec;
  playerName: string;
  facing: number;
  walkPhase: number;
  moving: boolean;
  cam: Vec;
  zoom: number;
  view: { w: number; h: number };
  time: number;
  nearbyId: string | null;
  visited: Set<string>;
  crowd: NpcLike[];
  mode: "attract" | "play";
  reducedMotion: boolean;
  paused: boolean;
};

const TONE: Record<string, string> = {
  stage: "#9945FF",
  sponsor: "#5AA7FF",
  food: "#FFB347",
  lounge: "#FF6EC7",
  market: "#14F195",
  build: "#38BDF8",
  entry: "#E6E6F0",
};

const textureCache = new Map<string, HTMLCanvasElement>();

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function hexA(hex: string, alpha: number) {
  const v = hex.replace("#", "");
  const n = parseInt(v, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

function tracking(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  spacing: number,
) {
  let cx = x;
  for (const ch of text) {
    ctx.fillText(ch, cx, y);
    cx += ctx.measureText(ch).width + spacing;
  }
}

function buildBase(floor: Floor): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = floor.width;
  c.height = floor.height;
  const ctx = c.getContext("2d");
  if (!ctx) return c;

  ctx.fillStyle = "#0A0A12";
  ctx.fillRect(0, 0, floor.width, floor.height);

  const glow = ctx.createRadialGradient(
    floor.width / 2,
    floor.height * 0.4,
    80,
    floor.width / 2,
    floor.height * 0.4,
    floor.width * 0.6,
  );
  glow.addColorStop(0, "rgba(153,69,255,0.075)");
  glow.addColorStop(0.55, "rgba(20,241,149,0.018)");
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, floor.width, floor.height);

  ctx.strokeStyle = "rgba(255,255,255,0.028)";
  ctx.lineWidth = 1;
  for (let x = 80; x < floor.width; x += 80) {
    ctx.beginPath();
    ctx.moveTo(x, 40);
    ctx.lineTo(x, floor.height - 40);
    ctx.stroke();
  }
  for (let y = 80; y < floor.height; y += 80) {
    ctx.beginPath();
    ctx.moveTo(40, y);
    ctx.lineTo(floor.width - 40, y);
    ctx.stroke();
  }

  for (const z of floor.zones) {
    const tone = TONE[z.tone] ?? "#ffffff";
    ctx.fillStyle = hexA(tone, 0.055);
    rr(ctx, z.x, z.y, z.w, z.h, 20);
    ctx.fill();
    ctx.strokeStyle = hexA(tone, 0.16);
    ctx.lineWidth = 1;
    ctx.setLineDash([7, 9]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  if (floor.id === "ground") {
    const cx = floor.width / 2;
    const cy = 690;
    ctx.save();
    ctx.translate(cx, cy);
    const halo = ctx.createRadialGradient(0, 0, 0, 0, 0, 230);
    halo.addColorStop(0, "rgba(153,69,255,0.12)");
    halo.addColorStop(0.6, "rgba(153,69,255,0.04)");
    halo.addColorStop(1, "rgba(153,69,255,0)");
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(0, 0, 230, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(255,255,255,0.055)";
    ctx.lineWidth = 1;
    for (const r of [86, 140, 196]) {
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.strokeStyle = "rgba(20,241,149,0.16)";
    ctx.setLineDash([8, 12]);
    ctx.beginPath();
    ctx.arc(0, 0, 168, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.beginPath();
    ctx.moveTo(0, -46);
    ctx.lineTo(40, 0);
    ctx.lineTo(0, 46);
    ctx.lineTo(-40, 0);
    ctx.closePath();
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(255,255,255,0.13)";
    ctx.font = '600 22px "Space Grotesk Variable", system-ui, sans-serif';
    ctx.fillText("BP26", 0, 8);
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.font = '500 8px "JetBrains Mono Variable", ui-monospace, monospace';
    ctx.fillText("LONDON · REMOTE FLOOR", 0, 24);
    ctx.restore();
  }

  ctx.strokeStyle = "rgba(255,255,255,0.055)";
  ctx.lineWidth = 2;
  ctx.setLineDash([16, 22]);
  ctx.beginPath();
  ctx.moveTo(1000, 1140);
  ctx.lineTo(1000, 860);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(660, 720);
  ctx.lineTo(1340, 720);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = "#14141E";
  ctx.fillRect(0, 0, floor.width, 40);
  ctx.fillRect(0, 0, 40, floor.height);
  ctx.fillRect(0, floor.height - 40, floor.width, 40);
  ctx.fillRect(floor.width - 40, 0, 40, floor.height);

  ctx.strokeStyle = "#2C2C40";
  ctx.lineWidth = 2;
  ctx.strokeRect(41, 41, floor.width - 82, floor.height - 82);
  ctx.strokeStyle = "rgba(255,255,255,0.05)";
  ctx.lineWidth = 1;
  ctx.strokeRect(46, 46, floor.width - 92, floor.height - 92);

  for (let x = 120; x < floor.width - 60; x += 140) {
    ctx.fillStyle = "rgba(255,255,255,0.055)";
    ctx.fillRect(x, 0, 26, 4);
    ctx.fillRect(x, floor.height - 4, 26, 4);
  }
  for (let y = 120; y < floor.height - 60; y += 140) {
    ctx.fillStyle = "rgba(255,255,255,0.055)";
    ctx.fillRect(0, y, 4, 26);
    ctx.fillRect(floor.width - 4, y, 4, 26);
  }

  const doorW = 220;
  const doorX = floor.width / 2 - doorW / 2;
  const doorY = floor.height - 46;
  const doorGrad = ctx.createLinearGradient(doorX, 0, doorX + doorW, 0);
  doorGrad.addColorStop(0, "rgba(20,241,149,0)");
  doorGrad.addColorStop(0.5, "rgba(20,241,149,0.55)");
  doorGrad.addColorStop(1, "rgba(20,241,149,0)");
  ctx.fillStyle = doorGrad;
  ctx.fillRect(doorX, doorY, doorW, 5);

  if (floor.id === "ground") {
    ctx.fillStyle = "rgba(255,255,255,0.02)";
    rr(ctx, 800, 1108, 400, 96, 16);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    ctx.stroke();
  }

  return c;
}

function baseFor(floor: Floor) {
  let tex = textureCache.get(floor.id);
  if (!tex) {
    tex = buildBase(floor);
    textureCache.set(floor.id, tex);
  }
  return tex;
}

function drawBooth(ctx: CanvasRenderingContext2D, b: Booth, visited: boolean, near: boolean) {
  const { x, y, w, h, color } = b;

  ctx.fillStyle = "rgba(0,0,0,0.38)";
  rr(ctx, x + 10, y + 10, w - 20, h + 8, 10);
  ctx.fill();

  ctx.fillStyle = "#11111B";
  rr(ctx, x, y - 26, w, h + 26, 10);
  ctx.fill();
  ctx.strokeStyle = near ? color : "#2B2B3D";
  ctx.lineWidth = near ? 2 : 1;
  ctx.stroke();

  const canopy = ctx.createLinearGradient(x, y - 24, x + w, y - 24);
  canopy.addColorStop(0, hexA(color, 0.65));
  canopy.addColorStop(0.5, color);
  canopy.addColorStop(1, hexA(color, 0.65));
  ctx.fillStyle = canopy;
  rr(ctx, x + 7, y - 22, w - 14, 15, 3);
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.fillRect(x + 14, y - 8, w - 28, 1);

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#F4F4FB";
  ctx.font = '600 15px "Space Grotesk Variable", system-ui, sans-serif';
  ctx.fillText(b.sponsor, x + w / 2, y + 24);

  ctx.fillStyle = "rgba(180,184,204,0.72)";
  ctx.font = '500 8.5px "JetBrains Mono Variable", ui-monospace, monospace';
  ctx.fillText(b.category.toUpperCase(), x + w / 2, y + 40);

  const hostX = x + 38;
  const hostY = y + h - 64;
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.beginPath();
  ctx.ellipse(hostX, hostY + 19, 12, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = hexA(color, 0.85);
  ctx.beginPath();
  ctx.roundRect(hostX - 7, hostY - 1, 14, 21, 6);
  ctx.fill();
  ctx.fillStyle = "#D9B08C";
  ctx.beginPath();
  ctx.arc(hostX, hostY - 8, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#1B1B28";
  rr(ctx, x + 12, y + h - 46, w - 24, 38, 6);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = hexA(color, 0.16);
  rr(ctx, x + 24, y + h - 38, 52, 22, 3);
  ctx.fill();
  ctx.strokeStyle = hexA(color, 0.45);
  ctx.stroke();

  ctx.fillStyle = hexA(color, 0.9);
  ctx.font = '600 7px "JetBrains Mono Variable", ui-monospace, monospace';
  ctx.fillText("DEMO", x + 50, y + h - 23);

  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.fillRect(x + 86, y + h - 32, w - 110, 3);
  ctx.fillRect(x + 86, y + h - 24, w - 130, 3);
  ctx.fillRect(x + 86, y + h - 16, w - 116, 3);

  if (visited) {
    ctx.fillStyle = "#14F195";
    ctx.beginPath();
    ctx.arc(x + w - 15, y - 12, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#04120C";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x + w - 19, y - 12);
    ctx.lineTo(x + w - 16, y - 9);
    ctx.lineTo(x + w - 11, y - 16);
    ctx.stroke();
    ctx.lineCap = "butt";
  }

  if (near) {
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = 22;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    rr(ctx, x + 1, y - 25, w - 2, h + 24, 9);
    ctx.stroke();
    ctx.restore();
  }
}

function drawStage(ctx: CanvasRenderingContext2D, s: Stage, time: number) {
  const tone = s.tone === "purple" ? "#9945FF" : "#14F195";
  const { x, y, w, h } = s;

  ctx.fillStyle = "rgba(0,0,0,0.45)";
  rr(ctx, x + 8, y + 12, w, h, 16);
  ctx.fill();

  const deck = ctx.createLinearGradient(x, y, x, y + h);
  deck.addColorStop(0, "#191527");
  deck.addColorStop(1, "#0C0C14");
  ctx.fillStyle = deck;
  rr(ctx, x, y, w, h, 16);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.1)";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = hexA(tone, 0.65);
  ctx.fillRect(x + 14, y + h - 8, w - 28, 4);

  const sx = x + 42;
  const sy = y + 26;
  const sw = w - 84;
  const sh = h - 78;

  const screen = ctx.createLinearGradient(sx, sy, sx, sy + sh);
  screen.addColorStop(0, "#07070C");
  screen.addColorStop(1, hexA(tone, 0.14));
  ctx.fillStyle = screen;
  rr(ctx, sx, sy, sw, sh, 10);
  ctx.fill();
  ctx.strokeStyle = hexA(tone, 0.55);
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.save();
  rr(ctx, sx + 2, sy + 2, sw - 4, sh - 4, 9);
  ctx.clip();

  for (let i = 0; i < 16; i += 1) {
    const bh = 14 + (Math.sin(time * 1.7 + i * 0.7) * 0.5 + 0.5) * (sh * 0.34);
    ctx.fillStyle = hexA(tone, 0.1 + (i % 3) * 0.03);
    ctx.fillRect(sx + 18 + i * ((sw - 36) / 16), sy + sh - bh - 12, (sw - 40) / 24, bh);
  }

  const scan = sy + ((time * 34) % (sh + 40)) - 20;
  ctx.fillStyle = "rgba(255,255,255,0.045)";
  ctx.fillRect(sx, scan, sw, 18);
  ctx.restore();

  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  rr(ctx, sx + 16, sy + 16, 54, 20, 10);
  ctx.fill();
  ctx.fillStyle = "#14F195";
  ctx.beginPath();
  ctx.arc(sx + 28, sy + 26, 3.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#CFFFE9";
  ctx.font = '600 8px "JetBrains Mono Variable", ui-monospace, monospace';
  tracking(ctx, "LIVE", sx + 37, sy + 26, 1.4);

  ctx.textAlign = "left";
  ctx.fillStyle = "#FFFFFF";
  ctx.font = '600 18px "Space Grotesk Variable", system-ui, sans-serif';
  ctx.fillText(s.session, sx + 18, sy + sh * 0.52);
  ctx.fillStyle = "rgba(215,218,235,0.68)";
  ctx.font = '500 10px "JetBrains Mono Variable", ui-monospace, monospace';
  ctx.fillText(`${s.speaker}  ·  ${s.time}`, sx + 18, sy + sh * 0.52 + 22);

  ctx.textAlign = "center";
  ctx.fillStyle = hexA(tone, 0.9);
  ctx.font = '600 9px "JetBrains Mono Variable", ui-monospace, monospace';
  tracking(ctx, s.room.toUpperCase(), x + w / 2, y + h - 18, 3);

  const speakerX = x + w / 2;
  const speakerY = y + h - 6;
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.beginPath();
  ctx.ellipse(speakerX, speakerY + 2, 16, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#252036";
  rr(ctx, speakerX - 9, speakerY - 22, 18, 22, 8);
  ctx.fill();
  ctx.fillStyle = "#E8C39E";
  ctx.beginPath();
  ctx.arc(speakerX, speakerY - 28, 6, 0, Math.PI * 2);
  ctx.fill();
}

function drawProp(ctx: CanvasRenderingContext2D, p: Prop, time: number) {
  const { x, y, w, h } = p;
  if (p.kind === "plant") {
    const sway = Math.sin(time * 0.9 + x * 0.02) * 2;
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h - 3, 18, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#242436";
    rr(ctx, x + 8, y + h - 18, w - 16, 16, 4);
    ctx.fill();
    ctx.fillStyle = "#1F6B4A";
    for (let i = 0; i < 5; i += 1) {
      const a = (i / 5) * Math.PI * 2;
      ctx.beginPath();
      ctx.ellipse(
        x + w / 2 + Math.cos(a) * 8 + sway,
        y + h - 28 + Math.sin(a) * 7,
        7,
        11,
        a,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    ctx.fillStyle = "#2FA873";
    ctx.beginPath();
    ctx.ellipse(x + w / 2 + sway, y + h - 32, 8, 12, 0.2, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  if (p.kind === "pillar") {
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h - 2, 22, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    const g = ctx.createLinearGradient(x, y, x + w, y);
    g.addColorStop(0, "#232332");
    g.addColorStop(0.5, "#34344A");
    g.addColorStop(1, "#1A1A26");
    ctx.fillStyle = g;
    rr(ctx, x + 6, y + 4, w - 12, h - 8, 8);
    ctx.fill();
    ctx.fillStyle = "#3E3E58";
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + 6, (w - 12) / 2, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(153,69,255,0.35)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x + 12, y + 14);
    ctx.lineTo(x + 12, y + h - 12);
    ctx.stroke();
    return;
  }

  if (p.kind === "sofa" || p.kind === "bench") {
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    rr(ctx, x + 6, y + 8, w, h, 8);
    ctx.fill();
    ctx.fillStyle = p.kind === "sofa" ? "#2A2438" : "#252535";
    rr(ctx, x, y, w, h, 8);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.stroke();
    const seats = Math.max(2, Math.floor(w / 70));
    for (let i = 0; i < seats; i += 1) {
      ctx.fillStyle = i % 2 === 0 ? "#332B46" : "#2E273F";
      rr(ctx, x + 8 + i * ((w - 16) / seats), y + 7, (w - 16) / seats - 6, h - 14, 5);
      ctx.fill();
    }
    return;
  }

  if (p.kind === "table") {
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h - 3, w / 2, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#2B2B3D";
    rr(ctx, x + 6, y + 10, w - 12, h - 14, 8);
    ctx.fill();
    ctx.fillStyle = "#3A3A52";
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + 12, (w - 12) / 2, h / 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.14)";
    ctx.beginPath();
    ctx.arc(x + w / 2 - 8, y + 10, 4, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  if (p.kind === "bar") {
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    rr(ctx, x + 4, y + 9, w, h, 6);
    ctx.fill();
    const g = ctx.createLinearGradient(x, y, x, y + h);
    g.addColorStop(0, "#3A2E22");
    g.addColorStop(1, "#1C1712");
    ctx.fillStyle = g;
    rr(ctx, x, y, w, h, 6);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,179,71,0.35)";
    ctx.stroke();
    for (let i = 0; i < Math.floor(w / 26); i += 1) {
      const bx = x + 12 + i * 24;
      const colors = ["#FFB347", "#14F195", "#9945FF", "#FF6EC7", "#5AA7FF"];
      ctx.fillStyle = colors[i % colors.length];
      ctx.globalAlpha = 0.75;
      ctx.fillRect(bx, y - 10 + (i % 3) * 2, 5, 14);
      ctx.globalAlpha = 1;
    }
    return;
  }

  if (p.kind === "desk") {
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    rr(ctx, x + 4, y + 8, w, h, 8);
    ctx.fill();
    ctx.fillStyle = "#242434";
    rr(ctx, x, y, w, h, 8);
    ctx.fill();
    ctx.strokeStyle = "rgba(56,189,248,0.25)";
    ctx.stroke();
    for (let i = 0; i < Math.floor(w / 80); i += 1) {
      const dx = x + 18 + i * 76;
      ctx.fillStyle = "#0E0E16";
      rr(ctx, dx, y + 12, 38, 24, 3);
      ctx.fill();
      ctx.fillStyle = "rgba(56,189,248,0.35)";
      ctx.fillRect(dx + 3, y + 15, 32, 18);
    }
  }
}

function drawStairs(ctx: CanvasRenderingContext2D, stair: Floor["stairs"][number], time: number) {
  const { x, y, w, h } = stair;
  const tone = stair.direction === "up" ? "#14F195" : "#5AA7FF";
  ctx.fillStyle = "rgba(0,0,0,0.4)";
  rr(ctx, x + 4, y + 6, w, h, 8);
  ctx.fill();
  ctx.fillStyle = "#15151F";
  rr(ctx, x, y, w, h, 8);
  ctx.fill();
  ctx.strokeStyle = hexA(tone, 0.45);
  ctx.lineWidth = 1.5;
  ctx.stroke();

  const steps = 6;
  for (let i = 0; i < steps; i += 1) {
    const t = i / steps;
    ctx.fillStyle = hexA(tone, 0.05 + t * 0.12);
    ctx.fillRect(x + 10, y + 8 + t * (h - 18), w - 20, 5);
  }

  const pulse = 0.55 + Math.sin(time * 2.2) * 0.2;
  ctx.fillStyle = hexA(tone, pulse);
  ctx.beginPath();
  const cx = x + w / 2;
  if (stair.direction === "up") {
    ctx.moveTo(cx, y + h / 2 - 10);
    ctx.lineTo(cx + 8, y + h / 2 + 2);
    ctx.lineTo(cx - 8, y + h / 2 + 2);
  } else {
    ctx.moveTo(cx, y + h / 2 + 10);
    ctx.lineTo(cx + 8, y + h / 2 - 2);
    ctx.lineTo(cx - 8, y + h / 2 - 2);
  }
  ctx.closePath();
  ctx.fill();

  ctx.textAlign = "center";
  ctx.fillStyle = hexA(tone, 0.9);
  ctx.font = '600 8px "JetBrains Mono Variable", ui-monospace, monospace';
  ctx.fillText(stair.direction === "up" ? "UP" : "DOWN", cx, y + h - 7);
}

function drawTerminal(ctx: CanvasRenderingContext2D, t: Floor["terminals"][number], time: number) {
  const { x, y, w, h } = t;
  ctx.fillStyle = "rgba(0,0,0,0.4)";
  rr(ctx, x + 4, y + 6, w, h, 6);
  ctx.fill();
  ctx.fillStyle = "#1B1B28";
  rr(ctx, x, y, w, h, 6);
  ctx.fill();
  ctx.strokeStyle = "rgba(153,69,255,0.5)";
  ctx.stroke();

  const pulse = 0.35 + (Math.sin(time * 2) * 0.5 + 0.5) * 0.4;
  ctx.fillStyle = `rgba(153,69,255,${pulse})`;
  rr(ctx, x + 7, y + 8, w - 14, h - 24, 3);
  ctx.fill();

  ctx.fillStyle = "#F4F0FF";
  ctx.font = '600 18px "Space Grotesk Variable", system-ui, sans-serif';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("?", x + w / 2, y + h / 2 - 5);
  ctx.fillStyle = "rgba(255,255,255,0.4)";
  ctx.fillRect(x + 10, y + h - 12, w - 20, 2);
}

function drawSecret(ctx: CanvasRenderingContext2D, secret: NonNullable<Floor["secret"]>, time: number) {
  const pulse = 0.5 + (Math.sin(time * 1.8) * 0.5 + 0.5) * 0.5;
  ctx.save();
  ctx.translate(secret.x, secret.y);
  const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, 58);
  glow.addColorStop(0, `rgba(20,241,149,${0.28 * pulse})`);
  glow.addColorStop(1, "rgba(20,241,149,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(-58, -58, 116, 116);

  ctx.fillStyle = "rgba(0,0,0,0.45)";
  ctx.beginPath();
  ctx.ellipse(0, 12, 16, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#0B1A14";
  ctx.beginPath();
  ctx.moveTo(0, -30);
  ctx.lineTo(11, 8);
  ctx.lineTo(0, 14);
  ctx.lineTo(-11, 8);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = `rgba(20,241,149,${0.5 + pulse * 0.4})`;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = `rgba(20,241,149,${0.4 + pulse * 0.5})`;
  ctx.beginPath();
  ctx.moveTo(0, -18);
  ctx.lineTo(4, 2);
  ctx.lineTo(0, 6);
  ctx.lineTo(-4, 2);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawNpc(ctx: CanvasRenderingContext2D, n: NpcLike, time: number) {
  const bob = Math.sin(time * 2.4 + n.phase) * 1.4;
  ctx.fillStyle = "rgba(0,0,0,0.32)";
  ctx.beginPath();
  ctx.ellipse(n.x, n.y + 9, 8, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = n.color;
  ctx.globalAlpha = 0.75;
  ctx.beginPath();
  ctx.roundRect(n.x - 5, n.y - 8 + bob, 10, 16, 5);
  ctx.fill();
  ctx.fillStyle = "#D9B08C";
  ctx.beginPath();
  ctx.arc(n.x, n.y - 11 + bob, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawPlayer(
  ctx: CanvasRenderingContext2D,
  p: Vec,
  name: string,
  facing: number,
  walkPhase: number,
  moving: boolean,
) {
  const bob = moving ? Math.sin(walkPhase * 2) * 1.8 : Math.sin(performance.now() * 0.002) * 0.8;

  const glow = ctx.createRadialGradient(p.x, p.y, 4, p.x, p.y, 52);
  glow.addColorStop(0, "rgba(153,69,255,0.3)");
  glow.addColorStop(0.5, "rgba(20,241,149,0.07)");
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(p.x - 52, p.y - 52, 104, 104);

  ctx.fillStyle = "rgba(0,0,0,0.42)";
  ctx.beginPath();
  ctx.ellipse(p.x, p.y + 15, 13, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(p.x, p.y + bob);
  ctx.rotate(Math.sin(performance.now() * 0.001) * 0.06);

  ctx.strokeStyle = "rgba(20,241,149,0.35)";
  ctx.lineWidth = 1.4;
  ctx.setLineDash([4, 6]);
  ctx.beginPath();
  ctx.arc(0, 0, 23, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  const body = ctx.createRadialGradient(-4, -5, 2, 0, 0, 15);
  body.addColorStop(0, "#FFFFFF");
  body.addColorStop(0.45, "#D9CCFF");
  body.addColorStop(1, "#8C6BF0");
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.arc(0, 0, 13.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.8)";
  ctx.lineWidth = 1.2;
  ctx.stroke();

  ctx.rotate(facing);
  ctx.fillStyle = "#14F195";
  ctx.beginPath();
  ctx.moveTo(15, 0);
  ctx.lineTo(8, -4.5);
  ctx.lineTo(8, 4.5);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  const label = name.length > 18 ? `${name.slice(0, 17)}…` : name;
  ctx.font = '600 10px "Space Grotesk Variable", system-ui, sans-serif';
  const tw = ctx.measureText(label).width;
  ctx.fillStyle = "rgba(8,8,14,0.75)";
  rr(ctx, p.x - tw / 2 - 6, p.y - 40 + bob, tw + 12, 17, 8);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, p.x, p.y - 31 + bob);
}

function drawNearby(ctx: CanvasRenderingContext2D, spot: Spot, time: number) {
  const pulse = 0.55 + Math.sin(time * 3) * 0.25;
  const r = 26 + Math.sin(time * 3) * 3;
  ctx.save();
  ctx.strokeStyle = `rgba(20,241,149,${pulse})`;
  ctx.lineWidth = 1.6;
  ctx.setLineDash([5, 6]);
  ctx.beginPath();
  ctx.arc(spot.x, spot.y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = `rgba(20,241,149,${pulse * 0.9})`;
  ctx.beginPath();
  ctx.moveTo(spot.x, spot.y - r - 14);
  ctx.lineTo(spot.x + 5, spot.y - r - 7);
  ctx.lineTo(spot.x, spot.y - r);
  ctx.lineTo(spot.x - 5, spot.y - r - 7);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function drawFrame(ctx: CanvasRenderingContext2D, o: FrameOptions) {
  const { view, zoom, cam, floor, time } = o;
  ctx.fillStyle = "#06060A";
  ctx.fillRect(0, 0, view.w, view.h);

  ctx.save();
  ctx.translate(view.w / 2, view.h / 2);
  ctx.scale(zoom, zoom);
  ctx.translate(-cam.x, -cam.y);

  ctx.drawImage(baseFor(floor), 0, 0);

  const viewL = cam.x - view.w / (2 * zoom) - 80;
  const viewR = cam.x + view.w / (2 * zoom) + 80;
  const viewT = cam.y - view.h / (2 * zoom) - 80;
  const viewB = cam.y + view.h / (2 * zoom) + 80;
  const visible = (x: number, y: number, w: number, h: number) =>
    x + w > viewL && x < viewR && y + h > viewT && y < viewB;

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  for (const z of floor.zones) {
    if (!visible(z.x, z.y, z.w, z.h)) continue;
    const tone = TONE[z.tone] ?? "#FFFFFF";
    ctx.fillStyle = hexA(tone, 0.55);
    ctx.fillRect(z.x + 18, z.y + 20, 4, 4);
    ctx.fillStyle = hexA(tone, 0.42);
    ctx.font = '600 10px "JetBrains Mono Variable", ui-monospace, monospace';
    tracking(ctx, z.name.toUpperCase(), z.x + 28, z.y + 25, 2);
  }

  if (floor.id === "ground") {
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(20,241,149,0.4)";
    ctx.font = '600 9px "JetBrains Mono Variable", ui-monospace, monospace';
    tracking(ctx, "ENTRANCE", 1000, 1342, 4);
  }

  type Item = { y: number; draw: () => void };
  const items: Item[] = [];

  for (const b of floor.booths) {
    if (!visible(b.x, b.y - 30, b.w, b.h + 40)) continue;
    items.push({
      y: b.y + b.h,
      draw: () => drawBooth(ctx, b, o.visited.has(`booth:${b.id}`), o.nearbyId === `booth:${b.id}`),
    });
  }

  for (const p of floor.props) {
    if (!visible(p.x, p.y, p.w, p.h)) continue;
    items.push({ y: p.y + p.h, draw: () => drawProp(ctx, p, time) });
  }

  for (const s of floor.stages) {
    if (!visible(s.x, s.y, s.w, s.h)) continue;
    items.push({ y: s.y + s.h, draw: () => drawStage(ctx, s, time) });
  }

  for (const s of floor.stairs) {
    if (!visible(s.x, s.y, s.w, s.h)) continue;
    items.push({ y: s.y + s.h, draw: () => drawStairs(ctx, s, time) });
  }

  for (const t of floor.terminals) {
    if (!visible(t.x, t.y, t.w, t.h)) continue;
    items.push({ y: t.y + t.h, draw: () => drawTerminal(ctx, t, time) });
  }

  if (floor.secret && visible(floor.secret.x - 30, floor.secret.y - 40, 60, 60)) {
    items.push({ y: floor.secret.y, draw: () => drawSecret(ctx, floor.secret!, time) });
  }

  for (const n of o.crowd) {
    if (!visible(n.x - 10, n.y - 20, 20, 30)) continue;
    items.push({ y: n.y + 10, draw: () => drawNpc(ctx, n, time) });
  }

  if (o.mode === "play") {
    items.push({
      y: o.player.y + 16,
      draw: () => drawPlayer(ctx, o.player, o.playerName, o.facing, o.walkPhase, o.moving),
    });
  }

  items.sort((a, b) => a.y - b.y);
  for (const item of items) item.draw();

  if (o.mode === "play") {
    const spot = getSpots(floor).find((s) => s.id === o.nearbyId);
    if (spot) drawNearby(ctx, spot, time);
  }

  if (!o.reducedMotion) {
    for (let i = 0; i < 26; i += 1) {
      const px = cam.x + Math.sin(time * 0.07 + i * 1.7) * (view.w / zoom) * 0.42;
      const py = cam.y + Math.cos(time * 0.09 + i * 2.3) * (view.h / zoom) * 0.38;
      ctx.fillStyle = `rgba(220,215,255,${0.035 + (i % 4) * 0.012})`;
      ctx.beginPath();
      ctx.arc(px, py, 0.8 + (i % 3) * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();

  const vig = ctx.createRadialGradient(
    view.w / 2,
    view.h / 2,
    Math.min(view.w, view.h) * 0.32,
    view.w / 2,
    view.h / 2,
    Math.max(view.w, view.h) * 0.74,
  );
  vig.addColorStop(0, "rgba(4,4,8,0)");
  vig.addColorStop(1, "rgba(4,4,8,0.62)");
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, view.w, view.h);
}
