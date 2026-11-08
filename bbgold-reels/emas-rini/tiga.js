// Gaya F "dunia 3D": three.js (WebGL) di atas kanvas mustard + grid. Kamera berjalan menyusuri lima area:
// beli (kartu Waris + label harga), lupa (lemari usang + kalender), butuh (laptop, lemari terbuka),
// jual (pin Jakarta + toko + label buyback resmi), banding (alas UANG vs EMAS + laptop), penutup.
// Semua label adalah pelat 3D bertekstur teks; hanya teks transkrip kecil di bawah yang 2D.
// renderAt(t) deterministik (semua gerak fungsi waktu video).
import * as THREE from "three";
import { loadLogo, prepareText, OPT as LOGO_OPT } from "/logo-outro/logo.js";
import { makeRenderer } from "/logo-outro/blur.js";

const W = 1080, H = 1920;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, p) => a + (b - a) * p;
const prog = (t, a, d) => clamp((t - a) / d);
const eOut = (p) => 1 - Math.pow(1 - p, 3);
const eInOut = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
const eBack = (p) => { const c = 1.7; return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2); };
const rnd = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

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
  const kata = (s, n = 0) => {
    const hits = words.filter((w) => w.text.replace(/[,.?:!]/g, "").toLowerCase() === s.toLowerCase());
    if (!hits[n]) throw new Error("kata tidak ada di naskah: " + s + " #" + n);
    return V(hits[n].start);
  };
  const T = {
    mulai: V(0), mei: kata("Mei"), harga: kata("Harganya"), lalu: kata("Lalu"), tersimpan: kata("Tersimpan"),
    tujuh: kata("Tujuh"), anak: kata("anaknya"), laptop: kata("laptop"), eh: kata("Eh"), ketemu: kata("ketemu"),
    dijual: kata("Dijual"), buyback: kata("buyback"), seratus: kata("seratus"), coba: kata("Coba"), kalau: kata("Kalau"),
    empat: kata("empat", 1), karena: kata("Karena"), sebelas: kata("sebelas"), sisa: kata("sisa"),
    hargaEmas: kata("Harga"), kamu: kata("Kamu"), komen: kata("Komen"), akhir: V(words[words.length - 1].end),
  };

  // ---- Latar mustard + grid (2D statis) ----
  const bg = document.getElementById("bg").getContext("2d");
  bg.fillStyle = M; bg.fillRect(0, 0, W, H);
  bg.strokeStyle = B; bg.globalAlpha = tokens.grid.opacity; bg.lineWidth = tokens.grid.garis;
  for (let x = 0; x <= W; x += tokens.grid.sel) { bg.beginPath(); bg.moveTo(x + 0.5, 0); bg.lineTo(x + 0.5, H); bg.stroke(); }
  for (let y = 0; y <= H; y += tokens.grid.sel) { bg.beginPath(); bg.moveTo(0, y + 0.5); bg.lineTo(W, y + 0.5); bg.stroke(); }

  // ---- three.js ----
  const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("gl"), antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1); renderer.setSize(W, H, false); renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, W / H, 0.1, 200);
  scene.add(new THREE.HemisphereLight(0xfff6e0, 0xe5b527, 1.6));
  const sun = new THREE.DirectionalLight(0xffffff, 2.2);
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 1, far: 40 });
  sun.shadow.radius = 6; sun.shadow.bias = -0.0005;
  scene.add(sun, sun.target);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 60), new THREE.ShadowMaterial({ opacity: 0.18, color: new THREE.Color(B) }));
  ground.rotation.x = -Math.PI / 2; ground.position.y = -1.6; ground.receiveShadow = true; scene.add(ground);
  const FLOOR = -1.6;

  const col = (c) => new THREE.Color(c);
  const mat = (c, o = {}) => new THREE.MeshStandardMaterial({ color: col(c), roughness: 0.55, metalness: 0.05, ...o });
  const shadowy = (m) => { m.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); return m; };
  function rrShape(w, h, r) {
    const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
    s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r);
    s.quadraticCurveTo(x + w, y + h, x + w - r, y + h); s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s;
  }
  const slabGeo = (w, h, d, r) => { const g = new THREE.ExtrudeGeometry(rrShape(w, h, r), { depth: d, bevelEnabled: true, bevelThickness: d * 0.25, bevelSize: Math.min(r * 0.4, d * 0.4), bevelSegments: 3, curveSegments: 10 }); g.translate(0, 0, -d / 2); return g; };
  // tekstur teks (kanvas 2D, Poppins)
  function texCanvas(wPx, hPx, draw) {
    const c = document.createElement("canvas"); c.width = wPx; c.height = hPx;
    const x = c.getContext("2d"); draw(x, wPx, hPx);
    const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = 8; return tx;
  }
  function txt(x, s, cx, cy, size, color, weight = 700, align = "center") { x.font = `${weight} ${size}px Poppins`; x.textAlign = align; x.textBaseline = "middle"; x.fillStyle = color; x.fillText(s, cx, cy); }
  // pelat 3D bertulisan: lines = [[teks, ukuran, warna, berat]]
  function plate(lines, o = {}) {
    const pad = o.pad ?? 50, lh = o.lh ?? 1.25;
    const meas = document.createElement("canvas").getContext("2d");
    const wPx = Math.max(...lines.map(([s, sz, , wt = 700]) => { meas.font = `${wt} ${sz}px Poppins`; return meas.measureText(s).width; })) + pad * 2;
    const hPx = lines.reduce((a, [, sz]) => a + sz * lh, 0) + pad * 1.4;
    const unit = (o.unit ?? 0.003);
    const w = wPx * unit, h = hPx * unit;
    const g = new THREE.Group();
    const body = new THREE.Mesh(slabGeo(w, h, o.depth ?? 0.08, Math.min(w, h) * (o.round ?? 0.22)), mat(o.bg ?? K, { roughness: 0.6 }));
    g.add(body);
    const tex = texCanvas(Math.ceil(wPx * 2), Math.ceil(hPx * 2), (x, cw, ch) => {
      x.scale(2, 2);
      let y = pad * 0.7;
      for (const [s, sz, c, wt = 700] of lines) { txt(x, s, wPx / 2, y + (sz * lh) / 2, sz, c, wt); y += sz * lh; }
    });
    const face = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: 0.7 }));
    face.position.z = (o.depth ?? 0.08) / 2 + 0.025; g.add(face);
    if (o.border !== false) {
      const ring = new THREE.Mesh(new THREE.ShapeGeometry(rrShape(w + 0.05, h + 0.05, Math.min(w, h) * (o.round ?? 0.22) + 0.02)), mat(B));
      ring.position.z = -(o.depth ?? 0.08) / 2 - 0.035; g.add(ring);
    }
    return shadowy(g);
  }
  const loadTex = (src) => new Promise((res) => new THREE.TextureLoader().load(src, (t) => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; res(t); }));

  // ---- Objek ----
  const [tDepan, tBelakang] = await Promise.all([loadTex("/" + data.kartu.depan), loadTex("/" + data.kartu.belakang)]);
  function kartuWaris(s = 1) {
    const g = new THREE.Group(), w = 1.26 * s, h = 1.952 * s, d = 0.03 * s;
    g.add(new THREE.Mesh(slabGeo(w, h, d, 0.06 * s), mat("#B3121C", { roughness: 0.4 })));
    const fm = (t) => new THREE.MeshStandardMaterial({ map: t, transparent: true, alphaTest: 0.5, roughness: 0.32, metalness: 0.15 });
    const f = new THREE.Mesh(new THREE.PlaneGeometry(w, h), fm(tDepan)); f.position.z = d / 2 + 0.012 * s; g.add(f);
    const b = new THREE.Mesh(new THREE.PlaneGeometry(w, h), fm(tBelakang)); b.position.z = -d / 2 - 0.012 * s; b.rotation.y = Math.PI; g.add(b);
    return shadowy(g);
  }
  // kilau: pelat tipis tambahan yang menyapu
  const kartu = kartuWaris(1); scene.add(kartu);

  // lemari usang
  const lemari = new THREE.Group();
  const LW = 2.0, LH = 2.9, LD = 1.0, wood = A, inner = "#2a3550";
  const part = (w, h, d, x, y, z, c) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(c, { roughness: 0.85 })); m.position.set(x, y, z); lemari.add(m); return m; };
  part(LW, LH, 0.06, 0, 0, -LD / 2, inner);
  part(0.08, LH, LD, -LW / 2, 0, 0, wood); part(0.08, LH, LD, LW / 2, 0, 0, wood);
  part(LW + 0.16, 0.12, LD + 0.1, 0, LH / 2, 0, wood); part(LW + 0.16, 0.12, LD + 0.1, 0, -LH / 2, 0, wood);
  part(LW, 0.05, LD * 0.9, 0, -0.25, 0, "#3a4766");
  for (const k of [-1, 1]) { const ft = part(0.16, 0.25, 0.16, k * (LW / 2 - 0.12), -LH / 2 - 0.18, LD / 2 - 0.15, B); }
  const pintu = [];
  for (const k of [-1, 1]) {
    const pivot = new THREE.Group(); pivot.position.set(k * LW / 2, 0, LD / 2);
    const door = new THREE.Mesh(new THREE.BoxGeometry(LW / 2, LH - 0.1, 0.06), mat("#66738f", { roughness: 0.9 }));
    door.position.x = -k * LW / 4; pivot.add(door);
    const panel = new THREE.Mesh(new THREE.BoxGeometry(LW / 2 - 0.25, LH - 0.6, 0.03), mat("#55637E", { roughness: 0.9 })); panel.position.set(-k * LW / 4, 0, 0.04); pivot.add(panel);
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 12), mat(M, { metalness: 0.6, roughness: 0.3 })); knob.position.set(-k * (LW / 2 - 0.12), 0, 0.08); pivot.add(knob);
    lemari.add(pivot); pintu.push([pivot, k]);
  }
  // debu: bintik krem di atap + partikel
  for (let i = 0; i < 18; i++) { const d = new THREE.Mesh(new THREE.CircleGeometry(0.05 + rnd(i) * 0.08, 10), mat("#efe6cf", { roughness: 1 })); d.rotation.x = -Math.PI / 2; d.position.set((rnd(i + 3) - 0.5) * LW, LH / 2 + 0.065, (rnd(i + 7) - 0.5) * LD); lemari.add(d); }
  lemari.rotation.z = 0.025; shadowy(lemari); scene.add(lemari);
  const debu = [];
  for (let i = 0; i < 40; i++) { const p = new THREE.Mesh(new THREE.SphereGeometry(0.025 + rnd(i) * 0.03, 8, 6), new THREE.MeshStandardMaterial({ color: col(K), transparent: true, opacity: 0.9 })); scene.add(p); debu.push(p); }

  // kalender meja
  const kal = new THREE.Group();
  const kBody = new THREE.Mesh(slabGeo(1.1, 1.2, 0.18, 0.08), mat(K)); kal.add(kBody);
  const kTop = new THREE.Mesh(new THREE.BoxGeometry(1.14, 0.22, 0.24), mat(B)); kTop.position.y = 0.62; kal.add(kTop);
  for (const x of [-0.3, 0.3]) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.02, 8, 16), mat(M, { metalness: 0.5 })); r.position.set(x, 0.74, 0); kal.add(r); }
  const kalTex = {};
  for (const [k, bln, thn] of [["2023", "MEI", "2023"], ["2024", "", "2024"], ["2025", "", "2025"], ["2026", "7 NOV", "2026"]]) kalTex[k] = texCanvas(440, 480, (x) => { x.fillStyle = K; x.fillRect(0, 0, 440, 480); txt(x, bln || "•", 220, 130, 84, A, 700); txt(x, thn, 220, 310, 150, B, 700); });
  const kPage = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.08), new THREE.MeshStandardMaterial({ map: kalTex["2023"], roughness: 0.8 }));
  kPage.position.set(0, -0.02, 0.165); kal.add(kPage);
  const flipPivot = new THREE.Group(); flipPivot.position.set(0, 0.52, 0.175); kal.add(flipPivot);
  const flip = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.08), new THREE.MeshStandardMaterial({ map: kalTex["2023"], roughness: 0.8, side: THREE.DoubleSide }));
  flip.position.y = -0.54; flipPivot.add(flip);
  shadowy(kal); scene.add(kal);

  // laptop (prototipe, dipakai ulang)
  const layarTex = texCanvas(520, 340, (x) => { x.fillStyle = B; x.fillRect(0, 0, 520, 340); txt(x, "Rp10 juta", 260, 150, 92, M, 700); txt(x, "laptop sekolah", 260, 250, 40, K, 500); });
  const layarPolos = texCanvas(260, 170, (x) => { x.fillStyle = B; x.fillRect(0, 0, 260, 170); x.fillStyle = M; x.globalAlpha = 0.9; x.beginPath(); x.arc(130, 85, 34, 0, Math.PI * 2); x.fill(); });
  function laptop(tex) {
    const g = new THREE.Group();
    const base = new THREE.Mesh(slabGeo(1.4, 0.95, 0.06, 0.06), mat("#8a96b0", { metalness: 0.4, roughness: 0.35 })); base.rotation.x = -Math.PI / 2; g.add(base);
    const kb = new THREE.Mesh(new THREE.PlaneGeometry(1.15, 0.5), mat(A, { roughness: 0.8 })); kb.rotation.x = -Math.PI / 2; kb.position.set(0, 0.045, -0.08); g.add(kb);
    const hinge = new THREE.Group(); hinge.position.set(0, 0.04, -0.47); g.add(hinge);
    const lid = new THREE.Mesh(slabGeo(1.4, 0.95, 0.05, 0.06), mat("#8a96b0", { metalness: 0.4, roughness: 0.35 })); lid.position.y = 0.475; hinge.add(lid);
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(1.26, 0.82), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.3, emissive: col("#222"), emissiveIntensity: 0.2 })); scr.position.set(0, 0.475, 0.055); hinge.add(scr);
    g.userData.hinge = hinge;
    return shadowy(g);
  }
  const laptopBesar = laptop(layarTex); scene.add(laptopBesar);

  // toko + pin Jakarta
  const toko = new THREE.Group();
  const tb = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.0, 1.4), mat(K)); tb.position.y = 0; toko.add(tb);
  const roof = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.18, 1.6), mat(B)); roof.position.y = 1.08; toko.add(roof);
  for (let i = 0; i < 8; i++) { const aw = new THREE.Mesh(new THREE.BoxGeometry(2.7 / 8, 0.06, 0.6), mat(i % 2 ? K : M)); aw.position.set(-1.35 + (i + 0.5) * 2.7 / 8, 0.62, 0.95); aw.rotation.x = 0.35; toko.add(aw); }
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.15, 0.05), mat(A)); door.position.set(0.55, -0.42, 0.71); toko.add(door);
  const win = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.75, 0.05), mat(MM, { roughness: 0.2, metalness: 0.2 })); win.position.set(-0.55, -0.25, 0.71); toko.add(win);
  const sign = plate([["store Jakarta", 70, B]], { unit: 0.0042, depth: 0.06 }); sign.position.set(0, 1.45, 0.4); toko.add(sign);
  shadowy(toko); scene.add(toko);
  const pin = new THREE.Group();
  const pc = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.9, 32), mat(B)); pc.rotation.x = Math.PI; pc.position.y = -0.45; pin.add(pc);
  const ps = new THREE.Mesh(new THREE.SphereGeometry(0.42, 32, 24), mat(B)); pin.add(ps);
  const pd = new THREE.Mesh(new THREE.SphereGeometry(0.17, 24, 16), mat(M, { metalness: 0.4 })); pd.position.z = 0.33; pin.add(pd);
  shadowy(pin); scene.add(pin);

  // alas pembanding
  function alas() { const g = new THREE.Group(); const c = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.35, 0.35, 48), mat(K)); g.add(c); const r = new THREE.Mesh(new THREE.TorusGeometry(1.3, 0.04, 8, 64), mat(B)); r.rotation.x = Math.PI / 2; r.position.y = 0.18; g.add(r); return shadowy(g); }
  const alasU = alas(), alasE = alas(); scene.add(alasU, alasE);
  const uang = new THREE.Group();
  for (let i = 0; i < 6; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.07, 0.48), mat(i % 2 ? MM : "#efd77a")); b.position.set((rnd(i) - 0.5) * 0.06, i * 0.075, (rnd(i + 9) - 0.5) * 0.06); b.rotation.y = (rnd(i + 4) - 0.5) * 0.15; uang.add(b); }
  const band = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.47, 0.5), mat(B)); band.position.y = 0.19; uang.add(band);
  shadowy(uang); scene.add(uang);
  const kartuKecil = kartuWaris(0.55); scene.add(kartuKecil);
  const miniU = [], miniE = [];
  for (let i = 0; i < 4; i++) { const l = laptop(layarPolos); scene.add(l); miniU.push(l); }
  for (let i = 0; i < 11; i++) { const l = laptop(layarPolos); scene.add(l); miniE.push(l); }

  // pelat teks
  const P = {
    judul: plate([["Bu Rini beli", 64, A, 500], ["Waris 50 gram", 96, B]]),
    beli: plate([["Mei 2023", 56, A, 500], ["Rp49.780.000", 96, B]], { bg: K }),
    lupa: plate([["lupa...", 110, B]]),
    butuh: plate([["butuh laptop", 74, B]]),
    ketemu: plate([["ketemu!", 110, K]], { bg: B }),
    jakarta: plate([["Jakarta", 80, K]], { bg: B }),
    buyback: plate([["buyback resmi · 7 Nov 2026", 46, A, 500], ["Rp119.000.000", 104, B], ["sumber: sampoernagold.com", 34, A, 500]]),
    banding: plate([["coba bandingkan", 80, B]]),
    lUang: plate([["UANG", 70, K]], { bg: B }), lEmas: plate([["EMAS", 70, B]], { bg: M }),
    hUang: plate([["Rp49,78 jt", 60, B]]), hEmas: plate([["Rp119 jt", 60, B]]),
    n4: plate([["4 laptop", 76, B]]), n11: plate([["11 laptop", 76, K]], { bg: B }),
    sisa: plate([["+ sisa Rp9 juta", 64, B]], { bg: MM }),
    catatan: plate([["harga laptop dianggap tetap Rp10 juta", 34, A, 500]], { pad: 30 }),
    naikTurun: plate([["Harga emas", 70, B], ["bisa naik turun", 70, B]]),
    tanya: plate([["Kamu simpan", 76, K], ["emas apa?", 76, K]], { bg: B }),
    komen: plate([["Komen di bawah!", 70, B]], { bg: M }),
  };
  for (const p of Object.values(P)) scene.add(p);

  // ---- Area dunia (x) ----
  const AX = { beli: 0, lupa: 8, jual: 16, banding: 24, akhir: 32 };

  // kamera: [t, pos, look, durasi]
  const cp = (x, z = 13.5) => [[x + 0.3, 0.9, z], [x, 0.25, 0]];
  const camKeys = [
    [0, ...cp(AX.beli, 11), 0.01],
    [T.lalu - 0.35, ...cp(AX.lupa, 11.5), 1.0],
    [T.ketemu - 0.2, ...cp(AX.lupa - 0.2, 11), 0.6],
    [T.dijual - 0.35, ...cp(AX.jual, 11.5), 1.0],
    [T.coba - 0.35, ...cp(AX.banding, 12.3), 1.0],
    [T.hargaEmas - 0.35, ...cp(AX.akhir, 11), 1.0],
  ];
  function cam(t) {
    let p = camKeys[0][1], l = camKeys[0][2];
    for (const [t0, pp, ll, d] of camKeys.slice(1)) {
      if (t < t0) break;
      const e = eInOut(prog(t, t0, d));
      p = p.map((v, i) => lerp(v, pp[i], e)); l = l.map((v, i) => lerp(v, ll[i], e));
    }
    camera.position.set(p[0] + Math.sin(t * 0.5) * 0.25, p[1] + Math.cos(t * 0.4) * 0.12, p[2]); camera.lookAt(l[0], l[1], l[2]);
    sun.position.set(l[0] + 4, 9, 7); sun.target.position.set(l[0], 0, 0);
  }
  const show = (o, t, t0, t1 = 1e9, d = 0.45, s = 1) => {
    const a = t < t0 ? 0 : eBack(prog(t, t0, d)) * (1 - eInOut(prog(t, t1, 0.3)));
    o.visible = a > 0.001; o.scale.setScalar(Math.max(0.001, a * s)); return a;
  };
  const place = (o, x, y, z, ry = 0, rx = 0) => { o.position.set(x, y, z); o.rotation.set(rx, ry, 0); };
  const TOP = 2.45; // slot judul atas
  const kartuAkhir = kartuWaris(0.8); scene.add(kartuAkhir);

  function update(t) {
    cam(t);
    const xb = AX.beli, xl = AX.lupa, xj = AX.jual, xc = AX.banding, xa = AX.akhir;
    // --- kartu utama ---
    const LX = xl - 0.55;
    if (t < T.lalu) {
      const drop = eOut(prog(t, T.mulai - 0.2, 0.9));
      place(kartu, xb, lerp(4, 0.5, drop) + Math.sin(t * 1.5) * 0.04, 0, lerp(-3.4, 0.3, drop) + Math.sin(t * 0.9) * 0.2, -0.05);
      kartu.scale.setScalar(1.2);
    } else if (t < T.ketemu) {
      const p = eInOut(prog(t, T.lalu, 1.3));
      place(kartu, lerp(xb, LX, p), lerp(0.5, -0.25, p) + Math.sin(p * Math.PI) * 1.4, lerp(0, -0.1, p), lerp(0.3, 6.6, p), 0);
      kartu.scale.setScalar(lerp(1.2, 0.45, p));
    } else {
      const p = eOut(prog(t, T.ketemu, 0.9));
      place(kartu, LX, lerp(-0.25, 0.9, p) + Math.sin(t * 2) * 0.05, lerp(-0.1, 1.4, p), 6.6 + Math.sin(t * 1.2) * 0.3, 0);
      kartu.scale.setScalar(lerp(0.45, 0.7, p));
    }
    kartu.visible = t < T.dijual - 0.2;
    // --- area beli ---
    show(P.judul, t, T.mulai + 0.1, T.lalu - 0.2); place(P.judul, xb, TOP, 0.3);
    show(P.beli, t, T.harga, T.lalu - 0.2); place(P.beli, xb + 0.35, -1.05, 1.2, -0.12, -0.05);
    // --- area lupa ---
    lemari.scale.setScalar(0.72); place(lemari, LX, -0.33, -0.4, 0.3); lemari.rotation.z = 0.025;
    const buka1 = prog(t, T.lalu + 0.1, 0.45) * (1 - prog(t, T.tersimpan + 0.3, 0.45));
    const buka2 = eOut(prog(t, T.eh, 0.5));
    for (const [pv, k] of pintu) pv.rotation.y = k * -(Math.max(buka1, buka2) * 1.9);
    lemari.visible = t > T.lalu - 1 && t < T.dijual + 0.8;
    debu.forEach((d, i) => {
      const k = prog(t, T.eh + rnd(i) * 0.3, 2.2);
      d.visible = k > 0 && k < 1; const ang = rnd(i + 2) * Math.PI * 2;
      d.position.set(LX + 0.2 + Math.cos(ang) * k * (0.4 + rnd(i + 5) * 1.0), -0.5 + rnd(i + 1) * 1.5 + k * 1.0, 0.3 + Math.sin(ang) * k * 0.6 + k);
      d.material.opacity = 0.9 * (1 - k);
    });
    show(P.lupa, t, T.lalu + 0.3, T.anak - 0.15); place(P.lupa, xl, TOP, 0.3);
    show(kal, t, T.tersimpan - 0.1, T.ketemu - 0.1, 0.45, 0.62); place(kal, xl + 1.05, 1.15, 0.3, -0.35);
    const flips = [[T.tersimpan + 0.3, "2023", "2024"], [T.tersimpan + 0.75, "2024", "2025"], [T.tujuh - 0.1, "2025", "2026"]];
    let page = "2023"; flip.visible = false;
    for (const [t0, a, b] of flips) {
      if (t >= t0) page = b;
      const k = prog(t, t0, 0.4);
      if (k > 0 && k < 1) { flip.visible = true; flip.material.map = kalTex[a]; flipPivot.rotation.x = -eInOut(k) * Math.PI * 0.95; kPage.material.map = kalTex[b]; }
    }
    if (!flip.visible) kPage.material.map = kalTex[page];
    show(laptopBesar, t, T.anak, T.dijual - 0.2, 0.45, 0.62); place(laptopBesar, xl + 0.85, -1.55, 1.0, -0.45);
    laptopBesar.userData.hinge.rotation.x = lerp(Math.PI / 2, -0.25, eOut(prog(t, T.anak + 0.2, 0.7)));
    show(P.butuh, t, T.anak, T.ketemu - 0.15); place(P.butuh, xl, TOP, 0.3);
    show(P.ketemu, t, T.ketemu, T.dijual - 0.3); place(P.ketemu, xl - 0.2, TOP, 0.3);
    // --- area jual ---
    show(toko, t, T.dijual - 0.4, T.coba - 0.3, 0.6, 0.72); place(toko, xj - 0.45, -0.88, -0.9, 0.3);
    show(pin, t, T.dijual + 0.3, T.coba - 0.3, 0.45, 0.62); place(pin, xj + 0.95, 1.55 + Math.abs(Math.sin(t * 3)) * 0.12, 0.2, Math.sin(t) * 0.4);
    show(P.jakarta, t, T.dijual + 0.5, T.coba - 0.3); place(P.jakarta, xj + 0.95, 0.85, 0.5, -0.15);
    show(P.buyback, t, T.buyback, T.coba - 0.3); place(P.buyback, xj, -0.7, 1.9, -0.06, -0.05);
    // --- area banding ---
    const UX = xc - 0.95, EX = xc + 0.95;
    show(alasU, t, T.coba, T.hargaEmas - 0.3, 0.45, 0.62); place(alasU, UX, -1.48, 0);
    show(alasE, t, T.coba + 0.12, T.hargaEmas - 0.3, 0.45, 0.62); place(alasE, EX, -1.48, 0);
    show(P.banding, t, T.coba, T.kalau - 0.1); place(P.banding, xc, TOP, 0.3);
    show(P.catatan, t, T.kalau, T.sisa - 0.15); place(P.catatan, xc, TOP + 0.15, 0.3);
    show(P.lUang, t, T.kalau, T.hargaEmas - 0.3); place(P.lUang, UX, -1.42, 1.2);
    show(P.lEmas, t, T.karena, T.hargaEmas - 0.3); place(P.lEmas, EX, -1.42, 1.2);
    show(uang, t, T.kalau + 0.2, T.hargaEmas - 0.3, 0.45, 0.6); place(uang, UX, -1.3, 0.1, t * 0.3);
    show(P.hUang, t, T.kalau + 0.6, T.hargaEmas - 0.3); place(P.hUang, UX, -0.7, 0.6);
    show(kartuKecil, t, T.karena + 0.2, T.hargaEmas - 0.3, 0.45, 0.75); place(kartuKecil, EX, -0.85, 0.1, Math.sin(t * 1.3) * 0.5);
    show(P.hEmas, t, T.karena + 0.6, T.hargaEmas - 0.3); place(P.hEmas, EX, -0.15, 0.8);
    miniU.forEach((l, i) => { show(l, t, T.empat + i * 0.18, T.hargaEmas - 0.3, 0.35, 0.32); place(l, UX + (i % 2 - 0.5) * 0.5, 0.3 + Math.floor(i / 2) * 0.45, -0.3, 0.15, 0.25); l.userData.hinge.rotation.x = -0.25; });
    miniE.forEach((l, i) => { const r = Math.floor(i / 4), c = i % 4; show(l, t, T.sebelas + i * 0.08, T.hargaEmas - 0.3, 0.35, 0.23); place(l, EX + (c - 1.5) * 0.36 + (r === 2 ? 0.18 : 0), 0.3 + r * 0.38, -0.3, -0.15, 0.25); l.userData.hinge.rotation.x = -0.25; });
    show(P.n4, t, T.empat + 0.5, T.hargaEmas - 0.3); place(P.n4, UX, 1.65, 0.3, 0.1);
    show(P.n11, t, T.sebelas + 0.6, T.hargaEmas - 0.3); place(P.n11, EX, 1.65, 0.3, -0.1);
    show(P.sisa, t, T.sisa, T.hargaEmas - 0.3); place(P.sisa, xc, TOP, 0.4);
    // --- area akhir ---
    show(kartuAkhir, t, T.hargaEmas - 0.2); place(kartuAkhir, xa, 0.45 + Math.sin(t * 1.6) * 0.06, 0, t * 0.9);
    show(P.naikTurun, t, T.hargaEmas, 1e9); place(P.naikTurun, xa, TOP, 0.3);
    show(P.tanya, t, T.kamu, T.komen - 0.1); place(P.tanya, xa, -1.0, 1.5, 0.08, -0.04);
    show(P.komen, t, T.komen, 1e9); place(P.komen, xa, -1.0, 1.5, -0.06);
  }

  // ---- Lapisan 2D: transkrip kecil + cover + outro ----
  const cv = document.getElementById("main"), g = cv.getContext("2d");
  const outroCanvas = document.getElementById("outro");
  const tw = (s, size, weight = 700) => { g.font = `${weight} ${size}px Poppins`; return g.measureText(s).width; };
  function text2(s, x, y, size, color, weight = 700, align = "center", stroke = null, sw = 0) {
    g.font = `${weight} ${size}px Poppins`; g.textAlign = align; g.textBaseline = "middle";
    if (stroke) { g.lineJoin = "round"; g.strokeStyle = stroke; g.lineWidth = sw; g.strokeText(s, x, y); }
    g.fillStyle = color; g.fillText(s, x, y);
  }
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
    const size = 32, sp = tw(" ", size, 500);
    const ws = ch.map((w) => w.text.replace(/[,.?:!]+$/, "").replace(/\.\.\.$/, ""));
    const widths = ws.map((s, i) => tw(s, size, 600));
    const total = widths.reduce((a, b) => a + b, 0) + sp * (ws.length - 1);
    let x = 540 - total / 2;
    const y = 1590, a = eOut(prog(t, ch[0].t0, 0.15));
    g.save(); g.globalAlpha = a;
    g.fillStyle = "rgba(251,247,236,0.92)"; g.beginPath(); g.roundRect(540 - total / 2 - 22, y - 30, total + 44, 60, 30); g.fill();
    ch.forEach((w, i) => {
      const on = t >= w.t0 && t < (ch[i + 1] ? ch[i + 1].t0 : 1e9);
      g.font = `600 ${size}px Poppins`; g.textAlign = "left"; g.textBaseline = "middle"; g.fillStyle = on ? B : A; g.fillText(ws[i], x, y + 1);
      x += widths[i] + sp;
    });
    g.restore();
  }
  // cover: tampilan 3D kartu dari dekat + judul besar
  function drawCoverText() {
    text2("Emas lupa disimpan", 540, 330, 78, B, 700, "center", K, 14);
    text2("3 tahun...", 540, 430, 78, B, 700, "center", K, 14);
    g.save(); g.translate(540, 1390); g.rotate(-0.05);
    g.fillStyle = B; g.beginPath(); g.roundRect(-400, -105, 800, 210, 50); g.fill();
    text2("jadi berapa?", 0, 6, 104, M, 700); g.restore();
    text2("@tokobbgold", 540, 1560, 40, B, 700, "center", K, 10);
  }
  function cropCheck() {
    const c = tokens.crop34; g.save(); g.strokeStyle = B; g.lineWidth = 3; g.setLineDash([10, 8]);
    g.strokeRect((W - c.width) / 2, (H - c.height) / 2, c.width, c.height); g.restore();
    text2("CROP 3:4", (W - c.width) / 2, (H - c.height) / 2 - 22, 26, B, 500, "left");
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
  for (const t of [T.lalu - 0.35, T.ketemu - 0.2, T.dijual - 0.35, T.coba - 0.35, T.hargaEmas - 0.35]) cues.push({ type: "whoosh", t: t - wl, tetap: true });
  for (const t of [T.mulai + 0.1, T.harga, T.lalu + 0.3, T.anak, T.ketemu, T.dijual + 0.3, T.buyback, T.kalau, T.empat, T.karena, T.sebelas, T.sisa, T.hargaEmas, T.kamu, T.komen]) cues.push({ type: "pop", t });
  cues.sort((a, b) => a.t - b.t);
  const shifted = [];
  for (let i = 1; i < cues.length; i++) {
    if (cues[i].t - cues[i - 1].t < tokens.audio.jedaSfxMin - 1e-6 && !cues[i].tetap) { const from = cues[i].t; cues[i].t = cues[i - 1].t + tokens.audio.jedaSfxMin; shifted.push([from, cues[i].t]); }
    cues.sort((a, b) => a.t - b.t);
  }
  let wn = 0; cues.forEach((c) => (c.file = c.type === "whoosh" ? `whoosh-${(wn++ % 2) + 1}` : "pop"));

  const CEK = new URLSearchParams(location.search).has("crop");
  const glCanvas = document.getElementById("gl");
  window.renderAt = (t) => {
    g.clearRect(0, 0, W, H);
    if (COVER && t < COVER + 0.35) {
      // cover: kartu besar menghadap kamera di area beli
      update(Math.max(t, T.mulai + 1.0));
      for (const p of Object.values(P)) p.visible = false;
      place(kartu, 0, 0.2, 2.2, 0.35 + Math.sin(t) * 0.05, -0.08); kartu.visible = true; kartu.scale.setScalar(1);
      camera.position.set(0.3, 0.5, 9.5); camera.lookAt(0, 0.3, 0);
      renderer.render(scene, camera);
      const p = eInOut(prog(t, COVER, 0.35));
      if (p > 0) { update(t); renderer.render(scene, camera); }
      g.save(); g.globalAlpha = 1 - p; drawCoverText(); g.restore();
      if (p > 0 && p < 1) { /* transisi: lapisan 3D sudah beralih ke adegan */ }
    } else { update(t); renderer.render(scene, camera); }
    caption(t);
    if (CEK && t < COVER) cropCheck();
    const f = eInOut(prog(t, PN.crossFade[0], PN.crossFade[1] - PN.crossFade[0]));
    if (f > 0) { g.fillStyle = M; g.globalAlpha = f; g.fillRect(0, 0, W, H); g.globalAlpha = 1; }
    glCanvas.style.visibility = f >= 1 ? "hidden" : "visible";
    if (t >= PN.outroMulai) { outroCanvas.style.display = "block"; renderOutro(t - PN.outroMulai, { background: true }); }
    else outroCanvas.style.display = "none";
  };
  window.__meta = { id: data.id, fps: tokens.frame.fps, duration, lead, audio: data.audio, T, cues: cues.map(({ type, t, file }) => ({ type, t, file })), shifted, outro: { mulai: PN.outroMulai } };
  window.renderAt(0);
  window.__ready = true;
}
