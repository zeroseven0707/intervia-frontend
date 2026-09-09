'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi, type AdminPackage } from '@/lib/api/admin'
import { cn, formatRupiah } from '@/lib/utils/cn'

function PackageCard({ pkg, onEdit, onDelete, onToggle }: {
  pkg: AdminPackage
  onEdit: (p: AdminPackage) => void
  onDelete: (id: number) => void
  onToggle: (id: number, key: 'is_active' | 'is_popular', value: boolean) => void
}) {
  const priceToShow = pkg.discounted_price ?? pkg.price
  const hasDiscount = pkg.discounted_price != null && pkg.discounted_price < pkg.price
  const isSessionType = pkg.type === 'session'

  return (
    <div className={cn(
      'relative rounded-2xl bg-white border transition-all overflow-hidden group',
      pkg.is_popular
        ? 'border-gray-900 shadow-lg shadow-gray-900/10 scale-[1.02]'
        : 'border-gray-100 hover:shadow-md hover:border-gray-200'
    )}>
      {pkg.is_popular && (
        <div className="absolute top-0 right-0 bg-gray-900 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-widest">
          Popular
        </div>
      )}
      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <span className={cn(
              'inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider mb-2',
              isSessionType
                ? 'bg-blue-50 text-blue-700 border border-blue-100'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
            )}>
              {isSessionType ? `Session · ${pkg.session_count}×` : `Subs · ${pkg.duration_days} hari`}
            </span>
            <h3 className="text-base font-bold text-gray-900 truncate">{pkg.name}</h3>
            {pkg.description && (
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{pkg.description}</p>
            )}
          </div>
        </div>

        <div className="mt-4 flex items-baseline gap-2">
          {hasDiscount && (
            <span className="text-sm text-gray-400 line-through">{formatRupiah(pkg.price)}</span>
          )}
          <span className={cn(
            'font-black text-2xl tracking-tight',
            hasDiscount ? 'text-red-600' : 'text-gray-900'
          )}>
            {formatRupiah(priceToShow)}
          </span>
        </div>

        {pkg.features && pkg.features.length > 0 && (
          <ul className="mt-4 space-y-2">
            {pkg.features.slice(0, 5).map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                <span className="text-emerald-500 font-bold leading-[1.2]">✓</span>
                <span>{f}</span>
              </li>
            ))}
            {pkg.features.length > 5 && (
              <li className="text-[11px] text-gray-400">+{pkg.features.length - 5} fitur lainnya</li>
            )}
          </ul>
        )}
      </div>

      <div className="border-t border-gray-50 bg-gray-50/50 px-5 py-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={pkg.is_active}
              onChange={e => onToggle(pkg.id, 'is_active', e.target.checked)}
              className="w-3.5 h-3.5 rounded border-gray-300 accent-gray-900"
            />
            Aktif
          </label>
          <label className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={pkg.is_popular}
              onChange={e => onToggle(pkg.id, 'is_popular', e.target.checked)}
              className="w-3.5 h-3.5 rounded border-gray-300 accent-red-500"
            />
            Popular
          </label>
        </div>
        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(pkg)}
            className="text-[11px] font-bold text-blue-600 hover:bg-blue-50 px-2 py-1 rounded-lg transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => { if (confirm(`Hapus paket "${pkg.name}"?`)) onDelete(pkg.id) }}
            className="text-[11px] font-bold text-red-500 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  )
}

