"use client";

import { ElementType, HTMLAttributes, ReactNode, useEffect, useRef, useState } from "react";

type AstreaProps = HTMLAttributes<HTMLElement> & {
  as?: ElementType;
  children: ReactNode;
  delay?: number;
  variant?: "rise" | "fade" | "scale" | "reveal";
};

/** A tiny, project-local motion layer with one coherent timing language. */
export function Astrea({ as: Tag = "div", delay = 0, variant = "rise", className = "", style, ...props }: AstreaProps) {
  const nodeRef = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { rootMargin: "0px 0px -8%", threshold: 0.12 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={nodeRef}
      className={`astrea astrea-${variant} ${visible ? "is-visible" : ""} ${className}`}
      style={{ ...style, "--astrea-delay": `${delay}ms` } as React.CSSProperties}
      {...props}
    />
  );
}

export function AstreaButton({ className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`astrea-button ${className}`} {...props} />;
}
