import React from 'react';
import {Img, interpolate, spring, staticFile, useVideoConfig} from 'remotion';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/700.css';

export const MUSTARD = '#E6B64C';
export const CYAN = '#7FE3FF';
export const MONO = '"JetBrains Mono", monospace';
export const SANS = 'Poppins, sans-serif';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/* ---------- Scramble ("decode") text ---------- */
const hash = (a: number, b: number, c: number) => {
  let h = (a * 374761393 + b * 668265263 + c * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
};
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&@$/<>*+';
const DIGITS = '0123456789';

// progress 0..1 locks characters left→right; unlocked ones flicker every 2 frames.
export const scramble = (text: string, progress: number, frame: number, seed = 1) => {
  const locked = Math.floor(Math.max(0, Math.min(1, progress)) * text.length);
  let out = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (i < locked || ch === ' ' || ch === '.' || ch === ',') out += ch;
    else {
      const set = /[0-9]/.test(ch) ? DIGITS : LETTERS;
      out += set[Math.floor(hash(i, Math.floor(frame / 2), seed) * set.length)];
    }
  }
  return out;
};

export const ScrambleText: React.FC<{
  text: string;
  frame: number;
  start: number;
  dur: number;
  seed?: number;
  style?: React.CSSProperties;
}> = ({text, frame, start, dur, seed = 1, style}) => {
  if (frame < start) return null;
  const p = interpolate(frame, [start + 4, start + dur], [0, 1], clamp);
  // Unrevealed tail of long text stays hidden so it reads like a terminal typing in.
  const visible = Math.min(text.length, Math.ceil(interpolate(frame, [start, start + dur * 0.55], [0, 1], clamp) * text.length) + 6);
  return <span style={style}>{scramble(text, p, frame, seed).slice(0, visible)}</span>;
};

/* ---------- Corner brackets ---------- */
export const Brackets: React.FC<{size?: number; color?: string; w?: number}> = ({size = 34, color = MUSTARD, w = 4}) => {
  const s: React.CSSProperties = {position: 'absolute', width: size, height: size, borderColor: color, borderStyle: 'solid'};
  return (
    <>
      <div style={{...s, left: -2, top: -2, borderWidth: `${w}px 0 0 ${w}px`}} />
      <div style={{...s, right: -2, top: -2, borderWidth: `${w}px ${w}px 0 0`}} />
      <div style={{...s, left: -2, bottom: -2, borderWidth: `0 0 ${w}px ${w}px`}} />
      <div style={{...s, right: -2, bottom: -2, borderWidth: `0 ${w}px ${w}px 0`}} />
    </>
  );
};

/* ---------- Target reticle on the map ---------- */
export const Reticle: React.FC<{x: number; y: number; frame: number; start: number; size?: number}> = ({
  x,
  y,
  frame,
  start,
  size = 70,
}) => {
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - start, fps, config: {damping: 11}});
  if (p <= 0) return null;
  const rot = (frame - start) * 2;
  const pulse = ((frame - start) % 30) / 30;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
      <circle cx={x} cy={y} r={size * (0.6 + pulse * 0.9)} fill="none" stroke={MUSTARD} strokeWidth={2} opacity={1 - pulse} />
      <g transform={`translate(${x},${y}) rotate(${rot}) scale(${p})`}>
        <circle r={size * 0.55} fill="none" stroke={MUSTARD} strokeWidth={3} strokeDasharray="18 12" />
        {[0, 90, 180, 270].map((a) => (
          <line key={a} x1={0} y1={-size * 0.95} x2={0} y2={-size * 0.65} stroke={MUSTARD} strokeWidth={4} transform={`rotate(${a})`} />
        ))}
      </g>
      <circle cx={x} cy={y} r={12 * p} fill={MUSTARD} stroke="#fff" strokeWidth={4} />
    </svg>
  );
};

/* ---------- Agent-style HUD card ---------- */
export const HudCard: React.FC<{
  frame: number;
  start: number;
  end: number;
  index: number;
  total: number;
  name: string;
  distance: string;
  about: string;
  img: string;
  top: number;
}> = ({frame, start, end, index, total, name, distance, about, img, top}) => {
  const {fps} = useVideoConfig();
  const open = spring({frame: frame - start, fps, config: {damping: 16, stiffness: 160}});
  const close = interpolate(frame, [end - 10, end], [1, 0], clamp);
  if (frame < start || close <= 0) return null;
  const k = Math.min(open, close);
  const glitch = frame - start < 8 ? (hash(frame, 3, 7) - 0.5) * 18 : 0;
  const blink = Math.floor((frame - start) / 8) % 2 === 0;
  return (
    <div
      style={{
        position: 'absolute',
        left: 70,
        right: 70,
        top,
        transform: `scaleY(${0.2 + 0.8 * k}) translateX(${glitch}px)`,
        transformOrigin: 'top center',
        opacity: k,
        background: 'linear-gradient(180deg, rgba(6,14,22,0.90), rgba(6,14,22,0.80))',
        border: '1px solid rgba(127,227,255,0.35)',
        backdropFilter: 'blur(8px)',
        padding: 26,
        boxShadow: '0 0 40px rgba(127,227,255,0.15), 0 30px 60px rgba(0,0,0,0.5)',
      }}
    >
      <Brackets />
      <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: MONO, fontSize: 24, color: CYAN, letterSpacing: 2}}>
        <span>◉ TARGET {String(index + 1).padStart(2, '0')}/{String(total).padStart(2, '0')}</span>
        <span style={{color: MUSTARD, opacity: blink ? 1 : 0.35}}>■ LOCKED</span>
      </div>
      <div style={{position: 'relative', marginTop: 16, height: 330, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.15)'}}>
        <Img src={staticFile(img)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.08 - 0.08 * k})`}} />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0 2px, transparent 2px 5px)',
            mixBlendMode: 'multiply',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: `${interpolate((frame - start) % 45, [0, 45], [-10, 110])}%`,
            height: 70,
            background: 'linear-gradient(180deg, transparent, rgba(127,227,255,0.18), transparent)',
          }}
        />
        <svg width="100%" height="100%" style={{position: 'absolute', inset: 0}} viewBox="0 0 100 100" preserveAspectRatio="none">
          <line x1="50" y1="40" x2="50" y2="60" stroke={CYAN} strokeWidth="0.3" />
          <line x1="44" y1="50" x2="56" y2="50" stroke={CYAN} strokeWidth="0.2" />
        </svg>
        <div style={{position: 'absolute', left: 14, bottom: 10, fontFamily: MONO, fontSize: 18, color: 'rgba(255,255,255,0.75)'}}>
          ILUSTRASI AI
        </div>
      </div>
      <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 52, color: '#fff', marginTop: 16, lineHeight: 1.1}}>
        <ScrambleText text={name} frame={frame} start={start + 4} dur={18} seed={index + 11} />
      </div>
      <div style={{fontFamily: MONO, fontSize: 32, color: MUSTARD, marginTop: 10, letterSpacing: 2}}>
        <ScrambleText text={`JARAK ▸ ${distance}`} frame={frame} start={start + 10} dur={16} seed={index + 21} />
      </div>
      <div style={{height: 1, background: 'rgba(127,227,255,0.3)', margin: '14px 0'}} />
      <div style={{fontFamily: SANS, fontSize: 32, color: 'rgba(255,255,255,0.92)', lineHeight: 1.36, minHeight: 130}}>
        <span style={{fontFamily: MONO, color: CYAN, fontSize: 26}}>&gt; INFO: </span>
        <ScrambleText text={about} frame={frame} start={start + 16} dur={40} seed={index + 31} />
      </div>
    </div>
  );
};
