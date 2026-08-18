import React from 'react';
import {ArrowRight, BadgeCheck, Home, Hotel, LockKeyhole, MessageCircle, RefreshCw, Search} from 'lucide-react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Eyebrow} from '../components';
import {fonts, palette, reveal} from '../theme';

const steps = [
  {title: 'Experience', detail: 'Enter through the property story', icon: <Home />},
  {title: 'Sign in', detail: 'Open a private guest workspace', icon: <LockKeyhole />},
  {title: 'Describe', detail: 'Say what kind of stay you want', icon: <MessageCircle />},
  {title: 'Search', detail: 'StayAI gathers current hotel data', icon: <Search />},
  {title: 'Compare', detail: 'Review useful, sourced matches', icon: <Hotel />},
  {title: 'Confirm', detail: 'Approve the demo reservation', icon: <BadgeCheck />},
  {title: 'Manage', detail: 'Return, cancel or reactivate', icon: <RefreshCw />},
] as const;

export const PurposeScene: React.FC = () => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{background: palette.cream, color: palette.ink, padding: '66px 78px'}}>
    <div style={reveal(frame, 4)}><Eyebrow>THE WALKTHROUGH</Eyebrow></div>
    <div style={{display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 34}}>
      <h1 style={{fontFamily: fonts.serif, fontWeight: 430, fontSize: 82, lineHeight: .93, letterSpacing: '-.048em', margin: 0, maxWidth: 1050, ...reveal(frame, 12, 40)}}>One guest.<br /><em>One complete journey.</em></h1>
      <p style={{fontSize: 21, lineHeight: 1.5, color: '#60736d', width: 570, margin: '0 0 7px', ...reveal(frame, 22)}}>We will follow the product in order—from the first interaction to a reservation the guest can return to and manage.</p>
    </div>
    <div style={{position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 10, marginTop: 64}}>
      <div style={{position: 'absolute', left: 34, right: 34, top: 46, height: 1, background: palette.line}} />
      {steps.map((step, index) => <article key={step.title} style={{position: 'relative', minHeight: 300, padding: '26px 22px', border: `1px solid ${index === 0 ? palette.lime : palette.line}`, background: index === 0 ? palette.deep : palette.paper, color: index === 0 ? palette.paper : palette.ink, ...reveal(frame, 28 + index * 8, 18)}}>
        <div style={{position: 'relative', zIndex: 2, width: 42, height: 42, display: 'grid', placeItems: 'center', borderRadius: 50, background: index === 0 ? palette.lime : '#e7ede7', color: palette.ink}}>{React.cloneElement(step.icon, {size: 19})}</div>
        <small style={{display: 'block', marginTop: 56, color: index === 0 ? palette.lime : palette.forest, fontWeight: 800, letterSpacing: '.16em'}}>0{index + 1}</small>
        <strong style={{display: 'block', fontFamily: fonts.serif, fontSize: 27, fontWeight: 480, marginTop: 14}}>{step.title}</strong>
        <p style={{fontSize: 14, lineHeight: 1.45, color: index === 0 ? 'rgba(251,250,244,.66)' : '#687a74', margin: '12px 0 0'}}>{step.detail}</p>
      </article>)}
    </div>
    <div style={{position: 'absolute', right: 80, bottom: 40, display: 'flex', gap: 14, alignItems: 'center', fontSize: 12, letterSpacing: '.13em', color: palette.forest, ...reveal(frame, 94)}}>NEXT: ENTER THE STAYAI EXPERIENCE <ArrowRight size={18} /></div>
  </AbsoluteFill>;
};
