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
  Flame,
  Snowflake
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

  // Menü öğeleri logodaki Mavi(Soğuk), Turuncu(Sıcak) ve Yeşil(Verim) temasına göre uyarlandı
  const menuItems = [
    { 
      title: 'Fiyat Ekle', 
      icon: Plus, 
      href: '/panel/fiyat-ekle', 
      gradient: 'from-amber-500 to-amber-400',
      glow: 'shadow-amber-500/30 hover:shadow-amber-500/50',
      border: 'border-amber-500/20 hover:border-amber-400/50',
      textHover: 'group-hover:text-amber-400'
    },
    { 
      title: 'Fiyat Listesi', 
      icon: List, 
      href: '/panel/fiyat-listesi', 
      gradient: 'from-sky-500 to-sky-400',
      glow: 'shadow-sky-500/30 hover:shadow-sky-500/50',
      border: 'border-sky-500/20 hover:border-sky-400/50',
      textHover: 'group-hover:text-sky-400'
    },
    { 
      title: 'Fiyat Sorgula', 
      icon: Search, 
      href: '/panel/fiyat-sorgula', 
      gradient: 'from-emerald-500 to-emerald-400',
      glow: 'shadow-emerald-500/30 hover:shadow-emerald-500/50',
      border: 'border-emerald-500/20 hover:border-emerald-400/50',
      textHover: 'group-hover:text-emerald-400'
    },
    { 
      title: 'Kategoriler', 
      icon: Layers, 
      href: '/panel/kategoriler', 
      gradient: 'from-slate-600 to-slate-500',
      glow: 'shadow-slate-500/30 hover:shadow-slate-500/50',
      border: 'border-slate-500/20 hover:border-slate-400/50',
      textHover: 'group-hover:text-slate-300'
    },
    { 
      title: 'Firmalar', 
      icon: Building2, 
      href: '/panel/firmalar', 
      gradient: 'from-amber-500 to-orange-400',
      glow: 'shadow-orange-500/30 hover:shadow-orange-500/50',
      border: 'border-orange-500/20 hover:border-orange-400/50',
      textHover: 'group-hover:text-orange-400'
    },
    { 
      title: 'Raporlar', 
      icon: BarChart3, 
      href: '/panel/raporlar', 
      gradient: 'from-sky-500 to-blue-400',
      glow: 'shadow-blue-500/30 hover:shadow-blue-500/50',
      border: 'border-blue-500/20 hover:border-blue-400/50',
      textHover: 'group-hover:text-blue-400'
    },
    { 
      title: 'Yönetim', 
      icon: Settings, 
      href: '/panel/yonetim', 
      gradient: 'from-slate-600 to-slate-500',
      glow: 'shadow-slate-500/30 hover:shadow-slate-500/50',
      border: 'border-slate-500/20 hover:border-slate-400/50',
      textHover: 'group-hover:text-slate-300'
    },
    { 
      title: 'Kullanıcılar', 
      icon: Users, 
      href: '/panel/kullanıcılar', 
      gradient: 'from-emerald-500 to-teal-400',
      glow: 'shadow-teal-500/30 hover:shadow-teal-500/50',
      border: 'border-teal-500/20 hover:border-teal-400/50',
      textHover: 'group-hover:text-teal-400'
    },
  ]

  return (
    <div className="space-y-8 bg-slate-900 min-h-screen text-slate-200">
      
      {/* HERO BÖLÜMÜ - Kurumsal ve Tematik */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-800/50 border border-slate-700/50 p-8 shadow-2xl">
        {/* Arka plan tematik ışık yansımaları (Buz Mavisi ve Güneş Sarısı) */}
        <div className="absolute top-0 left-0 w-1/2 h-full bg-sky-500/10 blur-3xl rounded-full mix-blend-screen pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-1/2 h-full bg-amber-500/10 blur-3xl rounded-full mix-blend-screen pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="flex items-center justify-center w-16 h-16 bg-slate-800 rounded-2xl shadow-inner border border-slate-700/50 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-sky-400/20 to-amber-400/20" />
              {/* Logonun iki yarısını simgeleyen ikonlar */}
              <Snowflake className="h-7 w-7 text-sky-400 absolute left-2" />
              <Flame className="h-7 w-7 text-amber-500 absolute right-2" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                <span className="text-slate-100">TERMO</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-500">ENERJİ</span>
              </h1>
              <p className="text-slate-400 text-sm flex items-center gap-2 mt-1 font-medium">
                <Sparkles className="h-4 w-4 text-emerald-400" />
                Merkezi Yönetim Sistemi
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-slate-900/80 backdrop-blur-md rounded-full px-5 py-2.5 border border-slate-700/50 shadow-lg">
            <Zap className="h-4 w-4 text-amber-400 animate-pulse" />
            <span className="text-slate-200 text-sm font-medium tracking-wide">Sistem Aktif</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          </div>
        </div>
      </div>

      {/* İSTATİSTİK KARTLARI */}
      {!loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {/* Toplam Fiyat (Sky Blue Theme) */}
          <div className="group relative bg-slate-800/40 rounded-2xl p-6 border border-slate-700/50 hover:border-sky-500/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-sky-500/10 overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <DollarSign className="w-16 h-16 text-sky-400" />
            </div>
            <div className="relative z-10 flex items-center gap-4">
              <div className="p-3 bg-sky-500/10 text-sky-400 rounded-xl group-hover:scale-110 transition-transform duration-300 border border-sky-500/20">
                <DollarSign className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400">Toplam Fiyat</p>
                <p className="text-2xl font-bold text-slate-100 group-hover:text-sky-400 transition-colors">
                  {stats.toplamFiyat}
                </p>
              </div>
            </div>
          </div>

          {/* Aktif Fiyat (Emerald Green Theme) */}
          <div className="group relative bg-slate-800/40 rounded-2xl p-6 border border-slate-700/50 hover:border-emerald-500/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/10 overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <TrendingUp className="w-16 h-16 text-emerald-400" />
            </div>
            <div className="relative z-10 flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl group-hover:scale-110 transition-transform duration-300 border border-emerald-500/20">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400">Aktif Teklif</p>
                <p className="text-2xl font-bold text-slate-100 group-hover:text-emerald-400 transition-colors">
                  {stats.aktifFiyat}
                </p>
              </div>
            </div>
          </div>

          {/* Firma (Amber Orange Theme) */}
          <div className="group relative bg-slate-800/40 rounded-2xl p-6 border border-slate-700/50 hover:border-amber-500/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/10 overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Building2 className="w-16 h-16 text-amber-400" />
            </div>
            <div className="relative z-10 flex items-center gap-4">
              <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl group-hover:scale-110 transition-transform duration-300 border border-amber-500/20">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400">Kayıtlı Firma</p>
                <p className="text-2xl font-bold text-slate-100 group-hover:text-amber-400 transition-colors">
                  {stats.toplamFirma}
                </p>
              </div>
            </div>
          </div>

          {/* Kategori (Slate Theme) */}
          <div className="group relative bg-slate-800/40 rounded-2xl p-6 border border-slate-700/50 hover:border-slate-400/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-500/10 overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Layers className="w-16 h-16 text-slate-400" />
            </div>
            <div className="relative z-10 flex items-center gap-4">
              <div className="p-3 bg-slate-700/50 text-slate-300 rounded-xl group-hover:scale-110 transition-transform duration-300 border border-slate-600/50">
                <Layers className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400">Kategori</p>
                <p className="text-2xl font-bold text-slate-100 group-hover:text-white transition-colors">
                  {stats.toplamKategori}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MENÜ GRİD - Sadeleştirilmiş ve Kurumsallaştırılmış */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={() => router.push(item.href)}
            className={`group relative bg-slate-800/40 backdrop-blur-sm rounded-2xl p-5 border ${item.border} transition-all duration-300 hover:-translate-y-1 overflow-hidden text-left shadow-lg ${item.glow}`}
          >
            {/* İnce Işık Efekti */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />

            <div className="relative z-10 flex items-center gap-4">
              <div className={`p-3 bg-gradient-to-br ${item.gradient} rounded-xl shadow-inner group-hover:scale-105 transition-transform duration-300`}>
                <item.icon className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold text-slate-200 transition-colors duration-300 ${item.textHover}`}>
                  {item.title}
                </h3>
                <p className="text-slate-400 text-xs flex items-center gap-1 mt-0.5 group-hover:text-slate-300 transition-colors">
                  Yönetime git <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform duration-300" />
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* SON EKLENEN FİYATLAR TABLOSU */}
      {sonFiyatlar.length > 0 && (
        <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 overflow-hidden shadow-xl">
          <div className="p-6 border-b border-slate-700/50 flex items-center gap-3">
            <div className="p-2.5 bg-slate-700/50 rounded-lg border border-slate-600/50">
              <Package className="h-5 w-5 text-slate-300" />
            </div>
            <h2 className="text-lg font-semibold text-slate-100">Son İşlem Gören Teklifler</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-900/50 text-slate-400 font-medium text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-4 px-6">Ürün / Hizmet</th>
                  <th className="py-4 px-6">Firma Detayı</th>
                  <th className="py-4 px-6 text-right">Tutar</th>
                  <th className="py-4 px-6 text-center">Mevcut Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {sonFiyatlar.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/60 transition-colors duration-200 group">
                    <td className="py-4 px-6 text-slate-200 font-medium group-hover:text-sky-400 transition-colors">
                      {item.urun_adi}
                    </td>
                    <td className="py-4 px-6 text-slate-400 flex items-center gap-2">
                      <Building2 className="h-4 w-4 opacity-50" />
                      {item.firma_adi}
                    </td>
                    <td className="py-4 px-6 text-right font-semibold text-slate-200 group-hover:text-amber-400 transition-colors">
                      {new Intl.NumberFormat('tr-TR', {
                        style: 'currency',
                        currency: item.para_birimi || 'TRY',
                      }).format(item.fiyat)}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                        item.durum === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        item.durum === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          item.durum === 'approved' ? 'bg-emerald-400' :
                          item.durum === 'pending' ? 'bg-amber-400' :
                          'bg-red-400'
                        }`} />
                        {item.durum === 'approved' ? 'Onaylandı' :
                         item.durum === 'pending' ? 'Beklemede' : 'Reddedildi'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
