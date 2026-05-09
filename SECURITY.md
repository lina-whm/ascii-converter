# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability within ASCII Converter, please report it responsibly.

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, send a private message to the repository owner or email them directly.

When reporting, please include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Any suggested fixes (optional)

## Security Model

### Client-Side Processing

ASCII Converter processes all images entirely in your browser. **No files are uploaded to any server.**

- Images are loaded into memory using the HTML5 Canvas API
- Data URLs are used for temporary storage
- No data is transmitted to external servers except:
  - Loading images from user-provided URLs (same as opening an image in your browser)
  - Loading fonts from Google Fonts CDN

### URL Loading

For security reasons, loading images from URLs is restricted to trusted image hosting services:
- GitHub Images (githubusercontent.com)
- Imgur (i.imgur.com)
- Giphy (media.giphy.com)
- Discord CDN (cdn.discordapp.com)
- Twitter/X Images (twimg.com)

Private IP ranges and localhost addresses are blocked.

### Memory Limits

To prevent denial of service through large files:
- Maximum image size: 1920×1920 pixels (~3.7 megapixels)
- Maximum GIF frames: 500
- Maximum total GIF pixels: 100 million
- Processing timeout: 10 seconds

### Data Storage

- Settings are stored in browser's localStorage
- No personal data is collected or stored on external servers
- No analytics or tracking

## Best Practices for Users

1. **Be careful with URL loading** — Only load images from trusted sources
2. **Large GIFs** — Very large or complex GIFs may be rejected
3. **Clipboard access** — The app may request permission to read images from your clipboard

## Security Headers

The application includes the following security headers:
- Content-Security-Policy (CSP)
- X-Content-Type-Options
- X-Frame-Options
- X-XSS-Protection
- Referrer-Policy
