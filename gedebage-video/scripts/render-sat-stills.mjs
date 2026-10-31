// Renders review stills for the style-2 (satellite) composition.
import path from 'node:path';
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';

const browserExecutable =
  '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const frames = (process.argv[2] || '60,200,285,370,420,470,1000,1150,1300,1410').split(',').map(Number);
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const composition = await selectComposition({serveUrl, id: 'GedebageSatelit', browserExecutable});
for (const frame of frames) {
  const output = path.resolve(`output/preview/sat_f${String(frame).padStart(4, '0')}.png`);
  await renderStill({serveUrl, composition, frame, output, browserExecutable});
  console.log('wrote', output);
}
