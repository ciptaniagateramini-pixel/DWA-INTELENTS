// Mesin template bb gold Flat Motion.
// Semua waktu animasi dihitung dari timestamp kata narasi; renderAt(t) deterministik per frame.

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, p) => a + (b - a) * p;

export const ease = {
  out: (p) => 1 - Math.pow(1 - p, 3),
  outExpo: (p) => (p >= 1 ? 1 : 1 - Math.pow(2, -10 * p)),
  inOut: (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2),
};

const norm = (s) => s.toLowerCase().replace(/[^a-z0-9\-]/g, "").replace(/^-+|-+$/g, "");

// Gerak masuk/keluar. Tidak ada pantulan: semua kurva monoton.
const KINDS = {
  rise: { dur: 0.4, e: ease.out, f: (p, st) => { st.o *= p; st.y += (1 - p) * 48; st.s *= 0.96 + 0.04 * p; } },
  pop: { dur: 0.4, e: ease.outExpo, f: (p, st) => { st.o *= p; st.y += (1 - p) * 28; st.s *= 0.9 + 0.1 * p; } },
  fade: { dur: 0.35, e: ease.out, f: (p, st) => { st.o *= p; } },
  out: { dur: 0.3, e: ease.inOut, f: (p, st) => { st.o *= 1 - p; st.y -= 36 * p; } },
  fadeOut: { dur: 0.3, e: ease.inOut, f: (p, st) => { st.o *= 1 - p; } },
  draw: { dur: 0.5, e: ease.out, f: (p, st) => { st.sx *= p; } },
};

