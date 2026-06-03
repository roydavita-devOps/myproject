#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/umkm-website-builder}"
DEPLOY_BRANCH="${DEPLOY_BRANCH:-main}"

if [ ! -d "$APP_DIR/.git" ]; then
  echo "Application git repository not found at $APP_DIR"
  echo "Clone roydavita-devOps/myproject to $APP_DIR before running deployment."
  exit 1
fi

cd "$APP_DIR"

git fetch origin "$DEPLOY_BRANCH"
git checkout "$DEPLOY_BRANCH" || git checkout -b "$DEPLOY_BRANCH" "origin/$DEPLOY_BRANCH"
git pull --ff-only origin "$DEPLOY_BRANCH"

if [ ! -f ".env" ]; then
  echo "Missing .env in $APP_DIR"
  echo "Create .env from .env.example with production secrets before deploying."
  exit 1
fi

docker compose build
docker compose up -d
docker compose ps

if command -v curl >/dev/null 2>&1; then
  curl --fail --silent --show-error http://localhost/health >/dev/null
fi

echo "Deployment complete."
