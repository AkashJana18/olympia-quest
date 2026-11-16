import { Icon } from "./icons";

export type ToastTone = "quest" | "stamp" | "info" | "error";

export type ToastItem = {
  id: string;
  title: string;
  sub?: string;
  tone: ToastTone;
};

const ICON = {
  quest: "spark",
  stamp: "check",
  info: "info",
  error: "close",
} as const;

export function Toasts({ items }: { items: ToastItem[] }) {
  return (
    <div className="toasts" aria-live="polite">
      {items.map((t) => (
        <div key={t.id} className={`toast ${t.tone}`}>
          <span className="toast-icon">
            <Icon name={ICON[t.tone]} size={16} />
          </span>
          <div>
            <b>{t.title}</b>
            {t.sub && <span>{t.sub}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
