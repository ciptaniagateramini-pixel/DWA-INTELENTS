import {AbsoluteFill, Audio, Easing, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Background} from '../components/Background';
import {Fonts} from '../components/Fonts';
import {GlossIcon, IconKind} from '../components/Icons';
import {ownerBob, OwnerFront, phoneOf} from '../components/OwnerFront';
import {RobotHero} from '../components/RobotHero';
import {COLORS, FONT, HEIGHT, WIDTH} from '../theme';

export const SCENE06_FRAMES = 120;

const PINK = '#FF5FB0';
const OWNER = {x: 680, bottom: 1980, h: 1300};
const PHONE = phoneOf('reading', OWNER.x, OWNER.bottom, OWNER.h);
const AMANDA = {x: 320, y: 470, h: 560};
const START: [number, number] = [AMANDA.x + 120, AMANDA.y + 120];
const CTRL: [number, number] = [980, 520];

const T = {amanda: 10, beam: 16, beamFull: 40, packets: [30, 38, 46, 54], travel: 22, pack: 80, reply: 90};
const PACKETS: IconKind[] = ['video', 'photo', 'hashtag', 'idea'];

const bez = (t: number, end: [number, number]): [number, number] => {
  const u = 1 - t;
  return [u * u * START[0] + 2 * u * t * CTRL[0] + t * t * end[0], u * u * START[1] + 2 * u * t * CTRL[1] + t * t * end[1]];
};

