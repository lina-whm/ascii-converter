# ASCII Converter

![Локальная обработка](https://img.shields.io/badge/обработка-локально%20в%20браузере-success?style=flat-square&logo=javascript)
![Без секретов](https://img.shields.io/badge/secrets%20scanning-clean-brightgreen?style=flat-square&logo=gitleaks)
![Лицензия MIT](https://img.shields.io/badge/license-MIT-blue?style=flat-square)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)

## 🌐 Live Demo

[ascii-converter-zeta.vercel.app](https://ascii-converter-zeta.vercel.app)

---

Веб-приложение для преобразования изображений и анимированных GIF в ASCII-арт.

## Возможности

- Загрузка изображений (JPEG, PNG, WebP, GIF)
- Drag & drop, клик для выбора файла
- Вставка из буфера обмена (Ctrl+V)
- Настраиваемая ширина (40-300 символов)
- 3 пресета charset (блочный, классический, брайлевский) + кастомный набор
- 4 режима цвета (зелёный, белый, серый, оригинальные)
- Инверсия яркости
- Настройка размера шрифта
- Сглаживание изображений
- Настройки изображения (яркость, контраст, насыщенность, оттенок, сепия, ч/б и др.)
- Экспорт в TXT, PNG, GIF (анимированный)
- Очередь файлов (до 5)
- Русский и английский языки

## Безопасность и приватность

### 🔒 Локальная обработка

Все файлы обрабатываются исключительно в браузере. На сервер ничего не передаётся.

- Изображения загружаются через Canvas API в память браузера
- Данные не хранятся на внешних серверах
- Метаданные (EXIF) автоматически удаляются при обработке
- Не используются куки и не собирается аналитика

### 🛡️ Защита от злоупотреблений

- Ограничение на размер файла (макс 30 МБ)
- Ограничение на разрешение (макс 1920×1920 пикселей)
- Ограничение на количество кадров GIF (макс 500)
- Таймаут обработки (10 секунд)

## 🛠 Технологии

- [Next.js 16](https://nextjs.org/) — фреймворк
- [TypeScript](https://www.typescriptlang.org/) — типизация
- [Tailwind CSS](https://tailwindcss.com/) — стилизация
- [next-intl](https://next-intl.vercel.app/) — интернационализация
- [gifuct-js](https://github.com/0xSheDany/gifuct-js) — обработка GIF
- [gif.js](https://github.com/galeki/gif.js) — создание анимированных GIF
- [Lucide](https://lucide.dev/) — иконки
- [Sonner](https://sonner.emilkowalski.com/) — уведомления

## Запуск локально

```bash
npm install
npm run dev
```

Приложение будет доступно на http://localhost:3000

## Сборка для продакшена

```bash
npm run build
npm run start
```

## Лицензия

MIT
