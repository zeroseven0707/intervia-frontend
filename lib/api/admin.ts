import apiClient from './client'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AdminUser {
  id: number
  name: string
  email: string
  role: 'user' | 'admin'
  experience_level: string | null
  interview_sessions_count: number
  created_at: string
}

export interface AdminPosition {
  id: number
  name: string
  slug: string
  description: string | null
  is_active: boolean
  skills_count: number
}

export interface AdminSkill {
  id: number
  name: string
  slug: string
  category: string | null
  description: string | null
  is_active: boolean
}

export interface AdminSource {
  id: number
  type: 'youtube' | 'article' | 'documentation' | 'pdf'
  title: string
  url: string
  publisher: string | null
  author: string | null
  language: string | null
  status: 'pending' | 'approved' | 'rejected' | 'archived'
  created_at: string
}

export interface AdminStats {
  total_users: number
  admin_count: number
  new_this_month: number
  total_sessions: number
  completed_sessions: number
  total_positions: number
  total_skills: number
  pending_sources: number
}

// ─── API ─────────────────────────────────────────────────────────────────────

export const adminApi = {
  // Stats
  getStats: () =>
    apiClient.get<{ data: AdminStats }>('/admin/stats'),

  // Users
  getUsers: (params?: { page?: number; search?: string; role?: string }) =>
    apiClient.get<{ data: AdminUser[]; meta: any }>('/admin/users', { params }),
  getUser: (id: number) =>
    apiClient.get<{ data: AdminUser }>(`/admin/users/${id}`),
  updateUser: (id: number, data: Partial<Pick<AdminUser, 'name' | 'email' | 'role' | 'experience_level'>>) =>
    apiClient.put<{ data: AdminUser }>(`/admin/users/${id}`, data),
  deleteUser: (id: number) =>
    apiClient.delete(`/admin/users/${id}`),

  // Positions
  getPositions: () =>
    apiClient.get<{ data: AdminPosition[] }>('/admin/positions'),
  createPosition: (data: { name: string; description?: string; is_active?: boolean }) =>
    apiClient.post<{ data: AdminPosition }>('/admin/positions', data),
  updatePosition: (id: number, data: Partial<{ name: string; description: string; is_active: boolean }>) =>
    apiClient.put<{ data: AdminPosition }>(`/admin/positions/${id}`, data),
  deletePosition: (id: number) =>
    apiClient.delete(`/admin/positions/${id}`),

  // Skills
  getSkills: () =>
    apiClient.get<{ data: AdminSkill[] }>('/admin/skills'),
  createSkill: (data: { name: string; category?: string; description?: string; is_active?: boolean }) =>
    apiClient.post<{ data: AdminSkill }>('/admin/skills', data),
  updateSkill: (id: number, data: Partial<{ name: string; category: string; description: string; is_active: boolean }>) =>
    apiClient.put<{ data: AdminSkill }>(`/admin/skills/${id}`, data),
  deleteSkill: (id: number) =>
    apiClient.delete(`/admin/skills/${id}`),

  // Sources
  getSources: (params?: { page?: number }) =>
    apiClient.get<{ data: AdminSource[]; meta: any }>('/admin/sources', { params }),
  createSource: (data: { type: string; title: string; url: string; publisher?: string; author?: string; language?: string }) =>
    apiClient.post<{ data: AdminSource }>('/admin/sources', data),
  updateSource: (id: number, data: Partial<{ title: string; status: string; author: string }>) =>
    apiClient.put<{ data: AdminSource }>(`/admin/sources/${id}`, data),
  deleteSource: (id: number) =>
    apiClient.delete(`/admin/sources/${id}`),
}

export interface AiProviderConfig {
  has_key: boolean
  default_model: string
  evaluation_model: string
}

export interface AiConfig {
  primary_provider: string
  fallback_provider: string
  max_retries: number
  max_tokens: number
  timeout_seconds: number
  providers: {
    openai: AiProviderConfig
    gemini: AiProviderConfig
  }
  task_models: Record<string, string>
}

export interface AiPromptTemplate {
  id: number
  name: string
  type: string
  version: string
  system_prompt: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export const adminAiApi = {
  // Config
  getConfig: () =>
    apiClient.get<{ data: AiConfig }>('/admin/ai/config'),
  updateConfig: (data: Record<string, any>) =>
    apiClient.put<{ message: string }>('/admin/ai/config', data),

  // Prompt Templates
  getPrompts: () =>
    apiClient.get<{ data: AiPromptTemplate[] }>('/admin/ai/prompts'),
  createPrompt: (data: { name: string; type: string; version: string; system_prompt: string; is_active?: boolean }) =>
    apiClient.post<{ data: AiPromptTemplate }>('/admin/ai/prompts', data),
  updatePrompt: (id: number, data: Partial<{ name: string; version: string; system_prompt: string; is_active: boolean }>) =>
    apiClient.put<{ data: AiPromptTemplate }>(`/admin/ai/prompts/${id}`, data),
  deletePrompt: (id: number) =>
    apiClient.delete(`/admin/ai/prompts/${id}`),
}
