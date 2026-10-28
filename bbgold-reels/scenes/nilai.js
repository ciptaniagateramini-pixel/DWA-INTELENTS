// Adegan 3 · Nilai: "Bedanya ada di cara nilainya bertumbuh."
import { svg } from "./_shared.js";

export function build(ctx, s, box) {
  const col = ctx.el("div", "kolom tengah", null, box, { top: "640px" });
  const atas = ctx.el("div", "pendukung", s.atas, col, { fontSize: "64px" });
  ctx.animate(atas, s.t0, "rise");

  const row = ctx.el("div", null, null, col, { marginTop: "36px" });
  const k = ctx.el("span", "ib kunci", s.kunci.teks, row, { fontSize: "220px" });
  const akhiran = ctx.el("span", "ib pendukung", s.kunci.akhiran, row, { fontSize: "84px", marginLeft: "6px" });
  const tk = ctx.t(s.kunci.muncul);
  ctx.animate(k, tk, "rise");
  ctx.animate(akhiran, tk + 0.1, "rise");
  ctx.focus(k, tk);

  const bawah = ctx.el("div", null, null, col, { marginTop: "40px", display: "flex", justifyContent: "center", alignItems: "center", gap: "24px" });
  ctx.el("span", "judul", s.bawah.teks, bawah);
  svg(ctx, bawah, 96, 96, '<g fill="none" stroke="var(--biru)" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"><path d="M14 76 L40 50 L56 64 L84 30" /><path d="M60 30 H84 V54" /></g>');
  ctx.animate(bawah, ctx.t(s.bawah.muncul), "rise");
}
