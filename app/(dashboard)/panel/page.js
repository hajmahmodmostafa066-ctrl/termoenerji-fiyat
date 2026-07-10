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
  TrendingDown,
  DollarSign,
  FileText,
  Calendar,
  Clock,
  Menu,
  ChevronRight,
  Bell,
  Zap,
  Sparkles,
  Crown,
  CheckCircle
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
    { title: 'Fiyat Ekle', icon: Plus, href: '/panel/fiyat-ekle', count: '+', color: '#10b981' },
    { title: 'Fiyat Listesi', icon: List, href: '/panel/fiyat-listesi', count: stats.toplamFiyat, color: '#3b82f6' },
    { title: 'Fiyat Sorgula', icon: Search, href: '/panel/fiyat-sorgula', count: stats.toplamFiyat, color: '#06b6d4' },
    { title: 'Kategoriler', icon: Layers, href: '/panel/kategoriler', count: stats.toplamKategori, color: '#8b5cf6' },
    { title: 'Firmalar', icon: Building2, href: '/panel/firmalar', count: stats.toplamFirma, color: '#f59e0b' },
    { title: 'Raporlar', icon: BarChart3, href: '/panel/raporlar', count: '0', color: '#f43f5e' },
    { title: 'Yönetim', icon: Settings, href: '/panel/yonetim', count: '0', color: '#64748b' },
    { title: 'Kullanıcılar', icon: Users, href: '/panel/kullanıcılar', count: '0', color: '#6366f1' },
  ]

  const StatCard = ({ title, value, icon: Icon, color, subtitle, change, loading }) => {
    const bgColor = color + '20'
    const borderColor = color + '40'
    const textColor = color

    return (
      <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 hover:border-opacity-50 transition-all duration-300 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400 font-medium tracking-wide uppercase">{title}</p>
              {loading ? (
                <div className="h-10 w-24 bg-slate-700/50 rounded-lg animate-pulse mt-2" />
              ) : (
                <p className="text-3xl font-bold text-white mt-1 tracking-tight">{value}</p>
              )}
              {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
              {change !== undefined && (
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="h-3 w-3" style={{ color: textColor }} />
                  <span className="text-xs font-medium" style={{ color: textColor }}>{Math.abs(change)}%</span>
                  <span className="text-xs text-slate-500">geçen hafta</span>
                </div>
              )}
            </div>
            <div className="p-3 rounded-xl transition-all duration-300 group-hover:scale-110" style={{ backgroundColor: bgColor }}>
              <Icon className="h-6 w-6" style={{ color: textColor }} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  const MenuItem = ({ title, icon: Icon, href, count, color, onClick }) => {
    const bgColor = color + '20'
    const textColor = color

    return (
      <div
        onClick={() => onClick()}
        className="group flex items-center justify-between p-3 bg-slate-800/30 rounded-xl hover:bg-slate-700/40 transition-all duration-300 cursor-pointer border border-slate-700/30 hover:border-opacity-50"
        style={{ borderColor: color + '40' }}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg transition-all duration-300 group-hover:scale-110" style={{ backgroundColor: bgColor }}>
            <Icon className="h-4 w-4" style={{ color: textColor }} />
          </div>
          <span className="text-white text-sm font-medium group-hover:text-white transition-colors">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400 font-mono">{count}</span>
          <ChevronRight className="h-4 w-4 text-slate-500 group-hover:translate-x-1 transition-transform duration-300" style={{ color: textColor }} />
        </div>
      </div>
    )
  }

  const TeklifCard = ({ teklif, onClick }) => {
    const durumColors = {
      approved: '#10b981',
      pending: '#eab308',
      rejected: '#ef4444'
    }
    const durumLabels = {
      approved: '✅ Aktif',
      pending: '⏳ Beklemede',
      rejected: '❌ Pasif'
    }
    const durumBg = {
      approved: '#10b98120',
      pending: '#eab30820',
      rejected: '#ef444420'
    }

    return (
      <div
        onClick={onClick}
        className="group p-3 bg-slate-800/30 rounded-xl border border-slate-700/30 hover:bg-slate-700/40 transition-all duration-300 cursor-pointer"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-slate-700/50 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
              <FileText className="h-5 w-5 text-slate-400 group-hover:text-emerald-400 transition-colors" />
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate group-hover:text-emerald-400 transition-colors">{teklif.urun_adi}</p>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>{teklif.firma_adi}</span>
                <span className="w-1 h-1 rounded-full bg-slate-600" />
                <span>{teklif.kategori || 'Genel'}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="text-emerald-400 font-bold text-sm">{formatPrice(teklif.fiyat, teklif.para_birimi)}</span>
            <span className="text-xs px-2 py-0.5 rounded-full border" style={{ color: durumColors[teklif.durum] || '#eab308', backgroundColor: durumBg[teklif.durum] || '#eab30820', borderColor: durumColors[teklif.durum] || '#eab308' }}>
              {durumLabels[teklif.durum] || '⏳ Beklemede'}
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="relative overflow-hidden bg-slate-800/30 rounded-3xl p-6 border border-slate-700/50 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10" />
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg shadow-emerald-500/40">
                <Crown className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">TermoEnerji</h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-emerald-400" />
                    Ultra Pro Max Yönetim Paneli
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full text-xs border border-emerald-500/30 flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    v.8.0
                  </span>
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
        </div>

        {/* KARŞILAMA */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
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
        </div>

        {/* İSTATİSTİK KARTLARI */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title="Toplam Teklif" value={stats.toplamFiyat} icon={FileText} color="#10b981" change={12} loading={loading} />
          <StatCard title="Aktif Teklif" value={stats.aktifFiyat} icon={CheckCircle} color="#3b82f6" change={8} loading={loading} />
          <StatCard title="Firmalar" value={stats.toplamFirma} icon={Building2} color="#f59e0b" subtitle={`${stats.toplamFirma} kayıtlı`} loading={loading} />
          <StatCard title="Kategoriler" value={stats.toplamKategori} icon={Layers} color="#8b5cf6" subtitle={`${stats.toplamKategori} kategori`} loading={loading} />
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

        {/* MENÜ VE SON FİYATLAR */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/50">
            <h3 className="text-white font-semibold flex items-center gap-2 mb-4">
              <Menu className="h-5 w-5 text-blue-400" /> Menü
            </h3>
            <div className="space-y-2">
              {menuItems.map((item, index) => (
                <MenuItem key={index} title={item.title} icon={item.icon} href={item.href} count={item.count} color={item.color} onClick={() => router.push(item.href)} />
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
              <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-14 bg-slate-700/30 rounded-xl animate-pulse" />)}</div>
            ) : sonFiyatlar.length === 0 ? (
              <p className="text-slate-400 text-center py-8">Henüz teklif eklenmemiş</p>
            ) : (
              <div className="space-y-3">{sonFiyatlar.map((teklif) => <TeklifCard key={teklif.id} teklif={teklif} onClick={() => router.push('/panel/fiyat-listesi')} />)}</div>
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
