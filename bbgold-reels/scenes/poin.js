// Adegan 4 · Poin 1: cara untung emas vs tanah, lalu cara memanfaatkan tanah
import { icon } from "./_shared.js";

export function build(ctx, s, box) {
  const col = ctx.el("div", "kolom", null, box, { top: "360px", display: "flex", flexDirection: "column", gap: "40px" });
  s.kartu.forEach((k) => {
    const card = ctx.el("div", "kartu", null, col, { padding: "44px 56px" });
    const kunci = ctx.el("span", "ib kunci", k.kunci, card, { fontSize: "140px" });
    const subBox = ctx.el("div", null, null, card, { position: "relative", marginTop: "16px", height: "73px" });
    const sub = ctx.el("div", "pendukung", k.sub, subBox, { position: "absolute", left: "0", top: "0" });
    const t = ctx.t(k.muncul);
    ctx.animate(card, t, "pop");
    ctx.pop(t);
    ctx.focus(kunci, ctx.t(k.fokus));
    if (k.keluar) ctx.animate(card, ctx.t(k.keluar), "out");
    if (k.gantiSub) {
      const tg = ctx.t(k.gantiSub.muncul);
      ctx.animate(sub, tg, "fadeOut");
      const sub2 = ctx.el("div", "pendukung", k.gantiSub.teks, subBox, { position: "absolute", left: "0", top: "0" });
      ctx.animate(sub2, tg + 0.15, "fade");
    }
  });
  const chips = ctx.el("div", null, null, col, { display: "flex", flexDirection: "column", gap: "22px", paddingLeft: "40px" });
  s.chip.forEach((c) => {
    const chip = ctx.el("div", "kartu", null, chips, {
      display: "inline-flex", alignSelf: "flex-start", alignItems: "center", gap: "26px",
      padding: "22px 48px 22px 24px", borderRadius: "70px",
    });
    icon(ctx, chip, c.ikon, 84, "var(--krem)", "var(--biru)");
    ctx.el("span", "pendukung", c.teks, chip);
    const t = ctx.t(c.muncul);
    ctx.animate(chip, t, "pop");
    ctx.pop(t);
  });
}
