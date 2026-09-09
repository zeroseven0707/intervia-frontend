'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { adminApi, type AdminStats } from '@/lib/api/admin'
import { cn } from '@/lib/utils/cn'

function StatCard({
  label, value, sub, color, href,
}: {
  label: string
  value: number | string
  sub?: string
  color: string
  href?: string
}) {
  const content = (
    <div className={cn(
      'bg-white border border-gray-100 rounded-2xl p-6 shadow-sm transition-all',
      href && 'hover:shadow-md hover:-translate-y-0.5 cursor-pointer'
    )}>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">{label}</p>
      <p className="text-4xl font-black tabular-nums leading-none mb-1" style={{ color }}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-2">{sub}</p>}
    </div>
  )
  return href ? <Link href={href}>{content}</Link> : content
}

export default function AdminOverviewPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.getStats().then(r => r.data.data),
    refetchInterval: 30_000,
  })

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-40 bg-gray-200 rounded-lg" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="h-32 bg-white rounded-2xl border border-gray-100" />)}
        </div>
      </div>
    )
  }

  const s = data as AdminStats

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Ringkasan data platform Intervia</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users"      value={s?.total_users ?? 0}          color="#3b82f6"  href="/admin/users" sub={`${s?.new_this_month ?? 0} baru bulan ini`} />
        <StatCard label="Admin"            value={s?.admin_count ?? 0}          color="#6366f1"  href="/admin/users" />
        <StatCard label="Total Sesi"       value={s?.total_sessions ?? 0}       color="#10b981"  sub={`${s?.completed_sessions ?? 0} selesai`} />
        <StatCard label="Completion Rate"  value={s?.total_sessions ? `${Math.round((s.completed_sessions / s.total_sessions) * 100)}%` : '—'} color="#f59e0b" />
        <StatCard label="Posisi"           value={s?.total_positions ?? 0}      color="#3b82f6"  href="/admin/positions" />
        <StatCard label="Skills"           value={s?.total_skills ?? 0}         color="#6366f1"  href="/admin/skills" />
        <StatCard label="Pending Sources"  value={s?.pending_sources ?? 0}      color={s?.pending_sources ? '#ef4444' : '#10b981'} href="/admin/sources" sub="Perlu di-review" />
        <StatCard label="Total Sources"    value="→" color="#6b7280"            href="/admin/sources" sub="Lihat semua sumber" />
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Tambah Posisi',  href: '/admin/positions', icon: '⬡', color: '#3b82f6' },
            { label: 'Tambah Skill',   href: '/admin/skills',    icon: '△', color: '#6366f1' },
            { label: 'Review Sources', href: '/admin/sources',   icon: '↗', color: '#f59e0b' },
            { label: 'Kelola Users',   href: '/admin/users',     icon: '◈', color: '#10b981' },
          ].map(a => (
            <Link
              key={a.href}
              href={a.href}
              className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-4 py-3.5 text-sm font-semibold text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all hover:-translate-y-0.5 shadow-sm"
            >
              <span className="text-lg" style={{ color: a.color }}>{a.icon}</span>
              {a.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
