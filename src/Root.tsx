import {Composition} from 'remotion';
import {FPS, HEIGHT, SCENE01_FRAMES, WIDTH} from './theme';
import {Scene01} from './scenes/Scene01';

export const Root: React.FC = () => (
  <>
    <Composition
      id="Scene01"
      component={Scene01}
      durationInFrames={SCENE01_FRAMES}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
    {/* Checkpoint B: first beat of Scene 01 (2.8 s, ends before the camera leaves the first pose) */}
    <Composition
      id="Scene01Test"
      component={Scene01}
      durationInFrames={84}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  </>
);
