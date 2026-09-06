import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { authApi, type LoginPayload, type RegisterPayload } from '@/lib/api/auth'
import { useAuthStore } from '@/lib/store/authStore'

export function useLogin() {
  const { setAuth } = useAuthStore()
  const router = useRouter()

  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: ({ data }) => {
      setAuth(data.data.user, data.data.token)
      router.push('/dashboard')
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
      router.push('/dashboard')
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
