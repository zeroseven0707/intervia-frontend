import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { interviewApi, type CreateSessionPayload, type AnalyzeJobPayload, type SubmitAnswerResponse } from '@/lib/api/interview'
import { dashboardApi } from '@/lib/api/dashboard'

// ── Dashboard ─────────────────────────────────────────────────────────────────

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.get().then((r) => r.data.data),
    staleTime: 30 * 1000,
  })
}

// ── Sessions ──────────────────────────────────────────────────────────────────

export function useSessions(page = 1) {
  return useQuery({
    queryKey: ['sessions', page],
    queryFn: () => interviewApi.listSessions(page).then((r) => r.data),
  })
}

export function useSession(id: number) {
  return useQuery({
    queryKey: ['session', id],
    queryFn: () => interviewApi.getSession(id).then((r) => r.data.data),
    enabled: !!id,
  })
}

export function useCreateSession() {
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateSessionPayload) => interviewApi.createSession(payload),
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      router.push(`/interview/${data.data.id}`)
    },
  })
}

// ── Job Analyzer ──────────────────────────────────────────────────────────────

export function useAnalyzeJob() {
  return useMutation({
    mutationFn: (payload: AnalyzeJobPayload) =>
      interviewApi.analyzejob(payload).then((r) => r.data.data),
  })
}

// ── Interview Flow ────────────────────────────────────────────────────────────

export function useNextQuestion(sessionId: number) {
  return useQuery({
    queryKey: ['next-question', sessionId],
    queryFn: () => interviewApi.getNextQuestion(sessionId).then((r) => r.data),
    enabled: false, // manual trigger only
    retry: false,
  })
}

export function useSubmitAnswer(sessionId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: { question_id: number; answer_text: string }) =>
      interviewApi.submitAnswer(sessionId, payload).then((r) => r.data.data),
    onSuccess: (data: SubmitAnswerResponse) => {
      if (data.is_last_question) {
        queryClient.invalidateQueries({ queryKey: ['session', sessionId] })
      }
    },
  })
}

// ── Report ────────────────────────────────────────────────────────────────────

export function useReport(sessionId: number) {
  return useQuery({
    queryKey: ['report', sessionId],
    queryFn: () => interviewApi.getReport(sessionId).then((r) => r.data.data),
    enabled: !!sessionId,
  })
}
