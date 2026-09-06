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
}

export interface AuthResponse {
  token: string
  user: User
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
}
