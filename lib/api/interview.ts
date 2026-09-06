import apiClient from './client'
import type {
  ApiResponse,
  PaginatedResponse,
  InterviewSession,
  InterviewQuestion,
  AnswerEvaluation,
  InterviewReport,
  SkillGap,
  AnswerReviewItem,
  JobAnalysis,
  InterviewMode,
  ExperienceLevel,
} from '@/types'

export interface CreateSessionPayload {
  position_id?: number
  job_description?: string
  mode: InterviewMode
  question_count: number
  experience_level?: ExperienceLevel
}

export interface SubmitAnswerPayload {
  question_id: number
  answer_text: string
}

export interface AnalyzeJobPayload {
  job_description: string
  position?: string
  experience_level?: ExperienceLevel
}

export interface SubmitAnswerResponse {
  evaluation: AnswerEvaluation
  is_last_question: boolean
  session_status: string
}

export const interviewApi = {
  analyzejob: (payload: AnalyzeJobPayload) =>
    apiClient.post<ApiResponse<JobAnalysis>>('/analyze-job', payload),

  listSessions: (page = 1) =>
    apiClient.get<PaginatedResponse<InterviewSession>>('/sessions', { params: { page } }),

  createSession: (payload: CreateSessionPayload) =>
    apiClient.post<ApiResponse<InterviewSession>>('/sessions', payload),

  getSession: (id: number) =>
    apiClient.get<ApiResponse<InterviewSession>>(`/sessions/${id}`),

  deleteSession: (id: number) =>
    apiClient.delete(`/sessions/${id}`),

  getNextQuestion: (sessionId: number) =>
    apiClient.get(`/sessions/${sessionId}/next-question`),

  submitAnswer: (sessionId: number, payload: SubmitAnswerPayload) =>
    apiClient.post<ApiResponse<SubmitAnswerResponse>>(`/sessions/${sessionId}/answer`, payload),

  getReport: (sessionId: number) =>
    apiClient.get<ApiResponse<{
      report: InterviewReport
      skill_gaps: SkillGap[]
      answer_review: AnswerReviewItem[]
    }>>(
      `/sessions/${sessionId}/report`
    ),
}
