import {AbsoluteFill, Audio, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Background} from '../components/Background';
import {Fonts} from '../components/Fonts';
import {COLORS, FONT} from '../theme';

/** Scene 12 — closing card with CTA and the outro music bed. */
export const SCENE12_FRAMES = 300;

const T = {title: 8, q1: 66, q2: 112, cta: 168, number: 186};
const WA_NUMBER = '0882000119208';
const BRAND_LEFT = 'DWA';
const BRAND_RIGHT = 'TOKO BB';
// shrink the highlight for longer names so it always fits the 1080 px width
const TITLE_SIZE = Math.min(118, Math.floor(1600 / `${BRAND_LEFT} X ${BRAND_RIGHT}`.length));
const ROBOTS = ['Bu Mila', 'Marzuki', 'Acep', 'Bambang', 'Angga', 'Fitri', 'Wawan', 'Lilis', 'Baron', 'Winda', 'Fajar', 'Amanda'];

const usePop = (start: number, damping = 11) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: frame - start, fps, config: {damping, stiffness: 170, mass: 0.8}});
};

/** A line of text that pops up on a solid block, the block wiping in underneath first. */
const BlockLine: React.FC<{text: string; start: number; top: number; size: number; block: string; color: string}> = ({text, start, top, size, block, color}) => {
  const frame = useCurrentFrame();
  const wipe = interpolate(frame, [start, start + 10], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const pop = usePop(start + 6);
  if (frame < start) return null;
  return (
    <div style={{position: 'absolute', left: 70, right: 70, top, display: 'flex', justifyContent: 'center'}}>
      <div style={{position: 'relative', padding: `${size * 0.32}px ${size * 0.6}px`}}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: size * 0.4,
            background: block,
            boxShadow: '0 18px 40px rgba(0,0,0,0.45)',
            transform: `scaleX(${wipe})`,
            transformOrigin: '0% 50%',
          }}
        />
        <div
          style={{
            position: 'relative',
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: size,
            lineHeight: 1.18,
            color,
            textAlign: 'center',
            transform: `translateY(${(1 - pop) * 30}px) scale(${0.85 + pop * 0.15})`,
            opacity: Math.min(1, pop * 1.5),
          }}
        >
          {text}
        </div>
      </div>
    </div>
  );
};

export const Scene12: React.FC = () => {
  const frame = useCurrentFrame();
  const title = usePop(T.title, 9);
  const cta = usePop(T.cta);
  const num = usePop(T.number, 9);
  const shine = interpolate(frame, [T.title + 10, T.title + 40], [-30, 130], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const glow = 0.6 + Math.sin(frame / 10) * 0.25;

  return (
    <AbsoluteFill>
      <Fonts />
      <Background camX={frame * 0.6} camY={0} zoom={1 + frame * 0.0003} />

      {/* highlight: DWA X TOKO BB */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 230, display: 'flex', justifyContent: 'center', transform: `scale(${0.5 + title * 0.5})`, opacity: Math.min(1, title * 1.4)}}>
        <div
          style={{
            position: 'relative',
            fontFamily: FONT,
            fontWeight: 800,
            fontSize: TITLE_SIZE,
            letterSpacing: 2,
            color: COLORS.white,
            textShadow: `0 10px 30px rgba(0,0,0,0.6), 0 0 ${40 * glow}px rgba(255,201,40,0.55)`,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            padding: '0 10px',
          }}
        >
          {BRAND_LEFT} <span style={{color: COLORS.yellow}}>X</span> {BRAND_RIGHT}
          <div style={{position: 'absolute', top: 0, bottom: 0, left: `${shine}%`, width: '18%', background: 'linear-gradient(100deg, transparent, rgba(255,255,255,0.55), transparent)', transform: 'skewX(-20deg)'}} />
        </div>
      </div>
      <div style={{position: 'absolute', left: 340, right: 340, top: 392, height: 10, borderRadius: 5, background: COLORS.yellow, transform: `scaleX(${title})`, boxShadow: `0 0 20px ${COLORS.yellow}`}} />

      <BlockLine text="Mau bisnismu lebih efisien?" start={T.q1} top={560} size={52} block="linear-gradient(160deg, #FFFFFF, #EEF2FF)" color={COLORS.navy} />
      <BlockLine text="Mau custom sesuai kebutuhan bisnismu juga?" start={T.q2} top={720} size={50} block="linear-gradient(160deg, #FFFFFF, #EEF2FF)" color={COLORS.navy} />

      {/* CTA block */}
      {frame >= T.cta && (
        <div
          style={{
            position: 'absolute',
            left: 80,
            right: 80,
            top: 990,
            padding: '34px 30px 38px',
            borderRadius: 40,
            background: `linear-gradient(150deg, #FFE48A, ${COLORS.yellow} 50%, ${COLORS.yellowDeep})`,
            boxShadow: `inset -10px -14px 26px rgba(150,80,0,0.35), inset 10px 12px 22px rgba(255,255,255,0.5), 0 26px 60px rgba(0,0,0,0.5), 0 0 ${50 * glow}px rgba(255,201,40,0.5)`,
            transform: `scale(${cta})`,
            fontFamily: FONT,
            color: COLORS.navy,
            textAlign: 'center',
          }}
        >
          <div style={{fontWeight: 600, fontSize: 44}}>Bisa diskusi ke link bio atau</div>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 22, marginTop: 18, transform: `scale(${num})`}}>
            <Img src={staticFile('clean/logos/WA Logo No Background.png')} style={{width: 112, height: 112, objectFit: 'contain', filter: 'drop-shadow(0 8px 14px rgba(0,0,0,0.35))'}} />
            <div style={{fontWeight: 800, fontSize: 76, letterSpacing: 1}}>{WA_NUMBER}</div>
          </div>
        </div>
      )}

      {/* the AI staff parade along the bottom */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 1480, height: 360, overflow: 'hidden', opacity: interpolate(frame, [20, 40], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}>
        {[...ROBOTS, ...ROBOTS].map((r, i) => {
          const x = i * 210 - ((frame * 4) % (ROBOTS.length * 210));
          return (
            <Img
              key={i}
              src={staticFile(`clean/staff/${r}.png`)}
              style={{position: 'absolute', left: x, top: 40 + Math.sin((frame + i * 11) / 10) * 10, width: 200, height: 260, objectFit: 'contain', filter: 'drop-shadow(0 16px 18px rgba(0,0,0,0.5))'}}
            />
          );
        })}
      </div>

      <Audio src={staticFile('music/outro_scene12.wav')} volume={0.55} />
      <Sequence from={0}><Audio src={staticFile('sfx/whoosh.wav')} volume={0.4} /></Sequence>
      <Sequence from={T.title}><Audio src={staticFile('sfx/pop.wav')} volume={0.5} playbackRate={0.8} /></Sequence>
      <Sequence from={T.title + 10}><Audio src={staticFile('sfx/ting.wav')} volume={0.35} /></Sequence>
      <Sequence from={T.q1 + 4}><Audio src={staticFile('sfx/pop.wav')} volume={0.4} /></Sequence>
      <Sequence from={T.q2 + 4}><Audio src={staticFile('sfx/pop.wav')} volume={0.4} /></Sequence>
      <Sequence from={T.cta - 4}><Audio src={staticFile('sfx/whoosh.wav')} volume={0.35} /></Sequence>
      <Sequence from={T.number}><Audio src={staticFile('sfx/ting.wav')} volume={0.45} /></Sequence>
    </AbsoluteFill>
  );
};
