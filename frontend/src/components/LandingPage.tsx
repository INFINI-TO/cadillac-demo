import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Lottie from 'lottie-react'
import { requestDemo } from '../services/demoApi'
import { analytics } from '../hooks/useAnalytics'
import logo from '../assets/logo-aiphotobooth-default.svg'
import aiphotoboothAnimation from '../lottie/aiphotobooth-dark.json'
import backgroundVideo from '../assets/apbck.mp4'

const RECAPTCHA_SITE_KEY = '6LcFOX0sAAAAAAyp5H89weblDr4tiVysYckBTa2z'

const getRecaptchaToken = (): Promise<string> =>
  new Promise((resolve, reject) => {
    if (!window.grecaptcha?.enterprise) {
      reject(new Error('reCAPTCHA Enterprise not loaded'))
      return
    }
    window.grecaptcha.enterprise.ready(() => {
      window.grecaptcha.enterprise
        .execute(RECAPTCHA_SITE_KEY, { action: 'demo_request' })
        .then(resolve)
        .catch(reject)
    })
  })

const INDUSTRIES = [
  { value: '', label: 'Select industry *' },
  { value: 'events_mice', label: 'Events & MICE' },
  { value: 'retail', label: 'Retail & Shopping Centers' },
  { value: 'hospitality', label: 'Hotels & Hospitality' },
  { value: 'tradeshows', label: 'Trade Shows & Exhibitions' },
  { value: 'event_agency', label: 'Event Agency' },
  { value: 'advertising', label: 'Advertising Agency' },
  { value: 'corporate', label: 'Corporate (Internal Events)' },
  { value: 'nonprofit', label: 'Foundation / Non-profit' },
  { value: 'other', label: 'Other' },
]

