#!/usr/bin/env bash
# Concatenate scene renders into one master.
#   tools/assemble.sh out/Name.mp4 01:8 02:10 ...   (scene number : seconds)
# Video is re-encoded once (CRF 16) and locked to the exact total frame count; each scene's audio
# is trimmed to its exact scene length so AAC padding cannot drift the sync, then re-encoded once.
set -euo pipefail
cd "$(dirname "$0")/.."
OUTFILE=$1; shift
FPS=30
inputs=(); vf=""; af=""; vcat=""; acat=""; total=0; i=0
for spec in "$@"; do
  scene=${spec%%:*}; secs=${spec##*:}
  inputs+=(-i "out/Scene${scene}.mp4")
  vf+="[$i:v]setpts=PTS-STARTPTS[v$i];"
  af+="[$i:a]atrim=0:${secs},asetpts=N/SR/TB[a$i];"
  vcat+="[v$i]"; acat+="[a$i]"
  total=$((total + secs)); i=$((i + 1))
done
tmp=$(mktemp -d)
ffmpeg -v error -y "${inputs[@]}" -filter_complex "${vf}${vcat}concat=n=$i:v=1:a=0,fps=$FPS[v]" \
  -map "[v]" -frames:v $((total * FPS)) -c:v libx264 -crf 16 -preset slow -pix_fmt yuv420p "$tmp/v.mp4"
ffmpeg -v error -y "${inputs[@]}" -filter_complex "${af}${acat}concat=n=$i:v=0:a=1[a]" \
  -map "[a]" -c:a aac -b:a 192k -ar 48000 "$tmp/a.m4a"
ffmpeg -v error -y -i "$tmp/v.mp4" -i "$tmp/a.m4a" -map 0:v -map 1:a -c copy -t "$total" -movflags +faststart "$OUTFILE"
rm -rf "$tmp"
echo "$OUTFILE: $total s, $((total * FPS)) frames"
