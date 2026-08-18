import React from 'react';
import {ArrowRight, Bookmark, Heart, MapPin, Star} from 'lucide-react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {Browser, CaptionRail, Cursor} from '../components';
import {fonts, palette, reveal} from '../theme';

const hotels = [
  {name: 'Bairro Alto Hotel', place: 'Lisbon · Chiado', rating: '4.7', price: '€344', image: 'hotel-lisbon-1.jpg', reason: 'A calm design address with the city at your door.'},
  {name: 'Memmo Príncipe Real', place: 'Lisbon · Príncipe Real', rating: '4.6', price: '€298', image: 'hotel-lisbon-2.jpg', reason: 'Intimate rooms, thoughtful service and a quieter setting.'},
  {name: 'Four Seasons Ritz', place: 'Lisbon · Marquês', rating: '4.8', price: '€612', image: 'hotel-lisbon-3.jpg', reason: 'Grand hospitality, exceptional wellness and park views.'},
];

export const DiscoveryScene: React.FC = () => {
  const frame = useCurrentFrame();
  const active = Math.min(2, Math.floor(frame / 86));
  return <AbsoluteFill style={{background: '#dae3dc', padding: 58}}>
    <Browser style={{height: '100%'}}>
      <div style={{height: 894, background: palette.cream, padding: '48px 58px'}}>
        <div style={{display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', ...reveal(frame, 3)}}><div><small style={{letterSpacing: '.15em', fontWeight: 750, color: palette.forest}}>CURATED FROM CURRENT HOTEL DATA</small><h2 style={{fontFamily: fonts.serif, fontWeight: 430, fontSize: 54, margin: '13px 0 0'}}>Three stays for Lisbon.</h2></div><div style={{display: 'flex', gap: 14}}><span style={{border: `1px solid ${palette.line}`, padding: '12px 17px', borderRadius: 40}}><MapPin size={15} style={{verticalAlign: 'middle', marginRight: 7}} />Lisbon</span><span style={{border: `1px solid ${palette.line}`, padding: '12px 17px', borderRadius: 40}}>18—22 Sep · 2 guests</span></div></div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18, marginTop: 32}}>{hotels.map((hotel, i) => {
          const p = interpolate(frame, [12 + i * 10, 38 + i * 10], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
          return <article key={hotel.name} style={{background: palette.paper, border: `1px solid ${active === i ? palette.forest : palette.line}`, boxShadow: active === i ? '0 24px 60px rgba(8,47,39,.16)' : 'none', opacity: p, transform: `translateY(${(1 - p) * 26 + (active === i ? -8 : 0)}px)`, overflow: 'hidden'}}><div style={{height: 310, position: 'relative', overflow: 'hidden'}}><Img src={staticFile(`assets/${hotel.image}`)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${active === i ? 1.04 : 1})`}} /><button style={{position: 'absolute', right: 17, top: 17, width: 42, height: 42, borderRadius: 40, border: 0, background: 'rgba(251,250,244,.9)', color: i === 1 && frame > 120 ? palette.rust : palette.ink}}><Heart size={18} fill={i === 1 && frame > 120 ? 'currentColor' : 'none'} /></button><span style={{position: 'absolute', left: 18, bottom: 18, color: palette.paper, background: 'rgba(4,42,34,.78)', padding: '8px 11px', fontSize: 12}}><Star size={13} fill="currentColor" style={{verticalAlign: 'middle', marginRight: 6}} />{hotel.rating}</span></div><div style={{padding: 24}}><small style={{fontSize: 10, letterSpacing: '.12em', color: palette.moss}}>{hotel.place}</small><h3 style={{fontFamily: fonts.serif, fontSize: 31, fontWeight: 470, margin: '10px 0 12px'}}>{hotel.name}</h3><p style={{height: 46, margin: 0, color: '#667a74', lineHeight: 1.45}}>{hotel.reason}</p><div style={{borderTop: `1px solid ${palette.line}`, marginTop: 22, paddingTop: 17, display: 'flex', alignItems: 'center'}}><div><small style={{display: 'block', letterSpacing: '.12em'}}>FROM</small><strong style={{fontFamily: fonts.serif, fontSize: 29, fontWeight: 500}}>{hotel.price}</strong><span> / night</span></div><button style={{marginLeft: 'auto', border: 0, background: palette.forest, color: palette.paper, padding: '14px 18px'}}>Reserve <ArrowRight size={15} style={{verticalAlign: 'middle'}} /></button></div></div></article>;
        })}</div>
        <footer style={{marginTop: 24, display: 'flex', justifyContent: 'space-between', color: palette.moss, fontSize: 11}}><span>Hotel details and rates sourced from Xotelo</span><span>Quotes are time-stamped · No inventory is invented</span></footer>
      </div>
    </Browser>
    {frame > 72 && frame < 140 && <Cursor x={986} y={326} clickAt={96} />}{frame > 176 && frame < 246 && <Cursor x={1720} y={814} clickAt={201} />}
    <CaptionRail step="YOU" title="Compare the strongest matches, then save or reserve one." detail="STAYAI — Each card combines sourced imagery, rating, current quote, match reason and clear actions." delay={28} />
  </AbsoluteFill>;
};
