// ─── Auth ────────────────────────────────────────────────────────────────────

export interface User {
  id: number
  name: string
  email: string
  role: 'user' | 'admin'
  experience_level: ExperienceLevel | null
  target_position_id: number | null
  created_at: string
}

// ─── Enums ───────────────────────────────────────────────────────────────────

export type ExperienceLevel = 'junior' | 'mid' | 'senior' | 'lead'

export type InterviewMode = 'practice' | 'simulation' | 'challenging'

export type InterviewStatus =
  | 'pending'
  | 'analyzing'
  | 'interviewing'
  | 'evaluating'
  | 'completed'
  | 'failed'

export type SkillImportance = 'required' | 'preferred'

export type SkillStatus = 'strong' | 'good' | 'needs_work' | 'weak' | 'starter' | 'curated'

export type SourceType = 'youtube' | 'article' | 'documentation' | 'pdf'

// ─── Position & Skills ───────────────────────────────────────────────────────

export interface Position {
  id: number
  name: string
  slug: string
  description: string | null
}

export interface Skill {
  id: number
  name: string
  slug: string
  category: string
}

export interface DetectedSkill {
  name: string
  importance: SkillImportance
}

// ─── Job Analysis ────────────────────────────────────────────────────────────

export interface JobAnalysis {
  position: string
  seniority: ExperienceLevel
  responsibilities: string[]
  skills: DetectedSkill[]
  categories: string[]
}

// ─── Interview ───────────────────────────────────────────────────────────────

export interface InterviewSession {
  id: number
  position_id: number | null
  position: Position | null
  job_description: string | null
  job_analysis: JobAnalysis | null
  mode: InterviewMode
  difficulty: string
  question_count: number
  status: InterviewStatus
  overall_score: number | null
  started_at: string | null
  completed_at: string | null
  created_at: string
}

export interface InterviewQuestion {
  id: number
  session_id: number
  sequence: number
  question_text: string
  category: string
  difficulty: string
  skill: string | null
  is_follow_up: boolean
}

export interface AnswerEvaluation {
  overall_score: number
  relevance_score: number
  knowledge_score: number
  clarity_score: number
  completeness_score: number
  reasoning_score: number
  strengths: string[]
  weaknesses: string[]
  missing_points: string[]
  improvement_advice: string
  example_answer: string
}

// ─── Report ──────────────────────────────────────────────────────────────────

export interface AnswerReviewItem {
  sequence: number
  question: string
  category: string
  skill: string | null
  answer: string | null
  evaluation: {
    overall_score: number
    strengths: string[]
    weaknesses: string[]
    missing_points: string[]
    improvement_advice: string
    example_answer: string
  } | null
}

export interface InterviewReport {
  id: number
  session_id: number
  overall_score: number
  technical_score: number
  communication_score: number
  problem_solving_score: number
  answer_structure_score: number
  summary: string
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
  created_at: string
}

export interface SkillGap {
  skill: string
  score: number
  status: SkillStatus
  count: number
}

// ─── Learning ────────────────────────────────────────────────────────────────

export interface LearningSource {
  id: number
  type: SourceType | string
  title?: string
  url: string
  publisher: string | null
  author: string | null
  language?: string | null
  status?: string | null
}

export interface LearningMaterial {
  id: number
  source: LearningSource | null
  topic?: { id: number; name: string; slug: string; category: string | null } | null
  title: string
  summary: string | null
  duration_seconds: number | null
  difficulty: string | null
  published_at: string | null
}

export interface LearningRecommendation {
  skill: string
  score: number | null
  status: SkillStatus | 'starter' | 'curated'
  materials: LearningMaterial[]
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export interface DashboardSession {
  id: number
  position: string
  mode: InterviewMode
  status: InterviewStatus
  overall_score: number | null
  created_at: string
}

export interface DashboardData {
  readiness_score: number | null
  latest_score:    number | null
  previous_score:  number | null
  score_trend:     number | null
  weak_skills:     SkillGap[]
  recent_sessions: DashboardSession[]
  recommendations: LearningRecommendation[]
}

// ─── Profile ─────────────────────────────────────────────────────────────────

export interface ProfileStats {
  total_sessions:     number
  completed_sessions: number
  average_score:      number | null
  best_score:         number | null
  skills_tracked:     number
}

// ─── API Responses ───────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}
