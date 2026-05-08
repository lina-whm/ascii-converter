"use client";

import { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { Toaster } from "sonner";
import { useSettings } from "@/hooks/useSettings";
import { getMessages } from "next-intl/server";
import { useEffect, useState } from "react";
import en from "@/i18n/messages/en.json";
import ru from "@/i18n/messages/ru.json";

const messages = { en, ru };

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const { language, updateLanguage } = useSettings();

  return (
    <NextIntlClientProvider
      locale={language}
      messages={messages[language as keyof typeof messages]}
    >
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