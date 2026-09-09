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
  positions_count?: number
}

export interface AdminSource {
  id: number
  type: 'youtube' | 'article' | 'documentation' | 'pdf'
  title: string
  url: string
  publisher: string | null
  author: string | null
  language: string | null
  external_id: string | null
  metadata?: Record<string, any> | null
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

// ─── Payment Types (Admin) ────────────────────────────────────────────────

export interface AdminPackage {
  id: number
  name: string
  slug: string
  description: string | null
  type: 'session' | 'subscription'
  session_count: number | null
  duration_days: number | null
  price: number
  discounted_price: number | null
  is_active: boolean
  is_popular: boolean
  sort_order: number
  features: string[] | null
  created_at: string
  updated_at: string
}

export type AdminTxStatus =
  | 'pending'
  | 'capture'
  | 'settlement'
  | 'deny'
  | 'cancel'
  | 'expire'
  | 'refund'
  | 'chargeback'

export interface AdminTransaction {
  id: number
  order_id: string
  midtrans_transaction_id: string | null
  user: { id: number; name: string; email: string } | null
  package_id: number | null
  package_name: string
  gross_amount: number
  payment_type: 'credit_card' | 'bank_transfer' | 'echannel' | 'gopay' | 'shopeepay' | 'other' | null
  transaction_status: AdminTxStatus
  fraud_status: string | null
  payment_link: string | null
  paid_at: string | null
  expires_at: string | null
  created_at: string
}

export interface AdminPaymentSettings {
  midtrans: {
    merchant_id: string | null
    client_key: string | null
    server_key_masked: string | null
    has_server_key: boolean
    has_client_key: boolean
    is_production: boolean
  }
  default_single_session_price: number
  require_payment: boolean
  free_trial_sessions: number
}

export interface AdminPaymentSummary {
  revenue: {
    total: number
    paid_count: number
    pending: number
    failed: number
  }
  users: {
    total: number
    paid_users: number
    active_subs: number
    with_credit: number
  }
  sessions: {
    total: number
  }
  recent_transactions: Array<{
    id: number
    order_id: string
    user: { id: number; name: string; email: string } | null
    package: string
    amount: number
    status: string
    created_at: string
    paid_at: string | null
  }>
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
  adjustUserCredit: (id: number, data:
    { type: 'add_sessions'; sessions: number }
    | { type: 'remove_sessions'; sessions: number }
    | { type: 'extend_subscription'; days: number }
    | { type: 'reset' }) =>
    apiClient.put<{ message: string; data: { credit_sessions: number; subscribed_until: string | null } }>(`/admin/payment/users/${id}/adjust-credit`, data),

  // Positions
  getPositions: () =>
    apiClient.get<{ data: AdminPosition[] }>('/admin/positions'),
  createPosition: (data: { name: string; description?: string; is_active?: boolean }) =>
    apiClient.post<{ data: AdminPosition }>('/admin/positions', data),
  updatePosition: (id: number, data: Partial<{ name: string; description: string; is_active: boolean }>) =>
    apiClient.put<{ data: AdminPosition }>(`/admin/positions/${id}`, data),
  deletePosition: (id: number) =>
    apiClient.delete(`/admin/positions/${id}`),
  attachPositionSkill: (positionId: number, data: { skill_id: number; importance: 'required' | 'preferred' }) =>
    apiClient.post<{ data: AdminPosition; message: string }>(`/admin/positions/${positionId}/skills`, data),
  detachPositionSkill: (positionId: number, skillId: number) =>
    apiClient.delete<{ data: AdminPosition; message: string }>(`/admin/positions/${positionId}/skills/${skillId}`),
  syncPositionSkills: (positionId: number, data: { skills: Array<{ skill_id: number; importance: 'required' | 'preferred' }> }) =>
    apiClient.put<{ data: AdminPosition; message: string }>(`/admin/positions/${positionId}/skills`, data),

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
  createSource: (data: { type: string; title: string; url: string; publisher?: string; author?: string; language?: string; external_id?: string }) =>
    apiClient.post<{ data: AdminSource }>('/admin/sources', data),
  updateSource: (id: number, data: Partial<{ title: string; type: string; url: string; publisher: string; author: string; language: string; external_id: string; status: string; metadata: Record<string, any> }>) =>
    apiClient.put<{ data: AdminSource }>(`/admin/sources/${id}`, data),
  deleteSource: (id: number) =>
    apiClient.delete(`/admin/sources/${id}`),

  // Packages (Admin CRUD)
  getPackages: () =>
    apiClient.get<{ data: AdminPackage[] }>('/admin/packages'),
  createPackage: (data: Omit<AdminPackage, 'id' | 'created_at' | 'updated_at'>) =>
    apiClient.post<{ data: AdminPackage; message: string }>('/admin/packages', data),
  getPackage: (id: number) =>
    apiClient.get<{ data: AdminPackage }>(`/admin/packages/${id}`),
  updatePackage: (id: number, data: Partial<Omit<AdminPackage, 'id' | 'created_at' | 'updated_at'>>) =>
    apiClient.put<{ data: AdminPackage; message: string }>(`/admin/packages/${id}`, data),
  deletePackage: (id: number) =>
    apiClient.delete<{ message: string }>(`/admin/packages/${id}`),

  // Payment (Admin)
  getPaymentSettings: () =>
    apiClient.get<{ data: AdminPaymentSettings }>('/admin/payment/settings'),
  updatePaymentSettings: (data: Partial<{
    midtrans_merchant_id: string
    midtrans_server_key: string
    midtrans_client_key: string
    midtrans_production: boolean
    default_single_session_price: number
    require_payment: boolean
    free_trial_sessions: number
  }>) =>
    apiClient.put<{ message: string; data: any }>('/admin/payment/settings', data),
  getPaymentSummary: () =>
    apiClient.get<{ data: AdminPaymentSummary }>('/admin/payment/summary'),
  getTransactions: (params?: { page?: number; per_page?: number; status?: string; search?: string }) =>
    apiClient.get<{ data: AdminTransaction[]; meta: any }>('/admin/payment/transactions', { params }),
  getTransaction: (id: number) =>
    apiClient.get<{ data: any }>(`/admin/payment/transactions/${id}`),
  updateTransactionStatus: (id: number, transaction_status: AdminTxStatus) =>
    apiClient.put<{ message: string; data: any }>(`/admin/payment/transactions/${id}/status`, { transaction_status }),
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
