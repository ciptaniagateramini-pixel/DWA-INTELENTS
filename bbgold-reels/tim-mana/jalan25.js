// Gaya H "2.5D jalan cerita": dunia datar berkedalaman (lantai berperspektif, gedung/kotak dengan sisi menuju
// titik hilang, bayangan) dengan tokoh ibu berkerudung yang berjalan & berbicara. Peralihan adegan = geser cepat.
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
const eBack = (p) => { const c = 1.7; return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2); };
const KULIT = "#F1C9A5"; // warna kulit tokoh (satu-satunya warna di luar palet merek)

export async function boot(dataPath) {
  const tokens = await (await fetch("/tokens.json")).json();
  const data = await (await fetch("/" + dataPath)).json();
  const words = (await (await fetch("/" + data.words)).json()).words;
  const { biru: B, mustard: M, mustardMuda: MM, krem: K, abuBiru: A } = tokens.color;
  const COVER = data.cover?.durasi || 0; // detik cover di awal video
  const lead = data.jedaAwal + COVER, V = (n) => n + lead;
  for (const [file, weight] of [["Poppins-Bold", "700"], ["Poppins-Medium", "500"], ["Poppins-Light", "300"]]) {
    const f = new FontFace("Poppins", `url(/assets/fonts/${file}.woff2)`, { weight });
    document.fonts.add(await f.load());
  }
  const kata = (s, n = 0) => {
    const hits = words.filter((w) => w.text.replace(/[,.?:!]/g, "").toLowerCase() === s.toLowerCase());
    if (!hits[n]) throw new Error("kata tidak ada di naskah: " + s + " #" + n);
    return V(hits[n].start);
  };
  const cv = document.getElementById("main"), g = cv.getContext("2d");
  const outroCanvas = document.getElementById("outro");

  const T = {
    mulai: V(0), tapi: kata("tapi"), beli: kata("Beli"), kenapa: kata("Kenapa"), rugi: kata("rugi"),
    karena: kata("Karena"), selisih: kata("selisih"), ongkos: kata("ongkos"),
    itulah: kata("Itulah"), tujuan: kata("tujuan"), untuk: kata("Untuk"), atau: kata("atau"),
    kalauB: kata("Kalau", 1), nota: kata("nota"), kalauI: kata("Kalau", 2), pasar: kata("pasar"),
    ini: kata("Ini", 1), teliti: kata("teliti"), bungkus: kata("bungkus"), kamu: kata("Kamu", 1), timI: kata("tim", 1),
    komen: kata("Komen"), akhir: V(words[words.length - 1].end),
  };
  // ---- Helper ----
  const LW = 5;
  function path(pts, fill, stroke = B, lw = LW, close = true) {
    g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); if (close) g.closePath();
    if (fill) { g.fillStyle = fill; g.fill(); }
    if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw; g.lineJoin = "round"; g.lineCap = "round"; g.stroke(); }
  }
  function rrect(x, y, w, h, r, fill, stroke = B, lw = LW) {
    g.beginPath(); g.roundRect(x, y, w, h, r);
    if (fill) { g.fillStyle = fill; g.fill(); }
    if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw; g.stroke(); }
  }
  function circle(x, y, r, fill, stroke = B, lw = LW) {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2);
    if (fill) { g.fillStyle = fill; g.fill(); }
    if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw; g.stroke(); }
  }
  function text(s, x, y, size, color, weight = 700, align = "center", stroke = null, sw = 0) {
    g.font = `${weight} ${size}px Poppins`; g.textAlign = align; g.textBaseline = "middle";
    if (stroke) { g.lineJoin = "round"; g.strokeStyle = stroke; g.lineWidth = sw || size * 0.16; g.strokeText(s, x, y); }
    g.fillStyle = color; g.fillText(s, x, y);
  }
  const tw = (s, size, weight = 700) => { g.font = `${weight} ${size}px Poppins`; return g.measureText(s).width; };
  function pill(s, cx, cy, size, bg = B, fg = K) {
    const w = tw(s, size) + size * 1.1, h = size * 1.6;
    rrect(cx - w / 2, cy - h / 2, w, h, h / 2, bg, B, 4); text(s, cx, cy + size * 0.04, size, fg);
  }
  function pop(t, t0, fn, d = 0.35) {
    if (t < t0) return;
    const p = prog(t, t0, d), s = lerp(0.6, 1, eBack(p));
    g.save(); g.globalAlpha *= clamp(p * 2.5); fn(s); g.restore();
  }
  // tampil dalam rentang [t0, t1] (muncul pop, hilang memudar)
  function span(t, t0, t1, fn, d = 0.35) {
    if (t < t0 || t > t1 + 0.25) return;
    g.save(); g.globalAlpha = 1 - prog(t, t1, 0.25); pop(t, t0, fn, d); g.restore();
  }
  // gelembung bicara: kotak krem + ekor ke arah (tx, ty)
  function bubble(lines, cx, cy, size, tx, ty, opt = {}) {
    const lh = size * 1.3, w = Math.max(...lines.map((l) => tw(l, size))) + size * 1.6, h = lines.length * lh + size * 1.1;
    const x = cx - w / 2, y = cy - h / 2;
    const bx = clamp(tx, x + 50, x + w - 50);
    path([[bx - 26, y + h - 3], [tx, ty], [bx + 26, y + h - 3]], opt.bg || K);
    rrect(x, y, w, h, 34, opt.bg || K);
    path([[bx - 23, y + h - 6], [bx + 23, y + h - 6]], null, opt.bg || K, 8, false);
    lines.forEach((l, i) => text(l, cx, y + size * 0.55 + lh * (i + 0.5), size, opt.fg || B));
  }
  // gelembung pikiran: awan + bulatan kecil
  function thought(cx, cy, r, tx, ty, inner) {
    for (let i = 0; i < 2; i++) circle(lerp(tx, cx, 0.25 + i * 0.25), lerp(ty, cy + r, 0.25 + i * 0.25), 12 + i * 8, K, B, 4);
    const pts = 9;
    g.beginPath();
    for (let i = 0; i < pts; i++) { const a = (i / pts) * Math.PI * 2; g.arc(cx + Math.cos(a) * r * 0.82, cy + Math.sin(a) * r * 0.62, r * 0.36, 0, Math.PI * 2); }
    g.fillStyle = K; g.strokeStyle = B; g.lineWidth = 5; g.stroke(); g.fill();
    inner();
  }
  function cincin(x, y, r) {
    g.lineWidth = r * 0.5; g.strokeStyle = B; g.beginPath(); g.ellipse(x, y, r, r * 0.8, 0, 0, Math.PI * 2); g.stroke();
    g.lineWidth = r * 0.3; g.strokeStyle = M; g.stroke();
    path([[x - r * 0.35, y - r * 0.8], [x, y - r * 1.35], [x + r * 0.35, y - r * 0.8], [x, y - r * 0.6]], MM, B, 4);
  }

  // ---- Tokoh: ibu berkerudung (tampak samping 3/4), kaki di (x, y) ----
  function ibu(x, y, o = {}) {
    const f = o.hadap ?? 1, ph = o.langkah ?? 0, jalan = o.jalan ?? 0, s = o.s ?? 1;
    const bob = jalan * Math.abs(Math.sin(ph)) * -8 + (1 - jalan) * Math.sin((o.t ?? 0) * 2) * 2;
    g.save(); g.translate(x, y + bob); g.scale(s * f, s);
    // kaki
    for (const k of [1, -1]) {
      const dx = jalan * Math.sin(ph) * 34 * k, up = jalan * Math.max(0, Math.cos(ph) * k) * 10;
      g.beginPath(); g.ellipse(dx + 8, -12 - up, 26, 12, 0, 0, Math.PI * 2); g.fillStyle = B; g.fill();
    }
    // tas di lengan belakang
    const ayun = jalan * Math.sin(ph) * 0.35;
    g.save(); g.translate(-10, -300); g.rotate(-ayun);
    path([[0, 0], [-6, 120]], null, B, 6, false);
    rrect(-40, 112, 70, 60, 14, M); path([[-26, 112], [-16, 92], [6, 92], [16, 112]], null, B, 5, false);
    g.restore();
    // gamis
    path([[-58, -330], [58, -330], [92, -22], [-92, -22]], K);
    path([[-30, -230], [30, -230]], null, MM, 10, false);
    // kerudung (khimar) menutupi kepala, leher, bahu
    g.beginPath();
    g.moveTo(-70, -392); g.bezierCurveTo(-82, -470, 70, -486, 74, -400);
    g.lineTo(84, -330); g.quadraticCurveTo(80, -268, 0, -258); g.quadraticCurveTo(-80, -268, -86, -330); g.closePath();
    g.fillStyle = B; g.fill(); g.strokeStyle = B; g.lineWidth = LW; g.stroke();
    // wajah
    g.beginPath(); g.ellipse(14, -392, 44, 50, 0, 0, Math.PI * 2); g.fillStyle = KULIT; g.fill();
    g.strokeStyle = B; g.lineWidth = 4; g.stroke();
    // garis kerudung di dahi
    g.beginPath(); g.ellipse(14, -392, 50, 56, 0, Math.PI * 1.05, Math.PI * 1.95); g.strokeStyle = A; g.lineWidth = 8; g.stroke();
    // mata (berkedip sesekali), pipi, mulut
    const kedip = (o.t ?? 0) % 3.7 < 0.12;
    for (const ex of [2, 34]) { if (kedip) path([[ex - 6, -398], [ex + 6, -398]], null, B, 4, false); else circle(ex, -398, 5.5, B, null); }
    circle(-4, -376, 8, "#EBA98A", null); circle(44, -376, 8, "#EBA98A", null);
    if (o.bicara) { const m = Math.abs(Math.sin((o.t ?? 0) * 18)); g.beginPath(); g.ellipse(20, -366, 9, 3 + m * 7, 0, 0, Math.PI * 2); g.fillStyle = B; g.fill(); }
    else { g.beginPath(); g.arc(20, -372, 12, 0.2 * Math.PI, 0.8 * Math.PI); g.strokeStyle = B; g.lineWidth = 4; g.stroke(); }
    // lengan depan
    const ang = o.angkat != null ? -o.angkat : ayun;
    g.save(); g.translate(18, -296); g.rotate(ang);
    path([[0, 0], [8, 70], [4, 132]], null, K, 30, false); path([[0, 0], [8, 70], [4, 132]], null, B, 3, false);
    circle(4, 140, 16, KULIT, B, 4);
    if (o.pegang) { g.save(); g.translate(4, 150); g.rotate(-ang); o.pegang(); g.restore(); }
    g.restore();
    g.restore();
  }
  // ---- Tokoh: staf toko di balik etalase (badan atas) ----
  function staf(x, y, o = {}) {
    const t = o.t ?? 0;
    g.save(); g.translate(x, y + Math.sin(t * 1.7) * 2);
    // badan: kemeja krem + rompi biru
    path([[-80, 0], [-70, -150], [70, -150], [80, 0]], K);
    path([[-80, 0], [-70, -150], [-24, -150], [-8, 0]], B); path([[80, 0], [70, -150], [24, -150], [8, 0]], B);
    rrect(26, -110, 34, 18, 6, M, B, 3); // papan nama
    // kepala
    circle(0, -210, 56, KULIT, B, 4);
    g.beginPath(); g.arc(0, -216, 58, Math.PI * 1.02, Math.PI * 1.98); g.lineTo(52, -232); g.quadraticCurveTo(0, -250, -52, -232); g.closePath(); g.fillStyle = B; g.fill();
    const kedip = (t + 1.3) % 4.1 < 0.12;
    for (const ex of [-20, 20]) { if (kedip) path([[ex - 6, -206], [ex + 6, -206]], null, B, 4, false); else circle(ex, -206, 5.5, B, null); }
    g.beginPath(); g.arc(0, -186, 14, 0.15 * Math.PI, 0.85 * Math.PI); g.strokeStyle = B; g.lineWidth = 4; g.stroke();
    // lengan kanan (ke arah meja / ibu)
    const a = o.raih ?? 0;
    g.save(); g.translate(-62, -130); g.rotate(lerp(0.3, 1.25, a));
    path([[0, 0], [0, 120]], null, K, 30, false); path([[0, 0], [0, 120]], null, B, 3, false);
    circle(0, 128, 16, KULIT, B, 4);
    if (o.pegang) { g.save(); g.translate(0, 138); g.rotate(-lerp(0.3, 1.25, a)); o.pegang(); g.restore(); }
    g.restore();
    g.restore();
  }
  const surat = () => { rrect(-38, -26, 76, 52, 6, K, B, 4); for (let i = 0; i < 3; i++) path([[-26, -12 + i * 12], [26 - i * 10, -12 + i * 12]], null, A, 4, false); circle(22, 14, 6, M, B, 2); };
  const uang = () => { for (let i = 0; i < 3; i++) { rrect(-40 + i * 5, -22 - i * 6, 80, 44, 6, MM, B, 4); } text("Rp", 10, -12, 22, B); };

  // ---- 2.5D: lantai berperspektif, kotak berkedalaman, bayangan ----
  const HZ = 900, VP = [540, HZ - 120];
  function grid() {
    g.save(); g.strokeStyle = B; g.globalAlpha = tokens.grid.opacity; g.lineWidth = tokens.grid.garis;
    for (let x = 0; x <= W; x += tokens.grid.sel) { g.beginPath(); g.moveTo(x + 0.5, 0); g.lineTo(x + 0.5, H); g.stroke(); }
    for (let y = 0; y <= H; y += tokens.grid.sel) { g.beginPath(); g.moveTo(0, y + 0.5); g.lineTo(W, y + 0.5); g.stroke(); }
    g.restore();
  }
  function langit() { g.fillStyle = M; g.fillRect(-W, 0, W * 3, H); grid(); }
  function lantai(c = MM) {
    g.fillStyle = c; g.fillRect(-W, HZ, W * 3, H - HZ);
    g.save(); g.strokeStyle = B; g.globalAlpha = 0.12; g.lineWidth = 3;
    for (let i = -14; i <= 14; i++) { g.beginPath(); g.moveTo(540 + i * 30, HZ); g.lineTo(540 + i * 230, H); g.stroke(); }
    for (let z = 1; z <= 14; z++) { const y = HZ + (H - HZ) * (1.6 / (z + 0.6)); if (y < H) { g.beginPath(); g.moveTo(-W, y); g.lineTo(W * 2, y); g.stroke(); } }
    g.restore();
    path([[-W, HZ], [W * 2, HZ]], null, B, 6, false);
  }
  const back = (p, d) => [p[0] + (VP[0] - p[0]) * d, p[1] + (VP[1] - p[1]) * d];
  // kotak 2.5D: muka depan (x, y, w, h), kedalaman d (0..1 menuju titik hilang)
  function kotak(x, y, w, h, d, depan, samping, atas, lw = 5) {
    const a = [x, y], b = [x + w, y], c = [x + w, y + h], e = [x, y + h];
    const ab = back(a, d), bb = back(b, d), cb = back(c, d), eb = back(e, d);
    if (y > VP[1]) path([a, b, bb, ab], atas, B, lw); else path([e, c, cb, eb], atas, B, lw);
    if (x + w < VP[0]) path([b, c, cb, bb], samping, B, lw);
    if (x > VP[0]) path([a, e, eb, ab], samping, B, lw);
    path([a, b, c, e], depan, B, lw);
  }
  function bayang(x, y, rx) { g.save(); g.globalAlpha = 0.18; g.fillStyle = B; g.beginPath(); g.ellipse(x, y, rx, rx * 0.22, 0, 0, Math.PI * 2); g.fill(); g.restore(); }
  function gedung(x, w, h, warna, jendela = true) {
    kotak(x, HZ - h, w, h, 0.08, warna, "#d9c56a", K);
    if (jendela) for (let r = 0; r < Math.floor((h - 60) / 110); r++) for (let c = 0; c < Math.floor((w - 30) / 90); c++) rrect(x + 30 + c * 90, HZ - h + 40 + r * 110, 54, 68, 6, K, B, 4);
  }
  function toko(x, w, h, label, warnaPapan = B, warnaTeks = M) {
    kotak(x, HZ - h, w, h, 0.1, K, "#e9dfc4", K);
    kotak(x - 14, HZ - h - 20, w + 28, 100, 0.1, warnaPapan, warnaPapan, warnaPapan);
    text(label, x + w / 2, HZ - h + 32, 50, warnaTeks);
    for (let i = 0; i < 8; i++) { const sw = w / 8; path([[x + i * sw, HZ - h + 80], [x + (i + 1) * sw, HZ - h + 80], [x + (i + 1) * sw - 6, HZ - h + 150], [x + i * sw + 6, HZ - h + 150]], i % 2 ? K : M, B, 4); }
    rrect(x + w * 0.58, HZ - h * 0.55, w * 0.28, h * 0.55, 8, A); rrect(x + w * 0.1, HZ - h * 0.5, w * 0.38, h * 0.3, 8, MM);
    for (let i = 0; i < 3; i++) cincin(x + w * 0.16 + i * w * 0.11, HZ - h * 0.36, 12);
  }
  const kalung = () => { g.save(); g.strokeStyle = M; g.lineWidth = 7; g.beginPath(); g.arc(14, -300, 46, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke(); circle(14, -252, 10, MM, B, 3); g.restore(); };
  const batang = () => { kotak(-46, -24, 92, 46, 0.04, M, "#c99b1c", MM, 4); text("999.9", 0, 0, 20, B); };
  const cincinPegang = () => cincin(0, -8, 20);
  const keringat = (x, y, t) => { const k = (t * 1.5) % 1; g.save(); g.globalAlpha = 1 - k; g.beginPath(); g.moveTo(x, y + k * 30 - 22); g.quadraticCurveTo(x + 14, y + k * 30, x, y + k * 30 + 12); g.quadraticCurveTo(x - 14, y + k * 30, x, y + k * 30 - 22); g.fillStyle = K; g.fill(); g.strokeStyle = B; g.lineWidth = 3; g.stroke(); g.restore(); };
  function tanda(s, x, y, size, bg, fg, rot = 0) { g.save(); g.translate(x, y); g.rotate(rot); const w = tw(s, size) + size * 1.1, h = size * 1.6; kotak(-w / 2, -h / 2, w, h, 0.03, bg, bg === B ? "#04193a" : "#c99b1c", bg); text(s, 0, size * 0.04, size, fg); g.restore(); }
  const FOOT = 1440;
  function jalanIbu(t, x0, x1, t0, d, o = {}) {
    const p = eInOut(prog(t, t0, d)), x = lerp(x0, x1, p), jalan = p > 0 && p < 1 ? 1 : 0;
    bayang(x + 10, FOOT, 95);
    ibu(x, FOOT, { t, jalan, langkah: x * 0.016, s: 1.12, ...o });
    return x;
  }
  const bicaraDi = (t, ranges) => ranges.some(([a, b]) => t >= a && t < b);

  // ---- Adegan ----
  function s1(t) { // jalan, hook
    langit(); lantai();
    gedung(-60, 300, 520, MM); gedung(260, 230, 380, "#f0d36a"); toko(520, 380, 480, "TOKO EMAS"); gedung(930, 260, 560, MM);
    const x = jalanIbu(t, -160, 400, V(0), 2.6, { bicara: bicaraDi(t, [[T.beli, T.kenapa - 0.4]]), angkat: t > T.beli ? 0.5 + Math.sin(t * 3) * 0.12 : null, hadap: 1 });
    span(t, T.mulai, T.kenapa - 0.35, (s) => { g.translate(540, 330); g.scale(s, s); g.rotate(-0.03); pill("Pertanyaan ini sepele,", 0, 0, 52, K, B); });
    span(t, T.tapi, T.kenapa - 0.35, (s) => { g.translate(540, 470); g.scale(s, s); g.rotate(0.02); tanda("tapi dampaknya BESAR!", 0, 0, 62, B, M); });
    span(t, T.beli, T.kenapa - 0.35, (s) => { g.translate(600, 720); g.scale(s, s); bubble(["Beli emas...", "buat apa, ya?"], 0, 0, 56, x - 600 + 30, 960 - 720); });
  }
  function interior(t) {
    langit(); lantai("#f3d777");
    kotak(560, 520, 440, 200, 0.06, K, "#e9dfc4", K); for (let i = 0; i < 4; i++) cincin(620 + i * 105, 620, 16);
  }
  function konter(x = 470, w = 640) { kotak(x, 1150, w, 260, 0.12, K, "#e9dfc4", MM); rrect(x + 30, 1180, w - 60, 100, 10, MM, B, 4); for (let i = 0; i < 5; i++) cincin(x + 80 + i * 115, 1235, 14); }
  function s2(t) { // jual lagi -> rugi
    interior(t);
    const papan = t >= T.karena;
    staf(800, 1150, { t, raih: papan ? 0.6 : 0.1 });
    konter();
    const xi = jalanIbu(t, -160, 300, T.kenapa - 0.2, 1.0, { bicara: bicaraDi(t, [[T.kenapa, T.karena - 0.2]]), angkat: t < T.rugi ? 1.1 : 0.4, pegang: t < T.rugi + 0.6 ? cincinPegang : null });
    if (t > T.rugi) keringat(xi + 80, FOOT - 470, t);
    span(t, T.kenapa + 0.2, T.rugi - 0.15, (s) => { g.translate(430, 700); g.scale(s, s); bubble(["Mbak, cincin baru ini", "mau saya jual lagi"], 0, 0, 46, xi - 430 + 30, FOOT - 470 - 700); });
    span(t, T.rugi, T.karena - 0.1, (s) => { g.translate(380, 720); g.scale(s, s); g.rotate(-0.05); bubble(["Kok RUGI?!"], 0, 0, 78, xi - 380 + 30, FOOT - 470 - 720, { bg: B, fg: M }); });
    // papan hitung 2.5D
    span(t, T.karena, T.itulah - 0.35, (s) => {
      g.translate(540, 560); g.scale(s, s);
      kotak(-430, -260, 860, 520, 0.05, K, "#e9dfc4", K, 6);
      const base = 200, hj = 330 * eOut(prog(t, T.karena + 0.1, 0.6)), hb = 250 * eOut(prog(t, T.karena + 0.5, 0.6));
      kotak(-300, base - hj, 170, hj, 0.04, MM, "#d9c56a", MM); text("harga jual toko", -215, base + 32, 30, B);
      kotak(130, base - hb, 170, hb, 0.04, "#9aa5bd", "#7d89a3", "#b8c0d2"); text("buyback", 215, base + 32, 30, B);
      if (t >= T.selisih) { const p = eOut(prog(t, T.selisih, 0.4)); path([[-130, base - 330], [300 * p - 130 + 0 * p, base - 330]], null, B, 5, false); path([[215, base - 330], [215, base - 250]], null, B, 6, false); pill("selisih", 215, base - 375, 34, B, K); }
      if (t >= T.ongkos) { const p = eBack(prog(t, T.ongkos, 0.4)); kotak(-300, base - 330 - 70 * p, 170, 70 * p, 0.04, "#efe6cf", "#d8cfb5", K); if (p > 0.6) text("+ ongkos", -215, base - 330 - 35, 28, B); }
    });
  }
  function s3(t) { // persimpangan
    langit(); lantai();
    g.fillStyle = K; path([[470, H], [610, H], [560, HZ], [520, HZ]], K, B, 4);
    path([[420, H], [520, H], [-200, HZ], [-120, HZ]], K, B, 4); path([[560, H], [660, H], [1200, HZ], [1280, HZ]], K, B, 4);
    // tiang penunjuk 2.5D
    kotak(528, 760, 24, 640, 0.04, B, B, B);
    if (t >= T.untuk) { const p = eBack(prog(t, T.untuk, 0.4)); g.save(); g.translate(540, 820); g.scale(p, p); path([[-330, 0], [-290, -50], [-20, -50], [-20, 50], [-290, 50]], B, B, 5); text("BERHIAS", -160, 2, 52, K); g.restore(); }
    if (t >= T.atau) { const p = eBack(prog(t, T.atau, 0.4)); g.save(); g.translate(540, 950); g.scale(p, p); path([[20, -50], [330, -50], [380, 0], [330, 50], [20, 50]], M, B, 5); text("INVESTASI", 190, 2, 50, B); g.restore(); }
    const xi = jalanIbu(t, -160, 250, T.itulah - 0.2, 1.1, { bicara: bicaraDi(t, [[T.itulah + 1, T.kalauB - 0.4]]), angkat: t > T.itulah + 1.1 ? 2.6 + Math.sin(t * 9) * 0.15 : null });
    span(t, T.tujuan - 0.4, T.kalauB - 0.35, (s) => { g.translate(540, 360); g.scale(s, s); tanda("harus punya TUJUAN", 0, 0, 60, B, M, -0.02); });
    span(t, T.itulah + 1.2, T.kalauB - 0.35, (s) => { g.translate(xi - 90, 860); g.scale(s, s); text("?", 0, 0, 150, B, 700, "center", K, 18); });
  }
  function s4(t) { // berhias -> nota
    langit(); lantai();
    gedung(-80, 200, 380, "#f0d36a"); toko(260, 560, 520, "TOKO A", B, M); gedung(880, 260, 420, MM);
    const xi = jalanIbu(t, -160, 220, T.kalauB - 0.2, 1.0, { pegang: surat, angkat: t > T.nota - 0.3 ? 1.3 : null, kalung: true });
    kalungOn(xi, t);
    span(t, T.kalauB, T.kalauI - 0.35, (s) => { g.translate(540, 300); g.scale(s, s); tanda("BERHIAS", 0, 0, 80, B, K, -0.03); });
    span(t, T.kalauB + 0.8, T.kalauI - 0.35, (s) => { g.translate(640, 560); g.scale(s, s); g.rotate(0.02); rrect(-330, -90, 660, 180, 34, K, B, 6); text("pilih toko yang buyback-nya", 0, -40, 34, A, 600); text("ikut harga NOTA", 0, 30, 62, B); });
  }
  function kalungOn(xi, t) { g.save(); g.translate(xi, FOOT); g.scale(1.12, 1.12); kalung(); g.restore(); const k = (t * 2) % 1; g.save(); g.globalAlpha = 1 - k; text("✦", xi + 70, FOOT - 380 - k * 30, 36, K); g.restore(); }
  function s5(t) { // investasi -> pasar
    langit(); lantai();
    gedung(-80, 240, 460, MM); toko(300, 520, 500, "TOKO B", M, B); gedung(860, 300, 360, "#f0d36a");
    // papan grafik 2.5D
    g.save(); g.translate(560, 330); kotak(-210, -110, 420, 220, 0.04, K, "#e9dfc4", K, 5);
    const pts = [[-170, 60], [-100, -10], [-40, 30], [40, -40], [100, 0], [170, -80]], q = eOut(prog(t, T.kalauI + 0.3, 1.0));
    g.strokeStyle = B; g.lineWidth = 9; g.lineJoin = "round"; g.beginPath(); pts.forEach(([x, y], i) => { const xx = lerp(-170, x, q); i ? g.lineTo(xx, y) : g.moveTo(xx, y); }); g.stroke();
    text("harga pasar", 0, 84, 26, A, 600); g.restore();
    jalanIbu(t, -160, 220, T.kalauI - 0.2, 1.0, { pegang: batang, angkat: 1.2 });
    span(t, T.kalauI, T.ini - 0.35, (s) => { g.translate(540, 560); g.scale(s, s); tanda("INVESTASI", 0, 0, 80, M, B, 0.03); });
    span(t, T.kalauI + 0.8, T.ini - 0.35, (s) => { g.translate(620, 760); g.scale(s, s); g.rotate(-0.02); rrect(-340, -90, 680, 180, 34, K, B, 6); text("pilih toko yang jual-belinya", 0, -40, 34, A, 600); text("ikut harga PASAR", 0, 30, 62, B); });
  }
  function s6(t) { // teliti sebelum bungkus
    interior(t);
    staf(820, 1150, { t, raih: 0.5 });
    konter(520, 560);
    // kotak kado di meja
    const tutup = eOut(prog(t, T.bungkus - 0.1, 0.5));
    g.save(); g.translate(760, 1150);
    kotak(-80, -120, 160, 120, 0.05, M, "#c99b1c", MM, 5); path([[-10, -120], [10, -120], [10, 0], [-10, 0]], B, null);
    const ly = lerp(-260, -140, tutup); kotak(-92, ly, 184, 26, 0.05, M, "#c99b1c", MM, 5);
    g.beginPath(); g.ellipse(-22, ly - 12, 22, 14, -0.4, 0, Math.PI * 2); g.ellipse(22, ly - 12, 22, 14, 0.4, 0, Math.PI * 2); g.strokeStyle = B; g.lineWidth = 6; g.stroke();
    g.restore();
    const xi = jalanIbu(t, -160, 280, T.ini - 0.2, 0.9, { bicara: bicaraDi(t, [[T.ini, T.kamu - 0.4]]), angkat: 2.3 + Math.sin(t * 8) * 0.25 });
    span(t, T.ini + 0.1, T.kamu - 0.35, (s) => { g.translate(480, 640); g.scale(s, s); bubble(["Teliti dulu", "sebelum bungkus,", "ya, Say!"], 0, 0, 62, xi - 480 + 30, FOOT - 480 - 640); });
  }
  function s7(t) { // tim mana
    langit(); lantai();
    const papan = (x, t0, judul, bg, fg, ikon) => { if (t < t0) return; const p = eBack(prog(t, t0, 0.45)); g.save(); g.translate(x, 1100); g.scale(p, p);
      kotak(-12, 0, 24, 330, 0.03, B, B, B); kotak(-190, -300, 380, 300, 0.05, bg, bg === B ? "#04193a" : "#c99b1c", bg, 6); ikon(); text(judul, 0, -60, 46, fg); g.restore(); };
    papan(230, T.kamu + 0.2, "TIM BERHIAS", B, K, () => cincin(0, -190, 44));
    papan(850, T.timI + 0.1, "TIM INVESTASI", M, B, () => { g.save(); g.translate(0, -190); batang(); g.scale(1.6, 1.6); g.restore(); });
    bayang(550, FOOT, 95);
    const tunjuk = t < T.timI ? 1.0 : t < T.komen ? 1.0 : 2.4;
    ibu(540, FOOT, { t, s: 1.12, hadap: t < T.timI ? -1 : 1, bicara: t > T.kamu && t < T.akhir, angkat: tunjuk + Math.sin(t * 6) * 0.08 });
    span(t, T.kamu - 0.1, 999, (s) => { g.translate(540, 360); g.scale(s, s); tanda("Kamu tim mana?", 0, 0, 76, B, M, -0.02); });
    span(t, T.komen, 999, (s) => { g.translate(540, 1500); g.scale(s, s); g.rotate(0.03); tanda("Komen di bawah!", 0, 0, 58, K, B); });
  }
  // urutan adegan + peralihan geser (whip pan)
  const SC = [[V(0) - 10, s1], [T.kenapa - 0.25, s2], [T.itulah - 0.25, s3], [T.kalauB - 0.25, s4], [T.kalauI - 0.25, s5], [T.ini - 0.25, s6], [T.kamu - 0.25, s7]];
  const TR = 0.45;
  function adegan(t) {
    let i = 0; for (let k = 0; k < SC.length; k++) if (t >= SC[k][0]) i = k;
    const t0 = SC[i][0], p = i > 0 ? eInOut(prog(t, t0, TR)) : 1;
    if (p < 1) { g.save(); g.translate(-p * W, 0); SC[i - 1][1](t); g.restore(); g.save(); g.translate((1 - p) * W, 0); SC[i][1](t); g.restore(); }
    else SC[i][1](t);
  }

  // ---- Teks bawah kecil ----
  const capWords = words.map((w) => ({ ...w, t0: V(w.start), t1: V(w.end) }));
  const chunks = []; let cur = [];
  capWords.forEach((w, i) => {
    cur.push(w);
    const next = capWords[i + 1];
    if (!next || /[,.?:!]$/.test(w.text) || next.t0 - w.t1 > 0.15 || cur.map((x) => x.text).join(" ").length > 28) { chunks.push(cur); cur = []; }
  });
  function caption(t) {
    let ch = null;
    for (let i = 0; i < chunks.length; i++) {
      const c = chunks[i], next = chunks[i + 1];
      const end = next ? Math.min(next[0].t0, c[c.length - 1].t1 + 0.6) : c[c.length - 1].t1 + 0.6;
      if (t >= c[0].t0 && t < end) ch = c;
    }
    if (!ch || t > T.akhir + 0.6) return;
    const size = 32, sp = tw(" ", size, 600);
    const ws = ch.map((w) => w.text.replace(/[,.?:!]+$/, ""));
    const widths = ws.map((s) => tw(s, size, 600));
    const total = widths.reduce((a, b) => a + b, 0) + sp * (ws.length - 1);
    let x = 540 - total / 2;
    const y = 1600, a = eOut(prog(t, ch[0].t0, 0.15));
    g.save(); g.globalAlpha = a;
    g.fillStyle = "rgba(251,247,236,0.94)"; g.beginPath(); g.roundRect(540 - total / 2 - 22, y - 30, total + 44, 60, 30); g.fill();
    ch.forEach((w, i) => { const on = t >= w.t0 && t < (ch[i + 1] ? ch[i + 1].t0 : 1e9); text(ws[i], x, y + 1, size, on ? B : A, 600, "left"); x += widths[i] + sp; });
    g.restore();
  }

  // ---- Cover ----
  function teks3d(s, x, y, size, depan, sisi, tebal = 12, garis = B, gw = 8) {
    g.font = `700 ${size}px Poppins`; g.textAlign = "center"; g.textBaseline = "middle";
    for (let i = tebal; i > 0; i--) { g.fillStyle = sisi; g.fillText(s, x + i * 0.7, y + i); }
    g.lineJoin = "round"; g.strokeStyle = garis; g.lineWidth = gw; g.strokeText(s, x, y); g.fillStyle = depan; g.fillText(s, x, y);
  }
  function drawCover(t) {
    langit(); lantai();
    g.save(); g.translate(540, 350); g.rotate(-0.02); pill("Pertanyaan sepele, dampaknya BESAR!", 0, 0, 40, B, M); g.restore();
    teks3d("BELI EMAS", 540, 510, 150, K, B, 14);
    teks3d("BUAT APA?", 540, 670, 150, M, B, 14, "#FFFFFF", 14);
    tanda("BERHIAS", 300, 840, 62, B, K, -0.05);
    tanda("INVESTASI", 800, 840, 62, M, B, 0.05);
    circle(552, 840, 50, K, B, 6); text("VS", 552, 844, 44, B);
    bayang(230, 1600, 90);
    ibu(220, 1600, { t: 0.4, s: 1.05, hadap: 1, bicara: true, angkat: 2.2 });
    g.save(); g.translate(720, 1330); g.rotate(-0.03); tanda("jawab di komen!", 0, 0, 58, K, B); g.restore();
    path([[720, 1400], [720, 1480]], null, B, 10, false); path([[690, 1452], [720, 1488], [750, 1452]], null, B, 10, false);
    text("@tokobbgold", 720, 1560, 38, B, 700, "center", K, 10);
  }
  function coverLayer(t) {
    if (!COVER || t >= COVER + 0.35) return;
    const p = eInOut(prog(t, COVER, 0.35));
    g.save(); g.globalAlpha = 1 - p; drawCover(t); g.restore();
  }
  function cropCheck() {
    const c = tokens.crop34; g.save(); g.strokeStyle = B; g.lineWidth = 3; g.setLineDash([10, 8]);
    g.strokeRect((W - c.width) / 2, (H - c.height) / 2, c.width, c.height); g.restore();
    text("CROP 3:4", (W - c.width) / 2, (H - c.height) / 2 - 22, 26, B, 500, "left");
  }

  LOGO_OPT.spinDeg = data.penutup.outroPutaran;
  await loadLogo("/assets/logo/bb-gold-profil-ring-mustard.svg");
  prepareText(outroCanvas.getContext("2d"));
  const renderOutro = makeRenderer(outroCanvas);
  const PN = { ...data.penutup };
  PN.outroMulai = T.akhir + PN.tahanAkhir; PN.crossFade = [PN.outroMulai - 0.1, PN.outroMulai + 0.05];
  const duration = PN.outroMulai + 3.6;
  const cues = [];
  const wl = tokens.audio.whooshLead;
  for (const [t0] of SC.slice(1)) cues.push({ type: "whoosh", t: t0 - wl, tetap: true });
  for (const t of [T.mulai, T.tapi, T.beli, T.kenapa + 0.2, T.rugi, T.karena, T.selisih, T.ongkos, T.untuk, T.atau, T.kalauB + 0.8, T.kalauI + 0.8, T.ini + 0.1, T.bungkus, T.kamu + 0.2, T.timI + 0.1, T.komen]) cues.push({ type: "pop", t });
  cues.sort((a, b) => a.t - b.t);
  const shifted = [];
  for (let i = 1; i < cues.length; i++) {
    if (cues[i].t - cues[i - 1].t < tokens.audio.jedaSfxMin - 1e-6 && !cues[i].tetap) { const from = cues[i].t; cues[i].t = cues[i - 1].t + tokens.audio.jedaSfxMin; shifted.push([from, cues[i].t]); }
    cues.sort((a, b) => a.t - b.t);
  }
  let wn = 0; cues.forEach((c) => (c.file = c.type === "whoosh" ? `whoosh-${(wn++ % 2) + 1}` : "pop"));

  const CEK = new URLSearchParams(location.search).has("crop");
  window.renderAt = (t) => {
    g.clearRect(0, 0, W, H);
    adegan(t);
    caption(t);
    coverLayer(t);
    if (CEK && t < COVER) cropCheck();
    const f = eInOut(prog(t, PN.crossFade[0], PN.crossFade[1] - PN.crossFade[0]));
    if (f > 0) { g.fillStyle = M; g.globalAlpha = f; g.fillRect(0, 0, W, H); g.globalAlpha = 1; }
    if (t >= PN.outroMulai) { outroCanvas.style.display = "block"; renderOutro(t - PN.outroMulai, { background: true }); }
    else outroCanvas.style.display = "none";
  };
  window.__meta = { id: data.id, fps: tokens.frame.fps, duration, lead, audio: data.audio, T, cues: cues.map(({ type, t, file }) => ({ type, t, file })), shifted, outro: { mulai: PN.outroMulai } };
  window.renderAt(0);
  window.__ready = true;
}
