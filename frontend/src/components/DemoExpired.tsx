import { motion } from 'framer-motion'
import Lottie from 'lottie-react'
import logo from '../assets/logo-aiphotobooth-default.svg'
import aiphotoboothAnimation from '../lottie/aiphotobooth-dark.json'
import backgroundVideo from '../assets/apbck.mp4'

function ObfuscatedEmail({ user, domain, className }: { user: string; domain: string; className?: string }) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    window.location.href = `mailto:${user}@${domain}`
  }
  
  return (
    <a 
      href="#" 
      onClick={handleClick}
      className={className}
    >
      {user}&#64;{domain}
    </a>
  )
}

interface DemoExpiredProps {
  onRequestNew: () => void
}

export function DemoExpired({ onRequestNew }: DemoExpiredProps) {
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

        {/* Logo */}
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
            className="drop-shadow-lg mb-6"
            style={{ height: 'clamp(100px, 12vh, 250px)', width: 'auto' }}
          />
        </motion.div>

        {/* Expired icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          className="mb-6"
        >
          <div 
            className="rounded-full flex items-center justify-center mx-auto"
            style={{ 
              background: 'rgba(239, 68, 68, 0.2)',
              width: 'clamp(80px, 12vh, 150px)',
              height: 'clamp(80px, 12vh, 150px)',
            }}
          >
            <svg 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="rgb(239, 68, 68)" 
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ width: 'clamp(40px, 6vh, 80px)', height: 'clamp(40px, 6vh, 80px)' }}
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <h1 
            className="text-white mb-4"
            style={{ fontSize: 'clamp(1.5rem, 4vh, 3rem)', fontWeight: 600 }}
          >
            Demo Session Expired
          </h1>
          <p 
            className="text-gray-400 mb-2"
            style={{ fontSize: 'clamp(1rem, 2vh, 1.5rem)' }}
          >
            Your demo session has ended.
          </p>
          <p 
            className="text-gray-500"
            style={{ fontSize: 'clamp(0.875rem, 1.5vh, 1.25rem)' }}
          >
            Request a new demo or contact us for full access.
          </p>
        </motion.div>

        {/* Contact link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{ fontSize: 'clamp(0.875rem, 1.5vh, 1.25rem)' }}
        >
          <ObfuscatedEmail 
            user="aiphotobooth" 
            domain="infini.to" 
            className="text-primary-400 hover:text-primary-300 transition-colors"
          />
        </motion.div>

        {/* Request New Demo Button - in flow */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          whileTap={{ scale: 0.98 }}
          onClick={onRequestNew}
          className="text-white font-bold rounded-button uppercase tracking-wide flex items-center justify-center"
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
          Request New Demo
        </motion.button>
      </motion.div>
    </div>
  )
}
