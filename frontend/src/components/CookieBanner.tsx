import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { analytics } from '../hooks/useAnalytics'

const COOKIE_CONSENT_KEY = 'aipb_cookie_consent'

type ConsentValue = 'accepted' | 'declined' | null

export function CookieBanner() {
  const [consent, setConsent] = useState<ConsentValue>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (stored === 'accepted' || stored === 'declined') {
      setConsent(stored)
    } else {
      setTimeout(() => setIsVisible(true), 1000)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted')
    setConsent('accepted')
    setIsVisible(false)
    analytics.cookieConsentAccepted()
  }

  const handleDecline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'declined')
    setConsent('declined')
    setIsVisible(false)
    analytics.cookieConsentDeclined()
  }

  if (consent !== null || !isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 z-[200]"
        style={{ background: 'rgba(0, 0, 0, 0.5)' }}
      >
        <div className="px-4 py-3 flex items-center justify-between gap-4 max-w-screen-xl mx-auto">
          <p className="text-gray-300 text-xs leading-relaxed">
            🍪 We use essential cookies. Read more in our {' '}
            <Link to="/privacy" className="text-primary-400 hover:underline">
              Privacy Policy
            </Link>
          </p>
          
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={handleDecline}
              className="px-3 py-1.5 text-xs text-gray-400 hover:text-white transition-colors"
            >
              Decline
            </button>
            <button
              onClick={handleAccept}
              className="px-3 py-1.5 text-xs text-white font-medium rounded transition-all hover:opacity-90"
              style={{ background: 'var(--aipb-accent-bg)' }}
            >
              Accept
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
