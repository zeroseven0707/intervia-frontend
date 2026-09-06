'use client'

import Link from 'next/link'
import { useAuthStore } from '@/lib/store/authStore'

const ROLES = [
  'Web Developer', 'Fullstack Developer', 'Frontend Developer',
  'Backend Developer', 'Data Analyst', 'UI/UX Designer', 'Sales', 'Marketing',
]

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Paste a vacancy',
    desc: 'Drop any real job description. AI reads it and extracts the exact skills, seniority, and categories.',
  },
  {
    step: '02',
    title: 'Do the interview',
    desc: 'Answer adaptive questions tailored to that specific role. Each answer changes the next question.',
  },
  {
    step: '03',
    title: 'Get a real score',
    desc: 'Receive a 0–100 score with per-skill breakdown, strengths, weaknesses, and an example answer.',
  },
  {
    step: '04',
    title: 'Close the gap',
    desc: 'Follow curated learning resources for your weakest skills, then retry and track improvement.',
  },
]

const FEATURES = [
  {
    icon: '◈',
    title: 'Any Job Description',
    desc: 'Paste the exact vacancy you want. AI adapts every question, difficulty, and recommendation to that role.',
  },
  {
    icon: '⟳',
    title: 'Adaptive Questions',
    desc: 'Weak answer? AI follows up. Strong answer? It moves on. Just like a real interviewer.',
  },
  {
    icon: '◎',
    title: '6-Dimension Scoring',
    desc: 'Relevance, knowledge, clarity, completeness, reasoning, and practical evidence — all scored separately.',
  },
  {
    icon: '⬡',
    title: 'Skill Gap Map',
    desc: 'See exactly which skills pulled your score down, ranked from weakest to strongest.',
  },
  {
    icon: '↗',
    title: 'Learning Recommendations',
    desc: 'Matched resources from YouTube, official docs, and articles — specific to your weak areas.',
  },
  {
    icon: '△',
    title: 'Track Progress',
    desc: 'Retry the same role after studying. See your score go from 68 → 81 with concrete evidence.',
  },
]

const EXAMPLE = {
  position: 'Fullstack Developer',
  seniority: 'Mid-level',
  score: 68,
  skills: [
    { name: 'Laravel', score: 84, status: 'strong' },
    { name: 'Vue.js', score: 77, status: 'good' },
    { name: 'REST API', score: 81, status: 'strong' },
    { name: 'System Design', score: 58, status: 'weak' },
    { name: 'Authentication', score: 62, status: 'needs_work' },
  ],
}

function ScoreColor(score: number) {
  if (score >= 80) return '#6ee7b7'
  if (score >= 70) return '#93c5fd'
  if (score >= 60) return '#fde68a'
  return '#fca5a5'
}

