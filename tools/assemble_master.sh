#!/usr/bin/env bash
# Concatenate the three scene renders into the 30.00 s Part 01 master.
# Video is re-encoded once (CRF 16) and locked to exactly 900 frames; each scene's audio is trimmed to its
# exact scene length so AAC padding cannot drift the sync, then re-encoded once.
set -euo pipefail
cd "$(dirname "$0")/.."
ffmpeg -v error -y -i out/Scene01.mp4 -i out/Scene02.mp4 -i out/Scene03.mp4 -filter_complex \
  "[0:v]setpts=PTS-STARTPTS[v0];[1:v]setpts=PTS-STARTPTS[v1];[2:v]setpts=PTS-STARTPTS[v2];[v0][v1][v2]concat=n=3:v=1:a=0,fps=30[v]" \
  -map "[v]" -frames:v 900 -c:v libx264 -crf 16 -preset slow -pix_fmt yuv420p out/_video.mp4
ffmpeg -v error -y -i out/Scene01.mp4 -i out/Scene02.mp4 -i out/Scene03.mp4 -filter_complex \
  "[0:a]atrim=0:8,asetpts=N/SR/TB[a0];[1:a]atrim=0:10,asetpts=N/SR/TB[a1];[2:a]atrim=0:12,asetpts=N/SR/TB[a2];[a0][a1][a2]concat=n=3:v=0:a=1[a]" \
  -map "[a]" -c:a aac -b:a 192k -ar 48000 out/_audio.m4a
ffmpeg -v error -y -i out/_video.mp4 -i out/_audio.m4a -map 0:v -map 1:a -c copy -t 30 -movflags +faststart out/Part01.mp4
rm -f out/_video.mp4 out/_audio.m4a
