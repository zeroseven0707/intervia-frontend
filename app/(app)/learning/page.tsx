'use client'

import { useQuery } from '@tanstack/react-query'
import apiClient from '@/lib/api/client'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import type { LearningRecommendation } from '@/types'

function SourceBadge({ type }: { type?: string | null }) {
  const t = String(type ?? 'other').toLowerCase()
  const map: Record<string, { label: string; cls: string }> = {
    youtube:       { label: 'YouTube',       cls: 'bg-red-50 text-red-600 border-red-100' },
    article:       { label: 'Article',       cls: 'bg-blue-50 text-blue-600 border-blue-100' },
    documentation: { label: 'Documentation', cls: 'bg-green-50 text-green-600 border-green-100' },
    pdf:           { label: 'PDF',           cls: 'bg-orange-50 text-orange-600 border-orange-100' },
  }
  const info = map[t] ?? { label: t === 'other' ? 'Resource' : t, cls: 'bg-gray-50 text-gray-500 border-gray-100' }
  return <span className={cn('text-[11px] font-bold px-2.5 py-1 rounded-full border', info.cls)}>{info.label}</span>
}

function SkillBadge({ status, score }: { status: string; score: number | null }) {
  const map: Record<string, string> = {
    weak:       'bg-red-50 text-red-600 border-red-100',
    needs_work: 'bg-yellow-50 text-yellow-700 border-yellow-100',
    good:       'bg-blue-50 text-blue-600 border-blue-100',
    strong:     'bg-emerald-50 text-emerald-700 border-emerald-100',
    starter:    'bg-indigo-50 text-indigo-600 border-indigo-100',
    curated:    'bg-purple-50 text-purple-600 border-purple-100',
  }
  const labelMap: Record<string, string> = {
    needs_work: 'Needs Work',
    starter:    'Starter Pack',
    curated:    'Curated Picks',
  }
  return (
    <div className="flex items-center gap-2">
      {score != null && (
        <span className={cn(
          'text-xs font-black tabular-nums',
          status === 'weak' ? 'text-red-600' : status === 'needs_work' ? 'text-yellow-600' : 'text-gray-600'
        )}>
          {Math.round(score)}<span className="font-normal text-gray-300 text-[10px]">/100</span>
        </span>
      )}
      <span className={cn('text-[11px] font-bold px-2 py-0.5 rounded-full border capitalize tracking-wide',
        map[status] ?? map.curated)}>
        {labelMap[status] ?? status.replace(/_/g, ' ')}
      </span>
    </div>
  )
}

function formatDuration(s: number | null | undefined) {
  if (!s) return null
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  return m < 60 ? `${m} menit` : `${Math.floor(m / 60)} jam ${m % 60 > 0 ? `${m % 60}m` : ''}`
}

function EmptyState() {
  return (
    <div className="text-center py-24 border-2 border-dashed border-gray-200 rounded-2xl bg-white/60">
      <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center text-gray-300 text-2xl">
        🎯
      </div>
      <p className="text-gray-500 text-sm font-semibold mb-1">Belum ada rekomendasi personal</p>
      <p className="text-xs text-gray-400 mb-6 max-w-xs mx-auto">Selesaikan sesi interview pertama untuk analisa skill gap dan rekomendasi belajar yang disesuaikan.</p>
      <Link href="/interview/setup" className="inline-flex items-center gap-2 text-sm font-bold bg-gray-900 text-white hover:bg-gray-700 px-4 py-2 rounded-xl transition-all hover:-translate-y-0.5">
        Mulai Interview Pertama <span>→</span>
      </Link>
    </div>
  )
}

