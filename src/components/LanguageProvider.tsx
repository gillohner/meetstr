// src/components/LanguageProvider.tsx
"use client";
import { useEffect } from "react";
import i18n from "@/lib/i18n";

export default function LanguageProvider({
  children,
  serverLang,
}: {
  children: React.ReactNode;
  serverLang: string;
}) {
  useEffect(() => {
    if (i18n.language !== serverLang) {
      i18n.changeLanguage(serverLang);
    }
  }, [serverLang]);

  return <>{children}</>;
}
