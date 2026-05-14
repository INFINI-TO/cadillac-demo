import { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  capturePhoto as apiCapturePhoto,
  fetchPrompts,
  formatApiError,
  previewCaptureUrl,
  processPhoto as apiProcessPhoto,
  sessionStatus,
  type PromptOption,
} from '../services/cadillacApi'
import { CadillacSessionBar } from './CadillacSessionBar'
import { CadillacWelcome } from './CadillacWelcome'
import { StyleSelector } from './StyleSelector'
import { ProcessingView } from './ProcessingView'
import { ResultView } from './ResultView'
import { AnimatePresence, motion } from 'framer-motion'
import backIcon from '../assets/ic-back.svg'
import retakeIcon from '../assets/ic-retake.svg'
import takePhotoIcon from '../assets/ic-takephoto.svg'

type Step = 'loading' | 'welcome' | 'camera' | 'preview' | 'style' | 'processing' | 'result'

interface ProcessResult {
  photoUrl: string
  qrCodeUrl: string | null
  expiresAt: string | null
}

export function AppSession() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('loading')
  const [prompts, setPrompts] = useState<PromptOption[]>([])
  const [capturedPhotoId, setCapturedPhotoId] = useState<string | null>(null)
  const [capturedImageUrl, setCapturedImageUrl] = useState<string | null>(null)
  const [result, setResult] = useState<ProcessResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null)
  /** Wymusza remount ProcessingView przy każdym wejściu w processing (świeży los Lottie). */
  const [processingRunId, setProcessingRunId] = useState(0)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [videoReady, setVideoReady] = useState(false)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    const run = async () => {
      try {
        const s = await sessionStatus()
        if (!s.authenticated) {
          navigate('/')
          return
        }
        const p = await fetchPrompts()
        setPrompts(p)
        setStep('welcome')
      } catch (err) {
        console.error('AppSession init:', formatApiError(err))
        navigate('/')
      }
    }
    run()
  }, [navigate])

  const startCamera = useCallback(async () => {
    setVideoReady(false)
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
      })
      streamRef.current = newStream
      setStream(newStream)
      if (videoRef.current) {
        videoRef.current.srcObject = newStream
        videoRef.current.play().catch(() => {})
      }
    } catch {
      setError('Camera access denied. Please allow camera use in your browser.')
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    setStream(null)
    setVideoReady(false)
  }, [])

  const handleStart = async () => {
    setError(null)
    setIsLoading(true)
    try {
      await startCamera()
      setStep('camera')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCaptureClick = () => {
    if (countdown !== null) return
    if (!videoReady) return
    setCountdown(3)
  }

  useEffect(() => {
    if (countdown === null) return
    if (countdown === 0) {
      void doCapture()
      setCountdown(null)
      return
    }
    const t = setTimeout(() => setCountdown(countdown - 1), 1000)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdown])

  const doCapture = async () => {
    const video = videoRef.current
    if (!video) {
      setError('Camera is not ready.')
      return
    }
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      setError('Camera is not ready.')
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
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('blob'))), 'image/jpeg', 0.95)
      })
      stopCamera()
      const cap = await apiCapturePhoto(blob)
      setCapturedPhotoId(cap.photo_id)
      setCapturedImageUrl(previewCaptureUrl(cap.photo_id))
      setStep('preview')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the photo')
      setCapturedImageUrl(null)
      await startCamera()
    }
  }

  const handleRetake = async () => {
    setCapturedPhotoId(null)
    setCapturedImageUrl(null)
    await startCamera()
    setStep('camera')
  }

  const handleAcceptPhoto = () => {
    setStep('style')
  }

  const handlePromptSelect = async (promptId: string) => {
    if (!capturedPhotoId) return
    const label = prompts.find((p) => p.id === promptId)?.label ?? promptId
    setSelectedLabel(label)
    setProcessingRunId((n) => n + 1)
    setStep('processing')
    setError(null)
    try {
      const processResponse = await apiProcessPhoto(capturedPhotoId, promptId)
      setResult({
        photoUrl: processResponse.url,
        qrCodeUrl: processResponse.qr_url ?? null,
        expiresAt: null,
      })
      setStep('result')
    } catch (err) {
      setError(formatApiError(err))
      setStep('style')
    }
  }

  const handleNewPhoto = async () => {
    setResult(null)
    setCapturedPhotoId(null)
    setCapturedImageUrl(null)
    setSelectedLabel(null)
    setError(null)
    await startCamera()
    setStep('camera')
  }

  const handleChangeStyle = () => {
    setResult(null)
    setStep('style')
  }

  const handleBack = () => {
    if (step === 'camera') {
      stopCamera()
      setStep('welcome')
    } else if (step === 'preview') {
      void handleRetake()
    } else if (step === 'style') {
      setStep('preview')
    }
  }

  const handleVideoReady = useCallback(() => {
    if (videoRef.current && videoRef.current.videoWidth > 0) {
      setVideoReady(true)
    }
  }, [])

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
      videoRef.current.play().catch(() => {})
    }
  }, [stream])

  if (step === 'loading') {
    return (
      <div className="w-full h-full min-h-screen flex items-center justify-center" style={{ background: 'rgb(var(--aipb-bg))' }}>
        <div className="text-white text-xl">Loading…</div>
      </div>
    )
  }

  return (
    <div className="w-full h-full min-h-screen relative" style={{ background: 'rgb(var(--aipb-bg))' }}>
      <CadillacSessionBar />

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
          <motion.div key="welcome" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-16">
            <CadillacWelcome onStart={handleStart} isLoading={isLoading} error={error} />
          </motion.div>
        )}

        {step === 'camera' && (
          <motion.div key="camera" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-10">
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

            <div className="absolute bottom-0 left-0 right-0 z-30" style={{ paddingTop: 'clamp(2rem, 3vh, 5rem)' }}>
              <div
                className="flex justify-center items-center relative"
                style={{
                  gap: 'clamp(1.5rem, 2.5vh, 4rem)',
                  paddingLeft: 'clamp(2rem, 3vh, 5rem)',
                  paddingRight: 'clamp(2rem, 3vh, 5rem)',
                  paddingBottom: 'clamp(2rem, 3vh, 5rem)',
                }}
              >
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={countdown !== null}
                  className="absolute rounded-full flex items-center justify-center transition-all disabled:opacity-50 no-select"
                  style={{
                    background: 'rgb(17, 17, 17)',
                    left: 'clamp(2rem, 3vh, 5rem)',
                    width: 'clamp(4rem, 8vh, 12rem)',
                    height: 'clamp(4rem, 8vh, 12rem)',
                    boxShadow: '0 0 0 clamp(5px, 0.7vh, 12px) rgba(255,255,255,0.4)',
                  }}
                  aria-label="Back"
                >
                  <img
                    src={backIcon}
                    alt=""
                    draggable="false"
                    style={{
                      width: 'clamp(2rem, 4vh, 6rem)',
                      height: 'clamp(2rem, 4vh, 6rem)',
                      filter: 'brightness(0) invert(1)',
                      userSelect: 'none',
                      pointerEvents: 'none',
                    }}
                  />
                </button>
                <button
                  type="button"
                  onClick={handleCaptureClick}
                  disabled={countdown !== null || !videoReady}
                  className="rounded-full flex items-center justify-center shadow-mobile-lg transition-all disabled:opacity-50 no-select"
                  style={{
                    background: 'var(--aipb-accent-bg)',
                    width: 'clamp(5rem, 10vh, 15rem)',
                    height: 'clamp(5rem, 10vh, 15rem)',
                    boxShadow: '0 0 0 clamp(5px, 0.7vh, 12px) rgba(255,255,255,0.4)',
                  }}
                  aria-label="Take photo"
                >
                  <img
                    src={takePhotoIcon}
                    alt=""
                    draggable="false"
                    style={{
                      width: 'clamp(2.5rem, 5vh, 7.5rem)',
                      height: 'clamp(2.5rem, 5vh, 7.5rem)',
                      filter: 'brightness(0) invert(1)',
                      userSelect: 'none',
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
            <div className="absolute inset-0 z-0 flex items-center justify-center" style={{ background: 'rgb(17, 17, 17)' }}>
              {capturedImageUrl ? (
                <img src={capturedImageUrl} alt="" className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />
              ) : (
                <div className="text-white text-xl">Preview…</div>
              )}
            </div>
            <div className="absolute bottom-0 left-0 right-0 z-30" style={{ paddingTop: 'clamp(2rem, 3vh, 5rem)' }}>
              <div
                className="flex justify-center items-center relative"
                style={{
                  gap: 'clamp(1.5rem, 2.5vh, 4rem)',
                  paddingLeft: 'clamp(2rem, 3vh, 5rem)',
                  paddingRight: 'clamp(2rem, 3vh, 5rem)',
                  paddingBottom: 'clamp(2rem, 3vh, 5rem)',
                }}
              >
                <button
                  type="button"
                  onClick={() => void handleRetake()}
                  className="absolute rounded-full flex items-center justify-center transition-all no-select"
                  style={{
                    background: 'rgb(17, 17, 17)',
                    left: 'clamp(2rem, 3vh, 5rem)',
                    width: 'clamp(4rem, 8vh, 12rem)',
                    height: 'clamp(4rem, 8vh, 12rem)',
                    boxShadow: '0 0 0 clamp(5px, 0.7vh, 12px) rgba(255,255,255,0.4)',
                  }}
                  aria-label="Retake"
                >
                  <img
                    src={retakeIcon}
                    alt=""
                    draggable="false"
                    style={{
                      width: 'clamp(2rem, 4vh, 6rem)',
                      height: 'clamp(2rem, 4vh, 6rem)',
                      filter: 'brightness(0) invert(1)',
                      userSelect: 'none',
                      pointerEvents: 'none',
                    }}
                  />
                </button>
                <button
                  type="button"
                  onClick={handleAcceptPhoto}
                  className="rounded-full flex items-center justify-center shadow-mobile-lg transition-all no-select"
                  style={{
                    background: 'var(--aipb-accent-bg)',
                    width: 'clamp(5rem, 10vh, 15rem)',
                    height: 'clamp(5rem, 10vh, 15rem)',
                    boxShadow: '0 0 0 clamp(5px, 0.7vh, 12px) rgba(255,255,255,0.4)',
                  }}
                  aria-label="Accept"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ width: 'clamp(2.5rem, 5vh, 7.5rem)', height: 'clamp(2.5rem, 5vh, 7.5rem)' }}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'style' && (
          <motion.div key="style" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-16">
            <StyleSelector prompts={prompts} onSelect={handlePromptSelect} onBack={handleBack} />
          </motion.div>
        )}

        {step === 'processing' && (
          <ProcessingView
            key={processingRunId}
            title="AI is processing your photo…"
            subtitle={selectedLabel ? `Prompt: ${selectedLabel}` : 'Please wait'}
          />
        )}

        {step === 'result' && result && (
          <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
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
