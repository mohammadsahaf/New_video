#!/usr/bin/env bash
# Rebuild public/v06 (not in git: ~200 MB) from uploads/v06: stills → jpg 2400 px, clips → 1080p30, narration → one mp3,
# and the coastline rasters for the maps. Run from the repo root: bash src/v06/prepare.sh
set -e
mkdir -p public/v06/img public/v06/clips public/v06/map
for f in uploads/v06/[0-9][0-9].png; do n=$(basename $f .png); ffmpeg -v error -y -i $f -vf "scale=2400:-2:flags=lanczos" -q:v 3 public/v06/img/$n.jpg; done
ffmpeg -v error -y -ss 4 -i uploads/v06/43.mp4 -frames:v 1 -vf "scale=2400:-2:flags=lanczos" -q:v 3 public/v06/img/43.jpg
for f in uploads/v06/[0-9][0-9].mp4; do ffmpeg -v error -y -i $f -an -vf "scale=1920:1080:flags=lanczos,fps=30" -c:v libx264 -preset veryfast -crf 19 -g 15 -pix_fmt yuv420p public/v06/clips/$(basename $f); done
for f in uploads/v06/narration/V06-*.mp3; do ffmpeg -v error -i $f -f s16le -ac 1 -ar 44100 -; done > /tmp/v06voice.raw
ffmpeg -v error -y -f s16le -ac 1 -ar 44100 -i /tmp/v06voice.raw -c:a libmp3lame -b:a 192k public/v06/voice.mp3
for k in world levant bosphorus; do npx remotion still V06-Sea-$k public/v06/map/sea-$k.png --image-format=png --log=error; done
