# ASCII Converter

![Локальная обработка](https://img.shields.io/badge/обработка-локально%20в%20браузере-success?style=flat-square&logo=javascript)
![Без секретов](https://img.shields.io/badge/secrets%20scanning-clean-brightgreen?style=flat-square&logo=gitleaks)
![Лицензия MIT](https://img.shields.io/badge/license-MIT-blue?style=flat-square)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)

## 🌐 Live Demo

[ascii-converter-4wx5jk54y-lina-whms-projects.vercel.app](https://ascii-converter-4wx5jk54y-lina-whms-projects.vercel.app)

---

Веб-приложение для преобразования изображений и GIF в ASCII-арт.

## Возможности

- Загрузка изображений (JPEG, PNG, WebP, GIF)
- Drag & drop, клик для выбора, вставка из буфера обмена
- Настраиваемая ширина (40-300 символов)
- 3 пресета charset + кастомный набор
- 4 режима цвета (зелёный, белый, серый, оригинальные цвета)
- Инверсия яркости
- Настройка размера шрифта
- Сглаживание
- Экспорт в TXT, PNG, GIF
- Поддержка очереди файлов (до 5)
- Русский и английский языки

## Безопасность и приватность

### Локальная обработка

**Все файлы обрабатываются исключительно в вашем браузере. На сервер ничего не передаётся.**

- Изображения загружаются через Canvas API в память браузера
- Данные не хранятся на внешних серверах
- Метаданные (EXIF) автоматически удаляются при обработке
- Мы не используем куки и не собираем аналитику

### Защита от злоупотреблений

- Ограничение на размер файлов (30 МБ)
- Ограничение на разрешение (макс 1920×1920)
- Ограничение на количество кадров GIF (макс 500)
- Таймаут обработки (10 секунд)
- Защита от SSRF при загрузке по URL

## Технологии

- [Next.js 16](https://nextjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/)
- [next-intl](https://next-intl.vercel.app/)
- [gifuct-js](https://github.com/0xSheDany/gifuct-js)

## Запуск

```bash
cd ascii-converter
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
