import apiClient from './client'
import type { ApiResponse, DashboardData } from '@/types'

export const dashboardApi = {
  get: () => apiClient.get<ApiResponse<DashboardData>>('/dashboard'),
}
