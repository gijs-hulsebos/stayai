import React from 'react';
import {Composition, Folder} from 'remotion';
import {StayAIDemo, TOTAL_FRAMES} from './StayAIDemo';
import {OpeningScene} from './scenes/OpeningScene';
import {ConciergeScene} from './scenes/ConciergeScene';
import {ArchitectureScene} from './scenes/ArchitectureScene';
import {AgentScene} from './scenes/AgentScene';
import {MyStayScene} from './scenes/MyStayScene';

export const RemotionRoot: React.FC = () => (
  <>
    <Folder name="StayAI-scenes">
      <Composition id="Opening" component={OpeningScene} durationInFrames={180} fps={30} width={1920} height={1080} />
      <Composition id="Concierge" component={ConciergeScene} durationInFrames={300} fps={30} width={1920} height={1080} />
      <Composition id="Agent" component={AgentScene} durationInFrames={240} fps={30} width={1920} height={1080} />
      <Composition id="MyStay" component={MyStayScene} durationInFrames={270} fps={30} width={1920} height={1080} />
      <Composition id="Architecture" component={ArchitectureScene} durationInFrames={270} fps={30} width={1920} height={1080} />
    </Folder>
    <Composition id="StayAIProductDemo" component={StayAIDemo} durationInFrames={TOTAL_FRAMES} fps={30} width={1920} height={1080} />
  </>
);
