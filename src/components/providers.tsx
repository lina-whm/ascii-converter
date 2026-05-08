"use client";

import { ReactNode } from "react";
import { NextIntlClientProvider, useLocale } from "next-intl";
import { Toaster } from "sonner";
import en from "@/i18n/messages/en.json";
import ru from "@/i18n/messages/ru.json";

const messages = { en, ru };

interface ProvidersProps {
  children: ReactNode;
}

function NextIntlProvider({ children }: { children: ReactNode }) {
  const locale = useLocale();

  return (
    <NextIntlClientProvider locale={locale} messages={messages[locale as keyof typeof messages]}>
      {children}
    </NextIntlClientProvider>
  );
}

export function Providers({ children }: ProvidersProps) {
  return (
    <NextIntlProvider>
      <Toaster
        position="bottom-right"
        theme="dark"
        toastOptions={{
          style: {
            background: "var(--bg-secondary)",
            border: "1px solid var(--border)",
            color: "var(--text-primary)",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "0.75rem",
          },
        }}
      />
      {children}
    </NextIntlProvider>
  );
}