export default function LearningPage() {
  const { data, isLoading, isError, error } = useQuery<LearningRecommendation[]>({
    queryKey: ['learning-recommendations'],
    queryFn: () => apiClient.get('/learning/recommendations').then(r => r.data.data),
    staleTime: 2 * 60 * 1000,
  })

  const recs = Array.isArray(data) ? data : []
  const totalMaterials = recs.reduce((acc, r) => acc + (r.materials?.length ?? 0), 0)

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Learning Path</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {recs.length > 0
              ? `${recs.length} topik · ${totalMaterials} materi siap dipelajari`
              : 'Rekomendasi materi berdasarkan skill gap interview-mu'}
          </p>
        </div>
        <Link
          href="/interview/setup"
          className="hidden sm:inline-flex items-center gap-2 text-xs font-bold text-gray-900 border border-gray-200 hover:border-gray-900 hover:bg-gray-900 hover:text-white px-3.5 py-2 rounded-xl transition-all whitespace-nowrap"
        >
          ⟳ Analisa Ulang Lewat Interview
        </Link>
      </div>

      {/* ── Loading ───────────────────────────────────────────── */}
      {isLoading && (
        <div className="space-y-5 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-white rounded-2xl border border-gray-100" />
          ))}
        </div>
      )}

      {/* ── Error ─────────────────────────────────────────────── */}
      {isError && (
        <div className="rounded-2xl bg-red-50 border border-red-100 p-5 text-sm text-red-700">
          <p className="font-bold mb-1">Gagal memuat rekomendasi</p>
          <p className="text-xs opacity-80">{(error as any)?.response?.data?.message ?? (error as any)?.message ?? 'Coba refresh halaman.'}</p>
        </div>
      )}

      {/* ── Empty ─────────────────────────────────────────────── */}
      {!isLoading && !isError && recs.length === 0 && <EmptyState />}

      {/* ── Recommendations Cards ─────────────────────────────── */}
      {!isLoading && !isError && recs.length > 0 && (
        <div className="space-y-5">
          {recs.map((rec, idx) => (
            <div
              key={`${rec.skill}-${idx}`}
              className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-gray-200 transition-all"
            >
              {/* ── Header Group Skill ────────────────────────── */}
              <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/40 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={cn(
                    'w-9 h-9 rounded-xl shrink-0 flex items-center justify-center text-base',
                    rec.status === 'weak'       && 'bg-red-100 text-red-600',
                    rec.status === 'needs_work' && 'bg-yellow-100 text-yellow-700',
                    rec.status === 'starter'    && 'bg-indigo-100 text-indigo-600',
                    rec.status === 'curated'    && 'bg-purple-100 text-purple-600',
                    !(['weak','needs_work','starter','curated'].includes(rec.status)) && 'bg-gray-100 text-gray-600',
                  )}>
                    {rec.status === 'weak'       && '⚠'}
                    {rec.status === 'needs_work' && '↗'}
                    {rec.status === 'starter'    && '🚀'}
                    {rec.status === 'curated'    && '✨'}
                    {!(['weak','needs_work','starter','curated'].includes(rec.status)) && '📚'}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base font-black text-gray-900 tracking-tight truncate">{rec.skill}</h2>
                    <p className="text-[11px] text-gray-400 font-medium">
                      {rec.materials?.length ?? 0} materi pilihan
                    </p>
                  </div>
                </div>
                <SkillBadge status={rec.status} score={rec.score} />
              </div>

              {/* ── Materials List ─────────────────────────────── */}
              {(!rec.materials || rec.materials.length === 0) ? (
                <div className="px-6 py-10 text-center text-xs text-gray-400 italic">
                  Materi untuk topik ini akan segera ditambahkan.
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {rec.materials.map((mat) => {
                    const src = mat.source
                    const sourceUrl = src?.url
                    const hasLink = !!sourceUrl && /^https?:\/\//i.test(sourceUrl)

                    return (
                      <div
                        key={mat.id}
                        className="px-6 py-4 flex items-start gap-4 hover:bg-gray-50/70 transition-colors group"
                      >
                        {/* Thumb / Icon column */}
                        <div className="w-11 h-11 shrink-0 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 flex items-center justify-center text-lg text-gray-500">
                          {src?.type === 'youtube'       && '▶'}
                          {src?.type === 'article'       && '✎'}
                          {src?.type === 'documentation' && '◈'}
                          {src?.type === 'pdf'           && '▤'}
                          {!src && !['youtube','article','documentation','pdf'].includes(String(src?.type ?? '')) && '↗'}
                        </div>

                        {/* Main content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <SourceBadge type={src?.type} />
                            {mat.duration_seconds ? (
                              <span className="text-[11px] text-gray-400 inline-flex items-center gap-1">
                                <span>⏱</span>{formatDuration(mat.duration_seconds)}
                              </span>
                            ) : null}
                            {mat.difficulty ? (
                              <span className="text-[11px] text-gray-400 capitalize inline-flex items-center gap-1">
                                <span>🎯</span>{mat.difficulty}
                              </span>
                            ) : null}
                          </div>

                          <h3 className="text-sm font-bold text-gray-900 mb-1 truncate group-hover:text-blue-700 transition-colors leading-snug">
                            {mat.title}
                          </h3>

                          {mat.summary && (
                            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                              {mat.summary}
                            </p>
                          )}

                          {(src?.publisher || src?.author) && (
                            <p className="text-[11px] text-gray-400 mt-1.5 inline-flex items-center gap-1.5">
                              <span>✍</span>
                              <span className="truncate">
                                {src.publisher ?? src.author}
                                {src.publisher && src.author && src.author !== src.publisher ? ` · ${src.author}` : ''}
                              </span>
                            </p>
                          )}
                        </div>

                        {/* Action button */}
                        {hasLink ? (
                          <a
                            href={sourceUrl!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 self-center text-xs font-bold text-blue-600 hover:text-blue-700 border border-blue-100 hover:border-blue-300 bg-blue-50/50 hover:bg-blue-50 px-3 py-1.5 rounded-xl transition-all inline-flex items-center gap-1.5"
                          >
                            Buka <span className="text-[10px]">↗</span>
                          </a>
                        ) : (
                          <span className="shrink-0 self-center text-[11px] font-semibold text-gray-300 border border-gray-100 px-3 py-1.5 rounded-xl">
                            No Link
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
