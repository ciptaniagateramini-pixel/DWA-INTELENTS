import React from 'react';
import {interpolate, spring, useVideoConfig} from 'remotion';
import {COLORS, HEIGHT, Landmark, LngLat, WIDTH} from '../config';
import {Camera, project, ringToPath} from '../geo';

const FONT = 'Poppins, sans-serif';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const slatePanel: React.CSSProperties = {
  background: COLORS.slate,
  border: '1px solid rgba(230,182,76,0.35)',
  borderRadius: 22,
  backdropFilter: 'blur(10px)',
  boxShadow: '0 18px 40px rgba(0,0,0,0.35)',
};

/* ---------- Headline ---------- */
export const Headline: React.FC<{
  text: string;
  frame: number;
  start: number;
  end: number;
  top?: number;
  size?: number;
}> = ({text, frame, start, end, top = 250, size = 64}) => {
  const {fps} = useVideoConfig();
  const inP = spring({frame: frame - start, fps, config: {damping: 200}, durationInFrames: 18});
  const out = interpolate(frame, [end - 12, end], [1, 0], clamp);
  const o = Math.min(inP, out);
  if (o <= 0) return null;
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: 70,
        right: 70,
        textAlign: 'center',
        fontFamily: FONT,
        fontWeight: 700,
        fontSize: size,
        lineHeight: 1.18,
        color: COLORS.white,
        opacity: o,
        transform: `translateY(${(1 - inP) * 24}px)`,
        textShadow: '0 4px 24px rgba(0,0,0,0.65)',
      }}
    >
      {text}
      <div style={{width: 120, height: 5, borderRadius: 3, background: COLORS.mustard, margin: '26px auto 0'}} />
    </div>
  );
};

/* ---------- LandPolygon ---------- */
export const LandPolygon: React.FC<{cam: Camera; ring: LngLat[]; progress: number; glow?: number}> = ({
  cam,
  ring,
  progress,
  glow = 1,
}) => {
  const pts = ring.map((p) => project(cam, p));
  let perim = 0;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    perim += Math.hypot(b[0] - a[0], b[1] - a[1]);
  }
  const d = ringToPath(cam, ring);
  return (
    <svg width={WIDTH} height={HEIGHT} style={{position: 'absolute', inset: 0}}>
      <path d={d} fill={`rgba(230,182,76,${0.18 * progress})`} stroke="none" />
      <path
        d={d}
        fill="none"
        stroke={COLORS.mustard}
        strokeWidth={14}
        strokeOpacity={0.25 * glow}
        strokeDasharray={perim}
        strokeDashoffset={perim * (1 - progress)}
        strokeLinejoin="round"
      />
      <path
        d={d}
        fill="none"
        stroke={COLORS.mustard}
        strokeWidth={5}
        strokeDasharray={perim}
        strokeDashoffset={perim * (1 - progress)}
        strokeLinejoin="round"
      />
    </svg>
  );
};

/* ---------- AnimatedPin ---------- */
export const AnimatedPin: React.FC<{x: number; y: number; appear: number; pulse?: number; size?: number}> = ({
  x,
  y,
  appear,
  pulse = 0,
  size = 16,
}) => {
  if (appear <= 0) return null;
  const ring = (pulse % 1) * 2.4;
  return (
    <svg width={WIDTH} height={HEIGHT} style={{position: 'absolute', inset: 0}}>
      <circle cx={x} cy={y} r={size * (1 + ring)} fill="none" stroke={COLORS.mustard} strokeOpacity={(1 - (pulse % 1)) * 0.6} strokeWidth={2} />
      <circle cx={x} cy={y} r={size * appear} fill={COLORS.slateSolid} stroke={COLORS.mustard} strokeWidth={4} />
      <circle cx={x} cy={y} r={size * 0.4 * appear} fill={COLORS.mustard} />
    </svg>
  );
};

