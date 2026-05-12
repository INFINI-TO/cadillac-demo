/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.mp4' {
  const src: string
  export default src
}

interface Window {
  gtag: (
    command: 'event' | 'config' | 'js',
    targetId: string,
    params?: Record<string, unknown>
  ) => void
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
