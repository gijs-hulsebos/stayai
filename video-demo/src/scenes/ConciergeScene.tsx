import React from 'react';
import {CalendarDays, Check, MapPin, Minus, Plus, Send, Sparkles, Users} from 'lucide-react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Browser, CaptionRail, Cursor} from '../components';
import {fonts, palette, reveal} from '../theme';

const status = ['Understanding your request', 'Finding the location', 'Searching current stays'];

export const ConciergeScene: React.FC = () => {
  const frame = useCurrentFrame();
  const response = interpolate(frame, [78, 102], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{background: '#dfe7e0', padding: 58}}>
    <Browser style={{height: '100%'}}>
      <div style={{height: 894, display: 'grid', gridTemplateColumns: '1fr 450px'}}>
        <section style={{position: 'relative', padding: '55px 70px', background: palette.cream, overflow: 'hidden'}}>
          <div style={{...reveal(frame, 4), textAlign: 'right'}}><span style={{display: 'inline-block', background: palette.forest, color: palette.paper, borderRadius: '22px 22px 2px 22px', padding: '17px 22px', fontSize: 18}}>A quiet design hotel in Lisbon for two.</span></div>
          <div style={{marginTop: 40, display: 'grid', gridTemplateColumns: '44px 1fr', gap: 18, opacity: frame < 98 ? 1 : 1 - response}}><span style={{width: 44, height: 44, borderRadius: 40, display: 'grid', placeItems: 'center', background: palette.ink, color: palette.lime}}><Sparkles size={18} /></span><div style={{padding: '18px 0'}}>{status.map((s, i) => <div key={s} style={{display: 'flex', gap: 13, alignItems: 'center', marginBottom: 16, color: frame > 42 + i * 17 ? palette.ink : palette.moss, fontSize: 16, ...reveal(frame, 18 + i * 17, 8)}}><i style={{width: 20, height: 20, border: `1px solid ${frame > 46 + i * 17 ? palette.lime : palette.moss}`, background: frame > 46 + i * 17 ? palette.forest : 'transparent', color: palette.lime, borderRadius: 20, display: 'grid', placeItems: 'center'}}>{frame > 46 + i * 17 && <Check size={12} />}</i>{s}</div>)}</div></div>
          <div style={{opacity: response, transform: `translateY(${(1 - response) * 20}px)`, marginTop: -138, marginLeft: 60, width: 820}}><small style={{color: palette.forest, fontWeight: 750, letterSpacing: '.16em'}}>YOUR BRIEF IS ALMOST READY</small><h2 style={{fontFamily: fonts.serif, fontSize: 48, fontWeight: 460, lineHeight: 1.05, margin: '18px 0'}}>Lisbon, design-led and quiet.<br />Which dates work for you?</h2><p style={{fontSize: 17, color: '#5d716b'}}>StayAI requests only the missing detail—then turns the brief into a structured search.</p><div style={{marginTop: 26, padding: 24, background: palette.paper, border: `1px solid ${palette.line}`}}><div style={{display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18}}><CalendarDays size={20} /><strong>Travel dates</strong></div><div style={{display: 'grid', gridTemplateColumns: '1fr 40px 1fr', alignItems: 'center', gap: 12}}><div style={{padding: 15, border: `1px solid ${palette.line}`}}><small>CHECK-IN</small><b style={{display: 'block', marginTop: 6}}>18 September 2026</b></div><div style={{textAlign: 'center'}}>→</div><div style={{padding: 15, border: `1px solid ${palette.line}`}}><small>CHECK-OUT</small><b style={{display: 'block', marginTop: 6}}>22 September 2026</b></div></div></div></div>
          <div style={{position: 'absolute', bottom: 34, left: 70, right: 70}}><small style={{display: 'block', fontSize: 9, fontWeight: 700, letterSpacing: '.16em', marginBottom: 10}}>ASK STAYAI</small><div style={{height: 72, border: `1px solid ${palette.line}`, borderRadius: 60, background: palette.paper, display: 'flex', alignItems: 'center', padding: '0 12px 0 22px', gap: 14, color: palette.moss}}><Sparkles size={20} /><span style={{fontFamily: fonts.serif, fontSize: 19}}>Describe the stay you have in mind…</span><span style={{marginLeft: 'auto', width: 50, height: 50, borderRadius: 50, display: 'grid', placeItems: 'center', background: palette.moss, color: palette.paper}}><Send size={20} /></span></div></div>
        </section>
        <aside style={{background: palette.deep, color: palette.paper, padding: '48px 42px', position: 'relative'}}>
          <small style={{color: palette.lime, fontWeight: 750, letterSpacing: '.16em'}}>BUILD YOUR SEARCH</small><h3 style={{fontFamily: fonts.serif, fontSize: 38, fontWeight: 460, margin: '20px 0 34px'}}>Your trip brief</h3>
          {[['Destination', 'Lisbon', <MapPin />], ['Dates', '18—22 Sep', <CalendarDays />], ['Party', '2 guests · 1 room', <Users />]].map(([label, value, icon], i) => <div key={label as string} style={{display: 'grid', gridTemplateColumns: '34px 1fr', gap: 12, padding: '21px 0', borderTop: '1px solid rgba(255,255,255,.15)', ...reveal(frame, 24 + i * 12, 10)}}><span style={{color: palette.lime}}>{icon}</span><div><small style={{letterSpacing: '.12em', color: palette.moss}}>{label as string}</small><strong style={{display: 'block', fontFamily: fonts.serif, fontSize: 24, fontWeight: 450, marginTop: 6}}>{value as string}</strong></div></div>)}
          <div style={{marginTop: 22}}><small style={{color: palette.moss, letterSpacing: '.14em'}}>QUICK SELECT</small><div style={{display: 'flex', gap: 8, marginTop: 13}}>{['For two', 'Weekend', 'Quiet'].map((x) => <span key={x} style={{border: '1px solid rgba(255,255,255,.22)', padding: '10px 12px', borderRadius: 30, fontSize: 12}}>{x} <Plus size={12} style={{verticalAlign: 'middle'}} /></span>)}</div></div>
          <button style={{position: 'absolute', left: 42, right: 42, bottom: 38, height: 60, background: palette.lime, color: palette.ink, border: 0, fontWeight: 800}}>SEARCH STAYS</button>
        </aside>
      </div>
    </Browser>
    {frame > 124 && frame < 190 && <Cursor x={1572} y={894} clickAt={148} />}
    <CaptionRail step="YOU" title="Describe the stay naturally, then complete only what is missing." detail="STAYAI — The conversation becomes an editable brief: destination, dates, party and preferences." delay={20} />
  </AbsoluteFill>;
};
