'use client'

import { useRouter } from 'next/navigation'

export default function PanelPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      
      {/* Hero Bölümü */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center gap-4 mb-2">
          <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg shadow-emerald-500/25">
            <span className="text-2xl">📊</span>
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
          <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-4 border border-slate-700/50">
            <p className="text-xs text-slate-400">Toplam Teklif</p>
            <p className="text-2xl font-bold text-white">0</p>
          </div>
          <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-4 border border-slate-700/50">
            <p className="text-xs text-slate-400">Aktif Teklif</p>
            <p className="text-2xl font-bold text-white">0</p>
          </div>
          <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-4 border border-slate-700/50">
            <p className="text-xs text-slate-400">Firma</p>
            <p className="text-2xl font-bold text-white">0</p>
          </div>
          <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-4 border border-slate-700/50">
            <p className="text-xs text-slate-400">Kategori</p>
            <p className="text-2xl font-bold text-white">0</p>
          </div>
        </div>
      </div>

      {/* Menü Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Fiyat Ekle */}
          <div
            onClick={() => router.push('/panel/fiyat-ekle')}
            className="group bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-emerald-500/50 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-emerald-500/10"
          >
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg shadow-emerald-500/30 inline-block">
              <span className="text-2xl">💰</span>
            </div>
            <h3 className="text-xl font-semibold text-white mt-4 group-hover:text-emerald-400 transition-colors">
              Fiyat Ekle
            </h3>
            <p className="text-sm text-slate-400 mt-1">Yeni fiyat teklifi ekle</p>
            <div className="mt-4 flex items-center text-xs text-slate-500 group-hover:text-slate-300 transition-colors">
              <span>Hemen başla →</span>
            </div>
          </div>

          {/* Fiyat Listesi */}
          <div
            onClick={() => router.push('/panel/fiyat-listesi')}
            className="group bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-blue-500/50 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/10"
          >
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/30 inline-block">
              <span className="text-2xl">📋</span>
            </div>
            <h3 className="text-xl font-semibold text-white mt-4 group-hover:text-blue-400 transition-colors">
              Fiyat Listesi
            </h3>
            <p className="text-sm text-slate-400 mt-1">Tüm fiyatları görüntüle</p>
            <div className="mt-4 flex items-center text-xs text-slate-500 group-hover:text-slate-300 transition-colors">
              <span>Hemen başla →</span>
            </div>
          </div>

          {/* Raporlar */}
          <div
            onClick={() => router.push('/panel/raporlar')}
            className="group bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-purple-500/50 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/10"
          >
            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg shadow-purple-500/30 inline-block">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-xl font-semibold text-white mt-4 group-hover:text-purple-400 transition-colors">
              Raporlar
            </h3>
            <p className="text-sm text-slate-400 mt-1">Fiyat analiz raporları</p>
            <div className="mt-4 flex items-center text-xs text-slate-500 group-hover:text-slate-300 transition-colors">
              <span>Hemen başla →</span>
            </div>
          </div>

          {/* Firmalar */}
          <div
            onClick={() => router.push('/panel/firmalar')}
            className="group bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-amber-500/50 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-amber-500/10"
          >
            <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg shadow-amber-500/30 inline-block">
              <span className="text-2xl">🏢</span>
            </div>
            <h3 className="text-xl font-semibold text-white mt-4 group-hover:text-amber-400 transition-colors">
              Firmalar
            </h3>
            <p className="text-sm text-slate-400 mt-1">Firma yönetimi</p>
            <div className="mt-4 flex items-center text-xs text-slate-500 group-hover:text-slate-300 transition-colors">
              <span>Hemen başla →</span>
            </div>
          </div>

          {/* Kategoriler */}
          <div
            onClick={() => router.push('/panel/kategoriler')}
            className="group bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-rose-500/50 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-rose-500/10"
          >
            <div className="p-3 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl shadow-lg shadow-rose-500/30 inline-block">
              <span className="text-2xl">📂</span>
            </div>
            <h3 className="text-xl font-semibold text-white mt-4 group-hover:text-rose-400 transition-colors">
              Kategoriler
            </h3>
            <p className="text-sm text-slate-400 mt-1">Kategori yönetimi</p>
            <div className="mt-4 flex items-center text-xs text-slate-500 group-hover:text-slate-300 transition-colors">
              <span>Hemen başla →</span>
            </div>
          </div>

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
