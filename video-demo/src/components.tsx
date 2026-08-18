import React, {type ReactNode} from 'react';
import {ArrowRight, Sparkles} from 'lucide-react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {Video} from '@remotion/media';
import {fonts, palette, reveal} from './theme';

export const base: React.CSSProperties = {
  fontFamily: fonts.sans,
  color: palette.ink,
  background: palette.cream,
};

export const Brand: React.FC<{light?: boolean; compact?: boolean}> = ({light, compact}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 14, color: light ? palette.paper : palette.ink}}>
    <div style={{width: compact ? 38 : 48, height: compact ? 38 : 48, background: 'currentColor', clipPath: 'polygon(50% 0, 94% 24%, 94% 76%, 50% 100%, 6% 76%, 6% 24%)', display: 'grid', placeItems: 'center'}}>
      <div style={{width: '46%', height: '46%', border: `2px solid ${light ? palette.ink : palette.paper}`, transform: 'rotate(45deg)', borderRadius: 4}} />
    </div>
    <div><strong style={{fontSize: compact ? 20 : 26, letterSpacing: '-.04em'}}>StayAI</strong><small style={{display: 'block', fontSize: compact ? 7 : 9, letterSpacing: '.24em', marginTop: 1}}>GUEST SERVICE</small></div>
  </div>
);

export const Film: React.FC<{startFrom?: number; image?: string; dim?: number; zoom?: number}> = ({startFrom = 0, image, dim = .34, zoom = 1}) => {
  const frame = useCurrentFrame();
  const scale = zoom + interpolate(frame, [0, 300], [0, .035], {extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{overflow: 'hidden', background: palette.deep}}>
    {image ? <Img src={staticFile(`assets/${image}`)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${scale})`}} /> : <Video src={staticFile('assets/stayai-walkthrough.mp4')} trimBefore={startFrom} muted style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${scale})`}} />}
    <AbsoluteFill style={{background: `linear-gradient(90deg, rgba(2,24,20,${Math.min(.8, dim + .25)}) 0%, rgba(2,24,20,${dim}) 52%, rgba(2,24,20,${Math.max(.08, dim - .2)}) 100%)`}} />
    <AbsoluteFill style={{boxShadow: 'inset 0 0 180px rgba(0,0,0,.34)'}} />
  </AbsoluteFill>;
};

export const Eyebrow: React.FC<{children: ReactNode; light?: boolean}> = ({children, light}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 16, color: light ? palette.lime : palette.forest, fontSize: 14, fontWeight: 700, letterSpacing: '.18em'}}><i style={{display: 'block', width: 46, height: 1, background: 'currentColor'}} />{children}</div>
);

export const Browser: React.FC<{children: ReactNode; dark?: boolean; style?: React.CSSProperties}> = ({children, dark, style}) => (
  <div style={{borderRadius: 24, overflow: 'hidden', boxShadow: '0 50px 120px rgba(3,34,27,.22)', border: `1px solid ${dark ? 'rgba(255,255,255,.15)' : palette.line}`, background: dark ? palette.deep : palette.paper, ...style}}>
    <div style={{height: 72, display: 'flex', alignItems: 'center', borderBottom: `1px solid ${dark ? 'rgba(255,255,255,.13)' : palette.line}`, padding: '0 28px', color: dark ? palette.paper : palette.ink}}>
      <div style={{display: 'flex', gap: 9, marginRight: 25}}>{['#bc6f55', '#d1a35b', '#789a7d'].map((c) => <i key={c} style={{width: 10, height: 10, borderRadius: 20, background: c}} />)}</div>
      <Brand light={dark} compact />
      <div style={{marginLeft: 'auto', display: 'flex', gap: 40, fontSize: 14, opacity: .76}}><span>My Stay</span><b>Assistant</b><span>Explore</span></div>
      <div style={{marginLeft: 60, width: 34, height: 34, borderRadius: 40, display: 'grid', placeItems: 'center', background: dark ? palette.lime : palette.ink, color: dark ? palette.ink : palette.paper, fontSize: 9, fontWeight: 800}}>IO</div>
    </div>
    {children}
  </div>
);

