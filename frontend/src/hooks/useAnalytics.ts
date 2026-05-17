import { isAnalyticsEnabled } from '../lib/googleAnalytics'

type EventParams = Record<string, string | number | boolean | undefined>

export type ButtonClickParams = {
  demo_step?: string
  button_label?: string
  prompt_id?: string
  style_name?: string
}

export function trackEvent(eventName: string, params?: EventParams): void {
  if (!isAnalyticsEnabled() || typeof window === 'undefined' || !window.gtag) return
  try {
    window.gtag('event', eventName, params)
  } catch {
    // never break demo flow
  }
}

export const analytics = {
  pageView: (pageName: string, extra?: EventParams) => {
    trackEvent('page_view', { page_name: pageName, ...extra })
  },

  demoStepView: (step: string) => {
    trackEvent('demo_step_view', { demo_step: step })
  },

  buttonClick: (buttonId: string, params?: ButtonClickParams) => {
    trackEvent('button_click', { button_id: buttonId, ...params })
  },

  loginSuccess: () => {
    trackEvent('login_success')
  },

  loginFailed: (errorType: string) => {
    trackEvent('login_failed', { error_type: errorType })
  },

  logout: () => {
    trackEvent('logout')
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

  sessionStarted: (sessionsRemaining: number) => {
    trackEvent('session_started', { sessions_remaining: sessionsRemaining })
  },

  sessionExpired: () => {
    trackEvent('session_expired')
  },

  cameraOpened: () => {
    trackEvent('camera_opened')
  },

  cameraError: (errorMessage: string) => {
    trackEvent('camera_error', { error_message: errorMessage })
  },

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

  styleSelected: (styleName: string) => {
    trackEvent('style_selected', { style_name: styleName })
  },

  styleChanged: (fromStyle: string, toStyle: string) => {
    trackEvent('style_changed', {
      from_style: fromStyle,
      to_style: toStyle,
    })
  },

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

  resultViewed: (styleName: string) => {
    trackEvent('result_viewed', { style_name: styleName })
  },

  qrCodeScanned: () => {
    trackEvent('qr_code_scanned')
  },

  newPhotoClicked: (sessionsRemaining?: number) => {
    trackEvent('new_photo_clicked', {
      ...(sessionsRemaining !== undefined ? { sessions_remaining: sessionsRemaining } : {}),
    })
  },

  changeStyleClicked: () => {
    trackEvent('change_style_clicked')
  },

  ctaGetInTouchClicked: () => {
    trackEvent('cta_get_in_touch_clicked')
  },

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
