import { useEffect, type ReactNode } from "react";
import { Icon } from "./icons";

type Props = {
  eyebrow: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
};

export function Sheet({ eyebrow, onClose, children, className }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="scrim"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="presentation"
    >
      <aside className={`sheet ${className ?? ""}`} role="dialog" aria-modal="true" aria-label={eyebrow}>
        <div className="sheet-grip" aria-hidden="true" />
        <div className="sheet-head">
          <span className="eyebrow">{eyebrow}</span>
          <button className="icon-btn sheet-close" onClick={onClose} aria-label="Close panel">
            <Icon name="close" size={18} />
          </button>
        </div>
        <div className="sheet-body">{children}</div>
      </aside>
    </div>
  );
}
