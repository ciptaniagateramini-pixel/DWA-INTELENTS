// Animasi logo outro bb gold (brief-logo-outro-bb-gold.md).
// draw(ctx, t, opt) deterministik: semua posisi dihitung dari waktu t (detik).

export const FPS = 30;
export const DURATION = 3.6;

// Palet canvas mustard (brief bagian 3) + biru tua untuk bayangan
export const COLOR = {
  canvas: "#E5B527",
  amp: "#21509A", ampLetter: "#F6DC7A",
  bKiri: "#FBF7EC", bKiriLetter: "#082A59",
  bKanan: "#082A59", bKananLetter: "#FBF7EC",
  teks: "#082A59",
  shadowRGB: "8, 42, 89",
};

// Waktu (detik) sesuai garis waktu brief bagian 4
export const T = {
  muncul: 0.10,
  antisipasi: [0.02, 0.10],
  spinStart: 0.10,
  kunci: [0.75, 0.85, 0.95], // &, B kiri, B kanan: selisih 3 frame, terakhir tepat 0,95
  huruf: [0.95, 1.05],
  besar: [1.05, 1.45],
  geser: [1.35, 1.95],
  teks: [1.55, 2.15],
  click: 1.60,
};

// Ukuran kelompok akhir (sebelum dolly kamera 1,04): logo 300 + celah 36 + teks ~498 = 834,
// sehingga setelah dolly kira-kira 312 / 37 / 520 dan tetap muat di zona aman 870 px.
const LOGO_W_AKHIR = 300;
const CELAH = 36;
const TEKS_W = 498;
const TEKS_CAP = 58; // tinggi huruf kapital target sebelum dolly
const CENTER = { x: 525, y: 900 }; // tengah zona aman (kiri 90, kanan 120)
const DOLLY = 0.04;
const PARALLAX_TEKS = 1.15;

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, p) => a + (b - a) * p;
const prog = (t, a, b) => clamp((t - a) / (b - a));
const expoOut = (p) => (p >= 1 ? 1 : 1 - Math.pow(2, -10 * p));
const cubicOut = (p) => 1 - Math.pow(1 - p, 3);
const inOut = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
const bump = (t, a, d) => Math.sin(Math.PI * prog(t, a, a + d)); // 0 -> 1 -> 0, satu kali
const DEG = Math.PI / 180;

let G = null; // geometri dari file logo

// Ambil sel dan huruf dari SVG logo asli (tanpa lapisan ketebalan 2.5D, tanpa latar)
export async function loadLogo(url) {
  const doc = new DOMParser().parseFromString(await (await fetch(url)).text(), "image/svg+xml");
  const polys = [...doc.querySelectorAll("polygon")].map((p) => p.getAttribute("points").trim().split(/\s+/).map((xy) => xy.split(",").map(Number)));
  const paths = [...doc.querySelectorAll("path")].map((p) => p.getAttribute("d"));
  // Urutan file: [bayangan &, sel &, bayangan B kiri, sel B kiri, bayangan B kanan, sel B kanan]
  const faces = [polys[1], polys[3], polys[5]];
  const cells = faces.map((pts, i) => {
    const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
    const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2;
    return { pts: pts.map(([x, y]) => [x - cx, y - cy]), cx, cy, letter: new Path2D(paths[i]) };
  });
  const allX = faces.flat().map((p) => p[0]), allY = faces.flat().map((p) => p[1]);
  const box = { x0: Math.min(...allX), x1: Math.max(...allX), y0: Math.min(...allY), y1: Math.max(...allY) };
  const origin = { x: (box.x0 + box.x1) / 2, y: (box.y0 + box.y1) / 2 };
  G = { cells, origin, halfW: (box.x1 - box.x0) / 2, k: LOGO_W_AKHIR / 1.08 / (box.x1 - box.x0) };
  return G;
}

// Ukuran font agar tinggi kapital ~58 px, lalu jarak huruf mengisi lebar ~498 px
let TEXT = null;
export function prepareText(ctx) {
  const size = Math.round(TEKS_CAP / 0.7);
  ctx.font = `700 ${size}px Poppins`;
  const m = ctx.measureText("BB GOLD");
  const cap = m.actualBoundingBoxAscent;
  const spacing = (TEKS_W - m.width) / 6;
  TEXT = { size, spacing, cap, width: TEKS_W };
  return TEXT;
}

function layout(t) {
  const groupW = LOGO_W_AKHIR + CELAH + TEKS_W;
  const groupLeft = CENTER.x - groupW / 2;
  const logoXAkhir = groupLeft + LOGO_W_AKHIR / 2;
  const shift = inOut(prog(t, ...T.geser));
  const dorong = -8 * bump(t, T.click, 0.3); // logo terdorong saat teks keluar
  const lx = lerp(CENTER.x, logoXAkhir, shift) + dorong;
  const ls = 1 + 0.08 * cubicOut(prog(t, ...T.besar));
  return { lx, ly: CENTER.y, ls, logoXAkhir };
}

// Transformasi kamera per bidang: logo 1,0x, teks 1,15x
function camera(t, L, f) {
  const d = 1 + f * DOLLY * (t / DURATION);
  const pan = f * 0.06 * (L.lx - L.logoXAkhir);
  return { d, pan };
}
function applyCam(ctx, cam) {
  ctx.translate(CENTER.x - cam.pan, CENTER.y);
  ctx.scale(cam.d, cam.d);
  ctx.translate(-CENTER.x, -CENTER.y);
}

