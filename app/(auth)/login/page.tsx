'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { useLogin } from '@/lib/hooks/useAuth'
import { cn } from '@/lib/utils/cn'

const schema = z.object({
  email:    z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})
type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const login = useLogin()
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) })
  const onSubmit = (data: FormData) => login.mutate(data)

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-1">Welcome back</h1>
        <p className="text-sm text-gray-500">Sign in to continue your interview prep</p>
      </div>

      {/* Error */}
      {login.isError && (
        <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          <span className="text-red-500 mt-0.5 text-sm">✕</span>
          <p className="text-sm text-red-700">
            {(login.error as any)?.response?.data?.message ?? 'Login failed. Try again.'}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {/* Email */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Email</label>
          <input
            type="email"
            autoComplete="email"
            {...register('email')}
            placeholder="you@example.com"
            className={cn(
              'w-full rounded-xl border px-4 py-3 text-sm text-gray-900 placeholder-gray-400 bg-gray-50',
              'focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent focus:bg-white transition-all',
              errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200'
            )}
          />
          {errors.email && <p className="mt-1.5 text-xs text-red-600">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Password</label>
          <input
            type="password"
            autoComplete="current-password"
            {...register('password')}
            placeholder="••••••••"
            className={cn(
              'w-full rounded-xl border px-4 py-3 text-sm text-gray-900 placeholder-gray-400 bg-gray-50',
              'focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent focus:bg-white transition-all',
              errors.password ? 'border-red-300 bg-red-50' : 'border-gray-200'
            )}
          />
          {errors.password && <p className="mt-1.5 text-xs text-red-600">{errors.password.message}</p>}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={login.isPending}
          className={cn(
            'w-full rounded-xl bg-gray-900 text-white font-semibold py-3.5 text-sm mt-2',
            'hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2',
            'disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:-translate-y-0.5',
            login.isPending ? 'opacity-50' : ''
          )}
        >
          {login.isPending ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Signing in…
            </span>
          ) : 'Sign in →'}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-gray-100" />
        <span className="text-xs text-gray-400">or</span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>

      {/* Footer */}
      <p className="text-center text-sm text-gray-500">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
          Create one
        </Link>
      </p>

      <p className="text-center text-xs text-gray-400 mt-4">
        <Link href="/" className="hover:text-gray-600 transition-colors">← Back to home</Link>
      </p>
    </div>
  )
}
