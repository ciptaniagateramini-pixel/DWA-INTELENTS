// Template "kanvas zig-zag" bb gold: satu kanvas mustard besar, adegan tersusun zig-zag,
// garis krem menghubungkan adegan, kamera punch-in lalu zoom-out per kalimat, outro logo.
// renderAt(t) deterministik; semua waktu dari timestamp narasi + jeda awal.
import { loadLogo, prepareText, OPT as LOGO_OPT } from "/logo-outro/logo.js";
import { makeRenderer } from "/logo-outro/blur.js";

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, p) => a + (b - a) * p;
const prog = (t, a, d) => clamp((t - a) / d);
const ease = {
  out: (p) => 1 - Math.pow(1 - p, 3),
  outExpo: (p) => (p >= 1 ? 1 : 1 - Math.pow(2, -10 * p)),
  inOut: (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2),
};
const NS = "http://www.w3.org/2000/svg";
const W = 1080, H = 1920, CX = 540, CY = 960;

export async function boot(dataPath) {
  const tokens = await (await fetch("/tokens.json")).json();
  const data = await (await fetch("/" + dataPath)).json();
  const C = tokens.color;
  const lead = data.jedaAwal;
  const V = (narr) => narr + lead; // waktu narasi -> waktu video

  await Promise.all(["Poppins-Bold"].map(async (n) => {
    const f = new FontFace("Poppins", `url(/assets/fonts/${n}.woff2)`, { weight: "700" });
    document.fonts.add(await f.load());
  }));

  const stage = document.getElementById("stage");
  const world = document.getElementById("world");
  const hud = document.getElementById("hud");
  const fade = document.getElementById("fade");
  const outroCanvas = document.getElementById("outro");
  stage.style.background = C.mustard;
  fade.style.background = C.mustard;

  // ---- Tata letak zig-zag ----
  const Z = data.zigzag;
  const rad = (d) => (d * Math.PI) / 180;
  const dirDown = (right) => [Math.cos(rad(right ? Z.sudut : 180 - Z.sudut)), Math.sin(rad(right ? Z.sudut : 180 - Z.sudut))];
  const centers = [Z.start];
  for (let k = 1; k < data.kalimat.length; k++) {
    const d = dirDown(k % 2 === 1);
    const p = centers[k - 1];
    centers.push([p[0] + d[0] * Z.langkah, p[1] + d[1] * Z.langkah]);
  }
  // Titik garis: masuk dari kanan atas, belok ~60 derajat di tiap adegan, keluar setelah adegan terakhir
  const dIn = dirDown(false);
  const pts = [[centers[0][0] - dIn[0] * 900, centers[0][1] - dIn[1] * 900], ...centers];
  const dOut = dirDown(data.kalimat.length % 2 === 1);
  const last = centers[centers.length - 1];
  pts.push([last[0] + dOut[0] * 700, last[1] + dOut[1] * 700]);
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [a, v, b] = [pts[i - 1], pts[i], pts[i + 1]];
    const u1 = norm([v[0] - a[0], v[1] - a[1]]), u2 = norm([b[0] - v[0], b[1] - v[1]]);
    const r = Z.radiusTikungan;
    d += ` L ${v[0] - u1[0] * r} ${v[1] - u1[1] * r} Q ${v[0]} ${v[1]} ${v[0] + u2[0] * r} ${v[1] + u2[1] * r}`;
  }
  d += ` L ${pts[pts.length - 1][0]} ${pts[pts.length - 1][1]}`;

  // Batas dunia untuk grid dan zoom out besar
  const xs = centers.map((c) => c[0]), ys = centers.map((c) => c[1]);
  const box = { x0: Math.min(...xs) - 560, x1: Math.max(...xs) + 560, y0: Math.min(...ys) - 760, y1: Math.max(...ys) + 700 };
  const big = { x0: box.x0 - 3000, y0: box.y0 - 3000, x1: box.x1 + 3000, y1: box.y1 + 3000 };

  // ---- Lapisan: grid, garis, adegan ----
  const svgEl = (tag, attrs, parent) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  };
  const gridSvg = svgEl("svg", { width: big.x1 - big.x0, height: big.y1 - big.y0, viewBox: `${big.x0} ${big.y0} ${big.x1 - big.x0} ${big.y1 - big.y0}` }, world);
  Object.assign(gridSvg.style, { position: "absolute", left: big.x0 + "px", top: big.y0 + "px", overflow: "visible" });
  const G = tokens.grid;
  const pat = svgEl("pattern", { id: "grid", width: G.sel, height: G.sel, patternUnits: "userSpaceOnUse", x: 0, y: 0 }, svgEl("defs", {}, gridSvg));
  svgEl("path", { d: `M ${G.sel} 0 L 0 0 0 ${G.sel}`, fill: "none", stroke: C.biru, "stroke-width": G.garis }, pat);
  const gridRect = svgEl("rect", { x: big.x0, y: big.y0, width: big.x1 - big.x0, height: big.y1 - big.y0, fill: "url(#grid)" }, gridSvg);

  const lineSvg = svgEl("svg", { width: big.x1 - big.x0, height: big.y1 - big.y0, viewBox: `${big.x0} ${big.y0} ${big.x1 - big.x0} ${big.y1 - big.y0}` }, world);
  Object.assign(lineSvg.style, { position: "absolute", left: big.x0 + "px", top: big.y0 + "px", overflow: "visible" });
  const path = svgEl("path", { d, fill: "none", stroke: C.krem, "stroke-width": Z.lebarGaris, "stroke-linecap": "round", "stroke-linejoin": "round" }, lineSvg);
  const total = path.getTotalLength();
  path.setAttribute("stroke-dasharray", `${total} ${total}`);
  const nearestLen = (p) => {
    let best = 0, bd = Infinity;
    for (let l = 0; l <= total; l += 4) {
      const q = path.getPointAtLength(l);
      const dd = (q.x - p[0]) ** 2 + (q.y - p[1]) ** 2;
      if (dd < bd) { bd = dd; best = l; }
    }
    return best;
  };
  const Lc = centers.map(nearestLen);
  const at = (l) => { const q = path.getPointAtLength(clamp(l, 0, total)); return [q.x, q.y]; };

  // ---- Aset & SFX ----
  const svgCache = {};
  const loadSvg = async (name) => (svgCache[name] ??= await (await fetch(`/${data.assetDir}/${name}.svg`)).text());
  const cues = [];
  const anims = []; // {el, kind, t, ...}
  const scenes = [];
  const K = data.kamera;
  const sentenceStarts = data.kalimat.map((k) => V(k.mulai));

  for (let i = 0; i < data.kalimat.length; i++) {
    const k = data.kalimat[i];
    const box = el("div", "scene", world, { position: "absolute", left: centers[i][0] + "px", top: centers[i][1] + "px", width: "0", height: "0" });
    scenes.push({ box, k });
    const T = sentenceStarts[i];
    cues.push({ type: "whoosh", t: T - tokens.audio.whooshLead, fixed: true });
    for (const st of k.langkah || []) cues.push({ type: "whoosh", t: V(st.t) - tokens.audio.whooshLead, fixed: true });
    for (const a of k.aset) {
      const node = await placeSvg(box, await loadSvg(a.file), a.x, a.y, a.s);
      a.el = node;
      const ev = { type: "pop", t: V(a.t), asset: a, silent: !!a.latar };
      if (!ev.silent) cues.push(ev);
      a.ev = ev;
      if (a.keluar != null) anims.push({ el: node, kind: "keluar", t: V(a.keluar), dur: 0.45 });
    }
    for (const kw of k.kunci || []) {
      const node = el("div", null, box, {
        position: "absolute", left: kw.x + "px", top: kw.y + "px", transform: "translate(-50%,-50%)",
        font: `700 ${kw.size}px Poppins`, color: C.biru, textAlign: "center", lineHeight: "1.02", whiteSpace: "nowrap",
      });
      kw.teks.split("|").forEach((line) => el("div", null, node, {}).textContent = line);
      const inner = el("div", null, null, {});
      while (node.firstChild) inner.appendChild(node.firstChild);
      node.appendChild(inner);
      anims.push({ el: inner, kind: "rise", t: V(kw.t), dur: 0.4 });
    }
    if (i < data.kalimat.length - 1) anims.push({ el: box, kind: "redup", t: sentenceStarts[i + 1], dur: K.redupDurasi, to: K.redup });
  }

  const P = data.penutup;
  for (const c of P.kartu) {
    const node = await placeSvg(hud, await loadSvg(c.file), c.x, c.y, c.s);
    const ev = { type: "pop", t: c.t, card: node };
    cues.push(ev);
    c.ev = ev; c.el = node;
    anims.push({ el: node, kind: "keluar-fade", t: P.kartuSelesai, dur: 0.3 });
  }
  cues.push({ type: "whoosh", t: P.zoomOut[0] - tokens.audio.whooshLead, fixed: true });

  // Jeda minimal antar SFX: whoosh tetap, pop digeser (beserta kemunculan visualnya)
  cues.sort((a, b) => a.t - b.t);
  const shifted = [];
  for (let i = 1; i < cues.length; i++) {
    const gap = tokens.audio.jedaSfxMin;
    if (cues[i].t - cues[i - 1].t < gap - 1e-6) {
      if (!cues[i].fixed) { const old = cues[i].t; cues[i].t = cues[i - 1].t + gap; shifted.push([old, cues[i].t]); }
      else if (!cues[i - 1].fixed) { /* pop sebelum whoosh: biarkan, sudah lebih awal */ }
    }
  }
  cues.sort((a, b) => a.t - b.t);
  data.kalimat.forEach((k) => k.aset.forEach((a) => anims.push({ el: a.el, kind: a.latar ? "fade" : (a.masuk || "pop"), t: a.ev.t, dur: a.latar ? 0.5 : a.masuk === "naik" ? 0.6 : 0.4 })));
  P.kartu.forEach((c) => anims.push({ el: c.el, kind: "pop", t: c.ev.t, dur: 0.4 }));
  let wn = 0;
  cues.forEach((c) => (c.file = c.type === "whoosh" ? `whoosh-${(wn++ % 2) + 1}` : "pop"));

  // ---- Kamera ----
  const sceneOf = (i) => ({ x: centers[i][0], y: centers[i][1], s: K.overview, L: Lc[i] });
  const focusPos = (i) => {
    const k = data.kalimat[i], a = k.aset.find((x) => x.id === k.fokus), o = k.fokusOffset || [0, 0];
    return [centers[i][0] + a.x + o[0], centers[i][1] + a.y + o[1]];
  };
  const fitAll = Math.min(W / (box.x1 - box.x0), (H - 200) / (box.y1 - box.y0));
  const allView = { x: (box.x0 + box.x1) / 2, y: (box.y0 + box.y1) / 2, s: fitAll };
  const startL = Lc[0] - 520;
  const startView = { ...pt(at(startL)), s: 1.2, L: startL };

  function camera(t) {
    let prev = startView;
    for (let i = 0; i < sentenceStarts.length; i++) {
      const T = sentenceStarts[i];
      const next = i + 1 < sentenceStarts.length ? sentenceStarts[i + 1] : Infinity;
      if (t < T) return prev;
      const f = focusPos(i), sc = sceneOf(i);
      if (t < T + K.punch) {
        // Punch in: bergerak menyusuri garis menuju adegan, sambil masuk ke titik awal
        const p = ease.out(prog(t, T, K.punch));
        const L = lerp(prev.L, sc.L, p);
        const q = at(L);
        const off = [(f[0] - sc.x) * p, (f[1] - sc.y) * p];
        return { x: q[0] + off[0], y: q[1] + off[1], s: lerp(prev.s, K.punchSkala, p), L };
      }
      // Setelah itu hanya zoom out sampai semua aset kalimat terlihat
      let cur;
      const steps = data.kalimat[i].langkah;
      if (!steps) {
        const p = ease.inOut(prog(t, T + K.punch, K.zoomOut));
        cur = { x: lerp(f[0], sc.x, p), y: lerp(f[1], sc.y, p), s: lerp(K.punchSkala, sc.s, p), L: sc.L };
      } else {
        // Langkah kamera tambahan dalam satu kalimat (geser ke aset lain, zoom ke detail, atau zoom out)
        cur = { x: f[0], y: f[1], s: K.punchSkala, L: sc.L };
        for (const st of steps) {
          const t0 = V(st.t);
          if (t < t0) break;
          let tx, ty, ts, dur, e;
          if (st.ke === "overview") { tx = sc.x; ty = sc.y; ts = sc.s; dur = K.zoomOut; e = ease.inOut; }
          else {
            const a = data.kalimat[i].aset.find((x) => x.id === st.ke), o = st.offset || [0, 0];
            tx = sc.x + a.x + o[0]; ty = sc.y + a.y + o[1]; ts = st.s ?? cur.s; dur = st.dur ?? 0.45; e = ease.out;
          }
          const p = e(prog(t, t0, dur));
          cur = { x: lerp(cur.x, tx, p), y: lerp(cur.y, ty, p), s: lerp(cur.s, ts, p), L: sc.L };
        }
      }
      if (t < next) {
        if (i === sentenceStarts.length - 1 && t >= P.zoomOut[0]) {
          const z = ease.outExpo(prog(t, P.zoomOut[0], P.zoomOut[1] - P.zoomOut[0])); // cepat lalu mengendap, supaya gambar utuh sempat terlihat
          return { x: lerp(cur.x, allView.x, z), y: lerp(cur.y, allView.y, z), s: lerp(cur.s, allView.s, z), L: sc.L, zoom: z };
        }
        return cur;
      }
      prev = cur;
    }
    return prev;
  }

  // ---- Outro ----
  LOGO_OPT.spinDeg = P.outroPutaran;
  await loadLogo("/assets/logo/bb-gold-profil-ring-mustard.svg");
  prepareText(outroCanvas.getContext("2d"));
  const renderOutro = makeRenderer(outroCanvas);
  const duration = P.outroMulai + 3.6;

  const byEl = new Map();
  anims.forEach((a) => { if (!byEl.has(a.el)) byEl.set(a.el, []); byEl.get(a.el).push(a); });

  window.renderAt = (t) => {
    const cam = camera(t);
    world.style.transform = `translate(${(CX - cam.s * cam.x).toFixed(2)}px, ${(CY - cam.s * cam.y).toFixed(2)}px) scale(${cam.s.toFixed(5)})`;
    // Garis digambar bertahap mengikuti kamera
    const drawn = clamp(cam.L + Z.garisMendahului + (cam.zoom || 0) * total, 0, total);
    path.setAttribute("stroke-dashoffset", (total - drawn).toFixed(1));
    // Grid tetap samar saat zoom out
    const g = cam.s >= 1 ? G.opacity : lerp(G.opacityMin, G.opacity, clamp((cam.s - fitAll) / (1 - fitAll)));
    gridRect.setAttribute("opacity", g.toFixed(3));

    byEl.forEach((list, node) => {
      let o = 1, s = 1, y = 0, x = 0;
      for (const a of list) {
        const p = prog(t, a.t, a.dur);
        if (a.kind === "pop") { if (t < a.t) o = 0; else { const e = ease.outExpo(p); o *= e; s *= 0.7 + 0.3 * e; y += (1 - e) * 24; } }
        else if (a.kind === "naik") { if (t < a.t) o = 0; else { const e = ease.out(p); o *= Math.min(1, p * 4); y += (1 - e) * 240; } }
        else if (a.kind === "fade") { o *= t < a.t ? 0 : ease.out(p); }
        else if (a.kind === "rise") { if (t < a.t) o = 0; else { const e = ease.out(p); o *= e; y += (1 - e) * 40; } }
        else if (a.kind === "keluar") { const e = ease.inOut(p); o *= 1 - e; x -= 260 * e; }
        else if (a.kind === "keluar-fade") { o *= 1 - ease.inOut(p); }
        else if (a.kind === "redup") { o *= lerp(1, a.to, ease.inOut(p)); }
      }
      node.style.opacity = o.toFixed(3);
      if (!node.classList.contains("scene")) node.style.transform = (node.dataset.base || "") + ` translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${s.toFixed(4)})`;
    });

    fade.style.opacity = ease.inOut(prog(t, P.crossFade[0], P.crossFade[1] - P.crossFade[0])).toFixed(3);
    if (t >= P.outroMulai) { outroCanvas.style.display = "block"; renderOutro(t - P.outroMulai, { background: true }); }
    else outroCanvas.style.display = "none";
  };

  window.__meta = {
    id: data.id, fps: tokens.frame.fps, duration, lead, audio: data.audio, cues: cues.map(({ type, t, file }) => ({ type, t: +t.toFixed(3), file })), shifted,
    outro: { mulai: P.outroMulai },
    sentences: sentenceStarts,
  };
  window.renderAt(0);
  window.__ready = true;

  function el(tag, cls, parent, style) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (style) Object.assign(e.style, style);
    if (parent) parent.appendChild(e);
    return e;
  }
  async function placeSvg(parent, text, x, y, s) {
    const holder = el("div", null, parent, { position: "absolute", left: x + "px", top: y + "px" });
    holder.innerHTML = text;
    const sv = holder.querySelector("svg");
    const w = +sv.getAttribute("width"), h = +sv.getAttribute("height");
    sv.setAttribute("width", w * s); sv.setAttribute("height", h * s);
    sv.style.display = "block";
    holder.dataset.base = `translate(${(-w * s / 2).toFixed(1)}px, ${(-h * s / 2).toFixed(1)}px)`;
    holder.style.transformOrigin = `${w * s / 2}px ${h * s / 2}px`;
    return holder;
  }
  function norm(v) { const l = Math.hypot(v[0], v[1]); return [v[0] / l, v[1] / l]; }
  function pt(p) { return { x: p[0], y: p[1] }; }
}
