'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useAuthStore } from '@/lib/store/authStore'

// ── Typing animation hook ──────────────────────────────────────────────────
function useTypingEffect(words: string[], speed = 80, pause = 1800) {
  const [display, setDisplay] = useState('')
  const [wordIdx, setWordIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const current = words[wordIdx]
    const timeout = setTimeout(() => {
      if (!deleting) {
        setDisplay(current.slice(0, charIdx + 1))
        if (charIdx + 1 === current.length) {
          setTimeout(() => setDeleting(true), pause)
        } else {
          setCharIdx(c => c + 1)
        }
      } else {
        setDisplay(current.slice(0, charIdx - 1))
        if (charIdx - 1 === 0) {
          setDeleting(false)
          setWordIdx(i => (i + 1) % words.length)
          setCharIdx(0)
        } else {
          setCharIdx(c => c - 1)
        }
      }
    }, deleting ? speed / 2 : speed)
    return () => clearTimeout(timeout)
  }, [charIdx, deleting, wordIdx, words, speed, pause])

  return display
}

// ── Intersection observer for scroll animations ────────────────────────────
function useReveal() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.15 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return { ref, visible }
}

// ── Score bar (animated on reveal) ────────────────────────────────────────
function ScoreBar({ label, score, color, delay = 0 }: { label: string; score: number; color: string; delay?: number }) {
  const { ref, visible } = useReveal()
  return (
    <div ref={ref} className="flex items-center gap-3">
      <span className="text-xs text-gray-500 w-28 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: visible ? `${score}%` : '0%',
            background: color,
            transitionDelay: `${delay}ms`,
          }}
        />
      </div>
      <span className="text-xs font-semibold tabular-nums w-6 text-right" style={{ color }}>{score}</span>
    </div>
  )
}

// ── Section reveal wrapper ─────────────────────────────────────────────────
function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, visible } = useReveal()
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

// ── Step card ──────────────────────────────────────────────────────────────
function StepCard({ n, title, desc, accent }: { n: string; title: string; desc: string; accent: string }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative border border-gray-200 rounded-2xl p-7 cursor-default overflow-hidden transition-all duration-300"
      style={{
        background: hovered ? '#fafafa' : '#fff',
        boxShadow: hovered ? '0 8px 40px rgba(0,0,0,0.07)' : 'none',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
      }}
    >
      {/* accent line */}
      <div
        className="absolute top-0 left-0 h-0.5 transition-all duration-500"
        style={{ width: hovered ? '100%' : '0%', background: accent }}
      />
      <div className="text-xs font-bold tracking-widest mb-4" style={{ color: accent }}>{n}</div>
      <h3 className="text-base font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
    </div>
  )
}

// ── Feature card ───────────────────────────────────────────────────────────
function FeatureCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="border border-gray-200 rounded-2xl p-6 transition-all duration-300"
      style={{
        background: hovered ? '#fafafa' : '#fff',
        boxShadow: hovered ? '0 4px 24px rgba(0,0,0,0.06)' : 'none',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
      }}
    >
      <div className="text-2xl mb-4">{icon}</div>
      <h3 className="text-sm font-semibold text-gray-900 mb-1.5">{title}</h3>
      <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────
