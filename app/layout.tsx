import type { Metadata, Viewport } from "next";
import "@fontsource-variable/instrument-sans";
import "@fontsource-variable/newsreader";
import "./globals.css";
import "./cinematic.css";
import "./parallax.css";
import "./product.css";
import "./luxury-motion.css";
import { ProductProvider } from "@/lib/product-context";
import { PremiumNavigationProvider } from "@/lib/premium-navigation";
import { SiteHeader } from "@/components/navigation/site-header";
import { LuxuryMotionLayer } from "@/components/motion/luxury-motion-layer";

export const metadata: Metadata = {
  title: "StayAI — Your stay, sorted.",
  description: "A calmer way to manage your stay.",
};

export const viewport: Viewport = {
  themeColor: "#f7f5ef",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <PremiumNavigationProvider>
          <ProductProvider>
            <SiteHeader />
            {children}
            <LuxuryMotionLayer />
          </ProductProvider>
        </PremiumNavigationProvider>
      </body>
    </html>
  );
}
