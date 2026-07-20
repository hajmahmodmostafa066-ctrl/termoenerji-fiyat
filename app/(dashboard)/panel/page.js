'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import { 
  LayoutDashboard, Plus, List, Search, Layers, Building2, 
  BarChart3, Settings, Users, TrendingUp, TrendingDown, 
  DollarSign, FileText, Calendar, Clock, Menu, ChevronRight,
  Bell, Zap, Sparkles, Crown, CheckCircle, Package, LogOut,
  ThermometerSun, Snowflake, ArrowRight
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
  const [userInfo, setUserInfo] = useState(null)
  const [sessionLoading, setSessionLoading] = useState(true)

  // OTURUM KONTROLÜ
  useEffect(() => {
    const kontrol = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login?redirect=/panel')
      } else {
        setSessionLoading(false)
      }
    }
    kontrol()
  }, [])

  useEffect(() => {
    if (sessionLoading) return

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

    const getUserInfo = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          const { data: userData, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', session.user.email)
            .single()
          
          setUserInfo({
            email: session.user.email,
            full_name: userData?.full_name || '',
            role: userData?.role || 'kullanici'
          })
        }
      } catch (error) {
        console.error('Kullanıcı bilgisi alınamadı:', error)
      }
    }

    fetchStats()
    updateDateTime()
    getUserInfo()
    const interval = setInterval(updateDateTime, 1000)
    return () => clearInterval(interval)
  }, [sessionLoading])

  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent"></div>
          <p className="text-slate-400 mt-4 font-medium tracking-wide">Sistem Başlatılıyor...</p>
        </div>
      </div>
    )
  }

  const formatPrice = (price, currency = 'TRY') => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency
    }).format(price)
  }

  const handleCikis = async () => {
    if (confirm('Çıkış yapmak istediğinize emin misiniz?')) {
      await supabase.auth.signOut()
      router.push('/login')
    }
  }

  // Menü renkleri logoya göre uyarlandı (Mavi, Sarı/Kehribar, Yeşil, Koyu Gri)
  const menuItems = [
    { title: 'Fiyat Ekle', icon: Plus, href: '/panel/fiyat-ekle', count: '+', color: 'text-amber-500', bg: 'bg-amber-500/10 hover:bg-amber-500/20' },
    { title: 'Fiyat Listesi', icon: List, href: '/panel/fiyat-listesi', count: stats.toplamFiyat, color: 'text-sky-400', bg: 'bg-sky-500/10 hover:bg-sky-500/20' },
    { title: 'Fiyat Sorgula', icon: Search, href: '/panel/fiyat-sorgula', count: stats.toplamFiyat, color: 'text-emerald-400', bg: 'bg-emerald-500/10 hover:bg-emerald-500/20' },
    { title: 'Kategoriler', icon: Layers, href: '/panel/kategoriler', count: stats.toplamKategori, color: 'text-indigo-400', bg: 'bg-indigo-500/10 hover:bg-indigo-500/20' },
    { title: 'Firmalar', icon: Building2, href: '/panel/firmalar', count: stats.toplamFirma, color: 'text-amber-400', bg: 'bg-amber-500/10 hover:bg-amber-500/20' },
    { title: 'Raporlar', icon: BarChart3, href: '/panel/raporlar', count: '0', color: 'text-rose-400', bg: 'bg-rose-500/10 hover:bg-rose-500/20' },
    { title: 'Yönetim', icon: Settings, href: '/panel/yonetim', count: '0', color: 'text-slate-400', bg: 'bg-slate-500/10 hover:bg-slate-500/20' },
    { title: 'Kullanıcılar', icon: Users, href: '/panel/kullanıcılar', count: '0', color: 'text-sky-400', bg: 'bg-sky-500/10 hover:bg-sky-500/20' },
  ]

  const StatCard = ({ title, value, icon: Icon, color = 'sky', change, loading, subtitle }) => {
    const colorMap = {
      sky: 'text-sky-400 border-sky-500/20 bg-gradient-to-br from-sky-500/10 to-transparent',
      amber: 'text-amber-400 border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-transparent',
      emerald: 'text-emerald-400 border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-transparent',
      slate: 'text-slate-300 border-slate-500/20 bg-gradient-to-br from-slate-500/10 to-transparent',
    }
    const iconColor = {
      sky: 'text-sky-400',
      amber: 'text-amber-500',
      emerald: 'text-emerald-400',
      slate: 'text-slate-400',
    }[color]

    return (
      <div className={`relative overflow-hidden rounded-2xl p-6 border backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-${color}-500/10 ${colorMap[color]}`}>
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-400 font-medium tracking-wide">{title}</p>
            {loading ? (
              <div className="h-10 w-24 bg-slate-800 rounded-lg animate-pulse mt-2" />
            ) : (
              <div className="flex items-baseline gap-2 mt-1">
                <p className={`text-4xl font-bold ${iconColor}`}>{value}</p>
                {subtitle && <span className="text-xs text-slate-500 font-medium">{subtitle}</span>}
              </div>
            )}
            {change !== undefined && (
              <div className="flex items-center gap-1.5 mt-3 bg-slate-900/50 w-max px-2 py-1 rounded-md">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-xs font-semibold text-emerald-400">+{Math.abs(change)}%</span>
                <span className="text-xs text-slate-400">geçen aya göre</span>
              </div>
            )}
          </div>
          <div className={`p-3.5 rounded-xl bg-slate-900/80 border border-slate-700/50 shadow-inner`}>
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
        </div>
      </div>
    )
  }

  const getDisplayName = () => {
    if (!userInfo) return 'Misafir'
    if (userInfo.full_name && userInfo.full_name.trim() !== '') {
      return userInfo.full_name
    }
    return userInfo.email?.split('@')[0] || 'Misafir'
  }

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-200 selection:bg-amber-500/30 font-sans relative">
      {/* Arka plan ışıltıları - Logo renkleri */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-8 p-6 relative z-10">

        {/* HEADER */}
        <header className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 bg-slate-900/50 p-6 rounded-3xl border border-slate-800/60 backdrop-blur-md shadow-2xl">
          <div className="flex items-center gap-5">
            <div className="relative flex items-center justify-center w-14 h-14 bg-gradient-to-br from-sky-500 to-amber-500 p-[2px] rounded-2xl shadow-lg">
              <div className="absolute inset-0 bg-slate-900 rounded-2xl m-[1px]"></div>
              <div className="relative z-10 flex items-center gap-1">
                <Snowflake className="h-5 w-5 text-sky-400" />
                <ThermometerSun className="h-5 w-5 text-amber-500" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
                TERMO<span className="text-amber-500">ENERJİ</span>
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-medium text-slate-400 tracking-wider uppercase">Mekanik Tesisat & Fiyat Yönetimi</span>
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded-full border border-emerald-500/20">v8.0</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-end">
            <div className="flex flex-col items-end mr-4 hidden sm:flex">
              <span className="text-sm font-medium text-slate-300">{tarih}</span>
              <span className="text-xs text-amber-500 font-mono">{saat}</span>
            </div>

            {userInfo && (
              <div className="flex items-center gap-3 bg-slate-950/50 px-2 py-2 pr-4 rounded-full border border-slate-800">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-sky-400 text-sm font-bold border border-slate-700">
                  {getDisplayName().charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block">
                  <p className="text-slate-200 text-sm font-semibold leading-tight">
                    {getDisplayName()}
                  </p>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${
                    userInfo.role === 'admin' ? 'text-amber-500' : 'text-sky-400'
                  }`}>
                    {userInfo.role === 'admin' ? 'Yönetici' : 'Mühendis'}
                  </span>
                </div>
                <div className="w-px h-8 bg-slate-800 mx-2 hidden sm:block"></div>
                <button
                  onClick={handleCikis}
                  className="text-slate-500 hover:text-red-400 transition p-2 hover:bg-red-500/10 rounded-full"
                  title="Güvenli Çıkış"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </header>

        {/* KARŞILAMA VE HIZLI EYLEMLER */}
        <div className="flex flex-col md:flex-row items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl font-light text-slate-200">
              Hoş geldin, <span className="font-bold text-white">{getDisplayName()}</span>
            </h2>
            <p className="text-slate-400 text-sm mt-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              Sistemde şu an <strong className="text-sky-400">{stats.aktifFiyat}</strong> aktif onaylanmış teklif bulunuyor.
            </p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button onClick={() => router.push('/panel/firmalar')} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-xl transition border border-slate-700">
              <Building2 className="h-4 w-4" /> Yeni Firma
            </button>
            <button onClick={() => router.push('/panel/fiyat-ekle')} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-900 text-sm font-bold rounded-xl transition shadow-lg shadow-amber-500/20">
              <Plus className="h-4 w-4" /> Hızlı Teklif Ekle
            </button>
          </div>
        </div>

        {/* İSTATİSTİK KARTLARI */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard title="Toplam Kayıtlı Teklif" value={stats.toplamFiyat} subtitle="adet" icon={FileText} color="sky" change={12} loading={loading} />
          <StatCard title="Onaylı Teklifler" value={stats.aktifFiyat} subtitle="aktif" icon={CheckCircle} color="amber" change={8} loading={loading} />
          <StatCard title="Tedarikçi Firmalar" value={stats.toplamFirma} subtitle="firma" icon={Building2} color="emerald" loading={loading} />
          <StatCard title="Ürün Kategorileri" value={stats.toplamKategori} subtitle="kategori" icon={Layers} color="slate" loading={loading} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* SOL BÖLÜM - ANA MENÜ VE FİNANS/KUR BİLGİSİ */}
          <div className="space-y-6">
            <div className="bg-slate-900/40 rounded-3xl p-6 border border-slate-800/60 backdrop-blur-sm">
              <h3 className="text-white font-semibold flex items-center gap-2 mb-5 text-sm uppercase tracking-wider">
                <Menu className="h-4 w-4 text-sky-400" /> Kontrol Paneli
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {menuItems.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => router.push(item.href)}
                    className={`flex items-center justify-between p-3.5 rounded-xl cursor-pointer transition-all duration-200 border border-transparent hover:border-slate-700/50 group ${item.bg}`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={`h-5 w-5 ${item.color} group-hover:scale-110 transition-transform`} />
                      <span className="text-slate-300 text-sm font-medium group-hover:text-white transition-colors">
                        {item.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 text-xs font-mono bg-slate-950 px-2 py-1 rounded-md">{item.count}</span>
                      <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-amber-500 transition-colors -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FİNANSAL/DÖVİZ WIDGET (Yeni Eklendi - Projeye Uygun) */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-900/50 rounded-3xl p-6 border border-slate-800/60">
              <h3 className="text-white font-semibold flex items-center gap-2 mb-4 text-sm uppercase tracking-wider">
                <DollarSign className="h-4 w-4 text-emerald-400" /> Güncel Kurlar
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
                  <p className="text-xs text-slate-400 mb-1">USD / TRY</p>
                  <p className="text-lg font-bold text-white">32.45<span className="text-xs text-slate-500 ml-1 font-normal">₺</span></p>
                </div>
                <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
                  <p className="text-xs text-slate-400 mb-1">EUR / TRY</p>
                  <p className="text-lg font-bold text-white">35.12<span className="text-xs text-slate-500 ml-1 font-normal">₺</span></p>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 mt-4 text-center">Kurlar bilgi amaçlıdır, tekliflerdeki güncel tarihi baz alınız.</p>
            </div>
          </div>

          {/* SAĞ BÖLÜM - SON TEKLİFLER VE ÖZET VERİLER */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900/40 rounded-3xl p-6 border border-slate-800/60 backdrop-blur-sm h-full flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-white font-semibold flex items-center gap-2 text-sm uppercase tracking-wider">
                    <Clock className="h-4 w-4 text-amber-500" /> Son Eklenen Teklifler
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Sisteme girilen en son 5 fiyatlandırma</p>
                </div>
                <button onClick={() => router.push('/panel/fiyat-listesi')} className="text-xs text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1">
                  Tümünü Gör <ChevronRight className="h-3 w-3" />
                </button>
              </div>

              {loading ? (
                <div className="space-y-4 flex-1">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-16 bg-slate-800/50 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : sonFiyatlar.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 space-y-3 py-10">
                  <Package className="h-12 w-12 text-slate-700" />
                  <p>Henüz sisteme teklif girilmemiş</p>
                  <button onClick={() => router.push('/panel/fiyat-ekle')} className="text-amber-500 text-sm font-medium hover:underline">İlk teklifi oluştur</button>
                </div>
              ) : (
                <div className="space-y-3 flex-1">
                  {sonFiyatlar.map((teklif) => (
                    <div
                      key={teklif.id}
                      onClick={() => router.push('/panel/fiyat-listesi')}
                      className="flex items-center justify-between p-4 bg-slate-950/40 rounded-2xl border border-slate-800/50 hover:bg-slate-800/40 hover:border-sky-500/30 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center flex-shrink-0 group-hover:border-sky-500/50 transition-colors">
                          <FileText className="h-5 w-5 text-slate-400 group-hover:text-sky-400 transition-colors" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-slate-200 text-sm font-semibold truncate group-hover:text-white transition-colors">
                            {teklif.urun_adi}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[11px] font-medium px-2 py-0.5 bg-slate-800 text-slate-400 rounded-md truncate max-w-[120px]">
                              {teklif.firma_adi}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-slate-700" />
                            <span className="text-[11px] text-slate-500 truncate">
                              {teklif.kategori || 'Genel Kategorisiz'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 flex-shrink-0 ml-4">
                        <span className="text-white font-bold text-sm tracking-wide">
                          {formatPrice(teklif.fiyat, teklif.para_birimi)}
                        </span>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          teklif.durum === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          teklif.durum === 'pending' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                          'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          {teklif.durum === 'approved' ? 'Onaylı' :
                           teklif.durum === 'pending' ? 'Bekliyor' : 'İptal'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* ALT BİLGİ KARTLARI (Firma/Kategori Özetleri) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-slate-900/40 rounded-3xl p-5 border border-slate-800/60 flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Sistemdeki Firmalar</p>
                  <p className="text-slate-200 text-sm"><strong className="text-sky-400">{stats.toplamFirma}</strong> tedarikçi kayıtlı</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-sky-500/10 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-sky-400" />
                </div>
              </div>
              <div className="bg-slate-900/40 rounded-3xl p-5 border border-slate-800/60 flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Malzeme Kategorileri</p>
                  <p className="text-slate-200 text-sm"><strong className="text-amber-500">{stats.toplamKategori}</strong> grup tanımlı</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <Layers className="h-5 w-5 text-amber-500" />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* FOOTER */}
        <footer className="text-center py-6">
          <p className="text-slate-500 text-xs font-medium">
            © {new Date().getFullYear()} TermoEnerji İklimlendirme İç ve Dış Tic. Ltd. Şti.
          </p>
          <p className="text-slate-600 text-[10px] mt-1 uppercase tracking-widest">
            Mekanik Tesisat Fiyat Yönetim Sistemi
          </p>
        </footer>

      </div>
    </div>
  )
}
