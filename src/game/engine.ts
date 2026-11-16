import { FLOORS, getSpots, solidRects, zoneAt } from "./world";
import type { Floor, FloorId, Spot, Vec } from "./types";
import { drawFrame } from "./render";

const PLAYER_R = 16;
const WALK_SPEED = 250;
const RUN_SPEED = 385;

export type GameCallbacks = {
  onNearby: (spot: Spot | null) => void;
  onZone: (zoneId: string) => void;
  onFloor: (floorId: FloorId) => void;
  onInteract: (spot: Spot) => void;
};

type Npc = {
  x: number;
  y: number;
  tx: number;
  ty: number;
  speed: number;
  color: string;
  phase: number;
  wait: number;
};

const NPC_COLORS = ["#7C7CFF", "#3DDC97", "#FFB347", "#FF6EC7", "#5AA7FF", "#C084FC"];

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function blockedAt(rects: { x: number; y: number; w: number; h: number }[], x: number, y: number, r: number) {
  for (const rect of rects) {
    const cx = Math.max(rect.x, Math.min(x, rect.x + rect.w));
    const cy = Math.max(rect.y, Math.min(y, rect.y + rect.h));
    const dx = x - cx;
    const dy = y - cy;
    if (dx * dx + dy * dy < r * r) return true;
  }
  return false;
}

