/// <reference types="vite/client" />

declare const __APP_VERSION__: string;

/** Type declarations for arabic-reshaper (no @types package available) */
declare module 'arabic-reshaper' {
  const ArabicReshaper: {
    convertArabic(normal: string): string;
    convertArabicBack(apfb: string): string;
  };
  export default ArabicReshaper;
}

interface ImportMetaEnv {
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_WS_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
