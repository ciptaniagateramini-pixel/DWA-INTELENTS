import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import {FPS, NARRATION, VOICEOVER} from '../config';
import {
  AREA,
  CLOSE,
  PLOT_IN_AREA,
  SAT_LANDMARKS,
  SAT_T,
  SAT_TEXT,
  XY,
  landmarkXY,
  routeFor,
} from './satConfig';
import {Brackets, CYAN, HudCard, MONO, MUSTARD, Reticle, SANS, ScrambleText} from './hud';
import {SatGlobe} from './SatGlobe';
import {SFX} from './sfx';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.bezier(0.65, 0, 0.35, 1);
const FOCUS: XY = [540, 760];
// Recap card slots (top-left px): Al Jabbar, Cimekar, GBLA, Tegalluar, UIN.
const RECAP_SLOTS: XY[] = [
  [40, 1000],
  [780, 1000],
  [780, 1330],
  [410, 1400],
  [780, 480],
];

type Cam = {x: number; y: number; w: number};
const lerpCam = (a: Cam, b: Cam, t: number): Cam => {
  const k = Math.exp(Math.log(a.w) + (Math.log(b.w) - Math.log(a.w)) * t);
  return {x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, w: k};
};
const toScreen = (cam: Cam, p: XY): XY => {
  const s = 1080 / cam.w;
  return [FOCUS[0] + (p[0] - cam.x) * s, FOCUS[1] + (p[1] - cam.y) * s];
};

// Point at fraction t along a polyline.
const along = (pts: XY[], t: number): {p: XY; i: number; angle: number} => {
  const seg = pts.slice(1).map((b, i) => Math.hypot(b[0] - pts[i][0], b[1] - pts[i][1]));
  const total = seg.reduce((a, b) => a + b, 0);
  let d = t * total;
  for (let i = 0; i < seg.length; i++) {
    if (d <= seg[i] || i === seg.length - 1) {
      const f = seg[i] ? Math.min(1, d / seg[i]) : 1;
      const a = pts[i];
      const b = pts[i + 1];
      return {p: [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f], i, angle: Math.atan2(b[1] - a[1], b[0] - a[0])};
    }
    d -= seg[i];
  }
  return {p: pts[pts.length - 1], i: seg.length - 1, angle: 0};
};

const tourCamW = (meters: number) => Math.min(860, Math.max(170, (meters / AREA.mPerPx) * 2.3));
// Keep the view inside the image so no black edges show.
const fit = (c: Cam): Cam => {
  const w = Math.min(c.w, AREA.w);
  const s = 1080 / w;
  const minX = FOCUS[0] / s;
  const maxX = AREA.w - (1080 - FOCUS[0]) / s;
  const minY = FOCUS[1] / s;
  const maxY = AREA.h - (1920 - FOCUS[1]) / s;
  return {w, x: Math.max(minX, Math.min(maxX, c.x)), y: minY > maxY ? AREA.h / 2 : Math.max(minY, Math.min(maxY, c.y))};
};
const PLOT_CAM: Cam = {x: PLOT_IN_AREA[0], y: PLOT_IN_AREA[1], w: 150};
const OVERVIEW: Cam = {x: 560, y: 930, w: 900};

// Camera over the area image for the whole film.
const areaCam = (f: number): Cam => fit(areaCamRaw(f));
const areaCamRaw = (f: number): Cam => {
  const [as, ae] = SAT_T.approach;
  if (f < as + 85) {
    const t = ease(interpolate(f, [SAT_T.intro[1] - 30, as + 85], [0, 1], clamp));
    return lerpCam({x: 470, y: 836, w: 941}, {...PLOT_CAM, w: 200}, t);
  }
  if (f < SAT_T.toursStart) return {...PLOT_CAM, w: 200};
  const {toursStart, tourLen} = SAT_T;
  if (f < SAT_T.recap[0]) {
    const i = Math.min(SAT_LANDMARKS.length - 1, Math.floor((f - toursStart) / tourLen));
    const lf = f - toursStart - i * tourLen;
    const lm = SAT_LANDMARKS[i];
    const route = routeFor(lm);
    const w = tourCamW(lm.meters);
    const prev = i === 0 ? {...PLOT_CAM, w: 200} : (() => {
      const pl = SAT_LANDMARKS[i - 1];
      const [x, y] = landmarkXY(pl);
      return {x, y: y + tourCamW(pl.meters) * 0.25, w: tourCamW(pl.meters)};
    })();
    const start: Cam = {...PLOT_CAM, w};
    if (lf < 12) return lerpCam(prev, start, ease(lf / 12));
    const travel = ease(interpolate(lf, [12, 50], [0, 1], clamp));
    const head = along(route, travel).p;
    // During the hold the camera rests slightly above the landmark so the card sits below.
    const hold = ease(interpolate(lf, [50, 62], [0, 1], clamp));
    return {x: head[0], y: head[1] + w * 0.25 * hold, w};
  }
  if (f < SAT_T.cta[0]) {
    const last = SAT_LANDMARKS[SAT_LANDMARKS.length - 1];
    const [x, y] = landmarkXY(last);
    const from = {x, y: y + tourCamW(last.meters) * 0.25, w: tourCamW(last.meters)};
    return lerpCam(from, OVERVIEW, ease(interpolate(f, [SAT_T.recap[0], SAT_T.recap[0] + 30], [0, 1], clamp)));
  }
  return lerpCam(OVERVIEW, {...PLOT_CAM, w: 200}, ease(interpolate(f, [SAT_T.cta[0], SAT_T.cta[0] + 30], [0, 1], clamp)));
};

