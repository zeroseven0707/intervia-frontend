'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSessions } from '@/lib/hooks/useInterview'
import { cn } from '@/lib/utils/cn'

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    completed:    'bg-green-100 text-green-700',
    interviewing: 'bg-blue-100 text-blue-700',
    evaluating:   'bg-purple-100 text-purple-700',
    analyzing:    'bg-yellow-100 text-yellow-700',
    pending:      'bg-gray-100 text-gray-500',
    failed:       'bg-red-100 text-red-600',
  }
  return (
    <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full capitalize', map[status] ?? 'bg-gray-100 text-gray-500')}>
      {status}
    </span>
  )
}

function ScoreChip({ score }: { score: number | null }) {
  if (score === null) return <span className="text-sm text-gray-400">—</span>
  const color = score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-500'
  return <span className={cn('text-sm font-bold tabular-nums', color)}>{score}/100</span>
}

export default function SessionsPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading, isError } = useSessions(page)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Interview History</h1>
          <p className="mt-0.5 text-sm text-gray-500">All your past sessions</p>
        </div>
        <Link
          href="/interview/setup"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
        >
          New Interview
        </Link>
      </div>

      {isLoading && (
        <div className="space-y-3 animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-white rounded-xl border border-gray-200" />
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          Failed to load sessions. Please refresh.
        </div>
      )}

      {data && data.data.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-400 text-sm mb-4">No interview sessions yet.</p>
          <Link href="/interview/setup" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
            Start your first interview →
          </Link>
        </div>
      )}

      {data && data.data.length > 0 && (
        <>
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Position</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Mode</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Score</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Date</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {data.data.map((s: any) => (
                  <tr key={s.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-gray-900">{s.position ?? 'Custom Job'}</td>
                    <td className="px-5 py-3.5 text-gray-500 capitalize">{s.mode}</td>
                    <td className="px-5 py-3.5"><ScoreChip score={s.overall_score} /></td>
                    <td className="px-5 py-3.5"><StatusBadge status={s.status} /></td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs">
                      {new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {s.status === 'completed' ? (
                        <Link href={`/interview/report/${s.id}`} className="text-xs font-medium text-indigo-600 hover:text-indigo-500">
                          View report →
                        </Link>
                      ) : s.status === 'interviewing' ? (
                        <Link href={`/interview/${s.id}`} className="text-xs font-medium text-blue-600 hover:text-blue-500">
                          Continue →
                        </Link>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data.meta && data.meta.last_page > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Page {data.meta.current_page} of {data.meta.last_page} · {data.meta.total} sessions
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(p => Math.min(data.meta.last_page, p + 1))}
                  disabled={page === data.meta.last_page}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
