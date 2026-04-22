#!/usr/bin/env bash
# Randomly play all video files in a directory (and subdirectories) with mpv.
# Usage: play-random-mpv.sh [DIR]
# If DIR is omitted, uses the current directory.
set -euo pipefail

DIR="${1:-.}"

# Build a shuffled temporary playlist of common video file types
TMP_PLAYLIST="$(mktemp --suffix=.mpv-playlist)"
cleanup() { rm -f "$TMP_PLAYLIST"; }
trap cleanup EXIT

# Find common video extensions (case-insensitive), shuffle, and write to playlist
# Notes:
# - We use -print0 and shuf -z to handle arbitrary filenames safely.
# - Write absolute paths so mpv resolves entries correctly regardless of playlist location.
find "$DIR" -type f \
  \( -iname '*.mp4' -o -iname '*.mkv' -o -iname '*.webm' -o -iname '*.mov' \
     -o -iname '*.avi' -o -iname '*.wmv' -o -iname '*.flv' -o -iname '*.m4v' \
     -o -iname '*.mpg' -o -iname '*.mpeg' -o -iname '*.ts' -o -iname '*.m2ts' \) \
  -print0 \
  | shuf -z \
  | while IFS= read -r -d '' f; do
      # Use realpath to canonicalize to absolute paths; -m tolerates missing components safely
      realpath -m -- "$f"
    done \
  > "$TMP_PLAYLIST"

# If no files were found, exit gracefully
if [[ ! -s "$TMP_PLAYLIST" ]]; then
  echo "No video files found under: $DIR" >&2
  exit 1
fi

# Play the shuffled playlist once.
mpv --playlist="$TMP_PLAYLIST" --profile=default
