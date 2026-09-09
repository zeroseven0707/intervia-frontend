'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi, type AdminPosition } from '@/lib/api/admin'
import { cn } from '@/lib/utils/cn'

function PositionModal({
  initial, onClose,
}: {
  initial?: AdminPosition
  onClose: () => void
}) {
  const qc = useQueryClient()
  const isEdit = !!initial
  const [name, setName] = useState(initial?.name ?? '')
  const [desc, setDesc] = useState(initial?.description ?? '')
  const [active, setActive] = useState(initial?.is_active ?? true)
  const [error, setError] = useState('')

  const save = useMutation({
    mutationFn: () => isEdit
      ? adminApi.updatePosition(initial!.id, { name, description: desc, is_active: active })
      : adminApi.createPosition({ name, description: desc, is_active: active }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-positions'] }); onClose() },
    onError: (e: any) => setError(e?.response?.data?.message ?? e?.response?.data?.errors?.name?.[0] ?? 'Gagal menyimpan'),
  })

  const inp = 'w-full rounded-xl border border-gray-200 bg-white text-gray-900 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">{isEdit ? 'Edit Posisi' : 'Tambah Posisi'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Nama Posisi</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="contoh: Product Manager" className={inp} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Deskripsi</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3} placeholder="Opsional…" className={cn(inp, 'resize-none')} />
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setActive(v => !v)}
              className={cn(
                'w-9 h-5 rounded-full transition-colors relative',
                active ? 'bg-gray-900' : 'bg-gray-200'
              )}
            >
              <div className={cn('absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all', active ? 'left-4' : 'left-0.5')} />
            </div>
            <span className="text-sm text-gray-700 font-medium">Aktif (tampil di pilihan)</span>
          </label>
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 py-2.5 hover:bg-gray-50 transition-all">Batal</button>
          <button onClick={() => save.mutate()} disabled={save.isPending || !name.trim()} className="flex-1 rounded-xl bg-gray-900 text-white text-sm font-semibold py-2.5 hover:bg-gray-700 disabled:opacity-50 transition-all">
            {save.isPending ? 'Menyimpan…' : isEdit ? 'Simpan' : 'Tambah'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminPositionsPage() {
  const qc = useQueryClient()
  const [modal, setModal] = useState<'create' | AdminPosition | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-positions'],
    queryFn: () => adminApi.getPositions().then(r => r.data.data),
  })

  const remove = useMutation({
    mutationFn: (id: number) => adminApi.deletePosition(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-positions'] }),
  })

  const positions: AdminPosition[] = data ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Positions</h1>
          <p className="text-sm text-gray-500 mt-0.5">{positions.length} posisi terdaftar</p>
        </div>
        <button
          onClick={() => setModal('create')}
          className="flex items-center gap-2 bg-gray-900 text-white font-semibold px-4 py-2.5 rounded-xl text-sm hover:bg-gray-700 transition-all hover:-translate-y-0.5"
        >
          <span className="text-blue-400">+</span> Tambah Posisi
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {[...Array(6)].map((_, i) => <div key={i} className="h-28 bg-white rounded-2xl border border-gray-100" />)}
        </div>
      ) : positions.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center">
          <p className="text-sm text-gray-400">Belum ada posisi. Tambahkan posisi pertama.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {positions.map(p => (
            <div key={p.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-sm truncate">{p.name}</h3>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">{p.slug}</p>
                </div>
                <span className={cn(
                  'shrink-0 text-xs font-bold px-2 py-0.5 rounded-full border',
                  p.is_active ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-50 text-gray-400 border-gray-200'
                )}>
                  {p.is_active ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>
              {p.description && <p className="text-xs text-gray-500 line-clamp-2 mb-3">{p.description}</p>}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                <span className="text-xs text-gray-400">{p.skills_count} skill terkait</span>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setModal(p)} className="text-xs font-semibold text-blue-600 hover:text-blue-700 px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors">Edit</button>
                  <button
                    onClick={() => { if (confirm(`Hapus posisi "${p.name}"?`)) remove.mutate(p.id) }}
                    className="text-xs font-semibold text-red-500 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <PositionModal
          initial={modal !== 'create' ? modal : undefined}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
