# Map Tracker

Веб-додаток для відстеження об'єктів у реальному часі на карті через WebSocket.

## Технології

- **React** + **TypeScript** + **Vite**
- **MobX** для керування станом
- **Leaflet** + **React-Leaflet** для відображення карти
- **Material-UI** для інтерфейсу
- **WebSocket** для реального часу

## Швидкий старт

```bash
# Встановіть залежності
bun install

# Запустіть dev сервер
bun dev

# Запустіть mock WebSocket сервер (окремий термінал)
bun server

# Або запустіть обидва одночасно
bun dev:all
```

Відкрийте [http://localhost:5173](http://localhost:5173) у браузері.

## Змінні оточення

Створіть файл `.env.local`:

```env
# WebSocket URL (за замовчуванням ws://localhost:8080)
VITE_WS_URL=ws://localhost:8080
```

## Структура проєкту

```
src/
├── components/      # React компоненти
├── stores/         # MobX stores
├── services/       # WebSocket клієнт
├── pages/          # Сторінки
├── constants/      # Конфігурація
└── types/          # TypeScript типи
```

## Команди

```bash
bun run dev          # Запуск dev сервера
bun run build        # Збірка для продакшену
bun run lint         # Перевірка коду
bun run preview      # Попередній перегляд збірки
bun run server       # Запуск mock WebSocket сервера
bun run format       # Форматування коду
```

## WebSocket API

Сервер очікує такі повідомлення:

```json
// Авторизація
{ "type": "auth", "apiKey": "your-api-key" }

// Відповіді сервера
{ "type": "init", "objects": [...] }
{ "type": "update", "objects": [...] }
```
