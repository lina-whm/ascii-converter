# ASCII Converter

Веб-приложение для преобразования изображений и GIF в ASCII-арт.

## Возможности

- Загрузка изображений (JPEG, PNG, WebP, GIF)
- Drag & drop, клик для выбора, вставка из буфера обмена
- Настраиваемая ширина (40-300 символов)
- 3 пресета charset + кастомный набор
- Инверсия яркости
- Настройка размера шрифта
- Сглаживание
- Экспорт в TXT и PNG
- Поддержка очереди файлов (до 5)
- Русский и английский языки

## Технологии

- Next.js 16
- TypeScript
- Tailwind CSS
- Framer Motion
- next-intl

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