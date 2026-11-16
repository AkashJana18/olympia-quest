import { useRef, useState, type PointerEvent, type RefObject } from "react";
import type { Game } from "../game/engine";
import type { Spot } from "../game/types";
import { Icon } from "./icons";

type Props = {
  gameRef: RefObject<Game | null>;
  nearby: Spot | null;
  onInteract: () => void;
};

const RADIUS = 44;

export function TouchControls({ gameRef, nearby, onInteract }: Props) {
  const baseRef = useRef<HTMLDivElement>(null);
  const activePointer = useRef<number | null>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const [moving, setMoving] = useState(false);

  const update = (e: PointerEvent<HTMLDivElement>) => {
    const base = baseRef.current;
    if (!base) return;
    const rect = base.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let dx = e.clientX - cx;
    let dy = e.clientY - cy;
    const d = Math.hypot(dx, dy);
    if (d > RADIUS) {
      dx = (dx / d) * RADIUS;
      dy = (dy / d) * RADIUS;
    }
    setKnob({ x: dx, y: dy });
    const nx = dx / RADIUS;
    const ny = dy / RADIUS;
    const mag = Math.hypot(nx, ny);
    if (mag < 0.16) {
      gameRef.current?.setMoveVector(0, 0);
      setMoving(false);
    } else {
      gameRef.current?.setMoveVector(nx, ny);
      setMoving(true);
    }
  };

  const end = (e: PointerEvent<HTMLDivElement>) => {
    if (activePointer.current !== e.pointerId) return;
    activePointer.current = null;
    setKnob({ x: 0, y: 0 });
    setMoving(false);
    gameRef.current?.setMoveVector(0, 0);
  };

  return (
    <div className="touch-ui">
      <div
        className={moving ? "joystick active" : "joystick"}
        ref={baseRef}
        onPointerDown={(e) => {
          activePointer.current = e.pointerId;
          e.currentTarget.setPointerCapture(e.pointerId);
          update(e);
        }}
        onPointerMove={(e) => {
          if (activePointer.current === e.pointerId) update(e);
        }}
        onPointerUp={end}
        onPointerCancel={end}
        role="presentation"
      >
        <span className="joystick-ring" />
        <span className="joystick-knob" style={{ transform: `translate(${knob.x}px, ${knob.y}px)` }} />
        <span className="joystick-label">MOVE</span>
      </div>

      <div className="action-wrap">
        <span className={nearby ? "action-label show" : "action-label"}>
          {nearby ? nearby.label : "Explore the floor"}
        </span>
        <button
          className={nearby ? "action-btn ready" : "action-btn"}
          onClick={onInteract}
          disabled={!nearby}
          aria-label={nearby ? nearby.label : "Nothing to interact with"}
        >
          {nearby ? <Icon name="spark" size={24} /> : <Icon name="map" size={24} />}
        </button>
      </div>
    </div>
  );
}
