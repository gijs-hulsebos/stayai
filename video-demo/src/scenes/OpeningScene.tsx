import React from 'react';
import {ArrowDown} from 'lucide-react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Brand, Eyebrow, Film} from '../components';
import {fonts, palette, reveal} from '../theme';

export const OpeningScene: React.FC = () => {
  const frame = useCurrentFrame();
  const line = interpolate(frame, [28, 100], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{color: palette.paper}}>
    <Film dim={.4} zoom={1.01} />
    <header style={{position: 'absolute', top: 52, left: 76, right: 76, display: 'flex', alignItems: 'center', paddingBottom: 24, borderBottom: '1px solid rgba(255,255,255,.22)', ...reveal(frame, 6, 12)}}><Brand light /><div style={{marginLeft: 'auto', fontSize: 13, letterSpacing: '.1em'}}>STEP-BY-STEP PRODUCT DEMO · 2026</div></header>
    <main style={{position: 'absolute', left: 76, bottom: 128, width: 980}}>
      <div style={reveal(frame, 14)}><Eyebrow light>THE COMPLETE STAYAI WALKTHROUGH</Eyebrow></div>
      <h1 style={{fontFamily: fonts.serif, fontWeight: 420, fontSize: 124, lineHeight: .86, letterSpacing: '-.06em', margin: '42px 0 34px', ...reveal(frame, 24, 54)}}>One stay request.<br /><em style={{fontWeight: 340}}>Seven clear steps.</em></h1>
      <p style={{fontSize: 24, lineHeight: 1.45, width: 820, color: 'rgba(251,250,244,.78)', ...reveal(frame, 40)}}>Follow one guest from the first interaction to a saved reservation they can return to, cancel and reactivate.</p>
      <div style={{display: 'flex', gap: 12, marginTop: 28, ...reveal(frame, 52)}}>{['EXPERIENCE', 'SEARCH', 'CONFIRM', 'MANAGE'].map((label) => <span key={label} style={{border: '1px solid rgba(255,255,255,.28)', padding: '11px 14px', fontSize: 10, letterSpacing: '.13em'}}>{label}</span>)}</div>
    </main>
    <footer style={{position: 'absolute', left: 76, right: 76, bottom: 48, display: 'flex', alignItems: 'center', gap: 18, fontSize: 12, letterSpacing: '.15em', ...reveal(frame, 62, 12)}}><span style={{width: 54, height: 1, background: palette.paper, transformOrigin: 'left', transform: `scaleX(${line})`}} /><ArrowDown size={16} />START THE WALKTHROUGH<span style={{marginLeft: 'auto'}}>STAYAI · DEMONSTRATION</span></footer>
  </AbsoluteFill>;
};