/** Amanda reflects her energy straight into the Owner's phone, carrying the finished content pack. */
export const Scene06: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const bob = ownerBob(frame);
  const phone: [number, number] = [PHONE[0], PHONE[1] + bob];
  const reveal = interpolate(frame, [T.beam, T.beamFull], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const pathD = `M${START[0]},${START[1]} Q${CTRL[0]},${CTRL[1]} ${phone[0]},${phone[1] - 40}`;
  const LEN = 1150;
  const lastArrive = T.packets[T.packets.length - 1] + T.travel;
  const phoneGlow = T.packets.reduce((g, s) => Math.max(g, interpolate(frame - (s + T.travel), [0, 3, 14], [0, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})), 0);
  const pack = spring({frame: frame - T.pack, fps, config: {damping: 10, stiffness: 160}});
  const reply = spring({frame: frame - T.reply, fps, config: {damping: 10, stiffness: 180}});
  const happy = frame > T.reply ? Math.abs(Math.sin((frame - T.reply) / 4)) * Math.max(0, 1 - (frame - T.reply) / 24) * 22 : 0;
  const zoom = interpolate(frame, [0, SCENE06_FRAMES], [1.0, 1.06], {easing: Easing.inOut(Easing.quad)});

  return (
    <AbsoluteFill>
      <Fonts />
      <Background camX={0} camY={0} zoom={zoom} />
      {/* a different look for this beat: magenta wash + diagonal light streaks */}
      <AbsoluteFill style={{background: 'radial-gradient(70% 45% at 30% 28%, rgba(255,70,170,0.45), transparent 70%), linear-gradient(160deg, rgba(120,20,90,0.35), transparent 60%)'}} />
      <AbsoluteFill style={{overflow: 'hidden', opacity: 0.35}}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: -400 + ((frame * 6 + i * 520) % 1900),
              top: -200,
              width: 90,
              height: 2600,
              background: 'linear-gradient(90deg, transparent, rgba(255,180,230,0.5), transparent)',
              transform: 'rotate(28deg)',
            }}
          />
        ))}
      </AbsoluteFill>

      <div style={{position: 'absolute', width: WIDTH, height: HEIGHT, transformOrigin: '50% 60%', transform: `scale(${zoom})`}}>
        <div style={{position: 'absolute', inset: 0, transform: `translateY(${-happy}px)`}}>
          <RobotHero name="Amanda" role="Konten" x={AMANDA.x} y={AMANDA.y} h={AMANDA.h} at={T.amanda} glow={PINK} />
        </div>
        <OwnerFront pose="reading" {...OWNER} />
        {/* the reflected energy beam */}
        <svg width={WIDTH} height={HEIGHT} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
          <path d={pathD} fill="none" stroke={PINK} strokeWidth={26} strokeLinecap="round" strokeDasharray={`${LEN * reveal} ${LEN}`} opacity={0.35} style={{filter: 'blur(8px)'}} />
          <path d={pathD} fill="none" stroke={PINK} strokeWidth={10} strokeLinecap="round" strokeDasharray={`${LEN * reveal} ${LEN}`} style={{filter: `drop-shadow(0 0 14px ${PINK})`}} />
          <path d={pathD} fill="none" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" strokeDasharray={`${LEN * reveal} ${LEN}`} />
          {frame > T.beamFull &&
            [0, 1, 2, 3].map((i) => {
              const t = ((frame - T.beamFull) / 18 + i / 4) % 1;
              const [x, y] = bez(t, [phone[0], phone[1] - 40]);
              return <circle key={i} cx={x} cy={y} r={6} fill="#fff" style={{filter: `drop-shadow(0 0 8px ${PINK})`}} />;
            })}
        </svg>
        {/* content packets ride the beam into the phone */}
        {PACKETS.map((k, i) => {
          const s = T.packets[i];
          if (frame < s || frame > s + T.travel) return null;
          const t = Easing.inOut(Easing.quad)((frame - s) / T.travel);
          const [x, y] = bez(t, [phone[0], phone[1] - 40]);
          const sc = interpolate(t, [0, 0.2, 0.85, 1], [0.3, 1, 1, 0.3]);
          return <GlossIcon key={k} kind={k} size={84} style={{position: 'absolute', left: x - 42, top: y - 42, transform: `scale(${sc}) rotate(${t * 360}deg)`}} />;
        })}
        {/* phone receive glow */}
        <div
          style={{
            position: 'absolute',
            left: phone[0] - 90,
            top: phone[1] - 130,
            width: 180,
            height: 220,
            borderRadius: 60,
            background: `radial-gradient(closest-side, rgba(255,140,210,0.9), transparent)`,
            opacity: phoneGlow + (frame > lastArrive ? 0.25 : 0),
            filter: 'blur(10px)',
          }}
        />
        {/* the complete content pack lands on the phone */}
        {frame >= T.pack && (
          <div
            style={{
              position: 'absolute',
              left: phone[0] - 170,
              top: phone[1] - 330,
              padding: 16,
              borderRadius: 28,
              background: 'linear-gradient(160deg, rgba(255,255,255,0.97), rgba(255,232,246,0.95))',
              boxShadow: `0 20px 40px rgba(0,0,0,0.45), 0 0 0 4px ${PINK}`,
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 64px)',
              gap: 12,
              transform: `scale(${pack})`,
              transformOrigin: '80% 100%',
            }}
          >
            {PACKETS.map((k) => (
              <GlossIcon key={k} kind={k} size={64} />
            ))}
          </div>
        )}
        {/* Owner replies */}
        {frame >= T.reply && (
          <div
            style={{
              position: 'absolute',
              left: phone[0] - 400,
              top: phone[1] - 10,
              padding: '22px 42px',
              borderRadius: 36,
              borderBottomRightRadius: 8,
              background: `linear-gradient(150deg, #FFE48A, ${COLORS.yellow})`,
              boxShadow: '0 18px 36px rgba(0,0,0,0.45)',
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: 54,
              color: COLORS.navy,
              transform: `scale(${reply})`,
              transformOrigin: '100% 100%',
            }}
          >
            Oke
          </div>
        )}
      </div>

      <Sequence from={0}><Audio src={staticFile('sfx/whoosh.wav')} volume={0.35} /></Sequence>
      <Sequence from={T.amanda - 2}><Audio src={staticFile('sfx/zap.wav')} volume={0.45} /></Sequence>
      <Sequence from={T.beam}><Audio src={staticFile('sfx/whoosh.wav')} volume={0.4} playbackRate={0.8} /></Sequence>
      {T.packets.map((s) => (
        <Sequence key={s} from={s + T.travel - 2}><Audio src={staticFile('sfx/sync.wav')} volume={0.3} /></Sequence>
      ))}
      <Sequence from={T.pack}><Audio src={staticFile('sfx/ting.wav')} volume={0.5} /></Sequence>
      <Sequence from={T.reply - 2}><Audio src={staticFile('sfx/send.wav')} volume={0.4} /></Sequence>
      <Sequence from={T.reply}><Audio src={staticFile('sfx/pop.wav')} volume={0.45} /></Sequence>
    </AbsoluteFill>
  );
};
