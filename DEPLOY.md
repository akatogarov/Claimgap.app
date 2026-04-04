# Деплой на Cloudflare Pages

## Локальная разработка

Для локальной разработки используйте обычные команды:

```bash
npm run dev        # Запуск dev сервера
npm run build      # Обычная сборка Next.js
```

Все маршруты используют `export const runtime = "edge"` для совместимости с Cloudflare.

## Деплой на Cloudflare Pages

### Автоматический деплой через Git (РЕКОМЕНДУЕТСЯ)

Cloudflare Pages автоматически соберет проект при пуше в репозиторий.

**Настройки в Cloudflare Pages Dashboard:**

1. **Build command**: `npm run build && npx @cloudflare/next-on-pages`
2. **Build output directory**: `.vercel/output/static`
3. **Node version**: `20` (в Environment Variables: `NODE_VERSION = 20`)

**Шаги:**

1. Запушьте код в GitHub/GitLab
2. Зайдите на https://dash.cloudflare.com/
3. Workers & Pages → Create application → Pages → Connect to Git
4. Выберите репозиторий и настройте сборку

### Ручной деплой (не работает на Windows)

⚠️ **На Windows** локальная сборка через `@cloudflare/next-on-pages` не работает.  
✅ **Используйте автоматический деплой через Git** - Cloudflare Pages соберет проект на Linux серверах.

Если вы на Linux/macOS:

```bash
# Сборка для Cloudflare
npm run deploy

# Деплой на Cloudflare Pages
npm run cf:deploy
```

## Переменные окружения

Убедитесь, что в Cloudflare Pages настроены все необходимые переменные:

- `ANTHROPIC_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `ADMIN_SECRET`
- `ADMIN_JWT_SECRET`
- `ADMIN_EMAILS`
- `NEXT_PUBLIC_URL`
- `NODE_VERSION=20`

## Troubleshooting

### Сборка падает на Windows

Это нормально - OpenNext не полностью совместим с Windows. Используйте автоматический деплой через Cloudflare Pages или WSL.

### После деплоя файлы изменились

Скрипт автоматически восстанавливает файлы. Если что-то пошло не так, выполните:

```bash
git checkout -- src/
```
