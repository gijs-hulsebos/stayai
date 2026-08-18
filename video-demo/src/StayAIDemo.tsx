import React from 'react';
import {AbsoluteFill} from 'remotion';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {wipe} from '@remotion/transitions/wipe';
import {OpeningScene} from './scenes/OpeningScene';
import {PurposeScene} from './scenes/PurposeScene';
import {JourneyScene} from './scenes/JourneyScene';
import {LoginScene} from './scenes/LoginScene';
import {ConciergeScene} from './scenes/ConciergeScene';
import {AgentScene} from './scenes/AgentScene';
import {DiscoveryScene} from './scenes/DiscoveryScene';
import {ReservationScene} from './scenes/ReservationScene';
import {MyStayScene} from './scenes/MyStayScene';
import {ArchitectureScene} from './scenes/ArchitectureScene';
import {ClosingScene} from './scenes/ClosingScene';
import {WalkthroughProgress} from './WalkthroughProgress';

const transitionFrames = 14;
export const TOTAL_FRAMES = 180 + 210 + 210 + 240 + 300 + 240 + 300 + 270 + 270 + 270 + 180 - transitionFrames * 10;

export const StayAIDemo: React.FC = () => (
  <AbsoluteFill>
  <TransitionSeries>
    <TransitionSeries.Sequence durationInFrames={180}><OpeningScene /></TransitionSeries.Sequence><TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames: transitionFrames})} />
    <TransitionSeries.Sequence durationInFrames={210}><PurposeScene /></TransitionSeries.Sequence><TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames: transitionFrames})} />
    <TransitionSeries.Sequence durationInFrames={210}><JourneyScene /></TransitionSeries.Sequence><TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames: transitionFrames})} />
    <TransitionSeries.Sequence durationInFrames={240}><LoginScene /></TransitionSeries.Sequence><TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames: transitionFrames})} />
    <TransitionSeries.Sequence durationInFrames={300}><ConciergeScene /></TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={wipe({direction: 'from-right'})} timing={linearTiming({durationInFrames: transitionFrames})} />
    <TransitionSeries.Sequence durationInFrames={240}><AgentScene /></TransitionSeries.Sequence><TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames: transitionFrames})} />
    <TransitionSeries.Sequence durationInFrames={300}><DiscoveryScene /></TransitionSeries.Sequence><TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames: transitionFrames})} />
    <TransitionSeries.Sequence durationInFrames={270}><ReservationScene /></TransitionSeries.Sequence><TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames: transitionFrames})} />
    <TransitionSeries.Sequence durationInFrames={270}><MyStayScene /></TransitionSeries.Sequence><TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames: transitionFrames})} />
    <TransitionSeries.Sequence durationInFrames={270}><ArchitectureScene /></TransitionSeries.Sequence><TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames: transitionFrames})} />
    <TransitionSeries.Sequence durationInFrames={180}><ClosingScene /></TransitionSeries.Sequence>
  </TransitionSeries>
  <WalkthroughProgress />
  </AbsoluteFill>
);
