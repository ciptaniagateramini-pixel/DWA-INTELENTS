import {SAT_LANDMARKS, SAT_T, Sfx} from './satConfig';

// Sound effects (public/sfx, synthesized with ffmpeg — see scripts/make-sfx.sh).
const tours: Sfx[] = SAT_LANDMARKS.flatMap((_, i) => {
  const s = SAT_T.toursStart + i * SAT_T.tourLen;
  return [
    {at: s, file: 'whoosh.wav', volume: 0.35},
    {at: s + 12, file: 'travel.wav', volume: 0.35},
    {at: s + 48, file: 'pop.wav', volume: 0.5},
    {at: s + 54, file: 'chatter.wav', volume: 0.22},
    {at: s + 66, file: 'ding.wav', volume: 0.3},
    {at: s + 74, file: 'chatter.wav', volume: 0.16},
    {at: s + SAT_T.tourLen - 12, file: 'close.wav', volume: 0.25},
  ];
});

export const SFX: Sfx[] = [
  {at: 0, file: 'whoosh_long.wav', volume: 0.45},
  {at: 8, file: 'chatter.wav', volume: 0.18},
  {at: 105, file: 'whoosh_long.wav', volume: 0.4},
  {at: 150, file: 'chatter.wav', volume: 0.16},
  {at: 215, file: 'whoosh.wav', volume: 0.4},
  {at: 250, file: 'travel.wav', volume: 0.3},
  {at: 262, file: 'pop.wav', volume: 0.5},
  {at: 300, file: 'whoosh.wav', volume: 0.35},
  ...tours,
  {at: SAT_T.recap[0], file: 'whoosh.wav', volume: 0.4},
  ...SAT_LANDMARKS.map((_, i) => ({at: SAT_T.recap[0] + 40 + i * 5, file: 'pop.wav', volume: 0.3})),
  {at: SAT_T.cta[0], file: 'whoosh_long.wav', volume: 0.35},
  {at: SAT_T.cta[0] + 40, file: 'travel.wav', volume: 0.3},
  {at: SAT_T.cta[0] + 60, file: 'chatter.wav', volume: 0.22},
  {at: SAT_T.cta[0] + 70, file: 'riser.wav', volume: 0.3},
  {at: SAT_T.cta[0] + 88, file: 'chatter.wav', volume: 0.22},
  {at: SAT_T.cta[0] + 106, file: 'ding.wav', volume: 0.35},
  {at: SAT_T.cta[0] + 130, file: 'pop.wav', volume: 0.45},
];
