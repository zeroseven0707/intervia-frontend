'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authApi } from '@/lib/api/auth'
import { useAuthStore } from '@/lib/store/authStore'
import { useLogout } from '@/lib/hooks/useAuth'
import { cn } from '@/lib/utils/cn'

// ── Schemas ───────────────────────────────────────────────────────────────────

const profileSchema = z.object({
  name:             z.string().min(2, 'At least 2 characters'),
  experience_level: z.enum(['junior', 'mid', 'senior', 'lead']).optional(),
})

const passwordSchema = z
  .object({
    current_password:          z.string().min(1, 'Required'),
    new_password:              z.string().min(8, 'At least 8 characters'),
    new_password_confirmation: z.string(),
  })
  .refine(d => d.new_password === d.new_password_confirmation, {
    message: "Passwords don't match",
    path:    ['new_password_confirmation'],
  })

type ProfileForm  = z.infer<typeof profileSchema>
type PasswordForm = z.infer<typeof passwordSchema>

// ── Constants ─────────────────────────────────────────────────────────────────

const LEVELS = [
  { value: 'junior', label: 'Junior  (0–2 years)' },
  { value: 'mid',    label: 'Mid-level  (2–5 years)' },
  { value: 'senior', label: 'Senior  (5–8 years)' },
  { value: 'lead',   label: 'Lead / Principal  (8+ years)' },
]

// ── Subcomponents ─────────────────────────────────────────────────────────────

function AvatarCircle({ name }: { name: string }) {
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  return (
    <div className="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center text-white text-xl font-black tracking-tight select-none shrink-0">
      {initials}
    </div>
  )
}

function Section({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-50">
        <h2 className="text-sm font-bold text-gray-900">{title}</h2>
        {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
      </div>
      <div className="px-6 py-6">{children}</div>
    </div>
  )
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">{label}</label>
      {children}
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  )
}

const inputCls = (err?: boolean) => cn(
  'w-full rounded-xl border px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 bg-white',
  'focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all',
  err ? 'border-red-300' : 'border-gray-200'
)

