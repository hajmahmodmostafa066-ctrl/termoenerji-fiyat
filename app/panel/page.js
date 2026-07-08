'use client'

import { useRouter } from 'next/navigation'
import { 
  Plus, 
  List, 
  LayoutDashboard,
  TrendingUp,
  DollarSign,
  Package,
  Building2,
  Layers
} from 'lucide-react'

export default function PanelPage() {
  const router = useRouter()

  const menuItems = [
    { 
      title: 'Fiyat Ekle', 
      icon: Plus, 
      href: '/panel/fiyat-ekle',
      color: 'from-emerald-500 to-emerald-600',
      glow: 'shadow-emerald-500/30',
      desc: 'Yeni fiyat teklifi ekle'
    },
    { 
      title: 'Fiyat Listesi', 
      icon: List, 
      href: '/panel/fiyat-listesi',
      color: 'from-blue-500 to-blue-600',
      glow: 'shadow-blue-500/30',
      desc: 'Tüm fiyatları görüntüle'
    },
    { 
      title: 'Raporlar', 
      icon: TrendingUp, 
      href: '/panel/raporlar',
      color: 'from-purple-500 to-purple-600',
      glow: 'shadow-purple-500/30',
      desc: 'Fiyat analiz raporları'
    },
    { 
      title: 'Firmalar', 
      icon: Building2, 
      href: '/panel/firmalar',
      color: 'from-amber-500 to-amber-600',
      glow: 'shadow-amber-500/30',
      desc: 'Firma yönetimi'
    },
    { 
      title: 'Kategoriler', 
      icon: Layers, 
      href: '/panel/kategoriler',
      color: 'from-rose-500 to-rose-600',
      glow: 'shadow-rose-500/30',
      desc: 'Kategori yönetimi'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      
      {/* Hero Bölümü */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10 blur-3xl" />
        <div className="max-w-7xl mx-auto px-6 py-12 relative">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg shadow-emerald-500/25">
              <LayoutDashboard className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white tracking-tight">
                TermoEnerji
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Fiyat Teklif Yönetim Sistemi
              </p>
            </div>
          </div>

          {/* İstatistikler */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {[
              { label: 'Toplam Teklif', value: '0', icon: DollarSign, color: 'emerald' },
              { label: 'Aktif Teklif', value: '0', icon: Package, color: 'blue' },
              { label: 'Firma', value: '0', icon: Building2, color: 'amber' },
              { label: 'Kategori', value: '0', icon: Layers, color: 'rose' }
            ].map((stat, index) => (
              <div key={index} className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-4 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className={`p-2 bg-${stat.color}-500/20 rounded-xl`}>
                    <stat.icon className={`h-5 w-5 text-${stat.color}-400`} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">{stat.label}</p>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Menü Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item, index) => (
            <div
              key={index}
              onClick={() => router.push(item.href)}
              className="group relative bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 cursor-pointer overflow-hidden hover:scale-[1.02]"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              <div className="relative z-10">
                <div className={`p-3 bg-gradient-to-br ${item.color} rounded-xl shadow-lg ${item.glow} inline-block`}>
                  <item.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mt-4 group-hover:text-emerald-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-400 mt-1">{item.desc}</p>
                <div className="mt-4 flex items-center text-xs text-slate-500 group-hover:text-slate-300 transition-colors">
                  <span>Hemen başla →</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto px-6 py-6 border-t border-slate-800/50">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-500">
            © 2024 TermoEnerji. Tüm hakları saklıdır.
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span>v.8.0</span>
            <span className="w-1 h-1 rounded-full bg-slate-600" />
            <span>Ultra Pro Max</span>
          </div>
        </div>
      </div>

    </div>
  )
}
