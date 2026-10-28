// Adegan 1 · Hook: "Emas atau tanah, mana yang lebih untung?"
export function build(ctx, s, box) {
  const col = ctx.el("div", "kolom tengah", null, box, { top: "430px" });
  s.kata.forEach((k, i) => {
    const row = ctx.el("div", null, null, col, { marginTop: i ? "26px" : "0" });
    const big = !!k.fokus;
    const span = ctx.el("span", big ? "ib kunci" : "ib pendukung", k.teks, row);
    if (big) span.style.fontSize = "200px";
    const t = ctx.t(k.muncul);
    ctx.animate(span, t, "rise");
    if (big) ctx.focus(span, t);
  });
  const wrap = ctx.el("div", null, null, col, { marginTop: "90px" });
  const card = ctx.el("div", "ib kartu pendukung", s.tanya.teks, wrap, { padding: "28px 36px", fontSize: "56px", whiteSpace: "nowrap" });
  const t = ctx.t(s.tanya.muncul);
  ctx.animate(card, t, "pop");
  ctx.pop(t);
}
