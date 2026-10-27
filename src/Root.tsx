import {Composition} from 'remotion';
import {FPS, HEIGHT, SCENE01_FRAMES, WIDTH} from './theme';
import {Scene01} from './scenes/Scene01';
import {Scene02, SCENE02_FRAMES} from './scenes/Scene02';
import {Scene03, SCENE03_FRAMES} from './scenes/Scene03';
import {Scene04, SCENE04_FRAMES} from './scenes/Scene04';
import {Scene05, SCENE05_FRAMES} from './scenes/Scene05';
import {Scene06, SCENE06_FRAMES} from './scenes/Scene06';
import {Scene07, SCENE07_FRAMES} from './scenes/Scene07';
import {Scene08, SCENE08_FRAMES} from './scenes/Scene08';
import {Scene09, SCENE09_FRAMES} from './scenes/Scene09';
import {Scene10, SCENE10_FRAMES} from './scenes/Scene10';
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
    <Composition id="Scene05" component={Scene05} durationInFrames={SCENE05_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />
    <Composition id="Scene06" component={Scene06} durationInFrames={SCENE06_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />
    <Composition id="Scene07" component={Scene07} durationInFrames={SCENE07_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />
    <Composition id="Scene08" component={Scene08} durationInFrames={SCENE08_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />
    {/* standalone short, not part of the Part01 master */}
    <Composition id="Scene09" component={Scene09} durationInFrames={SCENE09_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />
    <Composition id="Scene10" component={Scene10} durationInFrames={SCENE10_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />
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
