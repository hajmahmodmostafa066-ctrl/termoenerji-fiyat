'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import { 
  Plus, List, Search, Layers, Building2, BarChart3, 
  Settings, Users, FileText, Calendar, Clock, Menu, 
  ChevronRight, Bell, Zap, Sparkles, Crown, CheckCircle
} from 'lucide-react'

export default function PanelPage() {
  const router = useRouter()
  const [stats, setStats] = useState({ toplamFiyat: 0, aktifFiyat: 0, toplamFirma: 0, toplamKategori: 0 })
  const [sonFiyatlar, setSonFiyatlar] = useState([])
  const [loading, setLoading] = useState(true)
  const [tarih, setTarih] = useState('')
  const [saat, setSaat] = useState('')

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { count: fiyatCount } = await supabase.from('fiyat_teklifleri').select('*', { count: 'exact', head: true })
        const { count: aktifCount } = await supabase.from('fiyat_teklifleri').select('*', { count: 'exact', head: true }).eq('durum', 'approved')
        const { count: firmaCount } = await supabase.from('firmalar').select('*', { count: 'exact', head: true })
        const { count: kategoriCount } = await supabase.from('kategoriler').select('*', { count: 'exact', head: true })
        const { data: sonFiyatlar } = await supabase.from('fiyat_teklifleri').select('*').order('created_at', { ascending: false }).limit(5)
        setStats({ toplamFiyat: fiyatCount || 0, aktifFiyat: aktifCount || 0, toplamFirma: firmaCount || 0, toplamKategori: kategoriCount || 0 })
        setSonFiyatlar(sonFiyatlar || [])
      } catch (error) { console.error('İstatistik yükleme hatası:', error) } 
      finally { setLoading(false) }
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
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency }).format(price)
  }

  const menuItems = [
    { title: 'Fiyat Ekle', icon: Plus, href: '/panel/fiyat-ekle', count: '+' },
    { title: 'Fiyat Listesi', icon: List, href: '/panel/fiyat-listesi', count: stats.toplamFiyat },
    { title: 'Fiyat Sorgula', icon: Search, href: '/panel/fiyat-sorgula', count: stats.toplamFiyat },
    { title: 'Kategoriler', icon: Layers, href: '/panel/kategoriler', count: stats.toplamKategori },
    { title: 'Firmalar', icon: Building2, href: '/panel/firmalar', count: stats.toplamFirma },
    { title: 'Raporlar', icon: BarChart3, href: '/panel/raporlar', count: '0' },
    { title: 'Yönetim', icon: Settings, href: '/panel/yonetim', count: '0' },
    { title: 'Kullanıcılar', icon: Users, href: '/panel/kullanıcılar', count: '0' },
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500 rounded-xl">
            <Crown className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">TermoEnerji</h1>
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
            <Zap className="h-4 w-4 text-emerald-400" />
            <span>Sistem Aktif</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </div>
        </div>
      </div>

      {/* KARŞILAMA */}
      <div className="mb-6">
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-800/30 p-5 rounded-2xl border border-slate-700/50">
          <p className="text-sm text-slate-400">Toplam Teklif</p>
          <p className="text-2xl font-bold text-white">{stats.toplamFiyat}</p>
          <p className="text-xs text-emerald-400 mt-1">↑ 12% geçen hafta</p>
        </div>
        <div className="bg-slate-800/30 p-5 rounded-2xl border border-slate-700/50">
          <p className="text-sm text-slate-400">Aktif Teklif</p>
          <p className="text-2xl font-bold text-emerald-400">{stats.aktifFiyat}</p>
          <p className="text-xs text-blue-400 mt-1">↑ 8% geçen hafta</p>
        </div>
        <div className="bg-slate-800/30 p-5 rounded-2xl border border-slate-700/50">
          <p className="text-sm text-slate-400">Firmalar</p>
          <p className="text-2xl font-bold text-amber-400">{stats.toplamFirma}</p>
          <p className="text-xs text-slate-500 mt-1">{stats.toplamFirma} kayıtlı</p>
        </div>
        <div className="bg-slate-800/30 p-5 rounded-2xl border border-slate-700/50">
          <p className="text-sm text-slate-400">Kategoriler</p>
          <p className="text-2xl font-bold text-purple-400">{stats.toplamKategori}</p>
          <p className="text-xs text-slate-500 mt-1">{stats.toplamKategori} kategori</p>
        </div>
      </div>

      {/* FİRMALAR VE KATEGORİLER */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-800/30 p-5 rounded-2xl border border-slate-700/50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold">🏢 Firmalar</h3>
            <span className="text-xs text-slate-400">{stats.toplamFirma} kayıt</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {['Kıymetli ürün ödül', 'FIRMA', 'DİGİPİM', 'DİNİC MİSKANİK'].map((f, i) => (
              <span key={i} className="px-3 py-1.5 bg-slate-700/50 text-slate-300 rounded-lg text-sm border border-slate-600/30">{f}</span>
            ))}
          </div>
        </div>
        <div className="bg-slate-800/30 p-5 rounded-2xl border border-slate-700/50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold">📂 Kategoriler</h3>
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
        <div className="bg-slate-800/30 p-5 rounded-2xl border border-slate-700/50">
          <h3 className="text-white font-semibold mb-3">📋 Menü</h3>
          <div className="space-y-2">
            {menuItems.map((item, index) => (
              <div key={index} onClick={() => router.push(item.href)} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl hover:bg-slate-700/30 transition cursor-pointer border border-slate-700/30">
                <div className="flex items-center gap-3">
                  <item.icon className="h-4 w-4 text-slate-400" />
                  <span className="text-white text-sm">{item.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-400">{item.count}</span>
                  <ChevronRight className="h-4 w-4 text-slate-500" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-slate-800/30 p-5 rounded-2xl border border-slate-700/50 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold">📄 Fiyat Teklifleri</h3>
            <span className="text-xs text-slate-400">Son 5 teklif</span>
          </div>
          {loading ? (
            <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-14 bg-slate-700/30 rounded-xl animate-pulse" />)}</div>
          ) : sonFiyatlar.length === 0 ? (
            <p className="text-slate-400 text-center py-8">Henüz teklif eklenmemiş</p>
          ) : (
            <div className="space-y-3">
              {sonFiyatlar.map((teklif) => (
                <div key={teklif.id} onClick={() => router.push('/panel/fiyat-listesi')} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl border border-slate-700/30 hover:bg-slate-700/30 transition cursor-pointer">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <FileText className="h-5 w-5 text-slate-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-white text-sm font-medium truncate">{teklif.urun_adi}</p>
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
                      {teklif.durum === 'approved' ? '✅ Aktif' : teklif.durum === 'pending' ? '⏳ Beklemede' : '❌ Pasif'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <div className="text-center text-slate-500 text-xs py-4 mt-6 border-t border-slate-700/50">
        <p>© 2024 TermoEnerji Yönetim Paneli</p>
        <p className="mt-1">Fiyat Teklif Yönetim Sistemi v.8.0</p>
      </div>
    </div>
  )
}
