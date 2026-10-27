import {Easing, Img, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, FONT} from '../theme';

export const RED = '#E8303A';
export const GREEN = '#22C55E';

export type AgentCardProps = {
  x: number;
  y: number;
  w: number;
  h: number;
  img: number;
  src: string;
  name: string;
  role: string;
  /** frame the energy reaches this card */
  at: number;
  accent?: string;
  badge?: string;
  badgeText?: string;
  /** show the sync bar + check once lit (channel updated) */
  update?: boolean;
  nameSize?: number;
};

const UpdateBadge: React.FC<{at: number; w: number}> = ({at, w}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < at) return null;
  const fill = interpolate(frame - at, [0, 12], [0, 1], {extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const check = spring({frame: frame - at - 12, fps, config: {damping: 9, stiffness: 220}});
  const s = Math.min(46, w * 0.3);
  return (
    <>
      <div style={{position: 'absolute', left: 14, right: 14, bottom: 8, height: 7, borderRadius: 4, background: 'rgba(255,255,255,0.15)'}}>
        <div style={{width: `${fill * 100}%`, height: '100%', borderRadius: 4, background: `linear-gradient(90deg, ${COLORS.yellow}, ${GREEN})`, boxShadow: `0 0 10px ${GREEN}`}} />
      </div>
      <div
        style={{
          position: 'absolute',
          right: 6,
          top: 6,
          width: s,
          height: s,
          borderRadius: s / 2,
          background: GREEN,
          boxShadow: `0 0 18px ${GREEN}, 0 6px 14px rgba(0,0,0,0.4)`,
          transform: `scale(${check})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width={s * 0.6} height={s * 0.6} viewBox="0 0 24 24">
          <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#fff" strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </>
  );
};

/** Glass card with the character on a glossy plate; lights up when energy arrives at `at`. */
export const AgentCard: React.FC<AgentCardProps> = (c) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const lit = spring({frame: frame - c.at, fps, config: {damping: 8, stiffness: 200}});
  const flash = interpolate(frame - c.at, [0, 4, 18], [0, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const accent = c.accent ?? COLORS.yellow;
  const nameSize = c.nameSize ?? 28;
  return (
    <div
      style={{
        position: 'absolute',
        left: c.x - c.w / 2,
        top: c.y - c.h / 2,
        width: c.w,
        height: c.h,
        borderRadius: Math.min(30, c.w * 0.18),
        background: `linear-gradient(160deg, rgba(30,44,100,${0.7 + lit * 0.25}), rgba(8,14,40,0.92))`,
        border: `${c.accent ? 4 : 3}px solid ${lit > 0.05 ? accent : 'rgba(255,255,255,0.16)'}`,
        boxShadow: `0 16px 34px rgba(0,0,0,0.5), 0 0 ${38 * lit}px ${accent}AA, inset 0 0 ${28 * flash}px rgba(255,255,255,0.8)`,
        transform: `scale(${1 + flash * 0.07})`,
        filter: `brightness(${0.45 + lit * 0.55}) saturate(${0.5 + lit * 0.5})`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: c.w / 2 - c.img / 2,
          top: 8,
          width: c.img,
          height: c.img,
          borderRadius: c.img * 0.26,
          background: `linear-gradient(150deg, #FFE48A, ${c.accent ? '#FF6B6B' : COLORS.yellow} 50%, ${c.accent ? '#B3121C' : COLORS.yellowDeep})`,
          boxShadow: 'inset -8px -10px 18px rgba(120,60,0,0.4), inset 8px 8px 16px rgba(255,255,255,0.5)',
          overflow: 'hidden',
        }}
      >
        <Img src={c.src} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 8%'}} />
      </div>
      {c.badge && (
        <Img src={c.badge} style={{position: 'absolute', left: 6, top: 4, width: c.img * 0.5, height: c.img * 0.5, objectFit: 'contain', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))'}} />
      )}
      {c.badgeText && (
        <div
          style={{
            position: 'absolute',
            left: 8,
            top: 8,
            width: c.img * 0.45,
            height: c.img * 0.45,
            borderRadius: 12,
            background: `linear-gradient(150deg, #FFE48A, ${COLORS.yellow}, ${COLORS.yellowDeep})`,
            boxShadow: 'inset -4px -5px 10px rgba(120,60,0,0.4), 0 4px 8px rgba(0,0,0,0.5)',
            fontFamily: FONT,
            fontWeight: 800,
            fontSize: c.img * 0.2,
            color: COLORS.navy,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {c.badgeText}
        </div>
      )}
      <div style={{position: 'absolute', left: 4, right: 4, top: c.img + 12, textAlign: 'center', fontFamily: FONT, lineHeight: 1.1}}>
        <div style={{fontWeight: 700, fontSize: nameSize, color: COLORS.white, whiteSpace: 'nowrap'}}>{c.name}</div>
        <div style={{fontWeight: 600, fontSize: nameSize * 0.76, color: c.accent ? '#FF8A8F' : COLORS.yellow, whiteSpace: 'nowrap'}}>{c.role}</div>
      </div>
      {c.update && <UpdateBadge at={c.at} w={c.w} />}
    </div>
  );
};
