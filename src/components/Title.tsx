import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, FONT} from '../theme';

/**
 * Word-by-word spring pop. `text` is rendered verbatim (never altered);
 * `breakAfter` optionally forces a line break after that word index.
 */
export const Title: React.FC<{
  text: string;
  start: number;
  end?: number;
  y: number;
  size?: number;
  color?: string;
  breakAfter?: number;
}> = ({text, start, end, y, size = 64, color = COLORS.yellow, breakAfter}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < start) return null;
  const out = end === undefined ? 0 : interpolate(frame, [end - 8, end], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  if (out >= 1) return null;
  const words = text.split(' ');
  return (
    <div
      style={{
        position: 'absolute',
        left: 60,
        right: 60,
        top: y,
        padding: '22px 30px',
        borderRadius: 36,
        background: 'linear-gradient(160deg, rgba(10,18,48,0.72), rgba(5,9,22,0.6))',
        border: '2px solid rgba(255,201,40,0.35)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        columnGap: size * 0.26,
        fontFamily: FONT,
        fontWeight: 700,
        fontSize: size,
        lineHeight: 1.15,
        color,
        textShadow: '0 6px 18px rgba(0,0,0,0.55), 0 2px 0 rgba(120,70,0,0.6)',
        opacity: (1 - out) * Math.min(1, (frame - start) / 6),
        transform: `translateY(${-out * 30}px)`,
      }}
    >
      {words.map((w, i) => {
        const lineBreak = i === breakAfter ? <div key={`br${i}`} style={{flexBasis: '100%', height: 0}} /> : null;
        const s = spring({frame: frame - start - i * 3, fps, config: {damping: 11, stiffness: 180, mass: 0.7}});
        return [
          <span
            key={i}
            style={{
              display: 'inline-block',
              transform: `translateY(${(1 - s) * 60}px) scale(${0.4 + s * 0.6})`,
              opacity: Math.min(1, s * 1.6),
            }}
          >
            {w}
          </span>,
          lineBreak,
        ];
      })}
    </div>
  );
};
