# ASCII Converter

Web application for converting images and GIFs to ASCII art.

## Features

- Image upload (JPEG, PNG, WebP, GIF)
- Drag & drop, click to select, paste from clipboard
- Adjustable width (40-300 characters)
- 3 charset presets + custom set
- Brightness inversion
- Font size control
- Smoothing
- Export to TXT and PNG
- File queue support (up to 5)
- Russian and English languages

## Tech Stack

- Next.js 16
- TypeScript
- Tailwind CSS
- Framer Motion
- next-intl

## Quick Start

```bash
cd ascii-converter
npm install
npm run dev
```

Open http://localhost:3000

## Production Build

```bash
npm run build
npm run start
```