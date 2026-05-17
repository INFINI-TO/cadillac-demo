/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_GA_MEASUREMENT_ID?: string
  readonly VITE_GA_ALLOWED_HOST?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.mp4' {
  const src: string
  export default src
}

interface Window {
  gtag: (...args: unknown[]) => void
  dataLayer: unknown[]
  grecaptcha: {
    ready: (cb: () => void) => void
    execute: (siteKey: string, options: { action: string }) => Promise<string>
    enterprise: {
      ready: (cb: () => void) => void
      execute: (siteKey: string, options: { action: string }) => Promise<string>
    }
  }
}
