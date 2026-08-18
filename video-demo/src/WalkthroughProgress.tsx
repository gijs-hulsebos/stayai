import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {fonts, palette} from './theme';

const phases = [
  {from: 350, to: 558, step: 1, label: 'Enter the experience'},
  {from: 558, to: 784, step: 2, label: 'Sign in securely'},
  {from: 784, to: 1070, step: 3, label: 'Describe the stay'},
  {from: 1070, to: 1296, step: 4, label: 'StayAI searches safely'},
  {from: 1296, to: 1582, step: 5, label: 'Compare current stays'},
  {from: 1582, to: 1838, step: 6, label: 'Confirm the demo stay'},
  {from: 1838, to: 2094, step: 7, label: 'Manage My Stay'},
] as const;

export const WalkthroughProgress: React.FC = () => {
  const frame = useCurrentFrame();
  const phase = phases.find(({from, to}) => frame >= from && frame < to);
  const underTheHood = frame >= 2094 && frame < 2350;
  if (!phase && !underTheHood) return null;

  const from = phase?.from ?? 2094;
  const to = phase?.to ?? 2350;
  const opacity = interpolate(frame, [from, from + 9, to - 12, to], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const progress = phase ? phase.step / phases.length : 1;

  return <div style={{position: 'absolute', left: 0, right: 0, top: 14, zIndex: 80, display: 'flex', justifyContent: 'center', opacity, pointerEvents: 'none'}}>
    <div style={{position: 'relative', minWidth: 520, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, padding: '0 24px', background: 'rgba(3,40,32,.94)', color: palette.paper, border: '1px solid rgba(200,255,125,.34)', boxShadow: '0 12px 34px rgba(3,40,32,.16)'}}>
      <small style={{fontSize: 9, fontWeight: 800, letterSpacing: '.16em', color: palette.lime}}>{phase ? `STEP ${phase.step} OF ${phases.length}` : 'UNDER THE HOOD'}</small>
      <i style={{width: 34, height: 1, background: 'rgba(255,255,255,.32)'}} />
      <strong style={{fontFamily: fonts.serif, fontSize: 17, fontWeight: 480}}>{phase?.label ?? 'How the demo is built and deployed'}</strong>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: -4, height: 3, background: 'rgba(3,40,32,.16)'}}><div style={{height: '100%', width: `${progress * 100}%`, background: palette.lime}} /></div>
    </div>
  </div>;
};
