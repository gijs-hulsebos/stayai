import {Easing, interpolate, spring} from 'remotion';

export const palette = {
  ink: '#082f27',
  deep: '#063a30',
  forest: '#0b4b3d',
  cream: '#f4f2e9',
  paper: '#fbfaf4',
  lime: '#c8ff7d',
  moss: '#8fa79f',
  line: 'rgba(8,47,39,.18)',
  rust: '#934929',
};

export const fonts = {
  sans: 'Instrument Sans Variable, Arial, sans-serif',
  serif: 'Newsreader Variable, Georgia, serif',
};

export const ease = Easing.bezier(0.16, 1, 0.3, 1);

export function reveal(frame: number, delay = 0, distance = 34) {
  const progress = interpolate(frame, [delay, delay + 22], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });
  return {opacity: progress, transform: `translateY(${(1 - progress) * distance}px)`};
}

export function softScale(frame: number, delay = 0) {
  const value = spring({frame: Math.max(0, frame - delay), fps: 30, config: {damping: 24, stiffness: 90, mass: 1.1}});
  return {opacity: value, transform: `scale(${0.965 + value * 0.035})`};
}

export function sceneExit(frame: number, duration: number) {
  return interpolate(frame, [duration - 16, duration], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
}
