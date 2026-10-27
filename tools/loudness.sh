#!/usr/bin/env bash
# Raise a finished MP4 to social-media loudness (-14 LUFS integrated, -1 dBTP) with two-pass loudnorm.
# Video is stream-copied; only the audio is processed. Usage: tools/loudness.sh in.mp4 out.mp4
set -euo pipefail
IN=$1; OUT=$2
stats=$(ffmpeg -hide_banner -i "$IN" -af loudnorm=I=-14:TP=-1:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
get() { echo "$stats" | python3 -c "import json,sys;print(json.load(sys.stdin)['$1'])"; }
ffmpeg -v error -y -i "$IN" -map 0:v -map 0:a -c:v copy \
  -af "loudnorm=I=-14:TP=-1:LRA=11:measured_I=$(get input_i):measured_TP=$(get input_tp):measured_LRA=$(get input_lra):measured_thresh=$(get input_thresh):offset=$(get target_offset):linear=true" \
  -c:a aac -b:a 192k -ar 48000 -t "$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$IN")" -movflags +faststart "$OUT"
