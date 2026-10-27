"""Non-destructive background removal: assets/original/** -> assets/clean/** (RGBA PNG).

Uses rembg BiRefNet-general with alpha matting off (BiRefNet produces soft
edges natively), then decontaminates edge colour so no white halo remains
against dark backgrounds.
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from rembg import new_session, remove

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets/original"
DST = ROOT / "assets/clean"


def decontaminate(rgba: np.ndarray, bg=(255, 255, 255)) -> np.ndarray:
    """Un-premultiply the white background out of semi-transparent edge pixels."""
    out = rgba.astype(np.float32)
    a = out[..., 3:4] / 255.0
    edge = (a > 0.02) & (a < 0.98)
    bgv = np.array(bg, np.float32)
    fg = (out[..., :3] - bgv * (1 - a)) / np.maximum(a, 1e-3)
    out[..., :3] = np.where(edge, np.clip(fg, 0, 255), out[..., :3])
    return out.astype(np.uint8)


def main(paths):
    session = new_session("birefnet-general")
    for p in paths:
        p = Path(p).resolve()
        dst = DST / p.relative_to(SRC).with_suffix(".png")
        dst.parent.mkdir(parents=True, exist_ok=True)
        im = Image.open(p)
        if im.mode == "RGBA" and (np.array(im)[..., 3] < 10).mean() > 0.05:
            # already has a real alpha channel: keep it as-is
            im.save(dst)
            print("KEEP-ALPHA", dst, flush=True)
            continue
        cut = remove(im.convert("RGB"), session=session)
        arr = decontaminate(np.array(cut))
        Image.fromarray(arr, "RGBA").save(dst, optimize=True)
        print("CUT", dst, flush=True)


if __name__ == "__main__":
    main(sys.argv[1:] or sorted(str(p) for p in SRC.rglob("*") if p.is_file()))
