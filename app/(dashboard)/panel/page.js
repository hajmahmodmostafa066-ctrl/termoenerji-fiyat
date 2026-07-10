'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import { 
  LayoutDashboard, Plus, List, Search, Layers, Building2, 
  BarChart3, Settings, Users, TrendingUp, TrendingDown, 
  DollarSign, FileText, Calendar, Clock, Menu, ChevronRight,
  Bell, Zap, Sparkles, Crown, CheckCircle, Package
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
  const [tarih, setTarih] = useState('')
  const [saat, setSaat] = useState('')

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

    const updateDateTime = () => {
      const now = new Date()
      const gunler = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi']
      const aylar = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']
      
      setTarih(`${now.getDate()} ${aylar[now.getMonth()]} ${now.getFullYear()} ${gunler[now.getDay()]}`)
      setSaat(now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    }

    fetchStats()
    updateDateTime()
    const interval = setInterval(updateDateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  const formatPrice = (price, currency = 'TRY') => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency
    }).format(price)
  }

  const menuItems = [
    { title: 'Fiyat Ekle', icon: Plus, href: '/panel/fiyat-ekle', count: '+', color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
    { title: 'Fiyat Listesi', icon: List, href: '/panel/fiyat-listesi', count: stats.toplamFiyat, color: 'text-blue-400', bg: 'bg-blue-500/20' },
    { title: 'Fiyat Sorgula', icon: Search, href: '/panel/fiyat-sorgula', count: stats.toplamFiyat, color: 'text-cyan-400', bg: 'bg-cyan-500/20' },
    { title: 'Kategoriler', icon: Layers, href: '/panel/kategoriler', count: stats.toplamKategori, color: 'text-purple-400', bg: 'bg-purple-500/20' },
    { title: 'Firmalar', icon: Building2, href: '/panel/firmalar', count: stats.toplamFirma, color: 'text-amber-400', bg: 'bg-amber-500/20' },
    { title: 'Raporlar', icon: BarChart3, href: '/panel/raporlar', count: '0', color: 'text-rose-400', bg: 'bg-rose-500/20' },
    { title: 'Yönetim', icon: Settings, href: '/panel/yonetim', count: '0', color: 'text-slate-400', bg: 'bg-slate-500/20' },
    { title: 'Kullanıcılar', icon: Users, href: '/panel/kullanıcılar', count: '0', color: 'text-indigo-400', bg: 'bg-indigo-500/20' },
  ]

  const StatCard = ({ title, value, icon: Icon, color = 'emerald', change, loading }) => {
    const colorMap = {
      emerald: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
      blue: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
      amber: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
      purple: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
    }
    const textColor = {
      emerald: 'text-emerald-400',
      blue: 'text-blue-400',
      amber: 'text-amber-400',
      purple: 'text-purple-400',
    }[color]

    return (
      <div className={`rounded-2xl p-6 border transition-all duration-300 hover:scale-105 hover:shadow-xl ${colorMap[color]}`}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-400 font-medium">{title}</p>
            {loading ? (
              <div className="h-10 w-20 bg-slate-700/50 rounded-lg animate-pulse mt-2" />
            ) : (
              <p className={`text-3xl font-bold ${textColor} mt-1`}>{value}</p>
            )}
            {change !== undefined && (
              <div className="flex items-center gap-1 mt-3">
                <TrendingUp className="h-3 w-3 text-emerald-400" />
                <span className="text-xs font-medium text-emerald-400">{Math.abs(change)}%</span>
                <span className="text-xs text-slate-500">geçen hafta</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-xl ${colorMap[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg shadow-emerald-500/40">
              <Crown className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">TermoEnerji</h1>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Sparkles className="h-3 w-3 text-emerald-400" />
                <span>Ultra Pro Max Yönetim Paneli</span>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">v.8.0</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700/50">
              <Bell className="h-4 w-4" />
              <span className="bg-emerald-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">3</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700/50">
              <Zap className="h-4 w-4 text-emerald-400 animate-pulse" />
              <span>Sistem Aktif</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            </div>
          </div>
        </div>

        {/* KARŞILAMA */}
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3 flex-wrap">
            👋 İyi Günler!
            <span className="text-sm font-normal text-emerald-400 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30">
              {stats.aktifFiyat} teklif aktif
            </span>
          </h2>
          <p className="text-slate-400 text-sm mt-1">Fiyat tekliflerinizi yönetmek için hazırsınız.</p>
          <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{tarih}</span>
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{saat}</span>
          </div>
        </div>

        {/* İSTATİSTİK KARTLARI */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Toplam Teklif" value={stats.toplamFiyat} icon={FileText} color="emerald" change={12} loading={loading} />
          <StatCard title="Aktif Teklif" value={stats.aktifFiyat} icon={CheckCircle} color="blue" change={8} loading={loading} />
          <StatCard title="Firmalar" value={stats.toplamFirma} icon={Building2} color="amber" loading={loading} />
          <StatCard title="Kategoriler" value={stats.toplamKategori} icon={Layers} color="purple" loading={loading} />
        </div>

        {/* FİRMALAR VE KATEGORİLER */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Building2 className="h-5 w-5 text-emerald-400" /> Firmalar
              </h3>
              <span className="text-xs text-slate-400">{stats.toplamFirma} kayıt</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {['Kıymetli ürün ödül', 'FIRMA', 'DİGİPİM', 'DİNİC MİSKANİK'].map((f, i) => (
                <span key={i} className="px-3 py-1.5 bg-slate-700/50 text-slate-300 rounded-lg text-sm border border-slate-600/30">{f}</span>
              ))}
            </div>
          </div>
          <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Layers className="h-5 w-5 text-purple-400" /> Kategoriler
              </h3>
              <span className="text-xs text-slate-400">{stats.toplamKategori} kayıt</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {['SCH40 BORU', 'KELEBEK VANA', 'TERMOSTAT', 'POMPA', 'KOMPRESÖR'].map((k, i) => (
                <span key={i} className="px-3 py-1.5 bg-slate-700/50 text-slate-300 rounded-lg text-sm border border-slate-600/30">{k}</span>
              ))}
            </div>
          </div>
        </div>

        {/* MENÜ VE SON TEKLİFLER */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/50">
            <h3 className="text-white font-semibold flex items-center gap-2 mb-4">
              <Menu className="h-5 w-5 text-blue-400" /> Menü
            </h3>
            <div className="space-y-2">
              {menuItems.map((item, index) => (
                <div
                  key={index}
                  onClick={() => router.push(item.href)}
                  className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl hover:bg-slate-700/30 transition-all duration-200 cursor-pointer border border-slate-700/30 hover:border-slate-600/50 group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${item.bg} group-hover:scale-110 transition-transform duration-300`}>
                      <item.icon className={`h-4 w-4 ${item.color}`} />
                    </div>
                    <span className="text-white text-sm font-medium group-hover:text-emerald-400 transition-colors">
                      {item.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-sm">{item.count}</span>
                    <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/50 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-400" /> Fiyat Teklifleri
              </h3>
              <span className="text-xs text-slate-400">Son 5 teklif</span>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-14 bg-slate-700/30 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : sonFiyatlar.length === 0 ? (
              <p className="text-slate-400 text-center py-8">Henüz teklif eklenmemiş</p>
            ) : (
              <div className="space-y-3">
                {sonFiyatlar.map((teklif) => (
                  <div
                    key={teklif.id}
                    onClick={() => router.push('/panel/fiyat-listesi')}
                    className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl border border-slate-700/30 hover:border-slate-600/50 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-slate-700/50 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500/20 transition-colors">
                        <FileText className="h-5 w-5 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-white text-sm font-medium truncate group-hover:text-emerald-400 transition-colors">
                          {teklif.urun_adi}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <span>{teklif.firma_adi}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-600" />
                          <span>{teklif.kategori || 'Genel'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                      <span className="text-emerald-400 font-bold text-sm whitespace-nowrap">
                        {formatPrice(teklif.fiyat, teklif.para_birimi)}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border whitespace-nowrap ${
                        teklif.durum === 'approved' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                        teklif.durum === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                        'bg-red-500/20 text-red-400 border-red-500/30'
                      }`}>
                        {teklif.durum === 'approved' ? '✅ Aktif' :
                         teklif.durum === 'pending' ? '⏳ Beklemede' : '❌ Pasif'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="text-center text-slate-500 text-xs py-4 border-t border-slate-700/50">
          <p>© 2024 TermoEnerji Yönetim Paneli</p>
          <p className="mt-1">Fiyat Teklif Yönetim Sistemi v.8.0</p>
        </div>

      </div>
    </div>
  )
}
