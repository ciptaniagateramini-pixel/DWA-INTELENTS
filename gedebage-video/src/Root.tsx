import React from 'react';
import {Composition} from 'remotion';
import {DURATION, FPS, HEIGHT, WIDTH} from './config';
import {GedebageVideo} from './Video';

export const RemotionRoot: React.FC = () => (
  <Composition id="GedebageVideo" component={GedebageVideo} durationInFrames={DURATION} fps={FPS} width={WIDTH} height={HEIGHT} />
);
