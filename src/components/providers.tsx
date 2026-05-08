"use client";

import { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { Toaster } from "sonner";
import en from "@/i18n/messages/en.json";
import ru from "@/i18n/messages/ru.json";

const allMessages = {
  en,
  ru,
};

interface ProvidersProps {
  children: ReactNode;
  locale?: string;
}

export function Providers({ children, locale = "en" }: ProvidersProps) {
  const safeLocale = locale && allMessages[locale as keyof typeof allMessages] ? locale : "en";
  const messages = allMessages[safeLocale as keyof typeof allMessages];

  return (
    <NextIntlClientProvider locale={safeLocale} messages={messages}>
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
    </NextIntlClientProvider>
  );
}