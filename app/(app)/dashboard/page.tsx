'use client'

import Link from 'next/link'
import { useDashboard } from '@/lib/hooks/useInterview'
import { useAuthStore } from '@/lib/store/authStore'
import { cn } from '@/lib/utils/cn'

function ScoreRing({ score }: { score: number | null }) {
  if (score === null) return <span className="text-4xl font-black text-gray-200">—</span>
  const color = score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600'
  return (
    <div className="flex items-end gap-1">
      <span className={cn('text-5xl font-black tabular-nums leading-none', color)}>{score}</span>
      <span className="text-sm text-gray-400 mb-1">/100</span>
    </div>
  )
}

function SkillBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    weak:       'bg-red-50 text-red-600 border-red-100',
    needs_work: 'bg-yellow-50 text-yellow-700 border-yellow-100',
    good:       'bg-blue-50 text-blue-600 border-blue-100',
    strong:     'bg-green-50 text-green-700 border-green-100',
  }
  const labels: Record<string, string> = { weak: 'Weak', needs_work: 'Needs Work', good: 'Good', strong: 'Strong' }
  return (
    <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full border', map[status] ?? 'bg-gray-50 text-gray-500 border-gray-100')}>
      {labels[status] ?? status}
    </span>
  )
}

function StatusDot({ status }: { status: string }) {
  const map: Record<string, string> = {
    completed:    'bg-green-500',
    interviewing: 'bg-blue-500',
    evaluating:   'bg-purple-500',
    failed:       'bg-red-500',
    pending:      'bg-gray-300',
    analyzing:    'bg-yellow-400',
  }
  return <span className={cn('w-1.5 h-1.5 rounded-full shrink-0 mt-1', map[status] ?? 'bg-gray-300')} />
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { data, isLoading, isError } = useDashboard()
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  if (isLoading) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-white rounded-2xl border border-gray-100" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-56 bg-white rounded-2xl border border-gray-100" />
          <div className="h-56 bg-white rounded-2xl border border-gray-100" />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-2xl bg-red-50 border border-red-100 p-6 text-sm text-red-700">
        Failed to load dashboard. Please refresh.
      </div>
    )
  }

  const trend = data?.score_trend

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500">{greeting}{user?.name ? `, ${user.name.split(' ')[0]}` : ''}</p>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Dashboard</h1>
        </div>
        <Link
          href="/interview/setup"
          className="inline-flex items-center gap-2 bg-gray-900 text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-gray-700 transition-all hover:-translate-y-0.5"
        >
          <span className="text-blue-400">+</span>
          New Interview
        </Link>
      </div>

      {/* Score cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Readiness Score</p>
          <ScoreRing score={data?.readiness_score ?? null} />
          <p className="text-xs text-gray-400 mt-2">Average across all skills</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Latest Interview</p>
          <ScoreRing score={data?.latest_score ?? null} />
          <p className="text-xs text-gray-400 mt-2">Most recent session</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Score Trend</p>
          {trend === null || trend === undefined ? (
            <span className="text-4xl font-black text-gray-200">—</span>
          ) : (
            <div className="flex items-end gap-1">
              <span className={cn('text-5xl font-black tabular-nums leading-none', trend >= 0 ? 'text-green-600' : 'text-red-600')}>
                {trend > 0 ? `+${trend}` : trend}
              </span>
              <span className="text-sm text-gray-400 mb-1">pts</span>
            </div>
          )}
          <p className="text-xs text-gray-400 mt-2">vs previous session</p>
        </div>
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Weak skills */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold text-gray-900">Weak Skills</h2>
            <Link href="/learning" className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors">
              See resources →
            </Link>
          </div>
          {!data?.weak_skills?.length ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-400">No weak skills yet.</p>
              <p className="text-xs text-gray-300 mt-1">Complete an interview to see your gaps.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {data.weak_skills.map(s => (
                <li key={s.skill} className="flex items-center justify-between">
                  <span className="text-sm text-gray-800 font-medium">{s.skill}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold tabular-nums text-gray-700">{s.score}</span>
                    <SkillBadge status={s.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent sessions */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold text-gray-900">Recent Sessions</h2>
            <Link href="/sessions" className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors">
              View all →
            </Link>
          </div>
          {!data?.recent_sessions?.length ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-400 mb-4">No sessions yet.</p>
              <Link
                href="/interview/setup"
                className="inline-flex items-center gap-1.5 text-sm font-semibold bg-gray-900 text-white px-4 py-2 rounded-xl hover:bg-gray-700 transition-colors"
              >
                Start your first interview →
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {data.recent_sessions.map((s: any) => (
                <li key={s.id} className="flex items-start justify-between">
                  <div className="flex items-start gap-2">
                    <StatusDot status={s.status} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{s.position}</p>
                      <p className="text-xs text-gray-400 capitalize">{s.mode} mode</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {s.overall_score !== null && (
                      <span className={cn(
                        'text-sm font-bold tabular-nums',
                        s.overall_score >= 80 ? 'text-green-600' : s.overall_score >= 60 ? 'text-yellow-600' : 'text-red-600'
                      )}>
                        {s.overall_score}
                      </span>
                    )}
                    {s.status === 'completed' && (
                      <Link href={`/interview/report/${s.id}`} className="text-xs text-blue-600 hover:text-blue-700 transition-colors">
                        Report →
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Empty state CTA */}
      {!data?.recent_sessions?.length && !data?.weak_skills?.length && (
        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center">
          <div className="text-4xl mb-4">◎</div>
          <h3 className="text-base font-bold text-gray-900 mb-2">Ready to start?</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">
            Paste a job description and get your first interview score in under 10 minutes.
          </p>
          <Link
            href="/interview/setup"
            className="inline-flex items-center gap-2 bg-gray-900 text-white font-semibold px-6 py-3 rounded-xl text-sm hover:bg-gray-700 transition-all hover:-translate-y-0.5"
          >
            Start Interview →
          </Link>
        </div>
      )}
    </div>
  )
}
