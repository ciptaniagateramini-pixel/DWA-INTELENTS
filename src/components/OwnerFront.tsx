import {Img, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import type {Pt} from './Energy';

const ASPECT = 1024 / 1536;

export const OWNER_POSES = {
  typing: {file: 'Ownerbb mengetik pesan', phone: [0.82, 0.45] as Pt},
  reading: {file: 'Ownerbb-melihat pesan', phone: [0.83, 0.42] as Pt},
  present: {file: 'Ownerbb-Melihatkan hp', phone: [0.13, 0.46] as Pt},
};
export type OwnerPose = keyof typeof OWNER_POSES;

export const ownerBox = (x: number, bottom: number, h: number) => ({left: x - (h * ASPECT) / 2, top: bottom - h, w: h * ASPECT, h});

/** Phone position (screen space) of a pose placed at centre `x`, `bottom`, height `h`. */
export const phoneOf = (pose: OwnerPose, x: number, bottom: number, h: number): Pt => {
  const b = ownerBox(x, bottom, h);
  const [fx, fy] = OWNER_POSES[pose].phone;
  return [b.left + fx * b.w, b.top + fy * b.h];
};

/** Owner cut-out standing in front of the scene: rises in, floats gently, waist edge dissolved. */
export const OwnerFront: React.FC<{pose: OwnerPose; x: number; bottom: number; h: number; enterAt?: number}> = ({pose, x, bottom, h, enterAt = 0}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({frame: frame - enterAt, fps, config: {damping: 16, stiffness: 80}});
  const bob = Math.sin(frame / 22) * 8;
  const breathe = 1 + Math.sin(frame / 18) * 0.006;
  const b = ownerBox(x, bottom, h);
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: b.left + b.w * 0.08,
          top: b.top + b.h * 0.2,
          width: b.w * 0.84,
          height: b.h * 0.7,
          borderRadius: '45%',
          background: 'radial-gradient(closest-side, rgba(255,214,90,0.35), transparent)',
          filter: 'blur(40px)',
        }}
      />
      <Img
        src={staticFile(`clean/scene01/${OWNER_POSES[pose].file}.png`)}
        style={{
          position: 'absolute',
          left: b.left,
          top: b.top,
          width: b.w,
          height: b.h,
          transform: `translateY(${(1 - enter) * 260 + bob}px) scale(${breathe})`,
          transformOrigin: '50% 100%',
          filter: 'drop-shadow(0 30px 40px rgba(0,0,0,0.6)) drop-shadow(0 -6px 30px rgba(0,0,0,0.45))',
          maskImage: 'linear-gradient(to bottom, black 80%, transparent 99%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 80%, transparent 99%)',
        }}
      />
    </>
  );
};

/** Vertical float offset used by OwnerFront, so bubbles can follow the phone. */
export const ownerBob = (frame: number) => Math.sin(frame / 22) * 8;
