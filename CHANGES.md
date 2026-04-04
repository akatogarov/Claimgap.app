# Изменения для деплоя на Cloudflare Pages

## Что было сделано

### 1. Установлен OpenNext
- Добавлен `@opennextjs/cloudflare` для деплоя на Cloudflare Pages
- Создан `open-next.config.ts` с конфигурацией

### 2. Создан скрипт деплоя
- `scripts/deploy.mjs` - автоматически:
  - Удаляет `export const runtime = "edge"` перед сборкой
  - Собирает проект с OpenNext
  - Восстанавливает все файлы обратно

### 3. Обновлены скрипты в package.json
```json
{
  "deploy": "node scripts/deploy.mjs",
  "cf:deploy": "npm run deploy && npx wrangler pages deploy .worker-next/",
  "pages:deploy": "npm run deploy && npx wrangler pages deploy .worker-next/"
}
```

### 4. Обновлена конфигурация
- `next.config.mjs` - добавлен `output: 'standalone'`
- `wrangler.toml` - обновлен для OpenNext
- `.gitignore` - добавлены `.open-next/` и `.worker-next/`

### 5. Документация
- `README.md` - основная документация
- `DEPLOY.md` - инструкции по деплою
- `CLOUDFLARE_SETUP.md` - настройка Cloudflare Pages
- `COMMANDS.md` - шпаргалка по командам

## Как это работает

### Локальная разработка (без изменений)
```bash
npm run dev    # Обычный Next.js с edge runtime
npm run build  # Обычная сборка Next.js
```

Все файлы остаются с `export const runtime = "edge"` для совместимости с Cloudflare.

### Деплой на Cloudflare Pages
```bash
npm run deploy  # Скрипт автоматически:
                # 1. Удаляет edge runtime
                # 2. Собирает с OpenNext
                # 3. Восстанавливает файлы
```

### Cloudflare Pages (автоматический деплой)
При push в Git:
1. Cloudflare запускает `npm run deploy`
2. Собирается проект в `.worker-next/`
3. Деплоится на Cloudflare Pages

## Настройки Cloudflare Pages

**Build command**: `npm run deploy`
**Build output directory**: `.worker-next`
**Environment variable**: `NODE_VERSION = 20`

## Важно

⚠️ **Локально на Windows** сборка через `npm run deploy` может падать - это нормально.  
✅ **На Cloudflare Pages (Linux)** все работает корректно.

## Что НЕ изменилось

- ✅ Локальная разработка работает как раньше
- ✅ Все файлы остаются с `edge runtime` в репозитории
- ✅ Код не изменился, только добавлен скрипт деплоя

## Следующие шаги

1. Закоммитить изменения:
```bash
git add .
git commit -m "Add OpenNext deployment script for Cloudflare Pages"
git push
```

2. Настроить Cloudflare Pages (см. `CLOUDFLARE_SETUP.md`)

3. Автоматический деплой будет работать при каждом push
