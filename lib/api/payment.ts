import apiClient from './client'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PublicPaymentConfig {
  client_key: string
  is_production: boolean
  require_payment: boolean
  default_single_session_price: number
  free_trial_sessions: number
}

export interface PublicPackage {
  id: number
  name: string
  slug: string
  description: string | null
  type: 'session' | 'subscription'
  session_count: number | null
  duration_days: number | null
  price: number
  discounted_price: number | null
  effective_price: number
  is_popular: boolean
  features: string[] | null
}

export interface SubscriptionStatus {
  can_start_interview: boolean
  has_active_subscription: boolean
  subscribed_until: string | null
  credit_sessions: number
  sessions_done: number
  free_trial_remaining: number
}

export interface CheckoutResult {
  transaction_id: number
  order_id: string
  amount: number
  snap_token: string | null
  redirect_url: string | null
  expires_at: string | null
}

export interface UserTransaction {
  id: number
  order_id: string
  package_name: string
  package_type: 'session' | 'subscription' | null
  gross_amount: number
  payment_type: string | null
  transaction_status:
    | 'pending'
    | 'capture'
    | 'settlement'
    | 'deny'
    | 'cancel'
    | 'expire'
    | 'refund'
    | 'chargeback'
  payment_link: string | null
  paid_at: string | null
  expires_at: string | null
  created_at: string
}

export interface TransactionDetail {
  id: number
  order_id: string
  package_name: string
  gross_amount: number
  payment_type: string | null
  transaction_status: UserTransaction['transaction_status']
  fraud_status: string | null
  payment_link: string | null
  paid_at: string | null
  expires_at: string | null
  is_paid: boolean
  is_final: boolean
  created_at: string
}

// ─── API ─────────────────────────────────────────────────────────────────────

export const paymentApi = {
  getPublicConfig: () =>
    apiClient.get<{ data: PublicPaymentConfig }>('/payment/public-config'),

  getPackages: () =>
    apiClient.get<{ data: { single_session_price: number; packages: PublicPackage[] } }>('/payment/packages'),

  getSubscriptionStatus: () =>
    apiClient.get<{ data: SubscriptionStatus }>('/payment/subscription-status'),

  checkoutPackage: (packageId: number) =>
    apiClient.post<{ message: string; data: CheckoutResult }>(`/payment/checkout/package/${packageId}`),

  checkoutSingle: () =>
    apiClient.post<{ message: string; data: CheckoutResult }>('/payment/checkout/single'),

  getMyTransactions: (params?: { page?: number; per_page?: number }) =>
    apiClient.get<{ data: UserTransaction[]; meta: any }>('/payment/transactions', { params }),

  getTransactionStatus: (transactionId: number) =>
    apiClient.get<{ data: TransactionDetail }>(`/payment/transactions/${transactionId}`),
}

declare global {
  interface Window {
    snap?: {
      pay: (snapToken: string, options?: {
        onSuccess?: (result: any) => void
        onPending?: (result: any) => void
        onError?: (result: any) => void
        onClose?: () => void
      }) => void
    }
  }
}

/**
 * Helper: load Midtrans Snap script on demand then call snap.pay()
 *
 * Usage:
 *   const result = await openSnapPopup(snapToken)
 *   // result = 'success' | 'pending' | 'error' | 'close'
 */
export async function openSnapPopup(
  snapToken: string,
  clientKey: string,
  isProduction: boolean,
): Promise<'success' | 'pending' | 'error' | 'close'> {
  if (!window.snap) {
    const scriptUrl = isProduction
      ? 'https://app.midtrans.com/snap/snap.js'
      : 'https://app.sandbox.midtrans.com/snap/snap.js'

    await new Promise<void>((resolve, reject) => {
      if (document.querySelector(`script[src="${scriptUrl}"]`)) return resolve()
      const s = document.createElement('script')
      s.src = scriptUrl
      s.setAttribute('data-client-key', clientKey)
      s.onload = () => resolve()
      s.onerror = () => reject(new Error('Failed to load Midtrans Snap'))
      document.body.appendChild(s)
    })
  }

  return new Promise(resolve => {
    window.snap?.pay(snapToken, {
      onSuccess: () => resolve('success'),
      onPending: () => resolve('pending'),
      onError:   () => resolve('error'),
      onClose:   () => resolve('close'),
    })
  })
}
