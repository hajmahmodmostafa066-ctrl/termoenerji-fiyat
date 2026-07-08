'use client'

import { useRouter } from 'next/navigation'

export default function PanelPage() {
  const router = useRouter()

  const menuItems = [
    { 
      title: 'Fiyat Ekle', 
      emoji: '💰', 
      href: '/panel/fiyat-ekle',
      gradient: 'from-emerald-500 via-emerald-400 to-emerald-300',
      glow: 'shadow-emerald-500/50',
      border: 'hover:border-emerald-400',
      text: 'hover:text-emerald-300',
      desc: 'Yeni fiyat teklifi ekle'
    },
    { 
      title: 'Fiyat Listesi', 
      emoji: '📋', 
      href: '/panel/fiyat-listesi',
      gradient: 'from-blue-500 via-blue-400 to-blue-300',
      glow: 'shadow-blue-500/50',
      border: 'hover:border-blue-400',
      text: 'hover:text-blue-300',
      desc: 'Tüm fiyatları görüntüle'
    },
    { 
      title: 'Raporlar', 
      emoji: '📊', 
      href: '/panel/raporlar',
      gradient: 'from-purple-500 via-purple-400 to-purple-300',
      glow: 'shadow-purple-500/50',
      border: 'hover:border-purple-400',
      text: 'hover:text-purple-300',
      desc: 'Fiyat analiz raporları'
    },
    { 
      title: 'Firmalar', 
      emoji: '🏢', 
      href: '/panel/firmalar',
      gradient: 'from-amber-500 via-amber-400 to-amber-300',
      glow: 'shadow-amber-500/50',
      border: 'hover:border-amber-400',
      text: 'hover:text-amber-300',
      desc: 'Firma yönetimi'
    },
    { 
      title: 'Kategoriler', 
      emoji: '📂', 
      href: '/panel/kategoriler',
      gradient: 'from-rose-500 via-rose-400 to-rose-300',
      glow: 'shadow-rose-500/50',
      border: 'hover:border-rose-400',
      text: 'hover:text-rose-300',
      desc: 'Kategori yönetimi'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950/20 to-slate-950">
      
      {/* Arka Plan Efektleri */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-40 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      {/* Ana İçerik */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        
        {/* Üst Başlık */}
        <div className="flex items-center gap-4 mb-8">
          <div className="p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-2xl shadow-emerald-500/40 animate-pulse">
            <span className="text-3xl">⚡</span>
          </div>
          <div>
            <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400">
              TermoEnerji
            </h1>
            <p className="text-slate-400 text-sm mt-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Ultra Pro Max Yönetim Sistemi
            </p>
          </div>
        </div>

        {/* İstatistikler */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Toplam Teklif', value: '0', icon: '📄', color: 'from-emerald-500 to-emerald-600' },
            { label: 'Aktif Teklif', value: '0', icon: '✅', color: 'from-blue-500 to-blue-600' },
            { label: 'Firma', value: '0', icon: '🏢', color: 'from-amber-500 to-amber-600' },
            { label: 'Kategori', value: '0', icon: '📂', color: 'from-rose-500 to-rose-600' }
          ].map((stat, index) => (
            <div key={index} className="group bg-slate-800/40 backdrop-blur-xl rounded-2xl p-5 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl">
              <div className="flex items-center gap-3">
                <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-xl shadow-lg shadow-${stat.color.split(' ')[1]}/30`}>
                  <span className="text-xl">{stat.icon}</span>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">{stat.label}</p>
                  <p className="text-2xl font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-emerald-400 group-hover:to-blue-400 transition-all duration-500">
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Menü Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {menuItems.map((item, index) => (
            <div
              key={index}
              onClick={() => router.push(item.href)}
              className={`group relative bg-slate-800/30 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 ${item.border} cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-2xl ${item.glow} overflow-hidden`}
            >
              {/* Arka Plan Gradyan Efekti */}
              <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
              
              {/* Işık Efekti */}
              <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

              <div className="relative z-10">
                <div className={`p-4 bg-gradient-to-br ${item.gradient} rounded-2xl shadow-2xl ${item.glow} inline-block transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                  <span className="text-3xl">{item.emoji}</span>
                </div>
                <h3 className={`text-2xl font-bold text-white mt-4 ${item.text} transition-colors duration-300`}>
                  {item.title}
                </h3>
                <p className="text-sm text-slate-400 mt-2 group-hover:text-slate-300 transition-colors duration-300">
                  {item.desc}
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs text-slate-500 group-hover:text-slate-300 transition-colors duration-300">
                  <span className="px-3 py-1 bg-slate-700/30 rounded-full border border-slate-600/30">
                    Yeni
                  </span>
                  <span>Hemen başla →</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-700/50 pt-6 mt-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-slate-500 flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-emerald-400" />
              © 2024 TermoEnerji
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="px-3 py-1 bg-slate-800/50 rounded-full border border-slate-700/30">
                v.8.0
              </span>
              <span className="px-3 py-1 bg-gradient-to-r from-emerald-500/20 to-purple-500/20 rounded-full border border-emerald-500/30 text-emerald-400">
                Ultra Pro Max
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
