'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSessions } from '@/lib/hooks/useInterview'
import { cn } from '@/lib/utils/cn'

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    completed:    'bg-green-50 text-green-700 border-green-100',
    interviewing: 'bg-blue-50 text-blue-600 border-blue-100',
    evaluating:   'bg-purple-50 text-purple-600 border-purple-100',
    analyzing:    'bg-yellow-50 text-yellow-700 border-yellow-100',
    pending:      'bg-gray-50 text-gray-500 border-gray-100',
    failed:       'bg-red-50 text-red-600 border-red-100',
  }
  return (
    <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full border capitalize', map[status] ?? 'bg-gray-50 text-gray-500 border-gray-100')}>
      {status}
    </span>
  )
}

export default function SessionsPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading, isError } = useSessions(page)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Interview History</h1>
          <p className="mt-0.5 text-sm text-gray-500">All your past sessions</p>
        </div>
        <Link
          href="/interview/setup"
          className="inline-flex items-center gap-2 bg-gray-900 text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-gray-700 transition-all hover:-translate-y-0.5"
        >
          + New Interview
        </Link>
      </div>

      {isLoading && (
        <div className="space-y-2 animate-pulse">
          {[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-white rounded-xl border border-gray-100" />)}
        </div>
      )}

      {isError && (
        <div className="rounded-2xl bg-red-50 border border-red-100 p-4 text-sm text-red-700">
          Failed to load sessions. Please refresh.
        </div>
      )}

      {data && data.data.length === 0 && (
        <div className="text-center py-24 border-2 border-dashed border-gray-200 rounded-2xl">
          <p className="text-gray-400 text-sm mb-4">No sessions yet.</p>
          <Link href="/interview/setup" className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors">
            Start your first interview →
          </Link>
        </div>
      )}

      {data && data.data.length > 0 && (
        <>
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            {/* Header */}
            <div className="grid grid-cols-12 gap-3 px-5 py-2.5 bg-gray-50 border-b border-gray-100">
              {['Position', 'Mode', 'Score', 'Status', 'Date', ''].map((h, i) => (
                <div key={i} className={cn('text-xs font-semibold text-gray-400 uppercase tracking-wide', i === 0 ? 'col-span-4' : i === 5 ? 'col-span-1 text-right' : 'col-span-2')}>
                  {h}
                </div>
              ))}
            </div>

            {data.data.map((s: any, i: number) => (
              <div key={s.id} className={cn('grid grid-cols-12 gap-3 items-center px-5 py-3.5 transition-colors hover:bg-gray-50', i < data.data.length - 1 && 'border-b border-gray-50')}>
                <div className="col-span-4">
                  <p className="text-sm font-semibold text-gray-900 truncate">{s.position ?? 'Custom Job'}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-xs text-gray-500 capitalize">{s.mode}</span>
                </div>
                <div className="col-span-2">
                  {s.overall_score !== null ? (
                    <span className={cn('text-sm font-black tabular-nums',
                      s.overall_score >= 80 ? 'text-green-600' : s.overall_score >= 60 ? 'text-yellow-600' : 'text-red-600'
                    )}>
                      {s.overall_score}
                    </span>
                  ) : <span className="text-sm text-gray-300">—</span>}
                </div>
                <div className="col-span-2">
                  <StatusBadge status={s.status} />
                </div>
                <div className="col-span-1">
                  <span className="text-xs text-gray-400">
                    {new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <div className="col-span-1 text-right">
                  {s.status === 'completed' ? (
                    <Link href={`/interview/report/${s.id}`} className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                      Report →
                    </Link>
                  ) : s.status === 'interviewing' ? (
                    <Link href={`/interview/${s.id}`} className="text-xs font-semibold text-gray-700 hover:text-gray-900 transition-colors">
                      Continue →
                    </Link>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          {data.meta && data.meta.last_page > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-400">{data.meta.total} sessions · Page {data.meta.current_page}/{data.meta.last_page}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-3.5 py-2 text-xs font-semibold border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors">
                  ← Previous
                </button>
                <button onClick={() => setPage(p => Math.min(data.meta.last_page, p + 1))} disabled={page === data.meta.last_page}
                  className="px-3.5 py-2 text-xs font-semibold border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors">
                  Next →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
