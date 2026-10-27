import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {COLORS} from '../theme';

export type Pt = [number, number];

export const lengthOf = (pts: Pt[]) => pts.slice(1).reduce((s, p, i) => s + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);

export const pointAt = (pts: Pt[], d: number): Pt => {
  for (let i = 1; i < pts.length; i++) {
    const seg = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    if (d <= seg) {
      const t = seg === 0 ? 0 : d / seg;
      return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t];
    }
    d -= seg;
  }
  return pts[pts.length - 1];
};

export const pathD = (pts: Pt[]) => pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join(' ');

/** Glossy content tile (pink, play triangle) used as the travelling "content" packet. */
export const ContentPacket: React.FC<{x: number; y: number; size?: number}> = ({x, y, size = 44}) => (
  <g transform={`translate(${x - size / 2}, ${y - size / 2})`} style={{filter: 'drop-shadow(0 0 10px rgba(255,80,170,0.9))'}}>
    <rect width={size} height={size} rx={size * 0.28} fill="url(#contentGrad)" stroke="#fff" strokeWidth={2} />
    <path d={`M${size * 0.4},${size * 0.3} L${size * 0.72},${size * 0.5} L${size * 0.4},${size * 0.7} Z`} fill="#fff" />
  </g>
);

/** Shared SVG gradient defs; render once inside every <svg> that uses ContentPacket. */
export const EnergyDefs: React.FC = () => (
  <defs>
    <linearGradient id="contentGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stopColor="#FF8AD0" />
      <stop offset="100%" stopColor="#C2187A" />
    </linearGradient>
  </defs>
);

/**
 * An organisational link that energy travels along from `from` to `to` (frames).
 * After `loopFrom`, small pulses keep flowing to show the work continues.
 */
export const EnergyLink: React.FC<{
  pts: Pt[];
  from: number;
  to: number;
  color?: string;
  width?: number;
  dashed?: boolean;
  loopFrom?: number;
  packet?: boolean;
}> = ({pts, from, to, color = COLORS.yellow, width = 6, dashed, loopFrom, packet}) => {
  const frame = useCurrentFrame();
  const len = lengthOf(pts);
  const p = interpolate(frame, [from, to], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.quad)});
  const head = pointAt(pts, p * len);
  const loop = loopFrom !== undefined && frame > loopFrom ? ((frame - loopFrom + (to % 17)) % 40) / 40 : -1;
  const loopHead = loop >= 0 ? pointAt(pts, loop * len) : null;
  const d = pathD(pts);
  return (
    <g>
      <path d={d} fill="none" stroke="rgba(255,255,255,0.13)" strokeWidth={width} strokeLinejoin="round" strokeDasharray={dashed ? '18 12' : undefined} />
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={width}
        strokeLinejoin="round"
        strokeDasharray={`${len * p} ${len}`}
        style={{filter: `drop-shadow(0 0 8px ${color}) drop-shadow(0 0 18px ${color}99)`}}
      />
      {p > 0 && p < 1 &&
        (packet ? (
          <ContentPacket x={head[0]} y={head[1]} />
        ) : (
          <>
            <circle cx={head[0]} cy={head[1]} r={20} fill="rgba(255,240,180,0.35)" style={{filter: 'blur(6px)'}} />
            <circle cx={head[0]} cy={head[1]} r={10} fill="#FFFFFF" style={{filter: `drop-shadow(0 0 10px ${color})`}} />
          </>
        ))}
      {loopHead && <circle cx={loopHead[0]} cy={loopHead[1]} r={7} fill="#FFF6D0" opacity={0.9} style={{filter: `drop-shadow(0 0 8px ${color})`}} />}
    </g>
  );
};
