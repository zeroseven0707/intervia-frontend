'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi, type AdminUser } from '@/lib/api/admin'
import { useAuthStore } from '@/lib/store/authStore'
import { cn } from '@/lib/utils/cn'

function RoleBadge({ role }: { role: string }) {
  return (
    <span className={cn(
      'text-xs font-bold px-2 py-0.5 rounded-full border',
      role === 'admin'
        ? 'bg-red-50 text-red-600 border-red-100'
        : 'bg-gray-50 text-gray-500 border-gray-200'
    )}>
      {role}
    </span>
  )
}

function LevelBadge({ level }: { level: string | null }) {
  if (!level) return <span className="text-xs text-gray-300">—</span>
  return (
    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 capitalize">
      {level}
    </span>
  )
}

function EditUserModal({
  user, onClose,
}: {
  user: AdminUser
  onClose: () => void
}) {
  const qc = useQueryClient()
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const [role, setRole] = useState(user.role)
  const [level, setLevel] = useState(user.experience_level ?? '')
  const [error, setError] = useState('')

  const update = useMutation({
    mutationFn: () => adminApi.updateUser(user.id, { name, email, role, experience_level: level || undefined }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); onClose() },
    onError: (e: any) => setError(e?.response?.data?.message ?? 'Gagal menyimpan'),
  })

  const sel = 'w-full rounded-xl border border-gray-200 bg-white text-gray-900 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all appearance-none'
  const inp = 'w-full rounded-xl border border-gray-200 bg-white text-gray-900 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900">Edit User</h2>
            <p className="text-xs text-gray-400 mt-0.5">ID #{user.id}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Nama</label>
            <input value={name} onChange={e => setName(e.target.value)} className={inp} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inp} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Role</label>
              <select value={role} onChange={e => setRole(e.target.value as any)} className={sel}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Level</label>
              <select value={level} onChange={e => setLevel(e.target.value)} className={sel}>
                <option value="">—</option>
                <option value="junior">Junior</option>
                <option value="mid">Mid</option>
                <option value="senior">Senior</option>
                <option value="lead">Lead</option>
              </select>
            </div>
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 py-2.5 hover:bg-gray-50 transition-all">
            Batal
          </button>
          <button
            onClick={() => update.mutate()}
            disabled={update.isPending}
            className="flex-1 rounded-xl bg-gray-900 text-white text-sm font-semibold py-2.5 hover:bg-gray-700 disabled:opacity-50 transition-all"
          >
            {update.isPending ? 'Menyimpan…' : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminUsersPage() {
  const { user: me } = useAuthStore()
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [editUser, setEditUser] = useState<AdminUser | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, search, roleFilter],
    queryFn: () => adminApi.getUsers({ page, search: search || undefined, role: roleFilter || undefined }).then(r => r.data),
  })

  const remove = useMutation({
    mutationFn: (id: number) => adminApi.deleteUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  })

  const users: AdminUser[] = (data as any)?.data ?? []
  const meta = (data as any)?.meta

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Users</h1>
          <p className="text-sm text-gray-500 mt-0.5">{meta?.total ?? 0} total pengguna terdaftar</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          placeholder="Cari nama atau email…"
          className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
        />
        <select
          value={roleFilter}
          onChange={e => { setRoleFilter(e.target.value); setPage(1) }}
          className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all appearance-none cursor-pointer"
        >
          <option value="">Semua role</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-gray-400 animate-pulse">Memuat…</div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-400">Tidak ada user ditemukan.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Level</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Sesi</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Bergabung</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                        style={{ background: u.role === 'admin' ? 'linear-gradient(135deg,#ef4444,#6366f1)' : 'linear-gradient(135deg,#3b82f6,#6366f1)' }}
                      >
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{u.name}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4"><RoleBadge role={u.role} /></td>
                  <td className="px-5 py-4"><LevelBadge level={u.experience_level} /></td>
                  <td className="px-5 py-4 tabular-nums font-semibold text-gray-700">{u.interview_sessions_count}</td>
                  <td className="px-5 py-4 text-gray-400 text-xs">{new Date(u.created_at).toLocaleDateString('id-ID')}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditUser(u)}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors px-2 py-1 rounded-lg hover:bg-blue-50"
                      >
                        Edit
                      </button>
                      {u.id !== me?.id && (
                        <button
                          onClick={() => { if (confirm(`Hapus user "${u.name}"?`)) remove.mutate(u.id) }}
                          disabled={remove.isPending}
                          className="text-xs font-semibold text-red-500 hover:text-red-600 transition-colors px-2 py-1 rounded-lg hover:bg-red-50 disabled:opacity-50"
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-gray-500">
            Halaman {meta.current_page} dari {meta.last_page}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-xs font-semibold"
            >
              ← Prev
            </button>
            <button
              onClick={() => setPage(p => Math.min(meta.last_page, p + 1))}
              disabled={page === meta.last_page}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-xs font-semibold"
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {editUser && <EditUserModal user={editUser} onClose={() => setEditUser(null)} />}
    </div>
  )
}
