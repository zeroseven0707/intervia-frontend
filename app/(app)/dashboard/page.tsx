'use client'

import Link from 'next/link'
import { useDashboard } from '@/lib/hooks/useInterview'
import { cn } from '@/lib/utils/cn'

function ScoreRing({ score }: { score: number | null }) {
  if (score === null) return <span className="text-3xl font-bold text-gray-300">—</span>
  const color = score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600'
  return <span className={cn('text-4xl font-bold tabular-nums', color)}>{score}</span>
}

function SkillBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    weak:       'bg-red-100 text-red-700',
    needs_work: 'bg-yellow-100 text-yellow-700',
    good:       'bg-blue-100 text-blue-700',
    strong:     'bg-green-100 text-green-700',
  }
  const labels: Record<string, string> = {
    weak: 'Weak', needs_work: 'Needs Work', good: 'Good', strong: 'Strong',
  }
  return (
    <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', styles[status] ?? 'bg-gray-100 text-gray-600')}>
      {labels[status] ?? status}
    </span>
  )
}

function SessionStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    completed:    'bg-green-100 text-green-700',
    interviewing: 'bg-blue-100 text-blue-700',
    failed:       'bg-red-100 text-red-700',
    pending:      'bg-gray-100 text-gray-600',
    analyzing:    'bg-purple-100 text-purple-700',
    evaluating:   'bg-yellow-100 text-yellow-700',
  }
  return (
    <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full capitalize', styles[status] ?? 'bg-gray-100')}>
      {status}
    </span>
  )
}

export default function DashboardPage() {
  const { data, isLoading, isError } = useDashboard()

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-36 bg-white rounded-2xl border border-gray-200" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-48 bg-white rounded-2xl border border-gray-200" />
          <div className="h-48 bg-white rounded-2xl border border-gray-200" />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-2xl bg-red-50 border border-red-200 p-6 text-red-700">
        Failed to load dashboard. Please refresh.
      </div>
    )
  }

  const trend = data?.score_trend

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="mt-0.5 text-sm text-gray-500">Track your interview readiness</p>
        </div>
        <Link
          href="/interview/setup"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
        >
          Start Interview
        </Link>
      </div>

      {/* Score cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Readiness score */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Readiness Score</p>
          <ScoreRing score={data?.readiness_score ?? null} />
          <p className="mt-1 text-xs text-gray-400">/ 100</p>
        </div>

        {/* Latest score */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Latest Interview</p>
          <ScoreRing score={data?.latest_score ?? null} />
          <p className="mt-1 text-xs text-gray-400">/ 100</p>
        </div>

        {/* Trend */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Score Trend</p>
          {trend === null || trend === undefined ? (
            <span className="text-4xl font-bold text-gray-300">—</span>
          ) : (
            <span className={cn('text-4xl font-bold tabular-nums', trend >= 0 ? 'text-green-600' : 'text-red-600')}>
              {trend > 0 ? `+${trend}` : trend}
            </span>
          )}
          <p className="mt-1 text-xs text-gray-400">vs previous</p>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weak skills */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Weak Skills</h2>
          {!data?.weak_skills?.length ? (
            <p className="text-sm text-gray-400">No weak skills yet. Complete an interview first.</p>
          ) : (
            <ul className="space-y-3">
              {data.weak_skills.map((s) => (
                <li key={s.skill} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{s.skill}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium tabular-nums text-gray-900">{s.score}</span>
                    <SkillBadge status={s.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent sessions */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Recent Sessions</h2>
          {!data?.recent_sessions?.length ? (
            <div className="text-center py-6">
              <p className="text-sm text-gray-400 mb-4">No sessions yet.</p>
              <Link
                href="/interview/setup"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                Start your first interview →
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {data.recent_sessions.map((s) => (
                <li key={s.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{s.position}</p>
                    <p className="text-xs text-gray-400 capitalize">{s.mode} mode</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {s.overall_score !== null && (
                      <span className="text-sm font-medium tabular-nums text-gray-700">
                        {s.overall_score}/100
                      </span>
                    )}
                    <SessionStatusBadge status={s.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
