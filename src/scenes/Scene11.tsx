import {AbsoluteFill, Audio, Easing, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {AgentCard} from '../components/AgentCard';
import {Background} from '../components/Background';
import {EnergyLink, Pt} from '../components/Energy';
import {Fonts} from '../components/Fonts';
import {GlossIcon, IconKind} from '../components/Icons';
import {ownerBob, OwnerFront, phoneOf} from '../components/OwnerFront';
import {RobotHero} from '../components/RobotHero';
import {SpeechBubble} from '../components/SpeechBubble';
import {COLORS, FONT, HEIGHT, WIDTH} from '../theme';

/** Scene 11 — standalone: Owner asks for the monthly recap; Bu Mila pulls every data stream and sends the report back. */
export const SCENE11_FRAMES = 360;

const T = {chat: 16, beam1: 40, mila: 70, harvest: 80, compile: 212, beam2: 240, arrive: 285, reply: 292, poseSwap: 150};

// World is taller than the frame: Bu Mila's data hub on top, the Owner at the bottom.
const OWNER = {x: 540, bottom: 2700, h: 1250};
const PHONE_TYPING = phoneOf('typing', OWNER.x, OWNER.bottom, OWNER.h);
const PHONE_READING = phoneOf('reading', OWNER.x, OWNER.bottom, OWNER.h);
const HUB = {x: 540, y: 700, h: 420};
const RAIL_X = 1040;
const RAIL_Y = 725;

type Src = {name: string; role: string; file: string; kind: IconKind};
const SOURCES: Src[] = [
  {name: 'Fitri', role: 'WhatsApp', file: 'Fitri', kind: 'receipt'},
  {name: 'Wawan', role: 'Instagram', file: 'Wawan', kind: 'receipt'},
  {name: 'Lilis', role: 'TikTok', file: 'Lilis', kind: 'receipt'},
  {name: 'Baron', role: 'BB App', file: 'Baron', kind: 'receipt'},
  {name: 'Penjaga Toko', role: 'Toko', file: 'Penjaga Toko', kind: 'receipt'},
  {name: 'Kurir Toko', role: 'Pickup / COD', file: 'Kurir Toko', kind: 'receipt'},
  {name: 'Angga', role: 'Marketing', file: 'Angga', kind: 'megaphone'},
  {name: 'Amanda', role: 'Konten', file: 'Amanda', kind: 'megaphone'},
  {name: 'Fajar', role: 'Broadcast', file: 'Fajar', kind: 'megaphone'},
  {name: 'Winda', role: 'Follow-up', file: 'Winda', kind: 'user'},
];
// Arc around the hub, leaving the bottom open for the data categories.
const POS: Pt[] = SOURCES.map((_, i) => {
  const a = ((130 + i * (280 / 9)) * Math.PI) / 180;
  return [HUB.x + Math.cos(a) * 385, HUB.y + Math.sin(a) * 445];
});
const CATS: {label: string; kind: IconKind}[] = [
  {label: 'Data Transaksi', kind: 'receipt'},
  {label: 'Data Iklan', kind: 'megaphone'},
  {label: 'Data Prospek', kind: 'user'},
];
const PACKETS = SOURCES.flatMap((s, i) => [0, 1, 2].map((k) => ({src: i, kind: s.kind, start: T.harvest + i * 5 + k * 28})));
const TRAVEL = 22;
const lastPacket = Math.max(...PACKETS.map((p) => p.start + TRAVEL));

const DataCategories: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <div style={{position: 'absolute', left: 90, width: 900, top: 1190, display: 'flex', justifyContent: 'space-between'}}>
      {CATS.map((c, i) => {
        const mine = PACKETS.filter((p) => p.kind === c.kind);
        const got = mine.filter((p) => frame >= p.start + TRAVEL).length / mine.length;
        const s = spring({frame: frame - (T.harvest - 6 + i * 4), fps, config: {damping: 12, stiffness: 170}});
        return (
          <div
            key={c.label}
            style={{
              width: 285,
              padding: '12px 14px',
              borderRadius: 22,
              background: 'linear-gradient(160deg, rgba(30,44,100,0.92), rgba(8,14,40,0.95))',
              border: `2px solid ${got >= 1 ? COLORS.yellow : 'rgba(255,255,255,0.2)'}`,
              boxShadow: `0 14px 30px rgba(0,0,0,0.45), 0 0 ${got >= 1 ? 22 : 0}px ${COLORS.yellow}88`,
              transform: `scale(${s})`,
              fontFamily: FONT,
            }}
          >
            <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
              <GlossIcon kind={c.kind} size={44} />
              <div style={{fontWeight: 700, fontSize: 24, color: COLORS.white, whiteSpace: 'nowrap'}}>{c.label}</div>
            </div>
            <div style={{marginTop: 10, height: 9, borderRadius: 5, background: 'rgba(255,255,255,0.15)'}}>
              <div style={{width: `${got * 100}%`, height: '100%', borderRadius: 5, background: `linear-gradient(90deg, ${COLORS.yellow}, #22C55E)`}} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

/** Report card that pops on the hub, then rides the rail down to the Owner's phone. */
const RAIL: Pt[] = [[HUB.x + 164, RAIL_Y], [RAIL_X, RAIL_Y], [RAIL_X, PHONE_READING[1] - 140], [PHONE_READING[0] + 20, PHONE_READING[1] - 30]];
const railLen = RAIL.slice(1).reduce((s, p, i) => s + Math.hypot(p[0] - RAIL[i][0], p[1] - RAIL[i][1]), 0);
const railAt = (d: number): Pt => {
  for (let i = 1; i < RAIL.length; i++) {
    const seg = Math.hypot(RAIL[i][0] - RAIL[i - 1][0], RAIL[i][1] - RAIL[i - 1][1]);
    if (d <= seg) return [RAIL[i - 1][0] + ((RAIL[i][0] - RAIL[i - 1][0]) * d) / seg, RAIL[i - 1][1] + ((RAIL[i][1] - RAIL[i - 1][1]) * d) / seg];
    d -= seg;
  }
  return RAIL[RAIL.length - 1];
};
const ReportCard: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < T.compile || frame > T.arrive + 2) return null;
  const pop = spring({frame: frame - T.compile, fps, config: {damping: 10, stiffness: 170}});
  const p = interpolate(frame, [T.beam2, T.arrive], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  const [x, y] = p > 0 ? railAt(p * railLen) : [HUB.x, HUB.y + 150];
  const sc = pop * interpolate(p, [0, 0.15, 0.9, 1], [1, 0.7, 0.7, 0.3]);
  return (
    <div
      style={{
        position: 'absolute',
        left: x - 120,
        top: y - 80,
        width: 240,
        height: 160,
        borderRadius: 26,
        background: 'linear-gradient(160deg, #FFFFFF, #FFF4CF)',
        boxShadow: `0 20px 40px rgba(0,0,0,0.5), 0 0 0 4px ${COLORS.yellow}, 0 0 40px ${COLORS.yellow}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 14,
        transform: `scale(${sc})`,
      }}
    >
      <GlossIcon kind="doc" size={84} />
      <GlossIcon kind="chart" size={84} />
    </div>
  );
};

export const Scene11: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const bob = ownerBob(frame);

  const keys: [number, number][] = [[0, 1740], [T.beam1, 1740], [T.mila + 4, 760], [T.compile + 20, 760], [T.arrive, 1740], [SCENE11_FRAMES, 1760]];
  const camY = interpolate(frame, keys.map((k) => k[0]), keys.map((k) => k[1]), {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  const zoom = 1 + Math.sin(frame / 60) * 0.01;
  const swap = interpolate(frame, [T.poseSwap, T.poseSwap + 10], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const hubDim = interpolate(frame, [T.arrive, T.arrive + 20], [1, 0.35], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const ring = interpolate(frame, [T.harvest, lastPacket], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const phoneGlow = interpolate(frame - T.arrive, [0, 4, 24], [0, 1, 0.3], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill>
      <Fonts />
      <Background camX={0} camY={(camY - 1250) * 0.25} zoom={zoom} />
      <div
        style={{
          position: 'absolute',
          width: WIDTH,
          height: 2700,
          transformOrigin: '0 0',
          transform: `translate(${WIDTH / 2}px, ${HEIGHT / 2}px) scale(${zoom}) translate(${-540}px, ${-camY}px)`,
        }}
      >
        <div style={{position: 'absolute', inset: 0, opacity: hubDim}}>
          <svg width={WIDTH} height={2700} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
            <circle cx={HUB.x} cy={HUB.y - 10} r={250} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={10} />
            <circle
              cx={HUB.x}
              cy={HUB.y - 10}
              r={250}
              fill="none"
              stroke={COLORS.yellow}
              strokeWidth={10}
              strokeLinecap="round"
              strokeDasharray={`${ring * 1571} 1571`}
              transform={`rotate(-90 ${HUB.x} ${HUB.y - 10})`}
              style={{filter: `drop-shadow(0 0 12px ${COLORS.yellow})`}}
            />
          </svg>
          <RobotHero name="Bu Mila" role="HRD" file="Bu Mila" x={HUB.x} y={HUB.y} h={HUB.h} at={T.mila} />
          {SOURCES.map((s, i) => (
            <AgentCard key={s.name} x={POS[i][0]} y={POS[i][1]} w={170} h={180} img={92} src={staticFile(`clean/staff/${s.file}.png`)} name={s.name} role={s.role} at={T.harvest - 4 + i * 5} nameSize={s.name.length > 8 ? 17 : 21} />
          ))}
          {PACKETS.map((p, k) => {
            if (frame < p.start || frame > p.start + TRAVEL) return null;
            const u = Easing.in(Easing.quad)((frame - p.start) / TRAVEL);
            const [sx, sy] = POS[p.src];
            const x = sx + (HUB.x - sx) * u;
            const y = sy + (HUB.y - 20 - sy) * u;
            return <GlossIcon key={k} kind={p.kind} size={48} style={{position: 'absolute', left: x - 24, top: y - 24, transform: `scale(${1 - u * 0.5})`}} />;
          })}
          <DataCategories />
        </div>

        <svg width={WIDTH} height={2700} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
          <EnergyLink pts={[[PHONE_TYPING[0] + 20, PHONE_TYPING[1] - 30], [RAIL_X, PHONE_TYPING[1] - 160], [RAIL_X, RAIL_Y], [HUB.x + 164, RAIL_Y]]} from={T.beam1} to={T.mila} />
          <EnergyLink pts={RAIL} from={T.beam2} to={T.arrive} color="#FFE27A" width={8} loopFrom={T.arrive + 10} />
        </svg>
        <ReportCard />

        {/* Owner: typing the command, later (off-camera) switched to the reading pose for the reply */}
        <div style={{position: 'absolute', inset: 0, opacity: 1 - swap}}>
          <OwnerFront pose="typing" {...OWNER} />
          {frame < T.poseSwap && (
            <SpeechBubble text="Rekap semua data bulan ini." start={T.chat} typingFrames={10} originX={PHONE_TYPING[0]} originY={PHONE_TYPING[1] + bob} x={580} y={1720} width={440} fontSize={40} />
          )}
        </div>
        <div style={{position: 'absolute', inset: 0, opacity: swap}}>
          <OwnerFront pose="reading" {...OWNER} enterAt={-100} />
        </div>
        <div
          style={{
            position: 'absolute',
            left: PHONE_READING[0] - 90,
            top: PHONE_READING[1] + bob - 130,
            width: 180,
            height: 220,
            borderRadius: 60,
            background: 'radial-gradient(closest-side, rgba(255,226,122,0.9), transparent)',
            opacity: phoneGlow,
            filter: 'blur(10px)',
          }}
        />
        {/* Bu Mila's reply lands on the Owner's phone */}
        {frame >= T.reply &&
          (() => {
            const s = spring({frame: frame - T.reply, fps, config: {damping: 12, stiffness: 160}});
            return (
              <div
                style={{
                  position: 'absolute',
                  left: 90,
                  top: 1250,
                  width: 900,
                  padding: '18px 32px 20px',
                  borderRadius: 34,
                  borderBottomRightRadius: 8,
                  background: 'linear-gradient(160deg, #FFFFFF, #EEF2FF)',
                  boxShadow: `0 24px 50px rgba(0,0,0,0.5), 0 0 0 4px ${COLORS.yellow}`,
                  fontFamily: FONT,
                  color: COLORS.navy,
                  transform: `translate(${(PHONE_READING[0] - 900) * (1 - s)}px, ${(PHONE_READING[1] - 1300) * (1 - s)}px) scale(${s})`,
                  transformOrigin: '100% 100%',
                }}
              >
                <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                  <GlossIcon kind="doc" size={40} />
                  <div style={{fontWeight: 700, fontSize: 28, color: '#C2187A'}}>Bu Mila</div>
                </div>
                <div style={{fontWeight: 600, fontSize: 40, lineHeight: 1.25, marginTop: 6}}>Laporan selesai. Apakah mau sekalian saya cetak PDF untuk arsip?</div>
              </div>
            );
          })()}
      </div>

      <Audio src={staticFile('sfx/hum.wav')} volume={0.18} endAt={SCENE11_FRAMES} />
      <Sequence from={0}><Audio src={staticFile('sfx/whoosh.wav')} volume={0.35} /></Sequence>
      <Sequence from={T.chat - 6}><Audio src={staticFile('sfx/typing.wav')} volume={0.4} /></Sequence>
      <Sequence from={T.chat + 8}><Audio src={staticFile('sfx/send.wav')} volume={0.4} /></Sequence>
      <Sequence from={T.beam1}><Audio src={staticFile('sfx/whoosh.wav')} volume={0.35} /></Sequence>
      <Sequence from={T.mila - 2}><Audio src={staticFile('sfx/zap.wav')} volume={0.45} /></Sequence>
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((k) => (
        <Sequence key={k} from={T.harvest + 6 + k * 14}><Audio src={staticFile('sfx/sync.wav')} volume={0.2} playbackRate={1 + (k % 3) * 0.08} /></Sequence>
      ))}
      <Sequence from={T.compile}><Audio src={staticFile('sfx/ting.wav')} volume={0.45} /></Sequence>
      <Sequence from={T.compile}><Audio src={staticFile('sfx/pop.wav')} volume={0.4} /></Sequence>
      <Sequence from={T.beam2}><Audio src={staticFile('sfx/whoosh.wav')} volume={0.4} /></Sequence>
      <Sequence from={T.arrive - 2}><Audio src={staticFile('sfx/zap.wav')} volume={0.35} /></Sequence>
      <Sequence from={T.reply}><Audio src={staticFile('sfx/ting.wav')} volume={0.5} /></Sequence>
      <Sequence from={T.reply}><Audio src={staticFile('sfx/pop.wav')} volume={0.4} /></Sequence>
    </AbsoluteFill>
  );
};
