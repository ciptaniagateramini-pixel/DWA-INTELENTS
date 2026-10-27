# Production log — DWA AGENT INTELLIGENT Part 01

Master: 1080×1920, 30 fps, H.264, 1650 frames = 55 s
(Scene 01 = 240, 02 = 300, 03 = 360, 04 = 210, 05 = 150, 06 = 120, 07 = 150, 08 = 120).
Earlier masters kept: `out/Part01_30s_v1.mp4` (Scenes 01–03), `out/Part01_37s_v2.mp4` (Scenes 01–04).

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

## Scene 04 — Perintah dari mana saja (30–37 s), added on user request
Owner (typing pose) in front, relaxed and floating; the agent chain works behind her (parallax back layer).
Chat pops from the phone (verbatim): "Atur harga buyback hari ini" (f34, send + pop).
Energy: phone → Bu Mila (f66) → Acep (f82) → Bambang (f98) → channel cards Fitri/WhatsApp (f116), Wawan/Instagram (f121),
Lilis/TikTok (f126), Baron/BB App (f131). Each channel shows a sync bar filling and a green check = price updated.
Channel badges use the supplied 3D logos (WA, Instagram, TikTok — original alpha, PASS); BB App has no supplied logo, so a yellow "BB" tile is used.
SFX: whoosh, typing, send, pop, zap ×3, sync blip ×4, ting, low hum. No VO (none requested).
"toko bb" in the request was interpreted as the BB App channel (Baron).

