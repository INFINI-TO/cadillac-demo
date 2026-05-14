import { useState, useRef, useCallback, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDemoStore } from '../stores/useDemoStore'
import { 
  validateToken, 
  startSession, 
  capturePhoto as apiCapturePhoto, 
  processPhoto as apiProcessPhoto, 
  getPhotoUrl, 
  getQrUrl 
} from '../services/demoApi'
import { analytics } from '../hooks/useAnalytics'
import { SessionBar } from './SessionBar'
import { DemoWelcome } from './DemoWelcome'
import { StyleSelector } from './StyleSelector'
import { ProcessingView } from './ProcessingView'
import { ResultView } from './ResultView'
import { DemoExpired } from './DemoExpired'
import { AnimatePresence, motion } from 'framer-motion'
import backIcon from '../assets/ic-back.svg'
import retakeIcon from '../assets/ic-retake.svg'
import takePhotoIcon from '../assets/ic-takephoto.svg'

type Step = 'loading' | 'welcome' | 'camera' | 'preview' | 'style' | 'processing' | 'result' | 'expired'

interface ProcessResult {
  photoUrl: string
  qrCodeUrl: string | null
  expiresAt: string | null
}

export function DemoSession() {
  const { token: urlToken } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const { 
    sessionsRemaining, 
    setSessionInfo, 
    setSessionsUsed,
    updateSessionsRemaining,
  } = useDemoStore()
  
  const [step, setStep] = useState<Step>('loading')
  const [capturedPhotoId, setCapturedPhotoId] = useState<string | null>(null)
  const [capturedImageUrl, setCapturedImageUrl] = useState<string | null>(null)
  const [result, setResult] = useState<ProcessResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null)
  /** Wymusza remount ProcessingView przy każdym wejściu w processing (świeży los Lottie). */
  const [processingRunId, setProcessingRunId] = useState(0)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [videoReady, setVideoReady] = useState(false)
  
  // Persistent refs - like in main app's CameraProvider
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Validate token on mount
  useEffect(() => {
    const validate = async () => {
      if (!urlToken) {
        navigate('/')
        return
      }

      try {
        const response = await validateToken(urlToken)
        if (response.valid) {
          setSessionInfo({
            token: urlToken,
            email: response.email,
            name: response.name,
            sessionsRemaining: response.sessions_remaining || 0,
            styles: response.styles || [],
            timeRemainingSeconds: response.time_remaining_seconds || 0,
          })
          setStep('welcome')
          analytics.pageView('demo_welcome')
        } else {
          setStep('expired')
          analytics.sessionExpired()
        }
      } catch {
        setStep('expired')
        analytics.sessionExpired()
      }
    }

    validate()
  }, [urlToken, navigate, setSessionInfo])

  const startCamera = useCallback(async () => {
    setVideoReady(false)
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }
      })
      streamRef.current = newStream
      setStream(newStream)
      
      if (videoRef.current) {
        videoRef.current.srcObject = newStream
        videoRef.current.play().catch(() => {})
      }
      analytics.cameraOpened()
    } catch {
      const errorMsg = 'Failed to access camera. Please allow camera permissions.'
      setError(errorMsg)
      analytics.cameraError(errorMsg)
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setStream(null)
    setVideoReady(false)
  }, [])

  const handleStart = async () => {
    if (!urlToken) return
    
    setError(null)
    setIsLoading(true)

    try {
      const sessionResponse = await startSession(urlToken)
      setSessionsUsed(sessionResponse.session_number, sessionResponse.sessions_remaining)
      analytics.sessionStarted(sessionResponse.sessions_remaining)
      await startCamera()
      setStep('camera')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start session')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCaptureClick = () => {
    if (countdown !== null) return
    if (!videoReady) return
    setCountdown(3)
    analytics.photoCountdownStarted()
  }

  // Countdown effect
  useEffect(() => {
    if (countdown === null) return
    
    if (countdown === 0) {
      doCapture()
      setCountdown(null)
      return
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [countdown])

  const doCapture = async () => {
    const video = videoRef.current
    if (!video || !urlToken) {
      setError('Camera not ready. Please try again.')
      return
    }

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      setError('Camera not ready. Please try again.')
      return
    }

    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas')
    }
    const canvas = canvasRef.current

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    const previewDataUrl = canvas.toDataURL('image/jpeg', 0.9)
    setCapturedImageUrl(previewDataUrl)

    try {
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          b => b ? resolve(b) : reject(new Error('Failed to create blob')),
          'image/jpeg',
          0.95
        )
      })

      stopCamera()

      const captureResponse = await apiCapturePhoto(urlToken, blob)
      setCapturedPhotoId(captureResponse.photo_id)
      setStep('preview')
      analytics.photoCaptured()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to capture photo')
      setCapturedImageUrl(null)
      await startCamera()
    }
  }

  const handleRetake = async () => {
    setCapturedPhotoId(null)
    setCapturedImageUrl(null)
    analytics.photoRetake()
    await startCamera()
    setStep('camera')
  }

  const handleAcceptPhoto = () => {
    analytics.photoAccepted()
    setStep('style')
  }

  const handleStyleSelect = async (style: string) => {
    if (!capturedPhotoId || !urlToken) return
    
    const previousStyle = selectedStyle
    setSelectedStyle(style)
    setProcessingRunId((n) => n + 1)
    setStep('processing')
    setError(null)

    if (previousStyle) {
      analytics.styleChanged(previousStyle, style)
    } else {
      analytics.styleSelected(style)
    }
    analytics.processingStarted(style)

    const startTime = Date.now()

    try {
      const processResponse = await apiProcessPhoto(urlToken, capturedPhotoId, style)
      
      const durationMs = Date.now() - startTime
      analytics.processingCompleted(style, durationMs)

      // Update sessions remaining from backend response
      if (processResponse.sessions_remaining !== undefined) {
        updateSessionsRemaining(processResponse.sessions_remaining)
      }
      
      setResult({
        photoUrl: getPhotoUrl(urlToken, processResponse.photo_id),
        qrCodeUrl: processResponse.qr_url || getQrUrl(urlToken, processResponse.photo_id),
        expiresAt: null,
      })
      setStep('result')
      analytics.resultViewed(style)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to process photo'
      setError(errorMsg)
      analytics.processingError(style, errorMsg)
      setStep('style')
    }
  }

  const handleNewPhoto = async () => {
    analytics.newPhotoClicked(sessionsRemaining)
    setResult(null)
    setCapturedPhotoId(null)
    setCapturedImageUrl(null)
    setSelectedStyle(null)
    setError(null)
    
    if (sessionsRemaining > 0) {
      setIsLoading(true)
      await startCamera()
      setIsLoading(false)
      setStep('camera')
    } else {
      setStep('expired')
      analytics.sessionExpired()
    }
  }

  const handleChangeStyle = () => {
    analytics.changeStyleClicked()
    setResult(null)
    setStep('style')
  }

  const handleBack = () => {
    if (step === 'camera') {
      stopCamera()
      setStep('welcome')
    } else if (step === 'preview') {
      handleRetake()
    } else if (step === 'style') {
      setStep('preview')
    }
  }

  const handleRequestNew = () => {
    navigate('/')
  }

  const handleVideoReady = useCallback(() => {
    if (videoRef.current && videoRef.current.videoWidth > 0) {
      setVideoReady(true)
    }
  }, [])

  // Attach stream to video element when both are available
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
      videoRef.current.play().catch(() => {})
    }
  }, [stream])

  if (step === 'loading') {
    return (
      <div 
        className="w-full h-full min-h-screen flex items-center justify-center"
        style={{ background: 'rgb(var(--aipb-bg))' }}
      >
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (step === 'expired') {
    return <DemoExpired onRequestNew={handleRequestNew} />
  }

  return (
    <div 
      className="w-full h-full min-h-screen relative"
      style={{ background: 'rgb(var(--aipb-bg))' }}
    >
      <SessionBar />
      
      {/* 
        IMPORTANT: Video element is rendered OUTSIDE AnimatePresence
        This prevents it from being unmounted/remounted during animations
        which would cause loss of video dimensions (the original bug)
      */}
      {step === 'camera' && stream && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          onLoadedMetadata={handleVideoReady}
          className="absolute inset-0 w-full h-full object-cover z-0"
          style={{ transform: 'scaleX(-1)', background: '#000' }}
        />
      )}

      <AnimatePresence mode="wait">
        {step === 'welcome' && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pt-16"
          >
            <DemoWelcome 
              onStart={handleStart}
              isLoading={isLoading}
              error={error}
            />
          </motion.div>
        )}

        {step === 'camera' && (
          <motion.div
            key="camera"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10"
          >
            {/* Countdown Overlay */}
            <AnimatePresence>
              {countdown !== null && countdown > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center bg-black/70 z-40"
                >
                  <motion.div
                    key={countdown}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 1.5, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-white font-bold"
                    style={{ fontSize: 'clamp(8rem, 25vh, 20rem)' }}
                  >
                    {countdown}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Controls - Bottom */}
            <div className="absolute bottom-0 left-0 right-0 z-30" style={{ paddingTop: 'clamp(2rem, 3vh, 5rem)' }}>
              <div 
                className="flex justify-center items-center relative"
                style={{ 
                  gap: 'clamp(1.5rem, 2.5vh, 4rem)', 
                  paddingLeft: 'clamp(2rem, 3vh, 5rem)', 
                  paddingRight: 'clamp(2rem, 3vh, 5rem)', 
                  paddingBottom: 'clamp(2rem, 3vh, 5rem)' 
                }}
              >
                {/* Back button - left aligned */}
                <button
                  onClick={handleBack}
                  disabled={countdown !== null}
                  className="absolute rounded-full flex items-center justify-center transition-all disabled:opacity-50 no-select"
                  style={{ 
                    background: 'rgb(17, 17, 17)',
                    left: 'clamp(2rem, 3vh, 5rem)',
                    width: 'clamp(4rem, 8vh, 12rem)',
                    height: 'clamp(4rem, 8vh, 12rem)',
                    boxShadow: '0 0 0 clamp(5px, 0.7vh, 12px) rgba(255,255,255,0.4)'
                  }}
                  aria-label="Back"
                >
                  <img
                    src={backIcon}
                    alt="Back"
                    draggable="false"
                    style={{
                      width: 'clamp(2rem, 4vh, 6rem)',
                      height: 'clamp(2rem, 4vh, 6rem)',
                      filter: 'brightness(0) invert(1)',
                      userSelect: 'none',
                      WebkitUserSelect: 'none',
                      pointerEvents: 'none',
                    }}
                  />
                </button>

                {/* Take Photo button - centered */}
                <button
                  onClick={handleCaptureClick}
                  disabled={countdown !== null || !videoReady}
                  className="rounded-full flex items-center justify-center shadow-mobile-lg transition-all disabled:opacity-50 no-select"
                  style={{ 
                    background: 'var(--aipb-accent-bg)',
                    width: 'clamp(5rem, 10vh, 15rem)',
                    height: 'clamp(5rem, 10vh, 15rem)',
                    boxShadow: '0 0 0 clamp(5px, 0.7vh, 12px) rgba(255,255,255,0.4)'
                  }}
                  aria-label="Take Photo"
                >
                  <img
                    src={takePhotoIcon}
                    alt="Take Photo"
                    draggable="false"
                    style={{
                      width: 'clamp(2.5rem, 5vh, 7.5rem)',
                      height: 'clamp(2.5rem, 5vh, 7.5rem)',
                      filter: 'brightness(0) invert(1)',
                      userSelect: 'none',
                      WebkitUserSelect: 'none',
                      pointerEvents: 'none',
                    }}
                  />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'preview' && (
          <motion.div
            key="preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full min-h-screen relative"
            style={{ background: 'rgb(0, 0, 0)' }}
          >
            {/* Photo preview - fills screen */}
            <div className="absolute inset-0 z-0 flex items-center justify-center" style={{ background: 'rgb(17, 17, 17)' }}>
              {capturedImageUrl ? (
                <img 
                  src={capturedImageUrl} 
                  alt="Captured photo"
                  className="w-full h-full object-cover"
                  style={{ transform: 'scaleX(-1)' }}
                />
              ) : (
                <div className="text-white text-xl">Loading preview...</div>
              )}
            </div>

            {/* Controls - Bottom */}
            <div className="absolute bottom-0 left-0 right-0 z-30" style={{ paddingTop: 'clamp(2rem, 3vh, 5rem)' }}>
              <div 
                className="flex justify-center items-center relative"
                style={{ 
                  gap: 'clamp(1.5rem, 2.5vh, 4rem)', 
                  paddingLeft: 'clamp(2rem, 3vh, 5rem)', 
                  paddingRight: 'clamp(2rem, 3vh, 5rem)', 
                  paddingBottom: 'clamp(2rem, 3vh, 5rem)' 
                }}
              >
                {/* Retake button - left aligned */}
                <button
                  onClick={handleRetake}
                  className="absolute rounded-full flex items-center justify-center transition-all no-select"
                  style={{ 
                    background: 'rgb(17, 17, 17)',
                    left: 'clamp(2rem, 3vh, 5rem)',
                    width: 'clamp(4rem, 8vh, 12rem)',
                    height: 'clamp(4rem, 8vh, 12rem)',
                    boxShadow: '0 0 0 clamp(5px, 0.7vh, 12px) rgba(255,255,255,0.4)'
                  }}
                  aria-label="Retake"
                >
                  <img
                    src={retakeIcon}
                    alt="Retake"
                    draggable="false"
                    style={{
                      width: 'clamp(2rem, 4vh, 6rem)',
                      height: 'clamp(2rem, 4vh, 6rem)',
                      filter: 'brightness(0) invert(1)',
                      userSelect: 'none',
                      WebkitUserSelect: 'none',
                      pointerEvents: 'none',
                    }}
                  />
                </button>

                {/* Accept button - centered */}
                <button
                  onClick={handleAcceptPhoto}
                  className="rounded-full flex items-center justify-center shadow-mobile-lg transition-all no-select"
                  style={{ 
                    background: 'var(--aipb-accent-bg)',
                    width: 'clamp(5rem, 10vh, 15rem)',
                    height: 'clamp(5rem, 10vh, 15rem)',
                    boxShadow: '0 0 0 clamp(5px, 0.7vh, 12px) rgba(255,255,255,0.4)'
                  }}
                  aria-label="Accept Photo"
                >
                  <svg 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="white" 
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ 
                      width: 'clamp(2.5rem, 5vh, 7.5rem)', 
                      height: 'clamp(2.5rem, 5vh, 7.5rem)',
                    }}
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'style' && (
          <motion.div
            key="style"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pt-16"
          >
            <StyleSelector 
              onSelect={handleStyleSelect}
              onBack={handleBack}
            />
          </motion.div>
        )}

        {step === 'processing' && (
          <ProcessingView
            key={processingRunId}
            title="AI transforming your photo..."
            subtitle={`Applying ${selectedStyle} style`}
          />
        )}

        {step === 'result' && result && (
          <motion.div
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ResultView 
              photoUrl={result.photoUrl}
              qrCodeUrl={result.qrCodeUrl}
              expiresAt={result.expiresAt}
              onNewPhoto={handleNewPhoto}
              onChangeStyle={handleChangeStyle}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