function shadow(ctx, lift, scale) {
  ctx.shadowColor = `rgba(${COLOR.shadowRGB}, ${(0.23 - 0.09 * lift).toFixed(3)})`;
  ctx.shadowBlur = (18 + 14 * lift) * scale;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = (8 + 16 * lift) * scale;
}

function drawLogo(ctx, t, L) {
  const fills = [[COLOR.amp, COLOR.ampLetter], [COLOR.bKiri, COLOR.bKiriLetter], [COLOR.bKanan, COLOR.bKananLetter]];
  const k = G.k * L.ls;
  const alpha = prog(t, 0, T.muncul);
  const hp = cubicOut(prog(t, ...T.huruf));
  // Gambar sel yang terakhir mengunci di belakang supaya urutan tumpukan stabil
  [2, 1, 0].forEach((i) => {
    const c = G.cells[i];
    const tl = T.kunci[i];
    const e = expoOut(prog(t, T.spinStart, tl));
    const orbit = -540 * (1 - e) * DEG;
    const rf = 1.6 - 0.6 * e;
    const anti = inOut(prog(t, ...T.antisipasi));
    const base = t < T.spinStart ? lerp(0.6, 0.58, anti) : lerp(0.58, 1, e);
    const cs = base * (1 + 0.06 * Math.sin(Math.PI * e));
    const overshoot = 2.5 * bump(t, tl - 0.06, 0.24) * DEG;
    const rot = orbit + overshoot;
    const ox = c.cx - G.origin.x, oy = c.cy - G.origin.y;
    const len = Math.hypot(ox, oy);
    const push = 2.5 * bump(t, T.kunci[2], 0.2) / k; // saling mendorong 2-3 px saat mengunci
    let px = (ox * Math.cos(orbit) - oy * Math.sin(orbit)) * rf + (ox / len) * push;
    let py = (ox * Math.sin(orbit) + oy * Math.cos(orbit)) * rf + (oy / len) * push;
    const lift = t < T.spinStart ? 0.6 : 1 - e;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(L.lx + px * k, L.ly + py * k);
    ctx.rotate(rot);
    ctx.scale(k * cs, k * cs);
    shadow(ctx, lift, 1); // bayangan dalam piksel layar, tidak ikut skala
    ctx.beginPath();
    c.pts.forEach(([x, y], j) => (j ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.closePath();
    ctx.fillStyle = fills[i][0];
    ctx.fill();
    ctx.shadowColor = "transparent";
    if (hp > 0) {
      ctx.globalAlpha = alpha * hp;
      const ls = 0.85 + 0.15 * hp;
      ctx.scale(ls, ls);
      ctx.translate(-c.cx, -c.cy);
      ctx.fillStyle = fills[i][1];
      ctx.fill(c.letter);
    }
    ctx.restore();
  });
}

function drawText(ctx, t, L) {
  const p = prog(t, ...T.teks);
  if (p <= 0) return;
  const e = expoOut(p);
  const logoRight = L.lx + G.halfW * G.k * L.ls;
  // Mulai cukup jauh di balik logo agar huruf pertama tepat terlihat di T.click
  const e1 = expoOut((T.click - T.teks[0]) / (T.teks[1] - T.teks[0]));
  const k = (e1 * (CELAH + TEKS_W)) / (1 - e1);
  const left = logoRight + lerp(-TEKS_W - k, CELAH, e);
  const s = lerp(0.94, 1, e);
  const dy = lerp(10, 0, e);
  ctx.save();
  ctx.translate(left, L.ly + dy);
  ctx.scale(s, s);
  shadow(ctx, 1 - e, 1);
  ctx.fillStyle = COLOR.teks;
  ctx.font = `700 ${TEXT.size}px Poppins`;
  ctx.letterSpacing = `${TEXT.spacing.toFixed(2)}px`;
  ctx.textBaseline = "alphabetic";
  ctx.fillText("BB GOLD", 0, TEXT.cap / 2);
  ctx.restore();
}

export function drawFrame(ctx, t, { background = true } = {}) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, 1080, 1920);
  if (background) { ctx.fillStyle = COLOR.canvas; ctx.fillRect(0, 0, 1080, 1920); }
  const L = layout(t);
  // Mask di ruang layar: teks hanya terlihat di kanan tepi logo (mengikuti kamera bidang logo)
  const cl = camera(t, L, 1);
  const edge = CENTER.x - cl.pan + cl.d * (L.lx + G.halfW * G.k * L.ls - CENTER.x);
  ctx.save();
  ctx.beginPath(); ctx.rect(edge, 0, 1080, 1920); ctx.clip();
  applyCam(ctx, camera(t, L, PARALLAX_TEKS)); drawText(ctx, t, L);
  ctx.restore();
  ctx.save(); applyCam(ctx, camera(t, L, 1)); drawLogo(ctx, t, L); ctx.restore();
}

// Motion blur: rata-rata 8 sub-frame (bukan blur Gaussian), hanya saat gerak cepat
export function blurActive(t) {
  return (t > T.spinStart && t < T.kunci[2] + 0.02) || (t > T.teks[0] && t < T.teks[0] + 0.3);
}
