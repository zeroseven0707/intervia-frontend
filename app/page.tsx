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
  const typed = useTypingEffect([
    'Fullstack Developer',
    'Frontend Developer',
    'Data Analyst',
    'Backend Developer',
    'UI/UX Designer',
    'any role you want.',
  ])

  const ROLES = [
    'Web Developer', 'Fullstack Developer', 'Frontend Developer',
    'Backend Developer', 'Data Analyst', 'UI/UX Designer', 'Sales', 'Marketing',
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
      <nav className="relative z-10 sticky top-0 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg tracking-tight text-gray-900">Intervia</span>
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-0.5" />
          </div>
          <div className="hidden sm:flex items-center gap-6">
            <a href="#how-it-works" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">How it works</a>
            <a href="#features" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Features</a>
          </div>
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <Link href="/dashboard" className="text-sm font-semibold bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                Dashboard →
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 px-3 py-2 transition-colors">
                  Sign in
                </Link>
                <Link href="/register" className="text-sm font-semibold bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative z-10 pt-20 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 border border-gray-200 rounded-full px-4 py-1.5 text-xs font-medium text-gray-600 mb-8 animate-fade-up"
            style={{ background: 'linear-gradient(135deg, #fff 0%, #f9fafb 100%)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            AI-powered interview preparation
          </div>

          {/* Headline */}
          <h1
            className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tighter leading-none mb-6 animate-fade-up delay-100 opacity-0"
            style={{ letterSpacing: '-0.04em' }}
          >
            Prepare for your<br />
            <span className="relative inline-block">
              <span className="text-gray-900">{typed}</span>
              <span className="animate-blink-cursor text-gray-400">|</span>
              {/* underline accent */}
              <span className="absolute -bottom-1 left-0 h-0.5 w-full" style={{ background: 'linear-gradient(90deg, #ef4444, #3b82f6)' }} />
            </span>
          </h1>

          <p className="text-lg text-gray-500 leading-relaxed max-w-xl mx-auto mb-10 animate-fade-up delay-300 opacity-0">
            Paste any real job vacancy. AI extracts the skills, conducts an adaptive interview,
            scores every answer, and tells you exactly what to study next.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16 animate-fade-up delay-400 opacity-0">
            <Link
              href="/register"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gray-900 text-white font-semibold px-7 py-3.5 rounded-xl hover:bg-gray-700 transition-all duration-200 hover:-translate-y-0.5"
            >
              Start for free
              <span className="text-gray-400">→</span>
            </Link>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto flex items-center justify-center gap-2 border border-gray-200 text-gray-700 font-medium px-7 py-3.5 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
            >
              See how it works
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

      {/* ── Report preview card ───────────────────────────────────────────── */}
      <section className="relative z-10 pb-24 px-6">
        <Reveal className="max-w-lg mx-auto">
          <div
            className="rounded-2xl border border-gray-200 overflow-hidden shadow-lg animate-float"
            style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.08)' }}
          >
            {/* Card header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
              <div>
                <div className="text-sm font-semibold text-gray-900">Fullstack Developer</div>
                <div className="text-xs text-gray-400 mt-0.5">8 questions · Simulation</div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-gray-900 leading-none">68</div>
                <div className="text-xs text-gray-400">/100</div>
              </div>
            </div>

            {/* Scores */}
            <div className="px-6 py-5 space-y-3 bg-white">
              <ScoreBar label="Laravel"       score={84} color="#3b82f6" delay={0} />
              <ScoreBar label="Vue.js"         score={77} color="#6366f1" delay={100} />
              <ScoreBar label="REST API"       score={81} color="#3b82f6" delay={200} />
              <ScoreBar label="System Design"  score={58} color="#ef4444" delay={300} />
              <ScoreBar label="Authentication" score={62} color="#f59e0b" delay={400} />
            </div>

            {/* Tags */}
            <div className="px-6 pb-5 flex gap-2 bg-white">
              <span className="text-xs border border-red-100 bg-red-50 text-red-600 px-2.5 py-1 rounded-full font-medium">System Design — Weak</span>
              <span className="text-xs border border-yellow-100 bg-yellow-50 text-yellow-700 px-2.5 py-1 rounded-full font-medium">Auth — Needs Work</span>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50">
              <span className="text-xs text-gray-400">After studying Laravel auth →</span>
              <span className="text-sm font-black text-gray-900">81 <span className="text-xs font-normal text-green-600">+13</span></span>
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
            <div className="text-xs font-bold tracking-widest text-blue-600 uppercase mb-3">Process</div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 mb-4">How it works</h2>
            <p className="text-gray-500 text-base max-w-md mx-auto">From vacancy to measurable improvement in four steps</p>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { n: '01', title: 'Paste a vacancy', desc: 'Drop any real job description. AI extracts exact skills, seniority, and interview categories.', accent: '#3b82f6' },
              { n: '02', title: 'Adaptive interview', desc: 'Answer questions tailored to that role. Weak answer? AI follows up. Strong? It moves on.', accent: '#6366f1' },
              { n: '03', title: 'Get a real score', desc: 'Receive 0–100 with per-skill breakdown, strengths, weaknesses, and an example answer.', accent: '#ef4444' },
              { n: '04', title: 'Close the gap', desc: 'Follow curated resources for your weakest skills. Retry and watch your score improve.', accent: '#10b981' },
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
              { value: '8', label: 'Positions', color: '#3b82f6' },
              { value: '62', label: 'Skills tracked', color: '#ef4444' },
              { value: '6', label: 'Score dimensions', color: '#6366f1' },
              { value: '31', label: 'API endpoints', color: '#10b981' },
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
            <div className="text-xs font-bold tracking-widest text-red-500 uppercase mb-3">Features</div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 mb-4">Everything you need</h2>
            <p className="text-gray-500 text-base max-w-md mx-auto">Built around the full preparation loop</p>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: '◈', title: 'Any job description', desc: 'Paste the exact vacancy you want. AI adapts every question and evaluation to that specific role.' },
              { icon: '⟳', title: 'Adaptive questions', desc: 'Questions change based on your answers. Just like a real interviewer adjusting to your level.' },
              { icon: '◎', title: '6-dimension scoring', desc: 'Relevance, knowledge, clarity, completeness, reasoning, and practical evidence — all measured.' },
              { icon: '⬡', title: 'Skill gap map', desc: 'See exactly which skills pulled your score down, ranked from weakest to strongest.' },
              { icon: '↗', title: 'Learning resources', desc: 'Curated YouTube, docs, and articles matched to your exact weak areas.' },
              { icon: '△', title: 'Track progress', desc: 'Retry the same role after studying. See your score go from 68 to 81 with evidence.' },
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
                <span className="ml-3 text-xs text-gray-400 font-mono">Intervia · Interview Session</span>
              </div>
              {/* Content */}
              <div className="bg-gray-950 px-6 py-6 font-mono text-sm space-y-4">
                <div>
                  <div className="text-gray-500 text-xs mb-1">AI Interviewer</div>
                  <p className="text-gray-200 leading-relaxed">
                    You mentioned you built a digital office using Laravel.
                    <span className="text-blue-400"> How did you handle authentication and authorization</span> in that application?
                  </p>
                </div>
                <div className="border-t border-gray-800 pt-4">
                  <div className="text-gray-500 text-xs mb-1">Candidate</div>
                  <p className="text-gray-400 leading-relaxed">
                    I used Laravel Sanctum for API token authentication and implemented
                    role-based middleware for authorization...
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
            <div className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-6">Ready to practice?</div>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tighter text-gray-900 mb-6" style={{ letterSpacing: '-0.04em' }}>
              Get your score<br />
              <span style={{
                background: 'linear-gradient(135deg, #ef4444, #3b82f6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                in 10 minutes.
              </span>
            </h2>
            <p className="text-gray-500 text-base mb-10 max-w-sm mx-auto">
              Paste your target vacancy and get a full report with skill gaps and learning recommendations.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/register"
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gray-900 text-white font-semibold px-8 py-4 rounded-xl text-base hover:bg-gray-700 transition-all duration-200 hover:-translate-y-0.5"
              >
                Start for free →
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto text-sm text-gray-500 hover:text-gray-900 px-4 py-4 transition-colors"
              >
                Already have an account? Sign in
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
            <span className="text-xs text-gray-400">AI Interview Preparation</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <a href="#how-it-works" className="hover:text-gray-700 transition-colors">How it works</a>
            <a href="#features" className="hover:text-gray-700 transition-colors">Features</a>
            <Link href="/login" className="hover:text-gray-700 transition-colors">Sign in</Link>
          </div>
          <div className="text-xs text-gray-400">© 2026 Intervia</div>
        </div>
      </footer>

    </div>
  )
}
