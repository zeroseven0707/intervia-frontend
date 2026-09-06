import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white flex" style={{ fontFamily: 'var(--font-geist-sans, system-ui, sans-serif)' }}>
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gray-950 flex-col justify-between p-12">
        {/* Grid */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        {/* Glows */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(239,68,68,0.08) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)' }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-2">
          <span className="font-black text-xl text-white tracking-tight">Intervia</span>
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
        </div>

        {/* Quote */}
        <div className="relative z-10">
          <blockquote className="text-2xl font-bold text-white leading-tight tracking-tight mb-6" style={{ letterSpacing: '-0.02em' }}>
            "Prepare for the interview<br />you actually want."
          </blockquote>
          {/* mini score card */}
          <div className="border border-white/10 rounded-xl p-4 bg-white/5 backdrop-blur-sm max-w-xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-xs font-semibold text-white">Fullstack Developer</div>
                <div className="text-xs text-gray-400">After 2 attempts</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400 line-through">68</span>
                <span className="text-xl font-black text-white">81</span>
                <span className="text-xs text-green-400 font-bold">+13</span>
              </div>
            </div>
            {[
              { label: 'Laravel',    w: 84, c: '#3b82f6' },
              { label: 'System Design', w: 74, c: '#10b981' },
              { label: 'Auth',       w: 78, c: '#6366f1' },
            ].map(b => (
              <div key={b.label} className="flex items-center gap-2 mb-1.5">
                <span className="text-xs text-gray-400 w-24">{b.label}</span>
                <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${b.w}%`, background: b.c }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-xs text-gray-600">© 2026 Intervia</div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col">
        {/* Top bar mobile */}
        <div className="lg:hidden flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-1.5">
            <span className="font-black text-base text-gray-900">Intervia</span>
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
          </Link>
        </div>
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
