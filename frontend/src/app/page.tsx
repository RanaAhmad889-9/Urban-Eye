import Link from 'next/link';
import { Eye, Satellite, Building2, Layers, ArrowRight, Shield, Zap, Globe } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import UploadZone from '@/components/ui/UploadZone';

export default function Home() {
  return (
    <div className="min-h-screen grid-bg">
      <Navbar />
      <section className="relative pt-32 pb-24 px-4 overflow-hidden">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-blue-500/20 text-blue-400 text-sm font-medium mb-8">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />Satellite Intelligence Platform
          </div>
          <h1 className="font-display text-5xl sm:text-7xl font-bold leading-tight tracking-tight mb-6">
            See the Earth<br /><span className="text-blue-400">Through Intelligence</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
            Upload any satellite image. Instantly classify it, detect and count buildings, and see every structure highlighted with an AI-generated overlay.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
            <Link href="/auth/signup" className="flex items-center gap-2 px-8 py-3.5 rounded-xl btn-primary font-semibold text-base">
              Start Analyzing <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="#try" className="flex items-center gap-2 px-8 py-3.5 rounded-xl btn-ghost font-semibold text-base">
              Try without signup
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto">
            {[{ label: 'Classification', value: 'Instant' }, { label: 'Building Detection', value: 'UNet AI' }, { label: 'Visual Overlay', value: 'Included' }].map((s) => (
              <div key={s.label} className="glass-card rounded-xl p-4 text-center">
                <p className="text-xl font-bold font-display text-blue-400">{s.value}</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-3">How It Works</h2>
            <p className="text-[var(--text-secondary)] text-base max-w-xl mx-auto">Upload once, get three layers of insight</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { icon: Satellite, step: '01', title: 'Classify', desc: 'Our classifier instantly determines if your image is a genuine satellite photograph.' },
              { icon: Building2, step: '02', title: 'Count Buildings', desc: 'A custom-trained UNet model segments every building and returns an exact count.' },
              { icon: Layers, step: '03', title: 'Visual Overlay', desc: 'Buildings are highlighted with a green fill and red outline on the original image — toggle between views.' },
            ].map(({ icon: Icon, step, title, desc }) => (
              <div key={step} className="glass-card rounded-2xl p-6 hover-lift">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-blue-400" />
                  </div>
                  <span className="font-display text-4xl font-bold text-[var(--text-muted)]/20 leading-none">{step}</span>
                </div>
                <h3 className="font-display text-lg font-semibold mb-2">{title}</h3>
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="try" className="py-20 px-4 bg-[var(--surface-raised)]/50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-3">Try It Now</h2>
            <p className="text-[var(--text-secondary)]">No account needed. Upload a satellite image and see detection + highlighted overlay instantly.</p>
          </div>
          <UploadZone />
          <p className="text-center text-[var(--text-muted)] text-sm mt-6">
            Want to save results?{' '}<Link href="/auth/signup" className="text-blue-400 hover:underline">Create a free account →</Link>
          </p>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto grid sm:grid-cols-3 gap-6">
          {[
            { icon: Shield, title: 'Role-based Access', desc: 'USER and ADMIN roles with JWT-secured endpoints.' },
            { icon: Zap, title: 'Fast Inference', desc: 'FastAPI ML microservice returns building count and highlighted PNG in one call.' },
            { icon: Globe, title: 'Compare Images', desc: 'Select multiple uploads and compare building counts and overlays side by side.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="glass-card rounded-2xl p-6 hover-lift">
              <Icon className="w-6 h-6 text-blue-400 mb-4" />
              <h3 className="font-semibold mb-2">{title}</h3>
              <p className="text-[var(--text-secondary)] text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-[var(--border)] py-8 px-4 text-center text-[var(--text-muted)] text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Eye className="w-4 h-4 text-blue-400" />
          <span className="font-display font-semibold">UrbanEye</span>
        </div>
        <p>Satellite intelligence for urban analysis</p>
      </footer>
    </div>
  );
}
