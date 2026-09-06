'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import apiClient from '@/lib/api/client'
import { useAnalyzeJob, useCreateSession } from '@/lib/hooks/useInterview'
import { cn } from '@/lib/utils/cn'
import type { Position, JobAnalysis } from '@/types'

// ── Schemas ──────────────────────────────────────────────────────────────────

const baseSchema = z.object({
  mode:             z.enum(['practice', 'simulation', 'challenging']),
  question_count:   z.coerce.number().min(3).max(15),
  experience_level: z.enum(['junior', 'mid', 'senior', 'lead']).optional(),
})

const positionSchema = baseSchema.extend({
  path:        z.literal('position'),
  position_id: z.coerce.number().min(1, 'Select a position'),
})

const jdSchema = baseSchema.extend({
  path:            z.literal('jd'),
  job_description: z.string().min(50, 'Paste at least 50 characters of the job description'),
})

type PositionForm = z.infer<typeof positionSchema>
type JdForm       = z.infer<typeof jdSchema>

// ── Subcomponents ────────────────────────────────────────────────────────────

function AnalysisPreview({ analysis }: { analysis: JobAnalysis }) {
  return (
    <div className="rounded-xl bg-indigo-50 border border-indigo-200 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-indigo-900">{analysis.position}</span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 capitalize">
          {analysis.seniority}
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {analysis.skills.slice(0, 8).map((s) => (
          <span
            key={s.name}
            className={cn(
              'text-xs px-2 py-0.5 rounded-full font-medium',
              s.importance === 'required'
                ? 'bg-indigo-600 text-white'
                : 'bg-indigo-100 text-indigo-700'
            )}
          >
            {s.name}
          </span>
        ))}
        {analysis.skills.length > 8 && (
          <span className="text-xs text-indigo-500">+{analysis.skills.length - 8} more</span>
        )}
      </div>
    </div>
  )
}

// ── Path A — Position Library ────────────────────────────────────────────────

function PositionPath() {
  const createSession = useCreateSession()
  const { data: positions, isLoading } = useQuery<Position[]>({
    queryKey: ['positions'],
    queryFn: () => apiClient.get('/positions').then((r) => r.data.data),
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PositionForm, unknown, PositionForm>({
    resolver: zodResolver(positionSchema) as any,
    defaultValues: { path: 'position', mode: 'simulation', question_count: 8 },
  })

  const onSubmit = (data: PositionForm) =>
    createSession.mutate({
      position_id:      data.position_id,
      mode:             data.mode,
      question_count:   data.question_count,
      experience_level: data.experience_level,
    })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <input type="hidden" {...register('path')} />

      {/* Position select */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
        <select
          {...register('position_id')}
          disabled={isLoading}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Select a position…</option>
          {positions?.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        {errors.position_id && <p className="mt-1 text-xs text-red-600">{errors.position_id.message}</p>}
      </div>

      <ConfigFields register={register} errors={errors} />

      <button
        type="submit"
        disabled={createSession.isPending}
        className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60 transition-colors"
      >
        {createSession.isPending ? 'Starting…' : 'Start Interview'}
      </button>

      {createSession.isError && (
        <p className="text-sm text-red-600 text-center">
          {(createSession.error as any)?.response?.data?.message ?? 'Something went wrong.'}
        </p>
      )}
    </form>
  )
}

// ── Path B — Job Description ─────────────────────────────────────────────────

function JdPath() {
  const analyzeJob    = useAnalyzeJob()
  const createSession = useCreateSession()
  const [analysis, setAnalysis] = useState<JobAnalysis | null>(null)

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<JdForm, unknown, JdForm>({
    resolver: zodResolver(jdSchema) as any,
    defaultValues: { path: 'jd', mode: 'simulation', question_count: 8 },
  })

  const handleAnalyze = async () => {
    const jd = getValues('job_description')
    if (!jd || jd.length < 50) return
    const result = await analyzeJob.mutateAsync({
      job_description:  jd,
      experience_level: getValues('experience_level'),
    })
    setAnalysis(result)
  }

  const onSubmit = (data: JdForm) =>
    createSession.mutate({
      job_description:  data.job_description,
      mode:             data.mode,
      question_count:   data.question_count,
      experience_level: data.experience_level,
    })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <input type="hidden" {...register('path')} />

      {/* JD textarea */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Job Description
        </label>
        <textarea
          {...register('job_description')}
          rows={6}
          placeholder="Paste the full job description here…"
          className={cn(
            'w-full rounded-lg border px-3 py-2 text-sm text-gray-900 placeholder-gray-400 resize-none',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500',
            errors.job_description ? 'border-red-400 bg-red-50' : 'border-gray-300'
          )}
        />
        {errors.job_description && (
          <p className="mt-1 text-xs text-red-600">{errors.job_description.message}</p>
        )}
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={analyzeJob.isPending}
          className="mt-2 text-xs font-medium text-indigo-600 hover:text-indigo-500 disabled:opacity-50"
        >
          {analyzeJob.isPending ? 'Analyzing…' : '✦ Analyze job description'}
        </button>
      </div>

      {/* Analysis preview */}
      {analysis && <AnalysisPreview analysis={analysis} />}

      <ConfigFields register={register} errors={errors} />

      <button
        type="submit"
        disabled={createSession.isPending}
        className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60 transition-colors"
      >
        {createSession.isPending ? 'Starting…' : 'Start Interview'}
      </button>

      {createSession.isError && (
        <p className="text-sm text-red-600 text-center">
          {(createSession.error as any)?.response?.data?.message ?? 'Something went wrong.'}
        </p>
      )}
    </form>
  )
}

// ── Shared config fields ──────────────────────────────────────────────────────

function ConfigFields({ register, errors }: { register: any; errors: any }) {
  return (
    <>
      <div className="grid grid-cols-3 gap-4">
        {/* Mode */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mode</label>
          <select
            {...register('mode')}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="practice">Practice</option>
            <option value="simulation">Simulation</option>
            <option value="challenging">Challenging</option>
          </select>
        </div>

        {/* Question count */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Questions</label>
          <select
            {...register('question_count')}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {[3, 5, 8, 10, 12, 15].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        {/* Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
          <select
            {...register('experience_level')}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Auto</option>
            <option value="junior">Junior</option>
            <option value="mid">Mid</option>
            <option value="senior">Senior</option>
            <option value="lead">Lead</option>
          </select>
        </div>
      </div>
    </>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function InterviewSetupPage() {
  const [tab, setTab] = useState<'position' | 'jd'>('jd')

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Start an Interview</h1>
        <p className="mt-1 text-sm text-gray-500">Choose how you want to prepare</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setTab('jd')}
            className={cn(
              'flex-1 rounded-md py-1.5 text-sm font-medium transition-colors',
              tab === 'jd'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            Paste Job Description
          </button>
          <button
            type="button"
            onClick={() => setTab('position')}
            className={cn(
              'flex-1 rounded-md py-1.5 text-sm font-medium transition-colors',
              tab === 'position'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            Pick a Position
          </button>
        </div>

        {tab === 'jd' ? <JdPath /> : <PositionPath />}
      </div>
    </div>
  )
}
