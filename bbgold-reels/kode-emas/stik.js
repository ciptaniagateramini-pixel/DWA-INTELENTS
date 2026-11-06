// Gaya E "stikman": Bu Rina (stikman berkerudung) memandu; adegan kode kadar memakai foto cincin asli
// dengan kamera zoom ke bagian dalam cincin + ukiran ilustrasi melengkung di pita cincin.
// renderAt(t) deterministik (semua gerak fungsi waktu video).
import { loadLogo, prepareText, OPT as LOGO_OPT } from "/logo-outro/logo.js";
import { makeRenderer } from "/logo-outro/blur.js";

const W = 1080, H = 1920;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, p) => a + (b - a) * p;
const prog = (t, a, d) => clamp((t - a) / d);
const eOut = (p) => 1 - Math.pow(1 - p, 3);
const eInOut = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
const eBack = (p) => { const c = 1.7; return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2); };

export async function boot(dataPath) {
  const tokens = await (await fetch("/tokens.json")).json();
  const data = await (await fetch("/" + dataPath)).json();
  const words = (await (await fetch("/" + data.words)).json()).words;
  const { biru: B, mustard: M, mustardMuda: MM, krem: K, abuBiru: A } = tokens.color;
  const COVER = data.cover?.durasi || 0;
  const lead = data.jedaAwal + COVER, V = (n) => n + lead;
  for (const [file, weight] of [["Poppins-Bold", "700"], ["Poppins-Medium", "500"], ["Poppins-Light", "300"]]) {
    const f = new FontFace("Poppins", `url(/assets/fonts/${file}.woff2)`, { weight });
    document.fonts.add(await f.load());
  }
  const foto = new Image(); foto.src = "/" + data.foto.file; await foto.decode();
  const kata = (s, n = 0) => {
    const hits = words.filter((w) => w.text.replace(/[,.?:!]/g, "").toLowerCase() === s.toLowerCase());
    if (!hits[n]) throw new Error("kata tidak ada di naskah: " + s + " #" + n);
    return V(hits[n].start);
  };
  const cv = document.getElementById("main"), g = cv.getContext("2d");
  const outroCanvas = document.getElementById("outro");

  const T = {
    wajib: kata("wajib"), sebelum: kata("Sebelum"), cek: kata("cek"), cap: kata("cap"), misal: kata("Misalnya"),
    rina: kata("Rina"), cincin: kata("cincin"), coba: kata("Coba"), k16: kata("kode", 1) + 0.25, t700: kata("tujuh"), t70: kata("tujuh", 1),
    capProd: kata("cap", 1), logo: kata("logo"), ubs: kata("UBS"), lotus: kata("Lotus"), banyak: kata("banyak"),
    terus: kata("Terus"), bukan: kata("bukan"), tetap: kata("Tetap"), toko: kata("toko"), pengrajin: kata("Biasanya", 2),
    jadi: kata("Jadi"), cuma: kata("Cuma"), pabrik: kata("pabrik", 2), pengrajin2: kata("pengrajin", 1),
    mau: kata("Mau", 1), follow: kata("Follow"), biar: kata("Biar"), akhir: V(words[words.length - 1].end),
  };

  // ---- Helper gambar ----
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
  function span(t, t0, t1, fn, d = 0.35) {
    if (t < t0 || t > t1 + 0.25) return;
    g.save(); g.globalAlpha *= 1 - prog(t, t1, 0.25); pop(t, t0, fn, d); g.restore();
  }
  function bubble(lines, cx, cy, size, tx, ty, opt = {}) {
    const lh = size * 1.3, w = Math.max(...lines.map((l) => tw(l, size))) + size * 1.6, h = lines.length * lh + size * 1.1;
    const x = cx - w / 2, y = cy - h / 2, bx = clamp(tx, x + 50, x + w - 50);
    path([[bx - 26, y + h - 3], [tx, ty], [bx + 26, y + h - 3]], opt.bg || K);
    rrect(x, y, w, h, 34, opt.bg || K);
    path([[bx - 23, y + h - 6], [bx + 23, y + h - 6]], null, opt.bg || K, 8, false);
    lines.forEach((l, i) => text(l, cx, y + size * 0.55 + lh * (i + 0.5), size, opt.fg || B));
  }
  // judul memantul per kata
  function heading(t, t0, t1, s, y, size = 92, fill = B, stroke = K) {
    span(t, t0, t1, () => {
      const ws = s.split(" "), sp = tw(" ", size), wd = ws.map((w) => tw(w, size));
      let x = 540 - (wd.reduce((a, b) => a + b, 0) + sp * (ws.length - 1)) / 2;
      ws.forEach((w, i) => {
        const p = prog(t, t0 + i * 0.07, 0.35), dy = (1 - eBack(p)) * 60;
        g.save(); g.globalAlpha *= clamp(p * 3); text(w, x, y + dy, size, fill, 700, "left", stroke, size * 0.18); g.restore();
        x += wd[i] + sp;
      });
    }, 0.01);
  }
  function grid() {
    g.fillStyle = M; g.fillRect(0, 0, W, H);
    g.save(); g.strokeStyle = B; g.globalAlpha = tokens.grid.opacity; g.lineWidth = tokens.grid.garis;
    for (let x = 0; x <= W; x += tokens.grid.sel) { g.beginPath(); g.moveTo(x + 0.5, 0); g.lineTo(x + 0.5, H); g.stroke(); }
    for (let y = 0; y <= H; y += tokens.grid.sel) { g.beginPath(); g.moveTo(0, y + 0.5); g.lineTo(W, y + 0.5); g.stroke(); }
    g.restore();
  }
  function lantai(y = 1360) { path([[60, y], [1020, y]], null, B, 8, false); }
  function kacaPembesar(x, y, r, rot = -0.6) {
    g.save(); g.translate(x, y); g.rotate(rot);
    path([[0, r], [0, r * 2.1]], null, B, r * 0.32, false);
    g.globalAlpha *= 0.35; circle(0, 0, r, K, null); g.globalAlpha /= 0.35; circle(0, 0, r, null, B, r * 0.18);
    path([[-r * 0.45, -r * 0.3], [-r * 0.2, -r * 0.55]], null, K, r * 0.12, false);
    g.restore();
  }
  function check(cx, cy, r, p) {
    g.save(); circle(cx, cy, r * eBack(clamp(p * 2)), B, null);
    const q = clamp(p * 2 - 0.5); g.strokeStyle = K; g.lineWidth = r * 0.26; g.lineCap = "round"; g.lineJoin = "round";
    g.beginPath(); g.moveTo(cx - r * 0.45, cy + r * 0.02);
    const mx = cx - r * 0.12, my = cy + r * 0.34, ex = cx + r * 0.5, ey = cy - r * 0.36;
    if (q < 0.4) g.lineTo(lerp(cx - r * 0.45, mx, q / 0.4), lerp(cy + r * 0.02, my, q / 0.4));
    else { g.lineTo(mx, my); g.lineTo(lerp(mx, ex, (q - 0.4) / 0.6), lerp(my, ey, (q - 0.4) / 0.6)); }
    g.stroke(); g.restore();
  }

  // ---- Stikman ----
  // pose: sudut lengan [atas, bawah] (radian, 0 = lurus ke bawah, positif = ke depan)
  const POSE = {
    diam: { r: [0.25, 0.15], l: [-0.25, -0.15] },
    lambai: { r: [2.6, 0.5], l: [-0.25, -0.15] },
    pegang: { r: [1.25, 0.35], l: [-0.2, -0.1] },
    tunjuk: { r: [1.9, 0], l: [-0.25, -0.15] },
    garuk: { r: [2.16, 1.04], l: [-0.25, -0.15] },
    sorak: { r: [2.7, 0.2], l: [-2.7, -0.2] },
    pinggang: { r: [0.9, -2.0], l: [-0.9, 2.0] },
  };
  function poseAt(t, keys) {
    let cur = POSE[keys[0][1]];
    for (const [t0, name] of keys.slice(1)) {
      if (t < t0) break;
      const p = eInOut(prog(t, t0, 0.3)), nx = POSE[name];
      cur = { r: [lerp(cur.r[0], nx.r[0], p), lerp(cur.r[1], nx.r[1], p)], l: [lerp(cur.l[0], nx.l[0], p), lerp(cur.l[1], nx.l[1], p)] };
    }
    return cur;
  }
  function lengan(sh, a, f, ext = 0) {
    const L1 = 95, L2 = 88;
    const e = [sh[0] + Math.sin(a[0]) * L1 * f, sh[1] + Math.cos(a[0]) * L1];
    const h = [e[0] + Math.sin(a[0] + a[1] + ext) * L2 * f, e[1] + Math.cos(a[0] + a[1] + ext) * L2];
    path([sh, e, h], null, K, 24, false); circle(h[0], h[1], 16, K, null);
    path([sh, e, h], null, B, 14, false); circle(h[0], h[1], 11, B, null);
    return h;
  }
  function stik(x, y, o = {}) {
    const f = o.hadap ?? 1, t = o.t ?? 0, s = o.s ?? 1, jalan = o.jalan ?? 0, ph = o.langkah ?? t * 9;
    const loncat = o.loncat ? Math.abs(Math.sin(t * 7)) * -26 : 0;
    const bob = jalan * Math.abs(Math.sin(ph)) * -8 + Math.sin(t * 2.2) * 3 + loncat;
    g.save(); g.translate(x, y + bob); g.scale(s, s);
    const pose = o.pose ?? POSE.diam;
    // kaki
    for (const k of [1, -1]) {
      const dx = jalan * Math.sin(ph) * 40 * k;
      path([[k * 22, -150], [k * 30 + dx, -6]], null, B, 14, false);
      path([[k * 30 + dx, -6], [k * 30 + dx + 26 * f, -6]], null, B, 14, false);
    }
    if (o.peci) { // pengrajin: badan garis, celana
      path([[0, -385], [0, -170]], null, B, 14, false);
      path([[-28, -175], [28, -175], [30, -150], [-30, -150]], B, B, 8);
    } else {
      path([[0, -385], [0, -300]], null, B, 14, false);
      path([[-28, -305], [28, -305], [80, -140], [-80, -140]], K, B, 8); // gamis
    }
    const sh = [0, -370];
    const tangan = lengan(sh, pose.l, f, 0);
    // kepala
    const hx = 4 * f, hy = -448;
    if (o.peci) {
      circle(hx, hy, 50, K, B, 8);
      rrect(hx - 44, hy - 72, 88, 34, 10, B, B, 4);
    } else {
      g.beginPath(); g.moveTo(hx - 66, hy + 70); g.quadraticCurveTo(hx - 80, hy - 70, hx, hy - 72); g.quadraticCurveTo(hx + 80, hy - 70, hx + 66, hy + 70);
      g.quadraticCurveTo(hx, hy + 92, hx - 66, hy + 70); g.closePath(); g.fillStyle = B; g.fill();
      circle(hx + 6 * f, hy, 44, K, B, 6);
    }
    const kedip = (t + (o.seed ?? 0)) % 3.3 < 0.12;
    for (const ex of [-14, 22]) { const xx = hx + ex * f; if (kedip) path([[xx - 6, hy - 6], [xx + 6, hy - 6]], null, B, 5, false); else circle(xx, hy - 6, 6, B, null); }
    if (o.bicara) { const m = Math.abs(Math.sin(t * 17)); g.beginPath(); g.ellipse(hx + 6 * f, hy + 20, 10, 3 + m * 8, 0, 0, Math.PI * 2); g.fillStyle = B; g.fill(); }
    else { g.beginPath(); g.arc(hx + 6 * f, hy + 12, 15, 0.2 * Math.PI, 0.8 * Math.PI); g.strokeStyle = B; g.lineWidth = 5; g.stroke(); }
    if (o.bingung) { g.save(); g.globalAlpha *= 0.9; path([[hx + 40 * f, hy - 50], [hx + 52 * f, hy - 30]], null, B, 5, false); circle(hx + 56 * f, hy - 20, 6, K, B, 3); g.restore(); }
    // lengan kanan (depan) + benda yang dipegang
    const ext = o.ayun ? Math.sin(t * 10) * 0.35 : 0;
    const h = lengan(sh, pose.r, f, ext);
    if (o.pegang) { g.save(); g.translate(h[0], h[1]); o.pegang(t); g.restore(); }
    g.restore();
    return tangan;
  }
  const rinaHead = (x, y, s = 1) => [x, y - 540 * s];

  // ---- Foto cincin dengan kamera ----
  const FW = { x: 40, y: 330, w: 1000, h: 940 };
  const base = FW.h / foto.naturalHeight;
  const camKeys = [
    [T.coba - 0.3, 768, 520, 1, 0.01],
    [T.coba + 0.35, 270, 250, 3.1, 0.9],
    [T.capProd - 0.25, 762, 245, 3.1, 0.8],
    [T.ubs - 0.35, 768, 520, 1, 0.8],
  ];
  function cam(t) {
    let c = { x: camKeys[0][1], y: camKeys[0][2], z: camKeys[0][3] };
    for (const [t0, x, y, z, d] of camKeys.slice(1)) {
      if (t < t0) break;
      const p = eInOut(prog(t, t0, d));
      c = { x: lerp(c.x, x, p), y: lerp(c.y, y, p), z: lerp(c.z, z, p) };
    }
    return { ...c, x: c.x + Math.sin(t * 0.8) * 4 / c.z, y: c.y + Math.cos(t * 0.6) * 3 / c.z };
  }
  // ukiran melengkung di pita belakang cincin (koordinat foto)
  function ukiran(s, cx, cy, rx, ry, size, alpha) {
    if (alpha <= 0) return;
    g.save(); g.globalAlpha *= alpha; g.font = `700 ${size}px Poppins`; g.textAlign = "center"; g.textBaseline = "middle";
    const chars = [...s], ws = chars.map((c) => g.measureText(c).width + size * 0.12);
    const total = ws.reduce((a, b) => a + b, 0);
    let acc = -total / 2;
    chars.forEach((c, i) => {
      const off = acc + ws[i] / 2; acc += ws[i];
      const ang = -Math.PI / 2 + off / rx;
      const px = cx + Math.cos(ang) * rx, py = cy + Math.sin(ang) * ry;
      const tan = Math.atan2(Math.cos(ang) * ry, -Math.sin(ang) * rx);
      g.save(); g.translate(px, py); g.rotate(tan); g.scale(1, 0.85);
      g.fillStyle = "rgba(251,247,236,0.55)"; g.fillText(c, 0.8, 0.8);
      g.fillStyle = "rgba(8,42,89,0.62)"; g.fillText(c, 0, 0);
      g.restore();
    });
    g.restore();
  }
  function stempel(cx, cy, w, h, alpha, label) {
    if (alpha <= 0) return;
    g.save(); g.globalAlpha *= alpha;
    g.strokeStyle = "rgba(8,42,89,0.7)"; g.lineWidth = 1.6; g.beginPath(); g.roundRect(cx - w / 2, cy - h / 2, w, h, 4); g.stroke();
    g.font = `700 ${h * 0.55}px Poppins`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = "rgba(251,247,236,0.6)"; g.fillText(label, cx + 0.6, cy + 1.1); g.fillStyle = "rgba(8,42,89,0.7)"; g.fillText(label, cx, cy + 0.5);
    g.restore();
  }
  function fotoCincin(t) {
    const c = cam(t), sc = base * c.z;
    g.save(); g.beginPath(); g.roundRect(FW.x, FW.y, FW.w, FW.h, 40); g.clip();
    g.translate(FW.x + FW.w / 2, FW.y + FW.h / 2); g.scale(sc, sc); g.translate(-c.x, -c.y);
    g.drawImage(foto, 0, 0);
    g.restore();
    rrect(FW.x, FW.y, FW.w, FW.h, 40, null, B, 8);
    // lensa pembesar: pita belakang cincin diperbesar + ukiran ilustrasi
    const lensA = clamp((c.z - 2.0) / 0.8);
    if (lensA > 0) {
      const target = t < T.capProd - 0.25 ? [270, 219] : [762, 213];
            const L = [540, FW.y + FW.h * 0.64], R = 250, zs = sc * 2.6;
      g.save(); g.globalAlpha = lensA;
      g.save(); g.beginPath(); g.arc(L[0], L[1], R, 0, Math.PI * 2); g.clip();
      g.translate(L[0], L[1]); g.scale(zs, zs); g.translate(-target[0], -target[1]);
      g.drawImage(foto, 0, 0);
      engrave(t);
      g.restore();
      circle(L[0], L[1], R, null, K, 16); circle(L[0], L[1], R + 8, null, B, 5);
      g.restore();
      pill("ilustrasi", FW.x + 120, FW.y + 52, 26, K, B);
    }
  }
  function engrave(t) {
    const a1 = prog(t, T.k16, 0.3) * (1 - prog(t, T.t700 - 0.15, 0.2));
    const a2 = prog(t, T.t700, 0.3) * (1 - prog(t, T.t70 - 0.15, 0.2));
    const a3 = prog(t, T.t70, 0.3) * (1 - prog(t, T.ubs - 0.4, 0.3));
    ukiran("16K", 270, 307, 222, 89, 11, a1);
    ukiran("700", 270, 307, 222, 89, 11, a2);
    ukiran("70", 270, 307, 222, 89, 11, a3);
    stempel(762, 213, 36, 11, prog(t, T.capProd + 0.4, 0.3) * (1 - prog(t, T.ubs - 0.4, 0.3)), "LOGO");
  }

  // ---- Etalase sederhana dengan potongan foto cincin ----
  const RINGS = [[30, 180, 480, 350], [530, 180, 470, 350], [1020, 180, 490, 340]];
  function etalase(t) {
    rrect(560, 1050, 460, 310, 18, K, B, 8);
    rrect(590, 1080, 400, 160, 14, B, B, 4);
    RINGS.forEach(([sx, sy, sw, sh], i) => {
      g.save(); g.beginPath(); g.roundRect(600 + i * 130, 1095, 120, 130, 12); g.clip();
      g.drawImage(foto, sx, sy, sw, sh, 600 + i * 130 - 20, 1095 + 20, 160, 160 * (sh / sw)); g.restore();
    });
  }
  function pabrikIkon(cx, cy, t) {
    path([[cx - 150, cy + 110], [cx - 150, cy - 10], [cx - 70, cy - 60], [cx - 70, cy - 10], [cx + 10, cy - 60], [cx + 10, cy - 10], [cx + 90, cy - 60], [cx + 90, cy - 150], [cx + 140, cy - 150], [cx + 140, cy + 110]], K, B, 8);
    for (let i = 0; i < 3; i++) rrect(cx - 120 + i * 80, cy + 20, 50, 50, 8, MM, B, 5);
    for (let i = 0; i < 3; i++) { const k = ((t * 0.6 + i / 3) % 1); g.save(); g.globalAlpha *= 1 - k; circle(cx + 115 + k * 40, cy - 170 - k * 120, 18 + k * 20, K, B, 4); g.restore(); }
  }
  const palu = (t) => { g.save(); g.rotate(-0.6); path([[0, 0], [0, -70]], null, B, 10, false); rrect(-30, -100, 60, 34, 8, A, B, 4); g.restore(); };
  function landasan(cx, cy, t, tHit) {
    path([[cx - 70, cy], [cx + 70, cy], [cx + 50, cy - 50], [cx - 90, cy - 50]], A, B, 6);
    g.save(); g.beginPath(); g.ellipse(cx - 10, cy - 64, 30, 12, 0, 0, Math.PI * 2); g.strokeStyle = M; g.lineWidth = 8; g.stroke(); g.restore();
    const k = (t * 2.5) % 1; if (k < 0.25 && t > tHit) for (let i = 0; i < 4; i++) { const a = -Math.PI / 2 + (i - 1.5) * 0.5; path([[cx - 10 + Math.cos(a) * 40, cy - 70 + Math.sin(a) * 40], [cx - 10 + Math.cos(a) * 62, cy - 70 + Math.sin(a) * 62]], null, B, 5, false); }
  }

  // ---- Adegan ----
  function adegan(t) {
    grid();
    // 1. sapaan
    if (t < T.sebelum) {
      heading(t, V(0), T.sebelum - 0.3, "TIPS TIPIS", 420, 120, M, B);
      heading(t, V(0.15), T.sebelum - 0.3, "Bunda-bunda,", 560, 76);
      heading(t, T.wajib, T.sebelum - 0.3, "wajib tahu!", 660, 76);
      lantai();
      stik(540, 1360, { t, pose: poseAt(t, [[0, "lambai"]]), ayun: true, bicara: t > V(0) && t < T.sebelum - 0.3, loncat: t > T.wajib && t < T.wajib + 0.9 });
    }
    // 2. di etalase
    else if (t < T.coba - 0.3) {
      lantai(); etalase(t);
      const p = poseAt(t, [[0, "pegang"], [T.misal, "lambai"], [T.cincin, "pegang"]]);
      stik(330, 1360, { t, pose: p, hadap: 1, bicara: true, ayun: t > T.misal && t < T.cincin, pegang: t < T.misal || t > T.cincin ? () => kacaPembesar(30, -30, 46, -0.9) : null });
      heading(t, T.sebelum, T.misal - 0.3, "Sebelum bungkus...", 400, 76);
      span(t, T.cek, T.misal - 0.3, (s) => { g.translate(540, 560); g.scale(s, s); g.rotate(-0.04); pill("cek KODE KADAR", 0, 0, 54, B, K); });
      span(t, T.cap, T.misal - 0.3, (s) => { g.translate(540, 680); g.scale(s, s); g.rotate(0.04); pill("cek CAP PABRIK", 0, 0, 54, K, B); });
      span(t, T.rina - 0.1, T.coba - 0.35, (s) => { g.translate(330, 700); g.scale(s, s); pill("Bu Rina", 0, 0, 44, B, M); });
      span(t, T.cincin, T.coba - 0.35, (s) => { g.translate(680, 470); g.scale(s, s); bubble(["Mau cincin 16K!"], 0, 0, 56, 330 - 680 + 20, 800 - 470); });
    }
    // 3. foto cincin + zoom
    else if (t < T.terus - 0.25) {
      const a = eBack(prog(t, T.coba - 0.3, 0.45));
      g.save(); g.translate(540, 800); g.scale(lerp(0.7, 1, a), lerp(0.7, 1, a)); g.translate(-540, -800); fotoCincin(t); g.restore();
      heading(t, T.coba - 0.2, T.capProd - 0.3, "Lihat bagian dalamnya", 250, 66);
      heading(t, T.capProd, T.terus - 0.4, "Cap pabrik pembuat", 250, 66);
      const info = (t0, t1, s) => span(t, t0, t1, (k) => { g.translate(540, 1370); g.scale(k, k); pill(s, 0, 0, 52, B, K); });
      info(T.k16, T.t700 - 0.15, "kode 16K");
      info(T.t700, T.capProd - 0.3, "700 / 70 = kadar 70%");
      info(T.logo, T.ubs - 0.3, "logo pabrik");
      // nama pabrik di atas foto
      const lab = [[T.ubs, "UBS", 300, 560], [T.lotus, "Lotus", 780, 560], [T.banyak, "dll.", 640, 1030]];
      for (const [t0, s, x, y] of lab) span(t, t0, T.terus - 0.4, (k) => { g.translate(x, y); g.scale(k, k); pill(s, 0, 0, 58, B, M); });
    }
    // 4. tanpa kode?
    else if (t < T.jadi - 0.3) {
      lantai();
      const pr = T.pengrajin - 0.1, xr = lerp(330, 270, eInOut(prog(t, pr, 0.5)));
      stik(xr, 1360, { t, pose: poseAt(t, [[0, "garuk"], [T.tetap, "sorak"], [T.tetap + 1.2, "tunjuk"]]), ayun: t < T.tetap, bingung: t < T.tetap, bicara: t < T.bukan + 0.8, loncat: t > T.tetap && t < T.tetap + 1.0 });
      span(t, T.terus, T.tetap - 0.25, (s) => { g.translate(720, 620); g.scale(s, s); g.rotate(0.1); text("?", 0, 0, 380, B, 700, "center", K, 30); });
      heading(t, T.terus + 0.3, T.tetap - 0.3, "Tanpa kode & cap?", 330, 76);
      span(t, T.tetap, T.jadi - 0.35, (s) => { g.translate(540, 360); g.scale(s, s); rrect(-330, -80, 660, 160, 80, B); check(-230, 0, 50, prog(t, T.tetap, 0.6)); text("TETAP EMAS", 50, 4, 76, K); });
      span(t, T.toko, T.jadi - 0.35, (s) => { g.translate(540, 500); g.scale(s, s); text("kalau belinya di toko emas", 0, 0, 44, B, 700, "center", K, 10); });
      if (t >= pr) {
        const xp = lerp(1250, 800, eOut(prog(t, pr, 0.7)));
        landasan(xp - 150, 1360, t, pr + 0.7);
        stik(xp, 1360, { t, peci: true, hadap: -1, seed: 1.3, pose: { r: [1.6 + Math.sin(t * 2.5 * Math.PI * 2) * 0.35, 0.3], l: [-0.25, -0.15] }, pegang: palu });
        span(t, T.pengrajin + 0.4, T.jadi - 0.35, (s) => { g.translate(780, 720); g.scale(s, s); pill("PENGRAJIN LOKAL", 0, 0, 46, K, B); });
      }
    }
    // 5. beda produsen
    else if (t < T.mau - 0.3) {
      heading(t, T.jadi, T.mau - 0.4, "Bedanya apa?", 330, 92);
      span(t, T.cuma, T.mau - 0.4, (s) => { g.translate(540, 480); g.scale(s, s); pill("cuma beda PRODUSEN", 0, 0, 52, B, K); });
      span(t, T.pabrik, T.mau - 0.4, (s) => { g.translate(290, 950); g.scale(s, s); rrect(-220, -280, 440, 560, 40, MM, B, 6); pabrikIkon(0, 20, t); pill("PABRIK", 0, 200, 48, B, K); });
      span(t, T.pengrajin2, T.mau - 0.4, (s) => {
        g.translate(790, 950); g.scale(s, s); rrect(-220, -280, 440, 560, 40, MM, B, 6);
        landasan(-60, 130, t, T.pengrajin2 + 0.3);
        stik(90, 130, { t, peci: true, hadap: -1, s: 0.55, seed: 2.1, pose: { r: [1.6 + Math.sin(t * 2.5 * Math.PI * 2) * 0.35, 0.3], l: [-0.25, -0.15] }, pegang: palu });
        pill("PENGRAJIN", 0, 200, 48, B, K);
      });
      span(t, T.pengrajin2 + 0.3, T.mau - 0.4, (s) => { g.translate(540, 950); g.scale(s, s); circle(0, 0, 50, K, B, 6); text("=", 0, -2, 70, B); });
    }
    // 6. follow
    else {
      lantai();
      heading(t, T.mau, 999, "Kelebihan &", 330, 84);
      heading(t, T.mau + 0.2, 999, "kekurangannya?", 440, 84);
      stik(300, 1360, { t, pose: poseAt(t, [[0, "pinggang"], [T.follow, "tunjuk"]]), bicara: t > T.follow && t < T.biar, loncat: t > T.biar });
      pop(t, T.follow, (s) => {
        const pulse = 1 + Math.sin((t - T.follow) * 6) * 0.04;
        g.translate(700, 900); g.scale(s * pulse, s * pulse);
        rrect(-230, -80, 460, 160, 40, B);
        circle(-150, 0, 40, M, null); path([[-170, 0], [-130, 0]], null, B, 10, false); path([[-150, -20], [-150, 20]], null, B, 10, false);
        text("FOLLOW", 40, 4, 74, K);
      });
      pop(t, T.follow + 0.3, (s) => { g.translate(700, 1040); g.scale(s, s); text("@tokobbgold", 0, 0, 46, B, 700, "center", K, 10); });
      span(t, T.biar, 999, (s) => { g.translate(540, 600); g.scale(s, s); g.rotate(-0.04); pill("biar makin teliti!", 0, 0, 52, K, B); });
    }
  }

  // ---- Teks bawah per frasa ----
  const capWords = words.map((w) => ({ ...w, t0: V(w.start), t1: V(w.end) }));
  const chunks = []; let cur = [];
  capWords.forEach((w, i) => {
    cur.push(w);
    const next = capWords[i + 1];
    const len = cur.map((x) => x.text).join(" ").length;
    if (!next || /[,.?:!]$/.test(w.text) || next.t0 - w.t1 > 0.15 || len > 20) { chunks.push(cur); cur = []; }
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
    const ws = ch.map((w) => w.text.replace(/[,.?:!]$/, ""));
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

  // ---- Cover (frame pertama) ----
  function drawCover() {
    grid();
    text("Bunda, cincinmu", 540, 420, 92, B, 700);
    text("punya...", 540, 530, 92, B, 700);
    g.save(); g.translate(560, 840); g.rotate(-0.06);
    bubble(["KODE", "RAHASIA?"], 0, 0, 130, -300, 430);
    g.restore();
    g.save(); g.translate(650, 1240); g.rotate(0.04); pill("cek sebelum bungkus!", 0, 0, 56, B, M); g.restore();
    stik(250, 1720, { t: 0.4, pose: POSE.pegang, pegang: () => kacaPembesar(30, -30, 50, -0.9) });
    text("@tokobbgold", 790, 1560, 44, B, 700);
  }
  function coverLayer(t) {
    if (!COVER || t >= COVER + 0.35) return;
    const p = eInOut(prog(t, COVER, 0.35));
    g.save(); g.globalAlpha = 1 - p; g.translate(540, 960); g.scale(1 + p * 0.06, 1 + p * 0.06); g.translate(-540, -960);
    drawCover(); g.restore();
  }
  function cropCheck() {
    const c = tokens.crop34; g.save(); g.strokeStyle = B; g.lineWidth = 3; g.setLineDash([10, 8]);
    g.strokeRect((W - c.width) / 2, (H - c.height) / 2, c.width, c.height); g.restore();
    text("CROP 3:4", (W - c.width) / 2, (H - c.height) / 2 - 22, 26, B, 500, "left");
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
  for (const t of [T.sebelum, T.coba - 0.3, T.coba + 0.35, T.capProd - 0.25, T.ubs - 0.35, T.terus - 0.25, T.jadi - 0.3, T.mau - 0.3]) cues.push({ type: "whoosh", t: t - wl, tetap: true });
  for (const t of [V(0), T.cek, T.cap, T.rina - 0.1, T.cincin, T.k16, T.t700, T.t70, T.capProd + 0.4, T.ubs, T.lotus, T.banyak, T.terus, T.tetap, T.pengrajin + 0.4, T.cuma, T.pabrik, T.pengrajin2, T.follow, T.biar]) cues.push({ type: "pop", t });
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
