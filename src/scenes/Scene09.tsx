import {AbsoluteFill, Audio, Easing, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Background} from '../components/Background';
import {Fonts} from '../components/Fonts';
import {GlossIcon} from '../components/Icons';
import {RobotHero} from '../components/RobotHero';
import {Title} from '../components/Title';
import {COLORS, FONT, HEIGHT, WIDTH} from '../theme';

/** Scene 09 — standalone short: each customer, their channel and the robot that serves them. */
export const SCENE09_FRAMES = 240;

// Narration (typo-corrected from the brief). Shown on screen; VO file is added when available.
export const SCENE09_NARRATION = 'Beginilah cara kerja mereka yang dirancang oleh team D.W.A untuk TOKO BB';
const VO_FILE: string | null = null; // e.g. 'vo/vo_scene09_norm.wav'

type Row = {
  customer: string;
  file: string;
  logo?: string;
  logoText?: string;
  robot: string;
  role: string;
  message?: string;
};
const ROWS: Row[] = [
  {customer: 'Bu Rina', file: 'Ibu Rina-Pelanggan via WA', logo: 'WA Logo No Background', robot: 'Fitri', role: 'WhatsApp', message: 'Halo, saya mau jual emas muda nih'},
  {customer: 'Bu Wiwi', file: 'Ibu Wiwi', logo: 'Logo Insta No Background', robot: 'Wawan', role: 'Instagram', message: 'Halo, saya mau jual emas tua. Tapi mau di-pickup ya.'},
  {customer: 'Pak Tata', file: 'Pak Tata', logo: 'Logo TikTok No Background', robot: 'Lilis', role: 'TikTok', message: 'Min, saya mau jual kalung. Sekalian mau pesan custom lagi. Minggu depan ke sana.'},
  {customer: 'Adrian', file: 'Adrian', logoText: 'BB', robot: 'Baron', role: 'BB App'},
];

const ROW_Y = [300, 690, 1080, 1470];
const CUST = {x: 200, h: 340};
const CUST_W = CUST.h * 0.75;
const LOGO = {x: 560, size: 104};
const ROBOT = {x: 870, h: 300};
const STEP = 40;
const BASE = 4;
const OUTRO = BASE + STEP * 4 + 4; // 168

const t = (i: number) => {
  const b = BASE + i * STEP;
  return {bubble: b + 6, leave: b + 14, logo: b + 22, robot: b + 32};
};
const phoneOf = (y: number): [number, number] => [CUST.x - CUST_W / 2 + 0.8 * CUST_W, y - CUST.h / 2 + 0.33 * CUST.h];

const linkPts = (y: number): [number, number][] => {
  const [px, py] = phoneOf(y);
  return [
    [px + 16, py + 10],
    [px + 70, y + 80],
    [LOGO.x - LOGO.size / 2 - 6, y + 80],
    [LOGO.x + LOGO.size / 2 + 6, y + 80],
    [ROBOT.x - ROBOT.h * 0.39, y + 80],
  ];
};
const lenOf = (pts: [number, number][]) => pts.slice(1).reduce((s, p, i) => s + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);
const at = (pts: [number, number][], d: number): [number, number] => {
  for (let i = 1; i < pts.length; i++) {
    const seg = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    if (d <= seg) return [pts[i - 1][0] + ((pts[i][0] - pts[i - 1][0]) * d) / seg, pts[i - 1][1] + ((pts[i][1] - pts[i - 1][1]) * d) / seg];
    d -= seg;
  }
  return pts[pts.length - 1];
};

