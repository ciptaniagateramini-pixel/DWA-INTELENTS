import {AbsoluteFill, Audio, Easing, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {AgentCard} from '../components/AgentCard';
import {Background} from '../components/Background';
import {EnergyDefs, EnergyLink, Pt} from '../components/Energy';
import {Fonts} from '../components/Fonts';
import {GlossIcon, IconKind} from '../components/Icons';
import {ownerBob, OwnerFront, phoneOf} from '../components/OwnerFront';
import {RobotHero} from '../components/RobotHero';
import {SpeechBubble} from '../components/SpeechBubble';
import {HEIGHT, WIDTH} from '../theme';

export const SCENE05_FRAMES = 150;

const PINK = '#FF5FB0';
const OWNER = {x: 540, bottom: 1960, h: 1250};
const PHONE = phoneOf('typing', OWNER.x, OWNER.bottom, OWNER.h);
const MARZUKI = {x: 820, y: 330, w: 260, h: 230, img: 130};
const AMANDA = {x: 280, y: 480, h: 420};

const T = {typing: 10, chat: 30, beam: 44, marzuki: 62, toAmanda: 80, amanda: 98};

const RESEARCH: IconKind[] = ['search', 'hashtag', 'kol', 'idea'];
const CONTENT: {kind: IconKind; dx: number; dy: number}[] = [
  {kind: 'video', dx: -175, dy: -170},
  {kind: 'photo', dx: 170, dy: -185},
  {kind: 'hashtag', dx: 185, dy: 40},
  {kind: 'idea', dx: -190, dy: 70},
];

/** Research icons orbit Marzuki once he is lit. */
const ResearchOrbit: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <>
      {RESEARCH.map((k, i) => {
        const s = spring({frame: frame - (T.marzuki + 2 + i * 4), fps, config: {damping: 10, stiffness: 180}});
        const a = (i / RESEARCH.length) * Math.PI * 2 + frame / 30;
        const r = 195;
        return (
          <GlossIcon
            key={k}
            kind={k}
            size={62}
            style={{position: 'absolute', left: MARZUKI.x + Math.cos(a) * r - 31, top: MARZUKI.y + Math.sin(a) * r * 0.8 - 31, transform: `scale(${s})`}}
          />
        );
      })}
    </>
  );
};

/** Amanda "in production": content tiles pop out of her and keep floating, a REC dot blinks. */
const ContentProduction: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < T.amanda) return null;
  const rec = Math.floor((frame - T.amanda) / 8) % 2 === 0;
  return (
    <>
      {CONTENT.map((c, i) => {
        const at = T.amanda + 4 + i * 8;
        const s = spring({frame: frame - at, fps, config: {damping: 9, stiffness: 170}});
        const float = Math.sin((frame + i * 13) / 14) * 8;
        const ring = interpolate(frame - at, [0, 30], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
        return (
          <div key={i} style={{position: 'absolute', left: AMANDA.x + c.dx * s - 38, top: AMANDA.y + c.dy * s - 38 + float, transform: `scale(${s})`}}>
            <GlossIcon kind={c.kind} size={76} />
            <svg width={92} height={92} style={{position: 'absolute', left: -8, top: -8}}>
              <circle cx={46} cy={46} r={42} fill="none" stroke={PINK} strokeWidth={4} strokeDasharray={`${ring * 264} 264`} transform="rotate(-90 46 46)" />
            </svg>
          </div>
        );
      })}
      <div
        style={{
          position: 'absolute',
          left: AMANDA.x + 95,
          top: AMANDA.y - 150,
          width: 22,
          height: 22,
          borderRadius: 11,
          background: '#FF3B3B',
          boxShadow: '0 0 14px #FF3B3B',
          opacity: rec ? 1 : 0.25,
        }}
      />
    </>
  );
};

export const Scene05: React.FC = () => {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [0, SCENE05_FRAMES], [1.06, 1.0], {easing: Easing.inOut(Easing.quad)});
  const drift = Math.sin(frame / 40) * 6;
  const phone: Pt = [PHONE[0], PHONE[1] + ownerBob(frame)];

  return (
    <AbsoluteFill>
      <Fonts />
      <Background camX={drift * 3} camY={0} zoom={zoom} />
      {/* back layer */}
      <div style={{position: 'absolute', width: WIDTH, height: HEIGHT, transformOrigin: '50% 30%', transform: `scale(${0.97 + (zoom - 1) * 0.5}) translateX(${drift * 0.5}px)`}}>
        <svg width={WIDTH} height={HEIGHT} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
          <EnergyDefs />
          <EnergyLink
            pts={[[PHONE[0] + 20, PHONE[1] - 30], [1040, PHONE[1] - 160], [1040, MARZUKI.y], [MARZUKI.x + MARZUKI.w / 2, MARZUKI.y]]}
            from={T.beam}
            to={T.marzuki}
            dashed
            width={8}
            loopFrom={T.amanda + 20}
          />
          <EnergyLink
            pts={[[MARZUKI.x - MARZUKI.w / 2, MARZUKI.y], [560, MARZUKI.y], [560, AMANDA.y], [AMANDA.x + 168, AMANDA.y]]}
            from={T.toAmanda}
            to={T.amanda}
            color={PINK}
            loopFrom={T.amanda + 20}
          />
        </svg>
        <AgentCard {...MARZUKI} src={staticFile('clean/staff/Marzuki.png')} name="Marzuki" role="Jalur Langsung" at={T.marzuki} nameSize={32} />
        <ResearchOrbit />
        <RobotHero name="Amanda" role="Konten" x={AMANDA.x} y={AMANDA.y} h={AMANDA.h} at={T.amanda} glow={PINK} />
        <ContentProduction />
      </div>
      {/* front layer */}
      <div style={{position: 'absolute', width: WIDTH, height: HEIGHT, transformOrigin: '50% 100%', transform: `scale(${zoom}) translateX(${drift}px)`}}>
        <OwnerFront pose="typing" {...OWNER} />
        <SpeechBubble text="Riset ide konten & hastage dan KOL yang cocok" start={T.chat} originX={phone[0]} originY={phone[1]} x={590} y={1000} width={450} fontSize={38} />
      </div>

      <Audio src={staticFile('sfx/hum.wav')} volume={0.2} endAt={SCENE05_FRAMES} />
      <Sequence from={0}><Audio src={staticFile('sfx/whoosh.wav')} volume={0.4} /></Sequence>
      <Sequence from={T.typing}><Audio src={staticFile('sfx/typing.wav')} volume={0.45} /></Sequence>
      <Sequence from={T.chat - 2}><Audio src={staticFile('sfx/send.wav')} volume={0.45} /></Sequence>
      <Sequence from={T.chat}><Audio src={staticFile('sfx/pop.wav')} volume={0.4} /></Sequence>
      <Sequence from={T.marzuki - 2}><Audio src={staticFile('sfx/zap.wav')} volume={0.4} /></Sequence>
      {RESEARCH.map((_, i) => (
        <Sequence key={i} from={T.marzuki + 2 + i * 4}><Audio src={staticFile('sfx/pop.wav')} volume={0.2} playbackRate={1.3} /></Sequence>
      ))}
      <Sequence from={T.amanda - 2}><Audio src={staticFile('sfx/zap.wav')} volume={0.4} /></Sequence>
      {CONTENT.map((_, i) => (
        <Sequence key={i} from={T.amanda + 4 + i * 8}><Audio src={staticFile('sfx/sync.wav')} volume={0.25} /></Sequence>
      ))}
    </AbsoluteFill>
  );
};
