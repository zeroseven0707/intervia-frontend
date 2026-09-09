import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import { authApi, type LoginPayload, type RegisterPayload } from '@/lib/api/auth'
import { useAuthStore } from '@/lib/store/authStore'

function defaultHomeForRole(role: string): string {
  return role === 'admin' ? '/admin' : '/dashboard'
}

export function useLogin() {
  const { setAuth } = useAuthStore()
  const router = useRouter()
  const searchParams = useSearchParams()

  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: ({ data }) => {
      setAuth(data.data.user, data.data.token)
      const redirect = searchParams.get('redirect')
      const fallback = defaultHomeForRole(data.data.user.role)
      router.push(redirect && redirect !== '/login' && redirect !== '/register' ? redirect : fallback)
    },
  })
}

export function useRegister() {
  const { setAuth } = useAuthStore()
  const router = useRouter()

  return useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
    onSuccess: ({ data }) => {
      setAuth(data.data.user, data.data.token)
      router.push(defaultHomeForRole(data.data.user.role))
    },
  })
}

export function useLogout() {
  const { clearAuth } = useAuthStore()
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      clearAuth()
      queryClient.clear()
      router.push('/login')
    },
  })
}

export function useMe() {
  const { isAuthenticated } = useAuthStore()

  return useQuery({
    queryKey: ['me'],
    queryFn: () => authApi.me().then((r) => r.data.data),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 min
  })
}

