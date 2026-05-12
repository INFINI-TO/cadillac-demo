import { useRef, useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useDemoStore } from '../stores/useDemoStore'
import { capturePhoto } from '../services/demoApi'

export function CameraView() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  
  const { token, setCapturedPhoto, setStep, setLoading, setError } = useDemoStore()

  // Initialize camera
  useEffect(() => {
    const initCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        })
        
        setStream(mediaStream)
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
        }
      } catch (err) {
        console.error('Camera error:', err)
        setCameraError('Failed to access camera. Please allow camera permissions.')
      }
    }

    initCamera()

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  // Handle capture with countdown
  const handleCapture = useCallback(async () => {
    if (isCapturing || !videoRef.current || !canvasRef.current || !token) return
    
    setIsCapturing(true)
    
    // Countdown
    for (let i = 3; i > 0; i--) {
      setCountdown(i)
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    setCountdown(null)
    
    // Flash effect
    const flashEl = document.createElement('div')
    flashEl.className = 'fixed inset-0 bg-white z-50 pointer-events-none'
    document.body.appendChild(flashEl)
    setTimeout(() => {
      flashEl.remove()
    }, 150)
    
    // Capture frame
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      setIsCapturing(false)
      return
    }
    
    // Mirror the image for selfie camera
    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(video, 0, 0)
    
    // Convert to blob
    canvas.toBlob(async (blob) => {
      if (!blob) {
        setIsCapturing(false)
        setError('Failed to capture image')
        return
      }
      
      setLoading(true)
      
      try {
        // Upload to server
        const response = await capturePhoto(token, blob)
        
        // Store captured photo
        setCapturedPhoto(response.photo_id, blob)
        
        // Move to preview
        setStep('preview')
      } catch (err: unknown) {
        console.error('Capture upload error:', err)
        if (err && typeof err === 'object' && 'response' in err) {
          const axiosError = err as { response?: { data?: { detail?: string } } }
          setError(axiosError.response?.data?.detail || 'Failed to upload photo')
        } else {
          setError('Failed to upload photo')
        }
      } finally {
        setLoading(false)
        setIsCapturing(false)
      }
    }, 'image/jpeg', 0.95)
  }, [isCapturing, token, setCapturedPhoto, setStep, setLoading, setError])

  if (cameraError) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="card max-w-md w-full text-center"
      >
        <div className="text-5xl mb-4">📷</div>
        <h2 className="text-xl font-medium text-white mb-2">Camera Access Required</h2>
        <p className="text-gray-300 mb-4">{cameraError}</p>
        <button
          onClick={() => window.location.reload()}
          className="btn-primary"
        >
          Try Again
        </button>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-2xl"
    >
      {/* Camera viewfinder */}
      <div className="relative rounded-3xl overflow-hidden aspect-[3/4] sm:aspect-video" style={{ background: 'rgb(var(--aipb-dark))' }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          style={{ transform: 'scaleX(-1)' }}
        />
        
        {/* Countdown overlay */}
        {countdown !== null && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <motion.div
              key={countdown}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              className="text-9xl font-black gradient-text"
            >
              {countdown}
            </motion.div>
          </div>
        )}
        
        {/* Guide overlay */}
        {!countdown && !isCapturing && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-8 border-2 border-white/30 rounded-3xl" />
          </div>
        )}
      </div>

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Capture button */}
      <div className="flex justify-center mt-6">
        <button
          onClick={handleCapture}
          disabled={isCapturing || !stream}
          className={`
            w-20 h-20 rounded-full
            flex items-center justify-center
            transition-all duration-200 shadow-glow-lg
            ${isCapturing 
              ? 'cursor-not-allowed opacity-50' 
              : 'hover:scale-105 active:scale-95'
            }
          `}
          style={{ 
            background: isCapturing ? '#888' : 'var(--aipb-accent-bg)',
            border: '4px solid rgba(255,255,255,0.3)'
          }}
        >
          <div className={`
            w-14 h-14 rounded-full bg-white
            ${isCapturing ? 'animate-pulse' : ''}
          `} />
        </button>
      </div>

      {/* Instructions */}
      <p className="text-center text-gray-400 mt-4">
        Position yourself and tap the button to take a photo
      </p>
    </motion.div>
  )
}
