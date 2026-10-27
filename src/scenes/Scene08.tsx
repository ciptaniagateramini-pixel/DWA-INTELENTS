import {AbsoluteFill, Audio, Easing, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Background} from '../components/Background';
import {Fonts} from '../components/Fonts';
import {GlossIcon, ICON_COLORS, IconKind} from '../components/Icons';
import {RobotHero} from '../components/RobotHero';
import {COLORS, HEIGHT, WIDTH} from '../theme';

export const SCENE08_FRAMES = 120;

type Sender = {name: string; role: string; x: number; y: number; h: number; icon: IconKind};
const SENDERS: Sender[] = [
  {name: 'Winda', role: 'Follow-up', x: 230, y: 1010, h: 330, icon: 'chat'},
  {name: 'Angga', role: 'Marketing', x: 540, y: 830, h: 380, icon: 'megaphone'},
  {name: 'Fajar', role: 'Email / Broadcast', x: 850, y: 1010, h: 330, icon: 'mail'},
];
const START = 12;
const TRAVEL = 12;

// Contact database: two bands of generic contact nodes above and below the marketing team.
const COLS = [90, 240, 390, 540, 690, 840, 990];
const ROWS = [150, 260, 370, 480, 1420, 1530, 1640, 1750];
type Contact = {x: number; y: number; sender: number; at: number};
const CONTACTS: Contact[] = (() => {
  const raw = ROWS.flatMap((y) => COLS.map((x) => ({x, y, sender: x < 540 ? 0 : x > 540 ? 2 : 1})));
  return raw.map((c, i) => {
    const s = SENDERS[c.sender];
    const dist = Math.hypot(c.x - s.x, c.y - s.y);
    const jitter = ((i * 37) % 11) - 5;
    return {...c, at: Math.round(START + dist / 14 + jitter)};
  });
})();
const LAST = Math.max(...CONTACTS.map((c) => c.at + TRAVEL));

const PersonGlyph: React.FC<{color: string}> = ({color}) => (
  <svg width={40} height={40} viewBox="0 0 24 24">
    <circle cx={12} cy={8.5} r={4} fill={color} />
    <path d="M4.5 20c.8-4 3.8-6 7.5-6s6.7 2 7.5 6z" fill={color} />
  </svg>
);

const ContactNode: React.FC<{c: Contact; i: number}> = ({c, i}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const appear = interpolate(frame, [i % 8, (i % 8) + 10], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const arrive = c.at + TRAVEL;
  const lit = spring({frame: frame - arrive, fps, config: {damping: 9, stiffness: 200}});
  const ripple = interpolate(frame - arrive, [0, 16], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const [ca] = ICON_COLORS[SENDERS[c.sender].icon];
  return (
    <div style={{position: 'absolute', left: c.x - 38, top: c.y - 38, width: 76, height: 76, opacity: appear}}>
      {ripple > 0 && ripple < 1 && (
        <div style={{position: 'absolute', inset: -10, borderRadius: '50%', border: `4px solid ${ca}`, transform: `scale(${1 + ripple * 0.7})`, opacity: 1 - ripple}} />
      )}
      <div
        style={{
          width: 76,
          height: 76,
          borderRadius: 38,
          background: lit > 0.05 ? `linear-gradient(150deg, #FFE48A, ${COLORS.yellow})` : 'rgba(255,255,255,0.08)',
          border: `3px solid ${lit > 0.05 ? '#fff' : 'rgba(255,255,255,0.22)'}`,
          boxShadow: lit > 0.05 ? `0 0 ${22 * lit}px ${COLORS.yellow}` : 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${1 + (lit > 0 ? (1 - lit) * 0.3 : 0)})`,
        }}
      >
        <PersonGlyph color={lit > 0.05 ? COLORS.navy : 'rgba(255,255,255,0.55)'} />
      </div>
    </div>
  );
};

/** The marketing division blasts follow-ups, broadcasts and promos to every contact in its database. */
export const Scene08: React.FC = () => {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [0, SCENE08_FRAMES], [1.08, 1.0], {easing: Easing.out(Easing.cubic)});
  return (
    <AbsoluteFill>
      <Fonts />
      <Background camX={0} camY={0} zoom={zoom} />
      <div style={{position: 'absolute', width: WIDTH, height: HEIGHT, transformOrigin: '50% 50%', transform: `scale(${zoom})`}}>
        {CONTACTS.map((c, i) => (
          <ContactNode key={i} c={c} i={i} />
        ))}
        {SENDERS.map((s) => (
          <RobotHero key={s.name} name={s.name} role={s.role} x={s.x} y={s.y} h={s.h} at={4} />
        ))}
        {/* message packets flying out along gentle arcs */}
        {CONTACTS.map((c, i) => {
          if (frame < c.at || frame > c.at + TRAVEL) return null;
          const s = SENDERS[c.sender];
          const t = Easing.inOut(Easing.quad)((frame - c.at) / TRAVEL);
          const sx = s.x;
          const sy = s.y - s.h * 0.1;
          const mx = (sx + c.x) / 2 + (c.y < 900 ? -1 : 1) * (c.x < 540 ? 60 : -60);
          const my = (sy + c.y) / 2;
          const u = 1 - t;
          const x = u * u * sx + 2 * u * t * mx + t * t * c.x;
          const y = u * u * sy + 2 * u * t * my + t * t * c.y;
          return <GlossIcon key={i} kind={s.icon} size={50} style={{position: 'absolute', left: x - 25, top: y - 25, transform: `scale(${interpolate(t, [0, 0.15, 1], [0.3, 1, 0.7])})`}} />;
        })}
      </div>

      <Sequence from={0}><Audio src={staticFile('sfx/whoosh.wav')} volume={0.4} /></Sequence>
      <Sequence from={2}><Audio src={staticFile('sfx/zap.wav')} volume={0.4} /></Sequence>
      {[START, START + 22, START + 44].map((f) => (
        <Sequence key={f} from={f}><Audio src={staticFile('sfx/send.wav')} volume={0.4} /></Sequence>
      ))}
      {[30, 42, 54, 66, 78, 90].map((f) => (
        <Sequence key={f} from={f}><Audio src={staticFile('sfx/sync.wav')} volume={0.22} playbackRate={1 + ((f / 12) % 3) * 0.1} /></Sequence>
      ))}
      <Sequence from={Math.min(LAST + 2, 104)}><Audio src={staticFile('sfx/ting.wav')} volume={0.45} /></Sequence>
    </AbsoluteFill>
  );
};
