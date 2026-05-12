import axios, { AxiosInstance } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? ''

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000,
  withCredentials: true,
})

export interface PromptOption {
  id: string
  label: string
}

export interface CaptureResponse {
  photo_id: string
  url: string
}

export interface ProcessResponse {
  photo_id: string
  url: string
  qr_url?: string
  download_url?: string
}

export async function login(username: string, password: string): Promise<void> {
  await api.post('/api/login', { username, password }, {
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function logout(): Promise<void> {
  await api.post('/api/logout', {}, {
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function sessionStatus(): Promise<{ authenticated: boolean }> {
  const r = await api.get<{ authenticated: boolean }>('/api/session')
  return r.data
}

export async function fetchPrompts(): Promise<PromptOption[]> {
  const r = await api.get<{ prompts: PromptOption[] }>('/api/prompts')
  return r.data.prompts
}

export async function capturePhoto(imageBlob: Blob): Promise<CaptureResponse> {
  const formData = new FormData()
  formData.append('file', imageBlob, 'capture.jpg')
  const r = await api.post<CaptureResponse>('/api/capture', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return r.data
}

export async function processPhoto(
  photoId: string,
  promptId: string,
  model?: string
): Promise<ProcessResponse> {
  const formData = new FormData()
  formData.append('photo_id', photoId)
  formData.append('prompt_id', promptId)
  if (model) formData.append('model', model)
  const r = await api.post<ProcessResponse>('/api/process', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return r.data
}

export function previewCaptureUrl(photoId: string): string {
  const base = API_BASE_URL || ''
  return `${base}/api/capture-preview/${photoId}`
}

export default api
