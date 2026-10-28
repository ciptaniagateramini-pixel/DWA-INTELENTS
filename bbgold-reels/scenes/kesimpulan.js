// Adegan 6 · Kesimpulan
import { fit } from "./_shared.js";

export function build(ctx, s, box) {
  const col = ctx.el("div", "kolom tengah", null, box, { top: "720px" });
  const card = ctx.el("div", "kartu", null, col, { padding: "64px 28px" });
  const a = ctx.el("div", "pendukung", s.atas, card, { fontSize: "64px" });
  const b = ctx.el("div", "judul", s.tengah, card, { fontSize: "124px", lineHeight: "1.15" });
  const c = ctx.el("div", "judul", s.bawah, card, { fontSize: "104px" });
  fit(c, 88);
  ctx.animate(card, s.t0, "pop");
  ctx.pop(s.t0);
  [a, b, c].forEach((el, i) => ctx.animate(el, s.t0 + 0.1 + i * 0.1, "rise"));
}
