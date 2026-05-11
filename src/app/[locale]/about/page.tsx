"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useLocale } from "next-intl";
import { ArrowLeft, Bug, Lightbulb, Shield } from "lucide-react";
import { ASCIIBox } from "@/components/ui/ASCIIBox";

export default function AboutPage() {
  const t = useTranslations("about");
  const tFooter = useTranslations("footer");
  const locale = useLocale();

  return (
    <div className="flex-1 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <Link
          href={`/${locale}`}
          className="inline-flex items-center gap-2 text-xs text-[var(--text-secondary)] hover:text-[var(--accent-green)] transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("back")}
        </Link>

        <div className="space-y-8">
          <div className="text-center">
            <ASCIIBox lines={["ASCII CONVERTER"]} fontSize="24px" />
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
            <h2 className="panel-header">{t("privacy") || "Privacy & Security"}</h2>
            <div className="flex items-start gap-3 text-sm text-[var(--text-secondary)]">
              <Shield className="w-5 h-5 text-[var(--accent-green)] shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-[var(--text-primary)]">{t("privacyTitle") || "All processing happens locally"}</p>
                <p className="mt-1">{t("privacyDesc") || "Your images are processed directly in your browser. No data is sent to any server. Your files never leave your device."}</p>
              </div>
            </div>
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

          <div className="panel">
            <h2 className="panel-header">{t("contribute") || "Feedback & Contributions"}</h2>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              {t("contributeDesc") || "Found a bug or have an idea for improvement? I would be happy to hear your feedback!"}
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://github.com/lina-whm/ascii-converter/issues/new?template=bug_report.md"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary inline-flex items-center gap-2"
              >
                <Bug className="w-4 h-4" />
                {t("reportBug") || "Report a Bug"}
              </a>
              <a
                href="https://github.com/lina-whm/ascii-converter/issues/new?template=feature_request.md"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary inline-flex items-center gap-2"
              >
                <Lightbulb className="w-4 h-4" />
                {t("suggestFeature") || "Suggest Feature"}
              </a>
              <a
                href="https://github.com/lina-whm/ascii-converter"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary inline-flex items-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                GitHub
              </a>
            </div>
          </div>

          <div className="text-center">
            <Link
              href={`/${locale}`}
              className="btn-primary inline-flex items-center gap-2"
            >
              {t("tryIt")}
            </Link>
          </div>

          <div className="text-center text-xs text-[var(--text-muted)] pt-8 border-t border-[var(--border)]">
            <p>
              {tFooter("madeWith")} ♥{" "}
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