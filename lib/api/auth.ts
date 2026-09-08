import apiClient from './client'
import type { User, ApiResponse } from '@/types'

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  password_confirmation: string
  experience_level?: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface UpdateProfilePayload {
  name: string
  experience_level?: string
}

export interface UpdatePasswordPayload {
  current_password:     string
  new_password:         string
  new_password_confirmation: string
}

export interface ProfileStats {
  total_sessions:      number
  completed_sessions:  number
  average_score:       number | null
  best_score:          number | null
  skills_tracked:      number
}

export const authApi = {
  register: (payload: RegisterPayload) =>
    apiClient.post<ApiResponse<AuthResponse>>('/auth/register', payload),

  login: (payload: LoginPayload) =>
    apiClient.post<ApiResponse<AuthResponse>>('/auth/login', payload),

  logout: () =>
    apiClient.post('/auth/logout'),

  me: () =>
    apiClient.get<ApiResponse<User>>('/auth/me'),

  getProfile: () =>
    apiClient.get<ApiResponse<{ user: User; stats: ProfileStats }>>('/profile'),

  updateProfile: (payload: UpdateProfilePayload) =>
    apiClient.put<ApiResponse<User>>('/profile', payload),

  updatePassword: (payload: UpdatePasswordPayload) =>
    apiClient.put<ApiResponse<{ message: string }>>('/profile/password', payload),
}
