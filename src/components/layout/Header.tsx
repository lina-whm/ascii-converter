"use client";

import { useTranslations } from "next-intl";
import { Globe } from "lucide-react";
import { useLocale, useTranslations as useServerTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";

export function Header() {
  const t = useTranslations("header");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const toggleLanguage = () => {
    const newLocale = locale === "en" ? "ru" : "en";
    const segments = pathname.split("/");
    segments[1] = newLocale;
    router.push(segments.join("/"));
  };

  return (
    <header className="bg-[var(--bg-secondary)] border-b border-[var(--border)] py-3 px-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="font-mono text-xs">
          <pre className="text-[var(--accent-green)] leading-none">
{`┌─────────────┐
│ CONVERTER   │
└─────────────┘`}
          </pre>
        </div>

        <nav className="flex items-center gap-4 text-xs">
          <a
            href="#about"
            className="text-[var(--text-secondary)] hover:text-[var(--accent-green)] transition-colors"
          >
            {t("about")}
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--text-secondary)] hover:text-[var(--accent-green)] transition-colors"
          >
            {t("github")}
          </a>
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 text-[var(--text-secondary)] hover:text-[var(--accent-orange)] transition-colors"
          >
            <Globe className="w-3 h-3" />
            {locale.toUpperCase()}
          </button>
        </nav>
      </div>
    </header>
  );
}