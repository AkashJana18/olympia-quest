import { useEffect, useRef, type RefObject } from "react";
import type { Game } from "../game/engine";
import type { FloorId } from "../game/types";
import { FLOORS } from "../game/world";

const TONE: Record<string, string> = {
  stage: "#9945FF",
  sponsor: "#5AA7FF",
  food: "#FFB347",
  lounge: "#FF6EC7",
  market: "#14F195",
  build: "#38BDF8",
  entry: "#E6E6F0",
};

type Props = {
  gameRef: RefObject<Game | null>;
  floor: FloorId;
};

export function Minimap({ gameRef, floor }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const floorRef = useRef<FloorId>(floor);

  useEffect(() => {
    floorRef.current = floor;
  }, [floor]);

  useEffect(() => {
    let raf = 0;
    const draw = () => {
      const canvas = canvasRef.current;
      const game = gameRef.current;
      const f = FLOORS[floorRef.current];
      if (!canvas) {
        raf = requestAnimationFrame(draw);
        return;
      }
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
      }
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const pad = 10;
      const scale = Math.min((w - pad * 2) / f.width, (h - pad * 2) / f.height);
      const ox = (w - f.width * scale) / 2;
      const oy = (h - f.height * scale) / 2;
      const X = (x: number) => ox + x * scale;
      const Y = (y: number) => oy + y * scale;

      ctx.fillStyle = "#0B0B13";
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = "rgba(255,255,255,0.12)";
      ctx.lineWidth = 1;
      ctx.strokeRect(X(40), Y(40), (f.width - 80) * scale, (f.height - 80) * scale);

      for (const z of f.zones) {
        const tone = TONE[z.tone] ?? "#fff";
        ctx.fillStyle = `${tone}18`;
        ctx.fillRect(X(z.x), Y(z.y), z.w * scale, z.h * scale);
      }

      for (const b of f.booths) {
        ctx.fillStyle = b.color;
        ctx.globalAlpha = 0.85;
        ctx.fillRect(X(b.x), Y(b.y), Math.max(2, b.w * scale), Math.max(2, b.h * scale));
        ctx.globalAlpha = 1;
      }

      for (const s of f.stairs) {
        ctx.fillStyle = "#14F195";
        ctx.fillRect(X(s.x), Y(s.y), Math.max(3, s.w * scale), Math.max(2, s.h * scale));
      }

      if (game) {
        const p = game.getPlayerPos();
        const view = game.getView();
        const vw = view.w / view.zoom;
        const vh = view.h / view.zoom;
        ctx.strokeStyle = "rgba(255,255,255,0.16)";
        ctx.strokeRect(
          X(view.cam.x - vw / 2),
          Y(view.cam.y - vh / 2),
          vw * scale,
          vh * scale,
        );

        const t = performance.now() / 1000;
        ctx.fillStyle = "rgba(20,241,149,0.18)";
        ctx.beginPath();
        ctx.arc(X(p.x), Y(p.y), 5 + Math.sin(t * 3) * 1.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#E9FFf5";
        ctx.beginPath();
        ctx.arc(X(p.x), Y(p.y), 2.2, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [gameRef]);

  return (
    <div className="minimap" aria-label="Venue minimap">
      <div className="minimap-head">
        <span>{floor === "ground" ? "GROUND FLOOR" : "FIRST FLOOR"}</span>
        <span className="minimap-key">
          <i /> you
        </span>
      </div>
      <canvas ref={canvasRef} />
    </div>
  );
}
