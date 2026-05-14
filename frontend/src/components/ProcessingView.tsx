import { motion } from 'framer-motion'
import Lottie from 'lottie-react'
import avatarAnimation from '../lottie/avatar.json'
import racetrackAnimation from '../lottie/racetrack.json'
import backgroundVideo from '../assets/apbck.mp4'

const processingLottieByKey = {
  avatar: avatarAnimation,
  racetrack: racetrackAnimation,
} as const

const processingLottieKey: keyof typeof processingLottieByKey = 'racetrack' // 'avatar' = poprzednia animacja

interface ProcessingViewProps {
  title?: string
  subtitle?: string
}

export function ProcessingView({ 
  title = "AI transforming your photo...", 
  subtitle = "This may take up to 30 seconds" 
}: ProcessingViewProps) {
  const processingAnimation = processingLottieByKey[processingLottieKey]

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden">
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
      
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-40 backdrop-blur-sm"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
      />
      
      {/* Modal Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
        className="relative z-50 rounded-mobile shadow-mobile-lg w-full max-w-md mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ backgroundColor: 'var(--aipb-modal-card-bg)' }}
      >
        <div className="flex flex-col p-6 items-center">
          {/* Lottie Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            style={{
              width: 'clamp(150px, 30vw, 300px)',
              height: 'clamp(150px, 30vw, 300px)',
              marginBottom: '1.5rem',
              flexShrink: 0
            }}
          >
            <Lottie
              animationData={processingAnimation}
              loop={true}
              autoplay={true}
              className="w-full h-full"
            />
          </motion.div>
          
          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="text-center mb-3"
            style={{ 
              fontSize: 'clamp(1.125rem, 4vw, 1.5rem)',
              lineHeight: '1.3',
              fontWeight: 600,
              color: 'var(--aipb-modal-text)',
            }}
          >
            {title}
          </motion.h2>
          
          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center"
            style={{
              fontSize: 'clamp(0.875rem, 3vw, 1.125rem)',
              lineHeight: '1.5',
              color: 'var(--aipb-description-text)',
            }}
          >
            {subtitle}
          </motion.p>
        </div>
      </motion.div>
    </div>
  )
}
