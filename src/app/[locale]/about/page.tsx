"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AboutPage() {
  const t = useTranslations("about");
  const tFooter = useTranslations("footer");

  return (
    <div className="flex-1 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs text-[var(--text-secondary)] hover:text-[var(--accent-green)] transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Converter
        </Link>

        <div className="space-y-8">
          <div className="text-center">
            <pre className="text-[var(--accent-green)] text-2xl font-mono leading-none inline-block">
{`┌────────────────────┐
│  ASCII CONVERTER    │
└────────────────────┘`}
            </pre>
            <p className="mt-4 text-[var(--text-secondary)]">
              {t("description")}
            </p>
          </div>

          <div className="panel">
            <h2 className="panel-header">{t("features")}</h2>
            <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
              <li className="flex items-center gap-2">
                <span className="text-[var(--accent-green)]">▸</span>
                {t("feature1")}
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[var(--accent-green)]">▸</span>
                {t("feature2")}
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[var(--accent-green)]">▸</span>
                {t("feature3")}
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[var(--accent-green)]">▸</span>
                {t("feature4")}
              </li>
            </ul>
          </div>

          <div className="panel">
            <h2 className="panel-header">{t("techStack")}</h2>
            <div className="flex flex-wrap gap-2">
              {["Next.js", "TypeScript", "Tailwind CSS", "next-intl", "gifuct-js"].map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1 border border-[var(--border)] rounded text-xs text-[var(--text-secondary)]"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/"
              className="btn-primary inline-flex items-center gap-2"
            >
              {t("tryIt")}
            </Link>
          </div>

          <div className="text-center text-xs text-[var(--text-muted)] pt-8 border-t border-[var(--border)]">
            <p>
              {tFooter("madeWith")} {tFooter("by")}{" "}
              <a
                href={tFooter("authorUrl")}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--accent-green)] hover:underline"
              >
                {tFooter("author")}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}