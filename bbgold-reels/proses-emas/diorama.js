// Gaya A "diorama pabrik isometrik": ban berjalan melewati stasiun proses, kamera mengikuti emasnya,
// teks muncul per kata di bawah layar, blok judul tahap di kiri atas. Kanvas mustard + grid tipis.
// renderAt(t) deterministik (semua gerak fungsi waktu video).
import { loadLogo, prepareText, OPT as LOGO_OPT } from "/logo-outro/logo.js";
import { makeRenderer } from "/logo-outro/blur.js";

const W = 1080, H = 1920;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, p) => a + (b - a) * p;
const prog = (t, a, d) => clamp((t - a) / d);
const eOut = (p) => 1 - Math.pow(1 - p, 3);
const eExpo = (p) => (p >= 1 ? 1 : 1 - Math.pow(2, -10 * p));
const eInOut = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
const C30 = Math.cos(Math.PI / 6), S30 = 0.5;

export async function boot(dataPath) {
  const tokens = await (await fetch("/tokens.json")).json();
  const data = await (await fetch("/" + dataPath)).json();
  const words = (await (await fetch("/" + data.words)).json()).words;
  const { biru: B, mustard: M, mustardMuda: MM, krem: K, abuBiru: A } = tokens.color;
  const lead = data.jedaAwal, V = (n) => n + lead;
  for (const [file, weight] of [["Poppins-Bold", "700"], ["Poppins-Medium", "500"], ["Poppins-Light", "300"]]) {
    const f = new FontFace("Poppins", `url(/assets/fonts/${file}.woff2)`, { weight });
    document.fonts.add(await f.load());
  }
  const cv = document.getElementById("main");
  const g = cv.getContext("2d");
  const outroCanvas = document.getElementById("outro");
  const T = data.waktu; // semua waktu video

  // ---- Kamera (keyframe pada titik dunia isometrik) ----
  const P = (x, y, z = 0) => [(x - y) * C30, (x + y) * S30 - z];
  const cams = data.kamera.map((k) => ({ t: k.t, d: k.d ?? 0.8, p: P(k.x, k.y ?? 0, k.z ?? 80), s: k.s }));
  function camera(t) {
    let cur = { p: cams[0].p, s: cams[0].s };
    for (const k of cams.slice(1)) {
      if (t < k.t) break;
      const e = (k.ease === "expo" ? eExpo : eInOut)(prog(t, k.t, k.d));
      cur = { p: [lerp(cur.p[0], k.p[0], e), lerp(cur.p[1], k.p[1], e)], s: lerp(cur.s, k.s, e) };
    }
    // napas kamera sangat halus supaya tidak pernah beku
    return { p: [cur.p[0] + Math.sin(t * 0.6) * 6, cur.p[1] + Math.cos(t * 0.5) * 4], s: cur.s * (1 + 0.012 * Math.sin(t * 0.4)) };
  }
  const FOCUS = [540, 900];

  // ---- Helper gambar ----
  let cam;
  const S = (x, y, z = 0) => { const p = P(x, y, z); return [(p[0] - cam.p[0]) * cam.s + FOCUS[0], (p[1] - cam.p[1]) * cam.s + FOCUS[1]]; };
  const LW = () => Math.max(1.5, 5 * cam.s);
  function poly(pts, fill, stroke = B, lw = LW(), alpha = 1) {
    g.save(); g.globalAlpha *= alpha; g.beginPath();
    pts.forEach((p, i) => (i ? g.lineTo(...p) : g.moveTo(...p))); g.closePath();
    if (fill) { g.fillStyle = fill; g.fill(); }
    if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw; g.lineJoin = "round"; g.stroke(); }
    g.restore();
  }
  function box(x, y, z, w, d, h, top, left, right, opt = {}) {
    const z1 = z + h;
    if (opt.shadow !== false) poly([S(x + 18, y + 18, 0), S(x + w + 18, y + 18, 0), S(x + w + 18, y + d + 18, 0), S(x + 18, y + d + 18, 0)], B, null, 0, 0.1 * (opt.alpha ?? 1));
    poly([S(x, y + d, z), S(x + w, y + d, z), S(x + w, y + d, z1), S(x, y + d, z1)], left, B, LW(), opt.alpha ?? 1);
    poly([S(x + w, y, z), S(x + w, y + d, z), S(x + w, y + d, z1), S(x + w, y, z1)], right, B, LW(), opt.alpha ?? 1);
    poly([S(x, y, z1), S(x + w, y, z1), S(x + w, y + d, z1), S(x, y + d, z1)], top, B, LW(), opt.alpha ?? 1);
  }
  const circ = (c, u, v, r, n = 40) => Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2; return S(c[0] + (u[0] * Math.cos(a) + v[0] * Math.sin(a)) * r, c[1] + (u[1] * Math.cos(a) + v[1] * Math.sin(a)) * r, c[2] + (u[2] * Math.cos(a) + v[2] * Math.sin(a)) * r); });
  const flat = (x, y, z, r) => circ([x, y, z], [1, 0, 0], [0, 1, 0], r);
  function cylinder(x, y, z, r, h, side, top, opt = {}) {
    const bot = flat(x, y, z, r), tp = flat(x, y, z + h, r);
    const a = S(x + r * 0.7071, y - r * 0.7071, z), b = S(x - r * 0.7071, y + r * 0.7071, z);
    const a2 = S(x + r * 0.7071, y - r * 0.7071, z + h), b2 = S(x - r * 0.7071, y + r * 0.7071, z + h);
    // badan: setengah elips bawah + sisi
    const half = bot.filter((p, i) => { const ang = (i / bot.length) * 360; return ang >= 315 || ang <= 135; });
    poly([b2, a2, a, ...half.slice().reverse(), b], side, B, LW(), opt.alpha ?? 1);
    poly(tp, top, B, LW(), opt.alpha ?? 1);
  }
  function ringFlat(x, y, z, r, fill = M) {
    poly(flat(x, y, z, r), null, B, Math.max(3, r * 0.55 * cam.s));
    poly(flat(x, y, z, r), null, fill, Math.max(2, r * 0.32 * cam.s));
  }
  function text(s, x, y, size, color, weight = 700, align = "center", stroke = null) {
    g.font = `${weight} ${size}px Poppins`; g.textAlign = align; g.textBaseline = "middle";
    if (stroke) { g.lineWidth = size * 0.16; g.strokeStyle = stroke; g.lineJoin = "round"; g.strokeText(s, x, y); }
    g.fillStyle = color; g.fillText(s, x, y);
  }
  function pill(label, x, y, size, bg = K, fg = B) {
    g.font = `700 ${size}px Poppins`;
    const w = g.measureText(label).width + size * 1.2, h = size * 1.7;
    g.beginPath(); g.roundRect(x - w / 2, y - h / 2, w, h, h / 2); g.fillStyle = bg; g.fill();
    g.lineWidth = Math.max(2, size * 0.1); g.strokeStyle = B; g.stroke();
    text(label, x, y + size * 0.04, size, fg);
  }
  const popScale = (t, t0, d = 0.4) => (t < t0 ? 0 : 0.7 + 0.3 * eExpo(prog(t, t0, d)));

  // ---- Posisi stasiun (sumbu x ban berjalan) ----
  const X = data.stasiun; // {toko, tungku, murni, cetak, pengrajin, etalase}
  const BELT = { x0: X.toko - 420, x1: X.etalase + 260, y: 0, d: 170, h: 70 };

  // Posisi barang yang diproses di sepanjang ban (fungsi waktu)
  const path = data.jalur.map((k) => ({ t: k.t, x: k.x, d: k.d ?? 0.8 }));
  const itemX = (t) => { let x = path[0].x; for (const k of path.slice(1)) { if (t < k.t) break; x = lerp(x, k.x, eInOut(prog(t, k.t, k.d))); } return x; };

  function drawGrid() {
    g.fillStyle = M; g.fillRect(0, 0, W, H);
    const step = tokens.grid.sel * cam.s, ox = ((FOCUS[0] - cam.p[0] * cam.s) % step + step) % step, oy = ((FOCUS[1] - cam.p[1] * cam.s) % step + step) % step;
    g.strokeStyle = B; g.globalAlpha = cam.s >= 1 ? tokens.grid.opacity : lerp(tokens.grid.opacityMin, tokens.grid.opacity, clamp((cam.s - 0.3) / 0.7));
    g.lineWidth = tokens.grid.garis; g.beginPath();
    for (let x = ox; x < W; x += step) { g.moveTo(Math.round(x) + 0.5, 0); g.lineTo(Math.round(x) + 0.5, H); }
    for (let y = oy; y < H; y += step) { g.moveTo(0, Math.round(y) + 0.5); g.lineTo(W, Math.round(y) + 0.5); }
    g.stroke(); g.globalAlpha = 1;
  }

  function drawBelt(t) {
    const { x0, x1, y, d, h } = BELT;
    box(x0, y, 0, x1 - x0, d, h, B, A, A);
    // garis ban yang bergerak
    const off = (t * 140) % 120;
    for (let x = x0 + off; x < x1; x += 120) poly([S(x, y + 12, h), S(x + 50, y + 12, h), S(x + 50, y + d - 12, h), S(x, y + d - 12, h)], null, K, Math.max(1.5, 3 * cam.s), 0.35);
    // kaki ban
    for (let x = x0 + 120; x < x1; x += 600) box(x, y + d - 30, -140, 40, 30, 140, A, A, B, { shadow: false });
  }

  // ---- Stasiun ----
  function toko(t) {
    const x = X.toko;
    box(x - 380, -360, 0, 330, 260, 210, K, A, B); // meja toko
    poly([S(x - 360, -100, 150), S(x - 70, -100, 150), S(x - 70, -100, 90), S(x - 360, -100, 90)], B, B);
    const lbl = S(x - 215, -100, 120); text("JUAL BELI EMAS", lbl[0], lbl[1], Math.max(10, 26 * cam.s), K);
  }
  function tray(t, x) { box(x - 130, 15, 70, 260, 140, 14, K, MM, M, { shadow: false }); }
  function piecesOld(t, x, alpha = 1) {
    const [a, b, c] = T.perhiasan;
    if (t >= a) { const s = popScale(t, a); ringFlat(x - 55, 70, 86 + (1 - s) * 40, 38 * s); }
    if (t >= b) { const s = popScale(t, b); for (let i = 0; i < 6; i++) ringFlat(x + 5 + i * 22, 108, 86 + (1 - s) * 40, 10 * s); }
    if (t >= c) { const s = popScale(t, c); poly(flat(x + 75, 55, 86 + (1 - s) * 40, 26 * s).filter((_, i) => i % 7 === 0), M, B); }
  }
  function tungku(t) {
    const x = X.tungku;
    box(x - 150, -60, 70, 300, 290, 330, A, A, B);
    cylinder(x + 60, 10, 400, 40, 150, A, B); // cerobong
    // pintu menyala
    const glow = clamp((t - T.lebur[0]) / 0.6) * (1 - clamp((t - T.lebur[1]) / 0.8));
    const door = [S(x - 90, 230, 110), S(x + 90, 230, 110), S(x + 90, 230, 300), S(x - 90, 230, 300)];
    poly(door, B, B);
    for (let i = 0; i < 3; i++) {
      const fx = x - 50 + i * 50, fh = (60 + 30 * Math.sin(t * 9 + i * 2)) * (0.5 + glow);
      poly([S(fx - 22, 230, 120), S(fx, 230, 120 + fh), S(fx + 22, 230, 120)], i === 1 ? MM : M, B, Math.max(1.5, 3 * cam.s));
    }
    // gelombang panas dari cerobong
    for (let i = 0; i < 3; i++) {
      const ph = ((t * 0.8 + i / 3) % 1), z = 560 + ph * 160;
      const p = S(x + 60, 10, z), sz = 22 * cam.s;
      g.save(); g.globalAlpha = (1 - ph) * (0.25 + glow * 0.7); g.strokeStyle = K; g.lineWidth = Math.max(2, 6 * cam.s); g.lineCap = "round";
      g.beginPath(); g.moveTo(p[0] - sz, p[1]); g.quadraticCurveTo(p[0], p[1] - sz, p[0] + sz, p[1]); g.stroke(); g.restore();
    }
  }
  function wadah(t, x, specks) { // wadah lebur berisi emas cair
    cylinder(x, 85, 70, 60, 70, K, B);
    poly(flat(x, 85, 140, 46), MM, B, Math.max(1.5, 3 * cam.s));
    poly(flat(x - 10, 78, 140, 20), K, null, 0, 0.7);
    if (specks) for (const s of specks) if (s.a > 0) poly(flat(x + s.dx, 85 + s.dy, 141, 7), A, B, Math.max(1, 2 * cam.s), s.a);
  }
  function murni(t) {
    const x = X.murni;
    box(x - 120, -300, 0, 110, 110, 420, A, A, B); // tiang
    // lengan penyaring: turun saat menyaring
    const k = Math.sin(Math.PI * prog(t, T.murni[0], T.murni[1] - T.murni[0]));
    const z = 360 - 150 * k;
    box(x - 110, -250, z, 60, 300, 40, K, A, B, { shadow: false });
    cylinder(x - 80, 75, z - 50, 26, 50, K, B, { alpha: 1 });
  }
  function cetak(t) {
    const x = X.cetak;
    box(x - 200, 10, 70, 340, 150, 60, A, A, B); // cetakan
    const fill = eOut(prog(t, T.tuang[0] + 0.2, T.tuang[1] - T.tuang[0]));
    poly([S(x - 170, 40, 131), S(x + 110, 40, 131), S(x + 110, 130, 131), S(x - 170, 130, 131)], B, B);
    if (fill > 0) {
      const cool = prog(t, T.dingin[0], T.dingin[1] - T.dingin[0]);
      const zz = 131 + 0.1;
      poly([S(x - 170, 40, zz), S(x - 170 + 280 * fill, 40, zz), S(x - 170 + 280 * fill, 130, zz), S(x - 170, 130, zz)], MM, B, LW());
      if (cool > 0) poly([S(x - 170, 40, zz), S(x - 170 + 280 * fill, 40, zz), S(x - 170 + 280 * fill, 130, zz), S(x - 170, 130, zz)], M, B, LW(), cool);
    }
    // mesin cap
    const down = t >= T.cap ? Math.sin(Math.PI * prog(t, T.cap, 0.35)) : 0;
    box(x - 60, -280, 0, 100, 100, 520, A, A, B);
    box(x - 70, -10, 340 - 190 * down, 120, 120, 50, K, A, B, { shadow: false });
    if (t >= T.cap + 0.15) poly(flat(x - 10, 85, 132, 22).filter((_, i) => i % 7 === 0), MM, B, LW());
    // wadah dituang (diangkat dan dimiringkan)
    const lift = eInOut(prog(t, T.tuang[0] - 0.4, 0.4)) * (1 - eInOut(prog(t, T.tuang[1], 0.4)));
    if (t > T.tuang[0] - 0.5 && t < T.tuang[1] + 0.5) {
      const wx = x + 230, z0 = 70 + 220 * lift;
      cylinder(wx, 85, z0, 60, 70, K, B);
      poly(flat(wx, 85, z0 + 70, 46), MM, B, LW());
      if (t > T.tuang[0] && t < T.tuang[1]) {
        const a = S(wx - 55, 85, z0 + 60), b = S(x + 60, 85, 132);
        g.save(); g.strokeStyle = B; g.lineWidth = 26 * cam.s; g.lineCap = "round"; g.beginPath(); g.moveTo(...a); g.quadraticCurveTo(b[0] + 40 * cam.s, a[1], ...b); g.stroke();
        g.strokeStyle = MM; g.lineWidth = 16 * cam.s; g.stroke(); g.restore();
      }
    }
  }
  function pengrajin(t, barX) {
    const x = X.pengrajin;
    box(x - 60, -160, 70, 120, 90, 300, A, A, B); // rangka belakang
    const rot = t * 6;
    for (const z of [150, 270]) {
      const pts = circ([x, -70, z], [1, 0, 0], [0, 0, 1], 52);
      g.save(); poly(pts, K, B);
      for (let i = 0; i < 3; i++) { const a = rot + (i * Math.PI) / 3; const p1 = S(x + Math.cos(a) * 48, -70, z + Math.sin(a) * 48), p2 = S(x - Math.cos(a) * 48, -70, z - Math.sin(a) * 48); g.beginPath(); g.moveTo(...p1); g.lineTo(...p2); g.strokeStyle = B; g.lineWidth = LW(); g.stroke(); }
      g.restore();
    }
    box(x - 60, 180, 70, 120, 60, 300, A, A, B); // rangka depan
    // kawat keluar lalu dibentuk jadi cincin
    const wire = prog(t, T.giling[0], T.giling[1] - T.giling[0]);
    if (wire > 0 && t < T.bentuk[1] + 0.2) {
      const len = 360 * eOut(wire) * (1 - prog(t, T.bentuk[0], T.bentuk[1] - T.bentuk[0]));
      if (len > 2) box(x + 60, 75, 70, len, 20, 12, MM, M, M, { shadow: false });
    }
    const form = prog(t, T.bentuk[0], T.bentuk[1] - T.bentuk[0]);
    if (form > 0) {
      const pts = flat(x + 260, 85, 82, 40);
      const n = Math.max(2, Math.round(pts.length * eOut(form)));
      g.save(); g.beginPath(); pts.slice(0, n).forEach((p, i) => (i ? g.lineTo(...p) : g.moveTo(...p)));
      g.strokeStyle = B; g.lineWidth = 24 * cam.s; g.lineCap = "round"; g.stroke(); g.strokeStyle = M; g.lineWidth = 14 * cam.s; g.stroke(); g.restore();
    }
  }
  function etalase(t) {
    const x = X.etalase;
    // etalase kaca berisi perhiasan baru
    const sc = popScale(t, T.etalase);
    if (sc > 0) {
      g.save(); g.globalAlpha = clamp((t - T.etalase) / 0.3);
      box(x - 140, 20, 70, 260, 130, 30, K, MM, M, { shadow: false });
      ringFlat(x - 60, 85, 100, 46);
      poly(flat(x - 60, 40, 110, 18).filter((_, i) => i % 7 === 0), K, B);
      for (let i = 0; i < 7; i++) ringFlat(x + 10 + i * 14, 60 + Math.sin(i * 0.9) * 22, 101, 6);
      poly(flat(x + 60, 110, 101, 18).filter((_, i) => i % 7 === 0), M, B);
      // kaca
      poly([S(x - 150, 160, 100), S(x + 130, 160, 100), S(x + 130, 160, 230), S(x - 150, 160, 230)], K, B, LW(), 0.18);
      poly([S(x + 130, 10, 100), S(x + 130, 160, 100), S(x + 130, 160, 230), S(x + 130, 10, 230)], K, B, LW(), 0.12);
      poly([S(x - 150, 10, 230), S(x + 130, 10, 230), S(x + 130, 160, 230), S(x - 150, 160, 230)], K, B, LW(), 0.22);
      g.restore();
    }
    // kolom harga bertumpuk
    const col = (cx, blocks, t0s) => {
      let z = 0;
      blocks.forEach((b, i) => {
        const s = t >= t0s[i] ? eExpo(prog(t, t0s[i], 0.45)) : 0;
        if (s <= 0) return;
        const dz = (1 - s) * 120;
        box(cx, cx === x + 420 ? -620 : -420, z + dz, 170, 170, b.h, b.top, b.left, b.right, { shadow: i === 0, alpha: s });
        z += b.h;
      });
      return z;
    };
    const emas = { h: 230, top: MM, left: M, right: M };
    const peng = { h: 100, top: K, left: A, right: A };
    const prod = { h: 80, top: K, left: B, right: B };
    col(x + 220, [emas, peng, prod], [T.blok[0], T.blok[1], T.blok[2]]);
    col(x + 420, [emas], [T.jual]);
    // label
    const lab = (s, wx, wy, wz, t0, size = 34) => { if (t < t0) return; g.save(); g.globalAlpha = clamp((t - t0) / 0.3); const p = S(wx, wy, wz); pill(s, p[0], p[1], size * Math.max(0.6, cam.s)); g.restore(); };
    lab("Emas", x + 305, -335, 115, T.blok[0], 40);
    lab("Pengrajin", x + 305, -335, 280, T.blok[1], 40);
    lab("Produksi", x + 305, -335, 370, T.blok[2], 40);
    lab("Saat beli", x + 305, -250, -60, T.blok[0] + 0.3, 40);
    lab("Saat jual", x + 505, -450, -60, T.jual + 0.2, 40);
    lab("Emas", x + 505, -535, 115, T.jual, 40);
    // garis selisih: dari puncak kolom beli ke tinggi kolom jual, kurung "spread" di kanan
    if (t >= T.spread) {
      const a = clamp((t - T.spread) / 0.3);
      const topB = S(x + 590, -620, 230), hiA = S(x + 390, -420, 410), loA = S(x + 390, -420, 230);
      const bx = topB[0] + 40 * cam.s;
      g.save(); g.globalAlpha = a; g.strokeStyle = B; g.lineWidth = LW(); g.setLineDash([14 * cam.s, 10 * cam.s]);
      g.beginPath(); g.moveTo(hiA[0], hiA[1]); g.lineTo(bx, hiA[1]); g.moveTo(loA[0], loA[1]); g.lineTo(bx, loA[1]); g.stroke(); g.setLineDash([]);
      g.lineWidth = LW() * 1.6; g.beginPath(); g.moveTo(bx, hiA[1]); g.lineTo(bx, loA[1]); g.stroke();
      pill("spread", bx + 110 * cam.s, (hiA[1] + loA[1]) / 2, 46 * cam.s, B, K);
      g.restore();
    }
  }

  // Barang yang berjalan di ban: baki perhiasan lama -> (lebur) -> wadah cair -> batangan -> (kawat)
  const specks = [{ dx: -20, dy: -10 }, { dx: 15, dy: 12 }, { dx: 5, dy: -22 }, { dx: -25, dy: 18 }];
  function movingItem(t) {
    const x = itemX(t);
    if (t < T.lebur[0]) { tray(t, x); piecesOld(t, x); return; }
    if (t < T.keluarTungku) return; // sedang di dalam tungku
    if (t < T.tuang[0] - 0.5) {
      const k = prog(t, T.murni[0] + 0.2, T.murni[1] - T.murni[0] - 0.2);
      wadah(t, x, specks.map((s, i) => ({ ...s, a: 1 - clamp(k * 1.6 - i * 0.15) })));
      return;
    }
    if (t >= T.batangJalan && t < T.giling[0]) {
      box(x - 140, 40, 70, 280, 90, 50, MM, M, M, { shadow: false });
      poly(flat(x - 10, 85, 121, 22).filter((_, i) => i % 7 === 0), MM, B, LW());
    }
  }

  // ---- Teks: blok judul tahap + kata per kata ----
  const KUNCI = new Set(data.kataKunci.map((w) => w.toLowerCase()));
  const capWords = words.map((w) => ({ ...w, t0: V(w.start), clean: w.text.replace(/[,.?]/g, "") }));
  function caption(t) {
    let cur = null;
    for (let i = 0; i < capWords.length; i++) {
      const w = capWords[i], next = capWords[i + 1];
      const end = next ? Math.min(next.t0, w.t0 + 1.2) : w.t0 + 0.9;
      if (t >= w.t0 && t < end) cur = w;
    }
    if (!cur) return;
    const key = KUNCI.has(cur.clean.toLowerCase());
    const s = 0.86 + 0.14 * eExpo(prog(t, cur.t0, 0.18));
    g.save(); g.translate(540, 1420); g.scale(s, s);
    if (key) text(cur.clean.toUpperCase(), 0, 0, 132, B, 700, "center", K);
    else text(cur.clean.toUpperCase(), 0, 0, 96, K, 700, "center", B);
    g.restore();
  }
  function titleBlock(t) {
    let st = null;
    for (const s of data.tahap) if (t >= s.t) st = s;
    if (!st) return;
    const a = eOut(prog(t, st.t, 0.4));
    g.save(); g.globalAlpha = a; g.translate(-(1 - a) * 40, 0);
    text(data.label.toUpperCase(), 90, 285, 30, B, 500, "left", K);
    text(st.judul, 90, 350, 84, B, 700, "left", K);
    if (st.no) { g.font = "700 84px Poppins"; const w = g.measureText(st.judul).width; pill(st.no, 90 + w + 70, 352, 34, B, K); }
    g.restore();
  }

  // ---- Outro & audio cue ----
  LOGO_OPT.spinDeg = data.penutup.outroPutaran;
  await loadLogo("/assets/logo/bb-gold-profil-ring-mustard.svg");
  prepareText(outroCanvas.getContext("2d"));
  const renderOutro = makeRenderer(outroCanvas);
  const PN = data.penutup;
  const duration = PN.outroMulai + 3.6;
  const cues = [];
  data.kamera.slice(1).forEach((k) => cues.push({ type: "whoosh", t: k.t - tokens.audio.whooshLead }));
  for (const t of data.pops) cues.push({ type: "pop", t });
  cues.sort((a, b) => a.t - b.t);
  const shifted = [];
  for (let i = 1; i < cues.length; i++) if (cues[i].t - cues[i - 1].t < tokens.audio.jedaSfxMin - 1e-6) shifted.push([cues[i].t, cues[i - 1].t]);
  let wn = 0; cues.forEach((c) => (c.file = c.type === "whoosh" ? `whoosh-${(wn++ % 2) + 1}` : "pop"));

  window.renderAt = (t) => {
    cam = camera(t);
    drawGrid();
    drawBelt(t);
    toko(t); tungku(t); murni(t); cetak(t);
    movingItem(t);
    pengrajin(t); etalase(t);
    titleBlock(t);
    caption(t);
    const f = eInOut(prog(t, PN.crossFade[0], PN.crossFade[1] - PN.crossFade[0]));
    if (f > 0) { g.fillStyle = M; g.globalAlpha = f; g.fillRect(0, 0, W, H); g.globalAlpha = 1; }
    if (t >= PN.outroMulai) { outroCanvas.style.display = "block"; renderOutro(t - PN.outroMulai, { background: true }); }
    else outroCanvas.style.display = "none";
  };
  window.__meta = { id: data.id, fps: tokens.frame.fps, duration, lead, audio: data.audio, cues: cues.map(({ type, t, file }) => ({ type, t, file })), shifted, outro: { mulai: PN.outroMulai } };
  window.renderAt(0);
  window.__ready = true;
}
