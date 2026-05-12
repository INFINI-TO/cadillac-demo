import axios, { AxiosInstance } from 'axios'

// API base URL - in dev uses proxy, in production uses env variable
const API_BASE_URL = import.meta.env.VITE_API_URL || ''

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 2 minutes for AI processing
  headers: {
    'Content-Type': 'application/json',
  },
})

// Types
export interface DemoRequestBody {
  name: string
  email: string
  phone?: string
  company: string
  industry: string
  marketing_consent?: boolean
  recaptcha_token?: string
}

export interface DemoRequestResponse {
  success: boolean
  message: string
}

export interface DemoValidateResponse {
  valid: boolean
  email?: string
  name?: string
  sessions_remaining?: number
  styles?: string[]
  expires_at?: string
  time_remaining_seconds?: number
}

export interface DemoSessionStartResponse {
  session_number: number
  sessions_remaining: number
}

export interface DemoCaptureResponse {
  photo_id: string
  url: string
}

export interface DemoProcessResponse {
  photo_id: string
  url: string
  qr_url?: string
  download_url?: string
  sessions_remaining?: number
}

export interface DemoStatusResponse {
  sessions_used: number
  sessions_remaining: number
  time_remaining_seconds: number
}

// API functions
export async function requestDemo(data: DemoRequestBody): Promise<DemoRequestResponse> {
  const response = await api.post<DemoRequestResponse>('/api/demo/request', data)
  return response.data
}

export async function validateToken(token: string): Promise<DemoValidateResponse> {
  const response = await api.get<DemoValidateResponse>(`/api/demo/validate/${token}`)
  return response.data
}

export async function startSession(token: string): Promise<DemoSessionStartResponse> {
  const response = await api.post<DemoSessionStartResponse>(`/api/demo/session/${token}/start`)
  return response.data
}

export async function capturePhoto(token: string, imageBlob: Blob): Promise<DemoCaptureResponse> {
  const formData = new FormData()
  formData.append('file', imageBlob, 'capture.jpg')
  
  const response = await api.post<DemoCaptureResponse>(
    `/api/demo/session/${token}/capture`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  )
  return response.data
}

export async function processPhoto(
  token: string,
  photoId: string,
  style: string,
  model?: string
): Promise<DemoProcessResponse> {
  const formData = new FormData()
  formData.append('photo_id', photoId)
  formData.append('style', style)
  if (model) {
    formData.append('model', model)
  }
  
  const response = await api.post<DemoProcessResponse>(
    `/api/demo/session/${token}/process`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  )
  return response.data
}

export async function getSessionStatus(token: string): Promise<DemoStatusResponse> {
  const response = await api.get<DemoStatusResponse>(`/api/demo/session/${token}/status`)
  return response.data
}

export function getPhotoUrl(token: string, photoId: string): string {
  // Use relative URL when API_BASE_URL is empty (nginx proxy handles it)
  const base = API_BASE_URL || ''
  return `${base}/api/demo/session/${token}/photo/${photoId}`
}

export function getQrUrl(token: string, photoId: string): string {
  // Use relative URL when API_BASE_URL is empty (nginx proxy handles it)
  const base = API_BASE_URL || ''
  return `${base}/api/demo/session/${token}/qr/${photoId}`
}

export default api
