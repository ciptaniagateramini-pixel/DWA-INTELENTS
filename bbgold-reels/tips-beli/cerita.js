// Gaya D "cerita flat tampak samping": tokoh ibu berkerudung berjalan ke toko, adegan di meja kasir
// (tanya harga, papan hitung spread, pertanyaan ketentuan, timbang, hitung, serah terima, bayar), lalu keluar.
// Peralihan luar <-> dalam toko memakai lingkaran membesar dari pintu. Kanvas mustard + grid tipis.
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
    const hits = words.filter((w) => w.text.replace(/[,.?:]/g, "").toLowerCase() === s.toLowerCase());
    if (!hits[n]) throw new Error("kata tidak ada di naskah: " + s + " #" + n);
    return V(hits[n].start);
  };
  const cv = document.getElementById("main"), g = cv.getContext("2d");
  const outroCanvas = document.getElementById("outro");

  const T = {
    misal: kata("Misalnya"), sampai: kata("Sampai"), tanya: kata("tanya"), lalu: kata("Lalu"), kalauJual: kata("kalau"),
    contoh: kata("Contohnya"), beli: kata("harga", 2), bb: kata("Harga", 3), berarti: kata("Berarti"), untuk: kata("untuk"),
    tanyakan: kata("Tanyakan"), nanti: kata("nanti"), ada: kata("Ada"), rusak: kata("barangnya"),
    sebelum: kata("Sebelum", 1), timbang: kata("menimbang"), kali: kata("kalikan"), berlaku: kata("berlaku"),
    selisih: kata("selisih"), langsung: kata("langsung"), ingat: kata("Ingat"), teliti: kata("teliti"),
    akhir: V(words[words.length - 1].end),
  };
  const DOOR = [830, 1150];
  const masuk = [T.sampai - 0.05, 0.55]; // lingkaran membesar dari pintu (luar -> dalam)
  const keluar = [T.ingat - 0.25, 0.55]; // dalam -> luar

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

  // ---- Latar luar: jalan + toko emas generik ----
  function luar(t) {
    g.fillStyle = M; g.fillRect(0, 0, W, H); grid();
    // gedung belakang
    for (const [x, w, h] of [[-40, 260, 520], [190, 200, 380]]) { rrect(x, 1380 - h, w, h, 0, MM, B, 4); for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) rrect(x + 40 + c * 90, 1380 - h + 50 + r * 110, 56, 70, 6, K, B, 4); }
    // toko
    rrect(560, 700, 520, 680, 0, K);
    rrect(560, 640, 520, 110, 18, B);
    text("TOKO EMAS", 820, 696, 56, M);
    for (let i = 0; i < 7; i++) path([[560 + i * 75, 750], [560 + (i + 1) * 75, 750], [560 + (i + 1) * 75 - 8, 830], [560 + i * 75 + 8, 830]], i % 2 ? K : M, B, 4);
    rrect(600, 880, 150, 220, 10, MM); // jendela
    for (let i = 0; i < 3; i++) cincin(640 + i * 36, 1000 + (i % 2) * 20, 13);
    rrect(760, 940, 140, 440, 10, A); rrect(780, 960, 100, 300, 8, MM, B, 4); circle(870, 1160, 8, M, B, 3); // pintu
    // trotoar
    g.fillStyle = B; g.fillRect(0, 1376, W, 8);
    g.fillStyle = MM; g.fillRect(0, 1384, W, 70);
    g.strokeStyle = B; g.lineWidth = 4; for (let x = -60; x < W; x += 180) { g.beginPath(); g.moveTo(x, 1384); g.lineTo(x + 40, 1454); g.stroke(); }
    g.fillStyle = B; g.fillRect(0, 1450, W, 6);
  }
  // ---- Latar dalam: dinding, rak, etalase kaca ----
  function dalam(t) {
    g.fillStyle = M; g.fillRect(0, 0, W, H); grid();
    g.fillStyle = MM; g.fillRect(0, 760, W, 640); g.fillStyle = B; g.fillRect(0, 756, W, 6);
    // rak dinding kanan
    rrect(560, 800, 460, 200, 14, K);
    for (let i = 0; i < 4; i++) cincin(620 + i * 110, 900, 16);
    rrect(600, 960, 380, 14, 6, A, B, 3);
    // lantai
    g.fillStyle = B; g.fillRect(0, 1376, W, 8); g.fillStyle = A; g.globalAlpha = 0.25; g.fillRect(0, 1384, W, 100); g.globalAlpha = 1;
  }
  function etalase() {
    rrect(470, 1110, 640, 270, 12, K);
    rrect(490, 1130, 600, 120, 10, MM, B, 4);
    for (let i = 0; i < 5; i++) cincin(540 + i * 110, 1196, 14);
    rrect(460, 1094, 660, 30, 10, B, B, 0);
  }
  function grid() {
    g.save(); g.strokeStyle = B; g.globalAlpha = tokens.grid.opacity; g.lineWidth = tokens.grid.garis;
    for (let x = 0; x <= W; x += tokens.grid.sel) { g.beginPath(); g.moveTo(x + 0.5, 0); g.lineTo(x + 0.5, H); g.stroke(); }
    for (let y = 0; y <= H; y += tokens.grid.sel) { g.beginPath(); g.moveTo(0, y + 0.5); g.lineTo(W, y + 0.5); g.stroke(); }
    g.restore();
  }

  // ---- Adegan ----
  const STRIDE = 0.016; // fase langkah per piksel
  function adeganLuarMasuk(t) {
    luar(t);
    // jalan: 0.3 -> T.misal ke x 430, berhenti (berpikir), lalu ke pintu
    const x1 = 430, x2 = DOOR[0] - 60;
    const tStop = T.misal - 0.1, tGo = T.sampai - 0.7;
    let x, jalan = 1;
    if (t < tStop) x = lerp(-120, x1, prog(t, V(0), tStop - V(0)));
    else if (t < tGo) { x = x1; jalan = 0; }
    else x = lerp(x1, x2, eInOut(prog(t, tGo, 0.65)));
    ibu(x, 1380, { t, jalan, langkah: x * STRIDE, s: 1 });
    // judul
    span(t, V(0.05), T.misal - 0.3, (s) => {
      g.translate(540, 360); g.scale(s, s);
      rrect(-330, -110, 660, 220, 40, B);
      text("TIPS TIPIS", 0, -30, 92, M); text("sebelum beli emas di toko", 0, 52, 40, K, 500);
    });
    // pikiran: perhiasan 16K
    span(t, T.misal + 0.1, tGo, (s) => {
      g.translate(x1 + 110, 700); g.scale(s, s);
      thought(0, 0, 150, -90, 170, () => { cincin(-50, 10, 40); pill("16K", 70, 10, 44, B, M); });
    });
  }
  function adeganDalam(t) {
    dalam(t);
    const tiba = T.sampai + 0.1;
    // ibu masuk dari kiri ke depan etalase
    const xi = lerp(-120, 300, eOut(prog(t, tiba, 0.9)));
    const jalanI = t < tiba + 0.8 ? 1 : 0;
    const bicara = [[T.tanya, T.lalu - 0.4], [T.lalu, T.contoh - 0.3], [T.tanyakan, T.sebelum - 0.4], [T.langsung, T.ingat - 0.3]].some(([a, b]) => t >= a && t < b);
    // serah terima: surat (staf -> ibu) lalu uang (ibu -> staf)
    const tSurat = T.berlaku - 0.2, tUang = T.langsung + 0.1;
    const pSurat = prog(t, tSurat, 0.7), pUang = prog(t, tUang, 0.7);
    const angkatI = Math.max(Math.sin(Math.PI * pSurat), Math.sin(Math.PI * pUang)) * 1.3 + (bicara ? 0.25 * Math.abs(Math.sin(t * 3)) : 0);
    staf(800, 1100, { t, raih: Math.max(Math.sin(Math.PI * pSurat), Math.sin(Math.PI * pUang), prog(t, T.timbang - 0.3, 0.4) * (1 - prog(t, T.timbang + 1.2, 0.4))),
      pegang: pSurat > 0 && pSurat < 0.5 ? surat : pUang >= 0.5 && pUang < 1 ? uang : null });
    etalase();
    // timbangan digital di meja
    if (t >= T.sebelum) {
      const a = eBack(prog(t, T.sebelum, 0.4));
      g.save(); g.translate(640, 1094); g.scale(a, a);
      rrect(-90, -50, 180, 50, 10, A); rrect(-100, -64, 200, 16, 8, K);
      rrect(-60, -38, 120, 30, 6, B, B, 2);
      const w = lerp(0, 2, eOut(prog(t, T.timbang + 0.6, 1.0)));
      text(w.toFixed(2).replace(".", ",") + " g", 0, -23, 22, M);
      if (t > T.timbang + 0.3) cincin(0, -80, 18);
      g.restore();
    }
    ibu(xi, 1380, { t, jalan: jalanI, langkah: xi * STRIDE, bicara, angkat: angkatI,
      pegang: pSurat >= 0.5 && pUang < 0.5 ? surat : pUang > 0 && pUang < 0.5 ? uang : t > tSurat + 0.7 && t < tUang ? surat : null });
    const kepala = [xi + 20, 950];

    // gelembung pertanyaan harga
    span(t, T.tanya, T.lalu - 0.25, (s) => { g.translate(360, 560); g.scale(s, s); bubble(["Harga beli 16K", "hari ini berapa?"], 0, 0, 52, kepala[0] - 360, kepala[1] - 560); });
    span(t, T.lalu, T.contoh - 0.25, (s) => { g.translate(380, 560); g.scale(s, s); bubble(["Kalau dijual kembali,", "buyback-nya berapa?"], 0, 0, 50, kepala[0] - 380, kepala[1] - 560); });

    // papan hitung spread
    span(t, T.contoh, T.tanyakan - 0.3, (s) => {
      g.translate(540, 560); g.scale(s, s);
      rrect(-440, -330, 880, 640, 40, K, B, 6);
      text("CONTOH · KADAR 16K", 0, -270, 32, A, 700);
      const row = (t0, y, l, v, warna = B) => { if (t < t0) return; g.save(); g.globalAlpha *= eOut(prog(t, t0, 0.3)); text(l, -380, y, 44, warna, 500, "left"); text(v, 380, y, 52, warna, 700, "right"); g.restore(); };
      row(T.beli, -170, "Harga beli", "Rp1.600.000");
      row(T.bb, -70, "Harga buyback", "Rp1.550.000");
      if (t >= T.berarti) {
        const p = eOut(prog(t, T.berarti, 0.35));
        path([[-380, -10], [-380 + 760 * p, -10]], null, B, 6, false);
        text("−", -410, -70, 52, B);
      }
      pop(t, T.berarti + 0.25, (s2) => { g.translate(0, 110); g.scale(s2, s2); rrect(-380, -80, 760, 160, 30, B); text("SPREAD", -330, 0, 46, MM, 700, "left"); text("Rp50.000", 330, -16, 66, M, 700, "right"); text("per gram", 330, 40, 30, K, 500, "right"); });
      text("*angka hanya contoh, cek harga di toko", 0, 270, 28, A, 500);
    });

    // pertanyaan ketentuan
    const qs = [[T.nanti, ["Jual nanti: ikut harga", "pasar atau nota?"]], [T.ada, ["Ada potongan?", "Berapa %?"]], [T.rusak, ["Kalau rusak,", "potong berapa %?"]]];
    if (t >= T.tanyakan && t < T.sebelum + 0.25) {
      g.save(); g.globalAlpha = 1 - prog(t, T.sebelum - 0.3, 0.25);
      pop(t, T.tanyakan, (s) => { g.translate(540, 290); g.scale(s, s); pill("TANYAKAN JUGA", 0, 0, 44); });
      qs.forEach(([t0, lines], i) => pop(t, t0, (s) => {
        const cy = 450 + i * 190, cx = i % 2 ? 600 : 470;
        g.translate(cx, cy); g.scale(s, s);
        const w = Math.max(...lines.map((l) => tw(l, 44))) + 150;
        rrect(-w / 2, -78, w, 156, 30, K);
        circle(-w / 2 + 52, 0, 30, B, null); text(String(i + 1), -w / 2 + 52, 2, 34, K);
        lines.forEach((l, j) => text(l, 40, -24 + j * 52, 44, B));
      }));
      g.restore();
    }
    // timbang ulang
    span(t, T.sebelum, T.kali - 0.3, (s) => { g.translate(540, 420); g.scale(s, s); bubble(["Timbang ulang", "di depan saya, ya"], 0, 0, 54, kepala[0] - 540, kepala[1] - 420); });
    // hitung
    span(t, T.kali, T.ingat - 0.35, (s) => {
      g.translate(540, 470); g.scale(s, s);
      rrect(-430, -230, 860, 460, 40, K, B, 6);
      text("HITUNG SENDIRI", 0, -170, 32, A);
      text("2,00 g × Rp1.600.000", 0, -80, 56, B);
      if (t >= T.berlaku) { g.save(); g.globalAlpha *= eOut(prog(t, T.berlaku, 0.3)); text("= Rp3.200.000", 0, 20, 76, B, 700, "center", MM, 14); g.restore(); }
      text("*angka hanya contoh", 0, 170, 28, A, 500);
      if (t >= T.selisih) pop(t, T.selisih, (s2) => { g.translate(330, -190); g.scale(s2, s2); g.rotate(0.12); pill("ada selisih?", 0, 0, 34, B, M); });
    });
    // label serah terima & bayar
    span(t, tSurat + 0.2, tUang - 0.1, (s) => { g.translate(560, 1000); g.scale(s, s); pill("serah terima surat", 0, 0, 32, B, K); });
    span(t, tUang + 0.2, T.ingat - 0.3, (s) => { g.translate(560, 1000); g.scale(s, s); pill("pembayaran", 0, 0, 32, B, K); });
  }
  function adeganLuarKeluar(t) {
    luar(t);
    const t0 = keluar[0] + 0.2;
    const x = lerp(DOOR[0] - 30, 230, eInOut(prog(t, t0, 2.4)));
    const jalan = t < t0 + 2.4 ? 1 : 0;
    ibu(x, 1380, { t, jalan, langkah: x * STRIDE, hadap: -1, angkat: 0.2, pegang: () => { rrect(-30, -10, 60, 70, 10, M, B, 4); path([[-16, -10], [-10, -30], [10, -30], [16, -10]], null, B, 4, false); } });
    pop(t, T.teliti - 0.1, (s) => {
      g.translate(540, 560); g.scale(s, s);
      bubble(["Teliti di awal", "lebih baik, daripada", "menyesal kemudian"], 0, 0, 62, x - 540 + 10, 920 - 560, { bg: B, fg: K });
    }, 0.45);
  }
  function iris(t, [t0, d], cx, cy, drawA, drawB) {
    if (t < t0) return drawA(t);
    const p = eInOut(prog(t, t0, d));
    drawA(t);
    if (p <= 0) return;
    g.save(); g.beginPath(); g.arc(cx, cy, p * 2300, 0, Math.PI * 2); g.clip(); drawB(t);
    g.restore();
    if (p < 1) { g.beginPath(); g.arc(cx, cy, p * 2300, 0, Math.PI * 2); g.strokeStyle = B; g.lineWidth = 14; g.stroke(); }
  }

  // ---- Teks bawah per frasa ----
  const capWords = words.map((w) => ({ ...w, t0: V(w.start), t1: V(w.end) }));
  const chunks = []; let cur = [];
  capWords.forEach((w, i) => {
    cur.push(w);
    const next = capWords[i + 1];
    const len = cur.map((x) => x.text).join(" ").length;
    if (!next || /[,.?:]$/.test(w.text) || next.t0 - w.t1 > 0.15 || len > 20) { chunks.push(cur); cur = []; }
  });
  function caption(t) {
    let ch = null;
    for (let i = 0; i < chunks.length; i++) {
      const c = chunks[i], next = chunks[i + 1];
      const end = next ? Math.min(next[0].t0, c[c.length - 1].t1 + 0.6) : c[c.length - 1].t1 + 0.6;
      if (t >= c[0].t0 && t < end) ch = c;
    }
    if (!ch || t > T.akhir + 0.6) return;
    const size = 50, sp = tw(" ", size);
    const ws = ch.map((w) => w.text.replace(/[,.?:]$/, ""));
    const widths = ws.map((s) => tw(s, size));
    const total = widths.reduce((a, b) => a + b, 0) + sp * (ws.length - 1);
    let x = 540 - total / 2;
    const a = eOut(prog(t, ch[0].t0, 0.15)), y = 1530;
    g.save(); g.globalAlpha = a;
    rrect(540 - total / 2 - 30, y - 46, total + 60, 92, 46, K, B, 4);
    ch.forEach((w, i) => {
      const on = t >= w.t0 && t < (ch[i + 1] ? ch[i + 1].t0 : 1e9);
      text(ws[i], x, y + 2, size, on ? B : A, on ? 700 : 500, "left");
      if (on) path([[x, y + 30], [x + widths[i], y + 30]], null, M, 7, false);
      x += widths[i] + sp;
    });
    g.restore();
  }

  // ---- Outro & audio cue ----
  LOGO_OPT.spinDeg = data.penutup.outroPutaran;
  await loadLogo("/assets/logo/bb-gold-profil-ring-mustard.svg");
  prepareText(outroCanvas.getContext("2d"));
  const renderOutro = makeRenderer(outroCanvas);
  const PN = { ...data.penutup };
  PN.outroMulai = T.akhir + PN.tahanAkhir; PN.crossFade = [PN.outroMulai - 0.1, PN.outroMulai + 0.05];
  const duration = PN.outroMulai + 3.6;
  const cues = [];
  const wl = tokens.audio.whooshLead;
  for (const t of [masuk[0], keluar[0], T.contoh, T.kali]) cues.push({ type: "whoosh", t: t - wl, tetap: true });
  for (const t of [V(0.05), T.misal + 0.1, T.tanya, T.lalu, T.beli, T.bb, T.berarti + 0.25, T.tanyakan, T.nanti, T.ada, T.rusak, T.sebelum, T.berlaku, T.selisih, T.berlaku + 0.15, T.langsung + 0.3, T.teliti - 0.1]) cues.push({ type: "pop", t });
  cues.sort((a, b) => a.t - b.t);
  const shifted = [];
  for (let i = 1; i < cues.length; i++) {
    if (cues[i].t - cues[i - 1].t < tokens.audio.jedaSfxMin - 1e-6 && !cues[i].tetap) { const from = cues[i].t; cues[i].t = cues[i - 1].t + tokens.audio.jedaSfxMin; shifted.push([from, cues[i].t]); }
    cues.sort((a, b) => a.t - b.t);
  }
  let wn = 0; cues.forEach((c) => (c.file = c.type === "whoosh" ? `whoosh-${(wn++ % 2) + 1}` : "pop"));


  // ---- Cover (frame pertama video; tahan lalu memudar ke adegan) ----
  function coverGrid() {
    g.fillStyle = M; g.fillRect(0, 0, W, H);
    g.save(); g.strokeStyle = B; g.globalAlpha = tokens.grid.opacity; g.lineWidth = tokens.grid.garis;
    for (let x = 0; x <= W; x += tokens.grid.sel) { g.beginPath(); g.moveTo(x + 0.5, 0); g.lineTo(x + 0.5, H); g.stroke(); }
    for (let y = 0; y <= H; y += tokens.grid.sel) { g.beginPath(); g.moveTo(0, y + 0.5); g.lineTo(W, y + 0.5); g.stroke(); }
    g.restore();
  }
  function coverLayer(t) {
    if (!COVER || t >= COVER + 0.35) return;
    const p = eInOut(prog(t, COVER, 0.35));
    g.save(); g.globalAlpha = 1 - p; g.translate(540, 960); g.scale(1 + p * 0.06, 1 + p * 0.06); g.translate(-540, -960);
    drawCover(t); g.restore();
  }
  function cropCheck() { // kotak crop 3:4 di tengah (hanya untuk cek)
    const c = tokens.crop34; g.save(); g.strokeStyle = B; g.lineWidth = 3; g.setLineDash([10, 8]);
    g.strokeRect((W - c.width) / 2, (H - c.height) / 2, c.width, c.height); g.restore();
    text("CROP 3:4", (W - c.width) / 2, (H - c.height) / 2 - 22, 26, B, 500, "left");
  }

  function drawCover() {
    luar(0);
    ibu(330, 1380, { t: 0.5, jalan: 0, bicara: false, angkat: 0.5 });
    rrect(270, 300, 540, 90, 45, B); text("TIPS TIPIS", 540, 347, 52, M, 700);
    text("Sebelum beli emas,", 540, 470, 82, B, 700, "center", K, 16);
    text("tanya ini dulu!", 540, 590, 116, B, 700, "center", K, 22);
    bubble(["Harga buyback-nya", "berapa?"], 640, 820, 52, 380, 960);
    rrect(110, 1462, 860, 104, 30, B); text("Teliti di awal, biar tak menyesal", 540, 1516, 46, K, 700);
    text("@tokobbgold", 540, 1588, 40, B, 700, "center", K, 10);
  }

  const CEK = new URLSearchParams(location.search).has("crop");
  window.renderAt = (t) => {
    g.clearRect(0, 0, W, H);
    if (t < keluar[0]) iris(t, masuk, DOOR[0], DOOR[1], adeganLuarMasuk, adeganDalam);
    else iris(t, keluar, 300, 1100, adeganDalam, adeganLuarKeluar);
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