function SaveButton({ loading, saved, label = 'Save changes' }: { loading: boolean; saved: boolean; label?: string }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <button
        type="submit"
        disabled={loading}
        className="bg-gray-900 text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-gray-700 disabled:opacity-50 transition-all hover:-translate-y-0.5"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Saving…
          </span>
        ) : label}
      </button>
      {saved && <span className="text-xs font-semibold text-green-600 flex items-center gap-1">✓ Saved</span>}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore()
  const logout       = useLogout()
  const queryClient  = useQueryClient()
  const [profileSaved, setProfileSaved] = useState(false)
  const [pwSaved,      setPwSaved]      = useState(false)

  // Fetch full profile + stats
  const { data: profileData } = useQuery({
    queryKey: ['profile'],
    queryFn:  () => authApi.getProfile().then(r => r.data.data),
    enabled:  !!user,
  })

  // Update profile mutation
  const updateProfile = useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: ({ data }) => {
      updateUser(data.data)
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      queryClient.invalidateQueries({ queryKey: ['me'] })
      setProfileSaved(true)
      setTimeout(() => setProfileSaved(false), 3000)
    },
  })

  // Update password mutation
  const updatePassword = useMutation({
    mutationFn: authApi.updatePassword,
    onSuccess: () => {
      setPwSaved(true)
      passwordForm.reset()
      setTimeout(() => setPwSaved(false), 3000)
    },
  })

  const profileForm = useForm<ProfileForm>({
    resolver:      zodResolver(profileSchema),
    defaultValues: {
      name:             user?.name ?? '',
      experience_level: (user?.experience_level as any) ?? undefined,
    },
  })

  const passwordForm = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) })

  if (!user) return null

  const stats   = profileData?.stats
  const current = profileData?.user ?? user

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-10">

      {/* Header card */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm px-6 py-6">
        <div className="flex items-center gap-5">
          <AvatarCircle name={current.name} />
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-black text-gray-900 tracking-tight truncate">{current.name}</h1>
            <p className="text-sm text-gray-400 truncate">{current.email}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 capitalize">{current.role}</span>
              {current.experience_level && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100 capitalize">
                  {current.experience_level}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats row */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-gray-50">
            {[
              { label: 'Sessions',    value: stats.total_sessions },
              { label: 'Completed',   value: stats.completed_sessions },
              { label: 'Avg Score',   value: stats.average_score ?? '—' },
              { label: 'Best Score',  value: stats.best_score ?? '—' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-black text-gray-900 tabular-nums">{s.value}</div>
                <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Profile form */}
      <Section title="Profile Information" desc="Update your name and experience level">
        <form onSubmit={profileForm.handleSubmit(d => updateProfile.mutate(d))} className="space-y-4">
          <Field label="Full name" error={profileForm.formState.errors.name?.message}>
            <input type="text" autoComplete="name" {...profileForm.register('name')} className={inputCls(!!profileForm.formState.errors.name)} />
          </Field>

          <Field label="Email">
            <input type="email" value={current.email} disabled className="w-full rounded-xl border border-gray-100 px-4 py-2.5 text-sm text-gray-400 bg-gray-50 cursor-not-allowed" />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
          </Field>

          <Field label="Experience level">
            <select
              {...profileForm.register('experience_level')}
              className="w-full rounded-xl border border-gray-200 bg-white text-gray-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all appearance-none cursor-pointer"
            >
              <option value="">Select level…</option>
              {LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
          </Field>

          {updateProfile.isError && (
            <p className="text-sm text-red-600">
              {(updateProfile.error as any)?.response?.data?.message ?? 'Failed to update profile.'}
            </p>
          )}

          <SaveButton loading={updateProfile.isPending} saved={profileSaved} />
        </form>
      </Section>

      {/* Password form */}
      <Section title="Change Password" desc="Use a strong password with letters and numbers">
        <form onSubmit={passwordForm.handleSubmit(d => updatePassword.mutate(d))} className="space-y-4">
          <Field label="Current password" error={passwordForm.formState.errors.current_password?.message}>
            <input type="password" autoComplete="current-password" {...passwordForm.register('current_password')} placeholder="••••••••" className={inputCls(!!passwordForm.formState.errors.current_password)} />
          </Field>

          <Field label="New password" error={passwordForm.formState.errors.new_password?.message}>
            <input type="password" autoComplete="new-password" {...passwordForm.register('new_password')} placeholder="Min. 8 characters" className={inputCls(!!passwordForm.formState.errors.new_password)} />
          </Field>

          <Field label="Confirm new password" error={passwordForm.formState.errors.new_password_confirmation?.message}>
            <input type="password" autoComplete="new-password" {...passwordForm.register('new_password_confirmation')} placeholder="••••••••" className={inputCls(!!passwordForm.formState.errors.new_password_confirmation)} />
          </Field>

          {updatePassword.isError && (
            <p className="text-sm text-red-600">
              {(updatePassword.error as any)?.response?.data?.errors?.current_password?.[0]
                ?? (updatePassword.error as any)?.response?.data?.message
                ?? 'Failed to update password.'}
            </p>
          )}

          <SaveButton loading={updatePassword.isPending} saved={pwSaved} label="Update password" />
        </form>
      </Section>

      {/* Account section */}
      <Section title="Account">
        <div className="space-y-1">
          <div className="flex items-center justify-between py-3 border-b border-gray-50">
            <div>
              <p className="text-sm font-medium text-gray-900">Member since</p>
              <p className="text-xs text-gray-400">
                {new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium text-red-600">Sign out</p>
              <p className="text-xs text-gray-400">Sign out of this device</p>
            </div>
            <button
              onClick={() => logout.mutate()}
              disabled={logout.isPending}
              className="text-xs font-semibold text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
            >
              {logout.isPending ? 'Signing out…' : 'Sign out'}
            </button>
          </div>
        </div>
      </Section>

    </div>
  )
}
