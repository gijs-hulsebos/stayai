import type { ReactNode } from "react";

export function Brand() {
  return (
    <span className="brand" aria-label="StayAI" translate="no">
      <svg className="brand-symbol" viewBox="0 0 44 44" aria-hidden="true">
        <path className="mark-shell" d="M22 2.75 39.25 12.7v18.6L22 41.25 4.75 31.3V12.7L22 2.75Z" />
        <path className="mark-roof" d="m11.5 22 10.45-8.2L32.5 22" />
        <path className="mark-water" d="M10.5 27.1c3.4-1.55 6.8-1.55 10.2 0 3.4 1.55 6.8 1.55 10.2 0" />
        <circle cx="22" cy="21.8" r="2.2" />
      </svg>
      <span className="brand-type"><b>StayAI</b><small>Guest service</small></span>
    </span>
  );
}

export function StatusPill({ children = "Confirmed", tone = "green" }: { children?: ReactNode; tone?: "green" | "amber" }) {
  return <span className={`status-pill ${tone}`}><span className="status-dot" />{children}</span>;
}

export function Eyebrow({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return <span className={`eyebrow${light ? " light" : ""}`}><i />{children}</span>;
}
