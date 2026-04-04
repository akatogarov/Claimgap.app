# Команды

## Разработка

```bash
# Установка зависимостей
npm install

# Запуск dev сервера (localhost:3000)
npm run dev

# Запуск dev сервера с очисткой кеша
npm run dev:clean

# Обычная сборка Next.js
npm run build

# Запуск production сервера локально
npm start

# Линтинг
npm run lint
```

## Деплой

```bash
# Сборка для Cloudflare (с временным удалением edge runtime)
npm run deploy

# Деплой на Cloudflare Pages
npm run cf:deploy

# Или полный цикл (сборка + деплой)
npm run pages:deploy
```

## База данных

```bash
# Применить схему к Supabase
npm run db:apply
```

## Очистка

```bash
# Удалить .next директорию
npm run clean
```

## Полезные команды

```bash
# Проверить версию Next.js
npm list next

# Проверить версию Node.js
node --version

# Проверить версию npm
npm --version

# Обновить зависимости
npm update

# Проверить уязвимости
npm audit

# Исправить уязвимости (осторожно!)
npm audit fix
```

## Git

```bash
# Проверить статус
git status

# Добавить все изменения
git add .

# Коммит
git commit -m "описание изменений"

# Пуш (автоматически запустит деплой на Cloudflare)
git push

# Откатить изменения в src/
git checkout -- src/
```

## Cloudflare

```bash
# Логин в Cloudflare
npx wrangler login

# Деплой вручную
npx wrangler pages deploy .worker-next/

# Просмотр логов
npx wrangler pages deployment tail
```
