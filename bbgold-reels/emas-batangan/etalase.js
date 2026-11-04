// Gaya C "etalase kartu 3D": kartu emas asli tampil sebagai benda 3D (balik, miring, kilau) di kanvas mustard,
// tipografi besar per adegan, teks bawah per frasa dengan kata aktif disorot. Kartu = DOM + CSS 3D,
// teks dan grafik = kanvas di atasnya. renderAt(t) deterministik (semua gerak fungsi waktu video).
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
  // waktu kata ke-n (0 = kemunculan pertama) dalam waktu video
  const kata = (s, n = 0) => {
    const hits = words.filter((w) => w.text.replace(/[,.?]/g, "").toLowerCase() === s.toLowerCase());
    if (!hits[n]) throw new Error("kata tidak ada di naskah: " + s + " #" + n);
    return V(hits[n].start);
  };

  // ---- Grid (statis) ----
  const gg = document.getElementById("grid").getContext("2d");
  gg.fillStyle = M; gg.fillRect(0, 0, W, H);
  gg.strokeStyle = B; gg.globalAlpha = tokens.grid.opacity; gg.lineWidth = tokens.grid.garis;
  for (let x = 0; x <= W; x += tokens.grid.sel) { gg.beginPath(); gg.moveTo(x + 0.5, 0); gg.lineTo(x + 0.5, H); gg.stroke(); }
  for (let y = 0; y <= H; y += tokens.grid.sel) { gg.beginPath(); gg.moveTo(0, y + 0.5); gg.lineTo(W, y + 0.5); gg.stroke(); }

  const cv = document.getElementById("main"), g = cv.getContext("2d");
  const outroCanvas = document.getElementById("outro");

  // ---- Kartu ----
  const HK = 620; // tinggi kartu pada skala 1
  const wrap = document.getElementById("kartu");
  const cards = {};
  for (const c of data.kartu) {
    const img = new Image(); img.src = "/" + c.file; await img.decode();
    const w = Math.round((HK * img.naturalWidth) / img.naturalHeight);
    const el = document.createElement("div"); el.className = "k";
    el.style.width = w + "px"; el.style.height = HK + "px";
    el.innerHTML = `<div class="bayang"></div><div class="muka"></div><div class="bel"><span>?</span></div>`;
    el.querySelector(".muka").appendChild(img);
    const kil = document.createElement("div"); kil.className = "kilau"; el.querySelector(".muka").appendChild(kil);
    wrap.appendChild(el);
    cards[c.id] = { el, w, kil, bay: el.querySelector(".bayang"), keys: [] };
  }
  const ORDER = data.kartu.map((c) => c.id);
  // keyframe: [waktu video, state parsial, durasi, ease]
  const key = (id, t, st, d = 0.7, ease = eInOut) => cards[id].keys.push({ t, st, d, ease });
  const BASE = { x: 540, y: 2400, s: 0.82, rx: 0, ry: 180, rz: 0, o: 1 };
  function stateAt(c, t) {
    const cur = { ...BASE };
    for (const k of c.keys) {
      if (t < k.t) break;
      const e = k.ease(prog(t, k.t, k.d));
      const from = { ...cur };
      for (const [p, v] of Object.entries(k.st)) cur[p] = lerp(from[p], v, e);
    }
    return cur;
  }

  // ---- Koreografi ----
  const T = {
    banyak: kata("banyak"), ubs: kata("UBS"), lotus: kata("Lotus"), emasku: kata("Emasku"),
    pUbs: kata("UBS", 1), pLotus: kata("Lotus", 1), pEmasku: kata("Emasku", 1),
    namaUbs: kata("Untung"), namaLotus: kata("Lingga") - 0.35, namaArchi: kata("Archi", 2), namaEmasku: kata("Hartadinata", 1),
    patungan: kata("patungan"),
    sama: kata("Yang"), kadar: kata("Kadarnya"), karat: kata("dua"), persen: kata("sembilan"),
    beda: kata("Yang", 1), produsen: kata("Produsen"), tempat: kata("tempat"),
    jadi: kata("Jadi"), likuid: kata("apakah"), murni: kata("Sama-sama", 1), dijual: kata("bisa"),
    harga: kata("harga"), menerima: kata("menerimanya") - 0.35, berbeda: kata("berbeda"),
    pilih: kata("Kalau"), komen: kata("Komen"), akhir: V(words[words.length - 1].end),
  };
  const fan = { ubs: { x: 255, y: 900, rz: -7 }, lotus: { x: 540, y: 860, rz: 0 }, emasku: { x: 825, y: 900, rz: 7 } };
  // masuk (punggung kartu) lalu dibalik saat mereknya disebut
  ORDER.forEach((id, i) => {
    key(id, T.banyak + i * 0.12, { ...fan[id], s: 0.82, ry: 180 }, 0.8, eExpo);
    key(id, T[id], { ry: 0, s: 0.88 }, 0.6, eBack);
    key(id, T[id] + 0.6, { s: 0.82 }, 0.4);
  });
  // karosel produsen: kartu aktif di tengah, tetangga di tepi
  const slot = { kiri2: { x: -700, y: 780, s: 0.7, ry: 35, rz: 0, o: 1 }, kiri: { x: -190, y: 780, s: 0.75, ry: 30, rz: 0, o: 1 },
    tengah: { x: 540, y: 760, s: 0.95, ry: 0, rz: 0, o: 1 }, kanan: { x: 1270, y: 780, s: 0.75, ry: -30, rz: 0, o: 1 }, kanan2: { x: 1780, y: 780, s: 0.7, ry: -35, rz: 0, o: 1 } };
  const karosel = [[T.pUbs, ["tengah", "kanan", "kanan2"]], [T.pLotus, ["kiri", "tengah", "kanan"]], [T.pEmasku, ["kiri2", "kiri", "tengah"]]];
  for (const [t, pos] of karosel) ORDER.forEach((id, i) => key(id, t - 0.15, slot[pos[i]], 0.75));
  // sama: berjajar
  const row = (y, s, gap = 300) => ORDER.map((_, i) => ({ x: 540 + (i - 1) * gap, y, s, ry: 0, rz: 0, rx: 0 }));
  const rSama = row(720, 0.6);
  ORDER.forEach((id, i) => key(id, T.sama - 0.15, rSama[i], 0.8));
  // beda: renggang dan miring
  const rBeda = row(740, 0.56, 330);
  ORDER.forEach((id, i) => key(id, T.beda - 0.12, { ...rBeda[i], rz: [-5, 4, -4][i], ry: [14, 0, -14][i] }, 0.6, eBack));
  // likuid: naik mengecil
  const rLik = row(500, 0.36, 230);
  ORDER.forEach((id, i) => key(id, T.jadi - 0.1, { ...rLik[i], rz: 0, ry: 0 }, 0.7));
  // pilih: besar, berjajar
  const rPil = row(830, 0.66, 315);
  ORDER.forEach((id, i) => key(id, T.pilih - 0.12, rPil[i], 0.7, eExpo));

  function drawCards(t) {
    for (const id of ORDER) {
      const c = cards[id], s = stateAt(c, t);
      // ayunan halus saat diam supaya tidak beku
      const sway = Math.sin(t * 0.9 + ORDER.indexOf(id) * 1.7);
      const ry = s.ry + sway * 4, rx = s.rx + Math.cos(t * 0.7 + ORDER.indexOf(id)) * 3;
      const yy = s.y + sway * 6;
      c.el.style.transform = `translate3d(${(s.x - c.w / 2).toFixed(2)}px,${(yy - HK / 2).toFixed(2)}px,0) rotateZ(${s.rz.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) rotateX(${rx.toFixed(2)}deg) scale(${s.s.toFixed(4)})`;
      c.el.style.opacity = s.o.toFixed(3);
      // kilau menyapu dipicu sudut putar
      const sweep = ((ry + 40) / 80) * 100;
      c.kil.style.background = `linear-gradient(115deg, rgba(255,255,255,0) ${sweep - 30}%, rgba(255,250,230,0.38) ${sweep}%, rgba(255,255,255,0) ${sweep + 30}%)`;
      c.bay.style.opacity = (0.22 * s.o).toFixed(3);
    }
  }

  // ---- Helper teks ----
  function text(s, x, y, size, color, weight = 700, align = "center", stroke = null, sw = 0) {
    g.font = `${weight} ${size}px Poppins`; g.textAlign = align; g.textBaseline = "middle";
    if (stroke) { g.lineJoin = "round"; g.strokeStyle = stroke; g.lineWidth = sw || size * 0.16; g.strokeText(s, x, y); }
    g.fillStyle = color; g.fillText(s, x, y);
  }
  function rrect(x, y, w, h, r, fill, stroke = null, lw = 5) {
    g.beginPath(); g.roundRect(x, y, w, h, r);
    if (fill) { g.fillStyle = fill; g.fill(); }
    if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw; g.stroke(); }
  }
  const tw = (s, size, weight = 700) => { g.font = `${weight} ${size}px Poppins`; return g.measureText(s).width; };
  // pill: teks di dalam kapsul
  function pill(s, cx, cy, size, bg = K, fg = B, weight = 700) {
    const w = tw(s, size, weight) + size * 1.1, h = size * 1.6;
    rrect(cx - w / 2, cy - h / 2, w, h, h / 2, bg, B, 4); text(s, cx, cy + size * 0.04, size, fg, weight);
  }
  // muncul: skala + alpha
  function pop(t, t0, fn, d = 0.35) {
    if (t < t0) return;
    const p = prog(t, t0, d), s = lerp(0.6, 1, eBack(p));
    g.save(); g.globalAlpha *= clamp(p * 2.5); fn(s); g.restore();
  }
  // judul adegan di atas (huruf naik satu per satu)
  function heading(t, t0, t1, lines, y = 330, size = 96) {
    if (t < t0 || t > t1 + 0.35) return;
    const out = t > t1 ? eInOut(prog(t, t1, 0.3)) : 0;
    g.save(); g.globalAlpha = 1 - out;
    lines.forEach((ln, li) => {
      g.font = `700 ${size}px Poppins`;
      const total = g.measureText(ln).width; let x = 540 - total / 2;
      [...ln].forEach((ch, i) => {
        const p = eExpo(prog(t, t0 + li * 0.12 + i * 0.022, 0.4));
        g.save(); g.globalAlpha *= clamp(p * 1.5);
        g.textAlign = "left"; g.textBaseline = "middle";
        const yy = y + li * size * 1.12 + (1 - p) * 50 - out * 30;
        g.lineJoin = "round"; g.strokeStyle = K; g.lineWidth = size * 0.16; g.strokeText(ch, x, yy);
        g.fillStyle = B; g.fillText(ch, x, yy); g.restore();
        x += g.measureText(ch).width;
      });
    });
    g.restore();
  }
  function check(cx, cy, r, p) { // lingkaran biru + centang krem
    g.save(); g.fillStyle = B; g.beginPath(); g.arc(cx, cy, r * eBack(clamp(p * 2)), 0, Math.PI * 2); g.fill();
    const q = clamp(p * 2 - 0.5); g.strokeStyle = K; g.lineWidth = r * 0.28; g.lineCap = "round"; g.lineJoin = "round";
    g.beginPath(); g.moveTo(cx - r * 0.45, cy + r * 0.02);
    const mx = cx - r * 0.12, my = cy + r * 0.34, ex = cx + r * 0.5, ey = cy - r * 0.36;
    if (q < 0.4) g.lineTo(lerp(cx - r * 0.45, mx, q / 0.4), lerp(cy + r * 0.02, my, q / 0.4));
    else { g.lineTo(mx, my); g.lineTo(lerp(mx, ex, (q - 0.4) / 0.6), lerp(my, ey, (q - 0.4) / 0.6)); }
    g.stroke(); g.restore();
  }
  function approx(cx, cy, r, p) { // lingkaran abu-biru + tanda "≈"
    g.save(); g.fillStyle = A; g.beginPath(); g.arc(cx, cy, r * eBack(clamp(p * 2)), 0, Math.PI * 2); g.fill();
    g.globalAlpha = clamp(p * 2 - 0.6); g.strokeStyle = K; g.lineWidth = r * 0.16; g.lineCap = "round";
    for (const dy of [-0.18, 0.18]) { g.beginPath(); for (let i = 0; i <= 16; i++) { const u = i / 16; const xx = cx + (u - 0.5) * r * 1.1, yy = cy + dy * r + Math.sin(u * Math.PI * 2) * r * 0.1; i ? g.lineTo(xx, yy) : g.moveTo(xx, yy); } g.stroke(); }
    g.restore();
  }

  // ---- Adegan teks/grafik ----
  function scenes(t) {
    // pembuka
    if (t < T.banyak + 0.3) {
      const out = eInOut(prog(t, T.banyak - 0.2, 0.45));
      g.save(); g.globalAlpha = 1 - out;
      heading(t, V(0.0), 99, ["EMAS", "BATANGAN"], 760 - out * 200, 170);
      pop(t, V(0.25), (s) => { g.translate(540, 1110); g.scale(s, s); pill("DI INDONESIA", 0, 0, 48, B, K); });
      g.restore();
    }
    heading(t, T.banyak + 0.2, T.pUbs - 0.3, ["BANYAK MEREK"], 330, 100);
    // nama merek di bawah kipas
    const nm = { ubs: "UBS", lotus: "Lotus Archi", emasku: "Emasku" };
    if (t < T.pUbs - 0.2) for (const id of ORDER) pop(t, T[id] + 0.15, (s) => { g.translate(fan[id].x, 1250); g.scale(s, s); pill(nm[id], 0, 0, 40); });
    if (t < T.pUbs - 0.2) pop(t, kata("Hartadinata"), (s) => { g.translate(825, 1340); g.scale(s, s); text("dari Hartadinata", 0, 0, 34, B, 500, "center", K, 8); });

    // produsen (karosel)
    const tag = (t0, t1, label, lines, sub, tSub) => {
      if (t < t0 || t > t1 + 0.3) return;
      const out = t > t1 ? prog(t, t1, 0.25) : 0;
      g.save(); g.globalAlpha = 1 - out;
      pop(t, t0, (s) => {
        g.translate(540, 1200); g.scale(s, s);
        const size = 52, hh = lines.length * size * 1.25 + 120;
        const ww = Math.max(...lines.map((l) => tw(l, size))) + 110;
        rrect(-ww / 2, -70, ww, hh, 34, K, B, 5);
        text(label, 0, -26, 28, A, 700);
        lines.forEach((l, i) => text(l, 0, 40 + i * size * 1.25, size, B, 700));
      });
      if (sub) pop(t, tSub, (s) => { g.translate(540, 1098); g.scale(s, s); pill(sub, 0, 0, 30, B, K); });
      g.restore();
    };
    heading(t, T.pUbs - 0.1, T.sama - 0.35, ["PRODUSENNYA"], 330, 96);
    tag(T.namaUbs, T.pLotus - 0.3, "DIPRODUKSI OLEH", ["PT Untung Bersama", "Sejahtera"]);
    tag(T.namaLotus, T.pEmasku - 0.3, "DIPRODUKSI OLEH", ["Lotus Lingga Pratama", "& Archi Group"], "PERUSAHAAN PATUNGAN", T.patungan);
    tag(T.namaEmasku, T.sama - 0.35, "DIPRODUKSI OLEH", ["PT Hartadinata", "Abadi"]);

    // sama
    heading(t, T.sama, T.beda - 0.3, ["YANG SAMA?"], 330, 110);
    if (t >= T.kadar && t < T.beda) {
      const out = prog(t, T.beda - 0.3, 0.25);
      g.save(); g.globalAlpha = 1 - out;
      // kurung penghubung di bawah tiga kartu
      const p = eOut(prog(t, T.kadar, 0.5)), y = 940;
      g.strokeStyle = B; g.lineWidth = 8; g.lineCap = "round"; g.lineJoin = "round";
      g.beginPath(); g.moveTo(540 - 300 * p, y); g.lineTo(540 - 300 * p, y + 30 * p); g.lineTo(540 + 300 * p, y + 30 * p); g.lineTo(540 + 300 * p, y);
      g.moveTo(540, y + 30 * p); g.lineTo(540, y + 70 * p); g.stroke();
      pop(t, T.kadar, (s) => { g.translate(540, 1050); g.scale(s, s); pill("KADARNYA", 0, 0, 42, B, K); });
      pop(t, T.karat, (s) => {
        g.translate(540, 1205); g.scale(s, s);
        rrect(-360, -95, 720, 190, 40, K, B, 6);
        text("24 KARAT", 0, 6, 120, B, 700);
      }, 0.4);
      if (t >= T.persen) {
        const k = eOut(prog(t, T.persen, 2.2));
        const v = lerp(90, 99.99, k).toFixed(2).replace(".", ",");
        pop(t, T.persen, (s) => { g.translate(540, 1385); g.scale(s, s); text(v + "%", 0, 0, 132, B, 700, "center", K, 22); });
      }
      g.restore();
    }

    // beda
    heading(t, T.beda, T.jadi - 0.3, ["YANG BEDA?"], 330, 110);
    if (t >= T.beda && t < T.jadi) {
      const out = prog(t, T.jadi - 0.3, 0.25);
      g.save(); g.globalAlpha = 1 - out;
      for (const [i, x] of [[0, 375], [1, 705]].entries()) pop(t, T.beda + 0.25 + i * 0.12, (s) => { g.translate(x[1], 740); g.scale(s, s); text("≠", 0, 0, 120, B, 700, "center", K, 18); });
      const prod = [["Untung Bersama", "Sejahtera"], ["Lotus Lingga P.", "& Archi Group"], ["Hartadinata", "Abadi"]];
      prod.forEach((ln, i) => pop(t, T.produsen + i * 0.12, (s) => {
        g.translate(540 + (i - 1) * 330, 1060); g.scale(s, s);
        rrect(-150, -62, 300, 124, 26, K, B, 4);
        text(ln[0], 0, -20, 30, B, 700); text(ln[1], 0, 22, 30, B, 700);
      }));
      pop(t, T.produsen, (s) => { g.translate(540, 1185); g.scale(s, s); pill("PRODUSEN", 0, 0, 40, B, K); });
      pop(t, T.tempat, (s) => { g.translate(540, 1300); g.scale(s, s); pill("TEMPAT PRODUKSI", 0, 0, 40, B, K); });
      g.restore();
    }

    // likuid
    if (t >= T.jadi && t < T.pilih) {
      const out = prog(t, T.pilih - 0.3, 0.25);
      g.save(); g.globalAlpha = 1 - out;
      pop(t, T.jadi + 0.1, (s) => {
        g.translate(540, 1010); g.scale(s, s);
        rrect(-430, -330, 860, 660, 44, K, B, 6);
      }, 0.45);
      heading(t, T.likuid, 999, ["SAMA-SAMA", "ASET LIKUID?"], 770, 70);
      const rows = [[T.murni, "Emas murni", true], [T.dijual, "Bisa dijual kembali", true], [T.harga, "Harga jual kembali", false], [T.menerima, "Tempat yang menerima", false]];
      rows.forEach(([t0, s0, ok], i) => {
        if (t < t0) return;
        const y = 960 + i * 92, p = prog(t, t0, 0.5);
        (ok ? check : approx)(-340 + 540, y, 32, p);
        g.save(); g.globalAlpha *= clamp(p * 3); text(s0, 540 - 285, y + 2, 46, B, 700, "left"); g.restore();
      });
      pop(t, T.berbeda, (s) => { g.translate(540, 1300); g.scale(s, s); pill("BISA BEDA DI TIAP MEREK", 0, 0, 38, A, K); });
      g.restore();
    }

    // pilih
    heading(t, T.pilih, 999, ["KAMU PILIH", "YANG MANA?"], 300, 104);
    if (t >= T.pilih) {
      ORDER.forEach((id, i) => pop(t, T.pilih + 0.35 + i * 0.12, (s) => {
        const b = Math.sin((t - T.pilih) * 5 - i * 0.9) * 8;
        g.translate(540 + (i - 1) * 315, 1105 + b); g.scale(s, s);
        g.fillStyle = B; g.beginPath(); g.arc(0, 0, 50, 0, Math.PI * 2); g.fill();
        g.strokeStyle = K; g.lineWidth = 6; g.stroke();
        text(String(i + 1), 0, 4, 58, K, 700);
      }));
      pop(t, T.komen, (s) => {
        g.translate(540, 1255); g.scale(s, s);
        const w = tw("KOMEN DI BAWAH", 50) + 90;
        rrect(-w / 2, -55, w, 110, 30, B);
        g.fillStyle = B; g.beginPath(); g.moveTo(-30, 50); g.lineTo(0, 92); g.lineTo(30, 50); g.fill();
        text("KOMEN DI BAWAH", 0, 3, 50, K, 700);
      });
    }
  }

  // ---- Teks bawah per frasa ----
  const capWords = words.map((w) => ({ ...w, t0: V(w.start), t1: V(w.end) }));
  const chunks = []; let cur = [];
  capWords.forEach((w, i) => {
    cur.push(w);
    const next = capWords[i + 1];
    const len = cur.map((x) => x.text).join(" ").length;
    if (!next || /[,.?]$/.test(w.text) || next.t0 - w.t1 > 0.15 || len > 18) { chunks.push(cur); cur = []; }
  });
  function caption(t) {
    let ch = null;
    for (let i = 0; i < chunks.length; i++) {
      const c = chunks[i], next = chunks[i + 1];
      const end = next ? Math.min(next[0].t0, c[c.length - 1].t1 + 0.6) : c[c.length - 1].t1 + 0.6;
      if (t >= c[0].t0 && t < end) ch = c;
    }
    if (!ch || t > T.akhir + 0.6) return;
    const size = 54, sp = tw(" ", size);
    const ws = ch.map((w) => w.text.replace(/[,.?]$/, ""));
    const widths = ws.map((s) => tw(s, size));
    let x = 540 - (widths.reduce((a, b) => a + b, 0) + sp * (ws.length - 1)) / 2;
    const a = eOut(prog(t, ch[0].t0, 0.15)), y = 1500 + (1 - a) * 16;
    g.save(); g.globalAlpha = a;
    ch.forEach((w, i) => {
      const on = t >= w.t0 && t < (ch[i + 1] ? ch[i + 1].t0 : 1e9);
      if (on) rrect(x - 14, y - 40, widths[i] + 28, 80, 18, B);
      text(ws[i], x, y + 2, size, on ? K : B, 700, "left", on ? null : K, 12);
      x += widths[i] + sp;
    });
    g.restore();
  }
  function disclaimer(t) {
    if (t < T.pilih + 0.4) return;
    g.save(); g.globalAlpha = eOut(prog(t, T.pilih + 0.4, 0.4));
    text(data.disclaimer, 540, 1590, 26, B, 500);
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
  for (const t of [T.banyak, T.pUbs - 0.15, T.pLotus - 0.15, T.pEmasku - 0.15, T.sama - 0.15, T.beda - 0.12, T.jadi - 0.1, T.pilih - 0.12]) cues.push({ type: "whoosh", t: t - wl, tetap: true });
  const pops = [T.ubs, T.lotus, T.emasku, T.namaUbs, T.namaLotus, T.namaEmasku, T.kadar, T.persen, T.produsen, T.tempat, T.murni, T.dijual, T.harga, T.menerima, T.berbeda, T.komen,
    ...[0, 1, 2].map((i) => T.pilih + 0.35 + i * 0.12)];
  for (const t of pops) cues.push({ type: "pop", t });
  cues.sort((a, b) => a.t - b.t);
  // jarak SFX minimal: pop digeser maju, whoosh tetap
  const shifted = [];
  for (let i = 1; i < cues.length; i++) {
    const gap = tokens.audio.jedaSfxMin, prev = cues[i - 1].t;
    if (cues[i].t - prev < gap - 1e-6 && !cues[i].tetap) { const from = cues[i].t; cues[i].t = prev + gap; shifted.push([from, cues[i].t]); }
    cues.sort((a, b) => a.t - b.t);
  }
  let wn = 0; cues.forEach((c) => (c.file = c.type === "whoosh" ? `whoosh-${(wn++ % 2) + 1}` : "pop"));

  window.renderAt = (t) => {
    g.clearRect(0, 0, W, H);
    drawCards(t);
    scenes(t);
    caption(t);
    disclaimer(t);
    const f = eInOut(prog(t, PN.crossFade[0], PN.crossFade[1] - PN.crossFade[0]));
    if (f > 0) { g.fillStyle = M; g.globalAlpha = f; g.fillRect(0, 0, W, H); g.globalAlpha = 1; }
    wrap.style.visibility = f >= 1 ? "hidden" : "visible";
    if (t >= PN.outroMulai) { outroCanvas.style.display = "block"; renderOutro(t - PN.outroMulai, { background: true }); }
    else outroCanvas.style.display = "none";
  };
  window.__meta = { id: data.id, fps: tokens.frame.fps, duration, lead, audio: data.audio, T, cues: cues.map(({ type, t, file }) => ({ type, t, file })), shifted, outro: { mulai: PN.outroMulai } };
  window.renderAt(0);
  window.__ready = true;
}
