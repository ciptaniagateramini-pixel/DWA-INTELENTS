// Render Reels "Perhiasan Permata Part 1" dari perhiasan-part1/index.html (deterministik per frame).
// Pemakaian:
//   node perhiasan-part1/render.mjs --sheet           contact sheet 16 frame (kirim ke pemilik dulu)
//   node perhiasan-part1/render.mjs --preview=1.2,7.5 frame tertentu
//   node perhiasan-part1/render.mjs                   render final MP4
import { createRequire } from "module";
import { spawn, spawnSync, execFileSync } from "child_process";
import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args0 = process.argv.slice(2);
const DATA = (args0.find((a) => a.startsWith("--data=")) || "--data=data/perhiasan-part1.json").slice(7);
const DJSON = JSON.parse(fs.readFileSync(path.join(path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."), DATA), "utf8"));
const ID = DJSON.out || DJSON.id;
const OUT = path.join(ROOT, "render");
const TMP = path.join(OUT, ".tmp-" + ID);
fs.mkdirSync(TMP, { recursive: true });
const args = process.argv.slice(2);
const tokens = JSON.parse(fs.readFileSync(path.join(ROOT, "tokens.json"), "utf8"));

// Frame contact sheet: awal tiap kalimat, puncak tiap adegan, kartu, zoom out, outro
const SHEET = DJSON.sheet || [0.2, 1.2, 3.8, 4.95, 7.2, 10.5, 11.9, 14.5, 16.6, 20.0, 23.2, 24.6, 25.8, 26.85, 27.38, 29.6];

const MIME = { ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".svg": "image/svg+xml", ".woff2": "font/woff2" };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(new URL(req.url, "http://x").pathname));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "Content-Type": MIME[path.extname(p)] || "application/octet-stream" });
  fs.createReadStream(p).pipe(res);
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));

const browser = await chromium.launch();
const DRAFT = args.includes("--draft"); // pratinjau 540x960 15 fps
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: DRAFT ? 0.5 : 1 });
page.on("pageerror", (e) => { console.error("[page error]", e); process.exit(1); });
page.on("console", (m) => console.log("[page]", m.text()));
await page.goto(`http://127.0.0.1:${server.address().port}/perhiasan-part1/index.html?data=${DATA}`);
await page.waitForFunction(() => window.__ready === true, null, { timeout: 60000 });
const meta = await page.evaluate(() => window.__meta);
const shot = async (t) => { await page.evaluate((tt) => window.renderAt(tt), t); return page.screenshot({ type: "png" }); };
const finish = async () => { await browser.close(); server.close(); };
if (meta.shifted.length) console.log("Pop digeser agar jarak SFX >= 0,15 dtk:", meta.shifted.map(([a, b]) => `${a.toFixed(2)}->${b.toFixed(2)}`).join(", "));

const sheet = args.includes("--sheet");
const preview = args.find((a) => a.startsWith("--preview="));
if (sheet || preview) {
  const times = sheet ? SHEET : preview.slice(10).split(",").map(Number);
  fs.readdirSync(TMP).filter((f) => f.startsWith("p-")).forEach((f) => fs.unlinkSync(path.join(TMP, f)));
  for (const [i, t] of times.entries()) fs.writeFileSync(path.join(TMP, `p-${String(i).padStart(2, "0")}.png`), await shot(t));
  await finish();
  if (sheet) {
    const label = times.map((t, i) => `[${i}:v]scale=270:480:flags=lanczos,drawtext=fontfile=${path.join(ROOT, "assets/fonts/Poppins-Bold.woff2")}:text='${t.toFixed(2)} s':x=10:y=10:fontsize=22:fontcolor=0x082A59:box=1:boxcolor=0xFBF7EC:boxborderw=6[v${i}]`);
    const inputs = times.flatMap((_, i) => ["-i", path.join(TMP, `p-${String(i).padStart(2, "0")}.png`)]);
    const stack = times.map((_, i) => `[v${i}]`).join("") + `xstack=inputs=${times.length}:layout=` + times.map((_, i) => `${(i % 8) * 270}_${Math.floor(i / 8) * 480}`).join("|") + "[out]";
    execFileSync("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error", ...inputs, "-filter_complex", [...label, stack].join(";"), "-map", "[out]", "-frames:v", "1", path.join(OUT, `${ID}-contact-sheet.png`)]);
    console.log("Contact sheet:", path.join(OUT, `${ID}-contact-sheet.png`));
  } else console.log("Preview di", TMP);
  process.exit(0);
}

