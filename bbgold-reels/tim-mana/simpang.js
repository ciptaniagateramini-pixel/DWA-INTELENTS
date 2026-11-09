// Gaya G "persimpangan 3D": three.js di atas kanvas mustard + grid. Hook -> kenapa baru beli langsung rugi
// (balok harga jual vs buyback + ongkos) -> papan penunjuk BERHIAS / INVESTASI -> cabang nota vs pasar ->
// kotak kado "teliti sebelum bungkus" -> "kamu tim mana?". Cover = area tim mana + teks hook.
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
    mulai: V(0), tapi: kata("tapi"), beli: kata("Beli"), kenapa: kata("Kenapa"), rugi: kata("rugi"),
    karena: kata("Karena"), selisih: kata("selisih"), buyback: kata("buyback"), di: kata("Di"), ongkos: kata("ongkos"),
    itulah: kata("Itulah"), tujuan: kata("tujuan"), untuk: kata("Untuk"), atau: kata("atau"),
    kalauB: kata("Kalau", 1), nota: kata("nota"), kalauI: kata("Kalau", 2), pasar: kata("pasar"),
    ini: kata("Ini", 1), teliti: kata("teliti"), bungkus: kata("bungkus"), kamu: kata("Kamu", 1), timI: kata("tim", 1),
    komen: kata("Komen"), akhir: V(words[words.length - 1].end),
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
  const EMAS = "#E5B527";
  const gold = (o = {}) => mat(EMAS, { metalness: 0.3, roughness: 0.32, emissive: col("#5a4205"), emissiveIntensity: 0.35, ...o });
  function cincin(s = 1) {
    const g = new THREE.Group();
    const r = new THREE.Mesh(new THREE.TorusGeometry(0.45 * s, 0.09 * s, 24, 64), gold()); g.add(r);
    const top = new THREE.Mesh(new THREE.OctahedronGeometry(0.17 * s), mat(MM, { metalness: 0.6, roughness: 0.15 })); top.position.y = 0.58 * s; g.add(top);
    return shadowy(g);
  }
  const barTex = texCanvas(480, 240, (x) => { x.fillStyle = "#e9bd3b"; x.fillRect(0, 0, 480, 240); x.strokeStyle = "#b8901c"; x.lineWidth = 8; x.strokeRect(14, 14, 452, 212); txt(x, "FINE GOLD", 240, 90, 54, "#8a6a10", 700); txt(x, "999.9", 240, 160, 64, "#8a6a10", 700); });
  function batangan(s = 1) {
    const g = new THREE.Group();
    const b = new THREE.Mesh(slabGeo(1.2 * s, 0.6 * s, 0.22 * s, 0.06 * s), gold()); g.add(b);
    const f = new THREE.Mesh(new THREE.PlaneGeometry(1.08 * s, 0.5 * s), new THREE.MeshStandardMaterial({ map: barTex, metalness: 0.5, roughness: 0.35 })); f.position.z = 0.14 * s; g.add(f);
    return shadowy(g);
  }
  function kalung(s = 1) {
    const g = new THREE.Group();
    const c = new THREE.Mesh(new THREE.TorusGeometry(0.7 * s, 0.025 * s, 12, 80, Math.PI * 1.1), gold()); c.rotation.z = Math.PI * 1.45; g.add(c);
    const p = new THREE.Mesh(new THREE.SphereGeometry(0.12 * s, 24, 16), mat(MM, { metalness: 0.7, roughness: 0.2 })); p.position.y = -0.72 * s; g.add(p);
    return shadowy(g);
  }
  function alas() { const g = new THREE.Group(); const c = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.35, 0.35, 48), mat(K)); g.add(c); const r = new THREE.Mesh(new THREE.TorusGeometry(1.3, 0.04, 8, 64), mat(B)); r.rotation.x = Math.PI / 2; r.position.y = 0.18; g.add(r); return shadowy(g); }

  // B: balok harga
  const balokBeli = shadowy(new THREE.Mesh(new THREE.BoxGeometry(0.8, 1, 0.8), mat(MM)));
  const balokBb = shadowy(new THREE.Mesh(new THREE.BoxGeometry(0.8, 1, 0.8), mat("#9aa5bd")));
  const balokOngkos = shadowy(new THREE.Mesh(new THREE.BoxGeometry(0.8, 1, 0.8), mat(K)));
  const panah = new THREE.Group();
  { const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.7, 16), mat(B)); sh.position.y = 0.2; panah.add(sh); const hd = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.35, 24), mat(B)); hd.rotation.x = Math.PI; hd.position.y = -0.3; panah.add(hd); shadowy(panah); }
  const cincinB = cincin(1);
  scene.add(balokBeli, balokBb, balokOngkos, panah, cincinB);

  // C: tiang penunjuk + jalan bercabang
  const tiang = new THREE.Group();
  { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 3.0, 16), mat(B)); p.position.y = 0; tiang.add(p); }
  const papan = (s, bg, fg, dir) => {
    const g = new THREE.Group(); const pl = plate([[s, 64, fg]], { bg, depth: 0.08, round: 0.15 }); g.add(pl);
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.32, 3), mat(bg)); tip.rotation.z = -dir * Math.PI / 2; tip.position.x = dir * 0.95; g.add(tip);
    return shadowy(g);
  };
  const papanB = papan("BERHIAS", B, K, -1), papanI = papan("INVESTASI", M, B, 1);
  papanB.position.set(-0.45, 0.9, 0.12); papanI.position.set(0.5, 0.35, 0.12);
  tiang.add(papanB, papanI); shadowy(tiang);
  const jalanG = new THREE.Group();
  for (const k of [-1, 1]) { const j = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.03, 7), mat(K)); j.position.set(k * 1.3, 0, -1.5); j.rotation.y = k * 0.45; j.receiveShadow = true; jalanG.add(j); }
  { const j = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.03, 3), mat(K)); j.position.set(0, 0, 2.2); j.receiveShadow = true; jalanG.add(j); }
  scene.add(tiang, jalanG);

  // D: berhias
  const cincinD = cincin(0.9), kalungD = kalung(1);
  const notaTex = texCanvas(420, 560, (x) => { x.fillStyle = K; x.fillRect(0, 0, 420, 560); txt(x, "NOTA", 210, 70, 64, B, 700); x.fillStyle = A; for (let i = 0; i < 6; i++) x.fillRect(50, 150 + i * 56, i % 2 ? 220 : 320, 16); x.strokeStyle = B; x.lineWidth = 6; x.strokeRect(12, 12, 396, 536); txt(x, "harga beli", 210, 500, 34, B, 700); });
  const nota = shadowy(new THREE.Mesh(new THREE.BoxGeometry(0.84, 1.12, 0.02), [mat(K), mat(K), mat(K), mat(K), new THREE.MeshStandardMaterial({ map: notaTex, roughness: 0.9 }), mat(K)]));
  scene.add(cincinD, kalungD, nota);
  // E: investasi
  const batanganE = batangan(1.1);
  const grafik = new THREE.Group();
  { const bd = plate([[" ", 10, B]], { bg: K, pad: 260, border: true }); grafik.add(bd);
    const pts = [[-0.75, -0.45], [-0.45, -0.1], [-0.2, -0.3], [0.1, 0.15], [0.35, -0.05], [0.7, 0.45]].map(([x, y]) => new THREE.Vector3(x, y, 0.09));
    const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, 0.035, 8), mat(B)); grafik.add(tube);
    for (const p of pts) { const d = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 12), mat(M)); d.position.copy(p); grafik.add(d); } shadowy(grafik); }
  scene.add(batanganE, grafik);
  // F: kotak kado
  const kado = new THREE.Group();
  { const bx = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.9, 1.2), mat(M)); kado.add(bx);
    for (const r of [0, Math.PI / 2]) { const rb = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.92, 1.22), mat(B)); rb.rotation.y = r; kado.add(rb); } }
  const tutup = new THREE.Group(); tutup.position.set(0, 0.45, -0.62); kado.add(tutup);
  { const ld = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.2, 1.3), mat(M)); ld.position.set(0, 0.1, 0.62); tutup.add(ld);
    for (const r of [0, Math.PI / 2]) { const rb = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.22, 1.32), mat(B)); rb.rotation.y = r; rb.position.set(0, 0.1, 0.62); tutup.add(rb); }
    for (const k of [-1, 1]) { const bw = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.05, 12, 24), mat(B)); bw.position.set(k * 0.17, 0.33, 0.62); bw.rotation.y = k * 0.5; tutup.add(bw); } }
  shadowy(kado);
  const cincinF = cincin(0.55);
  scene.add(kado, cincinF);
  // G: tim mana
  const alasB = alas(), alasI = alas(), cincinG = cincin(1.05), batanganG = batangan(1.0);
  scene.add(alasB, alasI, cincinG, batanganG);

  // pelat teks
  const P = {
    hook: plate([["Pertanyaan ini sepele,", 54, A, 500], ["tapi dampaknya BESAR", 70, B]]),
    tanya: plate([["Beli emas,", 64, A, 500], ["buat apa?", 118, B]]),
    rugiQ: plate([["baru beli, langsung jual", 50, A, 500], ["kok rugi?", 90, B]]),
    lBeli: plate([["harga jual toko", 40, B]], { pad: 30 }), lBb: plate([["buyback", 40, B]], { pad: 30 }),
    lSelisih: plate([["selisih", 54, K]], { bg: B, pad: 34 }), lOngkos: plate([["+ ongkos pembuatan", 38, B]], { bg: MM, pad: 30 }),
    tujuan: plate([["harus punya", 50, A, 500], ["tujuan yang pasti", 76, B]]),
    hias: plate([["BERHIAS", 92, K]], { bg: B }),
    hiasTip: plate([["pilih toko yang buyback-nya", 42, A, 500], ["ikut harga NOTA", 76, B]]),
    inv: plate([["INVESTASI", 92, B]], { bg: M }),
    invTip: plate([["pilih toko yang jual-belinya", 42, A, 500], ["ikut harga PASAR", 76, B]]),
    teliti: plate([["teliti sebelum", 58, A, 500], ["bungkus, Say!", 96, B]]),
    tim: plate([["Kamu tim mana?", 92, B]]),
    tB: plate([["TIM BERHIAS", 54, K]], { bg: B }), tI: plate([["TIM INVESTASI", 54, B]], { bg: M }),
    komen: plate([["Komen di bawah!", 72, B]], { bg: M }),
    cB: plate([["BERHIAS", 60, K]], { bg: B }), cI: plate([["INVESTASI", 60, B]], { bg: M }),
  };
  for (const p of Object.values(P)) scene.add(p);

  const AX = { a: 0, b: 8, c: 16, d: 24, e: 32, f: 40, g: 48 };
  const cp = (x, z = 11.5, ly = 0.25) => [[x + 0.3, 0.9, z], [x, ly, 0]];
  const camKeys = [
    [0, ...cp(AX.a), 0.01],
    [T.kenapa - 0.35, ...cp(AX.b), 1.0],
    [T.itulah - 0.35, ...cp(AX.c, 12), 1.0],
    [T.kalauB - 0.35, ...cp(AX.d), 1.0],
    [T.kalauI - 0.35, ...cp(AX.e), 1.0],
    [T.ini - 0.35, ...cp(AX.f), 1.0],
    [T.kamu - 0.35, ...cp(AX.g, 12.3), 1.0],
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
  const place = (o, x, y, z, ry = 0, rx = 0, rz = 0) => { o.position.set(x, y, z); o.rotation.set(rx, ry, rz); };
  const TOP = 2.45;
  const bar = (m, t, t0, t1, x, h, z = 0) => { const a = t < t0 ? 0 : eOut(prog(t, t0, 0.6)) * (1 - eInOut(prog(t, t1, 0.3))); m.visible = a > 0.001; const hh = Math.max(0.001, h * a); m.scale.set(1, hh, 1); m.position.set(x, FLOOR + hh / 2, z); return hh; };

  function update(t) {
    cam(t);
    // A: hook
    const { a: xa, b: xb, c: xc, d: xd, e: xe, f: xf, g: xg } = AX;
    show(P.hook, t, T.mulai, T.kenapa - 0.3); place(P.hook, xa, 1.6, 0.4, -0.05);
    show(P.tanya, t, T.beli, T.kenapa - 0.3); place(P.tanya, xa, -0.3, 0.9, 0.05, -0.03);
    // B: rugi
    show(P.rugiQ, t, T.kenapa, T.itulah - 0.3); place(P.rugiQ, xb, TOP, 0.3);
    show(cincinB, t, T.kenapa + 0.1, T.karena, 0.45, 1); place(cincinB, xb, 0.3 + Math.sin(t * 2) * 0.06, 0.6, t * 1.2);
    show(panah, t, T.rugi, T.karena, 0.4, 1); place(panah, xb + 0.95, 0.2 + Math.sin(t * 5) * 0.08, 0.6);
    const hB = bar(balokBeli, t, T.karena, T.itulah - 0.3, xb - 0.6, 2.4);
    const hBb = bar(balokBb, t, T.karena + 0.5, T.itulah - 0.3, xb + 0.6, 1.8);
    const aO = t < T.ongkos ? 0 : eOut(prog(t, T.ongkos, 0.5)) * (1 - eInOut(prog(t, T.itulah - 0.3, 0.3)));
    balokOngkos.visible = aO > 0.001; balokOngkos.scale.set(1, Math.max(0.001, 0.5 * aO), 1); balokOngkos.position.set(xb - 0.6, FLOOR + hB + 0.25 * aO, 0);
    show(P.lBeli, t, T.karena + 0.3, T.itulah - 0.3); place(P.lBeli, xb - 0.6, FLOOR + 0.35, 0.55);
    show(P.lBb, t, T.karena + 0.8, T.itulah - 0.3); place(P.lBb, xb + 0.6, FLOOR + 0.35, 0.55);
    show(P.lSelisih, t, T.selisih, T.itulah - 0.3); place(P.lSelisih, xb + 0.6, FLOOR + 2.15, 0.5);
    show(P.lOngkos, t, T.ongkos + 0.2, T.itulah - 0.3); place(P.lOngkos, xb - 0.35, FLOOR + 3.25, 0.6);
    // C: tujuan
    show(tiang, t, T.itulah - 0.2, T.kalauB - 0.3, 0.6); place(tiang, xc, -0.1, 0);
    papanB.scale.setScalar(t < T.untuk ? 0.001 : eBack(prog(t, T.untuk, 0.4)));
    papanI.scale.setScalar(t < T.atau ? 0.001 : eBack(prog(t, T.atau, 0.4)));
    jalanG.visible = t > T.itulah - 1 && t < T.kalauB + 0.8; place(jalanG, xc, FLOOR + 0.02, 0);
    show(P.tujuan, t, T.itulah, T.kalauB - 0.3); place(P.tujuan, xc, TOP, 0.3);
    // D: berhias
    show(P.hias, t, T.kalauB, T.kalauI - 0.3); place(P.hias, xd, TOP, 0.3);
    show(cincinD, t, T.kalauB + 0.2, T.kalauI - 0.3); place(cincinD, xd - 0.75, 0.75 + Math.sin(t * 2) * 0.05, 0.3, t);
    show(kalungD, t, T.kalauB + 0.4, T.kalauI - 0.3); place(kalungD, xd + 0.75, 1.0, 0.1, Math.sin(t) * 0.4);
    show(nota, t, T.kalauB + 0.7, T.kalauI - 0.3); place(nota, xd, -0.35, 1.0, -0.15 + Math.sin(t * 1.3) * 0.1, -0.1);
    show(P.hiasTip, t, T.kalauB + 0.9, T.kalauI - 0.3); place(P.hiasTip, xd, -1.0, 1.7);
    // E: investasi
    show(P.inv, t, T.kalauI, T.ini - 0.3); place(P.inv, xe, TOP, 0.3);
    show(batanganE, t, T.kalauI + 0.2, T.ini - 0.3); place(batanganE, xe - 0.6, 0.95 + Math.sin(t * 2) * 0.05, 0.3, 0.3 + Math.sin(t) * 0.2, -0.2);
    show(grafik, t, T.kalauI + 0.5, T.ini - 0.3, 0.45, 0.8); place(grafik, xe + 0.55, -0.1, 0.4, -0.2);
    show(P.invTip, t, T.kalauI + 0.9, T.ini - 0.3); place(P.invTip, xe, -1.0, 1.7);
    // F: teliti
    show(kado, t, T.ini, T.kamu - 0.3, 0.5, 1); place(kado, xf, -0.95, 0.4, 0.5);
    tutup.rotation.x = -lerp(1.9, 0, eOut(prog(t, T.bungkus - 0.1, 0.5)));
    const masuk = eInOut(prog(t, T.teliti, 0.7));
    show(cincinF, t, T.ini + 0.2, T.bungkus + 0.2); place(cincinF, xf, lerp(1.3, -0.4, masuk), lerp(0.6, 0.4, masuk), t * 2);
    show(P.teliti, t, T.teliti - 0.2, T.kamu - 0.3); place(P.teliti, xf, TOP - 0.1, 0.3);
    // G: tim mana
    show(P.tim, t, T.kamu, 1e9); place(P.tim, xg, TOP, 0.3);
    show(alasB, t, T.kamu, 1e9, 0.45, 0.62); place(alasB, xg - 0.95, -1.48, 0);
    show(alasI, t, T.timI, 1e9, 0.45, 0.62); place(alasI, xg + 0.95, -1.48, 0);
    show(cincinG, t, T.kamu + 0.2, 1e9, 0.45, 0.8); place(cincinG, xg - 0.95, -0.55 + Math.sin(t * 2) * 0.05, 0, t);
    show(batanganG, t, T.timI + 0.2, 1e9, 0.45, 0.8); place(batanganG, xg + 0.95, -0.75 + Math.sin(t * 2 + 1) * 0.05, 0, 0.3 + Math.sin(t) * 0.3, -0.3);
    show(P.tB, t, T.kamu + 0.4, 1e9); place(P.tB, xg - 0.95, 0.55, 0.4, 0.1);
    show(P.tI, t, T.timI + 0.4, 1e9); place(P.tI, xg + 0.95, 0.55, 0.4, -0.1);
    show(P.komen, t, T.komen, 1e9); place(P.komen, xg, -0.85, 1.6, -0.04);
    P.cB.visible = P.cI.visible = false;
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
  // cover: area "tim mana" + teks hook besar
  function drawCoverText() {
    text2("Pertanyaan ini sepele,", 540, 300, 58, B, 600, "center", K, 12);
    text2("tapi dampaknya besar:", 540, 380, 58, B, 600, "center", K, 12);
    g.save(); g.translate(540, 560); g.rotate(-0.04);
    g.fillStyle = B; g.beginPath(); g.roundRect(-450, -130, 900, 260, 56); g.fill();
    text2("BELI EMAS", 0, -52, 104, M, 700); text2("BUAT APA?", 0, 62, 104, K, 700); g.restore();
    g.save(); g.translate(540, 1470); g.rotate(0.03);
    g.fillStyle = K; g.strokeStyle = B; g.lineWidth = 5; g.beginPath(); g.roundRect(-270, -52, 540, 104, 52); g.fill(); g.stroke();
    text2("jawab di komen!", 0, 3, 56, B, 700); g.restore();
    text2("@tokobbgold", 540, 1590, 38, B, 700, "center", K, 10);
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
  for (const k of camKeys.slice(1)) cues.push({ type: "whoosh", t: k[0] - wl, tetap: true });
  for (const t of [T.mulai, T.beli, T.kenapa, T.karena, T.selisih, T.ongkos, T.untuk, T.atau, T.nota, T.pasar, T.bungkus, T.kamu + 0.4, T.timI + 0.4, T.komen]) cues.push({ type: "pop", t });
  cues.sort((a, b) => a.t - b.t);
  const shifted = [];
  for (let i = 1; i < cues.length; i++) {
    if (cues[i].t - cues[i - 1].t < tokens.audio.jedaSfxMin - 1e-6 && !cues[i].tetap) { const from = cues[i].t; cues[i].t = cues[i - 1].t + tokens.audio.jedaSfxMin; shifted.push([from, cues[i].t]); }
    cues.sort((a, b) => a.t - b.t);
  }
  let wn = 0; cues.forEach((c) => (c.file = c.type === "whoosh" ? `whoosh-${(wn++ % 2) + 1}` : "pop"));

  const CEK = new URLSearchParams(location.search).has("crop");
  const glCanvas = document.getElementById("gl");
  function coverScene() {
    update(T.komen + 2);
    for (const p of Object.values(P)) p.visible = false;
    P.cB.visible = P.cI.visible = true; P.cB.scale.setScalar(1); P.cI.scale.setScalar(1);
    const xg = AX.g;
    place(P.cB, xg - 0.85, -1.3, 1.3, 0.1); place(P.cI, xg + 0.85, -1.3, 1.3, -0.1);
    place(cincinG, xg - 0.95, -0.6, 0, 0.6); place(batanganG, xg + 0.95, -0.75, 0, 0.35, -0.3);
    camera.position.set(xg + 0.2, 0.2, 11.5); camera.lookAt(xg, -0.35, 0);
  }
  window.renderAt = (t) => {
    g.clearRect(0, 0, W, H);
    const p = COVER ? eInOut(prog(t, COVER, 0.35)) : 1;
    if (p < 1) { coverScene(); renderer.render(scene, camera); }
    if (p > 0) { update(t); renderer.render(scene, camera); }
    if (p < 1) { g.save(); g.globalAlpha = 1 - p; drawCoverText(); g.restore(); }
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
