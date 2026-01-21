/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_REVENUECAT_API_KEY?: string;
  // Add other env vars as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
