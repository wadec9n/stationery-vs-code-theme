#!/usr/bin/env bash
# Build, package, and ship a release artifact.
# Showcases variables, arrays, heredocs, command substitution,
# arithmetic, traps, and parameter expansion.

set -euo pipefail
IFS=$'\n\t'

readonly SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
readonly APP_NAME="${APP_NAME:-stationery}"
readonly DEFAULT_TARGET="staging"
readonly TARGETS=(staging production canary)

VERBOSE=0
DRY_RUN=false
TARGET="${1:-$DEFAULT_TARGET}"

usage() {
  cat <<-EOF
	Usage: $(basename "$0") [target]

	  target    one of: ${TARGETS[*]} (default: ${DEFAULT_TARGET})

	Environment:
	  APP_NAME       app to deploy (default: ${APP_NAME})
	  VERBOSE=1      enable trace output
	  DRY_RUN=true   print actions without executing

	Examples:
	  $(basename "$0") staging
	  DRY_RUN=true $(basename "$0") production
	EOF
}

log() {
  local level="$1"; shift
  printf '[%s] %-5s %s\n' "$(date +'%H:%M:%S')" "${level^^}" "$*" >&2
}

cleanup() {
  local exit_code=$?
  [[ -n "${TMPDIR_LOCAL:-}" && -d "$TMPDIR_LOCAL" ]] && rm -rf "$TMPDIR_LOCAL"
  exit "$exit_code"
}
trap cleanup EXIT INT TERM

contains() {
  local needle="$1"; shift
  for item in "$@"; do
    [[ "$item" == "$needle" ]] && return 0
  done
  return 1
}

if [[ "${1:-}" =~ ^(-h|--help)$ ]]; then
  usage
  exit 0
fi

if ! contains "$TARGET" "${TARGETS[@]}"; then
  log error "Unknown target: ${TARGET}. Expected one of: ${TARGETS[*]}"
  exit 2
fi

(( VERBOSE == 1 )) && set -x

TMPDIR_LOCAL="$(mktemp -d -t "${APP_NAME}.XXXXXX")"
VERSION="$(git -C "$SCRIPT_DIR" describe --tags --always --dirty 2>/dev/null || echo "0.0.0-dev")"
ARTIFACT="${TMPDIR_LOCAL}/${APP_NAME}-${VERSION}.tar.gz"

log info "Packaging ${APP_NAME}@${VERSION} for ${TARGET}"

build_artifact() {
  local files=()
  while IFS= read -r -d '' f; do
    files+=("$f")
  done < <(find "$SCRIPT_DIR" -type f -name '*.js' -not -path '*/node_modules/*' -print0)

  log info "Found ${#files[@]} files to bundle"

  if $DRY_RUN; then
    log warn "DRY_RUN — skipping tar"
    return 0
  fi
  tar -czf "$ARTIFACT" -C "$SCRIPT_DIR" "${files[@]/#$SCRIPT_DIR\//}"
}

upload() {
  local size_bytes
  size_bytes=$(wc -c < "$ARTIFACT" | tr -d ' ')
  local size_kb=$(( size_bytes / 1024 ))

  log info "Uploading ${ARTIFACT##*/} (${size_kb} KB)"
  curl -fsSL \
    --retry 3 --retry-delay 2 \
    -H "Authorization: Bearer ${DEPLOY_TOKEN:?DEPLOY_TOKEN not set}" \
    -F "file=@${ARTIFACT}" \
    "https://api.example.com/v1/deploy/${TARGET}"
}

build_artifact
$DRY_RUN || upload

log info "Done. ${APP_NAME}@${VERSION} → ${TARGET}"
