import {Composition} from 'remotion';
import {FPS, HEIGHT, SCENE01_FRAMES, WIDTH} from './theme';
import {Scene01} from './scenes/Scene01';
import {Scene02, SCENE02_FRAMES} from './scenes/Scene02';
import {Scene03, SCENE03_FRAMES} from './scenes/Scene03';
import {Scene04, SCENE04_FRAMES} from './scenes/Scene04';
import {Part01, PART01_FRAMES} from './Part01';

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
    <Composition id="Scene02" component={Scene02} durationInFrames={SCENE02_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />
    <Composition id="Scene03" component={Scene03} durationInFrames={SCENE03_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />
    <Composition id="Scene04" component={Scene04} durationInFrames={SCENE04_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />
    <Composition id="Part01" component={Part01} durationInFrames={PART01_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />
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