/* ---------- LandmarkConnector ---------- */
export const LandmarkConnector: React.FC<{from: [number, number]; to: [number, number]; progress: number}> = ({
  from,
  to,
  progress,
}) => {
  if (progress <= 0) return null;
  const x = from[0] + (to[0] - from[0]) * progress;
  const y = from[1] + (to[1] - from[1]) * progress;
  return (
    <svg width={WIDTH} height={HEIGHT} style={{position: 'absolute', inset: 0}}>
      <line x1={from[0]} y1={from[1]} x2={x} y2={y} stroke={COLORS.mustard} strokeWidth={2.5} strokeLinecap="round" />
      <circle cx={x} cy={y} r={5} fill={COLORS.mustard} />
    </svg>
  );
};

/* ---------- LandmarkPhotoCard ---------- */
export const CARD_W = 300;
export const CARD_PHOTO_H = 180;
export const LandmarkPhotoCard: React.FC<{
  landmark: Landmark;
  x: number;
  y: number;
  scale?: number;
  appear: number;
}> = ({landmark, x, y, scale = 1, appear}) => {
  if (appear <= 0) return null;
  return (
    <div
      style={{
        ...slatePanel,
        position: 'absolute',
        left: x,
        top: y,
        width: CARD_W,
        padding: 12,
        transformOrigin: 'center',
        transform: `scale(${scale * (0.85 + 0.15 * appear)})`,
        opacity: appear,
        fontFamily: FONT,
      }}
    >
      <div
        style={{
          height: CARD_PHOTO_H,
          borderRadius: 14,
          overflow: 'hidden',
          position: 'relative',
          background: 'repeating-linear-gradient(135deg,#1E2A37 0 14px,#24313F 14px 28px)',
        }}
      >
        {landmark.photo ? (
          <img src={landmark.photo.file} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        ) : (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: COLORS.muted,
              fontSize: 17,
              textAlign: 'center',
              lineHeight: 1.3,
              border: '2px dashed rgba(230,182,76,0.5)',
              borderRadius: 14,
            }}
          >
            <div style={{color: COLORS.mustard, fontWeight: 700, fontSize: 15, letterSpacing: 2}}>PLACEHOLDER</div>
            <div>Foto berlisensi</div>
            <div>belum terpasang</div>
          </div>
        )}
      </div>
      <div style={{color: COLORS.white, fontWeight: 600, fontSize: 25, marginTop: 10, lineHeight: 1.15}}>
        {landmark.name}
      </div>
      <div style={{color: landmark.verified ? COLORS.mustard : COLORS.muted, fontSize: 19, marginTop: 4, fontWeight: 500}}>
        {landmark.distanceLabel}
      </div>
      {landmark.photo && (
        <div style={{color: COLORS.muted, fontSize: 11, marginTop: 4}}>{landmark.photo.credit}</div>
      )}
    </div>
  );
};

/* ---------- PriceCTA ---------- */
export const PriceCTA: React.FC<{frame: number; start: number; lines: {a: string; b: string; cta: string; note: string}}> = ({
  frame,
  start,
  lines,
}) => {
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - start, fps, config: {damping: 200}, durationInFrames: 22});
  const ctaP = spring({frame: frame - start - 18, fps, config: {damping: 14}});
  if (p <= 0) return null;
  return (
    <div
      style={{
        ...slatePanel,
        position: 'absolute',
        left: 90,
        right: 90,
        top: 1240,
        padding: '34px 30px',
        textAlign: 'center',
        fontFamily: FONT,
        opacity: p,
        transform: `translateY(${(1 - p) * 40}px)`,
      }}
    >
      <div style={{color: COLORS.white, fontSize: 58, fontWeight: 700}}>{lines.a}</div>
      <div style={{color: COLORS.mustard, fontSize: 54, fontWeight: 700, marginTop: 6}}>{lines.b}</div>
      <div
        style={{
          display: 'inline-block',
          marginTop: 26,
          padding: '16px 44px',
          borderRadius: 999,
          background: COLORS.mustard,
          color: COLORS.slateSolid,
          fontSize: 34,
          fontWeight: 700,
          transform: `scale(${0.8 + 0.2 * ctaP})`,
        }}
      >
        {lines.cta}
      </div>
      <div style={{color: COLORS.muted, fontSize: 18, marginTop: 18}}>{lines.note}</div>
    </div>
  );
};
