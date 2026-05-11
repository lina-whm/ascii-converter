"use client";

import { useTranslations } from "next-intl";
import { Globe } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { ASCIIBox } from "@/components/ui/ASCIIBox";

export function Header() {
  const t = useTranslations("header");
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setMounted(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

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
          <a href={`/${currentLocale.toLowerCase()}`} className="no-underline">
          <ASCIIBox lines={["CONVERTER"]} fontSize="12px" />
        </a>
        </div>

        <nav className="flex items-center gap-4 text-xs">
          <a
            href={`/${currentLocale.toLowerCase()}/about`}
            className="text-[var(--text-secondary)] hover:text-[var(--accent-green)] transition-colors"
          >
            {t("about")}
          </a>
          <a
            href="https://github.com/lina-whm/ascii-converter"
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