const SatImage: React.FC<{src: string; cam: Cam; tilt?: number; opacity?: number; blur?: number}> = ({
  src,
  cam,
  tilt = 0,
  opacity = 1,
  blur = 0,
}) => {
  const s = 1080 / cam.w;
  return (
    <AbsoluteFill style={{opacity, perspective: 1800, perspectiveOrigin: `50% ${FOCUS[1]}px`}}>
      <AbsoluteFill style={{transform: `rotateX(${tilt}deg)`, transformOrigin: `50% ${FOCUS[1]}px`}}>
        <Img
          src={staticFile(src)}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: AREA.w,
            height: AREA.h,
            transformOrigin: '0 0',
            transform: `translate(${FOCUS[0] - cam.x * s}px, ${FOCUS[1] - cam.y * s}px) scale(${s})`,
            filter: blur ? `blur(${blur}px)` : undefined,
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Headline: React.FC<{text: string; f: number; s: number; e: number; top?: number}> = ({text, f, s, e, top = 230}) => {
  const o = Math.min(interpolate(f, [s, s + 10], [0, 1], clamp), interpolate(f, [e - 10, e], [1, 0], clamp));
  if (o <= 0) return null;
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: 70,
        right: 70,
        textAlign: 'center',
        fontFamily: SANS,
        fontWeight: 700,
        fontSize: 66,
        lineHeight: 1.15,
        color: '#fff',
        opacity: o,
        textShadow: '0 6px 30px rgba(0,0,0,0.85)',
      }}
    >
      <ScrambleText text={text} frame={f} start={s} dur={22} seed={text.length} />
    </div>
  );
};

const Chip: React.FC<{text: string; f: number; s: number; e: number; top: number}> = ({text, f, s, e, top}) => {
  const {fps} = useVideoConfig();
  const p = spring({frame: f - s, fps, config: {damping: 14}});
  const o = Math.min(p, interpolate(f, [e - 8, e], [1, 0], clamp));
  if (f < s || o <= 0) return null;
  return (
    <div style={{position: 'absolute', top, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: o}}>
      <div
        style={{
          position: 'relative',
          background: 'rgba(6,14,22,0.85)',
          border: `1px solid rgba(127,227,255,0.35)`,
          padding: '18px 40px',
          fontFamily: SANS,
          fontWeight: 700,
          fontSize: 48,
          color: '#fff',
          transform: `scale(${0.85 + 0.15 * p})`,
        }}
      >
        <Brackets size={22} w={3} />
        <ScrambleText text={text} frame={f} start={s} dur={16} seed={5} />
      </div>
    </div>
  );
};

