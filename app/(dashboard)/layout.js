'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Plus, 
  List, 
  Search, 
  Layers, 
  Building2, 
  BarChart3, 
  Settings, 
  Users,
  LogOut 
} from 'lucide-react'

export default function DashboardLayout({ children }) {
  const pathname = usePathname()

  const menu = [
    { href: '/panel', label: 'Ana Panel', icon: LayoutDashboard },
    { href: '/panel/fiyat-ekle', label: 'Fiyat Ekle', icon: Plus },
    { href: '/panel/fiyat-listesi', label: 'Fiyat Listesi', icon: List },
    { href: '/panel/fiyat-sorgula', label: 'Fiyat Sorgula', icon: Search },
    { href: '/panel/kategoriler', label: 'Kategoriler', icon: Layers },
    { href: '/panel/firmalar', label: 'Firmalar', icon: Building2 },
    { href: '/panel/raporlar', label: 'Raporlar', icon: BarChart3 },
    { href: '/panel/yonetim', label: 'Yönetim', icon: Settings },
    { href: '/panel/kullanıcılar', label: 'Kullanıcılar', icon: Users },
  ]

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <aside className="w-64 bg-slate-900/50 border-r border-slate-800 p-4 hidden md:block">
        <div className="flex items-center gap-2 mb-8">
          <div className="p-2 bg-emerald-500/20 rounded-lg">
            <span className="text-emerald-400 text-xl">⚡</span>
          </div>
          <span className="text-white font-bold text-lg">TermoEnerji</span>
        </div>

        <nav className="space-y-1">
          {menu.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                  active
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-sm">{item.label}</span>
              </Link>
            )
          })}

          <div className="pt-4 mt-4 border-t border-slate-800">
            <Link
              href="/login"
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-all"
            >
              <LogOut className="h-5 w-5" />
              <span className="text-sm">Çıkış Yap</span>
            </Link>
          </div>
        </nav>
      </aside>

      <main className="flex-1 p-6 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
