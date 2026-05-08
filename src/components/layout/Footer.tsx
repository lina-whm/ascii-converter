"use client";

import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="bg-[var(--bg-secondary)] border-t border-[var(--border)] py-3 px-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between text-xs text-[var(--text-muted)]">
        <span>
          {t("madeWith")} {t("by")}{" "}
          <a
            href={t("authorUrl")}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--accent-green)] transition-colors"
          >
            {t("author")}
          </a>
        </span>
        <a
          href={t("authorUrl")}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-[var(--accent-green)] transition-colors"
        >
          GitHub →
        </a>
      </div>
    </footer>
  );
}