/** WhatsApp-style incoming chat: sender name, message, time + read ticks. */
const ChatBubble: React.FC<{row: Row; y: number; start: number}> = ({row, y, start}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < start) return null;
  const s = spring({frame: frame - start, fps, config: {damping: 12, stiffness: 170, mass: 0.8}});
  const [px, py] = phoneOf(y);
  const bx = 330;
  const by = y - 178;
  return (
    <div
      style={{
        position: 'absolute',
        left: bx,
        top: by,
        width: 430,
        padding: '16px 24px 12px',
        borderRadius: 28,
        borderTopLeftRadius: 6,
        background: 'linear-gradient(160deg, #FFFFFF, #EEF2FF)',
        boxShadow: `0 20px 40px rgba(0,0,0,0.45), 0 0 0 3px ${COLORS.yellow}`,
        fontFamily: FONT,
        color: COLORS.navy,
        transform: `translate(${(px - bx) * (1 - s)}px, ${(py - by) * (1 - s)}px) scale(${s})`,
        transformOrigin: '0% 0%',
      }}
    >
      <div style={{fontWeight: 700, fontSize: 24, color: '#C2187A'}}>{row.customer}</div>
      {row.message ? (
        <div style={{fontWeight: 600, fontSize: 30, lineHeight: 1.25}}>
          {/* hyphenated words (e.g. di-pickup) must not break at the hyphen */}
          {row.message.split(' ').map((w, k) => (
            <span key={k} style={{whiteSpace: w.includes('-') ? 'nowrap' : undefined}}>
              {k ? ' ' : ''}
              {w}
            </span>
          ))}
        </div>
      ) : (
        <div style={{display: 'flex', gap: 12, alignItems: 'center', marginTop: 6}}>
          <div style={{width: 56, height: 56, borderRadius: 16, background: `linear-gradient(150deg, #FFE48A, ${COLORS.yellow}, ${COLORS.yellowDeep})`, fontWeight: 800, fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>BB</div>
          <GlossIcon kind="bag" size={56} />
        </div>
      )}
      <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: 2}}>
        <svg width={30} height={16} viewBox="0 0 30 16">
          <path d="M1 8.5l4.5 4.5L14 3.5M11 12l1 1 9.5-9.5" fill="none" stroke="#4F7BFF" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
};

