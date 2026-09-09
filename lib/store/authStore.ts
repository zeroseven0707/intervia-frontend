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

function ensureCookiesSynced(user: User | null, token: string | null) {
  if (typeof document === 'undefined') return
  const week = 60 * 60 * 24 * 7
  if (token) {
    document.cookie = `intervia_token=${token}; path=/; max-age=${week}; SameSite=Lax`
  }
  if (user?.role) {
    document.cookie = `intervia_role=${user.role}; path=/; max-age=${week}; SameSite=Lax`
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => {
        ensureCookiesSynced(user, token)
        set({ user, token, isAuthenticated: true })
      },

      clearAuth: () => {
        if (typeof document !== 'undefined') {
          document.cookie = 'intervia_token=; path=/; max-age=0'
          document.cookie = 'intervia_role=; path=/; max-age=0'
        }
        set({ user: null, token: null, isAuthenticated: false })
      },

      updateUser: (user) => {
        ensureCookiesSynced(user, useAuthStore.getState().token)
        set({ user })
      },
    }),
    {
      name: 'intervia-auth',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          ensureCookiesSynced(state.user, state.token)
        }
      },
    }
  )
)
