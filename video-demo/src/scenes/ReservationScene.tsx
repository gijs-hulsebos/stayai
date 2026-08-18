import React from 'react';
import {BadgeCheck, CalendarDays, Database, MapPin, ShieldCheck, Users} from 'lucide-react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {Brand, CaptionRail, Cursor, StatChip} from '../components';
import {fonts, palette, reveal, softScale} from '../theme';

export const ReservationScene: React.FC = () => {
  const frame = useCurrentFrame();
  const saved = frame > 112;
  const swap = interpolate(frame, [106, 128], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const panelIn = softScale(frame, 8);
  return <AbsoluteFill style={{background: palette.paper, color: palette.ink}}>
    <header style={{height: 86, display: 'flex', alignItems: 'center', padding: '0 70px', borderBottom: `1px solid ${palette.line}`}}><Brand compact /></header>
    <div style={{height: 994, display: 'grid', gridTemplateColumns: '44% 56%'}}>
      <section style={{position: 'relative', overflow: 'hidden'}}><Img src={staticFile('assets/hotel-lisbon-1.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} /><div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent, rgba(4,39,32,.82))'}} /><div style={{position: 'absolute', left: 62, right: 62, bottom: 62, color: palette.paper, ...reveal(frame, 4)}}><small style={{letterSpacing: '.17em', color: palette.lime}}>SELECTED STAY</small><h2 style={{fontFamily: fonts.serif, fontSize: 64, fontWeight: 430, lineHeight: .95, margin: '18px 0'}}>Bairro Alto<br />Hotel</h2><p style={{display: 'flex', gap: 8, alignItems: 'center'}}><MapPin size={17} /> Lisbon · Chiado</p></div></section>
      <section style={{padding: '58px 86px', position: 'relative'}}>
        {!saved ? <div style={{...panelIn, opacity: Number(panelIn.opacity) * (1 - swap)}}><small style={{color: palette.forest, fontWeight: 800, letterSpacing: '.16em'}}>REVIEW BEFORE SAVING</small><h2 style={{fontFamily: fonts.serif, fontSize: 64, fontWeight: 440, margin: '22px 0 13px'}}>Confirm your demo stay.</h2><p style={{fontSize: 18, color: '#657871', marginBottom: 34}}>A clear confirmation separates the internal demo record from a real hotel booking.</p><div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12}}><StatChip icon={<CalendarDays size={18} />} label="DATES" value="18—22 Sep 2026" /><StatChip icon={<Users size={18} />} label="PARTY" value="2 guests · 1 room" delay={6} /><StatChip label="RATE SOURCE" value="Xotelo partner" delay={10} /><StatChip label="QUOTED TOTAL" value="€1,376" delay={14} /></div><div style={{marginTop: 26, padding: 22, display: 'flex', gap: 16, background: '#edf2e9', borderLeft: `3px solid ${palette.lime}`}}><ShieldCheck color={palette.forest} /><p style={{margin: 0}}><strong style={{display: 'block'}}>Demonstration only</strong><span style={{color: '#63766f'}}>No payment, hotel confirmation or inventory hold is made.</span></p></div><button style={{height: 64, width: '100%', border: 0, background: palette.ink, color: palette.paper, marginTop: 24, fontWeight: 800}}>CREATE DEMO RESERVATION</button><Cursor x={820} y={615} clickAt={82} /></div> : <div style={{opacity: swap, paddingTop: 70, textAlign: 'center'}}><BadgeCheck size={74} strokeWidth={1.15} color={palette.forest} /><small style={{display: 'block', color: palette.forest, fontWeight: 800, letterSpacing: '.17em', marginTop: 25}}>SAVED TO MY STAY</small><h2 style={{fontFamily: fonts.serif, fontSize: 72, fontWeight: 430, margin: '24px 0 18px'}}>IO—7K4M2P</h2><p style={{fontSize: 19, color: '#64766f'}}>The reservation snapshot is now available across sessions.</p><div style={{width: 420, margin: '44px auto 0', display: 'flex', alignItems: 'center', gap: 20, padding: 22, border: `1px solid ${palette.line}`, textAlign: 'left'}}><Database size={34} color={palette.forest} /><div><small style={{letterSpacing: '.12em'}}>SUPABASE</small><strong style={{display: 'block', marginTop: 5}}>Reservation persisted</strong></div><BadgeCheck size={23} style={{marginLeft: 'auto'}} /></div></div>}
      </section>
    </div>
    <CaptionRail step="YOU" title="Review the dates, party, provider and total—then confirm." detail="RESULT — Supabase stores a clearly labelled demo reservation that remains available across sessions." delay={24} />
  </AbsoluteFill>;
};
