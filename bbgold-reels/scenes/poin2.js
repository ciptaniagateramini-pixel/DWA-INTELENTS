// Adegan 5 · Poin 2: mencairkan, ikon centang (emas) dan jam (tanah)
import { icon } from "./_shared.js";

export function build(ctx, s, box) {
  const col = ctx.el("div", "kolom", null, box, { top: "420px", display: "flex", flexDirection: "column", gap: "40px" });
  const judul = ctx.el("div", "judul", s.judul, col);
  ctx.animate(judul, s.t0, "rise");
  s.baris.forEach((b) => {
    const card = ctx.el("div", "kartu", null, col, { padding: "44px 48px", display: "flex", alignItems: "center", gap: "36px" });
    icon(ctx, card, b.ikon, 150, "var(--krem)", "var(--biru)");
    const teks = ctx.el("div", null, null, card, { flex: "1", minWidth: "0" });
    const kunci = ctx.el("span", "ib kunci", b.kunci, teks, { fontSize: "140px" });
    const sub = ctx.el("div", "pendukung", b.sub.teks, teks, { marginTop: "14px" });
    const t = ctx.t(b.muncul);
    ctx.animate(card, t, "pop");
    ctx.pop(t);
    ctx.focus(kunci, ctx.t(b.fokus));
    ctx.animate(sub, ctx.t(b.sub.muncul), "rise");
  });
}
