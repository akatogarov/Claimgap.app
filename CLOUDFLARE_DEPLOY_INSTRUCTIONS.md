# Инструкция по деплою на Cloudflare Pages

## ✅ Изменения внедрены

Проект теперь использует **Node.js runtime** вместо Edge runtime для универсальной совместимости:
- ✅ Работает на Windows (локальная разработка)
- ✅ Работает на Cloudflare Pages (Linux серверы)
- ✅ Работает на Vercel
- ✅ Лучшее качество парсинга PDF (pdf-parse на Node.js)

## 🚀 Настройка автоматического деплоя

### Шаг 1: Подключите репозиторий

1. Откройте https://dash.cloudflare.com/
2. Перейдите в **Workers & Pages**
3. Нажмите **Create application**
4. Выберите **Pages** → **Connect to Git**
5. Авторизуйте GitHub
6. Выберите репозиторий: `akatogarov/Claimgap.app`

### Шаг 2: Настройте сборку

**Project name**: `claimgap` (или другое имя, если занято)

**Production branch**: `main`

**Build settings:**
```
Framework preset: Next.js
Build command: npm run build && npx @cloudflare/next-on-pages
Build output directory: .vercel/output/static
Root directory: (оставьте пустым)
```

### Шаг 3: Добавьте переменные окружения

В разделе **Environment variables (Production)** добавьте:

```env
NODE_VERSION=20
ANTHROPIC_API_KEY=your_anthropic_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=ClaimGap <reports@claimgap.app>
ADMIN_EMAILS=your_admin_emails
ADMIN_SECRET=your_admin_secret
ADMIN_JWT_SECRET=your_admin_jwt_secret
NEXT_PUBLIC_URL=https://claimgap.pages.dev
```

⚠️ **Важно**: Используйте реальные значения из вашего `.env.local` файла!

⚠️ **Важно**: После деплоя обновите `NEXT_PUBLIC_URL` на ваш реальный домен!

### Шаг 4: Запустите деплой

1. Нажмите **Save and Deploy**
2. Cloudflare автоматически:
   - Склонирует репозиторий
   - Установит зависимости
   - Соберет проект
   - Задеплоит на `https://claimgap.pages.dev` (или ваше имя проекта)

### Шаг 5: Проверьте деплой

После завершения сборки (обычно 3-5 минут):
1. Перейдите по ссылке вашего проекта
2. Проверьте главную страницу
3. Проверьте `/analyze` - форму загрузки

## 📧 Настройка Stripe Webhook

После успешного деплоя:

1. Зайдите в [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Нажмите **Add endpoint**
3. URL: `https://ваш-домен.pages.dev/api/webhook`
4. Выберите события:
   - `checkout.session.completed`
5. Скопируйте **Signing secret**
6. Обновите переменную `STRIPE_WEBHOOK_SECRET` в Cloudflare Pages

## 🔄 Автоматические деплои

Теперь каждый `git push` в ветку `main` будет автоматически деплоиться на Cloudflare Pages!

## 🌐 Настройка кастомного домена (опционально)

1. В Cloudflare Pages перейдите в **Custom domains**
2. Нажмите **Set up a custom domain**
3. Введите ваш домен (например, `claimgap.app`)
4. Следуйте инструкциям для настройки DNS

## 🐛 Troubleshooting

### Сборка падает

Проверьте логи в Cloudflare Pages Dashboard → Deployments → View build log

**Частые проблемы:**
- ❌ Не установлен `NODE_VERSION=20` → добавьте в Environment Variables
- ❌ Неправильная команда сборки → должна быть `npm run build && npx @cloudflare/next-on-pages`
- ❌ Неправильная директория → должна быть `.vercel/output/static`

### Приложение не работает после деплоя

1. Проверьте, что все переменные окружения добавлены
2. Проверьте логи в **Real-time Logs** (в настройках проекта)
3. Проверьте, что Supabase база доступна
4. Проверьте, что Stripe webhook настроен правильно

## 📝 Локальная разработка

```bash
# Установка зависимостей
npm install

# Запуск dev сервера
npm run dev

# Открыть http://localhost:3000
```

## 🎉 Готово!

Ваше приложение теперь работает на Cloudflare Pages с универсальной архитектурой!
