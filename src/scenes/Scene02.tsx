import {AbsoluteFill, Audio, Easing, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Background} from '../components/Background';
import {Fonts} from '../components/Fonts';
import {Title} from '../components/Title';
import {COLORS, FONT, HEIGHT, WIDTH} from '../theme';

export const SCENE02_FRAMES = 300;

/** Arrival order (logged in docs/PRODUCTION_LOG.md). One robot every 0.5 s = 15 frames. */
export const ARRIVAL_ORDER = ['Bu Mila', 'Marzuki', 'Acep', 'Bambang', 'Angga', 'Fitri', 'Wawan', 'Lilis', 'Baron', 'Winda', 'Fajar', 'Amanda'];

const FIRST = 18;
const STEP = 15;
const COLS = [200, 540, 880];
const ROWS = [470, 790, 1110, 1430];
const CELL = 300;
const FOOTER_AT = FIRST + STEP * 12 + 6;

const cellOf = (i: number) => ({x: COLS[i % 3], y: ROWS[Math.floor(i / 3)]});

const Robot: React.FC<{name: string; index: number}> = ({name, index}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const start = FIRST + index * STEP;
  if (frame < start) return null;
  const {x, y} = cellOf(index);
  const s = spring({frame: frame - start, fps, config: {damping: 9, stiffness: 170, mass: 0.8}});
  const land = spring({frame: frame - start - 6, fps, config: {damping: 7, stiffness: 260}});
  const squash = 1 + (1 - land) * 0.08 * Math.sin((frame - start) / 2);
  const bob = Math.sin((frame + index * 9) / 20) * 5;
  const ring = interpolate(frame - start, [0, 14], [0, 1], {extrapolateRight: 'clamp'});
  const plate = CELL * 0.74;
  return (
    <div style={{position: 'absolute', left: x - CELL / 2, top: y - CELL / 2, width: CELL, height: CELL}}>
      {/* arrival burst */}
      <div
        style={{
          position: 'absolute',
          left: CELL / 2 - 140,
          top: CELL / 2 - 160,
          width: 280,
          height: 280,
          borderRadius: 80,
          border: `6px solid ${COLORS.yellow}`,
          transform: `scale(${0.4 + ring * 0.9}) rotate(${ring * 30}deg)`,
          opacity: 1 - ring,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: CELL / 2 - plate / 2,
          top: 18,
          width: plate,
          height: plate,
          borderRadius: plate * 0.26,
          background: `linear-gradient(150deg, #FFE48A 0%, ${COLORS.yellow} 45%, ${COLORS.yellowDeep} 100%)`,
          boxShadow: 'inset -10px -14px 26px rgba(150,80,0,0.45), inset 10px 12px 22px rgba(255,255,255,0.55), 0 22px 40px rgba(0,0,0,0.45)',
          transform: `scale(${s}) rotate(${(1 - s) * -25 + Math.sin((frame + index * 7) / 35) * 3}deg)`,
        }}
      />
      <Img
        src={staticFile(`clean/staff/${name}.png`)}
        style={{
          position: 'absolute',
          left: 10,
          top: -6,
          width: CELL - 20,
          height: CELL - 50,
          objectFit: 'contain',
          transform: `translateY(${(1 - s) * -260 + bob}px) scale(${s * squash}, ${s / squash})`,
          transformOrigin: '50% 100%',
          filter: 'drop-shadow(0 16px 18px rgba(0,0,0,0.55))',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: CELL - 46,
          textAlign: 'center',
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: 32,
          color: COLORS.white,
          textShadow: '0 4px 12px rgba(0,0,0,0.8)',
          opacity: interpolate(frame - start, [6, 14], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
        }}
      >
        {name}
      </div>
    </div>
  );
};

export const Scene02: React.FC = () => {
  const frame = useCurrentFrame();
  // camera tracks the row of the newest arrival, then settles on the full grid
  const current = Math.min(11, Math.max(0, Math.floor((frame - FIRST) / STEP)));
  const rowY = cellOf(current).y;
  const settle = interpolate(frame, [FIRST + STEP * 11, FOOTER_AT + 10], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  const trackY = interpolate(frame, [FIRST, FIRST + STEP * 11], [ROWS[0], ROWS[3]], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  // vertical travel is clamped so row 1 never slides under the header and row 4 never reaches the footer
  const followY = interpolate((trackY + rowY) / 2, [ROWS[0], ROWS[3]], [905, 985]);
  const camY = interpolate(settle, [0, 1], [followY, 950]);
  const zoom = interpolate(settle, [0, 1], [1.05, 1]) + Math.sin(frame / 50) * 0.006;

  return (
    <AbsoluteFill>
      <Fonts />
      <Background camX={0} camY={(camY - 950) * 0.5} zoom={zoom} />
      <div
        style={{
          position: 'absolute',
          width: WIDTH,
          height: HEIGHT,
          transformOrigin: '0 0',
          transform: `translate(${WIDTH / 2}px, ${HEIGHT / 2}px) scale(${zoom}) translate(${-540}px, ${-camY}px)`,
        }}
      >
        {ARRIVAL_ORDER.map((n, i) => (
          <Robot key={n} name={n} index={i} />
        ))}
      </div>
      <Title text="DWA AGENT INTELLIGENT" start={2} y={120} size={64} color={COLORS.white} />
      <Title text="AI STAFF TOKO BB GOLD" start={FOOTER_AT} y={1660} size={60} />

      <Sequence from={0}><Audio src={staticFile('sfx/whoosh.wav')} volume={0.45} /></Sequence>
      <Sequence from={10}><Audio src={staticFile('vo/vo_scene02_norm.wav')} volume={1} /></Sequence>
      {ARRIVAL_ORDER.map((n, i) => (
        <Sequence key={n} from={FIRST + i * STEP}>
          <Audio src={staticFile('sfx/pop.wav')} volume={0.3} playbackRate={1 + (i % 4) * 0.08} />
        </Sequence>
      ))}
      <Sequence from={FOOTER_AT - 6}><Audio src={staticFile('sfx/whoosh.wav')} volume={0.35} /></Sequence>
      <Sequence from={FOOTER_AT}><Audio src={staticFile('sfx/pop.wav')} volume={0.45} /></Sequence>
    </AbsoluteFill>
  );
};