function makeCrowd(floor: Floor, seed: number): Npc[] {
  const rng = mulberry32(seed);
  const rects = solidRects(floor);
  const crowd: Npc[] = [];
  let guard = 0;
  while (crowd.length < 16 && guard < 500) {
    guard += 1;
    const x = 90 + rng() * (floor.width - 180);
    const y = 80 + rng() * (floor.height - 170);
    if (blockedAt(rects, x, y, 20)) continue;
    crowd.push({
      x,
      y,
      tx: x,
      ty: y,
      speed: 20 + rng() * 26,
      color: NPC_COLORS[Math.floor(rng() * NPC_COLORS.length)],
      phase: rng() * Math.PI * 2,
      wait: rng() * 2,
    });
  }
  return crowd;
}

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private cb: GameCallbacks;
  private floor: Floor = FLOORS.ground;
  private rects = solidRects(FLOORS.ground);
  private spots = getSpots(FLOORS.ground);
  private crowd = new Map<FloorId, Npc[]>([
    ["ground", makeCrowd(FLOORS.ground, 7)],
    ["first", makeCrowd(FLOORS.first, 21)],
  ]);

  private player: Vec = { ...FLOORS.ground.spawn };
  private facing = -Math.PI / 2;
  private cam: Vec = { ...FLOORS.ground.spawn };
  private zoom = 1;
  private view = { w: 1, h: 1 };

  private keys = new Set<string>();
  private moveVec: Vec = { x: 0, y: 0 };
  private target: Vec | null = null;
  private stuckTimer = 0;
  private lastPos: Vec = { ...FLOORS.ground.spawn };
  private walkPhase = 0;
  private moving = false;

  private paused = false;
  private mode: "attract" | "play" = "attract";
  private nearby: Spot | null = null;
  private currentZone: string | null = null;
  private visited = new Set<string>();
  private playerName = "remote";

  private raf = 0;
  private last = 0;
  private time = 0;
  private resizeObserver: ResizeObserver;
  private reducedMotion: boolean;

  constructor(canvas: HTMLCanvasElement, cb: GameCallbacks) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) throw new Error("Canvas 2D is not available");
    this.ctx = ctx;
    this.cb = cb;
    this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(canvas);
    this.resize();

    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    canvas.addEventListener("pointerdown", this.onPointerDown);

    this.last = performance.now();
    this.raf = requestAnimationFrame(this.loop);
  }

  private resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, this.canvas.clientWidth);
    const h = Math.max(1, this.canvas.clientHeight);
    this.view = { w, h };
    const pw = Math.round(w * dpr);
    const ph = Math.round(h * dpr);
    if (this.canvas.width !== pw || this.canvas.height !== ph) {
      this.canvas.width = pw;
      this.canvas.height = ph;
    }
    this.zoom = w < 640 ? 0.92 : Math.min(1.1, Math.max(0.7, Math.min(w / 1440, h / 900)));
    this.cam = this.clampCamera(this.cam.x, this.cam.y);
  }

  private isTyping(target: EventTarget | null) {
    const el = target as HTMLElement | null;
    if (!el) return false;
    const tag = el.tagName;
    return tag === "INPUT" || tag === "TEXTAREA" || el.isContentEditable;
  }

  private onKeyDown = (e: KeyboardEvent) => {
    if (this.isTyping(e.target)) return;
    const key = e.key.toLowerCase();
    if (
      key === "w" ||
      key === "a" ||
      key === "s" ||
      key === "d" ||
      key.startsWith("arrow") ||
      key === " " ||
      key === "e"
    ) {
      e.preventDefault();
    }
    this.keys.add(key);
    if (key === "e" || key === " ") {
      if (!this.paused && this.mode === "play") this.interact();
    }
  };

  private onKeyUp = (e: KeyboardEvent) => {
    this.keys.delete(e.key.toLowerCase());
  };

  private onPointerDown = (e: PointerEvent) => {
    if (this.paused || this.mode !== "play" || e.button !== 0) return;
    const rect = this.canvas.getBoundingClientRect();
    const world = this.screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
    if (blockedAt(this.rects, world.x, world.y, PLAYER_R)) return;
    this.target = world;
    this.stuckTimer = 0;
  };

  getPlayerPos(): Vec {
    return { ...this.player };
  }

  getFloorId(): FloorId {
    return this.floor.id;
  }

  getView() {
    return { cam: { ...this.cam }, zoom: this.zoom, w: this.view.w, h: this.view.h };
  }

  screenToWorld(sx: number, sy: number): Vec {
    return {
      x: (sx - this.view.w / 2) / this.zoom + this.cam.x,
      y: (sy - this.view.h / 2) / this.zoom + this.cam.y,
    };
  }

  private clampCamera(x: number, y: number): Vec {
    const halfW = this.view.w / (2 * this.zoom);
    const halfH = this.view.h / (2 * this.zoom);
    const f = this.floor;
    return {
      x: f.width <= halfW * 2 ? f.width / 2 : Math.min(f.width - halfW, Math.max(halfW, x)),
      y: f.height <= halfH * 2 ? f.height / 2 : Math.min(f.height - halfH, Math.max(halfH, y)),
    };
  }

  private setFloorData(floorId: FloorId) {
    this.floor = FLOORS[floorId];
    this.rects = solidRects(this.floor);
    this.spots = getSpots(this.floor);
  }

  startAt(floorId: FloorId, spawn?: Vec, name?: string) {
    this.setFloorData(floorId);
    this.player = { ...(spawn ?? this.floor.spawn) };
    this.lastPos = { ...this.player };
    this.cam = this.clampCamera(this.player.x, this.player.y);
    this.mode = "play";
    this.target = null;
    if (name) this.playerName = name;
  }

  setPlayerName(name: string) {
    this.playerName = name;
  }

  setVisited(ids: string[]) {
    this.visited = new Set(ids);
  }

  setPaused(paused: boolean) {
    this.paused = paused;
    if (paused) this.target = null;
  }

  setMoveVector(x: number, y: number) {
    this.moveVec = { x, y };
    if (Math.abs(x) > 0.18 || Math.abs(y) > 0.18) this.target = null;
  }

  triggerInteract() {
    if (this.paused) return;
    this.interact();
  }

  private interact() {
    if (this.nearby) this.cb.onInteract(this.nearby);
  }

  teleport(floorId: FloorId, spawn: Vec) {
    this.setFloorData(floorId);
    this.player = { ...spawn };
    this.lastPos = { ...this.player };
    this.cam = this.clampCamera(spawn.x, spawn.y);
    this.target = null;
    this.nearby = null;
    this.cb.onNearby(null);
    this.cb.onFloor(floorId);
  }

  private findNearby(): Spot | null {
    let best: Spot | null = null;
    let bestD = Infinity;
    for (const spot of this.spots) {
      const dx = spot.x - this.player.x;
      const dy = spot.y - this.player.y;
      const d = Math.hypot(dx, dy);
      if (d <= spot.radius && d < bestD) {
        bestD = d;
        best = spot;
      }
    }
    return best;
  }

  private blocked(x: number, y: number, r: number) {
    if (x < 40 + r || y < 40 + r || x > this.floor.width - 40 - r || y > this.floor.height - 40 - r) {
      return true;
    }
    return blockedAt(this.rects, x, y, r);
  }

  private update(dt: number) {
    this.time += dt;
    this.updateCrowd(dt);

    if (this.mode === "play") {
      this.updatePlayer(dt);
      if (!this.paused) {
        const zone = zoneAt(this.floor, this.player.x, this.player.y);
        const id = zone?.id ?? null;
        if (id !== this.currentZone) {
          this.currentZone = id;
          if (id) this.cb.onZone(id);
        }
        const near = this.findNearby();
        if (near?.id !== this.nearby?.id) {
          this.nearby = near;
          this.cb.onNearby(near);
        }
      }
      const camTarget = this.paused ? this.player : this.player;
      const k = 1 - Math.exp(-7 * dt);
      const next = {
        x: this.cam.x + (camTarget.x - this.cam.x) * k,
        y: this.cam.y + (camTarget.y - this.cam.y) * k,
      };
      this.cam = this.clampCamera(next.x, next.y);
    } else {
      const span = this.floor.width * 0.22;
      const tx = this.floor.width / 2 + Math.sin(this.time * 0.09) * span;
      const ty = this.floor.height * 0.46 + Math.cos(this.time * 0.06) * span * 0.45;
      const k = 1 - Math.exp(-1.6 * dt);
      const next = { x: this.cam.x + (tx - this.cam.x) * k, y: this.cam.y + (ty - this.cam.y) * k };
      this.cam = this.clampCamera(next.x, next.y);
    }
  }

  private updatePlayer(dt: number) {
    let dx = 0;
    let dy = 0;
    const mag = Math.hypot(this.moveVec.x, this.moveVec.y);
    if (mag > 0.18) {
      dx = this.moveVec.x;
      dy = this.moveVec.y;
    } else {
      if (this.keys.has("w") || this.keys.has("arrowup")) dy -= 1;
      if (this.keys.has("s") || this.keys.has("arrowdown")) dy += 1;
      if (this.keys.has("a") || this.keys.has("arrowleft")) dx -= 1;
      if (this.keys.has("d") || this.keys.has("arrowright")) dx += 1;
    }

    if (this.target) {
      const tx = this.target.x - this.player.x;
      const ty = this.target.y - this.player.y;
      const dist = Math.hypot(tx, ty);
      if (dist < 10) {
        this.target = null;
      } else {
        dx = tx / dist;
        dy = ty / dist;
      }
    }

    const len = Math.hypot(dx, dy);
    this.moving = len > 0.01 && !this.paused;
    if (this.moving) {
      dx /= len;
      dy /= len;
      this.facing = Math.atan2(dy, dx);
      const sprint = this.keys.has("shift");
      const speed = sprint ? RUN_SPEED : WALK_SPEED;
      const step = speed * dt;
      const beforeX = this.player.x;
      const beforeY = this.player.y;
      const nx = this.player.x + dx * step;
      if (!this.blocked(nx, this.player.y, PLAYER_R)) this.player.x = nx;
      const ny = this.player.y + dy * step;
      if (!this.blocked(this.player.x, ny, PLAYER_R)) this.player.y = ny;
      this.walkPhase += step * 0.06;

      if (this.target) {
        const moved = Math.hypot(this.player.x - beforeX, this.player.y - beforeY);
        const wanted = Math.hypot(this.player.x - this.target.x, this.player.y - this.target.y);
        if (moved < step * 0.15 && wanted > 14) {
          this.stuckTimer += dt;
          if (this.stuckTimer > 0.5) {
            this.target = null;
            this.stuckTimer = 0;
          }
        } else {
          this.stuckTimer = 0;
        }
      }
    }

    if (this.player.x !== this.lastPos.x || this.player.y !== this.lastPos.y) {
      this.lastPos = { ...this.player };
    }
  }

  private updateCrowd(dt: number) {
    const crowd = this.crowd.get(this.floor.id) ?? [];
    for (const npc of crowd) {
      if (npc.wait > 0) {
        npc.wait -= dt;
        continue;
      }
      const dx = npc.tx - npc.x;
      const dy = npc.ty - npc.y;
      const d = Math.hypot(dx, dy);
      if (d < 6) {
        const nx = 80 + Math.random() * (this.floor.width - 160);
        const ny = 80 + Math.random() * (this.floor.height - 160);
        if (!blockedAt(this.rects, nx, ny, 18)) {
          npc.tx = nx;
          npc.ty = ny;
        }
        npc.wait = 0.6 + Math.random() * 2.4;
        continue;
      }
      const step = npc.speed * dt;
      const nx = npc.x + (dx / d) * step;
      const ny = npc.y + (dy / d) * step;
      if (!blockedAt(this.rects, nx, ny, 14)) {
        npc.x = nx;
        npc.y = ny;
      } else {
        npc.wait = 0.4 + Math.random() * 1.2;
        npc.tx = npc.x;
        npc.ty = npc.y;
      }
    }
  }

  private renderFrame() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const ctx = this.ctx;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawFrame(ctx, {
      floor: this.floor,
      player: this.player,
      playerName: this.playerName,
      facing: this.facing,
      walkPhase: this.walkPhase,
      moving: this.moving,
      cam: this.cam,
      zoom: this.zoom,
      view: this.view,
      time: this.time,
      nearbyId: this.nearby?.id ?? null,
      visited: this.visited,
      crowd: this.crowd.get(this.floor.id) ?? [],
      mode: this.mode,
      reducedMotion: this.reducedMotion,
      paused: this.paused,
    });
  }

  private loop = (now: number) => {
    const dt = Math.min(0.05, Math.max(0.001, (now - this.last) / 1000));
    this.last = now;
    this.update(dt);
    this.renderFrame();
    this.raf = requestAnimationFrame(this.loop);
  };

  destroy() {
    cancelAnimationFrame(this.raf);
    this.resizeObserver.disconnect();
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    this.canvas.removeEventListener("pointerdown", this.onPointerDown);
  }
}
