import { useId, type ReactNode } from "react";

export type IconName =
  | "quest"
  | "board"
  | "report"
  | "share"
  | "wallet"
  | "close"
  | "menu"
  | "check"
  | "arrow"
  | "spark"
  | "users"
  | "clock"
  | "map"
  | "pin"
  | "info"
  | "copy"
  | "link"
  | "sign"
  | "floor";

const PATHS: Record<IconName, ReactNode> = {
  quest: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2.1 4.9-4.9 2.1 2.1-4.9z" />
    </>
  ),
  board: (
    <>
      <path d="M8 4h8v4.5a4 4 0 0 1-8 0z" />
      <path d="M8 5H5v2a3 3 0 0 0 3 3M16 5h3v2a3 3 0 0 1-3 3" />
      <path d="M12 12.5V17M8.5 20h7" />
    </>
  ),
  report: (
    <>
      <path d="M4 20h16" />
      <path d="M6 20v-7M11 20V5M16 20v-9M21 20v-4" />
    </>
  ),
  share: (
    <>
      <path d="M12 15V4m0 0L8 8m4-4 4 4" />
      <path d="M5 13v6h14v-6" />
    </>
  ),
  wallet: (
    <>
      <rect x="3" y="6" width="18" height="13" rx="3" />
      <path d="M3 10h18M16.5 14.5h.01" />
    </>
  ),
  close: <path d="m6 6 12 12M18 6 6 18" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  arrow: <path d="M4 12h15m-5-5 5 5-5 5" />,
  spark: (
    <>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
      <path d="m6.5 6.5 2.5 2.5M15 15l2.5 2.5M17.5 6.5 15 9M9 15l-2.5 2.5" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="9" r="3.2" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
      <path d="M16 6.2a3 3 0 0 1 0 5.6M17.5 19a5.4 5.4 0 0 0-2.2-4.3" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5.5l3.5 2" />
    </>
  ),
  map: (
    <>
      <path d="m3 6 6-2 6 2 6-2v14l-6 2-6-2-6 2z" />
      <path d="M9 4v14M15 6v14" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s6.5-5.6 6.5-11a6.5 6.5 0 0 0-13 0C5.5 15.4 12 21 12 21z" />
      <circle cx="12" cy="10" r="2.2" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </>
  ),
  copy: (
    <>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M15 5H6a2 2 0 0 0-2 2v9" />
    </>
  ),
  link: (
    <>
      <path d="M10 14a4 4 0 0 0 5.7 0l3-3A4 4 0 0 0 13 5.3L11 7.3" />
      <path d="M14 10a4 4 0 0 0-5.7 0l-3 3A4 4 0 0 0 11 18.7l2-2" />
    </>
  ),
  sign: (
    <>
      <path d="M3 17c3-1 4-8 6-8s1 6 3 6 2-4 4-4 1 3 5 3" />
      <path d="M4 21h16" />
    </>
  ),
  floor: (
    <>
      <path d="m12 3 9 5-9 5-9-5z" />
      <path d="m3 13 9 5 9-5" />
    </>
  ),
};

export function Icon({
  name,
  size = 18,
  className,
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  );
}

export function LogoMark({ size = 30 }: { size?: number }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-a`} x1="4" y1="4" x2="36" y2="36">
          <stop stopColor="#9945FF" />
          <stop offset="1" stopColor="#14F195" />
        </linearGradient>
      </defs>
      <path
        d="M20 3.5 34.5 12v16L20 36.5 5.5 28V12z"
        stroke={`url(#${id}-a)`}
        strokeWidth="1.6"
      />
      <path d="M20 10.5 28.5 15v9L20 28.5 11.5 24v-9z" fill={`url(#${id}-a)`} opacity="0.14" />
      <path d="M20 12.5 26.5 16v7L20 26.5 13.5 23v-7z" stroke={`url(#${id}-a)`} strokeWidth="1.1" />
      <circle cx="20" cy="19.5" r="2.4" fill={`url(#${id}-a)`} />
    </svg>
  );
}
