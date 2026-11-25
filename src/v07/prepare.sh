#!/usr/bin/env bash
# Build public/v07 (not in git) from uploads/v07: stills -> 2400 px jpg, clips -> 1080p30 muted. Run from the repo root.
set -e
mkdir -p public/v07/img public/v07/clips
for f in uploads/v07/img/P[0-9][0-9][0-9].jpg; do n=$(basename $f .jpg); [ -f public/v07/img/${n#P}.jpg ] || ffmpeg -v error -y -i $f -vf "scale=2400:-2:flags=lanczos" -q:v 3 public/v07/img/${n#P}.jpg; done
for f in uploads/v07/clips/P[0-9][0-9][0-9].mp4; do n=$(basename $f .mp4); [ -f public/v07/clips/${n#P}.mp4 ] || ffmpeg -v error -y -i $f -an -vf "scale=1920:1080:flags=lanczos,fps=30" -c:v libx264 -preset veryfast -crf 19 -g 15 -pix_fmt yuv420p public/v07/clips/${n#P}.mp4; done
echo prepared
