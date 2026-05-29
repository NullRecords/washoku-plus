#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-https://www.washokuplus.com}"
APP_STORE_URL="https://apps.apple.com/il/app/washokuplus/id6771856203"

PAGES=(
  "/"
  "/ios.html"
  "/menu.html"
  "/sprout-kitchen.html"
  "/guides/what-is-washoku.html"
)

failures=0

log_ok() {
  echo "[OK] $1"
}

log_fail() {
  echo "[FAIL] $1"
  failures=$((failures + 1))
}

fetch_page() {
  local url="$1"
  curl -fsSL --max-time 30 "$url"
}

expect_contains() {
  local haystack="$1"
  local needle="$2"
  local label="$3"
  if grep -Fq "$needle" <<<"$haystack"; then
    log_ok "$label"
  else
    log_fail "$label (missing: $needle)"
  fi
}

echo "Running SEO smoke test against $BASE_URL"

# Core files
robots_content="$(fetch_page "$BASE_URL/robots.txt")"
sitemap_content="$(fetch_page "$BASE_URL/sitemap.xml")"

expect_contains "$robots_content" "Sitemap: $BASE_URL/sitemap.xml" "robots.txt advertises sitemap"
expect_contains "$sitemap_content" "<urlset" "sitemap has urlset"

for path in "${PAGES[@]}"; do
  url="$BASE_URL$path"
  page_content="$(fetch_page "$url")"

  if [[ "$path" == "/" ]]; then
    expected_canonical="$BASE_URL/"
  else
    expected_canonical="$url"
  fi

  expect_contains "$page_content" "<link rel=\"canonical\" href=\"$expected_canonical\"" "canonical present for $path"
  expect_contains "$page_content" "<meta property=\"og:url\" content=\"$expected_canonical\"" "og:url present for $path"
  expect_contains "$page_content" "name=\"twitter:card\"" "twitter card present for $path"
  expect_contains "$page_content" "name=\"apple-itunes-app\" content=\"app-id=6771856203\"" "apple app banner meta present for $path"

done

home_content="$(fetch_page "$BASE_URL/")"
expect_contains "$home_content" "$APP_STORE_URL" "homepage links to App Store listing"

if (( failures > 0 )); then
  echo "SEO smoke test failed with $failures issue(s)."
  exit 1
fi

echo "SEO smoke test passed."
