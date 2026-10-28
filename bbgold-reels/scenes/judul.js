// Adegan 2 · Judul: kartu krem, kata miring sebagai aksen biru
export function build(ctx, s, box) {
  const col = ctx.el("div", "kolom", null, box, { top: "560px" });
  const card = ctx.el("div", null, null, col);
  // 2.5D ringan: satu kartu miring 5 derajat
  const tilt = ctx.el("div", "kartu", null, card, {
    padding: "72px 64px", transform: "perspective(1600px) rotateY(-5deg) rotateX(3deg)",
  });
  ctx.el("div", "judul", s.baris, tilt, { fontSize: "100px" });
  const tm = ctx.t(s.garis);
  s.miring.split(" ").forEach((w, i) => {
    const line = ctx.el("div", null, null, tilt, { marginTop: i ? "0" : "18px" });
    const wordBox = ctx.el("span", "ib", null, line, { position: "relative" });
    const bar = ctx.el("span", null, null, wordBox, {
      position: "absolute", left: "-8px", right: "-8px", bottom: "14px", height: "38px",
      background: "var(--mustard-muda)", transformOrigin: "0 50%",
    });
    ctx.el("span", "judul miring", w, wordBox, { position: "relative", fontSize: "108px" });
    ctx.animate(bar, tm + 0.1 + i * 0.12, "draw");
  });
  const t0 = s.t0;
  ctx.animate(card, t0, "pop");
  ctx.pop(t0);
}
