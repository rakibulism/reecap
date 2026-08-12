#!/usr/bin/env bash
#
# Syncs the open-source-safe subset of this private repo to the public
# mirror at https://github.com/rakibulism/reecap.
#
# What it does:
#   1. Clones the current branch of this repo into a throwaway temp dir.
#   2. Rewrites that clone's history to drop everything under EXCLUDE_PATHS
#      (backend, Supabase, payment/webhook code, env files, secrets).
#   3. Swaps in README.public.md as README.md.
#   4. Force-pushes the result to the `public` remote.
#
# Because history is rewritten every run, the public repo is a MIRROR,
# not an append-only history — expect its commit hashes to change on
# every sync. That's intentional: it's the only way to guarantee a
# secret committed to the private repo can never surface in public
# history, even after the file is later deleted.
#
# Requires git-filter-repo: https://github.com/newren/git-filter-repo
set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

BRANCH="${1:-main}"
PUBLIC_REMOTE_URL="https://github.com/rakibulism/reecap.git"

FILTER_REPO="$(command -v git-filter-repo || true)"
if [ -z "$FILTER_REPO" ]; then
  for candidate in "$HOME/Library/Python/3.9/bin/git-filter-repo" "$HOME/.local/bin/git-filter-repo"; do
    if [ -x "$candidate" ]; then
      FILTER_REPO="$candidate"
      break
    fi
  done
fi
if [ -z "$FILTER_REPO" ]; then
  echo "error: git-filter-repo not found. Install with: pip3 install git-filter-repo" >&2
  exit 1
fi

# Paths that must never reach the public repo. Add to this list as soon
# as backend/integration code lands — anything added here is scrubbed
# from ALL history, not just the current tree.
EXCLUDE_PATHS=(
  supabase
  server
  backend
  api
  reecap-docs
  .env
  .env.local
  .env.development
  .env.production
  .vercel
)

if [ ! -f "$REPO_ROOT/README.public.md" ]; then
  echo "error: README.public.md not found at repo root." >&2
  exit 1
fi

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

echo "==> Cloning $REPO_ROOT (branch: $BRANCH)"
git clone --branch "$BRANCH" --single-branch "$REPO_ROOT" "$TMP_DIR/mirror" --quiet
cd "$TMP_DIR/mirror"

echo "==> Stripping private paths from history: ${EXCLUDE_PATHS[*]}"
PATH_ARGS=()
for p in "${EXCLUDE_PATHS[@]}"; do
  PATH_ARGS+=(--path "$p")
done
"$FILTER_REPO" "${PATH_ARGS[@]}" --invert-paths --force

echo "==> Swapping in public README"
cp "$REPO_ROOT/README.public.md" README.md
if ! git diff --quiet -- README.md || ! git ls-files --error-unmatch README.md >/dev/null 2>&1; then
  git add README.md
  git -c user.name="Rakibul Islam" -c user.email="40rakib70@gmail.com" commit -m "docs: public README" --quiet
fi

echo "==> Pushing to public mirror ($PUBLIC_REMOTE_URL)"
git remote add public "$PUBLIC_REMOTE_URL"
git push public "HEAD:$BRANCH" --force

echo "==> Done. https://github.com/rakibulism/reecap updated (history rewritten)."
