import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, FONT} from '../theme';

/**
 * Chat bubble that grows out of a point (the phone). Coordinates are world-space.
 * Shows typing dots for `typingFrames` before the verbatim text appears.
 */
export const SpeechBubble: React.FC<{
  text: string;
  start: number;
  originX: number;
  originY: number;
  x: number;
  y: number;
  width: number;
  typingFrames?: number;
  accent?: string;
}> = ({text, start, originX, originY, x, y, width, typingFrames = 0, accent = COLORS.yellow}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < start) return null;
  const s = spring({frame: frame - start, fps, config: {damping: 12, stiffness: 160, mass: 0.8}});
  const tx = interpolate(s, [0, 1], [originX - x, 0]);
  const ty = interpolate(s, [0, 1], [originY - y, 0]);
  const typing = frame - start < typingFrames;
  const textIn = interpolate(frame - start - typingFrames, [0, 8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width,
        transform: `translate(${tx}px, ${ty}px) scale(${s})`,
        transformOrigin: '0% 100%',
        padding: '30px 36px',
        borderRadius: 40,
        borderBottomLeftRadius: 8,
        background: 'linear-gradient(160deg, rgba(255,255,255,0.98), rgba(236,240,255,0.95))',
        boxShadow: `0 24px 50px rgba(0,0,0,0.45), 0 0 0 4px ${accent}`,
        fontFamily: FONT,
        fontWeight: 600,
        fontSize: 44,
        lineHeight: 1.25,
        color: COLORS.navy,
      }}
    >
      {typing ? (
        <div style={{display: 'flex', gap: 14, height: 55, alignItems: 'center'}}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 18,
                height: 18,
                borderRadius: 9,
                background: COLORS.navy,
                opacity: 0.35 + 0.65 * Math.max(0, Math.sin((frame - start) / 3 - i)),
              }}
            />
          ))}
        </div>
      ) : (
        <div style={{opacity: textIn}}>{text}</div>
      )}
    </div>
  );
};
