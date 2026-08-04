#!/usr/bin/env bash
#
# ONE-TIME BOOTSTRAP — delete this file once public/speakers/ is committed.
#
# Downloads the 12 generated speaker portraits, converts them to WEBP and wires
# them up:
#
#   bash scripts/fetch-portraits.sh
#
# This exists because the environment the portraits were generated from cannot
# reach the CDN they were generated onto: the Higgsfield MCP call goes out over
# the MCP transport, but downloading the result needs ordinary egress, and
# d8j0ntlcm91z4.cloudfront.net is refused by the egress gateway with a 403 on
# CONNECT. Relaying the bytes through a permitted host would be routing around
# that policy, so the download happens here on a machine that can just fetch it.
#
# The URLs are temporary — run this soon. If any 404 or 403, the generations are
# still in the Higgsfield workspace and can be re-downloaded from there by hand
# into public/speakers/<slug>.png, then `bun run to:webp public/speakers
# --width=1024 && bun run build:portraits --manifest-only`.
#
# Slug→URL was verified against the prompt each job actually returned, not
# against index order across two separate API calls.

set -uo pipefail

CDN="https://d8j0ntlcm91z4.cloudfront.net/user_3F7VDkdsG8fQnRbjbgDG1EpXjWd"

# slug|filename
PAIRS=(
  "dr-maya-ellison|hf_20260804_175444_33bdf984-818a-44ea-a7b1-7b07b5e95d2d.png"
  "james-okoro|hf_20260804_175625_87b5f317-e8d6-477b-9aab-3a765e34a0d7.png"
  "sarah-lindqvist|hf_20260804_175625_6eb8de13-b9ff-4f4d-be29-b0e884db1781.png"
  "priya-raman|hf_20260804_175625_0f63bb37-c7d1-4292-b156-4cf8a71b1136.png"
  "michael-toure|hf_20260804_175626_bbff2d3e-0ab7-4290-afcc-a66ed3d7ebf8.png"
  "helena-brandt|hf_20260804_175626_6756b824-91a5-46bd-81f8-d472eae88c3c.png"
  "daniel-hsu|hf_20260804_175626_9b34064f-001c-4693-989d-7e0c644561d8.png"
  "grace-oyelaran|hf_20260804_175626_e96f88a3-6afc-48de-b04b-5b17f24bcdda.png"
  "andres-molina|hf_20260804_175625_3375ab88-68f1-422d-a4e3-81bc9bbffa92.png"
  "nina-castellan|hf_20260804_175626_5acd6264-9956-4e76-b3aa-4abe7a4aed6c.png"
  "omar-haddad|hf_20260804_175625_35a59e50-f40b-4616-90a8-ecc17bcfce8d.png"
  "robert-ainsley|hf_20260804_175626_9e9a9aad-83ce-4751-9ded-920fd0a9bc30.png"
)

if [ ! -f package.json ] || [ ! -d src/data ]; then
  echo "Run this from the summonspeakers repo root." >&2
  exit 1
fi

mkdir -p public/speakers

echo "Downloading 12 portraits…"
ok=0; fail=0
for pair in "${PAIRS[@]}"; do
  slug="${pair%%|*}"; file="${pair#*|}"
  dest="public/speakers/$slug.png"
  if curl -fsSL --retry 3 --retry-delay 2 --max-time 180 -o "$dest" "$CDN/$file"; then
    echo "  ok    $slug  ($(du -h "$dest" | cut -f1))"
    ok=$((ok+1))
  else
    echo "  FAIL  $slug" >&2
    rm -f "$dest"
    fail=$((fail+1))
  fi
done

echo
echo "$ok downloaded, $fail failed"
if [ "$fail" -gt 0 ]; then
  echo "Some URLs may have expired — re-fetch those from the Higgsfield workspace." >&2
fi
[ "$ok" -eq 0 ] && exit 1

# Chromium does the encoding, so this needs no cwebp, ImageMagick or sharp. The
# raw files are 1536x2048 and a few MB each; 1024 wide is still 2x the largest
# size the site displays them at.
echo
echo "Converting to WEBP…"
bun run to:webp public/speakers --width=1024

echo
echo "Wiring them up…"
bun run build:portraits --manifest-only

echo
echo "Now check them and commit:"
echo "  bun run dev     # /speakers and /speakers/dr-maya-ellison"
echo "  git add public/speakers src/data/speaker-portraits.ts"
echo "  git commit -m 'Add generated speaker portraits'"
