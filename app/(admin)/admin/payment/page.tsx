'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  adminApi,
  type AdminPaymentSummary,
  type AdminPaymentSettings,
  type AdminTransaction,
  type AdminTxStatus,
} from '@/lib/api/admin'
import { cn, formatRupiah } from '@/lib/utils/cn'

const STATUS_BADGE: Record<AdminTxStatus | string, string> = {
  pending:    'bg-yellow-50 text-yellow-700 border-yellow-200',
  capture:    'bg-emerald-50 text-emerald-700 border-emerald-200',
  settlement: 'bg-green-50 text-green-700 border-green-200',
  deny:       'bg-red-50 text-red-700 border-red-200',
  cancel:     'bg-gray-50 text-gray-600 border-gray-200',
  expire:     'bg-orange-50 text-orange-700 border-orange-200',
  refund:     'bg-purple-50 text-purple-700 border-purple-200',
  chargeback: 'bg-red-100 text-red-800 border-red-300',
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'PENDING',
  capture: 'PAID',
  settlement: 'SETTLED',
  deny: 'DENY',
  cancel: 'CANCEL',
  expire: 'EXPIRED',
  refund: 'REFUND',
  chargeback: 'CHARGEBACK',
}

function SectionCard({ title, children, subtitle, action }: {
  title: string; subtitle?: string; action?: React.ReactNode; children: React.ReactNode
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-50 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-gray-900">{title}</h3>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  )
}

export default function AdminPaymentPage() {
  const qc = useQueryClient()
  const [tab, setTab] = useState<'settings' | 'transactions' | 'adjust'>('settings')
  const [txPage, setTxPage] = useState(1)
  const [txFilter, setTxFilter] = useState<'' | AdminTxStatus>('')
  const [txSearch, setTxSearch] = useState('')
  const [adjustError, setAdjustError] = useState('')
  const [adjustResult, setAdjustResult] = useState('')
  const [adjustUserId, setAdjustUserId] = useState<string>('')
  const [adjustType, setAdjustType] = useState<'add_sessions' | 'remove_sessions' | 'extend_subscription' | 'reset'>('add_sessions')
  const [adjustSessions, setAdjustSessions] = useState('5')
  const [adjustDays, setAdjustDays] = useState('30')
  const [settingsMsg, setSettingsMsg] = useState('')

  const inp = 'w-full rounded-xl border border-gray-200 bg-white text-gray-900 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all'
  const sel = cn(inp, 'appearance-none cursor-pointer')
  const lbl = 'block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide'

  // ── Queries ────────────────────────────────────────────────────────
  const summary = useQuery({
    queryKey: ['admin-payment-summary'],
    queryFn: () => adminApi.getPaymentSummary().then(r => r.data.data as AdminPaymentSummary),
    staleTime: 1000 * 30,
  })

  const settings = useQuery({
    queryKey: ['admin-payment-settings'],
    queryFn: () => adminApi.getPaymentSettings().then(r => r.data.data as AdminPaymentSettings),
  })

  const transactions = useQuery({
    queryKey: ['admin-payment-transactions', txPage, txFilter, txSearch],
    queryFn: () => adminApi.getTransactions({
      page: txPage, per_page: 10,
      status: txFilter || undefined,
      search: txSearch.trim() || undefined,
    }).then(r => ({
      list: (r.data as any).data as AdminTransaction[],
      meta: (r.data as any).meta as { current_page: number; last_page: number; per_page: number; total: number },
    })),
  })

  // ── Mutations ──────────────────────────────────────────────────────
  const [formS, setFormS] = useState<Partial<AdminPaymentSettings> | null>(null)
  if (formS == null && settings.data) {
    setFormS({
      midtrans: { ...settings.data.midtrans },
      default_single_session_price: settings.data.default_single_session_price,
      require_payment: settings.data.require_payment,
      free_trial_sessions: settings.data.free_trial_sessions,
    })
  }

  const saveSettings = useMutation({
    mutationFn: (payload: any) => adminApi.updatePaymentSettings(payload),
    onSuccess: () => { setSettingsMsg('✓ Pengaturan tersimpan.'); qc.invalidateQueries({ queryKey: ['admin-payment-settings'] }); setTimeout(() => setSettingsMsg(''), 3000) },
    onError: (e: any) => setSettingsMsg(`❌ ${e?.response?.data?.message ?? 'Gagal menyimpan'}`),
  })

  const changeTxStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: AdminTxStatus }) =>
      adminApi.updateTransactionStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-payment-transactions', 'admin-payment-summary'] }),
  })

  const adjustCredit = useMutation({
    mutationFn: () => {
      const id = Number(adjustUserId)
      let payload: any
      switch (adjustType) {
        case 'reset': payload = { type: 'reset' as const }; break
        case 'extend_subscription': payload = { type: 'extend_subscription' as const, days: Number(adjustDays) }; break
        case 'add_sessions': payload = { type: 'add_sessions' as const, sessions: Number(adjustSessions) }; break
        case 'remove_sessions': payload = { type: 'remove_sessions' as const, sessions: Number(adjustSessions) }; break
      }
      return adminApi.adjustUserCredit(id, payload as any)
    },
    onSuccess: (resp) => {
      const d = (resp.data as any).data
      setAdjustResult(`✓ Selesai. Credit sessions=${d.credit_sessions}, Active until=${d.subscribed_until ?? '—'}`)
      setAdjustError('')
      qc.invalidateQueries({ queryKey: ['admin-payment-summary', 'admin-users'] })
      setTimeout(() => setAdjustResult(''), 5000)
    },
    onError: (e: any) => {
      setAdjustError(e?.response?.data?.message ?? 'Gagal')
      setAdjustResult('')
    },
  })

  // ── Stats ──────────────────────────────────────────────────────────
  const rev = summary.data?.revenue
  const users = summary.data?.users

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Payment Manager</h1>
          <p className="text-sm text-gray-500 mt-0.5">Atur Midtrans, paket harga, transaksi &amp; credit user</p>
        </div>
      </div>

      {/* ── 4 Summary Cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-5 text-white shadow-sm shadow-emerald-200">
          <p className="text-[11px] font-bold uppercase tracking-widest opacity-80">Total Revenue</p>
          <p className="font-black text-2xl mt-2 tracking-tight">
            {summary.isLoading ? '…' : formatRupiah(rev?.total ?? 0)}
          </p>
          <div className="mt-3 flex items-center gap-3 text-[11px] font-semibold opacity-90">
            <span>{rev?.paid_count ?? 0} Paid</span>
            <span className="opacity-60">·</span>
            <span className="text-yellow-100">{rev?.pending ?? 0} Pending</span>
            <span className="opacity-60">·</span>
            <span>{rev?.failed ?? 0} Gagal</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-5 text-white shadow-sm shadow-blue-200">
          <p className="text-[11px] font-bold uppercase tracking-widest opacity-80">Total Users</p>
          <p className="font-black text-2xl mt-2 tracking-tight">{users?.total ?? 0}</p>
          <div className="mt-3 flex items-center gap-3 text-[11px] font-semibold opacity-90">
            <span>{users?.paid_users ?? 0} Paid</span>
            <span className="opacity-60">·</span>
            <span>{users?.with_credit ?? 0} Punya Credit</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-fuchsia-600 rounded-2xl p-5 text-white shadow-sm shadow-purple-200">
          <p className="text-[11px] font-bold uppercase tracking-widest opacity-80">Active Subs</p>
          <p className="font-black text-2xl mt-2 tracking-tight">{users?.active_subs ?? 0}</p>
          <p className="text-[11px] font-semibold mt-3 opacity-90">Sessions diselesaikan: {summary.data?.sessions.total ?? 0}</p>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-5 text-white shadow-sm shadow-amber-200">
          <p className="text-[11px] font-bold uppercase tracking-widest opacity-80">Per-Session Price</p>
          <p className="font-black text-2xl mt-2 tracking-tight">
            {settings.isLoading ? '…' : formatRupiah(formS?.default_single_session_price ?? 3000)}
          </p>
          <div className="mt-3 flex items-center gap-3 text-[11px] font-semibold opacity-90">
            <span>{formS?.require_payment ? 'Payment DIPERLUKAN' : 'Payment DISABLED'}</span>
          </div>
        </div>
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 border-b border-gray-100">
        {[
          { k: 'settings', l: '⚙ Konfigurasi Midtrans &amp; Harga' },
          { k: 'transactions', l: '💳 Semua Transaksi' },
          { k: 'adjust', l: '🎚 Adjust Credit User' },
        ].map((t) => (
          <button
            key={t.k}
            onClick={() => setTab(t.k as any)}
            dangerouslySetInnerHTML={{ __html: t.l }}
            className={cn(
              '-mb-px px-4 py-2.5 text-sm font-semibold border-b-2 transition-all',
              tab === t.k
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            )}
          />
        ))}
      </div>

      {/* ── TAB 1: SETTINGS ──────────────────────────────────────── */}
      {tab === 'settings' && formS && (
        <SectionCard
          title="Konfigurasi Pembayaran"
          subtitle="Midtrans credentials &amp; global settings. Server key baru akan menimpa di .env otomatis."
          action={settingsMsg && (
            <span className={cn(
              'text-xs font-bold px-3 py-1 rounded-full',
              settingsMsg.startsWith('✓')
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                : 'bg-red-50 text-red-700 border border-red-100'
            )}>
              {settingsMsg}
            </span>
          )}
        >
          {/* Midtrans */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Merchant ID</label>
              <input
                value={formS.midtrans?.merchant_id ?? ''}
                onChange={e => setFormS(s => s && { ...s, midtrans: { ...s.midtrans!, merchant_id: e.target.value } })}
                placeholder="Mxxx-xxx-xxx"
                className={inp}
              />
            </div>
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={!!formS.midtrans?.is_production}
                  onChange={e => setFormS(s => s && { ...s, midtrans: { ...s.midtrans!, is_production: e.target.checked } })}
                  className="w-4 h-4 rounded border-gray-300 accent-red-500"
                />
                <span>Production Mode (gunakan key PRODUKSI Midtrans, bukan sandbox)</span>
              </label>
              {formS.midtrans?.is_production && (
                <p className="text-[11px] text-red-600 mt-1 font-semibold">⚠ PASTIKAN Merchant ID, Client Key &amp; Server Key di atas adalah key PRODUCTION (bukan sandbox)! Transaksi REAL akan diproses.</p>
              )}
            </div>

            <div>
              <label className={lbl}>
                Client Key
                {formS.midtrans?.has_client_key && <span className="text-[10px] text-emerald-600 ml-1 font-normal">(sudah tersimpan)</span>}
              </label>
              <input
                value={(formS as any).midtrans_client_key ?? ''}
                onChange={e => setFormS(s => ({ ...s!, midtrans_client_key: e.target.value }) as any)}
                placeholder={formS.midtrans?.client_key ?? 'SB-Mid-client-xxxx'}
                className={inp}
              />
              <p className="text-[10px] text-gray-400 mt-1">Kosongkan jika tidak ingin mengubah.</p>
            </div>
            <div>
              <label className={lbl}>
                Server Key
                {formS.midtrans?.has_server_key && (
                  <span className="text-[10px] text-emerald-600 ml-1 font-normal">(tersimpan: {formS.midtrans?.server_key_masked})</span>
                )}
              </label>
              <input
                type="password"
                value={(formS as any).midtrans_server_key ?? ''}
                onChange={e => setFormS(s => ({ ...s!, midtrans_server_key: e.target.value }) as any)}
                placeholder="SB-Mid-server-xxxxxxx / Mid-server-prod-xxxxxx"
                className={inp}
              />
              <p className="text-[10px] text-gray-400 mt-1">Kosongkan jika tidak ingin mengubah.</p>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4" />

          {/* Global Price */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={lbl}>Harga Single-Session (Rp)</label>
              <input
                type="number" min={1000}
                value={formS.default_single_session_price ?? 3000}
                onChange={e => setFormS(s => ({ ...s!, default_single_session_price: Number(e.target.value) }))}
                className={inp}
              />
              <p className="text-[10px] text-gray-400 mt-1">Harga sekali interview tanpa paket.</p>
            </div>
            <div>
              <label className={lbl}>Free Trial Sessions</label>
              <input
                type="number" min={0}
                value={formS.free_trial_sessions ?? 0}
                onChange={e => setFormS(s => ({ ...s!, free_trial_sessions: Number(e.target.value) }))}
                className={inp}
              />
              <p className="text-[10px] text-gray-400 mt-1">Gratis N sesi pertama untuk user baru.</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50">
              <input
                type="checkbox" id="req_pay"
                checked={!!formS.require_payment}
                onChange={e => setFormS(s => ({ ...s!, require_payment: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-300 accent-gray-900"
              />
              <label htmlFor="req_pay" className="text-xs font-semibold text-gray-700 cursor-pointer select-none leading-tight">
                Wajib Bayar sebelum Interview
                <p className="text-[10px] font-normal text-gray-400 mt-0.5">Jika OFF: semua user gratis tanpa batas.</p>
              </label>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => {
                // Only include fields that actually changed
                const payload: any = {
                  default_single_session_price: formS.default_single_session_price,
                  free_trial_sessions: formS.free_trial_sessions,
                  require_payment: formS.require_payment,
                  midtrans_merchant_id: formS.midtrans?.merchant_id ?? null,
                  midtrans_production: formS.midtrans?.is_production ?? false,
                }
                if ((formS as any).midtrans_client_key) payload.midtrans_client_key = (formS as any).midtrans_client_key
                if ((formS as any).midtrans_server_key) payload.midtrans_server_key = (formS as any).midtrans_server_key
                saveSettings.mutate(payload)
              }}
              disabled={saveSettings.isPending || settings.isLoading}
              className="rounded-xl bg-gray-900 text-white px-5 py-2.5 text-sm font-semibold hover:bg-gray-700 disabled:opacity-50 transition-all"
            >
              {saveSettings.isPending ? 'Menyimpan…' : '💾 Simpan Pengaturan'}
            </button>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">Midtrans Webhook URL</p>
            <p className="font-mono text-xs text-gray-600 break-all bg-white px-3 py-2 rounded-lg border border-gray-100">
              POST {process.env.NEXT_PUBLIC_API_URL ?? 'https://YOUR-BACKEND'}/api/v1/payment/midtrans/notification
            </p>
            <p className="text-[11px] text-gray-500 mt-1">Setting URL ini di Dashboard Midtrans → Settings → Configuration.</p>
          </div>
        </SectionCard>
      )}

      {/* ── TAB 2: TRANSACTIONS ──────────────────────────────────── */}
      {tab === 'transactions' && (
        <SectionCard
          title="Semua Transaksi"
          subtitle={`${transactions.data?.meta.total ?? 0} total transaksi`}
          action={
            <div className="flex items-center gap-2">
              <input
                value={txSearch}
                onChange={e => { setTxSearch(e.target.value); setTxPage(1) }}
                placeholder="Cari name/email/order_id…"
                className="w-56 rounded-xl border border-gray-200 bg-white text-xs px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
              <select
                value={txFilter}
                onChange={e => { setTxFilter(e.target.value as any); setTxPage(1) }}
                className={cn('rounded-xl border border-gray-200 bg-white text-xs px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900 appearance-none cursor-pointer')}
              >
                <option value="">Semua Status</option>
                <option value="pending">Pending</option>
                <option value="settlement">Settlement</option>
                <option value="capture">Capture (Paid)</option>
                <option value="expire">Expired</option>
                <option value="cancel">Cancel</option>
                <option value="deny">Deny</option>
                <option value="refund">Refund</option>
              </select>
            </div>
          }
        >
          {transactions.isLoading ? (
            <p className="p-8 text-center text-sm text-gray-400 animate-pulse">Memuat transaksi…</p>
          ) : transactions.data?.list.length === 0 ? (
            <p className="p-8 text-center text-sm text-gray-400">Tidak ada transaksi.</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left px-3 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Order ID</th>
                      <th className="text-left px-3 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">User</th>
                      <th className="text-left px-3 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Paket</th>
                      <th className="text-left px-3 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="text-left px-3 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Metode</th>
                      <th className="text-left px-3 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="text-left px-3 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Tgl</th>
                      <th className="px-3 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {transactions.data!.list.map(tx => (
                      <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-3 py-3">
                          <div className="font-mono text-[11px] font-bold text-gray-900">{tx.order_id}</div>
                          {tx.midtrans_transaction_id && (
                            <div className="text-[10px] text-gray-400 truncate max-w-[140px]">{tx.midtrans_transaction_id}</div>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          {tx.user ? (
                            <>
                              <div className="font-semibold text-gray-900 text-xs truncate max-w-[150px]">{tx.user.name}</div>
                              <div className="text-[10px] text-gray-500 truncate max-w-[150px]">{tx.user.email}</div>
                            </>
                          ) : (
                            <span className="text-[11px] text-gray-400 italic">Guest</span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-xs text-gray-700 truncate max-w-[140px]">{tx.package_name}</td>
                        <td className="px-3 py-3 font-bold text-gray-900 text-xs whitespace-nowrap">{formatRupiah(tx.gross_amount)}</td>
                        <td className="px-3 py-3 text-xs text-gray-500">{tx.payment_type ?? '—'}</td>
                        <td className="px-3 py-3">
                          <span className={cn(
                            'text-[10px] font-bold px-2 py-0.5 rounded-full border inline-flex items-center uppercase tracking-wider',
                            STATUS_BADGE[tx.transaction_status] ?? STATUS_BADGE.pending
                          )}>
                            {STATUS_LABEL[tx.transaction_status] ?? tx.transaction_status}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-[11px] text-gray-400 whitespace-nowrap">
                          {tx.paid_at
                            ? <>Paid<br /><span className="text-gray-300">{new Date(tx.paid_at).toLocaleDateString('id-ID')}</span></>
                            : new Date(tx.created_at).toLocaleDateString('id-ID')}
                        </td>
                        <td className="px-3 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {tx.payment_link && (
                              <a href={tx.payment_link} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-blue-600 hover:bg-blue-50 px-2 py-1 rounded-lg transition-colors">
                                Bayar ↗
                              </a>
                            )}
                            <select
                              value={tx.transaction_status}
                              onChange={e => {
                                if (confirm(`Ubah status transaksi ${tx.order_id} ke "${e.target.value}"?`)) {
                                  changeTxStatus.mutate({ id: tx.id, status: e.target.value as AdminTxStatus })
                                } else {
                                  e.target.value = tx.transaction_status
                                }
                              }}
                              className="text-[10px] font-bold rounded-lg border border-gray-200 bg-white px-2 py-1 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-900"
                              title="Manual update status (untuk fulfillment test)"
                            >
                              <option value="pending">pending</option>
                              <option value="capture">capture</option>
                              <option value="settlement">settlement</option>
                              <option value="cancel">cancel</option>
                              <option value="deny">deny</option>
                              <option value="expire">expire</option>
                              <option value="refund">refund</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {transactions.data!.meta.last_page > 1 && (
                <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-50">
                  <p className="text-[11px] text-gray-500">
                    Halaman {transactions.data!.meta.current_page} dari {transactions.data!.meta.last_page} · {transactions.data!.meta.total} total
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setTxPage(p => Math.max(1, p - 1))}
                      disabled={txPage === 1 || transactions.isFetching}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >← Prev</button>
                    <button
                      onClick={() => setTxPage(p => Math.min(transactions.data!.meta.last_page, p + 1))}
                      disabled={txPage === transactions.data!.meta.last_page || transactions.isFetching}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >Next →</button>
                  </div>
                </div>
              )}
            </>
          )}
        </SectionCard>
      )}

      {/* ── TAB 3: ADJUST CREDIT ─────────────────────────────────── */}
      {tab === 'adjust' && (
        <SectionCard
          title="Manual Adjust Credit / Subscription User"
          subtitle="Tambah / hapus sesi, perpanjang langganan, atau reset credit user demo tertentu."
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-4">
              <label className={lbl}>User ID</label>
              <input
                type="number" min={1}
                value={adjustUserId}
                onChange={e => { setAdjustUserId(e.target.value); setAdjustError(''); setAdjustResult('') }}
                placeholder="contoh: 2 = user demo"
                className={inp}
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Tips: User demo ID 1 = Admin, ID 2 = user@intervia.app. Lihat <a className="text-blue-600 font-semibold" href="/admin/users">Users page</a>.
              </p>
            </div>
            <div className="md:col-span-4">
              <label className={lbl}>Tipe Adjust</label>
              <select
                value={adjustType}
                onChange={e => setAdjustType(e.target.value as any)}
                className={sel}
              >
                <option value="add_sessions">➕ Tambah Session Credit</option>
                <option value="remove_sessions">➖ Kurangi Session Credit</option>
                <option value="extend_subscription">♾ Perpanjang Unlimited (Hari)</option>
                <option value="reset">🗑 Reset (0 credit + non-aktifkan subs)</option>
              </select>
            </div>
            {(adjustType === 'add_sessions' || adjustType === 'remove_sessions') && (
              <div className="md:col-span-4">
                <label className={lbl}>Jumlah Sesi</label>
                <input type="number" min={1} value={adjustSessions} onChange={e => setAdjustSessions(e.target.value)} className={inp} />
              </div>
            )}
            {adjustType === 'extend_subscription' && (
              <div className="md:col-span-4">
                <label className={lbl}>Durasi (Hari)</label>
                <input type="number" min={1} value={adjustDays} onChange={e => setAdjustDays(e.target.value)} className={inp} />
              </div>
            )}
            {adjustType === 'reset' && (
              <div className="md:col-span-4 flex items-end pb-1">
                <p className="text-[11px] text-red-600 font-semibold">
                  ⚠ User yang di-reset akan kembali 0 credit dan tidak punya unlimited access.
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-50">
            <div className="space-y-1 min-h-[32px]">
              {adjustResult && <p className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-lg inline-block">{adjustResult}</p>}
              {adjustError && <p className="text-xs font-bold text-red-600 bg-red-50 border border-red-100 px-3 py-1.5 rounded-lg inline-block">❌ {adjustError}</p>}
            </div>
            <button
              onClick={() => adjustCredit.mutate()}
              disabled={adjustCredit.isPending || !adjustUserId || isNaN(Number(adjustUserId))}
              className="rounded-xl bg-gray-900 text-white px-5 py-2.5 text-sm font-semibold hover:bg-gray-700 disabled:opacity-50 transition-all"
            >
              {adjustCredit.isPending ? 'Processing…' : '⚡ Jalankan Adjust'}
            </button>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-2">Untuk Demo Cepat:</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
              <button onClick={() => { setAdjustUserId('2'); setAdjustType('add_sessions'); setAdjustSessions('10') }}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 hover:border-gray-900 hover:shadow-sm transition-all text-left">
                <p className="font-bold text-gray-900">🎁 User 2 +10 Sesi</p>
                <p className="text-gray-400">user@intervia.app</p>
              </button>
              <button onClick={() => { setAdjustUserId('2'); setAdjustType('extend_subscription'); setAdjustDays('30') }}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 hover:border-gray-900 hover:shadow-sm transition-all text-left">
                <p className="font-bold text-gray-900">♾ User 2 Subs 30 Hari</p>
                <p className="text-gray-400">Unlimited access sebulan</p>
              </button>
              <button onClick={() => { setAdjustUserId('2'); setAdjustType('reset') }}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 hover:border-red-300 hover:bg-red-50 transition-all text-left">
                <p className="font-bold text-gray-900">🗑 Reset User 2</p>
                <p className="text-gray-400">Kembalikan ke nol</p>
              </button>
            </div>
          </div>
        </SectionCard>
      )}
    </div>
  )
}
