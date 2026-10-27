import {AbsoluteFill, Audio, Easing, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Background} from '../components/Background';
import {Character} from '../components/Character';
import {Fonts} from '../components/Fonts';
import {SpeechBubble} from '../components/SpeechBubble';
import {Title} from '../components/Title';
import {HEIGHT, WIDTH} from '../theme';

const owner = (name: string) => staticFile(`clean/scene01/${name}.png`);
const ASPECT = 1024 / 1536;
const H = 1350;
const BOTTOM = 1900;

// World layout: the three Owner poses stand side by side; the camera travels between them.
const POSES = {
  present: {src: owner('Ownerbb-Melihatkan hp'), x: 420},
  typing: {src: owner('Ownerbb mengetik pesan'), x: 1180},
  reading: {src: owner('Ownerbb-melihat pesan'), x: 1940},
};
// Phone position inside the typing/reading renders (fraction of the image box).
const PHONE = {x: 0.83, y: 0.44};
const phoneAt = (cx: number) => ({x: cx - (H * ASPECT) / 2 + PHONE.x * H * ASPECT, y: BOTTOM - H + PHONE.y * H});

// Beat timing (frames @30fps). Scene 01 = 240 frames.
export const S1 = {
  intro: 2, // camera dives from overview onto the presenting pose
  title1: 14,
  toTyping: 84,
  title2: 100,
  bubble1: 112,
  toReading: 164,
  title3: 180,
  bubble2: 186,
};

export const Scene01: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const move = (start: number) => spring({frame: frame - start, fps, config: {damping: 15, stiffness: 70, mass: 1}});
  const p1 = move(S1.intro);
  const p2 = move(S1.toTyping);
  const p3 = move(S1.toReading);

  const camX = interpolate(p1, [0, 1], [1180, POSES.present.x]) + (POSES.typing.x - POSES.present.x) * p2 + (POSES.reading.x - POSES.typing.x) * p3;
  const slowPush = interpolate(frame, [0, 240], [0, 0.06], {easing: Easing.inOut(Easing.quad)});
  const zoom = interpolate(p1, [0, 1], [0.46, 1.0]) + slowPush - Math.sin(Math.PI * Math.min(1, p2)) * 0.12 * (1 - p3) - Math.sin(Math.PI * Math.min(1, p3)) * 0.12;
  const camY = interpolate(p1, [0, 1], [1260, 990]);
  const roll = Math.sin(frame / 45) * 0.6;

  const focus = {
    present: interpolate(p1, [0, 1], [0.7, 1]) * (1 - p2),
    typing: interpolate(p1, [0, 1], [0.7, 0]) * (1 - p2) + p2 * (1 - p3),
    reading: interpolate(p1, [0, 1], [0.7, 0]) * (1 - p2) + p3,
  };

  const ph1 = phoneAt(POSES.typing.x);
  const ph2 = phoneAt(POSES.reading.x);

  return (
    <AbsoluteFill>
      <Fonts />
      <Background camX={camX - 1180} camY={camY - 990} zoom={zoom} />
      {/* camera */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: WIDTH,
          height: HEIGHT,
          transformOrigin: '0 0',
          transform: `translate(${WIDTH / 2}px, ${HEIGHT / 2}px) rotate(${roll}deg) scale(${zoom}) translate(${-camX}px, ${-camY}px)`,
        }}
      >
        {(['present', 'typing', 'reading'] as const).map((k, i) => (
          <Character key={k} src={POSES[k].src} x={POSES[k].x} bottom={BOTTOM} height={H} aspect={ASPECT} focus={focus[k]} phase={i * 1.7} />
        ))}
        <SpeechBubble
          text="Buat riset harga kompetitor kepada Marzuki"
          start={S1.bubble1}
          typingFrames={18}
          originX={ph1.x}
          originY={ph1.y}
          x={POSES.typing.x - 420}
          y={380}
          width={840}
        />
        <SpeechBubble
          text="Laporan penjualan hari ini xxxx"
          start={S1.bubble2}
          originX={ph2.x}
          originY={ph2.y}
          x={POSES.reading.x - 420}
          y={380}
          width={840}
        />
      </div>
      <Title text="Kenalin Owner TOKO BB GOLD" start={S1.title1} end={S1.toTyping + 6} y={170} size={70} breakAfter={1} />
      <Title text="Tinggal kirim perintah" start={S1.title2} end={S1.toReading + 6} y={170} size={70} />
      <Title text="Terima laporan rapih ONTIME" start={S1.title3} y={170} size={66} />

      {/* SFX aligned to actions */}
      <Sequence from={0}><Audio src={staticFile('sfx/whoosh.wav')} volume={0.7} /></Sequence>
      <Sequence from={S1.title1}><Audio src={staticFile('sfx/pop.wav')} volume={0.6} /></Sequence>
      <Sequence from={S1.toTyping - 4}><Audio src={staticFile('sfx/whoosh.wav')} volume={0.6} /></Sequence>
      <Sequence from={S1.title2}><Audio src={staticFile('sfx/pop.wav')} volume={0.55} /></Sequence>
      <Sequence from={S1.bubble1}><Audio src={staticFile('sfx/typing.wav')} volume={0.6} /></Sequence>
      <Sequence from={S1.toReading - 4}><Audio src={staticFile('sfx/whoosh.wav')} volume={0.6} /></Sequence>
      <Sequence from={S1.title3}><Audio src={staticFile('sfx/pop.wav')} volume={0.55} /></Sequence>
      <Sequence from={S1.bubble2}><Audio src={staticFile('sfx/ting.wav')} volume={0.6} /></Sequence>
    </AbsoluteFill>
  );
};
