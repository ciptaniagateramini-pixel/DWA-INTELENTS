const { chromium } = require('playwright');
(async () => {
  const [html, outdir, mode, ...rest] = process.argv.slice(2);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await p.goto('file://' + html); await p.evaluate(() => document.fonts.ready);
  p.on('console', m => console.log('console:', m.text())); p.on('pageerror', e => console.log('ERR', e.message));
  const times = mode === 'all' ? (() => { const fps = 30, a = [], D = Number(rest[0]); for (let i = 0; i < Math.round(D * fps); i++) a.push(i / fps); return a; })() : rest.map(Number);
  let i = 0;
  for (const t of times) {
    await p.evaluate(async t => { frame(t); await Promise.all([...document.images].filter(im => !im.complete).map(im => new Promise(r => { im.onload = im.onerror = r; }))); }, t);
    await p.screenshot({ path: `${outdir}/${String(i++).padStart(5, '0')}.jpg`, type: 'jpeg', quality: 92 });
  }
  await b.close();
})();
