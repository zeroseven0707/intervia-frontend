'use client'

import { useQuery } from '@tanstack/react-query'
import apiClient from '@/lib/api/client'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import type { LearningRecommendation } from '@/types'

function SourceBadge({ type }: { type: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    youtube:       { label: 'YouTube',  cls: 'bg-red-50 text-red-600 border-red-100' },
    article:       { label: 'Article',  cls: 'bg-blue-50 text-blue-600 border-blue-100' },
    documentation: { label: 'Docs',     cls: 'bg-green-50 text-green-600 border-green-100' },
    pdf:           { label: 'PDF',      cls: 'bg-orange-50 text-orange-600 border-orange-100' },
  }
  const { label, cls } = map[type] ?? { label: type, cls: 'bg-gray-50 text-gray-500 border-gray-100' }
  return <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full border', cls)}>{label}</span>
}

function SkillBadge({ status, score }: { status: string; score: number }) {
  const map: Record<string, string> = {
    weak:       'bg-red-50 text-red-600 border-red-100',
    needs_work: 'bg-yellow-50 text-yellow-700 border-yellow-100',
  }
  return (
    <div className="flex items-center gap-2">
      <span className={cn('text-xs font-bold tabular-nums',
        status === 'weak' ? 'text-red-600' : 'text-yellow-600'
      )}>{Math.round(score)}/100</span>
      <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full border capitalize', map[status] ?? 'bg-gray-50 text-gray-500 border-gray-100')}>
        {status.replace('_', ' ')}
      </span>
    </div>
  )
}

function formatDuration(s: number | null) {
  if (!s) return null
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)}h ${m % 60 > 0 ? `${m % 60}m` : ''}`
}

export default function LearningPage() {
  const { data, isLoading, isError } = useQuery<LearningRecommendation[]>({
    queryKey: ['learning-recommendations'],
    queryFn: () => apiClient.get('/learning/recommendations').then(r => r.data.data),
    staleTime: 2 * 60 * 1000,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Learning Recommendations</h1>
        <p className="mt-0.5 text-sm text-gray-500">Curated resources based on your weakest skills</p>
      </div>

      {isLoading && (
        <div className="space-y-4 animate-pulse">
          {[...Array(3)].map((_, i) => <div key={i} className="h-48 bg-white rounded-2xl border border-gray-100" />)}
        </div>
      )}

      {isError && (
        <div className="rounded-2xl bg-red-50 border border-red-100 p-4 text-sm text-red-700">Failed to load recommendations.</div>
      )}

      {data && data.length === 0 && (
        <div className="text-center py-24 border-2 border-dashed border-gray-200 rounded-2xl">
          <p className="text-gray-400 text-sm mb-2">No recommendations yet.</p>
          <p className="text-xs text-gray-300 mb-6">Complete an interview to get personalised learning suggestions.</p>
          <Link href="/interview/setup" className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors">
            Start an interview →
          </Link>
        </div>
      )}

      {data && data.length > 0 && (
        <div className="space-y-5">
          {data.map(rec => (
            <div key={rec.skill} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
              {/* Skill header */}
              <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
                <h2 className="text-base font-black text-gray-900 tracking-tight">{rec.skill}</h2>
                <SkillBadge status={rec.status} score={rec.score} />
              </div>

              {rec.materials.length === 0 ? (
                <div className="px-6 py-8 text-center text-sm text-gray-400">No materials available yet.</div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {rec.materials.map(mat => (
                    <div key={mat.id} className="px-6 py-4 flex items-start gap-4 hover:bg-gray-50 transition-colors group">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <SourceBadge type={mat.source.type} />
                          {mat.duration_seconds && (
                            <span className="text-xs text-gray-400">{formatDuration(mat.duration_seconds)}</span>
                          )}
                          {mat.difficulty && (
                            <span className="text-xs text-gray-400 capitalize">{mat.difficulty}</span>
                          )}
                        </div>
                        <p className="text-sm font-semibold text-gray-900 mb-0.5 truncate group-hover:text-blue-700 transition-colors">{mat.title}</p>
                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{mat.summary}</p>
                        {(mat.source.publisher || mat.source.author) && (
                          <p className="text-xs text-gray-400 mt-1">{mat.source.publisher ?? mat.source.author}</p>
                        )}
                      </div>
                      <a
                        href={mat.source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 text-xs font-semibold text-blue-600 hover:text-blue-700 border border-blue-100 hover:border-blue-300 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap"
                      >
                        Open ↗
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
