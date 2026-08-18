"use client";

import Link, { type LinkProps } from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type AnchorHTMLAttributes, type MouseEvent, type ReactNode } from "react";

type TransitionPhase = "idle" | "closing" | "covered" | "opening";

type PremiumNavigationValue = {
  navigate: (href: string, label?: string) => void;
};

const PremiumNavigationContext = createContext<PremiumNavigationValue | null>(null);

const COVER_DURATION = 360;
const REVEAL_DURATION = 520;

export function PremiumNavigationProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const previousPath = useRef(pathname);
  const timer = useRef<number | null>(null);
  const [phase, setPhase] = useState<TransitionPhase>("idle");

  const clearTimer = () => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = null;
  };

  const navigate = useCallback((href: string) => {
    if (href === pathname || phase !== "idle") return;
    clearTimer();
    setPhase("closing");
    timer.current = window.setTimeout(() => {
      setPhase("covered");
      router.push(href);
    }, COVER_DURATION);
  }, [pathname, phase, router]);

  useEffect(() => {
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;
    clearTimer();
    timer.current = window.setTimeout(() => {
      setPhase("opening");
      timer.current = window.setTimeout(() => setPhase("idle"), REVEAL_DURATION);
    }, 30);
  }, [pathname]);

  useEffect(() => () => clearTimer(), []);

  return (
    <PremiumNavigationContext.Provider value={{ navigate }}>
      <div className={`route-stage is-${phase}`}>{children}</div>
      <div className={`route-curtain is-${phase}`} aria-hidden="true">
        <i className="route-curtain__veil" />
        <span className="route-curtain__mark">StayAI</span>
      </div>
    </PremiumNavigationContext.Provider>
  );
}

export function usePremiumNavigation() {
  const value = useContext(PremiumNavigationContext);
  if (!value) throw new Error("usePremiumNavigation must be used inside PremiumNavigationProvider");
  return value;
}

export function PremiumLink({
  href,
  transitionLabel,
  onClick,
  ...props
}: LinkProps & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & { transitionLabel?: string }) {
  const { navigate } = usePremiumNavigation();
  const hrefString = typeof href === "string" ? href : href.pathname ?? "/";

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigate(hrefString, transitionLabel);
  };

  return <Link href={href} onClick={handleClick} {...props} />;
}
