import {Img, interpolate, useCurrentFrame} from 'remotion';
import {COLORS} from '../theme';

type Props = {
  src: string;
  /** world-space centre x and bottom y of the image box */
  x: number;
  bottom: number;
  height: number;
  aspect: number; // width / height of the source image
  /** 0 = background (dimmed, defocused), 1 = camera focus */
  focus: number;
  phase?: number;
};

export const Character: React.FC<Props> = ({src, x, bottom, height, aspect, focus, phase = 0}) => {
  const frame = useCurrentFrame();
  const width = height * aspect;
  const breathe = 1 + Math.sin(frame / 18 + phase) * 0.006;
  const bob = Math.sin(frame / 24 + phase) * 6;
  const dim = interpolate(focus, [0, 1], [0.45, 1]);
  const blur = interpolate(focus, [0, 1], [5, 0]);
  const plate = height * 0.72;

  return (
    <div style={{position: 'absolute', left: x - width / 2, top: bottom - height, width, height}}>
      {/* glossy yellow rounded-square backplate */}
      <div
        style={{
          position: 'absolute',
          left: width / 2 - plate / 2,
          top: height * 0.12 + bob * 0.4,
          width: plate,
          height: plate,
          borderRadius: plate * 0.24,
          background: `linear-gradient(150deg, #FFE48A 0%, ${COLORS.yellow} 42%, ${COLORS.yellowDeep} 100%)`,
          boxShadow:
            'inset -18px -22px 40px rgba(150,80,0,0.45), inset 16px 18px 34px rgba(255,255,255,0.55), 0 40px 80px rgba(0,0,0,0.5)',
          transform: `perspective(1400px) rotateY(${-8 + Math.sin(frame / 50 + phase) * 4}deg) rotate(${-6 + Math.sin(frame / 60 + phase) * 2}deg)`,
          opacity: interpolate(focus, [0, 1], [0.35, 1]),
          filter: `blur(${blur * 0.6}px)`,
        }}
      />
      {/* soft rim light behind the figure */}
      <div
        style={{
          position: 'absolute',
          inset: '8% 14% 10% 14%',
          borderRadius: '45%',
          background: 'radial-gradient(closest-side, rgba(255,214,90,0.45), transparent)',
          filter: 'blur(30px)',
          opacity: focus,
        }}
      />
      <Img
        src={src}
        style={{
          position: 'absolute',
          inset: 0,
          width,
          height,
          transform: `translateY(${bob}px) scale(${breathe})`,
          transformOrigin: '50% 100%',
          filter: `drop-shadow(0 30px 40px rgba(0,0,0,0.55)) drop-shadow(0 0 2px rgba(0,0,0,0.35)) brightness(${dim}) blur(${blur}px)`,
          // the source renders are cut at the waist; dissolve that edge instead of showing a hard line
          maskImage: 'linear-gradient(to bottom, black 78%, transparent 99%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 78%, transparent 99%)',
        }}
      />
    </div>
  );
};
