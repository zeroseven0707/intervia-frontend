'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi, type AdminSource } from '@/lib/api/admin'
import { cn } from '@/lib/utils/cn'

const TYPE_ICON: Record<string, string> = {
  youtube:       '▶',
  article:       '◎',
  documentation: '◈',
  pdf:           '△',
}

const TYPE_COLOR: Record<string, string> = {
  youtube:       'bg-red-50 text-red-600 border-red-100',
  article:       'bg-blue-50 text-blue-600 border-blue-100',
  documentation: 'bg-purple-50 text-purple-600 border-purple-100',
  pdf:           'bg-orange-50 text-orange-600 border-orange-100',
}

const STATUS_COLOR: Record<string, string> = {
  pending:  'bg-yellow-50 text-yellow-700 border-yellow-100',
  approved: 'bg-green-50 text-green-600 border-green-100',
  rejected: 'bg-red-50 text-red-600 border-red-100',
  archived: 'bg-gray-50 text-gray-400 border-gray-200',
}

function SourceModal({ initial, onClose }: { initial?: AdminSource; onClose: () => void }) {
  const qc = useQueryClient()
  const isEdit = !!initial
  const [type, setType]         = useState(initial?.type ?? 'article')
  const [title, setTitle]       = useState(initial?.title ?? '')
  const [url, setUrl]           = useState(initial?.url ?? '')
  const [publisher, setPublisher] = useState(initial?.publisher ?? '')
  const [author, setAuthor]     = useState(initial?.author ?? '')
  const [language, setLanguage] = useState(initial?.language ?? 'id')
  const [status, setStatus]     = useState(initial?.status ?? 'pending')
  const [error, setError]       = useState('')

  const save = useMutation({
    mutationFn: () => isEdit
      ? adminApi.updateSource(initial!.id, { title, status, author: author || undefined })
      : adminApi.createSource({ type, title, url, publisher: publisher || undefined, author: author || undefined, language }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-sources'] }); onClose() },
    onError: (e: any) => setError(e?.response?.data?.message ?? 'Gagal menyimpan'),
  })

  const inp = 'w-full rounded-xl border border-gray-200 bg-white text-gray-900 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all'
  const sel = cn(inp, 'appearance-none cursor-pointer')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">{isEdit ? 'Edit Sumber' : 'Tambah Sumber'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Tipe</label>
              <select value={type} onChange={e => setType(e.target.value as any)} disabled={isEdit} className={sel}>
                <option value="youtube">YouTube</option>
                <option value="article">Article</option>
                <option value="documentation">Documentation</option>
                <option value="pdf">PDF</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Status</label>
              <select value={status} onChange={e => setStatus(e.target.value as any)} className={sel}>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Judul</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Judul konten" className={inp} />
          </div>
          {!isEdit && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">URL</label>
              <input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://…" className={inp} />
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Publisher</label>
              <input value={publisher} onChange={e => setPublisher(e.target.value)} placeholder="YouTube, Medium, dll." className={inp} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Author</label>
              <input value={author} onChange={e => setAuthor(e.target.value)} placeholder="Nama penulis" className={inp} />
            </div>
          </div>
          {!isEdit && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Bahasa</label>
              <select value={language} onChange={e => setLanguage(e.target.value)} className={sel}>
                <option value="id">Indonesia</option>
                <option value="en">English</option>
              </select>
            </div>
          )}
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 py-2.5 hover:bg-gray-50 transition-all">Batal</button>
          <button onClick={() => save.mutate()} disabled={save.isPending || !title.trim() || (!isEdit && !url.trim())} className="flex-1 rounded-xl bg-gray-900 text-white text-sm font-semibold py-2.5 hover:bg-gray-700 disabled:opacity-50 transition-all">
            {save.isPending ? 'Menyimpan…' : isEdit ? 'Simpan' : 'Tambah'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminSourcesPage() {
  const qc = useQueryClient()
  const [page, setPage]           = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter]     = useState('')
  const [modal, setModal]         = useState<'create' | AdminSource | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-sources', page],
    queryFn: () => adminApi.getSources({ page }).then(r => r.data),
  })

  const remove = useMutation({
    mutationFn: (id: number) => adminApi.deleteSource(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-sources'] }),
  })

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => adminApi.updateSource(id, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-sources'] }),
  })

  const sources: AdminSource[] = (data as any)?.data ?? []
  const meta = (data as any)?.meta

  const filtered = sources.filter(s => {
    const matchStatus = !statusFilter || s.status === statusFilter
    const matchType   = !typeFilter   || s.type   === typeFilter
    return matchStatus && matchType
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Learning Sources</h1>
          <p className="text-sm text-gray-500 mt-0.5">{meta?.total ?? 0} total sumber belajar</p>
        </div>
        <button
          onClick={() => setModal('create')}
          className="flex items-center gap-2 bg-gray-900 text-white font-semibold px-4 py-2.5 rounded-xl text-sm hover:bg-gray-700 transition-all hover:-translate-y-0.5"
        >
          <span className="text-blue-400">+</span> Tambah Sumber
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all appearance-none cursor-pointer"
        >
          <option value="">Semua status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="archived">Archived</option>
        </select>
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all appearance-none cursor-pointer"
        >
          <option value="">Semua tipe</option>
          <option value="youtube">YouTube</option>
          <option value="article">Article</option>
          <option value="documentation">Documentation</option>
          <option value="pdf">PDF</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-gray-400 animate-pulse">Memuat…</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-400">Tidak ada sumber ditemukan.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Sumber</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Tipe</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Tanggal</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(s => (
                <tr key={s.id} className="hover:bg-gray-50/60 transition-colors group">
                  <td className="px-5 py-4 max-w-xs">
                    <p className="font-semibold text-gray-900 truncate">{s.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {s.publisher && <span className="text-xs text-gray-400">{s.publisher}</span>}
                      {s.author && <span className="text-xs text-gray-300">· {s.author}</span>}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={cn('text-xs font-bold px-2.5 py-1 rounded-full border inline-flex items-center gap-1.5', TYPE_COLOR[s.type] ?? 'bg-gray-50 text-gray-500 border-gray-200')}>
                      <span className="text-xs">{TYPE_ICON[s.type]}</span>
                      {s.type}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <select
                      value={s.status}
                      onChange={e => updateStatus.mutate({ id: s.id, status: e.target.value })}
                      className={cn(
                        'text-xs font-bold px-2.5 py-1 rounded-full border appearance-none cursor-pointer focus:outline-none transition-all',
                        STATUS_COLOR[s.status] ?? 'bg-gray-50 text-gray-500 border-gray-200'
                      )}
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="archived">Archived</option>
                    </select>
                  </td>
                  <td className="px-5 py-4 text-xs text-gray-400">{new Date(s.created_at).toLocaleDateString('id-ID')}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-gray-500 hover:text-gray-700 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors">
                        Buka ↗
                      </a>
                      <button onClick={() => setModal(s)} className="text-xs font-semibold text-blue-600 hover:text-blue-700 px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors">
                        Edit
                      </button>
                      <button
                        onClick={() => { if (confirm(`Hapus "${s.title}"?`)) remove.mutate(s.id) }}
                        className="text-xs font-semibold text-red-500 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        Hapus
                      </button>
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
          <p className="text-gray-500">Halaman {meta.current_page} dari {meta.last_page}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-xs font-semibold">← Prev</button>
            <button onClick={() => setPage(p => Math.min(meta.last_page, p + 1))} disabled={page === meta.last_page} className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-xs font-semibold">Next →</button>
          </div>
        </div>
      )}

      {modal && (
        <SourceModal
          initial={modal !== 'create' ? modal : undefined}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