export function LandingPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [company, setCompany] = useState('')
  const [industry, setIndustry] = useState('')
  const [privacyConsent, setPrivacyConsent] = useState(true)
  const [marketingConsent, setMarketingConsent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    analytics.pageView('landing')
  }, [])

  const isFormValid = name.trim() && email.trim() && company.trim() && industry && privacyConsent

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid) return

    setIsLoading(true)
    setError(null)
    analytics.demoRequested(industry, marketingConsent)

    try {
      let recaptchaToken: string | undefined
      try {
        recaptchaToken = await getRecaptchaToken()
      } catch {
        // reCAPTCHA may not be loaded (ad blocker, network issue) - proceed without it
      }

      const response = await requestDemo({ 
        name: name.trim(),
        email: email.trim(), 
        phone: phone.trim() || undefined,
        company: company.trim(),
        industry,
        marketing_consent: marketingConsent,
        recaptcha_token: recaptchaToken,
      })
      if (response.success) {
        setSuccess(true)
        analytics.demoRequestSuccess()
      } else {
        const errorMsg = response.message || 'Failed to start demo'
        setError(errorMsg)
        analytics.demoRequestError(errorMsg)
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to start demo'
      setError(errorMsg)
      analytics.demoRequestError(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  const inputStyle = {
    background: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    fontSize: 'clamp(0.8rem, 1.3vh, 1rem)'
  }

  return (
    <div 
      className="w-full h-full min-h-screen flex flex-col items-center relative overflow-y-auto"
      style={{ background: 'rgb(var(--aipb-bg))' }}
    >
      {/* Background video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
        style={{ opacity: 0.1 }}
      >
        <source src={backgroundVideo} type="video/mp4" />
      </video>
      
      {/* Dimmed overlay for text readability */}
      <div className="absolute inset-0 z-[1]" style={{ background: 'rgba(17, 17, 17, 0.35)', pointerEvents: 'none' }} />
      
      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center flex flex-col items-center relative z-20"
        style={{ 
          paddingTop: 'clamp(2rem, 5vh, 6rem)',
          paddingBottom: 'clamp(2rem, 4vh, 4rem)',
          width: '90vw',
          maxWidth: '500px',
        }}
      >
        {/* Lottie Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          style={{
            width: 'clamp(120px, 18vh, 280px)',
            height: 'clamp(120px, 18vh, 280px)',
            marginBottom: 'clamp(-0.25rem, -0.5vh, -1rem)'
          }}
        >
          <Lottie
            animationData={aiphotoboothAnimation}
            loop={true}
            autoplay={true}
            className="w-full h-full"
            style={{
              userSelect: 'none',
              WebkitUserSelect: 'none',
              pointerEvents: 'none'
            }}
          />
        </motion.div>

        {/* Logo + Title */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="flex flex-col items-center"
          style={{ marginTop: '-2rem', marginBottom: 'clamp(1rem, 2vh, 2rem)' }}
        >
          <img 
            src={logo} 
            alt="AI Photo Booth" 
            className="drop-shadow-lg"
            style={{ 
              height: 'clamp(60px, 8vh, 150px)', 
              width: 'auto',
              marginBottom: 'clamp(0.5rem, 1vh, 1.5rem)'
            }}
          />
          <p 
            className="text-gray-300"
            style={{ fontSize: 'clamp(0.85rem, 1.4vh, 1.2rem)' }}
          >
            {success 
              ? 'Check your email for the demo link!' 
              : 'Request access to try our AI Photo Booth'}
          </p>
        </motion.div>

        {/* Form Card */}
        {!success && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="w-full rounded-mobile"
          style={{ 
            background: 'var(--aipb-card-bg)',
            border: '1px solid var(--aipb-section-border)',
            padding: 'clamp(1rem, 2vh, 1.5rem)',
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Name - Required */}
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name *"
              required
              className="w-full px-3 py-2.5 rounded-mobile text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              style={inputStyle}
            />

            {/* Email - Required */}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address *"
              required
              className="w-full px-3 py-2.5 rounded-mobile text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              style={inputStyle}
            />

            {/* Phone - Optional */}
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone number (optional)"
              className="w-full px-3 py-2.5 rounded-mobile text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              style={inputStyle}
            />

            {/* Company - Required */}
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Company / Organization *"
              required
              className="w-full px-3 py-2.5 rounded-mobile text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              style={inputStyle}
            />

            {/* Industry - Required */}
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-mobile text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              style={{
                ...inputStyle,
                color: industry ? 'white' : '#6b7280',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.75rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.25em 1.25em',
                paddingRight: '2.5rem',
              }}
            >
              {INDUSTRIES.map(ind => (
                <option key={ind.value} value={ind.value} style={{ background: '#1f1f1f', color: ind.value ? 'white' : '#6b7280' }}>
                  {ind.label}
                </option>
              ))}
            </select>

            {/* Privacy Policy Consent Checkbox - Required */}
            <label className="flex items-start gap-3 cursor-pointer mt-4">
              <input
                type="checkbox"
                checked={privacyConsent}
                onChange={(e) => setPrivacyConsent(e.target.checked)}
                required
                className="mt-0.5 w-4 h-4 rounded border-gray-600 bg-transparent text-primary-500 focus:ring-primary-500 focus:ring-offset-0"
              />
              <span className="text-gray-400 text-left" style={{ fontSize: 'clamp(0.7rem, 1.1vh, 0.85rem)' }}>
                I have read and accept the{' '}
                <Link to="/privacy" className="text-primary-400 hover:underline">Privacy Policy</Link> *
              </span>
            </label>

            {/* Marketing Consent Checkbox - Optional */}
            <label className="flex items-start gap-3 cursor-pointer mt-3">
              <input
                type="checkbox"
                checked={marketingConsent}
                onChange={(e) => setMarketingConsent(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-gray-600 bg-transparent text-primary-500 focus:ring-primary-500 focus:ring-offset-0"
              />
              <span className="text-gray-400 text-left" style={{ fontSize: 'clamp(0.7rem, 1.1vh, 0.85rem)' }}>
                I agree to receive marketing communications about AI Photo Booth products and services.
              </span>
            </label>

            {/* GDPR Notice */}
            <div 
              className="text-gray-500 text-left mt-3 pt-3"
              style={{ 
                fontSize: 'clamp(0.6rem, 0.9vh, 0.75rem)',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <p className="mb-2">
                <strong className="text-gray-400">Privacy Notice:</strong> Your data is processed by INFINI.TO to provide the demo and for follow-up communication. See our{' '}
                <Link to="/privacy" className="text-primary-400 hover:underline">
                  Privacy Policy
                </Link>. You may withdraw consent at any time.
              </p>
              <p className="text-gray-600">
                Demo version may differ from production deployment. Data submitted during demo is not permanently stored.
              </p>
              <p className="text-gray-600 mt-2">
                This site is protected by reCAPTCHA and the Google{' '}
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:underline">Privacy Policy</a> and{' '}
                <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:underline">Terms of Service</a> apply.
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-500/20 border border-red-500/50 rounded-mobile text-red-300"
                style={{ fontSize: 'clamp(0.7rem, 1.1vh, 0.9rem)' }}
              >
                {error}
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              whileTap={{ scale: 0.98 }}
              disabled={isLoading || !isFormValid}
              className="w-full text-white font-bold rounded-mobile uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mt-4"
              style={{ 
                background: 'var(--aipb-accent-bg)',
                boxShadow: '0 4px 16px rgb(6 182 212 / 0.4)',
                padding: 'clamp(0.75rem, 1.5vh, 1.25rem)',
                fontSize: 'clamp(0.85rem, 1.4vh, 1.1rem)',
              }}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Sending...
                </>
              ) : (
                'Request Demo Access'
              )}
            </motion.button>
          </form>
        </motion.div>
        )}

        {/* Success Message */}
        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full rounded-mobile p-6 text-center"
            style={{ 
              background: 'var(--aipb-card-bg)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
            }}
          >
            <div className="text-4xl mb-3">✉️</div>
            <h3 className="text-white font-bold text-lg mb-2">Check Your Email</h3>
            <p className="text-gray-400" style={{ fontSize: 'clamp(0.8rem, 1.2vh, 1rem)' }}>
              We've sent a demo access link to <strong className="text-white">{email}</strong>.
              <br />
              The link will be valid for 24 hours.
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
