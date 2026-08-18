"use client";

import { ChevronDown, LogOut, Menu, Sparkles, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Brand } from "@/components/primitives/ui";
import { PremiumLink } from "@/lib/premium-navigation";
import { useProduct } from "@/lib/product-context";

const links = [
  { href: "/stay", label: "My Stay", transition: "Opening My Stay" },
  { href: "/assistant", label: "Assistant", transition: "Opening Assistant" },
  { href: "/explore", label: "Explore", transition: "Opening Explore" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { authState, logout } = useProduct();
  const isHome = pathname === "/";

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 18);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [pathname]);

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  return (
    <>
      <header className={`site-header ${isHome ? "home-route" : "product-route"} ${scrolled ? "is-scrolled" : ""}`}>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <PremiumLink className="brand-button" href="/" transitionLabel="Returning home" aria-label="StayAI home"><Brand /></PremiumLink>
        <nav className="main-nav" aria-label="Main navigation">
          {links.map((link) => <PremiumLink key={link.href} href={link.href} transitionLabel={link.transition} className={pathname === link.href ? "active" : ""}>{link.label}</PremiumLink>)}
        </nav>
        {authState === "authenticated" ? <div className="profile-menu-wrap"><button className="profile-button" onClick={() => setProfileOpen((current) => !current)} aria-expanded={profileOpen}><span>IO</span><b>IO-DEMO</b><ChevronDown /></button>{profileOpen && <div className="profile-menu"><div className="profile-menu-identity"><strong>IO-DEMO</strong><span>StayAI demonstration account</span></div><div className="profile-menu-links"><PremiumLink href="/assistant" transitionLabel="Opening your concierge"><Sparkles />Assistant</PremiumLink><button onClick={() => void logout()}><LogOut />Sign out</button></div></div>}</div> : <PremiumLink className="header-login" href="/assistant" transitionLabel="Opening private access">Sign in</PremiumLink>}
        <button className="mobile-menu-button" onClick={() => setMobileOpen((current) => !current)} aria-expanded={mobileOpen} aria-label={mobileOpen ? "Close menu" : "Open menu"}>{mobileOpen ? <X /> : <Menu />}</button>
        {mobileOpen && <nav className="mobile-nav" aria-label="Mobile navigation">{links.map((link) => <PremiumLink key={link.href} href={link.href} transitionLabel={link.transition}>{link.label}</PremiumLink>)}</nav>}
      </header>
    </>
  );
}
