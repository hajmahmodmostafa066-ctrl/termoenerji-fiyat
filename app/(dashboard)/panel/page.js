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
  FileText,
  Calendar,
  Clock,
  Menu,
  ChevronRight
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

  const menuItems = [
    { title: 'Fiyat Listesi', icon: List, href: '/panel/fiyat-listesi', count: stats.toplamFiyat, color: 'blue' },
    { title: 'Fiyat Ekle', icon: Plus, href: '/panel/fiyat-ekle', count: '+', color: 'emerald' },
    { title: 'Fiyat Sorgula', icon: Search, href: '/panel/fiyat-sorgula', count: stats.toplamFiyat, color: 'cyan' },
    { title: 'Kategoriler', icon: Layers, href: '/panel/kategoriler', count: stats.toplamKategori, color: 'purple' },
    { title: 'Firmalar', icon: Building2, href: '/panel/firmalar', count: stats.toplamFirma, color: 'amber' },
    { title: 'Raporlar', icon: BarChart3, href: '/panel/raporlar', count: '0', color: 'rose' },
    { title: 'Yönetim', icon: Settings, href: '/panel/yonetim', count: '0', color: 'slate' },
    { title: 'Kullanıcılar', icon: Users, href: '/panel/kullanıcılar', count: '0', color: 'indigo' },
  ]

  const formatPrice = (price, currency = 'TRY') => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency
    }).format(price)
  }

  return (
    <div className="space-y-6">
      {/* KARŞILAMA */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            👋 İyi Günler!
            <span className="text-sm font-normal text-emerald-400 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30">
              {stats.aktifFiyat} teklif aktif
            </span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Fiyat tekliflerinizi yönetmek için hazırsınız.</p>
          <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {tarih}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {saat}
            </span>
          </div>
        </div>
      </div>

      {/* İSTATİSTİK KARTLARI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 hover:border-emerald-500/50 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Fiyat Teklifleri</p>
              <p className="text-3xl font-bold text-white">{stats.toplamFiyat}</p>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-xs text-emerald-400 flex items-center gap-0.5">
                  <TrendingUp className="h-3 w-3" />
                  +12%
                </span>
                <span className="text-xs text-slate-500">geçen hafta</span>
              </div>
            </div>
            <div className="p-3 bg-emerald-500/20 rounded-xl">
              <FileText className="h-6 w-6 text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 hover:border-amber-500/50 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Kayıtlı Firmalar</p>
              <p className="text-3xl font-bold text-white">{stats.toplamFirma}</p>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-xs text-emerald-400 flex items-center gap-0.5">
                  <TrendingUp className="h-3 w-3" />
                  +{stats.toplamFirma > 0 ? 1 : 0}
                </span>
                <span className="text-xs text-slate-500">yeni firma</span>
              </div>
            </div>
            <div className="p-3 bg-amber-500/20 rounded-xl">
              <Building2 className="h-6 w-6 text-amber-400" />
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Ürün Kategorileri</p>
              <p className="text-3xl font-bold text-white">{stats.toplamKategori}</p>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-xs text-slate-500">Toplam {stats.toplamKategori} kategori</span>
              </div>
            </div>
            <div className="p-3 bg-purple-500/20 rounded-xl">
              <Layers className="h-6 w-6 text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* FIRMALAR VE KATEGORİLER */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Building2 className="h-5 w-5 text-emerald-400" />
              Firmalar
            </h3>
            <span className="text-xs text-slate-400">{stats.toplamFirma} kayıt</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1.5 bg-slate-700/50 text-slate-300 rounded-lg text-sm border border-slate-600/30">
              Kıymetli ürün ödül
            </span>
            <span className="px-3 py-1.5 bg-slate-700/50 text-slate-300 rounded-lg text-sm border border-slate-600/30">
              FIRMA
            </span>
            <span className="px-3 py-1.5 bg-slate-700/50 text-slate-300 rounded-lg text-sm border border-slate-600/30">
              DİGİPİM
            </span>
            <span className="px-3 py-1.5 bg-slate-700/50 text-slate-300 rounded-lg text-sm border border-slate-600/30">
              DİNİC MİSKANİK
            </span>
          </div>
        </div>

        <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Layers className="h-5 w-5 text-purple-400" />
              Kategoriler
            </h3>
            <span className="text-xs text-slate-400">{stats.toplamKategori} kayıt</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {['SCH40 BORU', 'KELEBEK VANA', 'TERMOSTAT', 'POMPA', 'KOMPRESÖR'].map((kat, i) => (
              <span key={i} className="px-3 py-1.5 bg-slate-700/50 text-slate-300 rounded-lg text-sm border border-slate-600/30">
                {kat}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* MENÜ VE SON FİYATLAR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/50">
          <h3 className="text-white font-semibold flex items-center gap-2 mb-4">
            <Menu className="h-5 w-5 text-blue-400" />
            Menü
          </h3>
          <div className="space-y-2">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => router.push(item.href)}
                className="flex items-center justify-between w-full p-3 bg-slate-800/30 rounded-xl hover:bg-slate-700/30 transition-all duration-200 border border-slate-700/30 hover:border-slate-600/50"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-700/50 rounded-lg">
                    <item.icon className="h-4 w-4 text-slate-400" />
                  </div>
                  <span className="text-white text-sm font-medium">{item.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-sm">{item.count}</span>
                  <ChevronRight className="h-4 w-4 text-slate-500" />
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/50 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-400" />
              Fiyat Teklifleri
            </h3>
            <span className="text-xs text-slate-400">Son 5 teklif</span>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 bg-slate-700/30 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : sonFiyatlar.length === 0 ? (
            <p className="text-slate-400 text-center py-8">Henüz teklif eklenmemiş</p>
          ) : (
            <div className="space-y-3">
              {sonFiyatlar.map((teklif) => (
                <div 
                  key={teklif.id}
                  className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl border border-slate-700/30 hover:border-slate-600/50 transition-all cursor-pointer"
                  onClick={() => router.push('/panel/fiyat-listesi')}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-slate-700/50 flex items-center justify-center flex-shrink-0">
                      <FileText className="h-5 w-5 text-slate-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-white text-sm font-medium truncate">{teklif.urun_adi}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span>{teklif.firma_adi}</span>
                        <span>•</span>
                        <span>{teklif.kategori || 'Genel'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-emerald-400 font-bold text-sm">
                      {formatPrice(teklif.fiyat, teklif.para_birimi)}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      teklif.durum === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                      teklif.durum === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
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
  )
}
