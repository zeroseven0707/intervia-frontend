'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useReport, useSession } from '@/lib/hooks/useInterview'
import { cn } from '@/lib/utils/cn'
import type { SkillGap, AnswerReviewItem } from '@/types'

// ── Helpers ───────────────────────────────────────────────────────────────────

function scoreColor(score: number) {
  if (score >= 80) return 'text-green-600'
  if (score >= 60) return 'text-yellow-600'
  return 'text-red-600'
}

function skillStatusLabel(status: string) {
  const map: Record<string, { label: string; cls: string }> = {
    strong:     { label: 'Strong',     cls: 'bg-green-100 text-green-700' },
    good:       { label: 'Good',       cls: 'bg-blue-100 text-blue-700' },
    needs_work: { label: 'Needs Work', cls: 'bg-yellow-100 text-yellow-700' },
    weak:       { label: 'Weak',       cls: 'bg-red-100 text-red-700' },
  }
  return map[status] ?? { label: status, cls: 'bg-gray-100 text-gray-600' }
}

function ScoreBar({ score, max = 100 }: { score: number; max?: number }) {
  const pct   = Math.min(100, (score / max) * 100)
  const color = score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all', color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-sm font-medium tabular-nums text-gray-700 w-8 text-right">{score}</span>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ReportPage() {
  const params    = useParams()
  const router    = useRouter()
  const sessionId = Number(params.sessionId)

  const { data: session } = useSession(sessionId)
  const { data, isLoading, isError } = useReport(sessionId)

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-48 bg-white rounded-2xl border border-gray-200" />
        <div className="h-64 bg-white rounded-2xl border border-gray-200" />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="max-w-3xl mx-auto rounded-2xl bg-red-50 border border-red-200 p-6 text-red-700">
        Could not load the report. The interview may still be evaluating.
        <button onClick={() => router.refresh()} className="ml-2 underline">Refresh</button>
      </div>
    )
  }

  const { report, skill_gaps, answer_review } = data
  const jobAnalysis  = session?.job_analysis as any
  const positionName = jobAnalysis?.position ?? session?.position?.name ?? 'Interview'

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Interview Report</h1>
          <p className="mt-0.5 text-sm text-gray-500">{positionName}</p>
        </div>
        <div className="text-right">
          <p className={cn('text-5xl font-bold tabular-nums', scoreColor(report.overall_score))}>
            {report.overall_score}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">/ 100</p>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <p className="text-sm text-gray-700">{report.summary}</p>
      </div>

      {/* Category scores */}
      {(report.technical_score || report.communication_score || report.problem_solving_score) && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900">Category Scores</h2>
          {[
            { label: 'Technical',         score: report.technical_score },
            { label: 'Communication',     score: report.communication_score },
            { label: 'Problem Solving',   score: report.problem_solving_score },
            { label: 'Answer Structure',  score: report.answer_structure_score },
          ].filter((c) => c.score != null).map((c) => (
            <div key={c.label}>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-gray-600">{c.label}</span>
              </div>
              <ScoreBar score={c.score!} />
            </div>
          ))}
        </div>
      )}

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Strengths</h2>
          {report.strengths.length === 0 ? (
            <p className="text-sm text-gray-400">No strengths identified.</p>
          ) : (
            <ul className="space-y-2">
              {report.strengths.map((s: string, i: number) => (
                <li key={i} className="text-sm text-gray-700 flex gap-2">
                  <span className="text-green-500 mt-0.5 shrink-0">✓</span>{s}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Weaknesses</h2>
          {report.weaknesses.length === 0 ? (
            <p className="text-sm text-gray-400">No weaknesses identified.</p>
          ) : (
            <ul className="space-y-2">
              {report.weaknesses.map((w: string, i: number) => (
                <li key={i} className="text-sm text-gray-700 flex gap-2">
                  <span className="text-red-400 mt-0.5 shrink-0">✗</span>{w}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Skill Gaps */}
      {skill_gaps?.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900">Skill Gap Analysis</h2>
          <div className="space-y-3">
            {(skill_gaps as SkillGap[]).map((gap) => {
              const { label, cls } = skillStatusLabel(gap.status)
              return (
                <div key={gap.skill} className="flex items-center gap-3">
                  <span className="text-sm text-gray-700 w-40 truncate">{gap.skill}</span>
                  <div className="flex-1">
                    <ScoreBar score={Math.round(gap.score)} />
                  </div>
                  <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full shrink-0', cls)}>
                    {label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Answer review */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
        <h2 className="text-sm font-semibold text-gray-900">Answer Review</h2>
        {(answer_review as AnswerReviewItem[]).map((item) => (
          <div key={item.sequence} className="border-t border-gray-100 pt-5 first:border-0 first:pt-0">
            <div className="flex items-start justify-between gap-4 mb-2">
              <p className="text-sm font-medium text-gray-900">
                <span className="text-gray-400 font-normal mr-1">Q{item.sequence}.</span>
                {item.question}
              </p>
              {item.evaluation && (
                <span className={cn('text-lg font-bold tabular-nums shrink-0', scoreColor(item.evaluation.overall_score))}>
                  {item.evaluation.overall_score}
                </span>
              )}
            </div>
            {item.answer && (
              <p className="text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2 mb-3">
                {item.answer}
              </p>
            )}
            {item.evaluation && (
              <div className="space-y-2">
                {item.evaluation.improvement_advice && (
                  <p className="text-xs text-amber-700 bg-amber-50 rounded px-3 py-2">
                    💡 {item.evaluation.improvement_advice}
                  </p>
                )}
                {item.evaluation.example_answer && (
                  <details className="text-xs text-gray-600">
                    <summary className="cursor-pointer text-indigo-600 font-medium">See example answer</summary>
                    <p className="mt-2 bg-indigo-50 rounded px-3 py-2 leading-relaxed">
                      {item.evaluation.example_answer}
                    </p>
                  </details>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* CTAs */}
      <div className="flex gap-3 pb-8">
        <Link
          href="/interview/setup"
          className="flex-1 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white text-center hover:bg-indigo-700 transition-colors"
        >
          Retry Interview
        </Link>
        <Link
          href="/dashboard"
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 text-center hover:bg-gray-50 transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
