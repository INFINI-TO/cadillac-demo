import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useDemoStore } from '../stores/useDemoStore'
import { analytics } from '../hooks/useAnalytics'
import changeStyleIcon from '../assets/ic-changestyle.svg'
import newPhotoIcon from '../assets/ic-newphoto.svg'
import closeIcon from '../assets/ic-close.svg'
import backgroundVideo from '../assets/apbck.mp4'

function ObfuscatedEmail({ user, domain, className, subject, children, style, trackCta = false }: { 
  user: string; 
  domain: string; 
  className?: string; 
  subject?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  trackCta?: boolean;
}) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (trackCta) {
      analytics.ctaGetInTouchClicked()
    }
    const subjectParam = subject ? `?subject=${encodeURIComponent(subject)}` : ''
    window.location.href = `mailto:${user}@${domain}${subjectParam}`
  }
  
  return (
    <span 
      onClick={handleClick}
      className={className}
      style={{ cursor: 'pointer', ...style }}
    >
      {children || <>{user}&#64;{domain}</>}
    </span>
  )
}

interface ResultViewProps {
  photoUrl: string
  qrCodeUrl: string | null
  expiresAt: string | null
  onNewPhoto: () => void
  onChangeStyle: () => void
}

function MarketingSection({ isLandscape = false }: { isLandscape?: boolean }) {
  return (
    <div 
      className="flex flex-col"
      style={{ 
        padding: isLandscape ? 'clamp(1.25rem, 2.5vh, 2.5rem)' : 'clamp(1rem, 2vh, 2rem)',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 'clamp(12px, 2vh, 24px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <h3 
        className="font-bold text-white"
        style={{ 
          fontSize: isLandscape ? 'clamp(1.1rem, 2vh, 1.5rem)' : 'clamp(0.9rem, 1.5vh, 1.25rem)',
          marginBottom: isLandscape ? 'clamp(0.75rem, 1.5vh, 1.25rem)' : 'clamp(0.5rem, 1vh, 1rem)',
        }}
      >
        Unlock the full grid
      </h3>
      <ul 
        className="text-gray-300"
        style={{ 
          fontSize: isLandscape ? 'clamp(0.85rem, 1.5vh, 1.1rem)' : 'clamp(0.7rem, 1.1vh, 1rem)',
          listStyleType: 'none',
          padding: 0,
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: isLandscape ? 'clamp(0.4rem, 0.8vh, 0.6rem)' : 'clamp(0.25rem, 0.5vh, 0.4rem)',
        }}
      >
        <li className="flex items-center gap-2">
          <span style={{ color: 'rgb(var(--aipb-accent))' }}>✓</span>
          Custom branding & themes
        </li>
        <li className="flex items-center gap-2">
          <span style={{ color: 'rgb(var(--aipb-accent))' }}>✓</span>
          Multiple GenAI models
        </li>
        <li className="flex items-center gap-2">
          <span style={{ color: 'rgb(var(--aipb-accent))' }}>✓</span>
          Up to 4K resolution (depennding on model)
        </li>
        <li className="flex items-center gap-2">
          <span style={{ color: 'rgb(var(--aipb-accent))' }}>✓</span>
          Camera control (resolution, fps, etc.)
        </li>
        <li className="flex items-center gap-2">
          <span style={{ color: 'rgb(var(--aipb-accent))' }}>✓</span>
          Video generation
        </li>
        <li className="flex items-center gap-2">
          <span style={{ color: 'rgb(var(--aipb-accent))' }}>✓</span>
          Lighting integration
        </li>
        <li className="flex items-center gap-2">
          <span style={{ color: 'rgb(var(--aipb-accent))' }}>✓</span>
          Instant email delivery
        </li>
        <li className="flex items-center gap-2">
          <span style={{ color: 'rgb(var(--aipb-accent))' }}>✓</span>
          Photo printing support
        </li>
      </ul>
      
      {/* CTA Button */}
      <ObfuscatedEmail
        user="aiphotobooth"
        domain="infini.to"
        subject="AI Photo Booth Inquiry"
        trackCta
        className="w-full font-semibold text-white rounded-full transition-all hover:opacity-90 text-center block"
        style={{ 
          background: 'var(--aipb-accent-bg)',
          padding: isLandscape ? 'clamp(0.75rem, 1.5vh, 1.25rem) clamp(1rem, 2vh, 2rem)' : 'clamp(0.6rem, 1.2vh, 1rem) clamp(0.75rem, 1.5vh, 1.5rem)',
          fontSize: isLandscape ? 'clamp(0.9rem, 1.6vh, 1.2rem)' : 'clamp(0.75rem, 1.2vh, 1rem)',
          marginTop: isLandscape ? 'clamp(1rem, 2vh, 1.5rem)' : 'clamp(0.75rem, 1.5vh, 1rem)',
        }}
      >
        Get in Touch
      </ObfuscatedEmail>
      
      <p 
        className="text-gray-400 text-center"
        style={{ 
          fontSize: isLandscape ? 'clamp(0.75rem, 1.2vh, 1rem)' : 'clamp(0.65rem, 1vh, 0.9rem)',
          marginTop: isLandscape ? 'clamp(0.75rem, 1.5vh, 1rem)' : 'clamp(0.5rem, 1vh, 0.75rem)',
        }}
      >
        <ObfuscatedEmail 
          user="aiphotobooth" 
          domain="infini.to" 
          className="text-white hover:text-primary-400 transition-colors"
        />
      </p>
    </div>
  )
}

export function ResultView({ 
  photoUrl, 
  qrCodeUrl, 
  expiresAt, 
  onNewPhoto, 
  onChangeStyle 
}: ResultViewProps) {
  const { sessionsRemaining } = useDemoStore()
  const [isLandscape, setIsLandscape] = useState(false)

  useEffect(() => {
    const checkOrientation = () => {
      setIsLandscape(window.matchMedia('(orientation: landscape)').matches)
    }
    
    checkOrientation()
    const mediaQuery = window.matchMedia('(orientation: landscape)')
    mediaQuery.addEventListener('change', checkOrientation)
    
    return () => mediaQuery.removeEventListener('change', checkOrientation)
  }, [])

  const ActionButtons = ({ wider = false }: { wider?: boolean }) => (
    <div 
      className="flex flex-row justify-center flex-wrap"
      style={{ 
        gap: wider ? 'clamp(1.5rem, 3vh, 4rem)' : 'clamp(0.75rem, 1.5vh, 2rem)',
      }}
    >
      {/* Change Style Button - round white */}
      <button
        onClick={onChangeStyle}
        className="bg-white rounded-full flex items-center justify-center transition-all shadow-mobile no-select"
        style={{ 
          width: 'clamp(4rem, 8vh, 10rem)',
          height: 'clamp(4rem, 8vh, 10rem)',
          boxShadow: '0 0 0 clamp(5px, 0.7vh, 12px) rgba(255,255,255,0.4)',
        }}
        aria-label="Change Style"
      >
        <img
          src={changeStyleIcon}
          alt="Try another livery"
          draggable="false"
          style={{
            width: 'clamp(2rem, 4vh, 5rem)',
            height: 'clamp(2rem, 4vh, 5rem)',
            filter: 'brightness(0) invert(0)',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            pointerEvents: 'none',
          }}
        />
      </button>

      {/* New Photo Button - round accent */}
      <button
        onClick={onNewPhoto}
        className="rounded-full flex items-center justify-center shadow-mobile-lg transition-all no-select"
        style={{ 
          background: 'var(--aipb-accent-bg)',
          width: 'clamp(4rem, 8vh, 10rem)',
          height: 'clamp(4rem, 8vh, 10rem)',
          boxShadow: '0 0 0 clamp(5px, 0.7vh, 12px) rgba(255,255,255,0.4)',
        }}
        aria-label="New Photo"
      >
        <img
          src={newPhotoIcon}
          alt="Back to the grid"
          draggable="false"
          style={{
            width: 'clamp(2rem, 4vh, 5rem)',
            height: 'clamp(2rem, 4vh, 5rem)',
            filter: 'brightness(0) invert(1)',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            pointerEvents: 'none',
          }}
        />
      </button>
    </div>
  )

  const QRSection = ({ className = '' }: { className?: string }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.4 }}
      className={`flex flex-col items-center ${className}`}
    >
      <div 
        style={{ 
          padding: 'clamp(0.5rem, 1vh, 1.5rem)',
          borderRadius: 'clamp(12px, 2vh, 32px)',
          backgroundColor: 'var(--aipb-qr-container-bg)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <img
          src={qrCodeUrl!}
          alt="QR Code"
          draggable="false"
          style={{ 
            width: isLandscape ? 'clamp(80px, 12vh, 180px)' : 'clamp(100px, 14vh, 250px)',
            height: isLandscape ? 'clamp(80px, 12vh, 180px)' : 'clamp(100px, 14vh, 250px)',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            pointerEvents: 'none',
            filter: 'var(--aipb-qr-filter, none)',
          }}
        />
      </div>
      <p 
        className="text-center text-gray-400 font-semibold"
        style={{ 
          fontSize: 'clamp(0.65rem, 1vh, 1rem)',
          marginTop: 'clamp(0.4rem, 0.8vh, 1rem)',
        }}
      >
        Scan to save your shot
      </p>
    </motion.div>
  )

  return (
    <div 
      className="w-full h-full min-h-screen flex items-center justify-center relative overflow-hidden"
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
      
      {/* Backdrop/Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 z-40 backdrop-blur-sm"
        onClick={onNewPhoto}
      />
      
      {/* Lightbox Modal Card - centered */}
      <div className={`absolute inset-0 flex z-50 px-4 py-8 ${isLandscape ? 'items-center justify-center' : 'items-start justify-center'}`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
          className="rounded-mobile shadow-mobile-lg mx-auto relative overflow-hidden no-scrollbar"
          onClick={(e) => e.stopPropagation()}
          style={{ 
            backgroundColor: 'var(--aipb-result-card-bg)',
            width: isLandscape ? '95vw' : '85vw',
            maxWidth: isLandscape ? '95vw' : '85vw',
            maxHeight: '92vh',
            overflowY: 'auto',
            overflowX: 'hidden',
            scrollbarWidth: 'none',
            marginTop: isLandscape ? 0 : '5rem',
          }}
        >
          {/* Close Button - Top Right */}
          <button
            onClick={onNewPhoto}
            className="absolute z-10 flex items-center justify-center rounded-full hover:opacity-80 transition-opacity shadow-mobile"
            style={{ 
              backgroundColor: 'var(--aipb-result-close-bg)',
              top: 'clamp(0.5rem, 0.75vh, 1.25rem)',
              right: 'clamp(0.5rem, 0.75vh, 1.25rem)',
              width: 'clamp(2rem, 3vh, 5rem)',
              height: 'clamp(2rem, 3vh, 5rem)',
              padding: 0,
            }}
            aria-label="Close"
          >
            <img
              src={closeIcon}
              alt="Close"
              draggable="false"
              style={{ 
                width: 'clamp(1.2rem, 1.8vh, 3rem)', 
                height: 'clamp(1.2rem, 1.8vh, 3rem)',
                filter: 'brightness(0) invert(1)',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                pointerEvents: 'none',
              }}
            />
          </button>

          {/* Content - Different layouts for portrait/landscape */}
          {isLandscape ? (
            /* LANDSCAPE LAYOUT: Photo | Marketing+QR+Buttons */
            <div 
              className="flex flex-row items-stretch"
              style={{ 
                padding: 'clamp(1rem, 2vh, 2rem)',
                gap: 'clamp(1.5rem, 3vh, 3rem)',
                minHeight: '100%',
              }}
            >
              {/* Left Column - Photo */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="flex items-center justify-center flex-shrink-0"
              >
                <img
                  src={photoUrl}
                  alt="Processed photo"
                  className="object-cover"
                  draggable="false"
                  style={{
                    aspectRatio: '3/4',
                    height: 'clamp(50vh, 70vh, 80vh)',
                    borderRadius: 'clamp(12px, 2vh, 32px)',
                  }}
                />
              </motion.div>

              {/* Right Column - Marketing + QR + Buttons */}
              <div 
                className="flex flex-col justify-between flex-1"
                style={{ 
                  minWidth: 'clamp(220px, 30vw, 400px)',
                  paddingTop: 'clamp(0.5rem, 1vh, 1.5rem)',
                  paddingBottom: 'clamp(0.5rem, 1vh, 1.5rem)',
                }}
              >
                {/* Marketing Section */}
                <MarketingSection isLandscape />

                {/* QR Code - centered below marketing */}
                {qrCodeUrl && (
                  <div 
                    className="flex justify-center"
                    style={{ marginTop: 'clamp(1rem, 2vh, 2rem)' }}
                  >
                    <QRSection />
                  </div>
                )}

                {/* Sessions remaining + Buttons */}
                <div 
                  className="flex flex-col items-center mt-auto" 
                  style={{ 
                    gap: 'clamp(0.75rem, 1.5vh, 1.25rem)',
                    marginTop: 'clamp(1rem, 2vh, 2rem)',
                  }}
                >
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35 }}
                    className="text-center text-primary-400"
                    style={{ 
                      fontSize: 'clamp(0.8rem, 1.3vh, 1.1rem)',
                    }}
                  >
                    {sessionsRemaining} session{sessionsRemaining !== 1 ? 's' : ''} left this stint
                  </motion.p>
                  
                  <ActionButtons wider />
                </div>
              </div>
            </div>
          ) : (
            /* PORTRAIT LAYOUT: Vertical stack */
            <div className="flex flex-col" style={{ padding: 'clamp(1rem, 2vh, 2.5rem)' }}>
              {/* Processed Photo */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="w-full flex items-center justify-center"
                style={{
                  marginTop: 'clamp(0.5rem, 1vh, 1.5rem)',
                  marginBottom: 0,
                  paddingLeft: 'clamp(0.5rem, 1vh, 1.5rem)',
                  paddingRight: 'clamp(0.5rem, 1vh, 1.5rem)'
                }}
              >
                <img
                  src={photoUrl}
                  alt="Processed photo"
                  className="w-full object-cover"
                  draggable="false"
                  style={{
                    aspectRatio: '4/5',
                    height: 'clamp(34vh, 50vh, 54vh)',
                    borderRadius: 'clamp(16px, 2.5vh, 40px)',
                  }}
                />
              </motion.div>

              {/* QR Code - overlapping photo */}
              {qrCodeUrl && (
                <div style={{ marginTop: 'clamp(-2.5rem, -4vh, -1.5rem)' }}>
                  <QRSection />
                </div>
              )}

              {/* Expiration notice */}
              {expiresAt && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-center text-gray-500 opacity-60"
                  style={{ 
                    fontSize: 'clamp(0.75rem, 1.2vh, 1.25rem)',
                    marginTop: 'clamp(0.25rem, 0.5vh, 0.75rem)',
                    marginBottom: 0
                  }}
                >
                  Shot available until: {new Date(expiresAt).toLocaleTimeString()}
                </motion.p>
              )}

              {/* Sessions remaining */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="text-center text-primary-400"
                style={{ 
                  fontSize: 'clamp(0.75rem, 1.2vh, 1.25rem)',
                  marginTop: 'clamp(0.25rem, 0.5vh, 0.75rem)',
                  marginBottom: 0
                }}
              >
                {sessionsRemaining} session{sessionsRemaining !== 1 ? 's' : ''} left this stint
              </motion.p>

              {/* Action Buttons */}
              <div style={{ marginTop: 'clamp(0.5rem, 1vh, 1.5rem)', marginBottom: 'clamp(0.5rem, 1vh, 1.5rem)' }}>
                <ActionButtons />
              </div>

              {/* Marketing Section - below buttons in portrait */}
              <div style={{ marginTop: 'clamp(0.5rem, 1vh, 1.5rem)' }}>
                <MarketingSection isLandscape={false} />
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
