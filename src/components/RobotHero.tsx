import {Img, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, FONT} from '../theme';

/** A large robot on its glossy plate with name/role, lighting up at `at`. */
export const RobotHero: React.FC<{name: string; role: string; x: number; y: number; h: number; at: number; glow?: string; file?: string}> = ({name, role, x, y, h, at, glow = COLORS.yellow, file}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const lit = spring({frame: frame - at, fps, config: {damping: 8, stiffness: 180}});
  const bob = Math.sin((frame + x) / 20) * 6;
  const w = h * 0.75;
  const plate = h * 0.78;
  return (
    <div style={{position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h + 70}}>
      <div
        style={{
          position: 'absolute',
          left: w / 2 - plate * 0.62,
          top: h * 0.2,
          width: plate * 1.24,
          height: plate * 1.0,
          borderRadius: '50%',
          background: `radial-gradient(closest-side, ${glow}, transparent)`,
          opacity: 0.25 + lit * 0.55,
          filter: 'blur(30px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: w / 2 - plate / 2,
          top: h * 0.16,
          width: plate,
          height: plate,
          borderRadius: plate * 0.26,
          background: `linear-gradient(150deg, #FFE48A 0%, ${COLORS.yellow} 45%, ${COLORS.yellowDeep} 100%)`,
          boxShadow: `inset -12px -16px 30px rgba(150,80,0,0.45), inset 12px 14px 26px rgba(255,255,255,0.55), 0 26px 50px rgba(0,0,0,0.5), 0 0 ${50 * lit}px ${glow}`,
          filter: `brightness(${0.55 + lit * 0.45})`,
        }}
      />
      <Img
        src={staticFile(`clean/staff/${file ?? name}.png`)}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: w,
          height: h,
          objectFit: 'contain',
          transform: `translateY(${bob}px) scale(${1 + lit * 0.03})`,
          filter: `drop-shadow(0 20px 24px rgba(0,0,0,0.55)) brightness(${0.55 + lit * 0.45})`,
        }}
      />
      <div style={{position: 'absolute', left: -40, right: -40, top: h + 4, textAlign: 'center', fontFamily: FONT, lineHeight: 1.1, opacity: 0.5 + lit * 0.5}}>
        <div style={{fontWeight: 700, fontSize: 34, color: COLORS.white, textShadow: '0 4px 12px rgba(0,0,0,0.8)'}}>{name}</div>
        <div style={{fontWeight: 600, fontSize: 25, color: glow === COLORS.yellow ? COLORS.yellow : glow, textShadow: '0 4px 12px rgba(0,0,0,0.8)'}}>{role}</div>
      </div>
    </div>
  );
};
