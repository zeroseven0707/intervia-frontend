'use client'

import { useQuery } from '@tanstack/react-query'
import apiClient from '@/lib/api/client'
import { cn } from '@/lib/utils/cn'
import type { LearningRecommendation } from '@/types'

function SourceTypeBadge({ type }: { type: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    youtube:       { label: 'YouTube',  cls: 'bg-red-50 text-red-600 border-red-100' },
    article:       { label: 'Article',  cls: 'bg-blue-50 text-blue-600 border-blue-100' },
    documentation: { label: 'Docs',     cls: 'bg-green-50 text-green-600 border-green-100' },
    pdf:           { label: 'PDF',      cls: 'bg-orange-50 text-orange-600 border-orange-100' },
  }
  const { label, cls } = map[type] ?? { label: type, cls: 'bg-gray-50 text-gray-600 border-gray-100' }
  return (
    <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full border', cls)}>
      {label}
    </span>
  )
}

function SkillStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    weak:       'bg-red-100 text-red-700',
    needs_work: 'bg-yellow-100 text-yellow-700',
    good:       'bg-blue-100 text-blue-700',
    strong:     'bg-green-100 text-green-700',
  }
  return (
    <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full capitalize', map[status] ?? 'bg-gray-100 text-gray-600')}>
      {status.replace('_', ' ')}
    </span>
  )
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return ''
  if (seconds < 60) return `${seconds}s`
  const m = Math.floor(seconds / 60)
  if (m < 60) return `${m} min`
  const h = Math.floor(m / 60)
  const rem = m % 60
  return rem > 0 ? `${h}h ${rem}m` : `${h}h`
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
        <h1 className="text-2xl font-semibold text-gray-900">Learning Recommendations</h1>
        <p className="mt-0.5 text-sm text-gray-500">Based on your weakest skills from recent interviews</p>
      </div>

      {isLoading && (
        <div className="space-y-4 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-white rounded-2xl border border-gray-200" />
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          Failed to load recommendations.
        </div>
      )}

      {data && data.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-400 text-sm mb-2">No recommendations yet.</p>
          <p className="text-gray-400 text-xs">Complete an interview to get personalised learning suggestions.</p>
        </div>
      )}

      {data && data.length > 0 && (
        <div className="space-y-6">
          {data.map((rec) => (
            <div key={rec.skill} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              {/* Skill header */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="text-base font-semibold text-gray-900">{rec.skill}</h2>
                  <SkillStatusBadge status={rec.status} />
                </div>
                <span className="text-sm font-bold tabular-nums text-gray-500">{Math.round(rec.score)}/100</span>
              </div>

              {/* Materials */}
              {rec.materials.length === 0 ? (
                <div className="px-6 py-8 text-center text-sm text-gray-400">
                  No materials available for this skill yet.
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {rec.materials.map((mat) => (
                    <div key={mat.id} className="px-6 py-4 flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <SourceTypeBadge type={mat.source.type} />
                          {mat.duration_seconds && (
                            <span className="text-xs text-gray-400">{formatDuration(mat.duration_seconds)}</span>
                          )}
                          {mat.difficulty && (
                            <span className="text-xs text-gray-400 capitalize">{mat.difficulty}</span>
                          )}
                        </div>
                        <p className="text-sm font-medium text-gray-900 mb-0.5 truncate">{mat.title}</p>
                        <p className="text-xs text-gray-500 line-clamp-2">{mat.summary}</p>
                        <p className="text-xs text-gray-400 mt-1">{mat.source.publisher ?? mat.source.author}</p>
                      </div>
                      <a
                        href={mat.source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 text-xs font-medium text-indigo-600 hover:text-indigo-500 mt-1"
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
