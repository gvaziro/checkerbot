# Инструкция по деплою бота на сервер

## 1. Залей проект на сервер

Через git, scp, rsync или любой удобный способ. Убедись, что на сервере есть:
- Node.js (рекомендуется v18+)
- PM2 (`npm install -g pm2`)

## 2. Создай файл .env в корне проекта

```bash
cd /path/to/sorsatgchecker
nano .env
```

Содержимое:
```
BOTKEY=твой_токен_от_BotFather
TW_APIKEY=твой_ключ_TweetScout
```

Сохрани и закрой (Ctrl+O, Enter, Ctrl+X в nano).

## 3. Установи зависимости

```bash
npm install
```

## 4. Проверь, что бот запускается локально

```bash
node src/bot.js
```

Должно появиться `✅ Bot @Sorsa_Check_Bot is running and ready!`. Останови через Ctrl+C.

## 5. Запусти через PM2

```bash
pm2 start ecosystem.config.js
```

## 6. Сохрани конфиг PM2 для автозапуска после перезагрузки сервера

```bash
pm2 save
pm2 startup
```

Команда `pm2 startup` выведет команду — выполни её (обычно с sudo).

## 7. Полезные команды

| Команда | Описание |
|---------|----------|
| `pm2 status` | Статус процессов |
| `pm2 logs sorsa-check-bot` | Логи в реальном времени |
| `pm2 logs sorsa-check-bot --lines 200` | Последние 200 строк логов |
| `pm2 restart sorsa-check-bot` | Перезапуск бота |
| `pm2 stop sorsa-check-bot` | Остановка |
| `pm2 delete sorsa-check-bot` | Удаление из PM2 |

## 8. Если PM2 ругается на env_file

Старые версии PM2 могут не поддерживать `env_file`. Тогда:
- Обнови PM2: `npm install -g pm2@latest`
- Или удали строку `env_file: '.env'` из `ecosystem.config.js` — dotenv уже загружает .env при старте скрипта

## 9. Если бот падает — смотри логи

```bash
pm2 logs sorsa-check-bot --lines 100
```

Ищи строки `[FATAL]` — там будет причина краша.
