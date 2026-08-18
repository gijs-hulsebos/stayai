import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {CaptionRail, Eyebrow} from '../components';
import {fonts, palette, reveal} from '../theme';

const stages = [
  ['01', 'Arrival', '01-exterior.jpg'],
  ['02', 'Slow down', '02-jacuzzi.jpg'],
  ['03', 'Come inside', '03-fireplace.jpg'],
  ['04', 'Gather', '04-dining.jpg'],
  ['05', 'Settle in', '05-bedroom.jpg'],
] as const;

export const JourneyScene: React.FC = () => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{background: palette.cream, padding: '58px 70px 52px', color: palette.ink}}>
    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', ...reveal(frame, 4)}}><div><Eyebrow>THE EXPERIENCE</Eyebrow><h2 style={{fontFamily: fonts.serif, fontWeight: 430, fontSize: 74, lineHeight: .95, letterSpacing: '-.045em', margin: '24px 0 0'}}>A property journey,<br /><em>directed by your scroll.</em></h2></div><p style={{width: 410, fontSize: 18, lineHeight: 1.5, color: '#5f746e'}}>Five visual chapters move from the landscape into the home—giving the product a memorable, tactile first impression.</p></div>
    <div style={{height: 600, marginTop: 46, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12}}>
      {stages.map(([index, label, image], i) => {
        const p = interpolate(frame, [12 + i * 7, 40 + i * 7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
        return <div key={label} style={{position: 'relative', overflow: 'hidden', borderRadius: i === 2 ? 170 : 6, opacity: p, transform: `translateY(${(1 - p) * 28}px)`, boxShadow: '0 22px 55px rgba(8,47,39,.12)'}}>
          <Img src={staticFile(`assets/${image}`)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.06 - p * .06})`}} />
          <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 48%, rgba(2,30,24,.76))'}} />
          <small style={{position: 'absolute', left: 22, top: 20, color: palette.paper, letterSpacing: '.16em'}}>{index}</small><strong style={{position: 'absolute', left: i === 2 ? 0 : 22, right: i === 2 ? 0 : undefined, textAlign: i === 2 ? 'center' : 'left', bottom: 22, color: palette.paper, fontFamily: fonts.serif, fontSize: 28, fontWeight: 500}}>{label}</strong>
        </div>;
      })}
    </div>
    <CaptionRail step="YOU" title="Scroll through the property, from arrival to bedroom." detail="RESULT — The product begins with a memorable experience before asking for trip details." delay={36} />
  </AbsoluteFill>;
};
