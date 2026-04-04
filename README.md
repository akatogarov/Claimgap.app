# ClaimGap

Insurance claim gap analysis platform.

## Разработка

```bash
# Установка зависимостей
npm install

# Запуск dev сервера
npm run dev

# Обычная сборка Next.js (для локального тестирования)
npm run build
```

## Деплой

Для деплоя на Cloudflare Pages используйте:

```bash
# Автоматическая сборка и деплой
npm run cf:deploy
```

Или настройте автоматический деплой в Cloudflare Pages Dashboard:
- **Build command**: `npm run build && npx @cloudflare/next-on-pages`
- **Build output directory**: `.vercel/output/static`
- **Environment variable**: `NODE_VERSION = 20`

⚠️ **На Windows** локальная сборка может не работать - используйте Git integration в Cloudflare Pages.

Подробнее см. [DEPLOY.md](./DEPLOY.md)

## Технологии

- **Next.js 14** (Node.js runtime) - React фреймворк
- **@cloudflare/next-on-pages** - адаптер для Cloudflare Pages
- **Supabase** - PostgreSQL база данных + Storage
- **Anthropic Claude** - AI для анализа документов
- **Stripe** - платежи
- **Resend** - email рассылка
- **unpdf / pdf-parse** - парсинг PDF файлов

## Структура проекта

```
src/
├── app/              # Next.js App Router
│   ├── api/         # API routes
│   ├── admin/       # Админ панель
│   └── ...          # Страницы
├── components/       # React компоненты
└── lib/             # Утилиты и библиотеки

scripts/
└── deploy.mjs       # Скрипт деплоя
```

## Переменные окружения

Создайте `.env.local` для локальной разработки:

```env
# Anthropic
ANTHROPIC_API_KEY=

# Supabase
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Resend
RESEND_API_KEY=
RESEND_FROM_EMAIL=

# Admin
ADMIN_SECRET=
ADMIN_JWT_SECRET=
ADMIN_EMAILS=

# Public
NEXT_PUBLIC_URL=http://localhost:3000
```

## Лицензия

Proprietary