const HudChrome: React.FC<{f: number; cam: Cam; mPerPx: number}> = ({f, cam, mPerPx}) => {
  if (f < 130) return null;
  const meters = Math.round(((cam.w / 1080) * 200 * mPerPx) / 10) * 10;
  return (
    <>
      <div style={{position: 'absolute', right: 56, top: 150, width: 96, height: 96, borderRadius: 48, background: 'rgba(0,0,0,0.55)', border: '2px solid rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <svg width={60} height={60} viewBox="-30 -30 60 60">
          <polygon points="0,-24 7,0 -7,0" fill="#E5484D" />
          <polygon points="0,24 7,0 -7,0" fill="#fff" />
        </svg>
      </div>
      <div style={{position: 'absolute', left: 56, top: 150, fontFamily: MONO, fontSize: 22, color: 'rgba(255,255,255,0.85)', textShadow: '0 1px 4px #000'}}>
        <div style={{width: 200, height: 6, borderLeft: '2px solid #fff', borderRight: '2px solid #fff', borderBottom: '2px solid #fff'}} />
        {meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${meters} m`}
      </div>
      <div style={{position: 'absolute', left: 56, top: 205, fontFamily: MONO, fontSize: 17, color: 'rgba(255,255,255,0.75)', textShadow: '0 1px 4px #000'}}>
        {SAT_TEXT.disclaimer}
      </div>
    </>
  );
};

const RouteLayer: React.FC<{f: number; cam: Cam; only?: number; all?: number}> = ({f, cam, only, all = 0}) => {
  const items = SAT_LANDMARKS.map((lm, i) => {
    let t = 0;
    if (only === i) t = ease(interpolate(f - SAT_T.toursStart - i * SAT_T.tourLen, [12, 50], [0, 1], clamp));
    if (all > 0) t = all;
    if (t <= 0) return null;
    const route = routeFor(lm);
    const {p, i: segI, angle} = along(route, t);
    const pts = [...route.slice(0, segI + 1), p].map((q) => toScreen(cam, q));
    const d = pts.map((q, k) => `${k ? 'L' : 'M'}${q[0].toFixed(1)},${q[1].toFixed(1)}`).join('');
    const [hx, hy] = toScreen(cam, p);
    const deg = (angle * 180) / Math.PI;
    return (
      <g key={lm.id}>
        <path d={d} fill="none" stroke="rgba(0,0,0,0.45)" strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" />
        <path d={d} fill="none" stroke="#fff" strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" />
        <path d={d} fill="none" stroke={MUSTARD} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="26 14" strokeDashoffset={-f * 3} />
        {t < 1 && (
          <g transform={`translate(${hx},${hy}) rotate(${deg})`}>
            <polygon points="26,0 -16,-20 -8,0 -16,20" fill={MUSTARD} stroke="#fff" strokeWidth={4} />
          </g>
        )}
      </g>
    );
  });
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      {items}
    </svg>
  );
};

export const SatVideo: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const cam = areaCam(f);

  // Close-up layer (approach + CTA) uses its own camera over close.png.
  const closeIn = Math.max(
    interpolate(f, [205, 228, 300, 318], [0, 1, 1, 0], clamp),
    interpolate(f, [SAT_T.cta[0] + 18, SAT_T.cta[0] + 40], [0, 1], clamp)
  );
  const inCta = f >= SAT_T.cta[0];
  const closeT = inCta
    ? ease(interpolate(f, [SAT_T.cta[0] + 18, SAT_T.cta[0] + 90], [0, 1], clamp))
    : ease(interpolate(f, [218, 300], [0, 1], clamp));
  const closeCam = lerpCam(
    {x: CLOSE.plotCenter[0], y: CLOSE.plotCenter[1], w: 940},
    {x: CLOSE.plotCenter[0], y: CLOSE.plotCenter[1] + (inCta ? 70 : 40), w: inCta ? 700 : 640},
    closeT
  );
  const tilt = 24 * closeT;
  const outlineP = inCta
    ? interpolate(f, [SAT_T.cta[0] + 40, SAT_T.cta[0] + 75], [0, 1], clamp)
    : interpolate(f, [250, 290], [0, 1], clamp);

  const globeO = interpolate(f, [100, 140], [1, 0], clamp);
  const areaO = interpolate(f, [100, 140], [0, 1], clamp);

  const tourIdx = f >= SAT_T.toursStart && f < SAT_T.recap[0] ? Math.floor((f - SAT_T.toursStart) / SAT_T.tourLen) : -1;
  const recapAll = interpolate(f, [SAT_T.recap[0] + 20, SAT_T.recap[0] + 60], [0, 1], clamp);
  const recapOut = interpolate(f, [SAT_T.cta[0], SAT_T.cta[0] + 20], [1, 0], clamp);

  return (
    <AbsoluteFill style={{background: '#06101a'}}>
      {globeO > 0 && <SatGlobe frame={f} opacity={globeO} />}
      {areaO > 0 && <SatImage src={AREA.src} cam={cam} opacity={areaO} blur={interpolate(f, [100, 150], [8, 0], clamp)} />}
      {closeIn > 0 && (
        <AbsoluteFill style={{opacity: closeIn}}>
          <SatImage src={CLOSE.src} cam={closeCam} tilt={tilt} />
          <AbsoluteFill style={{perspective: 1800, perspectiveOrigin: `50% ${FOCUS[1]}px`}}>
            <svg
              width={1080}
              height={1920}
              style={{position: 'absolute', inset: 0, transform: `rotateX(${tilt}deg)`, transformOrigin: `50% ${FOCUS[1]}px`}}
            >
              {(() => {
                const pts = CLOSE.plot.map((q) => toScreen(closeCam, q));
                const d = pts.map((q, k) => `${k ? 'L' : 'M'}${q[0]},${q[1]}`).join('') + 'Z';
                const per = pts.reduce((a, q, i) => a + Math.hypot(pts[(i + 1) % 4][0] - q[0], pts[(i + 1) % 4][1] - q[1]), 0);
                return (
                  <>
                    <path d={d} fill={`rgba(230,182,76,${0.22 * outlineP})`} />
                    <path d={d} fill="none" stroke={MUSTARD} strokeWidth={16} strokeOpacity={0.3} strokeDasharray={per} strokeDashoffset={per * (1 - outlineP)} />
                    <path d={d} fill="none" stroke={MUSTARD} strokeWidth={6} strokeDasharray={per} strokeDashoffset={per * (1 - outlineP)} strokeLinejoin="round" />
                  </>
                );
              })()}
            </svg>
          </AbsoluteFill>
        </AbsoluteFill>
      )}

      {/* Plot marker on the area map during tours/recap. */}
      {f >= 300 && f < SAT_T.cta[0] + 20 && closeIn < 1 && (
        <Reticle x={toScreen(cam, PLOT_IN_AREA)[0]} y={toScreen(cam, PLOT_IN_AREA)[1]} frame={f} start={300} size={50} />
      )}
      {tourIdx >= 0 && <RouteLayer f={f} cam={cam} only={tourIdx} />}
      {f >= SAT_T.recap[0] && recapOut > 0 && (
        <AbsoluteFill style={{opacity: recapOut}}>
          <RouteLayer f={f} cam={cam} all={recapAll} />
        </AbsoluteFill>
      )}

      {/* Landmark reticles + HUD cards */}
      {SAT_LANDMARKS.map((lm, i) => {
        const s = SAT_T.toursStart + i * SAT_T.tourLen;
        const [x, y] = toScreen(cam, landmarkXY(lm));
        const showTour = f >= s + 48 && f < s + SAT_T.tourLen;
        return (
          <React.Fragment key={lm.id}>
            {showTour && <Reticle x={x} y={y} frame={f} start={s + 48} />}
            <HudCard
              frame={f}
              start={s + 54}
              end={s + SAT_T.tourLen - 2}
              index={i}
              total={SAT_LANDMARKS.length}
              name={lm.name}
              distance={lm.distance}
              about={lm.about}
              img={lm.img}
              top={880}
            />
          </React.Fragment>
        );
      })}

      {/* Recap: fixed slots around the plot, thin connectors to each landmark. */}
      {f >= SAT_T.recap[0] + 30 && recapOut > 0 && (
        <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: recapOut}}>
          {SAT_LANDMARKS.map((lm, i) => {
            const [x, y] = toScreen(cam, landmarkXY(lm));
            const [sx, sy] = RECAP_SLOTS[i];
            const p = interpolate(f, [SAT_T.recap[0] + 40 + i * 5, SAT_T.recap[0] + 56 + i * 5], [0, 1], clamp);
            const tx = sx + 130;
            const ty = sy + 105;
            return (
              <g key={lm.id}>
                <line x1={x} y1={y} x2={x + (tx - x) * p} y2={y + (ty - y) * p} stroke={MUSTARD} strokeWidth={2.5} />
                <circle cx={x} cy={y} r={11} fill={MUSTARD} stroke="#fff" strokeWidth={4} />
              </g>
            );
          })}
        </svg>
      )}
      {f >= SAT_T.recap[0] + 40 && recapOut > 0 &&
        SAT_LANDMARKS.map((lm, i) => {
          const [left, top] = RECAP_SLOTS[i];
          const p = spring({frame: f - SAT_T.recap[0] - 50 - i * 5, fps, config: {damping: 13}});
          return (
            <div key={lm.id} style={{position: 'absolute', left, top, width: 260, opacity: p * recapOut, transform: `scale(${p})`}}>
              <div style={{position: 'relative', border: '1px solid rgba(127,227,255,0.45)', background: 'rgba(6,14,22,0.88)'}}>
                <Brackets size={16} w={3} />
                <Img src={staticFile(lm.img)} style={{width: '100%', height: 130, objectFit: 'cover', display: 'block'}} />
                <div style={{padding: '8px 10px 2px', fontFamily: SANS, fontWeight: 600, fontSize: 22, color: '#fff', lineHeight: 1.15}}>{lm.name}</div>
                <div style={{padding: '0 10px 8px', fontFamily: MONO, fontSize: 20, color: MUSTARD}}>{lm.distance}</div>
              </div>
            </div>
          );
        })}

      <HudChrome f={f} cam={closeIn > 0.5 ? closeCam : cam} mPerPx={closeIn > 0.5 ? 0.45 : AREA.mPerPx} />

      <Headline text={SAT_TEXT.h1} f={f} s={8} e={135} top={260} />
      <Headline text={SAT_TEXT.h2} f={f} s={150} e={262} top={260} />
      <Chip text={SAT_TEXT.area} f={f} s={262} e={325} top={1380} />
      <Headline text={SAT_TEXT.recap} f={f} s={SAT_T.recap[0] + 8} e={SAT_T.cta[0]} top={260} />

      <PriceReveal f={f} s={SAT_T.cta[0] + 60} />

      {NARRATION.map((n, i) => {
        const at = [12, 160, 336, SAT_T.cta[0] + 8, SAT_T.cta[0] + 125][i];
        const len = Math.round((n.clip[1] - n.clip[0]) * FPS);
        return VOICEOVER ? (
          <Sequence key={i} from={at} durationInFrames={len}>
            <Audio src={staticFile(VOICEOVER)} startFrom={Math.round(n.clip[0] * FPS)} endAt={Math.round(n.clip[1] * FPS)} />
          </Sequence>
        ) : null;
      })}
      {SFX.map((s, i) => (
        <Sequence key={i} from={s.at}>
          <Audio src={staticFile(`sfx/${s.file}`)} volume={s.volume ?? 0.5} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

const PriceReveal: React.FC<{f: number; s: number}> = ({f, s}) => {
  const {fps} = useVideoConfig();
  const p = spring({frame: f - s, fps, config: {damping: 18}});
  if (f < s) return null;
  const row = (label: string, value: string, at: number, color: string, size: number, seed: number) => (
    <div style={{marginTop: 18}}>
      <div style={{fontFamily: MONO, fontSize: 24, letterSpacing: 3, color: CYAN}}>
        <ScrambleText text={label} frame={f} start={at} dur={10} seed={seed} />
      </div>
      <div style={{fontFamily: MONO, fontWeight: 700, fontSize: size, color, letterSpacing: 1}}>
        <ScrambleText text={value} frame={f} start={at + 4} dur={34} seed={seed + 1} />
      </div>
    </div>
  );
  const btn = spring({frame: f - s - 70, fps, config: {damping: 12}});
  return (
    <div
      style={{
        position: 'absolute',
        left: 70,
        right: 70,
        top: 1040,
        padding: '30px 36px 34px',
        background: 'linear-gradient(180deg, rgba(6,14,22,0.92), rgba(6,14,22,0.84))',
        border: '1px solid rgba(127,227,255,0.35)',
        opacity: p,
        transform: `scaleY(${0.3 + 0.7 * p})`,
        transformOrigin: 'top',
      }}
    >
      <Brackets />
      <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 50, color: '#fff'}}>
        <ScrambleText text="3.200 m² • SHM" frame={f} start={s} dur={14} seed={41} />
      </div>
      {row('HARGA / M²', SAT_TEXT.perM, s + 10, MUSTARD, 66, 50)}
      {row('TOTAL HARGA (3.200 m²)', SAT_TEXT.total, s + 28, '#fff', 72, 60)}
      <div style={{fontFamily: MONO, fontSize: 20, color: 'rgba(255,255,255,0.65)', marginTop: 16, letterSpacing: 1}}>
        <ScrambleText text={SAT_TEXT.legal} frame={f} start={s + 50} dur={18} seed={70} />
      </div>
      {f >= s + 70 && (
        <div style={{display: 'flex', justifyContent: 'center', marginTop: 26}}>
          <div
            style={{
              background: MUSTARD,
              color: '#0f1720',
              fontFamily: SANS,
              fontWeight: 700,
              fontSize: 40,
              padding: '18px 60px',
              transform: `scale(${0.7 + 0.3 * btn})`,
              boxShadow: `0 0 ${20 + 15 * Math.sin(f / 5)}px rgba(230,182,76,0.6)`,
            }}
          >
            {SAT_TEXT.cta}
          </div>
        </div>
      )}
    </div>
  );
};
