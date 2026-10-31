#!/usr/bin/env bash
# Synthesizes the style-2 sound effects into public/sfx (royalty-free, generated).
set -euo pipefail
cd "$(dirname "$0")/../public/sfx"
g(){ ffmpeg -loglevel error -y -f lavfi -i "$2" -af "${3:-anull}" -ar 44100 -ac 1 "$1"; }
g whoosh.wav "anoisesrc=color=pink:duration=0.9:amplitude=0.9" "highpass=f=250,lowpass=f=3200,afade=t=in:d=0.35:curve=qsin,afade=t=out:st=0.4:d=0.5:curve=qsin,volume=1.6"
g whoosh_long.wav "anoisesrc=color=brown:duration=2.4:amplitude=1" "highpass=f=120,lowpass=f=1800,afade=t=in:d=1.4:curve=exp,afade=t=out:st=1.6:d=0.8,volume=2.5"
g pop.wav "aevalsrc=sin(2*PI*t*(520+2600*t))*exp(-t*28):d=0.18" "volume=0.9"
g ding.wav "aevalsrc=(0.6*sin(2*PI*1318*t)+0.3*sin(2*PI*2637*t)+0.15*sin(2*PI*3951*t))*exp(-t*5):d=1.0"
g tick.wav "aevalsrc=sin(2*PI*2400*t)*exp(-t*300):d=0.03"
g chatter.wav "aevalsrc=0.35*sgn(sin(2*PI*t*(900+700*mod(floor(t*28)*7\,5))))*gt(mod(floor(t*28)\,3)\,0)*exp(-mod(t\,1/28)*60):d=0.9" "lowpass=f=4000,afade=t=out:st=0.6:d=0.3"
g travel.wav "aevalsrc=0.4*sin(2*PI*t*(180+260*t))*(1-exp(-t*8)):d=1.3" "afade=t=out:st=1.0:d=0.3,lowpass=f=1500"
g riser.wav "aevalsrc=0.35*sin(2*PI*t*(200+500*t*t))+0.15*sin(2*PI*t*(400+1000*t*t)):d=1.4" "afade=t=in:d=0.6,afade=t=out:st=1.2:d=0.2"
g close.wav "aevalsrc=sin(2*PI*t*(1400-1800*t))*exp(-t*25):d=0.15"
