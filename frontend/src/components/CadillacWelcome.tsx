import { motion } from 'framer-motion'
import Lottie from 'lottie-react'
import logo from '../assets/logo-aiphotobooth-default.svg'
import aiphotoboothAnimation from '../lottie/aiphotobooth-dark.json'
import backgroundVideo from '../assets/apbck.mp4'

interface CadillacWelcomeProps {
  onStart: () => void
  isLoading: boolean
  error: string | null
}

export function CadillacWelcome({ onStart, isLoading, error }: CadillacWelcomeProps) {
  return (
    <div
      className="w-full h-full min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: 'rgb(var(--aipb-bg))' }}
    >
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
      <div className="absolute inset-0 z-[1]" style={{ background: 'rgba(17, 17, 17, 0.35)', pointerEvents: 'none' }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-20 text-center px-8 flex flex-col items-center"
        style={{ width: '80vw', maxWidth: '80vw' }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          style={{
            width: 'clamp(180px, 25vh, 400px)',
            height: 'clamp(180px, 25vh, 400px)',
            marginBottom: 'clamp(-0.5rem, -1vh, -1.5rem)',
          }}
        >
          <Lottie
            animationData={aiphotoboothAnimation}
            loop
            autoplay
            className="w-full h-full"
            style={{ userSelect: 'none', WebkitUserSelect: 'none', pointerEvents: 'none' }}
          />
        </motion.div>

        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="flex flex-col items-center mb-8"
          style={{ marginTop: '-3rem' }}
        >
          <img
            src={logo}
            alt="Demo"
            className="drop-shadow-lg mb-4"
            style={{ height: 'clamp(100px, 12vh, 250px)', width: 'auto' }}
          />
          <h1 className="text-white drop-shadow-md" style={{ fontSize: 'clamp(1.5rem, 4vh, 3rem)', fontWeight: 600 }}>
            Cadillac F1 demo
          </h1>
          <p className="text-gray-300 mt-2" style={{ fontSize: 'clamp(1rem, 2vh, 1.5rem)' }}>
            Zrób zdjęcie i wybierz jeden z dwóch promptów AI.
          </p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-mobile text-red-300"
            style={{ fontSize: 'clamp(0.75rem, 1.2vh, 1rem)', maxWidth: 'clamp(20rem, 50vw, 30rem)' }}
          >
            {error}
          </motion.div>
        )}

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          whileTap={{ scale: 0.98 }}
          onClick={onStart}
          disabled={isLoading}
          className="text-white font-bold rounded-button uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          style={{
            background: 'var(--aipb-accent-bg)',
            boxShadow: '0 8px 24px rgb(6 182 212 / 0.5)',
            padding: 'clamp(1rem, 2vh, 2.5rem) clamp(3rem, 6vh, 8rem)',
            fontSize: 'clamp(1rem, 2vh, 1.5rem)',
            marginTop: 'clamp(1.5rem, 3vh, 4rem)',
          }}
        >
          {isLoading ? 'Uruchamianie…' : 'Start'}
        </motion.button>
      </motion.div>
    </div>
  )
}
