// Bagian bersama antar adegan: sel heksagon, ikon flat, dekorasi canvas, auto-fit teks.

export function hexPoints(cx, cy, r) {
  const pts = [];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 180) * (60 * i - 90);
    pts.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join(" ");
}

const SVGNS = "http://www.w3.org/2000/svg";

export function svg(ctx, parent, w, h, inner, style) {
  const s = document.createElementNS(SVGNS, "svg");
  s.setAttribute("width", w);
  s.setAttribute("height", h);
  s.setAttribute("viewBox", `0 0 ${w} ${h}`);
  s.innerHTML = inner;
  if (style) Object.assign(s.style, style);
  parent.appendChild(s);
  return s;
}

// Ikon garis 64x64, warna mengikuti currentColor
const ICON = {
  centang: '<path d="M14 33 L27 46 L51 20" />',
  jam: '<circle cx="32" cy="32" r="21" /><path d="M32 19 V33 L41 39" />',
  kunci: '<circle cx="22" cy="32" r="10" /><path d="M32 32 H54 M46 32 V41 M53 32 V39" />',
  tunas: '<path d="M32 54 V30" /><path d="M32 34 C32 22 22 16 12 17 C12 28 20 34 32 34 Z" /><path d="M32 29 C32 19 41 13 52 14 C52 24 44 29 32 29 Z" />',
  rumah: '<path d="M12 30 L32 13 L52 30" /><path d="M18 26 V52 H46 V26" /><path d="M28 52 V39 H36 V52" />',
};

export function icon(ctx, parent, name, size, color, bg) {
  const wrap = ctx.el("div", null, null, parent, {
    width: size + "px", height: size + "px", borderRadius: "50%", background: bg,
    display: "flex", alignItems: "center", justifyContent: "center", flex: "none", color,
  });
  const k = Math.round(size * 0.58);
  svg(ctx, wrap, k, k, `<g fill="none" stroke="currentColor" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round" transform="scale(${(k / 64).toFixed(4)})">${ICON[name]}</g>`);
  return wrap;
}

// Kontur sel sarang lebah statis di tepi canvas (mustard muda)
export function decor(ctx, parent) {
  const c = ctx.tokens.color.mustardMuda;
  const cells = [
    [1010, 170, 150], [1150, 430, 150], [-40, 1640, 160], [100, 1880, 160], [-70, 1380, 90],
  ];
  const inner = cells.map(([x, y, r]) => `<polygon points="${hexPoints(x, y, r)}" fill="none" stroke="${c}" stroke-width="8" />`).join("");
  return svg(ctx, parent, 1080, 1920, inner, { position: "absolute", left: "0", top: "0" });
}

// Perkecil font sampai teks muat satu baris di lebar kontainernya
export function fit(el, minPx) {
  let size = parseFloat(getComputedStyle(el).fontSize);
  el.style.whiteSpace = "nowrap";
  while (el.scrollWidth > el.clientWidth + 1 && size > minPx) {
    size -= 2;
    el.style.fontSize = size + "px";
  }
  return size;
}
