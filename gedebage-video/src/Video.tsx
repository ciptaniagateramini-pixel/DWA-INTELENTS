import React from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame} from 'remotion';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import {COLORS, NARRATION, PLOT, PLOT_CENTER, T, TEXT, VOICEOVER} from './config';
import {cameraAt, project} from './geo';
import {MapSequence} from './components/MapSequence';
import {AnimatedPin, Headline, LandPolygon, NarrationCaption, PriceCTA, slatePanel} from './components/Overlays';
import {AllLandmarksBoard} from './components/AllLandmarksBoard';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const GedebageVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const cam = cameraAt(frame);
  const [rs, re] = T.plotReveal;
  const border = interpolate(frame, [rs, rs + 40], [0, 1], clamp);
  const [px, py] = project(cam, PLOT_CENTER);
  // Before the polygon is legible, the plot is marked by a pin.
  const pinVisible = interpolate(cam.widthKm, [1.2, 3], [0, 1], clamp) * interpolate(frame, [150, 175], [0, 1], clamp);
  const areaIn = interpolate(frame, [rs + 30, rs + 45, re - 6, re], [0, 1, 1, 0], clamp);

  return (
    <AbsoluteFill style={{background: COLORS.sea}}>
      <MapSequence cam={cam} />
      <LandPolygon cam={cam} ring={PLOT} progress={border} />
      <AnimatedPin x={px} y={py} appear={pinVisible} pulse={frame / 30} size={14} />

      <Headline text={TEXT.h1} frame={frame} start={T.h1[0] + 6} end={T.h1[1]} />
      <Headline text={TEXT.h2} frame={frame} start={T.h2[0]} end={T.h2[1] + 20} />

      {areaIn > 0 && (
        <div
          style={{
            ...slatePanel,
            position: 'absolute',
            left: '50%',
            top: 1300,
            transform: `translate(-50%, ${(1 - areaIn) * 20}px)`,
            opacity: areaIn,
            padding: '22px 44px',
            fontFamily: 'Poppins, sans-serif',
            fontSize: 52,
            fontWeight: 700,
            color: COLORS.white,
            whiteSpace: 'nowrap',
          }}
        >
          {TEXT.area}
        </div>
      )}

      <AllLandmarksBoard frame={frame} cam={cam} />
      <Headline text={TEXT.board} frame={frame} start={T.board[0]} end={T.board[1]} top={300} size={60} />

      <PriceCTA
        frame={frame}
        start={T.closing[0] + 30}
        lines={{a: TEXT.closingA, b: TEXT.closingB, cta: TEXT.cta, note: TEXT.sellerNote}}
      />

      {/* Persistent attribution + preview watermark (map is not satellite imagery). */}
      <div
        style={{
          position: 'absolute',
          bottom: 255,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: 'Poppins, sans-serif',
          fontSize: 15,
          color: 'rgba(255,255,255,0.55)',
        }}
      >
        {TEXT.attribution} · Batas tanah: perkiraan dari screenshot penjual
      </div>
      {NARRATION.map((n) => (
        <NarrationCaption key={n.from} frame={frame} {...n} />
      ))}
      {VOICEOVER && <Audio src={staticFile(VOICEOVER)} />}
    </AbsoluteFill>
  );
};
