// Renders the five review stills (opening, land reveal, single pop-up, board, closing).
import path from 'node:path';
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';

const browserExecutable =
  '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const frames = {'01_opening': 60, '02_bandung': 165, '03_land_reveal': 300, '04_single_popup': 360, '05_board': 650, '06_closing': 815};
const only = process.argv.slice(2);
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const composition = await selectComposition({serveUrl, id: 'GedebageVideo', browserExecutable});
for (const [name, frame] of Object.entries(frames)) {
  if (only.length && !only.includes(name)) continue;
  const output = path.resolve(`output/preview/${name}_f${frame}.png`);
  await renderStill({serveUrl, composition, frame, output, browserExecutable});
  console.log('wrote', output);
}
