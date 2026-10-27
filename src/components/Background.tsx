import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {COLORS} from '../theme';

type Blob = {x: number; y: number; size: number; rot: number; depth: number; alpha: number; phase: number};

// Rounded-square yellow blobs; depth < 1 moves slower than the camera (parallax).
const BLOBS: Blob[] = [
  {x: 110, y: 600, size: 210, rot: 18, depth: 0.25, alpha: 0.9, phase: 0},
  {x: 930, y: 420, size: 150, rot: -12, depth: 0.35, alpha: 0.75, phase: 1.3},
  {x: 980, y: 1500, size: 240, rot: 26, depth: 0.2, alpha: 0.55, phase: 2.1},
  {x: 70, y: 1380, size: 120, rot: -20, depth: 0.45, alpha: 0.7, phase: 0.7},
  {x: 960, y: 90, size: 90, rot: 8, depth: 0.55, alpha: 0.6, phase: 2.8},
  {x: 300, y: 1760, size: 160, rot: 32, depth: 0.3, alpha: 0.45, phase: 1.9},
];

export const Background: React.FC<{camX: number; camY: number; zoom: number}> = ({camX, camY, zoom}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(120% 80% at 50% 38%, #1B2A6B 0%, ${COLORS.navy} 48%, ${COLORS.navyDeep} 100%)`,
        overflow: 'hidden',
      }}
    >
      {/* perspective tech grid floor */}
      <AbsoluteFill style={{perspective: 900, perspectiveOrigin: '50% 30%'}}>
        <div
          style={{
            position: 'absolute',
            left: -1200,
            right: -1200,
            top: 1150,
            height: 1600,
            transform: `rotateX(72deg) translateX(${-camX * 0.15}px)`,
            transformOrigin: '50% 0%',
            backgroundImage:
              'linear-gradient(rgba(255,201,40,0.16) 2px, transparent 2px), linear-gradient(90deg, rgba(255,201,40,0.16) 2px, transparent 2px)',
            backgroundSize: '120px 120px',
            backgroundPosition: `0 ${(frame * 2) % 120}px`,
            maskImage: 'linear-gradient(to bottom, transparent, black 25%, black 60%, transparent)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 25%, black 60%, transparent)',
          }}
        />
      </AbsoluteFill>
      {BLOBS.map((b, i) => {
        const float = Math.sin(frame / 22 + b.phase) * 14;
        const spin = Math.sin(frame / 40 + b.phase) * 6;
        const s = interpolate(zoom, [0.5, 1.4], [0.85, 1.15]) ** b.depth;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: b.x - b.size / 2 - camX * b.depth * 0.35,
              top: b.y - b.size / 2 + float - camY * b.depth * 0.2,
              width: b.size,
              height: b.size,
              borderRadius: b.size * 0.28,
              background: `linear-gradient(145deg, #FFE27A 0%, ${COLORS.yellow} 45%, ${COLORS.yellowDeep} 100%)`,
              boxShadow: `inset -10px -14px 24px rgba(160,90,0,0.45), inset 10px 12px 20px rgba(255,255,255,0.5), 0 24px 50px rgba(0,0,0,0.45)`,
              opacity: b.alpha,
              transform: `rotate(${b.rot + spin}deg) scale(${s})`,
              filter: b.depth < 0.3 ? 'blur(3px)' : undefined,
            }}
          />
        );
      })}
      {/* vignette */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)'}} />
    </AbsoluteFill>
  );
};
