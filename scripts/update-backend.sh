#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# update-backend.sh
# Деплой изменений в API-роутах и серверной логике на Cloudflare Pages.
#
# Что включает "backend":
#   src/app/api/        — API-роуты (analyze, webhook, payment и т.д.)
#   src/lib/            — бизнес-логика (anthropic, supabase, clarification и т.д.)
#   src/middleware.ts   — middleware (защита /admin/*)
#   supabase/           — схема базы данных
#
# Запуск:
#   bash scripts/update-backend.sh
#   bash scripts/update-backend.sh "описание изменений"
# ─────────────────────────────────────────────────────────────
set -e

MSG="${1:-backend: update API routes and server logic}"

echo "Staging backend files..."
git add src/app/api/ src/lib/ src/middleware.ts supabase/ 2>/dev/null || true

# Проверяем есть ли что коммитить
if git diff --cached --quiet; then
  echo "Nothing to commit in backend files."
  exit 0
fi

git commit -m "$MSG"
git push origin main

echo ""
echo "Deployed! GitHub Actions will build and push to Cloudflare Pages."
echo "Track progress: https://github.com/akatogarov/Claimgap.app/actions"
