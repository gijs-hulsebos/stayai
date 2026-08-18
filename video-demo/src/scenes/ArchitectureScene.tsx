import React from 'react';
import {Bot, Boxes, Check, Database, GitBranch, Globe2, Hotel, ServerCog, ShieldCheck} from 'lucide-react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {CaptionRail, FlowArrow} from '../components';
import {fonts, palette, reveal} from '../theme';

const Node: React.FC<{icon: React.ReactNode; label: string; detail: string; delay: number; accent?: boolean}> = ({icon, label, detail, delay, accent}) => {
  const frame = useCurrentFrame();
  return <div style={{...reveal(frame, delay, 18), minHeight: 118, padding: '23px 24px', border: `1px solid ${accent ? palette.lime : palette.line}`, background: accent ? palette.deep : palette.paper, color: accent ? palette.paper : palette.ink, display: 'flex', gap: 16, alignItems: 'center'}}><span style={{width: 42, height: 42, display: 'grid', placeItems: 'center', borderRadius: 40, background: accent ? palette.lime : '#e7ede7', color: palette.ink}}>{icon}</span><div><strong style={{display: 'block', fontSize: 17}}>{label}</strong><small style={{display: 'block', marginTop: 6, color: accent ? palette.moss : '#6f817b', lineHeight: 1.35}}>{detail}</small></div></div>;
};

export const ArchitectureScene: React.FC = () => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{background: palette.cream, color: palette.ink, padding: '58px 76px'}}>
    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', ...reveal(frame, 2)}}><div><small style={{fontWeight: 800, letterSpacing: '.17em', color: palette.forest}}>HOW THE DEMO WORKS</small><h2 style={{fontFamily: fonts.serif, fontSize: 70, fontWeight: 430, lineHeight: .95, letterSpacing: '-.04em', margin: '22px 0 0'}}>One product.<br /><em>Clear responsibilities.</em></h2></div><p style={{width: 510, fontSize: 18, lineHeight: 1.55, color: '#60746e'}}>The browser stays focused on the guest. Secure server routes coordinate AI reasoning, hotel data and owner-scoped persistence.</p></div>
    <div style={{display: 'grid', gridTemplateColumns: '260px 44px 320px 44px 1fr', alignItems: 'center', gap: 8, marginTop: 56}}><Node icon={<Globe2 />} label="StayAI interface" detail="Next.js guest experience" delay={12} /><FlowArrow /><Node icon={<ServerCog />} label="Authenticated API" detail="Validation · timeouts · tool loop" delay={22} accent /><FlowArrow /><div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10}}><Node icon={<Bot />} label="OpenRouter" detail="Gemini primary · GPT fallback" delay={34} /><Node icon={<Hotel />} label="Xotelo" detail="Hotel metadata and current rates" delay={42} /><Node icon={<Database />} label="Supabase" detail="Auth · reservations · bookmarks" delay={50} /><Node icon={<ShieldCheck />} label="RLS" detail="Every row belongs to its owner" delay={58} /></div></div>
    <div style={{marginTop: 54, borderTop: `1px solid ${palette.line}`, paddingTop: 36}}><div style={{display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20}}><GitBranch color={palette.forest} /><strong style={{fontSize: 14, letterSpacing: '.13em'}}>DELIVERY PIPELINE</strong><span style={{color: '#71827d'}}>Pull request to production</span></div><div style={{display: 'grid', gridTemplateColumns: '1fr 46px 1fr 46px 1fr 46px 1fr', alignItems: 'center'}}><Node icon={<GitBranch />} label="GitHub" detail="Versioned product source" delay={76} /><FlowArrow /><Node icon={<Check />} label="CI checks" detail="Typecheck · build · review" delay={88} /><FlowArrow /><Node icon={<Boxes />} label="Vercel preview" detail="Every branch gets a URL" delay={100} /><FlowArrow /><Node icon={<Globe2 />} label="Production" detail="Merge triggers deployment" delay={112} accent /></div></div>
    <CaptionRail step="UNDER THE HOOD" title="One secure product connects the interface, AI, data and records." detail="DELIVERY — GitHub checks every branch; Vercel creates previews and deploys reviewed changes." delay={76} />
  </AbsoluteFill>;
};
