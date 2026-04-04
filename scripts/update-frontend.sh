#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# update-frontend.sh
# Деплой изменений во фронтенде на Cloudflare Pages.
#
# Что включает "frontend":
#   src/app/            — страницы (кроме src/app/api/)
#   src/components/     — React-компоненты
#   public/             — статика (изображения, _headers)
#   tailwind.config.ts  — стили
#   next.config.mjs     — конфиг Next.js
#
# Запуск:
#   bash scripts/update-frontend.sh
#   bash scripts/update-frontend.sh "описание изменений"
# ─────────────────────────────────────────────────────────────
set -e

MSG="${1:-frontend: update UI pages and components}"

echo "Staging frontend files..."
# Добавляем всё в src/app/ кроме api/
git add src/app/ src/components/ public/ tailwind.config.ts next.config.mjs 2>/dev/null || true
# Убираем из стейджинга API-роуты (они относятся к backend)
git restore --staged src/app/api/ 2>/dev/null || true

# Проверяем есть ли что коммитить
if git diff --cached --quiet; then
  echo "Nothing to commit in frontend files."
  exit 0
fi

git commit -m "$MSG"
git push origin main

echo ""
echo "Deployed! GitHub Actions will build and push to Cloudflare Pages."
echo "Track progress: https://github.com/akatogarov/Claimgap.app/actions"
