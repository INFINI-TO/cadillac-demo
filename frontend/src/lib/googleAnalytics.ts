const DEFAULT_MEASUREMENT_ID = 'G-F2YFNS5PBY'
const DEFAULT_ALLOWED_HOST = 'topbanana.aiphoto.events'

function getMeasurementId(): string {
  return import.meta.env.VITE_GA_MEASUREMENT_ID || DEFAULT_MEASUREMENT_ID
}

function getAllowedHost(): string {
  return import.meta.env.VITE_GA_ALLOWED_HOST || DEFAULT_ALLOWED_HOST
}

export function isAnalyticsEnabled(): boolean {
  if (typeof window === 'undefined') return false
  return window.location.hostname === getAllowedHost()
}

export function initGoogleAnalytics(): void {
  if (!isAnalyticsEnabled()) return

  const measurementId = getMeasurementId()

  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer.push(args)
  }
  window.gtag('js', new Date())

  const debugMode =
    typeof window !== 'undefined' && window.location.search.includes('debug_mode=true')

  window.gtag('config', measurementId, {
    send_page_view: false,
    ...(debugMode ? { debug_mode: true } : {}),
  })

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
  document.head.appendChild(script)
}
