import React from 'react';
import {ArrowDown, Bot, Check, Database, Hotel, Search, ShieldCheck, Sparkles} from 'lucide-react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {CaptionRail, FlowArrow} from '../components';
import {fonts, palette, reveal} from '../theme';

const Tool: React.FC<{icon: React.ReactNode; title: string; detail: string; delay: number}> = ({icon, title, detail, delay}) => {
  const frame = useCurrentFrame();
  return <div style={{...reveal(frame, delay, 18), border: `1px solid ${palette.line}`, background: palette.paper, padding: '22px 24px', display: 'flex', alignItems: 'center', gap: 15}}><span style={{width: 42, height: 42, display: 'grid', placeItems: 'center', borderRadius: 50, background: '#e7eee8', color: palette.forest}}>{icon}</span><div><strong style={{display: 'block'}}>{title}</strong><small style={{display: 'block', marginTop: 5, color: '#6c7e78'}}>{detail}</small></div></div>;
};

export const AgentScene: React.FC = () => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [25, 175], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{background: palette.cream, color: palette.ink, padding: '62px 78px 130px'}}>
    <div style={{display: 'grid', gridTemplateColumns: '520px 1fr', gap: 80, alignItems: 'center', height: '100%'}}>
      <section style={reveal(frame, 4)}><small style={{fontWeight: 800, letterSpacing: '.16em', color: palette.forest}}>WHAT STAYAI DOES NEXT</small><h2 style={{fontFamily: fonts.serif, fontSize: 72, lineHeight: .95, fontWeight: 430, letterSpacing: '-.045em', margin: '28px 0 24px'}}>The AI chooses the action.<br /><em>Trusted tools supply the facts.</em></h2><p style={{fontSize: 19, lineHeight: 1.55, color: '#5f736d'}}>OpenRouter interprets the completed brief. Authenticated server tools then perform hotel searches, rate checks and reservation actions with validated inputs.</p><div style={{marginTop: 32, padding: 20, borderLeft: `3px solid ${palette.lime}`, background: '#e9eee7', display: 'flex', gap: 14}}><ShieldCheck color={palette.forest} /><span><strong style={{display: 'block'}}>The model cannot invent inventory</strong><small style={{color: '#687a74'}}>Hotel, rate and account facts come from trusted tools</small></span></div></section>
      <section style={{position: 'relative', height: 690}}>
        <div style={{position: 'absolute', left: 0, top: 0, right: 0, height: 104, border: `1px solid ${palette.line}`, background: palette.paper, display: 'flex', alignItems: 'center', padding: '0 30px', gap: 18, ...reveal(frame, 12)}}><span style={{width: 48, height: 48, borderRadius: 50, background: palette.deep, color: palette.lime, display: 'grid', placeItems: 'center'}}><Bot /></span><div><small style={{letterSpacing: '.14em', color: palette.moss}}>PRIMARY / FALLBACK</small><strong style={{display: 'block', fontFamily: fonts.serif, fontSize: 24}}>Gemini through OpenRouter → GPT fallback</strong></div><i style={{marginLeft: 'auto', width: 120, height: 4, background: '#dfe7df', overflow: 'hidden'}}><b style={{display: 'block', width: `${progress * 100}%`, height: '100%', background: palette.lime}} /></i></div>
        <div style={{position: 'absolute', top: 124, left: '50%', width: 1, height: 36, background: palette.moss}} /><ArrowDown style={{position: 'absolute', top: 145, left: 'calc(50% - 12px)', color: palette.moss}} />
        <div style={{position: 'absolute', top: 184, left: 0, right: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12}}><Tool icon={<Search />} title="Destination lookup" detail="Resolve Lisbon to provider keys" delay={34} /><Tool icon={<Hotel />} title="Hotel and rate search" detail="Current Xotelo data" delay={50} /><Tool icon={<Database />} title="Reservation tools" detail="List · create · cancel · reactivate" delay={66} /><Tool icon={<Check />} title="Bookmark tools" detail="Save and remove properties" delay={82} /></div>
        <div style={{position: 'absolute', top: 430, left: '50%', width: 1, height: 36, background: palette.moss}} /><ArrowDown style={{position: 'absolute', top: 452, left: 'calc(50% - 12px)', color: palette.moss}} />
        <div style={{position: 'absolute', left: 70, right: 70, bottom: 0, minHeight: 160, padding: '26px 30px', background: palette.deep, color: palette.paper, ...reveal(frame, 102)}}><small style={{color: palette.lime, letterSpacing: '.15em', fontWeight: 800}}>STRUCTURED RESPONSE</small><p style={{fontFamily: fonts.serif, fontSize: 25, lineHeight: 1.28, margin: '17px 0 12px'}}>“I found three design-led stays in Lisbon. Here are the strongest matches for your dates.”</p><span style={{fontSize: 12, color: palette.moss}}><Sparkles size={14} style={{verticalAlign: 'middle', marginRight: 7}} />Mode: hotel_results · Requested fields: none</span></div>
      </section>
    </div>
    <CaptionRail step="STAYAI" title="Turn the completed brief into safe, authenticated tool calls." detail="RESULT — A structured response built from current hotel data instead of invented facts." />
  </AbsoluteFill>;
};
