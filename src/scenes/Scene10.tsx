import {AbsoluteFill, Audio, Easing, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {AgentCard, GREEN} from '../components/AgentCard';
import {Background} from '../components/Background';
import {EnergyDefs, EnergyLink, Pt} from '../components/Energy';
import {Fonts} from '../components/Fonts';
import {GlossIcon} from '../components/Icons';
import {RobotHero} from '../components/RobotHero';
import {COLORS, FONT, HEIGHT, WIDTH} from '../theme';
import {CUST, CUST_W, LOGO, ROBOT, ROW_Y, ROWS} from './Scene09';

/** Scene 10 — standalone, continues Scene 09: robots reply, process and hand each case to the right person. */
export const SCENE10_FRAMES = 360;

// Short robot replies (not in the brief — written to be neutral, easy to change here).
const REPLIES = [
  'Siap, Bu Rina! Langsung kami proses ya.',
  'Siap, Bu Wiwi! Kurir kami jemput ya.',
  'Siap, Pak Tata! Kami catat dulu ya.',
  'Pembelian diterima. No. booking dikirim.',
];
// Processing result per case (from the brief).
const STATUS = ['FIX JUAL', 'JUAL • PICKUP', 'RENCANA JUAL', 'BELI EMAS • NO. BOOKING'];

type DestId = 'penjaga' | 'kurir' | 'winda';
const DEST: Record<DestId, {x: number; y: number; name: string; role: string; file: string; w: number; h: number; img: number}> = {
  penjaga: {x: 1430, y: 885, name: 'Penjaga Toko', role: 'Toko / Booking', file: 'Penjaga Toko', w: 230, h: 220, img: 116},
  kurir: {x: 1180, y: 690, name: 'Kurir Toko', role: 'Pickup / COD', file: 'Kurir Toko', w: 220, h: 210, img: 110},
  winda: {x: 1180, y: 1080, name: 'Winda', role: 'Follow-up', file: 'Winda', w: 220, h: 210, img: 110},
};
const ROUTE: DestId[] = ['penjaga', 'kurir', 'winda', 'penjaga'];
const ROBOT_R = ROBOT.x + ROBOT.h * 0.39;
const PATHS: Pt[][] = [
  [[ROBOT_R, ROW_Y[0]], [DEST.penjaga.x, ROW_Y[0]], [DEST.penjaga.x, DEST.penjaga.y - DEST.penjaga.h / 2]],
  [[ROBOT_R, ROW_Y[1]], [DEST.kurir.x - DEST.kurir.w / 2, ROW_Y[1]]],
  [[ROBOT_R, ROW_Y[2]], [DEST.winda.x - DEST.winda.w / 2, ROW_Y[2]]],
  [[ROBOT_R, ROW_Y[3]], [DEST.penjaga.x, ROW_Y[3]], [DEST.penjaga.x, DEST.penjaga.y + DEST.penjaga.h / 2]],
];

const STEP = 64;
const BASE = 14;
const OUTRO = BASE + STEP * 4; // 270
const tm = (i: number) => {
  const b = BASE + i * STEP;
  return {b, reply: b + 6, status: b + 22, leave: b + 34, arrive: b + 52};
};
const DEST_AT: Record<DestId, number> = {penjaga: tm(0).arrive, kurir: tm(1).arrive, winda: tm(2).arrive};
const VO_AT = 18;

const BUBBLE_X = 330;
const BUBBLE_W = 430;

/** The customer's message from Scene 09, collapsing into a one-line quote when the robot answers. */
const CustomerQuote: React.FC<{i: number}> = ({i}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const row = ROWS[i];
  const y = ROW_Y[i];
  const c = spring({frame: frame - tm(i).reply + 4, fps, config: {damping: 14, stiffness: 160}});
  return (
    <div
      style={{
        position: 'absolute',
        left: BUBBLE_X,
        top: y - 178,
        width: BUBBLE_W,
        padding: '14px 22px 12px',
        borderRadius: 26,
        borderTopLeftRadius: 6,
        background: 'linear-gradient(160deg, #FFFFFF, #EEF2FF)',
        boxShadow: `0 16px 34px rgba(0,0,0,0.45), 0 0 0 3px ${COLORS.yellow}`,
        fontFamily: FONT,
        color: COLORS.navy,
        transform: `scale(${1 - c * 0.12})`,
        transformOrigin: '0% 0%',
      }}
    >
      <div style={{fontWeight: 700, fontSize: 22, color: '#C2187A'}}>{row.customer}</div>
      <div
        style={{
          fontWeight: 600,
          fontSize: 28,
          lineHeight: 1.25,
          maxHeight: interpolate(c, [0, 1], [150, 35]),
          overflow: 'hidden',
          whiteSpace: c > 0.5 ? 'nowrap' : 'normal',
          textOverflow: 'ellipsis',
        }}
      >
        {row.message ?? (
          // Adrian ordered in the app: same icon message as Scene 09, no invented text
          <div style={{display: 'flex', gap: 8, alignItems: 'center', height: 35}}>
            <div style={{width: 32, height: 32, borderRadius: 9, background: `linear-gradient(150deg, #FFE48A, ${COLORS.yellow}, ${COLORS.yellowDeep})`, fontWeight: 800, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>BB</div>
            <GlossIcon kind="bag" size={32} />
          </div>
        )}
      </div>
    </div>
  );
};

/** Outgoing reply from the robot (right-aligned, green like a sent message). */
const RobotReply: React.FC<{i: number}> = ({i}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = tm(i);
  if (frame < t.reply) return null;
  const s = spring({frame: frame - t.reply, fps, config: {damping: 12, stiffness: 170}});
  const typing = frame - t.reply < 8;
  return (
    <div
      style={{
        position: 'absolute',
        left: BUBBLE_X + 50,
        top: ROW_Y[i] - 86,
        width: BUBBLE_W - 50,
        padding: '12px 20px',
        borderRadius: 24,
        borderTopRightRadius: 6,
        background: 'linear-gradient(160deg, #DCFCE7, #B9F6CA)',
        boxShadow: '0 14px 30px rgba(0,0,0,0.45)',
        fontFamily: FONT,
        fontWeight: 600,
        fontSize: 26,
        lineHeight: 1.22,
        color: '#0B3D1F',
        transform: `scale(${s})`,
        transformOrigin: '100% 0%',
      }}
    >
      <div style={{fontWeight: 700, fontSize: 20, color: '#15803D'}}>{ROWS[i].robot}</div>
      {typing ? (
        <div style={{display: 'flex', gap: 10, height: 32, alignItems: 'center'}}>
          {[0, 1, 2].map((k) => (
            <div key={k} style={{width: 12, height: 12, borderRadius: 6, background: '#15803D', opacity: 0.35 + 0.65 * Math.max(0, Math.sin((frame - t.reply) / 2 - k))}} />
          ))}
        </div>
      ) : (
        REPLIES[i]
      )}
    </div>
  );
};

/** Processing badge above the robot: spinner, then the case result. */
const StatusChip: React.FC<{i: number}> = ({i}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = tm(i);
  if (frame < t.status) return null;
  const s = spring({frame: frame - t.status, fps, config: {damping: 11, stiffness: 190}});
  const done = frame - t.status >= 10;
  return (
    <div
      style={{
        position: 'absolute',
        left: ROBOT.x - 150,
        width: 300,
        // sits on the lower edge of the robot's plate, above its name, so it never covers the row above
        top: ROW_Y[i] + ROBOT.h * 0.28,
        display: 'flex',
        justifyContent: 'center',
        transform: `scale(${s})`,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '8px 18px',
          borderRadius: 22,
          background: done ? `linear-gradient(150deg, #FFE48A, ${COLORS.yellow})` : 'rgba(10,18,48,0.9)',
          border: `2px solid ${COLORS.yellow}`,
          boxShadow: `0 10px 24px rgba(0,0,0,0.45), 0 0 18px ${COLORS.yellow}88`,
          fontFamily: FONT,
          fontWeight: 800,
          fontSize: 22,
          color: done ? COLORS.navy : COLORS.white,
          whiteSpace: 'nowrap',
        }}
      >
        {done ? (
          <>
            <svg width={22} height={22} viewBox="0 0 24 24">
              <circle cx={12} cy={12} r={11} fill={GREEN} />
              <path d="M6.5 12.5l3.5 3.5 7.5-8" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {STATUS[i]}
          </>
        ) : (
          <>
            <svg width={22} height={22} viewBox="0 0 24 24" style={{transform: `rotate(${(frame - t.status) * 36}deg)`}}>
              <circle cx={12} cy={12} r={9} fill="none" stroke={COLORS.yellow} strokeWidth={3.5} strokeDasharray="40 20" strokeLinecap="round" />
            </svg>
            proses…
          </>
        )}
      </div>
    </div>
  );
};

export const Scene10: React.FC = () => {
  const frame = useCurrentFrame();

  // Camera: starts on Scene 09's final framing, then glides customer → robot → destination for each case,
  // and finally pulls back to show the whole flow.
  const Z = 1.3;
  const halfW = WIDTH / 2 / Z;
  const halfH = HEIGHT / 2 / Z;
  const cx = (x: number) => Math.min(Math.max(x, halfW), 1600 - halfW);
  const cy = (y: number) => Math.min(Math.max(y, halfH), HEIGHT - halfH);
  const keys: [number, number, number, number][] = [[0, 540, 950, 1.02]];
  ROW_Y.forEach((y, i) => {
    const t = tm(i);
    const d = DEST[ROUTE[i]];
    keys.push([t.b + 2, cx(640), cy(y), Z]);
    keys.push([t.leave, cx(760), cy(y), Z]);
    keys.push([t.arrive + 6, cx(d.x - 120), cy((y + d.y) / 2), Z]);
  });
  keys.push([OUTRO + 26, 790, 925, 0.69], [SCENE10_FRAMES, 790, 920, 0.71]);
  const opts = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const, easing: Easing.inOut(Easing.sin)};
  const fr = keys.map((k) => k[0]);
  const camX = interpolate(frame, fr, keys.map((k) => k[1]), opts);
  const camY = interpolate(frame, fr, keys.map((k) => k[2]), opts);
  const zoom = interpolate(frame, fr, keys.map((k) => k[3]), opts);

  return (
    <AbsoluteFill>
      <Fonts />
      <Background camX={(camX - 540) * 0.4} camY={(camY - 960) * 0.3} zoom={zoom} />
      <div
        style={{
          position: 'absolute',
          width: WIDTH,
          height: HEIGHT,
          transformOrigin: '0 0',
          transform: `translate(${WIDTH / 2}px, ${HEIGHT / 2}px) scale(${zoom}) translate(${-camX}px, ${-camY}px)`,
        }}
      >
        <svg width={1600} height={HEIGHT} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
          <EnergyDefs />
          {/* Scene 09 links stay lit */}
          {ROW_Y.map((y) => (
            <path key={y} d={`M${CUST.x + CUST_W * 0.3},${y + 20} L${LOGO.x},${y + 80} L${ROBOT.x - ROBOT.h * 0.39},${y + 80}`} fill="none" stroke={COLORS.yellow} strokeWidth={5} opacity={0.55} />
          ))}
          {PATHS.map((pts, i) => (
            <EnergyLink key={i} pts={pts} from={tm(i).leave} to={tm(i).arrive} packet loopFrom={OUTRO} />
          ))}
        </svg>
        {ROWS.map((row, i) => {
          const y = ROW_Y[i];
          return (
            <div key={row.robot}>
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
              <div style={{position: 'absolute', left: LOGO.x - LOGO.size / 2, top: y + 80 - LOGO.size / 2, width: LOGO.size, height: LOGO.size, filter: `drop-shadow(0 10px 16px rgba(0,0,0,0.5)) drop-shadow(0 0 16px ${COLORS.yellow})`}}>
                {row.logo ? (
                  <Img src={staticFile(`clean/logos/${row.logo}.png`)} style={{width: '100%', height: '100%', objectFit: 'contain'}} />
                ) : (
                  <div style={{width: '100%', height: '100%', borderRadius: 28, background: `linear-gradient(150deg, #FFE48A, ${COLORS.yellow}, ${COLORS.yellowDeep})`, fontFamily: FONT, fontWeight: 800, fontSize: 44, color: COLORS.navy, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    {row.logoText}
                  </div>
                )}
              </div>
              <RobotHero name={row.robot} role={row.role} x={ROBOT.x} y={y} h={ROBOT.h} at={-100} />
              <CustomerQuote i={i} />
              <RobotReply i={i} />
              <StatusChip i={i} />
            </div>
          );
        })}
        {(Object.keys(DEST) as DestId[]).map((id) => {
          const d = DEST[id];
          return <AgentCard key={id} x={d.x} y={d.y} w={d.w} h={d.h} img={d.img} src={staticFile(`clean/staff/${d.file}.png`)} name={d.name} role={d.role} at={DEST_AT[id]} update nameSize={26} />;
        })}
      </div>

      <Audio src={staticFile('sfx/hum.wav')} volume={0.16} endAt={SCENE10_FRAMES} />
      <Sequence from={VO_AT}><Audio src={staticFile('vo/vo_scene10_tokobb_norm.wav')} volume={1} /></Sequence>
      {ROWS.map((_, i) => {
        const t = tm(i);
        return [
          <Sequence key={`w${i}`} from={t.b}><Audio src={staticFile('sfx/whoosh.wav')} volume={0.2} /></Sequence>,
          <Sequence key={`r${i}`} from={t.reply + 8}><Audio src={staticFile('sfx/send.wav')} volume={0.28} /></Sequence>,
          <Sequence key={`p${i}`} from={t.reply + 8}><Audio src={staticFile('sfx/pop.wav')} volume={0.28} /></Sequence>,
          <Sequence key={`s${i}`} from={t.status + 10}><Audio src={staticFile('sfx/sync.wav')} volume={0.28} /></Sequence>,
          <Sequence key={`z${i}`} from={t.arrive - 2}><Audio src={staticFile('sfx/zap.wav')} volume={0.3} /></Sequence>,
          <Sequence key={`t${i}`} from={t.arrive + 10}><Audio src={staticFile('sfx/ting.wav')} volume={0.3} /></Sequence>,
        ];
      })}
      <Sequence from={OUTRO}><Audio src={staticFile('sfx/whoosh.wav')} volume={0.35} /></Sequence>
    </AbsoluteFill>
  );
};
