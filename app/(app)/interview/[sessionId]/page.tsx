'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { interviewApi } from '@/lib/api/interview'
import { useSession, useSubmitAnswer } from '@/lib/hooks/useInterview'
import { cn } from '@/lib/utils/cn'
import type { InterviewQuestion, AnswerEvaluation } from '@/types'

function ScorePill({ score }: { score: number }) {
  const color = score >= 80 ? 'bg-green-100 text-green-700 border-green-200'
    : score >= 60 ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
    : 'bg-red-100 text-red-700 border-red-200'
  return (
    <span className={cn('text-xs font-bold px-2.5 py-1 rounded-full border tabular-nums', color)}>
      {score}/100
    </span>
  )
}

function MiniScore({ label, score }: { label: string; score: number }) {
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444'
  return (
    <div className="text-center">
      <div className="text-xs text-gray-400 mb-1">{label}</div>
      <div className="text-base font-black tabular-nums" style={{ color }}>{score}</div>
    </div>
  )
}

function EvalCard({ evaluation, onNext, isLast }: {
  evaluation: AnswerEvaluation; onNext: () => void; isLast: boolean
}) {
  const [showExample, setShowExample] = useState(false)

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
      {/* Score header */}
      <div className={cn(
        'px-6 py-5 flex items-center justify-between',
        evaluation.overall_score >= 80 ? 'bg-green-50 border-b border-green-100'
          : evaluation.overall_score >= 60 ? 'bg-yellow-50 border-b border-yellow-100'
          : 'bg-red-50 border-b border-red-100'
      )}>
        <div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">Your Answer</div>
          <div className="text-xs text-gray-400">
            {evaluation.overall_score >= 80 ? 'Great answer!' : evaluation.overall_score >= 60 ? 'Good, but room to improve' : 'Needs improvement'}
          </div>
        </div>
        <div className="text-right">
          <div className={cn(
            'text-4xl font-black tabular-nums leading-none',
            evaluation.overall_score >= 80 ? 'text-green-600' : evaluation.overall_score >= 60 ? 'text-yellow-600' : 'text-red-600'
          )}>
            {evaluation.overall_score}
          </div>
          <div className="text-xs text-gray-400">/100</div>
        </div>
      </div>

      {/* Mini scores */}
      <div className="px-6 py-4 grid grid-cols-5 gap-2 border-b border-gray-50">
        <MiniScore label="Relevance"    score={evaluation.relevance_score} />
        <MiniScore label="Knowledge"    score={evaluation.knowledge_score} />
        <MiniScore label="Clarity"      score={evaluation.clarity_score} />
        <MiniScore label="Complete"     score={evaluation.completeness_score} />
        <MiniScore label="Reasoning"    score={evaluation.reasoning_score} />
      </div>

      <div className="px-6 py-5 space-y-4">
        {/* Strengths */}
        {evaluation.strengths.length > 0 && (
          <div>
            <div className="text-xs font-bold text-green-700 uppercase tracking-wide mb-2">Strengths</div>
            <ul className="space-y-1.5">
              {evaluation.strengths.map((s, i) => (
                <li key={i} className="flex gap-2 text-sm text-gray-700">
                  <span className="text-green-500 shrink-0 mt-0.5">✓</span>{s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Improvement */}
        {evaluation.improvement_advice && (
          <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-3">
            <div className="text-xs font-bold text-amber-700 mb-1">💡 Improvement tip</div>
            <p className="text-sm text-amber-900">{evaluation.improvement_advice}</p>
          </div>
        )}

        {/* Example answer toggle */}
        {evaluation.example_answer && (
          <div>
            <button
              onClick={() => setShowExample(v => !v)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
            >
              {showExample ? '▲ Hide' : '▼ See'} example answer
            </button>
            {showExample && (
              <div className="mt-2 rounded-xl bg-blue-50 border border-blue-100 px-4 py-3">
                <p className="text-sm text-blue-900 leading-relaxed">{evaluation.example_answer}</p>
              </div>
            )}
          </div>
        )}

        {/* CTA */}
        <button
          onClick={onNext}
          className="w-full rounded-xl bg-gray-900 text-white font-semibold py-3 text-sm hover:bg-gray-700 transition-all hover:-translate-y-0.5 mt-2"
        >
          {isLast ? 'View Full Report →' : 'Next Question →'}
        </button>
      </div>
    </div>
  )
}

export default function InterviewPage() {
  const params    = useParams()
  const router    = useRouter()
  const sessionId = Number(params.sessionId)

  const { data: session, isLoading: sessionLoading } = useSession(sessionId)
  const submitAnswer = useSubmitAnswer(sessionId)

  const [currentQuestion,  setCurrentQuestion]  = useState<InterviewQuestion | null>(null)
  const [answerText,        setAnswerText]        = useState('')
  const [evaluation,        setEvaluation]        = useState<AnswerEvaluation | null>(null)
  const [isLastQuestion,    setIsLastQuestion]    = useState(false)
  const [questionLoading,   setQuestionLoading]   = useState(false)
  const [questionError,     setQuestionError]     = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

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
      if (body.finished) { router.push(`/interview/report/${sessionId}`); return }
      setCurrentQuestion(body.data)
      setTimeout(() => textareaRef.current?.focus(), 100)
    } catch (err: any) {
      setQuestionError(err?.response?.data?.message ?? 'Failed to load question.')
    } finally {
      setQuestionLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!currentQuestion || !answerText.trim()) return
    try {
      const result = await submitAnswer.mutateAsync({ question_id: currentQuestion.id, answer_text: answerText.trim() })
      setEvaluation(result.evaluation)
      setIsLastQuestion(result.is_last_question)
    } catch (err: any) {
      setQuestionError(err?.response?.data?.message ?? 'Failed to submit answer.')
    }
  }

  if (sessionLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded-lg" />
        <div className="h-12 w-full bg-gray-100 rounded-xl" />
        <div className="h-48 bg-white rounded-2xl border border-gray-100" />
      </div>
    )
  }

  if (!session) return <div className="text-center text-gray-400 py-20">Session not found.</div>

  const jobAnalysis  = session.job_analysis as any
  const positionName = jobAnalysis?.position ?? session.position?.name ?? 'Interview'
  const questionNum  = currentQuestion?.sequence ?? 1
  const totalQ       = session.question_count

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-black text-gray-900 tracking-tight">{positionName}</h1>
          <p className="text-xs text-gray-400 capitalize mt-0.5">{session.mode} mode · {session.difficulty}</p>
        </div>
        {currentQuestion && !evaluation && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 tabular-nums">{questionNum}/{totalQ}</span>
            <span className={cn(
              'text-xs font-medium px-2 py-0.5 rounded-full',
              currentQuestion.difficulty === 'hard' ? 'bg-red-50 text-red-600'
                : currentQuestion.difficulty === 'medium' ? 'bg-yellow-50 text-yellow-600'
                : 'bg-green-50 text-green-600'
            )}>
              {currentQuestion.difficulty}
            </span>
          </div>
        )}
      </div>

      {/* Progress */}
      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${((questionNum - (evaluation ? 0 : 1)) / totalQ) * 100}%`,
            background: 'linear-gradient(90deg, #3b82f6, #6366f1)',
          }}
        />
      </div>

      {/* Loading question */}
      {questionLoading && (
        <div className="bg-white border border-gray-100 rounded-2xl p-10 flex flex-col items-center gap-3 shadow-sm">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Generating question…</p>
        </div>
      )}

      {/* Error */}
      {questionError && !questionLoading && (
        <div className="rounded-xl bg-red-50 border border-red-100 px-5 py-4 flex items-center justify-between">
          <p className="text-sm text-red-700">{questionError}</p>
          <button onClick={loadNextQuestion} className="text-xs font-semibold text-red-700 underline ml-4">Retry</button>
        </div>
      )}

      {/* Question card */}
      {currentQuestion && !questionLoading && !evaluation && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-5">
          {/* Tags */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 capitalize">
              {currentQuestion.category.replace(/_/g, ' ')}
            </span>
            {currentQuestion.skill && (
              <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                {currentQuestion.skill}
              </span>
            )}
            {currentQuestion.is_follow_up && (
              <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
                ↳ Follow-up
              </span>
            )}
          </div>

          {/* Question */}
          <p className="text-base font-semibold text-gray-900 leading-relaxed">
            {currentQuestion.question_text}
          </p>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={answerText}
            onChange={e => setAnswerText(e.target.value)}
            rows={6}
            placeholder="Type your answer here…"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all"
          />

          {/* Word count + submit */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">{answerText.trim().split(/\s+/).filter(Boolean).length} words</span>
            <button
              onClick={handleSubmit}
              disabled={!answerText.trim() || submitAnswer.isPending}
              className={cn(
                'flex items-center gap-2 bg-gray-900 text-white font-semibold px-6 py-2.5 rounded-xl text-sm',
                'hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5'
              )}
            >
              {submitAnswer.isPending ? (
                <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Evaluating…</>
              ) : 'Submit Answer →'}
            </button>
          </div>
        </div>
      )}

      {/* Evaluation */}
      {evaluation && (
        <EvalCard evaluation={evaluation} onNext={() => { if (isLastQuestion) router.push(`/interview/report/${sessionId}`); else loadNextQuestion() }} isLast={isLastQuestion} />
      )}
    </div>
  )
}
