# Tutorial: beli & pasang Skill Video Iklan Claude

Video 9:16 (1080x1920, 30 fps, 65,8 detik) gaya TS: cara checkout di Lynk
(lynk.id/teramini/g9md090qrrx5), lalu cara memasang skill `iklan-pop` di Claude Code,
ditutup contoh hasil (Abona & Semur Jengkol, tanpa suara asli) di mockup HP.

- `tutorial-skill-claude.mp4`: video final (narasi `Suara_liny_id.mp3` + efek ketukan/ketikan)
- `tutorial.html`: semua adegan; `frame(t)` menggambar frame pada detik t
- `render.js`: Playwright, menangkap frame (`node render.js tutorial.html out all 65.8`)
- `sfx.py`: membuat efek ketukan, ketikan, dan whoosh

Narasi diberi jeda 4 detik pada detik 58,2 supaya bagian "Hasilnya" sempat memutar video.
Tampilan halaman Lynk digambar ulang dari tangkapan layar asli; tampilan email pembelian adalah ilustrasi.
