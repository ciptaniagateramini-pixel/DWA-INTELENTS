// Render animasi logo outro: MP4 mustard (H.264 crf 16 + audio), WebM VP9 alpha tanpa latar,
// contact sheet 12 frame, dan frame kunci saat teks setengah keluar.
// Pemakaian: node logo-outro/render.mjs [--preview=0.5,1.0]
import { createRequire } from "module";
import { spawn, execFileSync } from "child_process";
import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "render");
const TMP = path.join(OUT, ".tmp-logo");
const AUDIO = path.join(ROOT, "assets/audio");
fs.mkdirSync(TMP, { recursive: true });
const previewArg = process.argv.find((a) => a.startsWith("--preview="));

const MIME = { ".html": "text/html", ".js": "text/javascript", ".svg": "image/svg+xml", ".woff2": "font/woff2" };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(new URL(req.url, "http://x").pathname));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "Content-Type": MIME[path.extname(p)] || "application/octet-stream" });
  fs.createReadStream(p).pipe(res);
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
page.on("pageerror", (e) => { console.error("[page error]", e); process.exit(1); });
await page.goto(`http://127.0.0.1:${server.address().port}/logo-outro/index.html`);
await page.waitForFunction(() => window.__ready === true, null, { timeout: 30000 });
const meta = await page.evaluate(() => window.__meta);
const frame = async (t, bg) => Buffer.from((await page.evaluate(([tt, b]) => window.renderFrame(tt, b), [t, bg])).split(",")[1], "base64");

const done = async () => { await browser.close(); server.close(); };

if (previewArg) {
  for (const t of previewArg.slice(10).split(",").map(Number)) fs.writeFileSync(path.join(TMP, `p-${t.toFixed(3)}.png`), await frame(t, true));
  console.log("Preview di", TMP);
  await done();
  process.exit(0);
}

const frames = Math.round(meta.duration * meta.fps);
const enc = (args) => {
  const p = spawn("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(meta.fps), "-c:v", "png", "-i", "-", ...args], { stdio: ["pipe", "inherit", "inherit"] });
  return { p, done: new Promise((r, j) => p.on("close", (c) => (c ? j(new Error("ffmpeg " + c)) : r()))) };
};
const write = async (e, buf) => { if (!e.p.stdin.write(buf)) await new Promise((r) => e.p.stdin.once("drain", r)); };

const vMustard = enc(["-c:v", "libx264", "-preset", "slow", "-crf", "16", "-pix_fmt", "yuv420p", path.join(TMP, "mustard.mp4")]);
const vAlpha = enc(["-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p", "-b:v", "0", "-crf", "18", "-auto-alt-ref", "0", path.join(OUT, "logo-outro-alpha.webm")]);
const sheetTimes = Array.from({ length: 12 }, (_, i) => Math.round((0.05 + i * 0.25) * meta.fps));
for (let i = 0; i < frames; i++) {
  const t = i / meta.fps;
  const m = await frame(t, true);
  await write(vMustard, m);
  await write(vAlpha, await frame(t, false));
  if (sheetTimes.includes(i)) fs.writeFileSync(path.join(TMP, `s-${String(i).padStart(3, "0")}.png`), m);
  process.stdout.write(`\rframe ${i + 1}/${frames}`);
}
vMustard.p.stdin.end(); vAlpha.p.stdin.end();
await Promise.all([vMustard.done, vAlpha.done]);
// Frame kunci untuk konfirmasi tafsir "layer": teks setengah keluar dari balik logo
fs.writeFileSync(path.join(OUT, "logo-outro-keyframe-teks.png"), await frame(1.66, true));
fs.writeFileSync(path.join(OUT, "logo-outro-akhir.png"), await frame(3.5, true));
await done();
console.log();

// Contact sheet 12 frame dengan label waktu
execFileSync("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error", "-pattern_type", "glob", "-i", path.join(TMP, "s-*.png"),
  "-vf", "scale=270:480,tile=6x2:padding=8:color=0x082A59", "-frames:v", "1", path.join(OUT, "logo-outro-contact-sheet.png")]);

// Audio: putaran (ujung keras jatuh di 0,95) + hentakan kunci, whoosh geser 1,30, click 1,60
const spin = path.join(AUDIO, "logo-outro/putaran-c.mp3");
const SPIN_PEAK_END = 0.60; // akhir bagian keras pada klip putaran
const spinStart = 0.95 - SPIN_PEAK_END;
const f = [
  `[0:a]aresample=48000,atrim=0:${SPIN_PEAK_END + 0.08},afade=t=in:d=0.12,afade=t=out:st=${SPIN_PEAK_END - 0.02}:d=0.1,volume=-9dB,adelay=${Math.round(spinStart * 1000)}:all=1[spin]`,
  // Hentakan kunci: tumpul, rendah, pendek (sinus 120 Hz meluruh 90 ms)
  `aevalsrc='0.5*sin(2*PI*120*t)*exp(-t/0.03)*min(1,t/0.003)':s=48000:d=0.15,volume=-8dB,adelay=950:all=1[thud]`,
  `[1:a]aresample=48000,volume=-17dB,adelay=1300:all=1[geser]`,
  `[2:a]aresample=48000,volume=0dB,adelay=1600:all=1[click]`,
  `[spin][thud][geser][click]amix=inputs=4:normalize=0:duration=longest,highpass=f=80,lowpass=f=14000,apad,atrim=0:${meta.duration},aformat=channel_layouts=stereo[out]`,
];
const wav = path.join(TMP, "audio.wav");
execFileSync("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error", "-i", spin, "-i", path.join(AUDIO, "whoosh-2.wav"), "-i", path.join(AUDIO, "logo-outro/click.mp3"),
  "-filter_complex", f.join(";"), "-map", "[out]", "-ar", "48000", wav], { stdio: "inherit" });
execFileSync("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error", "-i", path.join(TMP, "mustard.mp4"), "-i", wav,
  "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-shortest", "-movflags", "+faststart", path.join(OUT, "logo-outro.mp4")], { stdio: "inherit" });
fs.copyFileSync(wav, path.join(AUDIO, "logo-outro/logo-outro-sfx.wav"));
console.log("Selesai: render/logo-outro.mp4, render/logo-outro-alpha.webm");
