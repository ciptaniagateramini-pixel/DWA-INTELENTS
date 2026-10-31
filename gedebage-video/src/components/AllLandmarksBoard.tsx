import React from 'react';
import {interpolate, spring, useVideoConfig} from 'remotion';
import {LANDMARKS, T} from '../config';
import {Camera, project} from '../geo';
import {AnimatedPin, CARD_PHOTO_H, CARD_W, LandmarkConnector, LandmarkPhotoCard} from './Overlays';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const CARD_H = CARD_PHOTO_H + 110;
// Single pop-up slot: lower third, clear of the plot and the iOS bottom bar.
const SINGLE: [number, number] = [390, 1180];

const nearestEdge = (x: number, y: number, px: number, py: number): [number, number] => [
  Math.max(x, Math.min(px, x + CARD_W)),
  Math.max(y, Math.min(py, y + CARD_H)),
];

// Handles both the sequential pop-ups (11–19 s) and the combined board (19–24 s).
export const AllLandmarksBoard: React.FC<{frame: number; cam: Camera}> = ({frame, cam}) => {
  const {fps} = useVideoConfig();
  const [boardStart, boardEnd] = T.board;
  const exit = interpolate(frame, [boardEnd - 15, boardEnd], [1, 0], clamp);
  if (frame < T.popupsStart || exit <= 0) return null;

  return (
    <>
      {LANDMARKS.map((lm, i) => {
        const s = T.popupsStart + i * T.popupEach;
        const e = s + T.popupEach;
        const [mx, my] = project(cam, lm.position);
        const pinIn = spring({frame: frame - s, fps, config: {damping: 12}});
        const onBoard = spring({frame: frame - boardStart - i * 4, fps, config: {damping: 200}, durationInFrames: 20});
        const single = frame < boardStart;
        const singleIn = spring({frame: frame - s, fps, config: {damping: 200}, durationInFrames: 12});
        const singleOut = interpolate(frame, [e - 8, e], [1, 0], clamp);
        const appear = single ? Math.min(singleIn, singleOut) : onBoard;
        const [x, y] = single ? SINGLE : lm.boardSlot;
        const scale = single ? 1.25 : 1;
        // Scaled card bounds for connector endpoint.
        const cx = x + CARD_W / 2;
        const cy = y + CARD_H / 2;
        const bx = cx - (CARD_W * scale) / 2;
        const by = cy - (CARD_H * scale) / 2;
        const [tx, ty] = (() => {
          const [ex, ey] = nearestEdge(0, 0, (mx - bx) / scale, (my - by) / scale);
          return [bx + ex * scale, by + ey * scale] as [number, number];
        })();
        const line = single
          ? Math.min(interpolate(frame, [s + 4, s + 16], [0, 1], clamp), singleOut)
          : interpolate(frame, [boardStart + i * 4, boardStart + i * 4 + 16], [0, 1], clamp);
        return (
          <React.Fragment key={lm.id}>
            <AnimatedPin x={mx} y={my} appear={pinIn * exit} pulse={(frame - s) / 40} size={13} />
            <LandmarkConnector from={[mx, my]} to={[tx, ty]} progress={line * exit} />
            <LandmarkPhotoCard landmark={lm} x={x} y={y} scale={scale} appear={appear * exit} />
          </React.Fragment>
        );
      })}
    </>
  );
};
