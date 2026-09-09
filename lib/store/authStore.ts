import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (user: User, token: string) => void
  clearAuth: () => void
  updateUser: (user: User) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => {
        localStorage.setItem('intervia_token', token)
        // Also set cookies so Next.js middleware can read them
        document.cookie = `intervia_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
        document.cookie = `intervia_role=${user.role}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
        set({ user, token, isAuthenticated: true })
      },

      clearAuth: () => {
        localStorage.removeItem('intervia_token')
        // Clear cookies
        document.cookie = 'intervia_token=; path=/; max-age=0'
        document.cookie = 'intervia_role=; path=/; max-age=0'
        set({ user: null, token: null, isAuthenticated: false })
      },

      updateUser: (user) => set({ user }),
    }),
    {
      name: 'intervia-auth',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
)
