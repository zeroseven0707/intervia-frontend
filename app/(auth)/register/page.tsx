'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { useRegister } from '@/lib/hooks/useAuth'
import { cn } from '@/lib/utils/cn'

const schema = z
  .object({
    name:                  z.string().min(2, 'Name must be at least 2 characters'),
    email:                 z.string().email('Enter a valid email'),
    password:              z.string().min(8, 'Password must be at least 8 characters'),
    password_confirmation: z.string(),
    experience_level:      z.enum(['junior', 'mid', 'senior', 'lead']).optional(),
  })
  .refine((d) => d.password === d.password_confirmation, {
    message: "Passwords don't match",
    path:    ['password_confirmation'],
  })

type FormData = z.infer<typeof schema>

const LEVELS = [
  { value: 'junior', label: 'Junior (0–2 years)' },
  { value: 'mid',    label: 'Mid-level (2–5 years)' },
  { value: 'senior', label: 'Senior (5–8 years)' },
  { value: 'lead',   label: 'Lead / Principal (8+ years)' },
]

export default function RegisterPage() {
  const register_ = useRegister()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = (data: FormData) => register_.mutate(data)

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-gray-900">Create your account</h1>
        <p className="mt-1 text-sm text-gray-500">Start preparing for your next interview</p>
      </div>

      {/* Global error */}
      {register_.isError && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {(register_.error as any)?.response?.data?.message ?? 'Registration failed. Please try again.'}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Full name
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            {...register('name')}
            className={cn(
              'w-full rounded-lg border px-3 py-2 text-sm text-gray-900 placeholder-gray-400',
              'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
              errors.name ? 'border-red-400 bg-red-50' : 'border-gray-300'
            )}
            placeholder="Sihab Pratama"
          />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            {...register('email')}
            className={cn(
              'w-full rounded-lg border px-3 py-2 text-sm text-gray-900 placeholder-gray-400',
              'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
              errors.email ? 'border-red-400 bg-red-50' : 'border-gray-300'
            )}
            placeholder="you@example.com"
          />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
        </div>

        {/* Experience Level */}
        <div>
          <label htmlFor="experience_level" className="block text-sm font-medium text-gray-700 mb-1">
            Experience level <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <select
            id="experience_level"
            {...register('experience_level')}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select level…</option>
            {LEVELS.map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            {...register('password')}
            className={cn(
              'w-full rounded-lg border px-3 py-2 text-sm text-gray-900 placeholder-gray-400',
              'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
              errors.password ? 'border-red-400 bg-red-50' : 'border-gray-300'
            )}
            placeholder="Min. 8 characters"
          />
          {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm password
          </label>
          <input
            id="password_confirmation"
            type="password"
            autoComplete="new-password"
            {...register('password_confirmation')}
            className={cn(
              'w-full rounded-lg border px-3 py-2 text-sm text-gray-900 placeholder-gray-400',
              'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
              errors.password_confirmation ? 'border-red-400 bg-red-50' : 'border-gray-300'
            )}
            placeholder="••••••••"
          />
          {errors.password_confirmation && (
            <p className="mt-1 text-xs text-red-600">{errors.password_confirmation.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={register_.isPending}
          className={cn(
            'w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white',
            'hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
            'disabled:opacity-60 disabled:cursor-not-allowed transition-colors'
          )}
        >
          {register_.isPending ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
          Sign in
        </Link>
      </p>
    </div>
  )
}
