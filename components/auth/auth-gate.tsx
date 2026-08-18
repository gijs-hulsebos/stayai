"use client";

import { LockKeyhole, Sparkles } from "lucide-react";
import { useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { useProduct } from "@/lib/product-context";

export function AuthGate({ children }: { children: ReactNode }) {
  const { authState, authError, login } = useProduct();
  const [username, setUsername] = useState("IO-DEMO");
  const [password, setPassword] = useState("IO-DEMO1");
  const [submitting, setSubmitting] = useState(false);

  if (authState === "loading") return <main className="auth-loading" id="main-content"><span><Sparkles /></span><p>Preparing your private StayAI space</p></main>;
  if (authState === "authenticated") return <>{children}</>;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    await login(username, password);
    setSubmitting(false);
  };

  return (
    <main className="auth-page" id="main-content">
      <div className="auth-atmosphere" aria-hidden="true"><i /><i /><i /></div>
      <motion.section className="auth-card" initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7, ease: [0.16, 1, 0.3, 1] }}>
        <span className="auth-orb"><Sparkles /></span>
        <small>PRIVATE GUEST ACCESS</small>
        <h1>Your stay starts<br /><em>with a conversation.</em></h1>
        <p>Sign in to search, save and manage your demo reservations with StayAI.</p>
        <form onSubmit={submit}>
          <label>Account<input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" spellCheck={false} /></label>
          <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" /></label>
          {authError && <div className="auth-error" role="alert">{authError}</div>}
          <button disabled={submitting || !username || !password}>{submitting ? "Opening your stay..." : "Enter StayAI"}<LockKeyhole /></button>
        </form>
        <footer><span>DEMO ENVIRONMENT</span><span>PRIVATE BY DESIGN</span></footer>
      </motion.section>
    </main>
  );
}
