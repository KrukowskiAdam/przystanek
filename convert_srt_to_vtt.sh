#!/bin/bash

set -euo pipefail

TARGET_DIR="${1:-.}"

if [ ! -d "$TARGET_DIR" ]; then
  echo "Nie znaleziono katalogu: $TARGET_DIR" >&2
  exit 1
fi

pushd "$TARGET_DIR" > /dev/null
shopt -s nullglob

converted=0

# Konwertuje napisy SRT na format WebVTT akceptowany przez przeglądarki
for f in *.srt; do
  [ -f "$f" ] || continue
  base="${f%.srt}"
  target="${base}.vtt"

  python3 - "$f" "$target" <<'PY'
import pathlib
import re
import sys

src = pathlib.Path(sys.argv[1])
dst = pathlib.Path(sys.argv[2])

time_re = re.compile(r"^(\d+):(\d{2}):(\d{2}),(\d{3}) --> (\d+):(\d{2}):(\d{2}),(\d{3})$")

encodings = ("utf-8-sig", "cp1250", "cp1252", "iso-8859-2", "latin-1")
for encoding in encodings:
  try:
    content = src.read_text(encoding=encoding)
    break
  except UnicodeDecodeError:
    if encoding == encodings[-1]:
      raise
else:  # no break
  content = src.read_text(encoding="utf-8", errors="replace")

lines = content.splitlines()
output = ["WEBVTT", ""]

for line in lines:
    line = line.rstrip("\r")
    if time_re.match(line):
        output.append(time_re.sub(r"\1:\2:\3.\4 --> \5:\6:\7.\8", line))
        continue
    if line.isdigit():
        continue
    output.append(line)

dst.write_text("\n".join(output) + "\n", encoding="utf-8")
PY

  echo "Converted: $f -> ${target}"
  converted=$((converted + 1))
done

if [ "$converted" -eq 0 ]; then
  echo "Brak plików .srt w katalogu: $TARGET_DIR"
fi

popd > /dev/null
