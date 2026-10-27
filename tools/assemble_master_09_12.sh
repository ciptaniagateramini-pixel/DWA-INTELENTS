#!/usr/bin/env bash
# Part 1A: separate master for the standalone story Scenes 09–12 = 42 s (not joined to Part 1).
# After assembling, raise loudness: tools/loudness.sh in.mp4 out.mp4
exec "$(dirname "$0")/assemble.sh" "out/Hasil master part 1A.mp4" 09:8 10:12 11:12 12:10
