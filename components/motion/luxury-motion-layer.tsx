"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect } from "react";

const REVEAL_SELECTOR = [
  "main h1",
  "main h2",
  "main h3",
  ".functional-story-copy > p",
  ".functional-teaser-heading > p",
  ".assistant-welcome > p",
  ".my-stay-hero p",
  ".explore-intro p",
  ".auth-card p",
  ".functional-index",
  ".demo-label",
].join(",");

const SURFACE_SELECTOR = [
  ".functional-demo",
  ".cinematic-product-panel",
  ".explore-location-card",
  ".experience-tile",
  ".hotel-card",
  ".assistant-response-note",
  ".structured-reply",
  ".saved-grid > article",
  ".reservation-list > button",
  ".stay-detail",
  ".auth-card",
].join(",");

const IMAGE_SELECTOR = [
  ".functional-story-image",
  ".cinematic-panel-image",
  ".experience-image",
  ".experience-modal-image",
  ".hotel-image",
  ".reservation-list-image",
  ".stay-detail-image",
  ".saved-grid > article > div:first-child",
].join(",");

function nodesMatching(root: ParentNode, selector: string) {
  return root instanceof HTMLElement && root.matches(selector)
    ? [root]
    : Array.from(root.querySelectorAll<HTMLElement>(selector));
}

export function LuxuryMotionLayer() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.documentElement.classList.toggle("luxury-motion-on", !reduced);
    if (reduced) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("lux-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -5% 0px", threshold: 0.08 });

    const prepare = (root: ParentNode) => {
      nodesMatching(root, REVEAL_SELECTOR).forEach((element, index) => {
        // The walkthrough has its own scroll-synchronised typography. Never layer
        // the global entrance system over those timeline-controlled elements.
        if (element.closest(".route-curtain") || element.closest(".parallax") || element.dataset.luxReveal) return;
        element.dataset.luxReveal = "true";
        element.style.setProperty("--lux-order", String(index % 3));
        observer.observe(element);
      });

      nodesMatching(root, "button,a[href]").forEach((element) => {
        if (!element.closest(".route-curtain")) element.dataset.luxInteractive = "true";
      });

      nodesMatching(root, SURFACE_SELECTOR).forEach((element) => {
        if (element.dataset.luxSurface) return;
        element.dataset.luxSurface = "true";
        observer.observe(element);
      });

      nodesMatching(root, IMAGE_SELECTOR).forEach((element) => {
        if (element.dataset.luxImage) return;
        element.dataset.luxImage = "true";
        observer.observe(element);
      });
    };

    prepare(document.body);
    document.body.classList.remove("lux-route-arriving");
    void document.body.offsetWidth;
    document.body.classList.add("lux-route-arriving");
    const arrivalTimer = window.setTimeout(() => document.body.classList.remove("lux-route-arriving"), 720);

    const mutationObserver = new MutationObserver((records) => {
      records.forEach((record) => record.addedNodes.forEach((node) => {
        if (node instanceof HTMLElement) prepare(node);
      }));
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.clearTimeout(arrivalTimer);
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, [pathname]);

  return null;
}
