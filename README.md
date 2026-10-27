# DWA AGENT INTELLIGENT — Part 01

Remotion project for the 30 s vertical (1080×1920, 30 fps) Part 01 video.

- `assets/clean/` — transparent PNG derivatives of the Drive character renders (originals stay in Drive).
- `docs/ASSET_AUDIT.md` — Quality Gate A report.
- `tools/remove_bg.py` — background removal (rembg BiRefNet-general + edge decontamination).
- `tools/make_sfx.py` — synthesises the royalty-free SFX in `public/sfx/`.

```bash
npm install
npm run render:test   # Scene01Test -> out/scene01_test.mp4
npm run studio        # interactive preview
```
