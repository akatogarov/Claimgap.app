# Настройка Cloudflare Pages

## Шаг 1: Создание проекта

1. Зайдите на https://dash.cloudflare.com/
2. Перейдите в **Workers & Pages** → **Create application** → **Pages**
3. Подключите ваш Git репозиторий

## Шаг 2: Настройки сборки

В разделе **Build settings**:

### Framework preset
- Выберите: **Next.js**

### Build configuration
- **Build command**: `npm run build && npx @cloudflare/next-on-pages`
- **Build output directory**: `.vercel/output/static`

### Environment variables (Production)

Добавьте следующие переменные:

```
NODE_VERSION=20
ANTHROPIC_API_KEY=your_key
SUPABASE_URL=your_url
SUPABASE_SERVICE_ROLE_KEY=your_key
STRIPE_SECRET_KEY=your_key
STRIPE_WEBHOOK_SECRET=your_secret
RESEND_API_KEY=your_key
RESEND_FROM_EMAIL=your_email
ADMIN_SECRET=your_secret
ADMIN_JWT_SECRET=your_jwt_secret
ADMIN_EMAILS=admin@example.com,admin2@example.com
NEXT_PUBLIC_URL=https://your-domain.pages.dev
```

## Шаг 3: Деплой

1. Нажмите **Save and Deploy**
2. Cloudflare автоматически соберет и задеплоит проект
3. После деплоя вы получите URL вида `https://claimgap.pages.dev`

## Шаг 4: Настройка домена (опционально)

1. Перейдите в **Custom domains**
2. Добавьте ваш домен
3. Следуйте инструкциям для настройки DNS

## Автоматический деплой

После настройки каждый push в ветку `main` будет автоматически деплоиться на Cloudflare Pages.

## Webhook для Stripe

После деплоя настройте Stripe webhook:

1. Зайдите в Stripe Dashboard → **Developers** → **Webhooks**
2. Добавьте endpoint: `https://your-domain.pages.dev/api/webhook`
3. Выберите события: `checkout.session.completed`
4. Скопируйте **Signing secret** и добавьте в переменные окружения как `STRIPE_WEBHOOK_SECRET`

## Troubleshooting

### Сборка падает

Проверьте:
- ✅ `NODE_VERSION=20` установлен в Environment Variables
- ✅ Build command: `npm run build && npx @cloudflare/next-on-pages`
- ✅ Build output directory: `.vercel/output/static`

### Ошибки runtime

Проверьте логи в Cloudflare Pages Dashboard → **Deployments** → выберите деплой → **View logs**

### Переменные окружения не работают

Убедитесь что:
- Переменные добавлены в **Production** environment
- После добавления переменных сделан новый деплой
