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

const baseSchema = z.object({
  mode:             z.enum(['practice', 'simulation', 'challenging']),
  question_count:   z.coerce.number().min(3).max(15),
  experience_level: z.enum(['junior', 'mid', 'senior', 'lead']).optional(),
})
const positionSchema = baseSchema.extend({ path: z.literal('position'), position_id: z.coerce.number().min(1, 'Select a position') })
const jdSchema       = baseSchema.extend({ path: z.literal('jd'), job_description: z.string().min(50, 'Paste at least 50 characters') })
type PositionForm = z.infer<typeof positionSchema>
type JdForm       = z.infer<typeof jdSchema>

function AnalysisPreview({ analysis }: { analysis: JobAnalysis }) {
  return (
    <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-bold text-blue-900">{analysis.position}</span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 capitalize font-medium">{analysis.seniority}</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {analysis.skills.slice(0, 8).map(s => (
          <span key={s.name} className={cn(
            'text-xs px-2.5 py-1 rounded-lg font-medium border',
            s.importance === 'required'
              ? 'bg-gray-900 text-white border-gray-900'
              : 'bg-white text-gray-600 border-gray-200'
          )}>{s.name}</span>
        ))}
        {analysis.skills.length > 8 && <span className="text-xs text-blue-500">+{analysis.skills.length - 8} more</span>}
      </div>
    </div>
  )
}

function ConfigFields({ register }: { register: any }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {[
        { name: 'mode', label: 'Mode', opts: [['practice','Practice'],['simulation','Simulation'],['challenging','Challenging']] },
        { name: 'question_count', label: 'Questions', opts: [3,5,8,10,12,15].map(n => [String(n), String(n)]) },
        { name: 'experience_level', label: 'Level', opts: [['','Auto'],['junior','Junior'],['mid','Mid'],['senior','Senior'],['lead','Lead']] },
      ].map(f => (
        <div key={f.name}>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{f.label}</label>
          <select {...register(f.name)} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all">
            {f.opts.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
      ))}
    </div>
  )
}

function PositionPath() {
  const createSession = useCreateSession()
  const { data: positions, isLoading } = useQuery<Position[]>({
    queryKey: ['positions'],
    queryFn: () => apiClient.get('/positions').then(r => r.data.data),
  })
  const { register, handleSubmit, formState: { errors } } = useForm<PositionForm, unknown, PositionForm>({
    resolver: zodResolver(positionSchema) as any,
    defaultValues: { path: 'position', mode: 'simulation', question_count: 8 },
  })
  const onSubmit = (d: PositionForm) => createSession.mutate({ position_id: d.position_id, mode: d.mode, question_count: d.question_count, experience_level: d.experience_level })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <input type="hidden" {...register('path')} />
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Position</label>
        <select {...register('position_id')} disabled={isLoading} className={cn('w-full rounded-xl border bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all', errors.position_id ? 'border-red-300' : 'border-gray-200')}>
          <option value="">Select a position…</option>
          {positions?.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        {errors.position_id && <p className="mt-1 text-xs text-red-600">{errors.position_id.message}</p>}
      </div>
      <ConfigFields register={register} />
      <SubmitBtn loading={createSession.isPending} error={(createSession.error as any)?.response?.data?.message} />
    </form>
  )
}

function JdPath() {
  const analyzeJob    = useAnalyzeJob()
  const createSession = useCreateSession()
  const [analysis, setAnalysis] = useState<JobAnalysis | null>(null)
  const { register, handleSubmit, getValues, formState: { errors } } = useForm<JdForm, unknown, JdForm>({
    resolver: zodResolver(jdSchema) as any,
    defaultValues: { path: 'jd', mode: 'simulation', question_count: 8 },
  })
  const handleAnalyze = async () => {
    const jd = getValues('job_description')
    if (!jd || jd.length < 50) return
    const result = await analyzeJob.mutateAsync({ job_description: jd, experience_level: getValues('experience_level') })
    setAnalysis(result)
  }
  const onSubmit = (d: JdForm) => createSession.mutate({ job_description: d.job_description, mode: d.mode, question_count: d.question_count, experience_level: d.experience_level })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <input type="hidden" {...register('path')} />
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Job Description</label>
        <textarea
          {...register('job_description')}
          rows={6}
          placeholder="Paste the full job description here…"
          className={cn('w-full rounded-xl border px-4 py-3 text-sm placeholder-gray-400 bg-gray-50 resize-none focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all', errors.job_description ? 'border-red-300' : 'border-gray-200')}
        />
        {errors.job_description && <p className="mt-1 text-xs text-red-600">{errors.job_description.message}</p>}
        <button type="button" onClick={handleAnalyze} disabled={analyzeJob.isPending} className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 disabled:opacity-50 transition-colors">
          {analyzeJob.isPending ? <><span className="w-3 h-3 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />Analyzing…</> : <><span>✦</span> Analyze job description</>}
        </button>
      </div>
      {analysis && <AnalysisPreview analysis={analysis} />}
      <ConfigFields register={register} />
      <SubmitBtn loading={createSession.isPending} error={(createSession.error as any)?.response?.data?.message} />
    </form>
  )
}

function SubmitBtn({ loading, error }: { loading: boolean; error?: string }) {
  return (
    <>
      <button type="submit" disabled={loading} className="w-full rounded-xl bg-gray-900 text-white font-semibold py-3.5 text-sm hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5">
        {loading ? <span className="flex items-center justify-center gap-2"><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Starting…</span> : 'Start Interview →'}
      </button>
      {error && <p className="text-sm text-red-600 text-center">{error}</p>}
    </>
  )
}

export default function InterviewSetupPage() {
  const [tab, setTab] = useState<'jd' | 'position'>('jd')
  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Start an Interview</h1>
        <p className="mt-1 text-sm text-gray-500">Paste a vacancy or pick from our position library</p>
      </div>
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1">
          {[['jd','Paste Job Description'],['position','Pick a Position']].map(([v,l]) => (
            <button key={v} type="button" onClick={() => setTab(v as any)}
              className={cn('flex-1 rounded-lg py-2 text-sm font-semibold transition-all', tab === v ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700')}>
              {l}
            </button>
          ))}
        </div>
        {tab === 'jd' ? <JdPath /> : <PositionPath />}
      </div>
    </div>
  )
}
