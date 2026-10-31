import React from 'react';
import {AbsoluteFill, Easing, interpolate} from 'remotion';
import {LngLat} from '../config';
import {Camera, geometryToPath, merc} from '../geo';
import countries from '../../assets/data/region_countries.geo.json';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.bezier(0.55, 0, 0.3, 1);
const EARTH_KM = 6371.0088;

const cam = (center: LngLat, widthKm: number): Camera => {
  const [cx, cy] = merc(center);
  return {cx, cy, k: 1080 / (widthKm / (EARTH_KM * Math.cos((center[1] * Math.PI) / 180))), widthKm};
};

// Opening "from orbit" shot: Natural Earth outlines rendered with a satellite-like
// procedural texture (no imagery), diving towards Gedebage.
export const SatGlobe: React.FC<{frame: number; opacity: number}> = ({frame, opacity}) => {
  const t = ease(interpolate(frame, [0, 140], [0, 1], clamp));
  const A = cam([116.5, -3.2], 5600);
  const B = cam([107.709, -6.9488], 30);
  const k = Math.exp(Math.log(A.k) + (Math.log(B.k) - Math.log(A.k)) * t);
  const s = (1 / A.k - 1 / k) / (1 / A.k - 1 / B.k);
  const c: Camera = {cx: A.cx + (B.cx - A.cx) * s, cy: A.cy + (B.cy - A.cy) * s, k, widthKm: 0};
  // geometryToPath projects around FOCUS (y = 0.46·H); fine for this shot.
  const paths = (countries as any).features.map((f: any) => geometryToPath(c, f.geometry)).join('');
  const drift = frame * 1.5;
  return (
    <AbsoluteFill style={{opacity}}>
      <svg width={1080} height={1920}>
        <defs>
          <radialGradient id="sea" cx="50%" cy="45%" r="75%">
            <stop offset="0%" stopColor="#0d3a5c" />
            <stop offset="100%" stopColor="#041726" />
          </radialGradient>
          <filter id="terrain" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves={6} seed={4} result="n" />
            <feColorMatrix
              in="n"
              type="matrix"
              values="0.55 0 0 0 0.12  0.35 0.25 0 0 0.22  0.2 0 0.1 0 0.08  0 0 0 0 1"
            />
          </filter>
          <filter id="clouds" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.006" numOctaves={4} seed={9} />
            <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 2.4 -1.25" />
          </filter>
          <clipPath id="land">
            <path d={paths} />
          </clipPath>
        </defs>
        <rect width={1080} height={1920} fill="url(#sea)" />
        <g clipPath="url(#land)">
          <rect width={1080} height={1920} filter="url(#terrain)" />
        </g>
        <path d={paths} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={1.2} />
        <g transform={`translate(${-drift},0)`} opacity={interpolate(frame, [0, 90, 130], [0.3, 0.25, 0], clamp)}>
          <rect x={0} y={0} width={1400} height={1920} filter="url(#clouds)" />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