export async function boot(dataPath, opts = {}) {
  const tokens = await (await fetch("/tokens.json")).json();
  const data = await (await fetch("/" + dataPath)).json();
  const words = (await (await fetch("/" + data.words)).json()).words;

  const root = document.documentElement.style;
  const c = tokens.color;
  root.setProperty("--biru", c.biru);
  root.setProperty("--mustard", c.mustard);
  root.setProperty("--mustard-muda", c.mustardMuda);
  root.setProperty("--krem", c.krem);
  root.setProperty("--abu-biru", c.abuBiru);
  root.setProperty("--kata-kunci", tokens.size.kataKunci + "px");
  root.setProperty("--judul", tokens.size.judul + "px");
  root.setProperty("--pendukung", tokens.size.pendukung + "px");
  root.setProperty("--label", tokens.size.label + "px");
  root.setProperty("--label-spacing", tokens.letterSpacing.label);
  root.setProperty("--safe-left", tokens.safe.left + "px");
  root.setProperty("--safe-right", tokens.safe.right + "px");
  await Promise.all(["700 10px Poppins", "italic 700 10px Poppins", "500 10px Poppins", "300 10px Poppins"].map((f) => document.fonts.load(f)));
  await document.fonts.ready;

  const D = tokens.duration;
  const lead = D.jedaAwal;
  const world = document.getElementById("world");
  const overlay = document.getElementById("overlay");
  const camEl = document.getElementById("camera");
  const S = tokens.safe, F = tokens.frame;
  const center = { x: (S.left + F.width - S.right) / 2, y: (S.top + F.height - S.bottom) / 2 };

  const tracks = [];   // {el, t0, kind, dur}
  const updaters = []; // fungsi tambahan per adegan
  const cues = [];     // {type, t}
  const focusEvents = []; // {el, t}

  const ctx = {
    tokens, data, words, center, ease, clamp, lerp,
    // Waktu video dari referensi kata: {w, n, at: "start"|"end", offset}
    t(ref) {
      if (typeof ref === "number") return ref + lead;
      const hits = words.filter((w) => norm(w.text) === norm(ref.w));
      const hit = hits[ref.n || 0];
      if (!hit) throw new Error(`Kata tidak ditemukan di timestamp: ${ref.w} #${ref.n || 0}`);
      return (ref.at === "end" ? hit.end : hit.start) + (ref.offset || 0) + lead;
    },
    el(tag, cls, text, parent, style) {
      const e = document.createElement(tag);
      if (cls) e.className = cls;
      if (text != null) e.textContent = text;
      if (style) Object.assign(e.style, style);
      if (parent) parent.appendChild(e);
      return e;
    },
    animate(el, t0, kind, dur) {
      tracks.push({ el, t0, kind, dur: dur ?? KINDS[kind].dur });
    },
    pop(t) { cues.push({ type: "pop", t }); },
    whoosh(t) { cues.push({ type: "whoosh", t }); },
    // Kamera ke kata kunci; whoosh mulai lebih awal dari gerakan kamera.
    focus(el, t) {
      focusEvents.push({ el, t });
      cues.push({ type: "whoosh", t: t - tokens.audio.whooshLead });
    },
    onUpdate(fn) { updaters.push(fn); },
    world, overlay,
  };

  if (opts.cover) {
    const mod = await import("/scenes/cover.js");
    mod.build(ctx, data.cover, overlay);
    if (opts.grid) drawCropGrid(ctx, tokens);
    window.__ready = true;
    return;
  }

  (await import("/scenes/_shared.js")).decor(ctx, world);

  // Bangun adegan
  const scenes = data.scenes.map((s) => ({ ...s, t0: ctx.t(s.start) }));
  for (let i = 0; i < scenes.length; i++) {
    const s = scenes[i];
    const next = scenes[i + 1];
    s.t1 = next ? next.t0 : s.t0 + (s.durasi || 3);
    const host = s.type === "outro" ? overlay : world;
    const box = ctx.el("div", "scene", null, host);
    s.box = box;
    const mod = await import(`/scenes/${s.type}.js`);
    mod.build(ctx, s, box);
    // Adegan berikutnya masuk, adegan ini keluar (outro menutup layar sendiri)
    if (next && next.type !== "outro") ctx.animate(box, s.t1 - KINDS.out.dur, "out");
  }
  const duration = scenes[scenes.length - 1].t1;

  // Kamera virtual: titik fokus p dan skala s, identitas = pusat zona aman dengan s=1
  const IDENT = { s: 1, x: center.x, y: center.y };
  const offsetCenter = (el) => {
    let x = el.offsetWidth / 2, y = el.offsetHeight / 2, n = el;
    while (n && n !== world) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; }
    return { x, y };
  };
  focusEvents.sort((a, b) => a.t - b.t);
  const segs = [];
  focusEvents.forEach((ev, i) => {
    const p = offsetCenter(ev.el);
    segs.push({ t0: ev.t, dur: D.kameraMaju, to: { s: D.zoom, x: p.x, y: p.y }, e: ease.out });
    const back = ev.t + D.kameraMaju + D.kameraTahan;
    const nxt = focusEvents[i + 1];
    if (!nxt || nxt.t >= back) segs.push({ t0: back, dur: D.kameraKembali, to: IDENT, e: ease.inOut });
  });
  const camAt = (t, upto = segs.length) => {
    let seg = null;
    for (let i = 0; i < upto; i++) if (segs[i].t0 <= t) seg = segs[i];
    if (!seg) return IDENT;
    const p = seg.e(clamp((t - seg.t0) / seg.dur));
    return { s: lerp(seg.from.s, seg.to.s, p), x: lerp(seg.from.x, seg.to.x, p), y: lerp(seg.from.y, seg.to.y, p) };
  };
  segs.forEach((sg, i) => { sg.from = camAt(sg.t0, i); });

  // Validasi SFX: jeda minimal antar SFX
  cues.sort((a, b) => a.t - b.t);
  const warnings = [];
  for (let i = 1; i < cues.length; i++) {
    const gap = cues[i].t - cues[i - 1].t;
    if (gap < tokens.audio.jedaSfxMin - 1e-6) warnings.push(`SFX terlalu rapat (${gap.toFixed(2)} s) di ${cues[i].t.toFixed(2)} s`);
  }
  let w = 0;
  cues.forEach((cu) => { if (cu.type === "whoosh") cu.file = `whoosh-${(w++ % 2) + 1}`; else cu.file = "pop"; });

  const byEl = new Map();
  tracks.forEach((tr) => { if (!byEl.has(tr.el)) byEl.set(tr.el, []); byEl.get(tr.el).push(tr); });
  byEl.forEach((list) => list.sort((a, b) => a.t0 - b.t0));

  window.renderAt = (t) => {
    for (const s of scenes) s.box.style.visibility = t >= s.t0 - 0.6 && t <= s.t1 + 0.05 ? "visible" : "hidden";
    byEl.forEach((list, el) => {
      const st = { o: 1, y: 0, s: 1, sx: 1 };
      for (const tr of list) {
        const K = KINDS[tr.kind];
        const isIn = !["out", "fadeOut"].includes(tr.kind);
        if (t < tr.t0) { if (isIn) K.f(0, st); continue; }
        K.f(K.e(clamp((t - tr.t0) / tr.dur)), st);
      }
      el.style.opacity = st.o.toFixed(4);
      el.style.transform = `translateY(${st.y.toFixed(2)}px) scale(${st.s.toFixed(4)})` + (st.sx !== 1 ? ` scaleX(${st.sx.toFixed(4)})` : "");
    });
    updaters.forEach((fn) => fn(t));
    const cam = camAt(t);
    camEl.style.transform = `translate(${(center.x - cam.s * cam.x).toFixed(2)}px, ${(center.y - cam.s * cam.y).toFixed(2)}px) scale(${cam.s.toFixed(4)})`;
  };

  window.__meta = {
    id: data.id, fps: F.fps, width: F.width, height: F.height, duration, lead,
    audio: data.audio, cues, warnings,
    camera: segs.map(({ t0, dur, to }) => ({ t0: +t0.toFixed(3), dur, to: { s: to.s, x: Math.round(to.x), y: Math.round(to.y) } })),
    scenes: scenes.map((s) => ({ type: s.type, t0: +s.t0.toFixed(3), t1: +s.t1.toFixed(3) })),
  };
  window.renderAt(0);
  window.__ready = true;
}

// Kotak crop grid profil 3:4 di tengah untuk mengecek cover
function drawCropGrid(ctx, tokens) {
  const { width, height } = tokens.crop34;
  const g = ctx.el("div", null, null, ctx.overlay, {
    position: "absolute", width: width + "px", height: height + "px",
    left: (1080 - width) / 2 + "px", top: (1920 - height) / 2 + "px",
    outline: `4px dashed ${tokens.color.biru}`,
  });
  ctx.el("div", "label", "Crop 3:4", g, { position: "absolute", top: "-48px", left: "0", color: tokens.color.biru });
}
