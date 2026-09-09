'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi, type AdminSkill } from '@/lib/api/admin'
import { cn } from '@/lib/utils/cn'

function SkillModal({ initial, onClose }: { initial?: AdminSkill; onClose: () => void }) {
  const qc = useQueryClient()
  const isEdit = !!initial
  const [name, setName]     = useState(initial?.name ?? '')
  const [cat, setCat]       = useState(initial?.category ?? '')
  const [desc, setDesc]     = useState(initial?.description ?? '')
  const [active, setActive] = useState(initial?.is_active ?? true)
  const [error, setError]   = useState('')

  const save = useMutation({
    mutationFn: () => isEdit
      ? adminApi.updateSkill(initial!.id, { name, category: cat, description: desc, is_active: active })
      : adminApi.createSkill({ name, category: cat, description: desc, is_active: active }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-skills'] }); onClose() },
    onError: (e: any) => setError(e?.response?.data?.message ?? e?.response?.data?.errors?.name?.[0] ?? 'Gagal menyimpan'),
  })

  const inp = 'w-full rounded-xl border border-gray-200 bg-white text-gray-900 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">{isEdit ? 'Edit Skill' : 'Tambah Skill'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Nama Skill</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="contoh: Product Roadmapping" className={inp} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Kategori</label>
            <input value={cat} onChange={e => setCat(e.target.value)} placeholder="contoh: technical / soft-skill / analytical" className={inp} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Deskripsi</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={2} placeholder="Opsional…" className={cn(inp, 'resize-none')} />
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setActive(v => !v)}
              className={cn('w-9 h-5 rounded-full transition-colors relative', active ? 'bg-gray-900' : 'bg-gray-200')}
            >
              <div className={cn('absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all', active ? 'left-4' : 'left-0.5')} />
            </div>
            <span className="text-sm text-gray-700 font-medium">Aktif</span>
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

const CATEGORY_COLORS: Record<string, string> = {
  technical:    'bg-blue-50 text-blue-600 border-blue-100',
  analytical:   'bg-purple-50 text-purple-600 border-purple-100',
  'soft-skill': 'bg-green-50 text-green-600 border-green-100',
  managerial:   'bg-orange-50 text-orange-600 border-orange-100',
}

export default function AdminSkillsPage() {
  const qc = useQueryClient()
  const [modal, setModal]     = useState<'create' | AdminSkill | null>(null)
  const [search, setSearch]   = useState('')
  const [catFilter, setCatFilter] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-skills'],
    queryFn: () => adminApi.getSkills().then(r => r.data.data),
  })

  const remove = useMutation({
    mutationFn: (id: number) => adminApi.deleteSkill(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-skills'] }),
  })

  const skills: AdminSkill[] = data ?? []

  const categories = [...new Set(skills.map(s => s.category).filter(Boolean))] as string[]

  const filtered = skills.filter(s => {
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase())
    const matchCat    = !catFilter || s.category === catFilter
    return matchSearch && matchCat
  })

  // Group by category
  const grouped = filtered.reduce<Record<string, AdminSkill[]>>((acc, s) => {
    const key = s.category || 'Lainnya'
    if (!acc[key]) acc[key] = []
    acc[key].push(s)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Skills</h1>
          <p className="text-sm text-gray-500 mt-0.5">{skills.length} skill terdaftar</p>
        </div>
        <button
          onClick={() => setModal('create')}
          className="flex items-center gap-2 bg-gray-900 text-white font-semibold px-4 py-2.5 rounded-xl text-sm hover:bg-gray-700 transition-all hover:-translate-y-0.5"
        >
          <span className="text-blue-400">+</span> Tambah Skill
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cari skill…"
          className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
        />
        <select
          value={catFilter}
          onChange={e => setCatFilter(e.target.value)}
          className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all appearance-none cursor-pointer"
        >
          <option value="">Semua kategori</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-white rounded-2xl border border-gray-100" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center">
          <p className="text-sm text-gray-400">Tidak ada skill ditemukan.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([cat, items]) => (
            <div key={cat}>
              <div className="flex items-center gap-3 mb-3">
                <span className={cn(
                  'text-xs font-bold px-2.5 py-1 rounded-full border capitalize',
                  CATEGORY_COLORS[cat] ?? 'bg-gray-50 text-gray-500 border-gray-200'
                )}>
                  {cat}
                </span>
                <span className="text-xs text-gray-400">{items.length} skill</span>
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-gray-50">
                    {items.map(s => (
                      <tr key={s.id} className="hover:bg-gray-50/60 transition-colors group">
                        <td className="px-5 py-3.5">
                          <div>
                            <p className="font-semibold text-gray-900">{s.name}</p>
                            {s.description && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{s.description}</p>}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-gray-400 font-mono">{s.slug}</td>
                        <td className="px-5 py-3.5">
                          <span className={cn(
                            'text-xs font-bold px-2 py-0.5 rounded-full border',
                            s.is_active ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-50 text-gray-400 border-gray-200'
                          )}>
                            {s.is_active ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setModal(s)} className="text-xs font-semibold text-blue-600 hover:text-blue-700 px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors">Edit</button>
                            <button
                              onClick={() => { if (confirm(`Hapus skill "${s.name}"?`)) remove.mutate(s.id) }}
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
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <SkillModal
          initial={modal !== 'create' ? modal : undefined}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
