// Adegan 7 · Outro: wipe sel sarang lebah, logo 3 sel, slogan, handle, ajakan, disclaimer
import { hexPoints, svg } from "./_shared.js";

export function build(ctx, s, box) {
  const { biru } = ctx.tokens.color;
  const wipeDur = ctx.tokens.duration.wipe;
  const t0 = s.t0;
  ctx.whoosh(t0 - ctx.tokens.audio.whooshLead);

  // Grid heksagon biru yang membesar dari tengah ke luar
  const r = 120, w = Math.sqrt(3) * r, h = 1.5 * r;
  const cells = [];
  for (let row = -1; row * h < 1920 + r; row++) {
    for (let col = -1; col * w < 1080 + w; col++) {
      const cx = col * w + (row % 2 ? w / 2 : 0), cy = row * h;
      cells.push({ cx, cy, d: Math.hypot(cx - 540, cy - 960) });
    }
  }
  const maxD = Math.max(...cells.map((c) => c.d));
  const g = svg(ctx, box, 1080, 1920, cells.map((c, i) => `<polygon data-i="${i}" points="${hexPoints(0, 0, r * 1.04)}" fill="${biru}" />`).join(""),
    { position: "absolute", left: "0", top: "0" });
  const polys = [...g.querySelectorAll("polygon")];
  const cellDur = wipeDur * 0.5;
  const solid = ctx.el("div", "layer", null, box, { background: "var(--biru)" });

  ctx.onUpdate((t) => {
    polys.forEach((p, i) => {
      const c = cells[i];
      const start = t0 + (c.d / maxD) * (wipeDur - cellDur);
      const k = ctx.ease.inOut(ctx.clamp((t - start) / cellDur));
      p.setAttribute("transform", `translate(${c.cx.toFixed(1)} ${c.cy.toFixed(1)}) scale(${k.toFixed(4)})`);
    });
    solid.style.opacity = t >= t0 + wipeDur ? "1" : "0";
  });

  const col = ctx.el("div", "kolom tengah", null, box, { top: "300px", color: "var(--krem)" });
  const logo = ctx.el("img", null, null, col, { width: "290px", height: "auto", display: "block", margin: "0 auto" });
  logo.src = "/assets/logo/bb-gold-logo-latar-biru.svg";
  const nama = ctx.el("div", "judul", s.nama, col, { fontSize: "110px", marginTop: "18px" });
  const slogan = ctx.el("div", "pendukung", s.slogan, col, { marginTop: "18px", padding: "0 20px" });
  const handle = ctx.el("div", "pendukung", s.handle, col, { marginTop: "26px", color: "var(--mustard-muda)", fontWeight: "700" });
  const ajakWrap = ctx.el("div", null, null, col, { marginTop: "46px" });
  const ajakan = ctx.el("div", "ib kartu pendukung", s.ajakan, ajakWrap, {
    background: "var(--mustard)", color: "var(--biru)", padding: "28px 44px", borderRadius: "36px",
  });
  const disc = ctx.el("div", "label", s.disclaimer, col, { marginTop: "56px", letterSpacing: "0.12em", lineHeight: "1.6", color: "var(--krem)", padding: "0 30px" });

  const tl = t0 + wipeDur + 0.05;
  ctx.animate(logo, tl, "pop");
  ctx.pop(tl);
  [nama, slogan, handle, ajakWrap, disc].forEach((el, i) => ctx.animate(el, tl + 0.12 + i * 0.1, "rise"));
}
