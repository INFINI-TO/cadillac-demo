import { motion } from 'framer-motion'
import Lottie from 'lottie-react'
import { useDemoStore } from '../stores/useDemoStore'
import logo from '../assets/logo-aiphotobooth-default.svg'
import aiphotoboothAnimation from '../lottie/aiphotobooth-dark.json'
import backgroundVideo from '../assets/apbck.mp4'

interface DemoWelcomeProps {
  onStart: () => void
  isLoading: boolean
  error: string | null
}

export function DemoWelcome({ onStart, isLoading, error }: DemoWelcomeProps) {
  const { name, sessionsRemaining, styles, timeRemainingSeconds } = useDemoStore()

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes} minutes`
  }

  return (
    <div 
      className="w-full h-full min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-20 text-center px-8 flex flex-col items-center"
        style={{ width: '80vw', maxWidth: '80vw' }}
      >
        {/* Lottie Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          style={{
            width: 'clamp(180px, 25vh, 400px)',
            height: 'clamp(180px, 25vh, 400px)',
            marginBottom: 'clamp(-0.5rem, -1vh, -1.5rem)'
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
          className="flex flex-col items-center mb-8"
          style={{ marginTop: '-3rem' }}
        >
          <img 
            src={logo} 
            alt="AI Photo Booth" 
            className="drop-shadow-lg mb-4"
            style={{ height: 'clamp(100px, 12vh, 250px)', width: 'auto' }}
          />
          <h1 
            className="text-white drop-shadow-md"
            style={{ fontSize: 'clamp(1.5rem, 4vh, 3rem)', fontWeight: 600 }}
          >
            Welcome{name ? `, ${name}` : ''}!
          </h1>
          <p className="text-gray-300 mt-2" style={{ fontSize: 'clamp(1rem, 2vh, 1.5rem)' }}>
            Your AI Photo Booth demo is ready
          </p>
        </motion.div>

        {/* Demo limits card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="w-full rounded-mobile p-6"
          style={{ 
            background: 'var(--aipb-card-bg)',
            border: '1px solid var(--aipb-section-border)',
            maxWidth: 'clamp(20rem, 50vw, 30rem)'
          }}
        >
          <h2 
            className="text-gray-400 mb-4 uppercase tracking-wider"
            style={{ fontSize: 'clamp(0.7rem, 1.2vh, 1rem)', fontWeight: 500 }}
          >
            Demo Limits
          </h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <div className="gradient-text" style={{ fontSize: 'clamp(2rem, 4vh, 3.5rem)', fontWeight: 900 }}>
                {sessionsRemaining}
              </div>
              <div className="text-gray-400" style={{ fontSize: 'clamp(0.7rem, 1.2vh, 1rem)' }}>Sessions</div>
            </div>
            <div className="text-center">
              <div className="gradient-text" style={{ fontSize: 'clamp(2rem, 4vh, 3.5rem)', fontWeight: 900 }}>
                {styles.length}
              </div>
              <div className="text-gray-400" style={{ fontSize: 'clamp(0.7rem, 1.2vh, 1rem)' }}>Styles</div>
            </div>
          </div>
          <div className="text-center pt-4" style={{ borderTop: '1px solid var(--aipb-section-border)' }}>
            <div className="text-white" style={{ fontSize: 'clamp(1rem, 2vh, 1.5rem)', fontWeight: 500 }}>
              {formatTime(timeRemainingSeconds)}
            </div>
            <div className="text-gray-400" style={{ fontSize: 'clamp(0.7rem, 1.2vh, 1rem)' }}>Time remaining</div>
          </div>
        </motion.div>

        {/* Note about watermark */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="w-full mt-4 rounded-mobile p-3"
          style={{ 
            background: 'rgba(6, 182, 212, 0.12)', 
            border: '1px solid rgba(6, 182, 212, 0.35)',
            maxWidth: 'clamp(20rem, 50vw, 30rem)'
          }}
        >
          <p className="text-primary-300" style={{ fontSize: 'clamp(0.75rem, 1.2vh, 1rem)' }}>
            <span className="font-medium">Note:</span> Demo photos include a watermark.
          </p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-mobile text-red-300"
            style={{ 
              fontSize: 'clamp(0.75rem, 1.2vh, 1rem)',
              maxWidth: 'clamp(20rem, 50vw, 30rem)'
            }}
          >
            {error}
          </motion.div>
        )}

        {/* Start Demo Button - in flow */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          whileTap={{ scale: 0.98 }}
          onClick={onStart}
          disabled={isLoading}
          className="text-white font-bold rounded-button uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          style={{ 
            background: 'var(--aipb-accent-bg)',
            boxShadow: '0 8px 24px rgb(6 182 212 / 0.5)',
            padding: 'clamp(1rem, 2vh, 2.5rem) clamp(3rem, 6vh, 8rem)',
            fontSize: 'clamp(1rem, 2vh, 1.5rem)',
            minWidth: 'auto',
            minHeight: 'auto',
            marginTop: 'clamp(1.5rem, 3vh, 4rem)',
          }}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Starting...
            </>
          ) : (
            'Start Demo'
          )}
        </motion.button>
      </motion.div>
    </div>
  )
}
