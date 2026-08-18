import React from 'react';
import {ArrowRight, BadgeCheck, Bookmark, MessageCircle} from 'lucide-react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Brand, Eyebrow, Film} from '../components';
import {fonts, palette, reveal} from '../theme';

export const ClosingScene: React.FC = () => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{color: palette.paper}}>
    <Film image="05-bedroom.jpg" dim={.48} zoom={1.01} />
    <header style={{position: 'absolute', top: 52, left: 76}}><Brand light /></header>
    <div style={{position: 'absolute', left: 82, top: 250, width: 1120}}><div style={reveal(frame, 4)}><Eyebrow light>THE WALKTHROUGH IS COMPLETE</Eyebrow></div><h2 style={{fontFamily: fonts.serif, fontWeight: 420, fontSize: 92, lineHeight: .92, letterSpacing: '-.05em', margin: '38px 0 30px', ...reveal(frame, 14, 45)}}>Seven steps.<br /><em>One connected product.</em></h2><p style={{width: 820, fontSize: 22, lineHeight: 1.5, color: 'rgba(251,250,244,.74)', ...reveal(frame, 29)}}>The guest entered, signed in, described the trip, compared current matches, confirmed a demo stay and returned to manage it.</p><div style={{display: 'flex', gap: 14, marginTop: 42, ...reveal(frame, 44)}}>{[[<MessageCircle />, 'CURRENT DATA'], [<Bookmark />, 'EXPLICIT CONFIRMATION'], [<BadgeCheck />, 'MANAGEABLE RECORDS']].map(([icon, label]) => <span key={label as string} style={{display: 'flex', alignItems: 'center', gap: 10, border: '1px solid rgba(255,255,255,.28)', padding: '13px 16px', fontSize: 11, letterSpacing: '.12em'}}>{icon}{label}</span>)}</div></div>
    <div style={{position: 'absolute', right: 82, bottom: 70, textAlign: 'right', ...reveal(frame, 58)}}><small style={{display: 'block', color: palette.lime, letterSpacing: '.17em', marginBottom: 12}}>DEMO RESERVATIONS ONLY · NO PAYMENT OR INVENTORY HOLD</small><strong style={{fontFamily: fonts.serif, fontWeight: 450, fontSize: 34}}>StayAI <ArrowRight size={23} style={{verticalAlign: 'middle'}} /></strong></div>
  </AbsoluteFill>;
};
