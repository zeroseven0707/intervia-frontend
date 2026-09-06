'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { interviewApi } from '@/lib/api/interview'
import { useSession, useSubmitAnswer } from '@/lib/hooks/useInterview'
import { cn } from '@/lib/utils/cn'
import type { InterviewQuestion, AnswerEvaluation } from '@/types'

// ── Evaluation card shown after each answer ───────────────────────────────────

function EvalCard({
  evaluation,
  onNext,
  isLast,
}: {
  evaluation: AnswerEvaluation
  onNext: () => void
  isLast: boolean
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
      {/* Score row */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900">Your Answer</h3>
        <span
          className={cn(
            'text-2xl font-bold tabular-nums',
            evaluation.overall_score >= 80
              ? 'text-green-600'
              : evaluation.overall_score >= 60
              ? 'text-yellow-600'
              : 'text-red-600'
          )}
        >
          {evaluation.overall_score}/100
        </span>
      </div>

      {/* Score breakdown */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Relevance',    score: evaluation.relevance_score },
          { label: 'Knowledge',    score: evaluation.knowledge_score },
          { label: 'Clarity',      score: evaluation.clarity_score },
          { label: 'Completeness', score: evaluation.completeness_score },
          { label: 'Reasoning',    score: evaluation.reasoning_score },
        ].map((item) => (
          <div key={item.label} className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500 mb-1">{item.label}</p>
            <p className="text-lg font-semibold tabular-nums text-gray-900">{item.score}</p>
          </div>
        ))}
      </div>

      {/* Strengths */}
      {evaluation.strengths.length > 0 && (
        <div>
          <p className="text-xs font-medium text-green-700 mb-1.5">Strengths</p>
          <ul className="space-y-1">
            {evaluation.strengths.map((s, i) => (
              <li key={i} className="text-sm text-gray-700 flex gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Improvement advice */}
      {evaluation.improvement_advice && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
          <p className="text-xs font-medium text-amber-700 mb-1">Improvement</p>
          <p className="text-sm text-amber-900">{evaluation.improvement_advice}</p>
        </div>
      )}

      {/* CTA */}
      <button
        onClick={onNext}
        className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
      >
        {isLast ? 'View Full Report →' : 'Next Question →'}
      </button>
    </div>
  )
}

// ── Main interview page ───────────────────────────────────────────────────────

export default function InterviewPage() {
  const params  = useParams()
  const router  = useRouter()
  const sessionId   = Number(params.sessionId)

  const { data: session, isLoading: sessionLoading } = useSession(sessionId)
  const submitAnswer = useSubmitAnswer(sessionId)
  const [currentQuestion,  setCurrentQuestion]  = useState<InterviewQuestion | null>(null)
  const [answerText,        setAnswerText]        = useState('')
  const [evaluation,        setEvaluation]        = useState<AnswerEvaluation | null>(null)
  const [isLastQuestion,    setIsLastQuestion]    = useState(false)
  const [questionLoading,   setQuestionLoading]   = useState(false)
  const [questionError,     setQuestionError]     = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Load first question on mount
  useEffect(() => {
    if (session && !currentQuestion && session.status !== 'completed') {
      loadNextQuestion()
    }
    if (session?.status === 'completed') {
      router.replace(`/interview/report/${sessionId}`)
    }
  }, [session?.id])

  const loadNextQuestion = async () => {
    setQuestionLoading(true)
    setQuestionError(null)
    setEvaluation(null)
    setAnswerText('')

    try {
      const res  = await interviewApi.getNextQuestion(sessionId)
      const body = res.data as any

      if (body.finished) {
        router.push(`/interview/report/${sessionId}`)
        return
      }
      setCurrentQuestion(body.data)
      setTimeout(() => textareaRef.current?.focus(), 100)
    } catch (err: any) {
      setQuestionError(err?.response?.data?.message ?? 'Failed to load question. Please try again.')
    } finally {
      setQuestionLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!currentQuestion || !answerText.trim()) return

    try {
      const result = await submitAnswer.mutateAsync({
        question_id: currentQuestion.id,
        answer_text: answerText.trim(),
      })
      setEvaluation(result.evaluation)
      setIsLastQuestion(result.is_last_question)
    } catch (err: any) {
      setQuestionError(err?.response?.data?.message ?? 'Failed to submit answer. Please try again.')
    }
  }

  const handleNext = () => {
    if (isLastQuestion) {
      router.push(`/interview/report/${sessionId}`)
    } else {
      loadNextQuestion()
    }
  }

  // ── Loading state ──────────────────────────────────────────────────────────

  if (sessionLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-40 bg-white rounded-2xl border border-gray-200" />
      </div>
    )
  }

  if (!session) {
    return <div className="text-center text-gray-500 py-20">Session not found.</div>
  }

  const jobAnalysis  = session.job_analysis as any
  const positionName = jobAnalysis?.position ?? session.position?.name ?? 'Interview'
  const questionNum  = currentQuestion?.sequence ?? 1
  const totalQ       = session.question_count

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Session header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">{positionName}</h1>
          <p className="text-sm text-gray-500 capitalize">{session.mode} · {session.difficulty}</p>
        </div>
        {currentQuestion && !evaluation && (
          <span className="text-sm font-medium text-gray-500 tabular-nums">
            {questionNum} / {totalQ}
          </span>
        )}
      </div>

      {/* Progress bar */}
      {currentQuestion && (
        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all duration-500"
            style={{ width: `${((questionNum - 1) / totalQ) * 100}%` }}
          />
        </div>
      )}

      {/* Question loading */}
      {questionLoading && (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 flex items-center justify-center gap-3">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          <span className="text-sm text-gray-500">Generating question…</span>
        </div>
      )}

      {/* Error */}
      {questionError && !questionLoading && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 flex items-center justify-between">
          <p className="text-sm text-red-700">{questionError}</p>
          <button
            onClick={loadNextQuestion}
            className="text-sm font-medium text-red-700 underline ml-4"
          >
            Retry
          </button>
        </div>
      )}

      {/* Question card */}
      {currentQuestion && !questionLoading && !evaluation && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
          {/* Category + skill tags */}
          <div className="flex gap-2">
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 capitalize">
              {currentQuestion.category.replace('_', ' ')}
            </span>
            {currentQuestion.skill && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600">
                {currentQuestion.skill}
              </span>
            )}
            {currentQuestion.is_follow_up && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-600">
                Follow-up
              </span>
            )}
          </div>

          {/* Question text */}
          <p className="text-base font-medium text-gray-900 leading-relaxed">
            {currentQuestion.question_text}
          </p>

          {/* Answer textarea */}
          <div>
            <label className="sr-only">Your answer</label>
            <textarea
              ref={textareaRef}
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              rows={6}
              placeholder="Type your answer here…"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!answerText.trim() || submitAnswer.isPending}
            className={cn(
              'w-full rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors',
              'bg-indigo-600 hover:bg-indigo-700',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {submitAnswer.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Evaluating…
              </span>
            ) : (
              'Submit Answer'
            )}
          </button>
        </div>
      )}

      {/* Evaluation result */}
      {evaluation && (
        <EvalCard
          evaluation={evaluation}
          onNext={handleNext}
          isLast={isLastQuestion}
        />
      )}
    </div>
  )
}
