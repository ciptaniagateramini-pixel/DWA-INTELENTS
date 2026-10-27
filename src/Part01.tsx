import {AbsoluteFill, Series} from 'remotion';
import {SCENE01_FRAMES} from './theme';
import {Scene01} from './scenes/Scene01';
import {Scene02, SCENE02_FRAMES} from './scenes/Scene02';
import {Scene03, SCENE03_FRAMES} from './scenes/Scene03';

export const PART01_FRAMES = SCENE01_FRAMES + SCENE02_FRAMES + SCENE03_FRAMES; // 900

export const Part01: React.FC = () => (
  <AbsoluteFill>
    <Series>
      <Series.Sequence durationInFrames={SCENE01_FRAMES}><Scene01 /></Series.Sequence>
      <Series.Sequence durationInFrames={SCENE02_FRAMES}><Scene02 /></Series.Sequence>
      <Series.Sequence durationInFrames={SCENE03_FRAMES}><Scene03 /></Series.Sequence>
    </Series>
  </AbsoluteFill>
);
