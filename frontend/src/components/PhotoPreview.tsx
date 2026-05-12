import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useDemoStore } from '../stores/useDemoStore'

export function PhotoPreview() {
  const { capturedPhotoBlob, setStep, resetForNewPhoto } = useDemoStore()

  const previewUrl = useMemo(() => {
    if (!capturedPhotoBlob) return null
    return URL.createObjectURL(capturedPhotoBlob)
  }, [capturedPhotoBlob])

  const handleRetake = () => {
    resetForNewPhoto()
  }

  const handleContinue = () => {
    setStep('style')
  }

  if (!previewUrl) {
    return (
      <div className="text-center text-gray-400">
        No photo captured
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-2xl"
    >
      {/* Photo preview */}
      <div className="relative rounded-3xl overflow-hidden" style={{ background: 'rgb(var(--aipb-dark))' }}>
        <img
          src={previewUrl}
          alt="Captured photo"
          className="w-full h-auto"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-4 mt-6 justify-center">
        <button
          onClick={handleRetake}
          className="btn-secondary flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Retake
        </button>
        <button
          onClick={handleContinue}
          className="btn-primary flex items-center"
        >
          Choose Style
          <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>

      {/* Tip */}
      <p className="text-center text-gray-400 text-sm mt-4">
        Happy with your photo? Continue to select an AI transformation style.
      </p>
    </motion.div>
  )
}
