# Production log — DWA AGENT INTELLIGENT Part 01

Master: 1080×1920, 30 fps, H.264, 900 frames (Scene 01 = 240, Scene 02 = 300, Scene 03 = 360).

## Approvals
- Gate A (asset audit) + Gate B (Scene 01 test): approved by user after preview.
- Gate C: user chose ElevenLabs voice **Adrianleoh** directly, no samples.
- Scene 01 full preview approved; user asked to finish without further test iterations.

## Scene 01 — Owner (0–8 s)
Three Owner poses side by side in one world; camera dives from overview to each pose in turn.
Texts (verbatim): "Kenalin Owner TOKO BB GOLD" (f14), "Tinggal kirim perintah" (f100),
"Terima laporan rapih ONTIME" (f180). Bubbles grow from the phone: "Buat riset harga kompetitor kepada Marzuki" (f112, typing dots first),
"Laporan penjualan hari ini xxxx" (f186). VO from f8. SFX: whoosh f0/f80/f160, pop on titles, typing f112, ting f186.

## Scene 02 — AI Staff (8–18 s)
Header "DWA AGENT INTELLIGENT" (white), footer "AI STAFF TOKO BB GOLD" (f204, pop). VO from f10.
**Arrival order** (one every 15 frames = 0.5 s, from scene frame 18):

| # | Robot | Scene frame | Grid cell |
|---|---|---|---|
| 1 | Bu Mila | 18 | row 1, left |
| 2 | Marzuki | 33 | row 1, centre |
| 3 | Acep | 48 | row 1, right |
| 4 | Bambang | 63 | row 2, left |
| 5 | Angga | 78 | row 2, centre |
| 6 | Fitri | 93 | row 2, right |
| 7 | Wawan | 108 | row 3, left |
| 8 | Lilis | 123 | row 3, centre |
| 9 | Baron | 138 | row 3, right |
| 10 | Winda | 153 | row 4, left |
| 11 | Fajar | 168 | row 4, centre |
| 12 | Amanda | 183 | row 4, right |

12 pop cues (one per arrival), whoosh at start and before the footer.

## Scene 03 — Struktur (18–30 s)
Title "struktur kerja Agent". No narrator: low electric hum + zap on every card arrival.
Hierarchy: Owner → Marzuki (dashed gold direct link, bypassing Bu Mila) and Owner → Bu Mila (HRD) →
Acep (Harga), Bambang (Divisi Pelanggan, red accent + larger glow), Angga (Marketing).
Bambang → Fitri (WhatsApp), Wawan (Instagram), Lilis (TikTok), Baron (BB App), Penjaga Toko (Janji Temu), Kurir Toko (Pickup / COD).
Angga → Winda (Follow-up), Fajar (Email / Broadcast), Amanda (Konten).
Energy travels top-down; cards light up on arrival; camera follows then zooms out (f176→f215) to the full diagram; looping pulses afterwards.
Customer images (Bu Rina, Bu Wiwi, Pak Tata, Adrian) are not used.
Penjaga Toko and Kurir Toko (human store roles) are shown as store staff per the brief's hierarchy.

## Deliverables (Gate E/F)
| File | Frames | Duration | Notes |
|---|---|---|---|
| `out/Part01.mp4` | 900 | 30.000 s | Master, H.264 1080×1920 30 fps, AAC 48 kHz, -19.1 LUFS integrated |
| `out/Scene01.mp4` | 240 | 8 s | |
| `out/Scene02.mp4` | 300 | 10 s | camera tracking clamped after QA found row 1 sliding under the header |
| `out/Scene03.mp4` | 360 | 12 s | |

Master assembly: `tools/assemble_master.sh` (one re-encode, locked to 900 frames; each scene's audio trimmed to its exact length).
The `Part01` Remotion composition renders the same sequence directly.

Final QA on the master file: frames at start/middle/end of every scene inspected — text spelling verbatim,
all 12 robots present, Bambang in Scenes 2 and 3, energy flows top-down, no customer images, no clipping of characters.
Open item: word-level VO check by ear (automatic transcription unavailable in this environment).
