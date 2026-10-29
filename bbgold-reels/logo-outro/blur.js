// Render frame logo outro dengan motion blur: rata-rata 8 sub-frame (alpha premultiplied).
import { drawFrame, blurActive, FPS } from "./logo.js";

const SUB = 8, SHUTTER = 0.75, W = 1080, H = 1920;

export function makeRenderer(canvas) {
  const ctx = canvas.getContext("2d");
  const off = new OffscreenCanvas(W, H);
  const octx = off.getContext("2d", { willReadFrequently: true });
  return function render(t, opt) {
    if (!blurActive(t)) { drawFrame(ctx, t, opt); return; }
    const n = W * H * 4;
    const acc = new Float32Array(n);
    for (let i = 0; i < SUB; i++) {
      drawFrame(octx, t + ((i + 0.5) / SUB - 0.5) * (SHUTTER / FPS), opt);
      const d = octx.getImageData(0, 0, W, H).data;
      for (let j = 0; j < n; j += 4) {
        const a = d[j + 3];
        acc[j] += d[j] * a; acc[j + 1] += d[j + 1] * a; acc[j + 2] += d[j + 2] * a; acc[j + 3] += a;
      }
    }
    const out = new ImageData(W, H);
    for (let j = 0; j < n; j += 4) {
      const a = acc[j + 3];
      if (a > 0) { out.data[j] = acc[j] / a; out.data[j + 1] = acc[j + 1] / a; out.data[j + 2] = acc[j + 2] / a; }
      out.data[j + 3] = a / SUB;
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.putImageData(out, 0, 0);
  };
}
