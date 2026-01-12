#!/bin/bash
# Prosty skrypt konwersji SRT na VTT
for f in *.srt; do
  if [ -f "$f" ]; then
    base="${f%.srt}"
    echo "WEBVTT" > "${base}.vtt"
    echo "" >> "${base}.vtt"
    tail -n +1 "$f" >> "${base}.vtt"
    echo "Converted: $f -> ${base}.vtt"
  fi
done
