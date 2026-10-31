import React from 'react';
import {Composition} from 'remotion';
import {DURATION, FPS, HEIGHT, WIDTH} from './config';
import {GedebageVideo} from './Video';
import {SatVideo} from './satellite/SatVideo';
import {SAT_DURATION} from './satellite/satConfig';

export const RemotionRoot: React.FC = () => (
  <>
  <Composition id="GedebageVideo" component={GedebageVideo} durationInFrames={DURATION} fps={FPS} width={WIDTH} height={HEIGHT} />
  <Composition id="GedebageSatelit" component={SatVideo} durationInFrames={SAT_DURATION} fps={FPS} width={WIDTH} height={HEIGHT} />
  </>
);