// ---- Render final ----
const fps = DRAFT ? 15 : meta.fps, frames = Math.round(meta.duration * fps);
const videoTmp = path.join(TMP, "video.mp4");
const ff = spawn("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(fps), "-c:v", "png", "-i", "-",
  "-c:v", "libx264", "-preset", "slow", "-crf", "17", "-pix_fmt", "yuv420p", "-r", String(fps), videoTmp], { stdio: ["pipe", "inherit", "inherit"] });
const ffDone = new Promise((r, j) => ff.on("close", (c) => (c ? j(new Error("ffmpeg " + c)) : r())));
for (let i = 0; i < frames; i++) {
  const buf = await shot(i / fps);
  if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
  if (i % 30 === 0) process.stdout.write(`\rframe ${i}/${frames}`);
}
ff.stdin.end();
await ffDone;
await finish();
console.log(`\rframe ${frames}/${frames}`);

// ---- Audio ----
const A = tokens.audio, AUD = path.join(ROOT, "assets/audio");
const peakOf = (f) => parseFloat(/max_volume: (-?[\d.]+) dB/.exec(spawnSync("ffmpeg", ["-hide_banner", "-i", f, "-af", "volumedetect", "-f", "null", "-"], { encoding: "utf8" }).stderr)[1]);
const narasi = path.join(ROOT, meta.audio);
const narPeak = peakOf(narasi);
const jitter = (i, k) => Math.sin((i + 1) * 12.9898 + k * 78.233) * 0.5 + 0.5;
const inputs = ["-i", narasi];
const fl = [`[0:a]aresample=48000,adelay=${Math.round(meta.lead * 1000)}:all=1[nar]`];
const labels = ["[nar]"];
let n = 1;
const add = (file, t, db, rate = 1) => {
  inputs.push("-i", file);
  fl.push(`[${n}:a]aresample=48000,asetrate=${Math.round(48000 * rate)},aresample=48000,volume=${db.toFixed(2)}dB,adelay=${Math.max(0, Math.round(t * 1000))}:all=1[s${n}]`);
  labels.push(`[s${n}]`);
  n++;
};
meta.cues.forEach((c, i) => {
  const f = path.join(AUD, `${c.file}.wav`);
  const db = narPeak + A.sfxDb - peakOf(f) + (jitter(i, 1) * 2 - 1) * A.sfxVariasiDb;
  add(f, c.t, db, 1 + (jitter(i, 2) * 2 - 1) * A.sfxVariasiPitch);
});
// Outro: tiga file final pemilik, tanpa pitch shift. Click paling jelas, whoosh geser paling pelan.
const O = path.join(AUD, "logo-outro"), t0 = meta.outro.mulai;
add(path.join(O, "putaran-logo.wav"), t0, narPeak - 8 - peakOf(path.join(O, "putaran-logo.wav")));
add(path.join(O, "whoosh-geser.wav"), t0 + 1.30, narPeak - 14 - peakOf(path.join(O, "whoosh-geser.wav")));
add(path.join(O, "click.mp3"), t0 + 1.60, narPeak - 5 - peakOf(path.join(O, "click.mp3")));
fl.push(`${labels.join("")}amix=inputs=${labels.length}:normalize=0:duration=longest,highpass=f=60,apad,atrim=0:${meta.duration.toFixed(3)}[mix]`);
const mixWav = path.join(TMP, "mix.wav");
execFileSync("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error", ...inputs, "-filter_complex", fl.join(";"), "-map", "[mix]", "-ar", "48000", "-ac", "2", mixWav], { stdio: "inherit" });
// Gain statis ke -14 LUFS lalu limiter (tanpa kompresi dinamis)
const I = parseFloat(/I:\s+(-?[\d.]+) LUFS/.exec(spawnSync("ffmpeg", ["-hide_banner", "-i", mixWav, "-af", "ebur128", "-f", "null", "-"], { encoding: "utf8" }).stderr.split("Summary")[1])[1]);
const finalWav = path.join(TMP, "final.wav");
execFileSync("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error", "-i", mixWav, "-af", `volume=${(-14 - I).toFixed(2)}dB,alimiter=limit=0.84:level=false`, finalWav]);
const final = path.join(OUT, `${ID}${DRAFT ? "-draft" : ""}.mp4`);
execFileSync("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error", "-i", videoTmp, "-i", finalWav, "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-shortest", "-movflags", "+faststart", final], { stdio: "inherit" });
fs.writeFileSync(path.join(OUT, `${ID}.timeline.json`), JSON.stringify({ ...meta, narratorPeakDb: narPeak, mixLufsBefore: I }, null, 2));
console.log("Selesai:", final);