export default function LandingPage() {
  const { isAuthenticated } = useAuthStore()

  return (
    <div style={{ background: '#0a0a0f', color: '#e5e7eb', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', minHeight: '100vh' }}>

      {/* ── Navbar ─────────────────────────────────────────────────────── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)', background: 'rgba(10,10,15,0.8)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: '-0.02em', background: 'linear-gradient(135deg,#818cf8,#c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Intervia
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {isAuthenticated ? (
              <Link href="/dashboard" style={{ background: '#6366f1', color: '#fff', padding: '7px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                Dashboard →
              </Link>
            ) : (
              <>
                <Link href="/login" style={{ color: '#9ca3af', padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>
                  Sign in
                </Link>
                <Link href="/register" style={{ background: '#6366f1', color: '#fff', padding: '7px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '100px 24px 80px' }}>
        {/* Glow */}
        <div style={{ position: 'absolute', top: -200, left: '50%', transform: 'translateX(-50%)', width: 800, height: 800, background: 'radial-gradient(circle,rgba(99,102,241,0.12) 0%,transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 999, padding: '5px 14px', fontSize: 12, color: '#a5b4fc', fontWeight: 500, marginBottom: 28, letterSpacing: '0.03em' }}>
            <span style={{ width: 6, height: 6, background: '#6ee7b7', borderRadius: '50%', boxShadow: '0 0 6px #6ee7b7', display: 'inline-block' }} />
            AI-powered interview prep
          </div>

          <h1 style={{ fontSize: 'clamp(40px,7vw,72px)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.04em', marginBottom: 20 }}>
            Prepare for the interview<br />
            <span style={{ background: 'linear-gradient(135deg,#818cf8,#c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              you actually want.
            </span>
          </h1>

          <p style={{ fontSize: 18, color: '#9ca3af', lineHeight: 1.65, marginBottom: 40, maxWidth: 560, margin: '0 auto 40px' }}>
            Paste a real vacancy. AI conducts a tailored interview, scores every answer,
            maps your skill gaps, and recommends exactly what to study next.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" style={{ background: '#6366f1', color: '#fff', padding: '13px 28px', borderRadius: 10, fontSize: 15, fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              Start for free →
            </Link>
            <Link href="#how-it-works" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#e5e7eb', padding: '13px 28px', borderRadius: 10, fontSize: 15, fontWeight: 600, textDecoration: 'none' }}>
              See how it works
            </Link>
          </div>

          {/* Supported roles */}
          <div style={{ marginTop: 52, display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
            {ROLES.map(r => (
              <span key={r} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, padding: '4px 12px', fontSize: 12, color: '#6b7280', fontWeight: 500 }}>
                {r}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Example Report Preview ──────────────────────────────────────── */}
      <section style={{ padding: '0 24px 96px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, overflow: 'hidden' }}>
          {/* Card header */}
          <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{EXAMPLE.position}</div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{EXAMPLE.seniority} · Simulation mode</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 36, fontWeight: 800, color: '#fde68a', lineHeight: 1 }}>{EXAMPLE.score}</div>
              <div style={{ fontSize: 11, color: '#6b7280' }}>/ 100</div>
            </div>
          </div>
          {/* Skill bars */}
          <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {EXAMPLE.skills.map(s => (
              <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 13, color: '#d1d5db', width: 120, flexShrink: 0 }}>{s.name}</span>
                <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.07)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${s.score}%`, background: ScoreColor(s.score), borderRadius: 99, transition: 'width 1s ease' }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: ScoreColor(s.score), width: 28, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{s.score}</span>
              </div>
            ))}
          </div>
          <div style={{ padding: '12px 24px 20px', display: 'flex', gap: 8 }}>
            <span style={{ background: 'rgba(252,165,165,0.1)', border: '1px solid rgba(252,165,165,0.2)', color: '#fca5a5', borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 600 }}>System Design — Weak</span>
            <span style={{ background: 'rgba(253,230,138,0.1)', border: '1px solid rgba(253,230,138,0.2)', color: '#fde68a', borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 600 }}>Authentication — Needs Work</span>
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────────── */}
      <section id="how-it-works" style={{ padding: '80px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontSize: 'clamp(28px,4vw,40px)', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 12 }}>How it works</h2>
            <p style={{ color: '#6b7280', fontSize: 16 }}>Four steps from vacancy to improvement</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 20 }}>
            {HOW_IT_WORKS.map(h => (
              <div key={h.step} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '28px 24px' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#6366f1', letterSpacing: '0.1em', marginBottom: 12 }}>{h.step}</div>
                <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 8, letterSpacing: '-0.01em' }}>{h.title}</div>
                <div style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>{h.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────────── */}
      <section style={{ padding: '80px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontSize: 'clamp(28px,4vw,40px)', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 12 }}>Everything you need</h2>
            <p style={{ color: '#6b7280', fontSize: 16 }}>Built around the full preparation loop</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 16 }}>
            {FEATURES.map(f => (
              <div key={f.title} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '24px' }}>
                <div style={{ fontSize: 22, marginBottom: 12, color: '#818cf8' }}>{f.icon}</div>
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6, letterSpacing: '-0.01em' }}>{f.title}</div>
                <div style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Bottom ─────────────────────────────────────────────────── */}
      <section style={{ padding: '96px 24px', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', bottom: -300, left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, background: 'radial-gradient(circle,rgba(99,102,241,0.1) 0%,transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative' }}>
          <h2 style={{ fontSize: 'clamp(32px,5vw,52px)', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: 16 }}>
            Ready to practice?
          </h2>
          <p style={{ color: '#9ca3af', fontSize: 17, marginBottom: 40, maxWidth: 400, margin: '0 auto 40px' }}>
            Paste your target vacancy and get your first score in under 10 minutes.
          </p>
          <Link href="/register" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', padding: '14px 32px', borderRadius: 12, fontSize: 16, fontWeight: 700, textDecoration: 'none', display: 'inline-block', letterSpacing: '-0.01em' }}>
            Start for free →
          </Link>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '24px', textAlign: 'center', fontSize: 13, color: '#374151' }}>
        © 2026 Intervia · AI Interview Preparation
      </footer>

    </div>
  )
}
