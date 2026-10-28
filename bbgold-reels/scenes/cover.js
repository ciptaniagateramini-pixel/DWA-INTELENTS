// Cover Reels: canvas mustard, judul di tengah (aman untuk crop grid 3:4)
import { decor } from "./_shared.js";

export function build(ctx, c, box) {
  box.style.background = "var(--mustard)";
  decor(ctx, box);
  const col = ctx.el("div", "kolom tengah", null, box, { top: "0", height: "1920px", display: "flex", flexDirection: "column", justifyContent: "center" });
  ctx.el("div", "label", c.label, col, { fontWeight: "500", marginBottom: "40px" });
  c.baris.forEach((b) => {
    if (b.kunci) ctx.el("div", "kunci", b.kunci, col, { fontSize: "230px", lineHeight: "1.02" });
    else ctx.el("div", "pendukung", b.teks, col, { fontSize: "72px", margin: "10px 0" });
  });
  const wrap = ctx.el("div", null, null, col, { marginTop: "60px" });
  ctx.el("div", "ib kartu pendukung", c.sub, wrap, { padding: "30px 48px" });
  ctx.el("div", "pendukung", "@tokobbgold", col, { marginTop: "60px", fontWeight: "700", fontSize: "56px" });
}
