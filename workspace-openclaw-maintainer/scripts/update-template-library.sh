#!/usr/bin/env bash
set -euo pipefail

ROOT="/home/rui/.openclaw/workspace-openclaw-maintainer"
TARGET="${ROOT}/vendor/awesome-openclaw-agents"
REPO="https://github.com/mergisi/awesome-openclaw-agents.git"

if [ -d "${TARGET}/.git" ]; then
  git -C "${TARGET}" fetch --depth 1 origin main
  git -C "${TARGET}" reset --hard origin/main
else
  mkdir -p "${ROOT}/vendor"
  git clone --depth 1 "${REPO}" "${TARGET}"
fi

echo "Template library is now at:"
echo "  ${TARGET}"