function PackageModal({ initial, onClose }: { initial?: AdminPackage; onClose: () => void }) {
  const qc = useQueryClient()
  const isEdit = !!initial

  const [name, setName]                 = useState(initial?.name ?? '')
  const [type, setType]                 = useState<'session' | 'subscription'>(initial?.type ?? 'session')
  const [description, setDescription]   = useState(initial?.description ?? '')
  const [sessionCount, setSessionCount] = useState(String(initial?.session_count ?? '10'))
  const [durationDays, setDurationDays] = useState(String(initial?.duration_days ?? '30'))
  const [price, setPrice]               = useState(String(initial?.price ?? ''))
  const [discPrice, setDiscPrice]       = useState(initial?.discounted_price != null ? String(initial.discounted_price) : '')
  const [isActive, setIsActive]         = useState(initial?.is_active ?? true)
  const [isPopular, setIsPopular]       = useState(initial?.is_popular ?? false)
  const [sortOrder, setSortOrder]       = useState(String(initial?.sort_order ?? 0))
  const [featuresText, setFeaturesText] = useState(initial?.features?.join('\n') ?? '')
  const [error, setError]               = useState('')

  const features = featuresText
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean)

  const save = useMutation({
    mutationFn: () => isEdit
      ? adminApi.updatePackage(initial!.id, {
          name: name.trim() || undefined,
          type,
          description: description.trim() || null,
          session_count: type === 'session' ? Number(sessionCount) : null,
          duration_days: type === 'subscription' ? Number(durationDays) : null,
          price: Number(price),
          discounted_price: discPrice.trim() ? Number(discPrice) : null,
          is_active: isActive,
          is_popular: isPopular,
          sort_order: Number(sortOrder),
          features,
        })
      : adminApi.createPackage({
          name: name.trim(),
          type,
          description: description.trim() || null,
          session_count: type === 'session' ? Number(sessionCount) : null,
          duration_days: type === 'subscription' ? Number(durationDays) : null,
          price: Number(price),
          discounted_price: discPrice.trim() ? Number(discPrice) : null,
          is_active: isActive,
          is_popular: isPopular,
          sort_order: Number(sortOrder),
          features,
        }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-packages'] }); onClose() },
    onError: (e: any) => setError(e?.response?.data?.message ?? 'Gagal menyimpan'),
  })

  const inp = 'w-full rounded-xl border border-gray-200 bg-white text-gray-900 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all'
  const sel = cn(inp, 'appearance-none cursor-pointer')
  const lbl = 'block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">{isEdit ? 'Edit Paket' : 'Tambah Paket Harga'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>

        <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className={lbl}>Nama Paket</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Pro Pack 50 Sesi" className={inp} />
            </div>

            <div>
              <label className={lbl}>Tipe Paket</label>
              <select value={type} onChange={e => setType(e.target.value as 'session' | 'subscription')} className={sel}>
                <option value="session">Per Kredit Sesi</option>
                <option value="subscription">Berlangganan (Hari)</option>
              </select>
            </div>

            <div>
              <label className={lbl}>Sort Order</label>
              <input type="number" value={sortOrder} onChange={e => setSortOrder(e.target.value)} className={inp} />
            </div>

            {type === 'session' ? (
              <div>
                <label className={lbl}>Jumlah Sesi</label>
                <input type="number" min={1} value={sessionCount} onChange={e => setSessionCount(e.target.value)} placeholder="10" className={inp} />
              </div>
            ) : (
              <div>
                <label className={lbl}>Durasi (Hari)</label>
                <input type="number" min={1} value={durationDays} onChange={e => setDurationDays(e.target.value)} placeholder="30" className={inp} />
              </div>
            )}

            <div>
              <label className={lbl}>Harga Normal (Rp)</label>
              <input type="number" min={1000} value={price} onChange={e => setPrice(e.target.value)} placeholder="25000" className={inp} />
            </div>

            <div>
              <label className={lbl}>Harga Diskon (Rp, opsional)</label>
              <input type="number" min={1000} value={discPrice} onChange={e => setDiscPrice(e.target.value)} placeholder="22000" className={inp} />
            </div>

            <div className="col-span-2">
              <label className={lbl}>Deskripsi</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="Deskripsi singkat paket" className={cn(inp, 'resize-none')} />
            </div>

            <div className="col-span-2">
              <label className={lbl}>Daftar Fitur (satu per baris)</label>
              <textarea
                value={featuresText}
                onChange={e => setFeaturesText(e.target.value)}
                rows={5}
                placeholder={"Akses Unlimited AI Interview\nRekomendasi Learning Path\nSupport 24/7\ndst"}
                className={cn(inp, 'resize-none font-mono text-[11px] leading-relaxed')}
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer select-none">
                <input
                  type="checkbox" checked={isActive}
                  onChange={e => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 accent-gray-900"
                />
                Paket Aktif
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer select-none">
                <input
                  type="checkbox" checked={isPopular}
                  onChange={e => setIsPopular(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 accent-red-500"
                />
                Tandai Popular
              </label>
            </div>
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 py-2.5 hover:bg-gray-50 transition-all">Batal</button>
          <button
            onClick={() => save.mutate()}
            disabled={save.isPending || !name.trim() || !price || (type === 'session' ? !sessionCount : !durationDays)}
            className="flex-1 rounded-xl bg-gray-900 text-white text-sm font-semibold py-2.5 hover:bg-gray-700 disabled:opacity-50 transition-all"
          >
            {save.isPending ? 'Menyimpan…' : isEdit ? 'Simpan Perubahan' : 'Buat Paket'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminPackagesPage() {
  const qc = useQueryClient()
  const [modal, setModal] = useState<'create' | AdminPackage | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-packages'],
    queryFn: () => adminApi.getPackages().then(r => r.data.data ?? []),
  })

  const remove = useMutation({
    mutationFn: (id: number) => adminApi.deletePackage(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-packages'] }),
  })

  const toggleField = useMutation({
    mutationFn: ({ id, key, value }: { id: number; key: 'is_active' | 'is_popular'; value: boolean }) =>
      adminApi.updatePackage(id, { [key]: value }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-packages'] }),
  })

  const activeCount   = data?.filter(p => p.is_active).length ?? 0
  const popularCount  = data?.filter(p => p.is_popular).length ?? 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Packages</h1>
          <p className="text-sm text-gray-500 mt-0.5">{data?.length ?? 0} paket · {activeCount} aktif · {popularCount} popular</p>
        </div>
        <button
          onClick={() => setModal('create')}
          className="flex items-center gap-2 bg-gray-900 text-white font-semibold px-4 py-2.5 rounded-xl text-sm hover:bg-gray-700 transition-all hover:-translate-y-0.5"
        >
          <span className="text-blue-400">+</span> Tambah Paket
        </button>
      </div>

      {isLoading ? (
        <div className="p-16 text-center text-sm text-gray-400 animate-pulse">Memuat paket…</div>
      ) : data && data.length === 0 ? (
        <div className="p-16 text-center text-sm text-gray-400 bg-white border border-gray-100 rounded-2xl">
          Belum ada paket harga. Klik "Tambah Paket" untuk membuat.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {data!.map(p => (
            <PackageCard
              key={p.id}
              pkg={p}
              onEdit={setModal}
              onDelete={(id) => remove.mutate(id)}
              onToggle={(id, key, value) => toggleField.mutate({ id, key, value })}
            />
          ))}
        </div>
      )}

      {modal && (
        <PackageModal
          initial={modal !== 'create' ? modal : undefined}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
