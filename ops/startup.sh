#!/usr/bin/env bash
# Washoku Plus Workspace Operations Script
# Local runner for ForgeWeb and social automation workflows.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FORGEWEB_SCRIPT="$ROOT_DIR/ForgeWeb/ops/startup.sh"
SOCIAL_GENERATOR="$ROOT_DIR/docs/tools/generate_shorts_pack.py"
SOCIAL_PUBLISHER="$ROOT_DIR/docs/tools/publish_social_content.py"
SOCIAL_OUTBOX="$ROOT_DIR/automation/social/outbox"
SOCIAL_GUIDE="$ROOT_DIR/devdocs/SOCIAL-AUTOMATION.md"
ACCOUNT_GUIDE="$ROOT_DIR/devdocs/SOCIAL-ACCOUNT-SETUP.md"

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

show_banner() {
  echo -e "${BLUE}"
  echo "Washoku Plus Operations"
  echo "- ForgeWeb management"
  echo "- Social automation generation and queueing"
  echo -e "${NC}"
}

show_usage() {
  show_banner
  cat <<'EOF'
Usage:
  ops/startup.sh [command] [options]

Commands:
  help                          Show this message
  social-setup                  Validate local social automation prerequisites
  social-pack [count]           Generate daily shorts pack (default count: 3)
  social-queue [mode]           Build publish queue (mode: dry-run or live)
  social-run [count] [mode]     Generate pack and queue in one command
  social-status                 Show latest generated social files
    social-media-plan             Show required local video file paths for latest pack
  accounts                      Show account setup guide location
  forgeweb [subcommand]         Forward command to ForgeWeb ops/startup.sh

ForgeWeb forwarding examples:
  ops/startup.sh forgeweb start
  ops/startup.sh forgeweb status

Social examples:
  ops/startup.sh social-setup
  ops/startup.sh social-pack 4
  ops/startup.sh social-queue dry-run
  ops/startup.sh social-run 3 dry-run
EOF
}

require_python() {
  if ! command -v python3 >/dev/null 2>&1; then
    echo -e "${RED}Python 3 is required but not found.${NC}"
    exit 1
  fi
}

social_setup() {
  require_python
  mkdir -p "$ROOT_DIR/docs/assets/data/social"
  mkdir -p "$SOCIAL_OUTBOX"

  if [[ ! -f "$SOCIAL_GENERATOR" ]]; then
    echo -e "${RED}Missing generator script: $SOCIAL_GENERATOR${NC}"
    exit 1
  fi

  if [[ ! -f "$SOCIAL_PUBLISHER" ]]; then
    echo -e "${RED}Missing publisher script: $SOCIAL_PUBLISHER${NC}"
    exit 1
  fi

  echo -e "${GREEN}Social automation is ready.${NC}"
  echo "Generator: docs/tools/generate_shorts_pack.py"
  echo "Publisher: docs/tools/publish_social_content.py"
  echo "Guide: devdocs/SOCIAL-AUTOMATION.md"
}

social_pack() {
  local count="${1:-3}"
  require_python
  (cd "$ROOT_DIR" && python3 docs/tools/generate_shorts_pack.py --count "$count")
}

social_queue() {
  local mode="${1:-dry-run}"
  require_python
  if [[ "$mode" != "dry-run" && "$mode" != "live" ]]; then
    echo -e "${RED}Invalid mode: $mode (expected dry-run or live).${NC}"
    exit 1
  fi
  (cd "$ROOT_DIR" && python3 docs/tools/publish_social_content.py --mode "$mode")
}

social_run() {
  local count="${1:-3}"
  local mode="${2:-dry-run}"
  social_pack "$count"
  social_queue "$mode"
  social_status
}

social_status() {
  echo -e "${BLUE}Latest social packs:${NC}"
  ls -1t "$ROOT_DIR/docs/assets/data/social" 2>/dev/null | head -n 8 || true
  echo ""
  echo -e "${BLUE}Latest queue files:${NC}"
  ls -1t "$SOCIAL_OUTBOX" 2>/dev/null | head -n 8 || true
  echo ""
  echo "Automation guide: $SOCIAL_GUIDE"
}

social_media_plan() {
  require_python
  local latest_pack="$ROOT_DIR/docs/assets/data/social/daily-shorts-pack-latest.json"
  if [[ ! -f "$latest_pack" ]]; then
    echo -e "${YELLOW}No latest pack found.${NC} Run: bash ops/startup.sh social-pack 3"
    return 0
  fi

  (cd "$ROOT_DIR" && python3 - <<'PY'
import json
from pathlib import Path

pack_path = Path("docs/assets/data/social/daily-shorts-pack-latest.json")
pack = json.loads(pack_path.read_text(encoding="utf-8"))
items = pack.get("items", [])

print("Required media files for live publishing:")
if not items:
    print("- none (pack has no items)")
    raise SystemExit(0)

for item in items:
    assets = item.get("assets", {}) if isinstance(item.get("assets"), dict) else {}
    media = assets.get("localVideoPath", "")
    if not media:
        print(f"- {item.get('contentId', 'unknown')}: missing localVideoPath")
        continue
    path = Path(media)
    status = "OK" if path.exists() else "MISSING"
    print(f"- {item.get('contentId', 'unknown')}: {media} [{status}]")
PY
  )
}

show_accounts_path() {
  echo "Account setup guide: $ACCOUNT_GUIDE"
  if [[ -f "$ACCOUNT_GUIDE" ]]; then
    echo -e "${GREEN}Guide exists and is ready.${NC}"
  else
    echo -e "${YELLOW}Guide file not found yet.${NC}"
  fi
}

run_forgeweb() {
  if [[ ! -f "$FORGEWEB_SCRIPT" ]]; then
    echo -e "${RED}ForgeWeb ops script not found: $FORGEWEB_SCRIPT${NC}"
    exit 1
  fi
  local subcommand="${1:-start}"
  shift || true
  (cd "$ROOT_DIR/ForgeWeb" && bash "$FORGEWEB_SCRIPT" "$subcommand" "$@")
}

main() {
  local command="${1:-help}"
  shift || true

  case "$command" in
    help|--help|-h)
      show_usage
      ;;
    social-setup)
      social_setup
      ;;
    social-pack)
      social_pack "$@"
      ;;
    social-queue)
      social_queue "$@"
      ;;
    social-run)
      social_run "$@"
      ;;
    social-status)
      social_status
      ;;
    social-media-plan)
      social_media_plan
      ;;
    accounts)
      show_accounts_path
      ;;
    forgeweb)
      run_forgeweb "$@"
      ;;
    *)
      echo -e "${RED}Unknown command: $command${NC}"
      echo ""
      show_usage
      exit 1
      ;;
  esac
}

main "$@"
