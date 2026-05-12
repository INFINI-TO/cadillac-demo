import { create } from 'zustand'

export type DemoStep = 
  | 'welcome'
  | 'camera'
  | 'preview'
  | 'style'
  | 'processing'
  | 'result'
  | 'expired'

interface DemoState {
  // Session info
  token: string | null
  email: string | null
  name: string | null
  sessionsRemaining: number
  sessionsUsed: number
  styles: string[]
  expiresAt: Date | null
  timeRemainingSeconds: number
  
  // Current session state
  currentStep: DemoStep
  capturedPhotoId: string | null
  capturedPhotoBlob: Blob | null
  selectedStyle: string | null
  processedPhotoId: string | null
  processedPhotoUrl: string | null
  qrUrl: string | null
  downloadUrl: string | null
  
  // UI state
  isLoading: boolean
  error: string | null
  
  // Actions
  setSessionInfo: (info: {
    token: string
    email?: string
    name?: string
    sessionsRemaining: number
    styles: string[]
    expiresAt?: Date
    timeRemainingSeconds?: number
  }) => void
  setStep: (step: DemoStep) => void
  setCapturedPhoto: (photoId: string, blob: Blob) => void
  setSelectedStyle: (style: string) => void
  setProcessedPhoto: (photoId: string, url: string, qrUrl?: string, downloadUrl?: string) => void
  setSessionsUsed: (sessionsUsed: number, sessionsRemaining: number) => void
  updateSessionsRemaining: (sessionsRemaining: number) => void
  setTimeRemaining: (seconds: number) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
  resetForNewPhoto: () => void
}

const initialState = {
  token: null,
  email: null,
  name: null,
  sessionsRemaining: 0,
  sessionsUsed: 0,
  styles: [],
  expiresAt: null,
  timeRemainingSeconds: 0,
  currentStep: 'welcome' as DemoStep,
  capturedPhotoId: null,
  capturedPhotoBlob: null,
  selectedStyle: null,
  processedPhotoId: null,
  processedPhotoUrl: null,
  qrUrl: null,
  downloadUrl: null,
  isLoading: false,
  error: null,
}

export const useDemoStore = create<DemoState>((set) => ({
  ...initialState,
  
  setSessionInfo: (info) => set({
    token: info.token,
    email: info.email || null,
    name: info.name || null,
    sessionsRemaining: info.sessionsRemaining,
    styles: info.styles,
    expiresAt: info.expiresAt || null,
    timeRemainingSeconds: info.timeRemainingSeconds || 0,
  }),
  
  setStep: (step) => set({ currentStep: step }),
  
  setCapturedPhoto: (photoId, blob) => set({
    capturedPhotoId: photoId,
    capturedPhotoBlob: blob,
  }),
  
  setSelectedStyle: (style) => set({ selectedStyle: style }),
  
  setProcessedPhoto: (photoId, url, qrUrl, downloadUrl) => set({
    processedPhotoId: photoId,
    processedPhotoUrl: url,
    qrUrl: qrUrl || null,
    downloadUrl: downloadUrl || null,
  }),
  
  setSessionsUsed: (sessionsUsed, sessionsRemaining) => set({
    sessionsUsed,
    sessionsRemaining,
  }),
  
  updateSessionsRemaining: (sessionsRemaining) => set({
    sessionsRemaining,
  }),
  
  setTimeRemaining: (seconds) => set({
    timeRemainingSeconds: seconds,
  }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setError: (error) => set({ error }),
  
  reset: () => set(initialState),
  
  resetForNewPhoto: () => set({
    capturedPhotoId: null,
    capturedPhotoBlob: null,
    selectedStyle: null,
    processedPhotoId: null,
    processedPhotoUrl: null,
    qrUrl: null,
    downloadUrl: null,
    currentStep: 'camera',
    error: null,
  }),
}))