## Scene 05 — Riset ke Marzuki (37–42 s)
Owner (typing pose) in front. Chat (verbatim as supplied): "Riset ide konten & hastage dan KOL yang cocok" (f30).
Gold dashed direct link phone → Marzuki (f62); research icons (search, #, KOL star, idea) orbit him.
Pink link Marzuki → Amanda (f98); Amanda produces content: video/photo/#/idea tiles pop out with progress rings, REC dot blinks.
SFX: whoosh, typing, send, pop, zap ×2, small pops, sync blips.

## Scene 06 — Amanda kirim ke Owner (42–46 s), different look
Magenta wash + diagonal light streaks. Amanda large top-left; Owner (reading pose) bottom-right.
Amanda reflects a pink energy beam straight into the Owner's phone; four content packets ride it in,
the complete content pack card pops on the phone (f80, ting), Owner replies "Oke" (f90, send + pop), Amanda bounces.

## Scene 07 — Perintah ke Bu Mila (46–51 s)
User wrote "robot mira"; no such asset exists, interpreted as **Bu Mila** (HRD hub).
Owner (present pose, phone showing content) in front. Chat (verbatim as supplied):
"Distributikan konten ini ke divisi kanal, dan hubungi team marketing untuk follow up dan broadcast promo" (f24).
Content packets travel phone → Bu Mila (f60) → Bambang + Angga (f78) → Fitri/Wawan/Lilis/Baron and Winda/Fajar (f96–108), each with sync bar + check.

## Scene 08 — Marketing menyebar pesan (51–55 s)
Angga (Marketing), Winda (Follow-up), Fajar (Email / Broadcast) in the centre; 56 generic contact nodes (database) above and below.
Chat/megaphone/mail packets fly out on arcs; each contact lights up with a ripple. No customer images used.
SFX: whoosh, zap, send ×3, sync ticks, ting.

## Deliverables (Gate E/F)
| File | Frames | Duration | Notes |
|---|---|---|---|
| `out/Part01.mp4` | 1650 | 55.000 s | Master Scenes 01–08, H.264 1080×1920 30 fps, AAC 48 kHz, -20.4 LUFS integrated |
| `out/Part01_37s_v2.mp4` | 1110 | 37.000 s | Previous master (Scenes 01–04) |
| `out/Part01_30s_v1.mp4` | 900 | 30.000 s | Previous master (Scenes 01–03) |
| `out/Scene01.mp4` | 240 | 8 s | |
| `out/Scene02.mp4` | 300 | 10 s | camera tracking clamped after QA found row 1 sliding under the header |
| `out/Scene03.mp4` | 360 | 12 s | |
| `out/Scene04.mp4` | 210 | 7 s | |
| `out/Scene05.mp4` | 150 | 5 s | |
| `out/Scene06.mp4` | 120 | 4 s | |
| `out/Scene07.mp4` | 150 | 5 s | |
| `out/Scene08.mp4` | 120 | 4 s | |

Master assembly: `tools/assemble_master.sh` (one re-encode, locked to 900 frames; each scene's audio trimmed to its exact length).
The `Part01` Remotion composition renders the same sequence directly.

Final QA on the master file: frames at start/middle/end of every scene inspected — text spelling verbatim,
all 12 robots present, Bambang in Scenes 2 and 3, energy flows top-down, no customer images, no clipping of characters.
Open item: word-level VO check by ear (automatic transcription unavailable in this environment).

## Scene 09 — standalone short (8 s, 240 frames), NOT part of the Part01 master
File: `out/Scene09.mp4`. Customer assets are used here (allowed for this scene by the user); cut-outs in `assets/clean/customers/`.
Pairs: Bu Rina → WhatsApp → Fitri, Bu Wiwi → Instagram → Wawan, Pak Tata → TikTok → Lilis, Adrian → BB App → Baron.
Camera walks each pair (customer → channel logo → robot), then pulls back to show all four pairs in one frame.
Chat bubbles (WhatsApp-style, sender name + read ticks), typo-corrected per the user's request:
- Bu Rina: "Halo, saya mau jual emas muda nih"
- Bu Wiwi: "Halo, saya mau jual emas tua. Tapi mau di-pickup ya."
- Pak Tata: "Min, saya mau jual kalung. Sekalian mau pesan custom lagi. Minggu depan ke sana."
- Adrian: no message text was supplied → shown as an in-app order (BB tile + bag icon), no invented text.
Each bubble pops with ting + pop; each robot lights up (zap + sync) the moment its message arrives.
Narration (typo-corrected): "Beginilah cara kerja mereka yang dirancang oleh team D.W.A untuk TOKO BB" — shown on screen.
**VO blocked:** ElevenLabs rejected the generation ("Free Tier access has been disabled … upgrade to a paid subscription").
The VO slot is wired (`VO_FILE` in `src/scenes/Scene09.tsx`); add the audio file and re-render to include it.

## Scene 10 — standalone (12 s, 360 frames), continues Scene 09, NOT part of the Part01 master
File: `out/Scene10.mp4`. Opens on Scene 09's final framing, same layout; adds a destination column.
Per case the camera glides customer → robot → destination (sine easing):
1. the customer's Scene 09 message collapses to a one-line quote, the robot replies (typing dots, then a green "sent" bubble);
2. a processing badge spins, then shows the result: FIX JUAL / JUAL • PICKUP / RENCANA JUAL / BELI EMAS • NO. BOOKING;
3. a packet travels to the destination, which lights up with a sync bar + check:
   Bu Rina → Fitri → Penjaga Toko · Bu Wiwi → Wawan → Kurir Toko · Pak Tata → Lilis → Winda (Follow-up) · Adrian → Baron → Penjaga Toko.
Ends with a pull-back showing the whole flow.
Robot reply texts were not in the brief; neutral placeholders (editable in `REPLIES`, `src/scenes/Scene10.tsx`):
"Siap, Bu Rina! Langsung kami proses ya." / "Siap, Bu Wiwi! Kurir kami jemput ya." / "Siap, Pak Tata! Kami catat dulu ya." / "Pembelian diterima. No. booking dikirim."
VO: the user's recording `Toko bb.m4a` from the main Drive folder (6.19 s, speech 0.3–5.6 s), high-pass 70 Hz + loudnorm,
placed at frame 18, unedited and not time-stretched. Content not transcribed (no transcription available in this environment).
SFX: whoosh per case, send + pop per reply, sync per result, zap + ting per hand-off, low hum. Mix -18.2 LUFS.

## Scene 11 — Rekap data (12 s, 360 frames)
User wrote "bu mira" → **Bu Mila**. Owner (typing pose) sends "Rekap semua data bulan ini." (typing dots → bubble).
Energy climbs to Bu Mila (camera follows up). Ten source robots around her (Fitri, Wawan, Lilis, Baron, Penjaga Toko,
Kurir Toko → transaksi; Angga, Amanda, Fajar → iklan; Winda → prospek) stream 30 data packets into her; a progress ring
and three category chips (Data Transaksi / Data Iklan / Data Prospek) fill. Report card (doc + chart) pops (f212),
rides the rail down to the Owner's phone (camera follows down; Owner now in reading pose), and Bu Mila's bubble lands:
"Laporan selesai. Apakah mau sekalian saya cetak PDF untuk arsip?" (typo-corrected from the brief).
SFX: whoosh, typing, send, zap, sync ticks, ting + pop on compile and on the reply, hum.

## Scene 12 — Penutup (10 s, 300 frames)
"DWA X TOKO BB" highlight (Poppins ExtraBold, yellow X, shine sweep, underline), then text on wiping blocks:
"Mau bisnismu lebih efisien?" / "Mau custom sesuai kebutuhan bisnismu juga?" (typo "custome" corrected),
CTA block "Bisa diskusi ke link bio atau" + WA logo + 0882000119208. Parade of the 12 AI staff along the bottom.
Music: `public/music/outro_scene12.wav` — original track synthesised by `tools/make_music.py` (112 BPM, C–G–Am–F), royalty-free; Scene 12 only.

## Master Scene 09–12 (separate from Part 01)
`out/Master_Scene09-12.mp4` — 1260 frames, 42.000 s, -21.2 LUFS; built by `tools/assemble_master_09_12.sh`.
