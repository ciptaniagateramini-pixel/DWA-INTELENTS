#!/usr/bin/env bash
# Separate master for the standalone story Scenes 09–12 = 42 s (not joined to Part 01).
exec "$(dirname "$0")/assemble.sh" out/Master_Scene09-12.mp4 09:8 10:12 11:12 12:10
