#!/usr/bin/env bash
# Concatenate the scene renders into the Part 01 master.
# Video is re-encoded once (CRF 16) and locked to the exact total frame count; each scene's audio
# is trimmed to its exact scene length so AAC padding cannot drift the sync, then re-encoded once.
set -euo pipefail
cd "$(dirname "$0")/.."
SCENES=(01 02 03 04 05 06 07 08)
SECONDS_PER=(8 10 12 7 5 4 5 4)
FPS=30

inputs=(); vf=""; af=""; vcat=""; acat=""; total=0
for i in "${!SCENES[@]}"; do
  inputs+=(-i "out/Scene${SCENES[$i]}.mp4")
  vf+="[$i:v]setpts=PTS-STARTPTS[v$i];"
  af+="[$i:a]atrim=0:${SECONDS_PER[$i]},asetpts=N/SR/TB[a$i];"
  vcat+="[v$i]"; acat+="[a$i]"
  total=$((total + SECONDS_PER[$i]))
done
n=${#SCENES[@]}
ffmpeg -v error -y "${inputs[@]}" -filter_complex "${vf}${vcat}concat=n=$n:v=1:a=0,fps=$FPS[v]" \
  -map "[v]" -frames:v $((total * FPS)) -c:v libx264 -crf 16 -preset slow -pix_fmt yuv420p out/_video.mp4
ffmpeg -v error -y "${inputs[@]}" -filter_complex "${af}${acat}concat=n=$n:v=0:a=1[a]" \
  -map "[a]" -c:a aac -b:a 192k -ar 48000 out/_audio.m4a
ffmpeg -v error -y -i out/_video.mp4 -i out/_audio.m4a -map 0:v -map 1:a -c copy -t "$total" -movflags +faststart out/Part01.mp4
rm -f out/_video.mp4 out/_audio.m4a
echo "Part01.mp4: $total s, $((total * FPS)) frames"