export const Cursor: React.FC<{x: number; y: number; clickAt?: number}> = ({x, y, clickAt = 35}) => {
  const frame = useCurrentFrame();
  const click = interpolate(frame, [clickAt, clickAt + 4, clickAt + 9], [1, .72, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const ring = interpolate(frame, [clickAt + 3, clickAt + 18], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <div style={{position: 'absolute', left: x, top: y, transform: `scale(${click})`, zIndex: 20}}>
    <div style={{position: 'absolute', inset: -18, border: `2px solid ${palette.lime}`, borderRadius: 50, opacity: 1 - ring, transform: `scale(${.5 + ring})`}} />
    <div style={{width: 24, height: 30, background: palette.paper, clipPath: 'polygon(0 0, 78% 68%, 48% 66%, 36% 100%, 24% 94%, 37% 62%, 0 76%)', filter: 'drop-shadow(0 4px 7px rgba(0,0,0,.4))'}} />
  </div>;
};

export const StatChip: React.FC<{icon?: ReactNode; label: string; value: string; delay?: number}> = ({icon = <Sparkles size={15} />, label, value, delay = 0}) => {
  const frame = useCurrentFrame();
  return <div style={{...reveal(frame, delay, 14), display: 'flex', alignItems: 'center', gap: 13, padding: '15px 18px', border: `1px solid ${palette.line}`, background: 'rgba(251,250,244,.92)'}}>{icon}<div><small style={{display: 'block', fontSize: 9, letterSpacing: '.15em', color: palette.moss}}>{label}</small><strong style={{fontFamily: fonts.serif, fontSize: 20, fontWeight: 500}}>{value}</strong></div></div>;
};

export const FlowArrow: React.FC = () => <div style={{display: 'grid', placeItems: 'center', color: palette.moss}}><ArrowRight size={28} strokeWidth={1.4} /></div>;

export const ChapterBadge: React.FC<{number: string; label: string; light?: boolean; placement?: 'corner' | 'browser-strip'}> = ({number, label, light, placement = 'corner'}) => {
  const frame = useCurrentFrame();
  const inset = placement === 'browser-strip' ? {left: 76, top: 16} : {right: 76, top: 48};
  return <div style={{...reveal(frame, 3, 10), position: 'absolute', ...inset, zIndex: 30, display: 'flex', alignItems: 'center', gap: 14, color: light ? palette.paper : palette.ink}}><span style={{fontFamily: fonts.serif, fontSize: 28}}>{number}</span><i style={{width: 42, height: 1, background: 'currentColor', opacity: .45}} /><small style={{fontSize: 10, fontWeight: 760, letterSpacing: '.16em'}}>{label}</small></div>;
};

export const Explainer: React.FC<{kicker: string; title: string; body: string; light?: boolean; align?: 'left' | 'right'; delay?: number; width?: number}> = ({kicker, title, body, light, align = 'left', delay = 0, width = 480}) => {
  const frame = useCurrentFrame();
  return <div style={{...reveal(frame, delay, 24), width, textAlign: align, color: light ? palette.paper : palette.ink}}><small style={{display: 'block', color: light ? palette.lime : palette.forest, fontWeight: 780, letterSpacing: '.16em', marginBottom: 12}}>{kicker}</small><strong style={{display: 'block', fontFamily: fonts.serif, fontWeight: 460, fontSize: 36, lineHeight: 1.05}}>{title}</strong><p style={{margin: '13px 0 0', color: light ? 'rgba(251,250,244,.7)' : '#64766f', fontSize: 16, lineHeight: 1.5}}>{body}</p></div>;
};

export const CaptionRail: React.FC<{step: string; title: string; detail: string; light?: boolean; delay?: number}> = ({step, title, detail, light, delay = 0}) => {
  const frame = useCurrentFrame();
  return <div style={{...reveal(frame, delay, 16), position: 'absolute', left: 76, right: 76, bottom: 38, zIndex: 40, minHeight: 70, display: 'grid', gridTemplateColumns: '110px 390px 1fr', alignItems: 'center', gap: 22, padding: '16px 22px', background: light ? 'rgba(4,40,33,.86)' : 'rgba(251,250,244,.94)', color: light ? palette.paper : palette.ink, border: `1px solid ${light ? 'rgba(255,255,255,.18)' : palette.line}`, backdropFilter: 'blur(16px)'}}><small style={{color: light ? palette.lime : palette.forest, fontWeight: 800, letterSpacing: '.15em'}}>{step}</small><strong style={{fontFamily: fonts.serif, fontSize: 22, lineHeight: 1.04, fontWeight: 470}}>{title}</strong><span style={{fontSize: 14, lineHeight: 1.35, color: light ? 'rgba(251,250,244,.66)' : '#657771'}}>{detail}</span></div>;
};
