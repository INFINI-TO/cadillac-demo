type EventParams = Record<string, string | number | boolean | undefined>

export function trackEvent(eventName: string, params?: EventParams): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params)
  }
}

export const analytics = {
  // Landing page events
  pageView: (pageName: string) => {
    trackEvent('page_view', { page_name: pageName })
  },

  demoRequested: (industry: string, hasMarketingConsent: boolean) => {
    trackEvent('demo_requested', {
      industry,
      marketing_consent: hasMarketingConsent,
    })
  },

  demoRequestSuccess: () => {
    trackEvent('demo_request_success')
  },

  demoRequestError: (errorMessage: string) => {
    trackEvent('demo_request_error', { error_message: errorMessage })
  },

  // Session events
  sessionStarted: (sessionsRemaining: number) => {
    trackEvent('session_started', { sessions_remaining: sessionsRemaining })
  },

  sessionExpired: () => {
    trackEvent('session_expired')
  },

  // Camera events
  cameraOpened: () => {
    trackEvent('camera_opened')
  },

  cameraError: (errorMessage: string) => {
    trackEvent('camera_error', { error_message: errorMessage })
  },

  // Photo capture events
  photoCountdownStarted: () => {
    trackEvent('photo_countdown_started')
  },

  photoCaptured: () => {
    trackEvent('photo_captured')
  },

  photoRetake: () => {
    trackEvent('photo_retake')
  },

  photoAccepted: () => {
    trackEvent('photo_accepted')
  },

  // Style selection events
  styleSelected: (styleName: string) => {
    trackEvent('style_selected', { style_name: styleName })
  },

  styleChanged: (fromStyle: string, toStyle: string) => {
    trackEvent('style_changed', {
      from_style: fromStyle,
      to_style: toStyle,
    })
  },

  // Processing events
  processingStarted: (styleName: string) => {
    trackEvent('processing_started', { style_name: styleName })
  },

  processingCompleted: (styleName: string, durationMs?: number) => {
    trackEvent('processing_completed', {
      style_name: styleName,
      duration_ms: durationMs,
    })
  },

  processingError: (styleName: string, errorMessage: string) => {
    trackEvent('processing_error', {
      style_name: styleName,
      error_message: errorMessage,
    })
  },

  // Result events
  resultViewed: (styleName: string) => {
    trackEvent('result_viewed', { style_name: styleName })
  },

  qrCodeScanned: () => {
    trackEvent('qr_code_scanned')
  },

  newPhotoClicked: (sessionsRemaining: number) => {
    trackEvent('new_photo_clicked', { sessions_remaining: sessionsRemaining })
  },

  changeStyleClicked: () => {
    trackEvent('change_style_clicked')
  },

  // CTA events
  ctaGetInTouchClicked: () => {
    trackEvent('cta_get_in_touch_clicked')
  },

  // Cookie consent
  cookieConsentAccepted: () => {
    trackEvent('cookie_consent_accepted')
  },

  cookieConsentDeclined: () => {
    trackEvent('cookie_consent_declined')
  },
}

export function useAnalytics() {
  return { trackEvent, ...analytics }
}
