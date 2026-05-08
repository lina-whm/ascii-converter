# ASCII Converter - Specification

## 1. Project Overview

**ASCII Converter** - веб-приложение для преобразования растровых изображений (JPEG, PNG, WebP) и анимированных GIF в текстовое представление (ASCII-арт) с возможностью интерактивной настройки параметров и последующего сохранения результата.

**Version:** 1.0  
**Date:** 2026-05-08

---

## 2. Technology Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 15+ (App Router) |
| Language | TypeScript 5.x |
| Styling | Tailwind CSS 4 |
| UI Library | shadcn/ui |
| Animations | Framer Motion |
| GIF Parser | gifuct-js |
| GIF Generation | gif.js |
| Canvas | Native Canvas API |
| Multithreading | Web Workers |
| i18n | next-intl |

---

## 3. UI/UX Specification

### 3.1 Visual Design

**Color Palette:**
- Background Primary: `#0D0D0D`
- Background Secondary: `#1A1A1A`
- Background Tertiary: `#262626`
- Accent Green (terminal): `#00FF41`
- Accent Orange: `#FFB000`
- Text Primary: `#E5E5E5`
- Text Secondary: `#A3A3A3`
- Text Muted: `#525252`
- Border: `#333333`
- Error: `#FF4444`
- Success: `#00FF41`

**Typography:**
- Primary Font: `JetBrains Mono`, `Fira Code`, monospace
- Heading Sizes: H1: 2rem, H2: 1.5rem, H3: 1.25rem
- Body: 0.875rem - 1rem
- Line Height: 1.5

**Spacing System:**
- Base unit: 4px
- Scale: 4, 8, 12, 16, 24, 32, 48, 64px

### 3.2 Layout Structure

```
Header: Logo (ASCII art), Menu, Language Switcher
Main Content:
  Left Panel (on mobile: top): Upload Zone + Settings
  Right Panel (on mobile: bottom): ASCII Preview
Footer: Author info, GitHub link
```

**Responsive Breakpoints:**
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### 3.3 Components

1. **FileUploader** - Drag-drop zone, click to upload, clipboard paste
2. **SettingsPanel** - Width slider, charset selector, invert toggle, font size slider, smoothing toggle
3. **AsciiPreview** - ASCII text display with configured font size
4. **GifPlayer** - Animation player with controls (play/pause, prev/next frame)
5. **ExportPanel** - Copy to clipboard, Download TXT, Download PNG, Download GIF
6. **FileQueue** - List of uploaded files with independent settings
7. **DemoLoader** - Load demo image/GIF
8. **UrlUploader** - Load from URL input

---

## 4. Functionality Specification

### 4.1 File Upload

- Drag & drop files onto drop zone
- Click to open file picker
- Paste from clipboard (Ctrl+V/Cmd+V)
- Load from URL input
- Load demo files

**Supported Formats:** JPEG, PNG, WebP, GIF  
**Max File Size:** 30 MB  
**Validation:** Check magic bytes, MIME type, file size

### 4.2 ASCII Conversion

**Parameters:**
- Width: 40-300 characters (slider)
- Charset presets:
  - `█▓▒░ ` (dense/inverted)
  - ` .:-=+*#%@` (classic)
  - ` ⣿⣾⣽⣻⢿⡿⣟⣯⣷` (braille patterns)
- Custom charset (up to 20 characters)
- Invert brightness toggle
- Font size: 4-16px (slider)
- Smoothing (bilinear interpolation)

### 4.3 GIF Processing

- Parse all frames with original delays
- Convert each frame to ASCII independently
- Play animation in player with correct timing
- Controls: Play/Pause, Previous/Next frame

### 4.4 Export

- Copy plain text to clipboard
- Download as .txt file
- Render ASCII to canvas, save as .png
- Generate animated GIF from ASCII frames

### 4.5 File Queue

- Support up to 5 files in queue
- Independent settings per file
- Remove file from queue

### 4.6 Localization

- Russian (ru)
- English (en)
- Language saved to localStorage
- Default: browser language

---

## 5. Acceptance Criteria

- [ ] Application loads without errors
- [ ] Drag & drop upload works
- [ ] File picker upload works
- [ ] Clipboard paste works
- [ ] JPEG/PNG/WebP convert to ASCII correctly
- [ ] GIF frames parsed and displayed
- [ ] GIF animation plays with correct timing
- [ ] Width slider changes output width
- [ ] Charset presets work
- [ ] Custom charset works
- [ ] Invert toggle works
- [ ] Font size slider works
- [ ] Smoothing toggle works
- [ ] Copy to clipboard works
- [ ] Download TXT works
- [ ] Download PNG works
- [ ] Download GIF works
- [ ] File queue supports 5 files
- [ ] Language switch works (ru/en)
- [ ] Responsive layout works
- [ ] Dark theme applied
- [ ] Performance: < 500ms for static image
- [ ] First GIF frame < 1s

---

## 6. Security Requirements

- Validate file by magic bytes (not extension)
- Sanitize custom charset input
- Remove EXIF data from images
- Content Security Policy enforced

---

## 7. Performance Requirements

- Use Web Workers for GIF parsing and ASCII conversion
- Virtualize large ASCII output
- Cache results for same input+settings
- Abort previous calculations when new parameters set