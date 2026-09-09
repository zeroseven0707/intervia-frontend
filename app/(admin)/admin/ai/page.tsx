'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminAiApi, type AiConfig, type AiPromptTemplate } from '@/lib/api/admin'
import { cn } from '@/lib/utils/cn'

// ── Provider Config Tab ───────────────────────────────────────────────────────

const MODELS_OPENAI  = ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo']
const MODELS_GEMINI  = ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-pro']
const TASK_LABELS: Record<string, string> = {
  job_analyzer: 'Job Analyzer',
  interviewer:  'Question Generator',
  evaluator:    'Answer Evaluator',
  skill_gap:    'Skill Gap',
  recommender:  'Recommender',
  coach:        'Career Coach',
}

function ProviderConfigTab() {
  const qc = useQueryClient()
  const { data: cfg, isLoading } = useQuery({
    queryKey: ['admin-ai-config'],
    queryFn: () => adminAiApi.getConfig().then(r => r.data.data),
  })

  const [primary, setPrimary]         = useState('')
  const [fallback, setFallback]       = useState('')
  const [openaiKey, setOpenaiKey]     = useState('')
  const [openaiDef, setOpenaiDef]     = useState('')
  const [openaiEval, setOpenaiEval]   = useState('')
  const [geminiKey, setGeminiKey]     = useState('')
  const [geminiDef, setGeminiDef]     = useState('')
  const [geminiEval, setGeminiEval]   = useState('')
  const [maxTokens, setMaxTokens]     = useState('')
  const [maxRetries, setMaxRetries]   = useState('')
  const [timeoutVal, setTimeoutVal]   = useState('')
  const [saved, setSaved]             = useState(false)
  const [error, setError]             = useState('')

  // Populate from fetched config (once)
  const [hydrated, setHydrated]       = useState(false)
  if (cfg && !hydrated) {
    setPrimary(cfg.primary_provider)
    setFallback(cfg.fallback_provider)
    setOpenaiDef(cfg.providers.openai.default_model)
    setOpenaiEval(cfg.providers.openai.evaluation_model)
    setGeminiDef(cfg.providers.gemini.default_model)
    setGeminiEval(cfg.providers.gemini.evaluation_model)
    setMaxTokens(String(cfg.max_tokens))
    setMaxRetries(String(cfg.max_retries))
    setTimeoutVal(String(cfg.timeout_seconds))
    setHydrated(true)
  }

  const save = useMutation({
    mutationFn: () => adminAiApi.updateConfig({
      primary_provider:        primary,
      fallback_provider:       fallback,
      ...(openaiKey   ? { openai_api_key: openaiKey }           : {}),
      openai_default_model:    openaiDef,
      openai_evaluation_model: openaiEval,
      ...(geminiKey   ? { gemini_api_key: geminiKey }           : {}),
      gemini_default_model:    geminiDef,
      gemini_evaluation_model: geminiEval,
      max_tokens:    Number(maxTokens),
      max_retries:   Number(maxRetries),
      timeout_seconds: Number(timeoutVal),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-ai-config'] })
      setSaved(true)
      setOpenaiKey('')
      setGeminiKey('')
      setError('')
      window.setTimeout(() => setSaved(false), 3000)
    },
    onError: (e: any) => setError(e?.response?.data?.message ?? 'Gagal menyimpan'),
  })

  const sel = 'w-full rounded-xl border border-gray-200 bg-white text-gray-900 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all appearance-none cursor-pointer'
  const inp = 'w-full rounded-xl border border-gray-200 bg-white text-gray-900 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all'

  if (isLoading) return <div className="animate-pulse space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded-xl" />)}</div>

  return (
    <div className="space-y-8">
      {/* Provider selection */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 mb-5">Provider Aktif</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Primary Provider</label>
            <select value={primary} onChange={e => setPrimary(e.target.value)} className={sel}>
              <option value="openai">OpenAI</option>
              <option value="gemini">Google Gemini</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Fallback Provider</label>
            <select value={fallback} onChange={e => setFallback(e.target.value)} className={sel}>
              <option value="openai">OpenAI</option>
              <option value="gemini">Google Gemini</option>
            </select>
          </div>
        </div>
      </div>

      {/* OpenAI config */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-500">OpenAI</span>
          <span className={cn(
            'text-xs font-bold px-2 py-0.5 rounded-full border',
            cfg?.providers.openai.has_key ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'
          )}>
            {cfg?.providers.openai.has_key ? '✓ API Key tersimpan' : '✗ Belum ada API Key'}
          </span>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
              API Key {cfg?.providers.openai.has_key ? '(kosongkan jika tidak ingin mengubah)' : ''}
            </label>
            <input
              type="password"
              value={openaiKey}
              onChange={e => setOpenaiKey(e.target.value)}
              placeholder="sk-..."
              className={inp}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Default Model</label>
              <select value={openaiDef} onChange={e => setOpenaiDef(e.target.value)} className={sel}>
                {MODELS_OPENAI.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Evaluation Model</label>
              <select value={openaiEval} onChange={e => setOpenaiEval(e.target.value)} className={sel}>
                {MODELS_OPENAI.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Gemini config */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Google Gemini</span>
          <span className={cn(
            'text-xs font-bold px-2 py-0.5 rounded-full border',
            cfg?.providers.gemini.has_key ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'
          )}>
            {cfg?.providers.gemini.has_key ? '✓ API Key tersimpan' : '✗ Belum ada API Key'}
          </span>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
              API Key {cfg?.providers.gemini.has_key ? '(kosongkan jika tidak ingin mengubah)' : ''}
            </label>
            <input
              type="password"
              value={geminiKey}
              onChange={e => setGeminiKey(e.target.value)}
              placeholder="AIza..."
              className={inp}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Default Model</label>
              <select value={geminiDef} onChange={e => setGeminiDef(e.target.value)} className={sel}>
                {MODELS_GEMINI.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Evaluation Model</label>
              <select value={geminiEval} onChange={e => setGeminiEval(e.target.value)} className={sel}>
                {MODELS_GEMINI.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Task model assignment */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 mb-1">Task → Model Tier</h3>
        <p className="text-xs text-gray-400 mb-5">Menentukan apakah tiap task menggunakan default model atau evaluation model.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {cfg && Object.entries(cfg.task_models).map(([task, tier]) => (
            <div key={task} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
              <span className="text-xs font-semibold text-gray-700">{TASK_LABELS[task] ?? task}</span>
              <span className={cn(
                'text-xs font-bold px-2 py-0.5 rounded-full border',
                tier === 'evaluation' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-blue-50 text-blue-600 border-blue-100'
              )}>
                {tier}
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">Untuk mengubah task model tier, edit <code className="bg-gray-100 px-1 rounded">config/ai.php</code> langsung.</p>
      </div>

      {/* Safety limits */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 mb-5">Safety Limits</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Max Tokens</label>
            <input type="number" value={maxTokens} onChange={e => setMaxTokens(e.target.value)} min={256} max={8192} className={inp} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Max Retries</label>
            <input type="number" value={maxRetries} onChange={e => setMaxRetries(e.target.value)} min={1} max={10} className={inp} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Timeout (detik)</label>
            <input type="number" value={timeoutVal} onChange={e => setTimeoutVal(e.target.value)} min={5} max={120} className={inp} />
          </div>
        </div>
      </div>

      {/* Save */}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex items-center gap-4">
        <button
          onClick={() => save.mutate()}
          disabled={save.isPending}
          className="flex items-center gap-2 bg-gray-900 text-white font-semibold px-6 py-3 rounded-xl text-sm hover:bg-gray-700 disabled:opacity-50 transition-all hover:-translate-y-0.5"
        >
          {save.isPending ? 'Menyimpan…' : 'Simpan Konfigurasi'}
        </button>
        {saved && <span className="text-sm text-green-600 font-medium">✓ Tersimpan</span>}
      </div>
    </div>
  )
}

// ── Prompt Templates Tab ─────────────────────────────────────────────────────

const PROMPT_TYPES = ['job_analyzer', 'interviewer', 'evaluator', 'skill_gap', 'recommender', 'coach']

function PromptModal({ initial, onClose }: { initial?: AiPromptTemplate; onClose: () => void }) {
  const qc = useQueryClient()
  const isEdit = !!initial
  const [name, setName]         = useState(initial?.name ?? '')
  const [type, setType]         = useState(initial?.type ?? 'interviewer')
  const [version, setVersion]   = useState(initial?.version ?? 'v1')
  const [prompt, setPrompt]     = useState(initial?.system_prompt ?? '')
  const [active, setActive]     = useState(initial?.is_active ?? false)
  const [error, setError]       = useState('')

  const save = useMutation({
    mutationFn: () => isEdit
      ? adminAiApi.updatePrompt(initial!.id, { name, version, system_prompt: prompt, is_active: active })
      : adminAiApi.createPrompt({ name, type, version, system_prompt: prompt, is_active: active }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-ai-prompts'] }); onClose() },
    onError: (e: any) => setError(e?.response?.data?.message ?? 'Gagal menyimpan'),
  })

  const inp = 'w-full rounded-xl border border-gray-200 bg-white text-gray-900 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between shrink-0">
          <h2 className="text-base font-bold text-gray-900">{isEdit ? 'Edit Prompt Template' : 'Buat Prompt Template'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>
        <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Nama</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="INTERVIEWER_V2" className={inp} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Type</label>
              <select value={type} onChange={e => setType(e.target.value)} disabled={isEdit} className={cn(inp, 'appearance-none cursor-pointer')}>
                {PROMPT_TYPES.map(t => <option key={t} value={t}>{TASK_LABELS[t] ?? t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Versi</label>
              <input value={version} onChange={e => setVersion(e.target.value)} placeholder="v1" className={inp} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">System Prompt</label>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              rows={14}
              placeholder="Tulis system prompt di sini…"
              className={cn(inp, 'resize-y font-mono text-xs leading-relaxed')}
            />
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setActive(v => !v)}
              className={cn('w-9 h-5 rounded-full transition-colors relative', active ? 'bg-gray-900' : 'bg-gray-200')}
            >
              <div className={cn('absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all', active ? 'left-4' : 'left-0.5')} />
            </div>
            <span className="text-sm text-gray-700 font-medium">Aktifkan prompt ini (nonaktifkan yang lain untuk type yang sama)</span>
          </label>
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3 shrink-0">
          <button onClick={onClose} className="flex-1 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 py-2.5 hover:bg-gray-50 transition-all">Batal</button>
          <button onClick={() => save.mutate()} disabled={save.isPending || !name.trim() || !prompt.trim()} className="flex-1 rounded-xl bg-gray-900 text-white text-sm font-semibold py-2.5 hover:bg-gray-700 disabled:opacity-50 transition-all">
            {save.isPending ? 'Menyimpan…' : isEdit ? 'Simpan' : 'Buat'}
          </button>
        </div>
      </div>
    </div>
  )
}

function PromptTemplatesTab() {
  const qc = useQueryClient()
  const [modal, setModal]         = useState<'create' | AiPromptTemplate | null>(null)
  const [expanded, setExpanded]   = useState<number | null>(null)
  const [typeFilter, setTypeFilter] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-ai-prompts'],
    queryFn: () => adminAiApi.getPrompts().then(r => r.data.data),
  })

  const remove = useMutation({
    mutationFn: (id: number) => adminAiApi.deletePrompt(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-ai-prompts'] }),
  })

  const setActive = useMutation({
    mutationFn: (id: number) => adminAiApi.updatePrompt(id, { is_active: true }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-ai-prompts'] }),
  })

  const prompts: AiPromptTemplate[] = data ?? []
  const filtered = typeFilter ? prompts.filter(p => p.type === typeFilter) : prompts

  const grouped = filtered.reduce<Record<string, AiPromptTemplate[]>>((acc, p) => {
    if (!acc[p.type]) acc[p.type] = []
    acc[p.type].push(p)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{prompts.length} template tersimpan</p>
        <div className="flex items-center gap-3">
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 appearance-none cursor-pointer"
          >
            <option value="">Semua type</option>
            {PROMPT_TYPES.map(t => <option key={t} value={t}>{TASK_LABELS[t] ?? t}</option>)}
          </select>
          <button
            onClick={() => setModal('create')}
            className="flex items-center gap-2 bg-gray-900 text-white font-semibold px-4 py-2.5 rounded-xl text-sm hover:bg-gray-700 transition-all hover:-translate-y-0.5"
          >
            <span className="text-blue-400">+</span> Buat Template
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-white rounded-xl border border-gray-100" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center">
          <p className="text-2xl mb-3">✦</p>
          <p className="text-sm text-gray-500 mb-1">Belum ada prompt template.</p>
          <p className="text-xs text-gray-400">Saat ini AI menggunakan prompt hardcoded di service. Buat template untuk mengoverride-nya.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).sort().map(([type, items]) => (
            <div key={type}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold bg-gray-900 text-white px-2.5 py-1 rounded-full uppercase tracking-wide">
                  {TASK_LABELS[type] ?? type}
                </span>
                <span className="text-xs text-gray-400">{items.length} versi</span>
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-50">
                {items.map(p => (
                  <div key={p.id}>
                    <div
                      className="px-5 py-4 flex items-center gap-4 hover:bg-gray-50/60 transition-colors cursor-pointer"
                      onClick={() => setExpanded(expanded === p.id ? null : p.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900 text-sm">{p.name}</p>
                          <span className="text-xs text-gray-400 font-mono">{p.version}</span>
                          {p.is_active && (
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-600 border border-green-100">Aktif</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5 truncate">{p.system_prompt.slice(0, 80)}…</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {!p.is_active && (
                          <button
                            onClick={e => { e.stopPropagation(); setActive.mutate(p.id) }}
                            className="text-xs font-semibold text-green-600 hover:text-green-700 px-2 py-1 rounded-lg hover:bg-green-50 transition-colors"
                          >
                            Aktifkan
                          </button>
                        )}
                        <button
                          onClick={e => { e.stopPropagation(); setModal(p) }}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-700 px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); if (confirm(`Hapus "${p.name}"?`)) remove.mutate(p.id) }}
                          className="text-xs font-semibold text-red-500 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          Hapus
                        </button>
                        <span className={cn('text-gray-400 transition-transform text-xs', expanded === p.id && 'rotate-180')}>▾</span>
                      </div>
                    </div>
                    {expanded === p.id && (
                      <div className="px-5 pb-5 bg-gray-50 border-t border-gray-100">
                        <pre className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed font-mono bg-white border border-gray-100 rounded-xl p-4 mt-3 overflow-x-auto max-h-64">
                          {p.system_prompt}
                        </pre>
                        <p className="text-xs text-gray-400 mt-2">
                          Dibuat: {new Date(p.created_at).toLocaleDateString('id-ID')} ·
                          Update: {new Date(p.updated_at).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && <PromptModal initial={modal !== 'create' ? modal : undefined} onClose={() => setModal(null)} />}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AdminAiPage() {
  const [tab, setTab] = useState<'config' | 'prompts'>('config')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">AI Models</h1>
        <p className="text-sm text-gray-500 mt-1">Konfigurasi provider, model, dan prompt template untuk semua AI service</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {([['config', '⚙ Provider & Config'], ['prompts', '✦ Prompt Templates']] as const).map(([v, l]) => (
          <button
            key={v}
            onClick={() => setTab(v)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-semibold transition-all',
              tab === v ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            )}
          >
            {l}
          </button>
        ))}
      </div>

      {tab === 'config' ? <ProviderConfigTab /> : <PromptTemplatesTab />}
    </div>
  )
}
