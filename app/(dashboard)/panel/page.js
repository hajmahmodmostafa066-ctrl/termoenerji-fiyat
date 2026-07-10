'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
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
  TrendingUp,
  DollarSign,
  Package,
  ArrowRight,
  Sparkles,
  Zap,
  Crown
} from 'lucide-react'

export default function PanelPage() {
  const router = useRouter()
  const [stats, setStats] = useState({
    toplamFiyat: 0,
    aktifFiyat: 0,
    toplamFirma: 0,
    toplamKategori: 0
  })
  const [sonFiyatlar, setSonFiyatlar] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { count: fiyatCount } = await supabase
          .from('fiyat_teklifleri')
          .select('*', { count: 'exact', head: true })

        const { count: aktifCount } = await supabase
          .from('fiyat_teklifleri')
          .select('*', { count: 'exact', head: true })
          .eq('durum', 'approved')

        const { count: firmaCount } = await supabase
          .from('firmalar')
          .select('*', { count: 'exact', head: true })

        const { count: kategoriCount } = await supabase
          .from('kategoriler')
          .select('*', { count: 'exact', head: true })

        const { data: sonFiyatlar } = await supabase
          .from('fiyat_teklifleri')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5)

        setStats({
          toplamFiyat: fiyatCount || 0,
          aktifFiyat: aktifCount || 0,
          toplamFirma: firmaCount || 0,
          toplamKategori: kategoriCount || 0
        })
        setSonFiyatlar(sonFiyatlar || [])
      } catch (error) {
        console.error('İstatistik yükleme hatası:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const menuItems = [
    { 
      title: 'Fiyat Ekle', 
      icon: Plus, 
      href: '/panel/fiyat-ekle', 
      gradient: 'from-emerald-500 via-emerald-400 to-emerald-300',
      glow: 'shadow-emerald-500/50',
      bg: 'bg-emerald-500/10 hover:bg-emerald-500/20',
      border: 'border-emerald-500/20 hover:border-emerald-400',
      emoji: '💰'
    },
    { 
      title: 'Fiyat Listesi', 
      icon: List, 
      href: '/panel/fiyat-listesi', 
      gradient: 'from-blue-500 via-blue-400 to-blue-300',
      glow: 'shadow-blue-500/50',
      bg: 'bg-blue-500/10 hover:bg-blue-500/20',
      border: 'border-blue-500/20 hover:border-blue-400',
      emoji: '📋'
    },
    { 
      title: 'Fiyat Sorgula', 
      icon: Search, 
      href: '/panel/fiyat-sorgula', 
      gradient: 'from-cyan-500 via-cyan-400 to-cyan-300',
      glow: 'shadow-cyan-500/50',
      bg: 'bg-cyan-500/10 hover:bg-cyan-500/20',
      border: 'border-cyan-500/20 hover:border-cyan-400',
      emoji: '🔍'
    },
    { 
      title: 'Kategoriler', 
      icon: Layers, 
      href: '/panel/kategoriler', 
      gradient: 'from-purple-500 via-purple-400 to-purple-300',
      glow: 'shadow-purple-500/50',
      bg: 'bg-purple-500/10 hover:bg-purple-500/20',
      border: 'border-purple-500/20 hover:border-purple-400',
      emoji: '📂'
    },
    { 
      title: 'Firmalar', 
      icon: Building2, 
      href: '/panel/firmalar', 
      gradient: 'from-amber-500 via-amber-400 to-amber-300',
      glow: 'shadow-amber-500/50',
      bg: 'bg-amber-500/10 hover:bg-amber-500/20',
      border: 'border-amber-500/20 hover:border-amber-400',
      emoji: '🏢'
    },
    { 
      title: 'Raporlar', 
      icon: BarChart3, 
      href: '/panel/raporlar', 
      gradient: 'from-rose-500 via-rose-400 to-rose-300',
      glow: 'shadow-rose-500/50',
      bg: 'bg-rose-500/10 hover:bg-rose-500/20',
      border: 'border-rose-500/20 hover:border-rose-400',
      emoji: '📊'
    },
    { 
      title: 'Yönetim', 
      icon: Settings, 
      href: '/panel/yonetim', 
      gradient: 'from-slate-500 via-slate-400 to-slate-300',
      glow: 'shadow-slate-500/50',
      bg: 'bg-slate-500/10 hover:bg-slate-500/20',
      border: 'border-slate-500/20 hover:border-slate-400',
      emoji: '⚙️'
    },
    { 
      title: 'Kullanıcılar', 
      icon: Users, 
      href: '/panel/kullanıcılar', 
      gradient: 'from-indigo-500 via-indigo-400 to-indigo-300',
      glow: 'shadow-indigo-500/50',
      bg: 'bg-indigo-500/10 hover:bg-indigo-500/20',
      border: 'border-indigo-500/20 hover:border-indigo-400',
      emoji: '👥'
    },
  ]

  return (
    <div className="space-y-8">
      {/* HERO BÖLÜMÜ */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950/50 via-blue-950/30 to-purple-950/50 border border-slate-700/50 p-8">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMxMGI5ODEiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-20" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-2xl shadow-emerald-500/40 animate-pulse">
              <Crown className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400">
                TermoEnerji
              </h1>
              <p className="text-slate-300 text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-400" />
                Ultra Pro Max Yönetim Paneli
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-slate-800/50 backdrop-blur-sm rounded-full px-4 py-2 border border-slate-700/50">
            <Zap className="h-4 w-4 text-emerald-400 animate-pulse" />
            <span className="text-slate-300 text-sm">Sistem Aktif</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
        </div>
      </div>

      {/* İSTATİSTİK KARTLARI */}
      {!loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="group relative bg-gradient-to-br from-slate-800/50 to-slate-700/50 rounded-2xl p-6 border border-slate-700/50 hover:border-emerald-500/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-500/20 rounded-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <DollarSign className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Toplam Fiyat</p>
                  <p className="text-3xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {stats.toplamFiyat}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="group relative bg-gradient-to-br from-slate-800/50 to-slate-700/50 rounded-2xl p-6 border border-slate-700/50 hover:border-blue-500/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-500/20 rounded-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <TrendingUp className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Aktif Fiyat</p>
                  <p className="text-3xl font-bold text-blue-400">
                    {stats.aktifFiyat}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="group relative bg-gradient-to-br from-slate-800/50 to-slate-700/50 rounded-2xl p-6 border border-slate-700/50 hover:border-amber-500/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-500/20 rounded-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <Building2 className="h-6 w-6 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Firma</p>
                  <p className="text-3xl font-bold text-white group-hover:text-amber-400 transition-colors">
                    {stats.toplamFirma}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="group relative bg-gradient-to-br from-slate-800/50 to-slate-700/50 rounded-2xl p-6 border border-slate-700/50 hover:border-purple-500/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-500/20 rounded-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  <Layers className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Kategori</p>
                  <p className="text-3xl font-bold text-white group-hover:text-purple-400 transition-colors">
                    {stats.toplamKategori}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MENÜ GRİD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={() => router.push(item.href)}
            className={`group relative bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border ${item.border} transition-all duration-500 hover:scale-105 hover:shadow-2xl ${item.glow} overflow-hidden text-left`}
          >
            {/* Arka Plan Işık Efekti */}
            <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-700`} />
            
            {/* Işık Çizgisi */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

            <div className="relative z-10">
              <div className="flex items-center gap-4">
                <div className={`p-3 bg-gradient-to-br ${item.gradient} rounded-2xl shadow-xl ${item.glow} group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                  <item.icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-emerald-400 group-hover:to-blue-400 transition-all duration-500">
                    {item.title}
                  </h3>
                  <p className="text-slate-400 text-xs flex items-center gap-1 group-hover:text-slate-300 transition-colors">
                    Hemen başla <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform duration-300" />
                  </p>
                </div>
                <span className="text-2xl opacity-20 group-hover:opacity-100 transition-opacity duration-500">
                  {item.emoji}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* SON FİYATLAR */}
      {sonFiyatlar.length > 0 && (
        <div className="relative bg-gradient-to-br from-slate-800/30 to-slate-700/30 rounded-2xl p-6 border border-slate-700/50 backdrop-blur-sm overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-blue-500/5 to-purple-500/5" />
          
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg shadow-emerald-500/25">
                <Package className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-white font-semibold">📋 Son Eklenen Fiyatlar</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-3 text-slate-400 font-medium">Ürün</th>
                    <th className="text-left py-3 px-3 text-slate-400 font-medium">Firma</th>
                    <th className="text-right py-3 px-3 text-slate-400 font-medium">Fiyat</th>
                    <th className="text-center py-3 px-3 text-slate-400 font-medium">Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {sonFiyatlar.map((item) => (
                    <tr key={item.id} className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-all duration-300 group">
                      <td className="py-3 px-3 text-white font-medium group-hover:text-emerald-400 transition-colors">
                        {item.urun_adi}
                      </td>
                      <td className="py-3 px-3 text-slate-300">{item.firma_adi}</td>
                      <td className="py-3 px-3 text-emerald-400 font-bold text-right">
                        {new Intl.NumberFormat('tr-TR', {
                          style: 'currency',
                          currency: item.para_birimi || 'TRY',
                        }).format(item.fiyat)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          item.durum === 'approved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          item.durum === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                          'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                          {item.durum === 'approved' ? '✅ Onaylandı' :
                           item.durum === 'pending' ? '⏳ Beklemede' : '❌ Reddedildi'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
