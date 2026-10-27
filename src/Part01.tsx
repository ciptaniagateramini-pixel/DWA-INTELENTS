import {AbsoluteFill, Series} from 'remotion';
import {SCENE01_FRAMES} from './theme';
import {Scene01} from './scenes/Scene01';
import {Scene02, SCENE02_FRAMES} from './scenes/Scene02';
import {Scene03, SCENE03_FRAMES} from './scenes/Scene03';
import {Scene04, SCENE04_FRAMES} from './scenes/Scene04';
import {Scene05, SCENE05_FRAMES} from './scenes/Scene05';
import {Scene06, SCENE06_FRAMES} from './scenes/Scene06';
import {Scene07, SCENE07_FRAMES} from './scenes/Scene07';
import {Scene08, SCENE08_FRAMES} from './scenes/Scene08';

export const PART01_FRAMES = SCENE01_FRAMES + SCENE02_FRAMES + SCENE03_FRAMES + SCENE04_FRAMES + SCENE05_FRAMES + SCENE06_FRAMES + SCENE07_FRAMES + SCENE08_FRAMES; // 1650 = 55 s

export const Part01: React.FC = () => (
  <AbsoluteFill>
    <Series>
      <Series.Sequence durationInFrames={SCENE01_FRAMES}><Scene01 /></Series.Sequence>
      <Series.Sequence durationInFrames={SCENE02_FRAMES}><Scene02 /></Series.Sequence>
      <Series.Sequence durationInFrames={SCENE03_FRAMES}><Scene03 /></Series.Sequence>
      <Series.Sequence durationInFrames={SCENE04_FRAMES}><Scene04 /></Series.Sequence>
      <Series.Sequence durationInFrames={SCENE05_FRAMES}><Scene05 /></Series.Sequence>
      <Series.Sequence durationInFrames={SCENE06_FRAMES}><Scene06 /></Series.Sequence>
      <Series.Sequence durationInFrames={SCENE07_FRAMES}><Scene07 /></Series.Sequence>
      <Series.Sequence durationInFrames={SCENE08_FRAMES}><Scene08 /></Series.Sequence>
    </Series>
  </AbsoluteFill>
);
