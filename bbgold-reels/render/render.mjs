// Render Reels bb gold: frame dari engine/template.html (Playwright) -> H.264, audio narasi + SFX -> AAC 48 kHz.
// Pemakaian: node render/render.mjs [data/emas-vs-tanah.json] [--preview [--at=1.5,3.2]]
import { createRequire } from "module";
import { spawn, spawnSync, execFileSync } from "child_process";
import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const dataPath = args.find((a) => !a.startsWith("--")) || "data/emas-vs-tanah.json";
const preview = args.includes("--preview");
const tokens = JSON.parse(fs.readFileSync(path.join(ROOT, "tokens.json"), "utf8"));
const OUT = path.join(ROOT, "render");
const TMP = path.join(OUT, ".tmp");
fs.mkdirSync(TMP, { recursive: true });

const MIME = { ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".png": "image/png" };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(new URL(req.url, "http://x").pathname));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "Content-Type": MIME[path.extname(p)] || "application/octet-stream" });
  fs.createReadStream(p).pipe(res);
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base = `http://127.0.0.1:${server.address().port}`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
page.on("console", (m) => console.log("[page]", m.text()));
page.on("pageerror", (e) => { console.error("[page error]", e); process.exitCode = 1; });

async function open(query) {
  await page.goto(`${base}/engine/template.html?data=${encodeURIComponent(dataPath)}${query}`);
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 30000 });
}

// Cover + cek crop 3:4
await open("&cover");
const id = path.basename(dataPath, ".json");
await page.screenshot({ path: path.join(OUT, `${id}-cover.png`) });
await open("&cover&grid");
await page.screenshot({ path: path.join(OUT, `${id}-cover-crop-check.png`) });

// Video
await open("");
const meta = await page.evaluate(() => window.__meta);
if (meta.warnings.length) { console.error(meta.warnings.join("\n")); process.exit(1); }
fs.writeFileSync(path.join(OUT, `${id}.timeline.json`), JSON.stringify(meta, null, 2));
const fps = meta.fps;
const frames = Math.round(meta.duration * fps);
console.log(`Durasi ${meta.duration.toFixed(2)} s, ${frames} frame, ${meta.cues.length} SFX`);

if (preview) {
  // Kontak sheet: satu frame tiap adegan + frame fokus kamera
  const at = args.find((a) => a.startsWith("--at="));
  const times = at ? at.slice(5).split(",").map(Number) : [...meta.scenes.map((s) => s.t0 + 0.9), ...meta.camera.filter((c) => c.to.s > 1).map((c) => c.t0 + 0.5)];
  for (const t of times) {
    await page.evaluate((tt) => window.renderAt(tt), t);
    await page.screenshot({ path: path.join(TMP, `p-${t.toFixed(2)}.png`) });
  }
  console.log("Preview frame tersimpan di", TMP);
  await browser.close(); server.close();
  process.exit(0);
}

const videoTmp = path.join(TMP, "video.mp4");
const ff = spawn("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(fps), "-c:v", "png", "-i", "-",
  "-c:v", "libx264", "-preset", "medium", "-crf", "17", "-pix_fmt", "yuv420p", "-r", String(fps), "-movflags", "+faststart", videoTmp], { stdio: ["pipe", "inherit", "inherit"] });
const ffDone = new Promise((r, j) => ff.on("close", (c) => (c === 0 ? r() : j(new Error("ffmpeg video gagal " + c)))));
for (let i = 0; i < frames; i++) {
  await page.evaluate((tt) => window.renderAt(tt), i / fps);
  const buf = await page.screenshot({ type: "png" });
  if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
  if (i % 60 === 0) process.stdout.write(`\rframe ${i}/${frames}`);
}
ff.stdin.end();
await ffDone;
console.log(`\rframe ${frames}/${frames}`);
await browser.close();
server.close();

// Audio: narasi + jeda awal; SFX di bawah narator (dB relatif terhadap puncak narasi)
const A = tokens.audio;
const audioDir = path.join(ROOT, "assets/audio");
const peakOf = (file) => {
  const err = spawnSync("ffmpeg", ["-hide_banner", "-i", file, "-af", "volumedetect", "-f", "null", "-"], { encoding: "utf8" }).stderr;
  return parseFloat(/max_volume: (-?[\d.]+) dB/.exec(err)[1]);
};
const narasi = path.join(ROOT, meta.audio);
const narPeak = peakOf(narasi);
const sfxPeak = {};
for (const f of ["whoosh-1", "whoosh-2", "pop"]) sfxPeak[f] = peakOf(path.join(audioDir, `${f}.wav`));

// Variasi kecil yang deterministik (±1 dB, ±3%) supaya SFX tidak terdengar berulang
const jitter = (i, k) => Math.sin((i + 1) * 12.9898 + k * 78.233) * 0.5 + 0.5;
const inputs = ["-i", narasi];
const filters = [`[0:a]aresample=48000,adelay=${Math.round(meta.lead * 1000)}:all=1[nar]`];
const labels = ["[nar]"];
meta.cues.forEach((cue, i) => {
  inputs.push("-i", path.join(audioDir, `${cue.file}.wav`));
  const db = narPeak + A.sfxDb - sfxPeak[cue.file] + (jitter(i, 1) * 2 - 1) * A.sfxVariasiDb;
  const rate = 1 + (jitter(i, 2) * 2 - 1) * A.sfxVariasiPitch;
  const ms = Math.max(0, Math.round(cue.t * 1000));
  filters.push(`[${i + 1}:a]aresample=48000,asetrate=${Math.round(48000 * rate)},aresample=48000,volume=${db.toFixed(2)}dB,adelay=${ms}:all=1[s${i}]`);
  labels.push(`[s${i}]`);
  cue.gainDb = +db.toFixed(2);
});
filters.push(`${labels.join("")}amix=inputs=${labels.length}:normalize=0:duration=longest,apad,atrim=0:${meta.duration.toFixed(3)},loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[out]`);
const audioTmp = path.join(TMP, "audio.wav");
execFileSync("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error", ...inputs, "-filter_complex", filters.join(";"), "-map", "[out]", "-ar", "48000", "-ac", "2", audioTmp], { stdio: "inherit" });

const final = path.join(OUT, `${id}.mp4`);
execFileSync("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error", "-i", videoTmp, "-i", audioTmp, "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-shortest", "-movflags", "+faststart", final], { stdio: "inherit" });
fs.writeFileSync(path.join(OUT, `${id}.timeline.json`), JSON.stringify({ ...meta, narratorPeakDb: narPeak }, null, 2));
console.log("Selesai:", final);