export const Scene09: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // Camera walks each row: customer → channel → robot, then reveals all four pairs in one frame.
  const Z = 1.45;
  const halfH = HEIGHT / 2 / Z;
  const clampY = (y: number) => Math.min(Math.max(y, halfH), HEIGHT - halfH);
  const keys: [number, number, number, number][] = [];
  ROW_Y.forEach((y, i) => {
    const b = BASE + i * STEP;
    keys.push([Math.max(0, b - 4), 372, clampY(y), Z]);
    keys.push([b + 16, 372, clampY(y), Z]);
    keys.push([b + 34, 708, clampY(y), Z]);
  });
  keys.push([OUTRO + 22, 540, 960, 1.0], [SCENE09_FRAMES, 540, 950, 1.02]);
  const opts = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const, easing: Easing.inOut(Easing.cubic)};
  const fr = keys.map((k) => k[0]);
  const camX = interpolate(frame, fr, keys.map((k) => k[1]), opts);
  const camY = interpolate(frame, fr, keys.map((k) => k[2]), opts);
  const zoom = interpolate(frame, fr, keys.map((k) => k[3]), opts);

  return (
    <AbsoluteFill>
      <Fonts />
      <Background camX={(camX - 540) * 0.5} camY={(camY - 960) * 0.3} zoom={zoom} />
      <div
        style={{
          position: 'absolute',
          width: WIDTH,
          height: HEIGHT,
          transformOrigin: '0 0',
          transform: `translate(${WIDTH / 2}px, ${HEIGHT / 2}px) scale(${zoom}) translate(${-camX}px, ${-camY}px)`,
        }}
      >
        {ROWS.map((row, i) => {
          const y = ROW_Y[i];
          const tm = t(i);
          const intro = interpolate(frame, [BASE + i * STEP - 6, BASE + i * STEP + 4], [0.35, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
          const pts = linkPts(y);
          const len = lenOf(pts);
          const p = interpolate(frame, [tm.leave, tm.robot], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.quad)});
          const head = at(pts, p * len);
          const logoLit = spring({frame: frame - tm.logo, fps, config: {damping: 8, stiffness: 200}});
          const loop = frame > OUTRO ? ((frame - OUTRO + i * 9) % 36) / 36 : -1;
          const loopHead = loop >= 0 ? at(pts, loop * len) : null;
          const d = pts.map((q, k) => `${k ? 'L' : 'M'}${q[0]},${q[1]}`).join(' ');
          return (
            <div key={row.robot} style={{position: 'absolute', inset: 0, opacity: intro, filter: `brightness(${0.6 + intro * 0.4})`}}>
              {/* customer */}
              <div
                style={{
                  position: 'absolute',
                  left: CUST.x - 150,
                  top: y - 150,
                  width: 300,
                  height: 300,
                  borderRadius: '50%',
                  background: 'radial-gradient(closest-side, rgba(90,120,255,0.35), transparent)',
                  filter: 'blur(10px)',
                }}
              />
              <Img
                src={staticFile(`clean/customers/${row.file}.png`)}
                style={{
                  position: 'absolute',
                  left: CUST.x - CUST_W / 2,
                  top: y - CUST.h / 2 + Math.sin((frame + i * 20) / 22) * 4,
                  width: CUST_W,
                  height: CUST.h,
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 18px 22px rgba(0,0,0,0.55))',
                  maskImage: 'linear-gradient(to bottom, black 82%, transparent 100%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, black 82%, transparent 100%)',
                }}
              />
              <div style={{position: 'absolute', left: CUST.x - 130, width: 260, top: y + CUST.h / 2 - 6, textAlign: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 30, color: COLORS.white, textShadow: '0 4px 12px rgba(0,0,0,0.85)'}}>
                {row.customer}
              </div>
              {/* message path */}
              <svg width={WIDTH} height={HEIGHT} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
                <path d={d} fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth={6} strokeLinejoin="round" />
                <path d={d} fill="none" stroke={COLORS.yellow} strokeWidth={6} strokeLinejoin="round" strokeDasharray={`${len * p} ${len}`} style={{filter: `drop-shadow(0 0 8px ${COLORS.yellow})`}} />
                {p > 0 && p < 1 && <circle cx={head[0]} cy={head[1]} r={11} fill="#fff" style={{filter: `drop-shadow(0 0 12px ${COLORS.yellow})`}} />}
                {loopHead && <circle cx={loopHead[0]} cy={loopHead[1]} r={7} fill="#FFF6D0" style={{filter: `drop-shadow(0 0 8px ${COLORS.yellow})`}} />}
              </svg>
              {/* channel logo */}
              <div
                style={{
                  position: 'absolute',
                  left: LOGO.x - LOGO.size / 2,
                  top: y + 80 - LOGO.size / 2,
                  width: LOGO.size,
                  height: LOGO.size,
                  transform: `scale(${1 + logoLit * 0.12 - (logoLit > 0 ? (1 - logoLit) * 0.1 : 0)})`,
                  filter: `drop-shadow(0 10px 16px rgba(0,0,0,0.5)) drop-shadow(0 0 ${22 * logoLit}px ${COLORS.yellow})`,
                }}
              >
                {row.logo ? (
                  <Img src={staticFile(`clean/logos/${row.logo}.png`)} style={{width: '100%', height: '100%', objectFit: 'contain'}} />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: 28,
                      background: `linear-gradient(150deg, #FFE48A, ${COLORS.yellow}, ${COLORS.yellowDeep})`,
                      boxShadow: 'inset -6px -8px 14px rgba(120,60,0,0.4), inset 6px 6px 12px rgba(255,255,255,0.5)',
                      fontFamily: FONT,
                      fontWeight: 800,
                      fontSize: 44,
                      color: COLORS.navy,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {row.logoText}
                  </div>
                )}
              </div>
              {/* robot lights up as the message lands */}
              <RobotHero name={row.robot} role={row.role} x={ROBOT.x} y={y} h={ROBOT.h} at={tm.robot} />
              <ChatBubble row={row} y={y} start={tm.bubble} />
            </div>
          );
        })}
      </div>

      <Title text={SCENE09_NARRATION} start={OUTRO + 18} y={1748} size={36} color={COLORS.white} />

      <Audio src={staticFile('sfx/hum.wav')} volume={0.18} endAt={SCENE09_FRAMES} />
      {VO_FILE && <Sequence from={OUTRO + 14}><Audio src={staticFile(VO_FILE)} volume={1} /></Sequence>}
      <Sequence from={0}><Audio src={staticFile('sfx/whoosh.wav')} volume={0.35} /></Sequence>
      {ROWS.map((_, i) => {
        const tm = t(i);
        return [
          i > 0 && <Sequence key={`w${i}`} from={tm.bubble - 10}><Audio src={staticFile('sfx/whoosh.wav')} volume={0.22} /></Sequence>,
          <Sequence key={`t${i}`} from={tm.bubble}><Audio src={staticFile('sfx/ting.wav')} volume={0.4} /></Sequence>,
          <Sequence key={`p${i}`} from={tm.bubble}><Audio src={staticFile('sfx/pop.wav')} volume={0.35} /></Sequence>,
          <Sequence key={`z${i}`} from={tm.robot - 2}><Audio src={staticFile('sfx/zap.wav')} volume={0.35} /></Sequence>,
          <Sequence key={`s${i}`} from={tm.robot + 2}><Audio src={staticFile('sfx/sync.wav')} volume={0.28} /></Sequence>,
        ];
      })}
      <Sequence from={OUTRO}><Audio src={staticFile('sfx/whoosh.wav')} volume={0.4} /></Sequence>
      <Sequence from={OUTRO + 18}><Audio src={staticFile('sfx/pop.wav')} volume={0.35} /></Sequence>
    </AbsoluteFill>
  );
};