export default function LandingPage() {
  const { isAuthenticated } = useAuthStore()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const typed = useTypingEffect([
    'Product Manager',
    'Data Analyst',
    'UI/UX Designer',
    'Digital Marketer',
    'Backend Developer',
    'posisi apapun yang kamu mau.',
  ])

  const ROLES = [
    'Product Manager', 'Data Analyst', 'UI/UX Designer', 'Digital Marketer',
    'Backend Developer', 'Business Analyst', 'HR Specialist', 'Content Strategist',
    'Frontend Developer', 'Sales Executive', 'Finance Analyst', 'Project Manager',
  ]

  return (
    <div className="min-h-screen bg-white text-gray-900" style={{ fontFamily: 'var(--font-geist-sans, system-ui, sans-serif)' }}>

      {/* ── Grid background ──────────────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }} />
        {/* subtle red glow top-right */}
        <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(239,68,68,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
        {/* subtle blue glow bottom-left */}
        <div style={{ position: 'absolute', bottom: -100, left: -100, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
      </div>

      {/* ── Navbar ───────────────────────────────────────────────────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0)',
          backdropFilter: scrolled ? 'blur(16px) saturate(180%)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(16px) saturate(180%)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(0,0,0,0.06)' : '1px solid transparent',
          boxShadow: scrolled ? '0 1px 20px rgba(0,0,0,0.04)' : 'none',
        }}
      >
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg tracking-tight text-gray-900">Intervia</span>
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-0.5" />
          </div>
          <div className="hidden sm:flex items-center gap-6">
            <a href="#how-it-works" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Cara kerja</a>
            <a href="#features" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Fitur</a>
          </div>
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <Link href="/dashboard" className="text-sm font-semibold bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                Dashboard →
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 px-3 py-2 transition-colors">
                  Masuk
                </Link>
                <Link href="/register" className="text-sm font-semibold bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                  Mulai gratis
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative z-10 pt-36 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 border border-gray-200 rounded-full px-4 py-1.5 text-xs font-medium text-gray-600 mb-8 animate-fade-up"
            style={{ background: 'linear-gradient(135deg, #fff 0%, #f9fafb 100%)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            Persiapan wawancara berbasis AI
          </div>

          {/* Headline */}
          <h1
            className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tighter leading-none mb-6 animate-fade-up delay-100 opacity-0"
            style={{ letterSpacing: '-0.04em' }}
          >
            Persiapkan dirimu untuk<br />
            <span className="relative inline-block">
              <span className="text-gray-900">{typed}</span>
              <span className="animate-blink-cursor text-gray-400">|</span>
              {/* underline accent */}
              <span className="absolute -bottom-1 left-0 h-0.5 w-full" style={{ background: 'linear-gradient(90deg, #ef4444, #3b82f6)' }} />
            </span>
          </h1>

          <p className="text-lg text-gray-500 leading-relaxed max-w-xl mx-auto mb-10 animate-fade-up delay-300 opacity-0">
            Tempel lowongan kerja nyata apapun. AI mengekstrak skill yang dibutuhkan, melakukan wawancara adaptif,
            memberi skor setiap jawaban, dan memberi tahu kamu apa yang perlu dipelajari berikutnya.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16 animate-fade-up delay-400 opacity-0">
            <Link
              href="/register"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gray-900 text-white font-semibold px-7 py-3.5 rounded-xl hover:bg-gray-700 transition-all duration-200 hover:-translate-y-0.5"
            >
              Mulai gratis
              <span className="text-gray-400">→</span>
            </Link>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto flex items-center justify-center gap-2 border border-gray-200 text-gray-700 font-medium px-7 py-3.5 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
            >
              Lihat cara kerjanya
            </a>
          </div>

          {/* Role marquee */}
          <div className="relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none" style={{ background: 'linear-gradient(to right, white, transparent)' }} />
            <div className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none" style={{ background: 'linear-gradient(to left, white, transparent)' }} />
            <div className="flex gap-3 animate-marquee w-max">
              {[...ROLES, ...ROLES].map((r, i) => (
                <span
                  key={i}
                  className="shrink-0 border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 bg-white"
                >
                  {r}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Dashboard preview card ────────────────────────────────────────── */}
      <section className="relative z-10 pb-24 px-6">
        <Reveal className="max-w-xl mx-auto">
          <div
            className="rounded-2xl border border-gray-200 overflow-hidden animate-float bg-white"
            style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.08)' }}
          >
            {/* ── Header: profil kandidat ── */}
            <div className="px-6 pt-6 pb-5 border-b border-gray-100">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0"
                  style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}
                >
                  AR
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-gray-900 text-sm">Arya Ramadhan</div>
                  <div className="text-xs text-gray-500 mt-0.5">Senior Product Manager · 5 thn pengalaman</div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-xs bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full font-medium">Aktif Melamar</span>
                    <span className="text-xs text-gray-400">3 sesi selesai</span>
                  </div>
                </div>
                {/* Overall score */}
                <div className="text-right shrink-0">
                  <div
                    className="text-3xl font-black leading-none"
                    style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                  >
                    78
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">skor siap</div>
                </div>
              </div>
            </div>

            {/* ── Target posisi ── */}
            <div className="px-6 py-3 border-b border-gray-100 flex items-center gap-3 bg-gray-50/60">
              <span className="text-xs text-gray-400">Target posisi</span>
              <span className="text-xs font-semibold text-gray-700">Senior Product Manager — Startup Fintech</span>
              <span className="ml-auto text-xs text-green-600 font-medium">✓ Cocok</span>
            </div>

            {/* ── Kompetensi breakdown ── */}
            <div className="px-6 py-5 space-y-3">
              <ScoreBar label="Riset Pengguna"  score={88} color="#3b82f6" delay={0} />
              <ScoreBar label="Prioritisasi"     score={81} color="#6366f1" delay={80} />
              <ScoreBar label="Komunikasi"       score={85} color="#3b82f6" delay={160} />
              <ScoreBar label="Analisis Data"    score={59} color="#ef4444" delay={240} />
              <ScoreBar label="Strategi Produk"  score={66} color="#f59e0b" delay={320} />
            </div>

            {/* ── Insight & rekomendasi ── */}
            <div className="px-6 pb-5 flex flex-wrap gap-2">
              <span className="text-xs border border-red-100 bg-red-50 text-red-600 px-2.5 py-1 rounded-full font-medium">Analisis Data — Perlu Diperkuat</span>
              <span className="text-xs border border-yellow-100 bg-yellow-50 text-yellow-700 px-2.5 py-1 rounded-full font-medium">Strategi Produk — Cukup</span>
              <span className="text-xs border border-green-100 bg-green-50 text-green-700 px-2.5 py-1 rounded-full font-medium">Komunikasi — Kuat</span>
            </div>

            {/* ── Footer progress ── */}
            <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-xs text-gray-500">Skor naik sejak sesi pertama</span>
              </div>
              <span className="text-sm font-black text-gray-900">
                64 <span className="text-gray-300 font-normal mx-1">→</span> 78
                <span className="text-xs font-normal text-green-600 ml-1">+14</span>
              </span>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Divider ───────────────────────────────────────────────────────── */}
      <div className="relative z-10 h-px max-w-6xl mx-auto" style={{ background: 'linear-gradient(90deg, transparent, #e5e7eb, transparent)' }} />

      {/* ── How it works ──────────────────────────────────────────────────── */}
      <section id="how-it-works" className="relative z-10 py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <Reveal className="text-center mb-14">
            <div className="text-xs font-bold tracking-widest text-blue-600 uppercase mb-3">Proses</div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 mb-4">Cara kerjanya</h2>
            <p className="text-gray-500 text-base max-w-md mx-auto">Dari lowongan ke peningkatan nyata dalam empat langkah</p>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { n: '01', title: 'Tempel lowongan', desc: 'Masukkan deskripsi pekerjaan nyata apapun — dari PM hingga developer. AI mengekstrak skill, senioritas, dan topik wawancara yang relevan.', accent: '#3b82f6' },
              { n: '02', title: 'Wawancara adaptif', desc: 'Jawab pertanyaan yang disesuaikan dengan posisimu. Jawaban kurang tajam? AI menggali lebih dalam. Sudah kuat? Langsung ke topik berikutnya.', accent: '#6366f1' },
              { n: '03', title: 'Dapatkan skor nyata', desc: 'Terima skor 0–100 dengan rincian per kompetensi, kelebihan, kelemahan, dan contoh jawaban yang lebih baik.', accent: '#ef4444' },
              { n: '04', title: 'Tutup celah skill', desc: 'Ikuti sumber belajar yang dikurasi sesuai area lemahmu. Coba lagi dan lihat skor kamu meningkat secara konkret.', accent: '#10b981' },
            ].map((s, i) => (
              <Reveal key={s.n} delay={i * 100}>
                <StepCard {...s} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats bar ─────────────────────────────────────────────────────── */}
      <section className="relative z-10 py-12 border-y border-gray-100" style={{ background: '#fafafa' }}>
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            {[
              { value: '8', label: 'Posisi tersedia', color: '#3b82f6' },
              { value: '62', label: 'Skill dilacak', color: '#ef4444' },
              { value: '6', label: 'Dimensi penilaian', color: '#6366f1' },
              { value: '31', label: 'Endpoint API', color: '#10b981' },
            ].map((s, i) => (
              <Reveal key={s.label} delay={i * 80}>
                <div className="text-4xl font-black tracking-tight mb-1" style={{ color: s.color }}>{s.value}</div>
                <div className="text-xs text-gray-500 font-medium">{s.label}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────────── */}
      <section id="features" className="relative z-10 py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <Reveal className="text-center mb-14">
            <div className="text-xs font-bold tracking-widest text-red-500 uppercase mb-3">Fitur</div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 mb-4">Semua yang kamu butuhkan</h2>
            <p className="text-gray-500 text-base max-w-md mx-auto">Dibangun untuk siklus persiapan yang lengkap</p>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: '◈', title: 'Lowongan apapun, posisi apapun', desc: 'Dari Product Manager, Data Analyst, Marketing, hingga Software Engineer — tempel lowongan aslinya dan AI menyesuaikan segalanya.' },
              { icon: '⟳', title: 'Pertanyaan adaptif', desc: 'Pertanyaan berubah sesuai jawabanmu. Persis seperti pewawancara nyata yang membaca situasi dan menggali lebih dalam.' },
              { icon: '◎', title: 'Penilaian 6 dimensi', desc: 'Relevansi, pengetahuan, kejelasan, kelengkapan, penalaran, dan bukti nyata — semua diukur untuk setiap jawaban.' },
              { icon: '⬡', title: 'Peta celah kompetensi', desc: 'Lihat persis kompetensi mana yang menurunkan skormu, diurutkan dari yang paling perlu dibenahi.' },
              { icon: '↗', title: 'Sumber belajar terkurasi', desc: 'Video, artikel, dan dokumentasi yang dipilih sesuai area lemah spesifik kamu — bukan daftar generik.' },
              { icon: '△', title: 'Pantau perkembanganmu', desc: 'Ulangi sesi setelah belajar dan lihat skormu naik. Bukan sekadar latihan — ada progres yang terukur.' },
            ].map((f, i) => (
              <Reveal key={f.title} delay={i * 80}>
                <FeatureCard {...f} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Interview preview terminal ─────────────────────────────────────── */}
      <section className="relative z-10 py-16 px-6 border-t border-gray-100">
        <div className="max-w-2xl mx-auto">
          <Reveal>
            <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              {/* Terminal header */}
              <div className="px-5 py-3 bg-gray-900 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                <span className="w-3 h-3 rounded-full bg-yellow-400" />
                <span className="w-3 h-3 rounded-full bg-green-400" />
                <span className="ml-3 text-xs text-gray-400 font-mono">Intervia · Sesi Wawancara — Product Manager</span>
              </div>
              {/* Content */}
              <div className="bg-gray-950 px-6 py-6 font-mono text-sm space-y-4">
                <div>
                  <div className="text-gray-500 text-xs mb-1">Pewawancara AI</div>
                  <p className="text-gray-200 leading-relaxed">
                    Kamu menyebut pernah me-launch fitur baru di produkmu.
                    <span className="text-blue-400"> Bagaimana kamu memutuskan fitur mana yang harus diprioritaskan</span> saat ada banyak permintaan dari stakeholder?
                  </p>
                </div>
                <div className="border-t border-gray-800 pt-4">
                  <div className="text-gray-500 text-xs mb-1">Kandidat</div>
                  <p className="text-gray-400 leading-relaxed">
                    Saya menggunakan framework RICE — Reach, Impact, Confidence, Effort — untuk
                    memberi skor setiap fitur secara objektif dan mendiskusikannya bersama tim...
                  </p>
                </div>
                <div className="border-t border-gray-800 pt-4 flex items-center gap-3">
                  <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '37.5%' }} />
                  </div>
                  <span className="text-xs text-gray-500 tabular-nums">3 / 8</span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── CTA bottom ────────────────────────────────────────────────────── */}
      <section className="relative z-10 py-28 px-6 border-t border-gray-100">
        {/* accent lines */}
        <div className="absolute top-0 left-1/4 w-px h-full opacity-10" style={{ background: 'linear-gradient(to bottom, #ef4444, transparent)' }} />
        <div className="absolute top-0 right-1/4 w-px h-full opacity-10" style={{ background: 'linear-gradient(to bottom, #3b82f6, transparent)' }} />

        <div className="max-w-2xl mx-auto text-center">
          <Reveal>
            <div className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-6">Siap untuk berlatih?</div>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tighter text-gray-900 mb-6" style={{ letterSpacing: '-0.04em' }}>
              Dapatkan skormu<br />
              <span style={{
                background: 'linear-gradient(135deg, #ef4444, #3b82f6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                dalam 10 menit.
              </span>
            </h2>
            <p className="text-gray-500 text-base mb-10 max-w-sm mx-auto">
              Tempel lowongan yang kamu incar dan dapatkan laporan lengkap berisi celah skill serta rekomendasi belajar.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/register"
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gray-900 text-white font-semibold px-8 py-4 rounded-xl text-base hover:bg-gray-700 transition-all duration-200 hover:-translate-y-0.5"
              >
                Mulai gratis →
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto text-sm text-gray-500 hover:text-gray-900 px-4 py-4 transition-colors"
              >
                Sudah punya akun? Masuk
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-gray-100 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-gray-900">Intervia</span>
            <span className="w-1 h-1 rounded-full bg-red-500" />
            <span className="text-xs text-gray-400">Persiapan Wawancara AI</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <a href="#how-it-works" className="hover:text-gray-700 transition-colors">Cara kerja</a>
            <a href="#features" className="hover:text-gray-700 transition-colors">Fitur</a>
            <Link href="/login" className="hover:text-gray-700 transition-colors">Masuk</Link>
          </div>
          <div className="text-xs text-gray-400">© 2026 Intervia</div>
        </div>
      </footer>

    </div>
  )
}
