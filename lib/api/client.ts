import axios from 'axios'
import { useAuthStore } from '@/lib/store/authStore'

function buildBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim() ?? ''
  if (!raw) return '/api/v1'
  const cleaned = raw.replace(/\/$/, '')
  if (cleaned.endsWith('/api/v1')) return cleaned
  return cleaned + '/api/v1'
}

const apiClient = axios.create({
  baseURL: buildBaseUrl(),
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Attach token from Zustand store (single source of truth)
apiClient.interceptors.request.use((config) => {
  if (typeof window === 'undefined') return config
  // Ambil token LANGSUNG dari zustand store (bukan localStorage) agar sync dengan state
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 globally (jangan pakai window.location.href = /login karena FORCE page refresh yang menyebabkan LOOP)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined') {
      // Skip jika ini request login/register/public sendiri (biarkan page handle error)
      const skipPaths = ['/auth/login', '/auth/register', '/auth/me']
      const url = String(error.config?.url ?? '')
      const isAuthRequest = skipPaths.some(p => url.includes(p))

      if (error.response?.status === 401 && !isAuthRequest) {
        // Clear auth VIA ZUSTAND store (ini juga otomatis clear cookie via clearAuth)
        useAuthStore.getState().clearAuth()

        // Dispatch event agar bisa ditangkap di App / Providers dan lakukan soft redirect
        window.dispatchEvent(new CustomEvent('intervia:unauthorized'))
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient
