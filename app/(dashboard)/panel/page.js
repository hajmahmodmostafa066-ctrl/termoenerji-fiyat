'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import { 
  Plus, List, Search, Layers, Building2, BarChart3, 
  Settings, Users, FileText, Calendar, Clock, 
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
    <div className="container">

      {/* HEADER */}
      <div className="header">
        <div className="header-left">
          <div className="logo-box">
            <Crown />
          </div>
          <div>
            <div className="header-title">TermoEnerji</div>
            <div className="header-badge">
              <Sparkles className="highlight" size={14} />
              <span>Ultra Pro Max Yönetim Paneli</span>
              <span className="version">v.8.0</span>
            </div>
          </div>
        </div>
        <div className="header-right">
          <div className="badge-item">
            <Bell size={16} />
            <span className="count">3</span>
          </div>
          <div className="badge-item">
            <Zap size={16} style={{ color: '#34d399' }} />
            <span>Sistem Aktif</span>
            <span className="status-dot" />
          </div>
        </div>
      </div>

      {/* KARŞILAMA */}
      <div className="welcome">
        <h2>
          👋 İyi Günler!
          <span className="badge">{stats.aktifFiyat} teklif aktif</span>
        </h2>
        <p>Fiyat tekliflerinizi yönetmek için hazırsınız.</p>
        <div className="meta">
          <span><Calendar size={14} /> {tarih}</span>
          <span><Clock size={14} /> {saat}</span>
        </div>
      </div>

      {/* İSTATİSTİK KARTLARI */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="label">Toplam Teklif</div>
          <div className="value">{stats.toplamFiyat}</div>
          <div className="change up">↑ 12% geçen hafta</div>
        </div>
        <div className="stat-card">
          <div className="label">Aktif Teklif</div>
          <div className="value value-emerald">{stats.aktifFiyat}</div>
          <div className="change up">↑ 8% geçen hafta</div>
        </div>
        <div className="stat-card">
          <div className="label">Firmalar</div>
          <div className="value value-amber">{stats.toplamFirma}</div>
          <div className="change" style={{ color: '#64748b', fontSize: 12, marginTop: 8 }}>{stats.toplamFirma} kayıtlı</div>
        </div>
        <div className="stat-card">
          <div className="label">Kategoriler</div>
          <div className="value value-purple">{stats.toplamKategori}</div>
          <div className="change" style={{ color: '#64748b', fontSize: 12, marginTop: 8 }}>{stats.toplamKategori} kategori</div>
        </div>
      </div>

      {/* FİRMALAR VE KATEGORİLER */}
      <div className="two-col-grid">
        <div className="card">
          <div className="section-header">
            <h3>🏢 Firmalar</h3>
            <span className="count">{stats.toplamFirma} kayıt</span>
          </div>
          <div className="tag-group">
            {['Kıymetli ürün ödül', 'FIRMA', 'DİGİPİM', 'DİNİC MİSKANİK'].map((f, i) => (
              <span key={i} className="tag">{f}</span>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="section-header">
            <h3>📂 Kategoriler</h3>
            <span className="count">{stats.toplamKategori} kayıt</span>
          </div>
          <div className="tag-group">
            {['SCH40 BORU', 'KELEBEK VANA', 'TERMOSTAT', 'POMPA', 'KOMPRESÖR'].map((k, i) => (
              <span key={i} className="tag">{k}</span>
            ))}
          </div>
        </div>
      </div>

      {/* MENÜ VE SON TEKLİFLER */}
      <div className="menu-grid">
        <div className="card">
          <div className="section-header">
            <h3>📋 Menü</h3>
          </div>
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {menuItems.map((item, index) => (
              <div key={index} className="menu-item" onClick={() => router.push(item.href)}>
                <div className="left">
                  <item.icon />
                  <span>{item.title}</span>
                </div>
                <div className="right">
                  <span className="count">{item.count}</span>
                  <ChevronRight className="arrow" size={16} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="section-header">
            <h3>📄 Fiyat Teklifleri</h3>
            <span className="count">Son 5 teklif</span>
          </div>
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {loading ? (
              [...Array(3)].map((_, i) => <div key={i} style={{ height: 56, background: 'rgba(30,41,59,0.3)', borderRadius: 12, animation: 'pulse 1.5s infinite' }} />)
            ) : sonFiyatlar.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>Henüz teklif eklenmemiş</div>
            ) : (
              sonFiyatlar.map((teklif) => (
                <div key={teklif.id} className="teklif-item" onClick={() => router.push('/panel/fiyat-listesi')}>
                  <div className="info">
                    <div className="icon"><FileText /></div>
                    <div className="text">
                      <div className="name">{teklif.urun_adi}</div>
                      <div className="sub">
                        <span>{teklif.firma_adi}</span>
                        <span className="dot" />
                        <span>{teklif.kategori || 'Genel'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="price">{formatPrice(teklif.fiyat, teklif.para_birimi)}</div>
                  <div className={`status ${
                    teklif.durum === 'approved' ? 'status-approved' :
                    teklif.durum === 'pending' ? 'status-pending' :
                    'status-rejected'
                  }`}>
                    {teklif.durum === 'approved' ? '✅ Aktif' : teklif.durum === 'pending' ? '⏳ Beklemede' : '❌ Pasif'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="footer">
        <p>© 2024 TermoEnerji Yönetim Paneli</p>
        <p>Fiyat Teklif Yönetim Sistemi v.8.0</p>
      </div>

    </div>
  )
}
