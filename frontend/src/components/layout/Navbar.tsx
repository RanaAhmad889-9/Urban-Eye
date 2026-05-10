'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Eye, Menu, X, LogOut, LayoutDashboard, History, GitCompare, Shield } from 'lucide-react';
import { clearAuth, getUser, isLoggedIn, isAdmin } from '@/lib/auth';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setHydrated(true);
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const loggedIn = hydrated && isLoggedIn();
  const admin = hydrated && isAdmin();
  const user = hydrated ? getUser() : null;

  const navLinks = loggedIn
    ? [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/history', label: 'History', icon: History },
        { href: '/compare', label: 'Compare', icon: GitCompare },
        ...(admin ? [{ href: '/admin', label: 'Admin', icon: Shield }] : []),
      ]
    : [];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass-card shadow-lg shadow-black/30' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
              <Eye className="w-4 h-4 text-blue-400" />
            </div>
            <span className="font-display font-bold text-lg">Urban<span className="text-blue-400">Eye</span></span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${pathname === href ? 'bg-blue-500/15 text-blue-400 border border-blue-500/25' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-overlay)]'}`}>
                <Icon className="w-3.5 h-3.5" />{label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {loggedIn ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-[var(--text-muted)]">{user?.name}</span>
                <button onClick={() => { clearAuth(); router.push('/'); }} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm btn-ghost">
                  <LogOut className="w-3.5 h-3.5" />Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth/login" className="px-4 py-2 text-sm rounded-lg btn-ghost">Sign in</Link>
                <Link href="/auth/signup" className="px-4 py-2 text-sm rounded-lg btn-primary font-medium">Get started</Link>
              </div>
            )}
          </div>

          <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-lg text-[var(--text-secondary)]">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden glass-card border-t border-[var(--border)]">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} onClick={() => setOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${pathname === href ? 'bg-blue-500/15 text-blue-400' : 'text-[var(--text-secondary)]'}`}>
                <Icon className="w-4 h-4" />{label}
              </Link>
            ))}
            <div className="pt-2 border-t border-[var(--border)]">
              {loggedIn ? (
                <button onClick={() => { clearAuth(); setOpen(false); router.push('/'); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-[var(--text-secondary)]">
                  <LogOut className="w-4 h-4" />Logout
                </button>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link href="/auth/login" onClick={() => setOpen(false)} className="w-full text-center px-4 py-2.5 rounded-lg text-sm btn-ghost">Sign in</Link>
                  <Link href="/auth/signup" onClick={() => setOpen(false)} className="w-full text-center px-4 py-2.5 rounded-lg text-sm btn-primary font-medium">Get started</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
