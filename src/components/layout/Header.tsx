"use client";

import { useTranslations } from "next-intl";
import { Globe } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export function Header() {
  const t = useTranslations("header");
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleLanguage = () => {
    const segments = pathname.split("/");
    segments[1] = segments[1] === "en" ? "ru" : "en";
    router.push(segments.join("/"));
  };

  const currentLocale = mounted ? pathname.split("/")[1]?.toUpperCase() || "EN" : "EN";

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
            {currentLocale}
          </button>
        </nav>
      </div>
    </header>
  );
}