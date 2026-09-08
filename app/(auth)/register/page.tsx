'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { useRegister } from '@/lib/hooks/useAuth'
import { cn } from '@/lib/utils/cn'

const schema = z
  .object({
    name:                  z.string().min(2, 'At least 2 characters'),
    email:                 z.string().email('Enter a valid email'),
    experience_level:      z.enum(['junior', 'mid', 'senior', 'lead']).optional(),
    password:              z.string().min(8, 'At least 8 characters'),
    password_confirmation: z.string(),
  })
  .refine(d => d.password === d.password_confirmation, {
    message: "Passwords don't match",
    path: ['password_confirmation'],
  })

type FormData = z.infer<typeof schema>

const LEVELS = [
  { value: 'junior', label: 'Junior  (0–2 yrs)' },
  { value: 'mid',    label: 'Mid-level  (2–5 yrs)' },
  { value: 'senior', label: 'Senior  (5–8 yrs)' },
  { value: 'lead',   label: 'Lead / Principal  (8+ yrs)' },
]

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">{label}</label>
      {children}
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  )
}

export default function RegisterPage() {
  const register_ = useRegister()
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) })
  const onSubmit = (data: FormData) => register_.mutate(data)

  const inputCls = (hasError?: boolean) => cn(
    'w-full rounded-xl border px-4 py-3 text-sm text-gray-900 placeholder-gray-400 bg-white',
    'focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all',
    hasError ? 'border-red-300 bg-red-50' : 'border-gray-200'
  )

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-1">Create account</h1>
        <p className="text-sm text-gray-500">Start preparing for your dream role</p>
      </div>

      {register_.isError && (
        <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          <span className="text-red-500 mt-0.5 text-sm">✕</span>
          <p className="text-sm text-red-700">
            {(register_.error as any)?.response?.data?.message ?? 'Registration failed.'}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <Field label="Full name" error={errors.name?.message}>
          <input type="text" autoComplete="name" {...register('name')} placeholder="Sihab Pratama" className={inputCls(!!errors.name)} />
        </Field>

        <Field label="Email" error={errors.email?.message}>
          <input type="email" autoComplete="email" {...register('email')} placeholder="you@example.com" className={inputCls(!!errors.email)} />
        </Field>

        <Field label="Experience level (optional)">
          <select {...register('experience_level')} className={inputCls()}>
            <option value="">Select level…</option>
            {LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
        </Field>

        <Field label="Password" error={errors.password?.message}>
          <input type="password" autoComplete="new-password" {...register('password')} placeholder="Min. 8 characters" className={inputCls(!!errors.password)} />
        </Field>

        <Field label="Confirm password" error={errors.password_confirmation?.message}>
          <input type="password" autoComplete="new-password" {...register('password_confirmation')} placeholder="••••••••" className={inputCls(!!errors.password_confirmation)} />
        </Field>

        <button
          type="submit"
          disabled={register_.isPending}
          className={cn(
            'w-full rounded-xl bg-gray-900 text-white font-semibold py-3.5 text-sm mt-2',
            'hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2',
            'disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:-translate-y-0.5'
          )}
        >
          {register_.isPending ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Creating account…
            </span>
          ) : 'Create account →'}
        </button>
      </form>

      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-gray-100" />
        <span className="text-xs text-gray-400">or</span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>

      <p className="text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">Sign in</Link>
      </p>
      <p className="text-center text-xs text-gray-400 mt-4">
        <Link href="/" className="hover:text-gray-600 transition-colors">← Back to home</Link>
      </p>
    </div>
  )
}
