'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'
import { useReport, useSession } from '@/lib/hooks/useInterview'
import { cn } from '@/lib/utils/cn'
import type { SkillGap, AnswerReviewItem } from '@/types'

function scoreColor(score: number) {
  if (score >= 80) return 'text-green-600'
  if (score >= 60) return 'text-yellow-600'
  return 'text-red-600'
}

function scoreBg(score: number) {
  if (score >= 80) return 'bg-green-50 border-green-100'
  if (score >= 60) return 'bg-yellow-50 border-yellow-100'
  return 'bg-red-50 border-red-100'
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444'
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${score}%`, background: color }} />
      </div>
      <span className="text-xs font-bold tabular-nums w-6 text-right" style={{ color }}>{score}</span>
    </div>
  )
}

function SkillStatus({ status }: { status: string }) {
  const map: Record<string, string> = {
    weak:       'bg-red-50 text-red-600 border-red-100',
    needs_work: 'bg-yellow-50 text-yellow-700 border-yellow-100',
    good:       'bg-blue-50 text-blue-600 border-blue-100',
    strong:     'bg-green-50 text-green-700 border-green-100',
  }
  const labels: Record<string, string> = { weak: 'Weak', needs_work: 'Needs Work', good: 'Good', strong: 'Strong' }
  return (
    <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full border shrink-0', map[status] ?? 'bg-gray-50 text-gray-500 border-gray-100')}>
      {labels[status] ?? status}
    </span>
  )
}

function AnswerItem({ item, index }: { item: AnswerReviewItem; index: number }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-t border-gray-50 pt-5 first:border-0 first:pt-0">
      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="flex gap-2">
          <span className="text-xs font-bold text-gray-300 tabular-nums mt-0.5">Q{item.sequence}</span>
          <p className="text-sm font-semibold text-gray-900 leading-snug">{item.question}</p>
        </div>
        {item.evaluation && (
          <span className={cn('text-base font-black tabular-nums shrink-0', scoreColor(item.evaluation.overall_score))}>
            {item.evaluation.overall_score}
          </span>
        )}
      </div>

      {item.answer && (
        <p className="text-sm text-gray-500 bg-gray-50 rounded-xl px-4 py-2.5 mb-3 leading-relaxed">{item.answer}</p>
      )}

      {item.evaluation && (
        <div className="space-y-2">
          {item.evaluation.improvement_advice && (
            <div className="rounded-xl bg-amber-50 border border-amber-100 px-3 py-2.5">
              <p className="text-xs text-amber-900">💡 {item.evaluation.improvement_advice}</p>
            </div>
          )}
          {item.evaluation.example_answer && (
            <button onClick={() => setOpen(v => !v)} className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
              {open ? '▲ Hide' : '▼ See'} example answer
            </button>
          )}
          {open && item.evaluation.example_answer && (
            <div className="rounded-xl bg-blue-50 border border-blue-100 px-3 py-2.5">
              <p className="text-xs text-blue-900 leading-relaxed">{item.evaluation.example_answer}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function ReportPage() {
  const params    = useParams()
  const router    = useRouter()
  const sessionId = Number(params.sessionId)

  const { data: session } = useSession(sessionId)
  const { data, isLoading, isError } = useReport(sessionId)

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4 animate-pulse">
        <div className="h-8 w-40 bg-gray-200 rounded-lg" />
        <div className="h-32 bg-white rounded-2xl border border-gray-100" />
        <div className="h-64 bg-white rounded-2xl border border-gray-100" />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="max-w-3xl mx-auto rounded-2xl bg-red-50 border border-red-100 p-6">
        <p className="text-sm text-red-700 mb-3">Report not ready yet. The session may still be evaluating.</p>
        <button onClick={() => router.refresh()} className="text-sm font-semibold text-red-700 underline">Refresh</button>
      </div>
    )
  }

  const { report, skill_gaps, answer_review } = data
  const jobAnalysis  = session?.job_analysis as any
  const positionName = jobAnalysis?.position ?? session?.position?.name ?? 'Interview'

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-10">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">Interview Report</p>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">{positionName}</h1>
        </div>
        <div className={cn('rounded-2xl border px-5 py-3 text-center', scoreBg(report.overall_score))}>
          <div className={cn('text-4xl font-black tabular-nums leading-none', scoreColor(report.overall_score))}>
            {report.overall_score}
          </div>
          <div className="text-xs text-gray-400 mt-0.5">/100</div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white border border-gray-100 rounded-2xl px-6 py-5 shadow-sm">
        <p className="text-sm text-gray-600 leading-relaxed">{report.summary}</p>
      </div>

      {/* Category scores */}
      {[report.technical_score, report.communication_score, report.problem_solving_score].some(Boolean) && (
        <div className="bg-white border border-gray-100 rounded-2xl px-6 py-5 shadow-sm">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Category Scores</h2>
          <div className="space-y-3">
            {[
              { label: 'Technical',        score: report.technical_score },
              { label: 'Communication',    score: report.communication_score },
              { label: 'Problem Solving',  score: report.problem_solving_score },
              { label: 'Answer Structure', score: report.answer_structure_score },
            ].filter(c => c.score != null).map(c => (
              <div key={c.label} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-32 shrink-0">{c.label}</span>
                <ScoreBar score={c.score!} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strengths + Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-100 rounded-2xl px-6 py-5 shadow-sm">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Strengths</h2>
          {report.strengths.length === 0 ? (
            <p className="text-sm text-gray-300">None identified.</p>
          ) : (
            <ul className="space-y-2">
              {report.strengths.map((s: string, i: number) => (
                <li key={i} className="flex gap-2 text-sm text-gray-700">
                  <span className="text-green-500 shrink-0 mt-0.5">✓</span>{s}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl px-6 py-5 shadow-sm">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Weaknesses</h2>
          {report.weaknesses.length === 0 ? (
            <p className="text-sm text-gray-300">None identified.</p>
          ) : (
            <ul className="space-y-2">
              {report.weaknesses.map((w: string, i: number) => (
                <li key={i} className="flex gap-2 text-sm text-gray-700">
                  <span className="text-red-400 shrink-0 mt-0.5">✗</span>{w}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Skill gaps */}
      {skill_gaps?.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl px-6 py-5 shadow-sm">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Skill Gap Analysis</h2>
          <div className="space-y-3">
            {(skill_gaps as SkillGap[]).map(gap => (
              <div key={gap.skill} className="flex items-center gap-3">
                <span className="text-sm text-gray-700 w-36 shrink-0 truncate">{gap.skill}</span>
                <div className="flex-1">
                  <ScoreBar score={Math.round(gap.score)} />
                </div>
                <SkillStatus status={gap.status} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Answer review */}
      <div className="bg-white border border-gray-100 rounded-2xl px-6 py-5 shadow-sm">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-5">Answer Review</h2>
        <div className="space-y-5">
          {(answer_review as AnswerReviewItem[]).map((item, i) => (
            <AnswerItem key={item.sequence} item={item} index={i} />
          ))}
        </div>
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/interview/setup"
          className="flex-1 rounded-xl bg-gray-900 text-white font-semibold py-3.5 text-sm text-center hover:bg-gray-700 transition-all hover:-translate-y-0.5"
        >
          Retry Interview →
        </Link>
        <Link
          href="/learning"
          className="flex-1 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 font-semibold py-3.5 text-sm text-center hover:bg-blue-100 transition-all hover:-translate-y-0.5"
        >
          Study Weak Areas →
        </Link>
        <Link
          href="/dashboard"
          className="flex-1 rounded-xl border border-gray-200 text-gray-600 font-semibold py-3.5 text-sm text-center hover:bg-gray-50 transition-all"
        >
          Dashboard
        </Link>
      </div>
    </div>
  )
}
