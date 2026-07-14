'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../../lib/supabase'
import { addAuditLog, getAuditLogs, isUserAdmin } from '../../../../lib/audit'
import { convertPrice, formatPrice, getKurlar, kurDegistiginde } from '../../../../lib/currency'
import { 
  Eye, Plus, Search, Edit, Trash2, Save, X, 
  Calendar, User, Clock, Shield, TrendingUp, TrendingDown 
} from 'lucide-react'

export default function FiyatListesiPage() {
  const router = useRouter()
  const [fiyatlar, setFiyatlar] = useState([])
  const [filteredFiyatlar, setFilteredFiyatlar] = useState([])
  const [loading, setLoading] = useState(true)
  const [sessionLoading, setSessionLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [gorunenParaBirimi, setGorunenParaBirimi] = useState('TRY')
  const [secilenFiyat, setSecilenFiyat] = useState(null)
  const [modalAcik, setModalAcik] = useState(false)
  const [auditLogs, setAuditLogs] = useState([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [duzenlemeModu, setDuzenlemeModu] = useState(false)
  const [duzenlenenVeri, setDuzenlenenVeri] = useState({
    urun_adi: '',
    marka: '',
    firma_adi: '',
    kategori: '',
    fiyat: '',
    para_birimi: 'TRY',
    durum: 'pending'
  })
  const [kurlar, setKurlar] = useState({ usdTry: 34.50, eurTry: 37.20 })

  // OTURUM KONTROLÜ
  useEffect(() => {
    const kontrol = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login?redirect=/panel/fiyat-listesi')
      } else {
        setSessionLoading(false)
      }
    }
    kontrol()
  }, [])

  // Admin kontrolü
  useEffect(() => {
    if (sessionLoading) return

    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const admin = await isUserAdmin(user.email)
        setIsAdmin(admin)
      }
    }
    checkAdmin()
  }, [sessionLoading])

  // Kurları yükle
  useEffect(() => {
    if (sessionLoading) return

    const loadKurlar = async () => {
      const k = await getKurlar()
      setKurlar(k)
    }
    loadKurlar()

    const unsubscribe = kurDegistiginde((yeniKurlar) => {
      setKurlar(yeniKurlar)
      fetchFiyatlar()
    })
    return () => unsubscribe()
  }, [sessionLoading])

  useEffect(() => {
    if (sessionLoading) return
    fetchFiyatlar()
  }, [sessionLoading])

  useEffect(() => {
    if (searchTerm) {
      setFilteredFiyatlar(
        fiyatlar.filter(item =>
          item.urun_adi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.marka?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.firma_adi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.kategori?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    } else {
      setFilteredFiyatlar(fiyatlar)
    }
  }, [searchTerm, fiyatlar])

  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
          <p className="text-slate-400 mt-4">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  const fetchFiyatlar = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('fiyat_teklifleri')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setFiyatlar(data || [])
      setFilteredFiyatlar(data || [])
    } catch (error) {
      console.error('Veri çekme hatası:', error)
      alert('❌ Hata: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const getConvertedPrice = (fiyat, paraBirimi) => {
    const parsedFiyat = parseFloat(String(fiyat).replace(',', '.'))
    if (isNaN(parsedFiyat) || !parsedFiyat) return '-'
    const converted = convertPrice(parsedFiyat, paraBirimi, gorunenParaBirimi, kurlar)
    return formatPrice(converted, gorunenParaBirimi)
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleString('tr-TR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getDurumRenk = (durum) => {
    switch(durum) {
      case 'approved': return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30'
      case 'pending': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
      case 'rejected': return 'text-red-400 bg-red-500/20 border-red-500/30'
      default: return 'text-slate-400 bg-slate-500/20 border-slate-500/30'
    }
  }

  const getDurumEtiket = (durum) => {
    switch(durum) {
      case 'approved': return '✅ Onaylandı'
      case 'pending': return '⏳ Beklemede'
      case 'rejected': return '❌ Reddedildi'
      default: return '❓ Bilinmiyor'
    }
  }

  const handleDetayGoster = async (fiyat) => {
    setSecilenFiyat(fiyat)
    setDuzenlenenVeri({
      urun_adi: fiyat.urun_adi,
      marka: fiyat.marka || '',
      firma_adi: fiyat.firma_adi,
      kategori: fiyat.kategori || '',
      fiyat: fiyat.fiyat,
      para_birimi: fiyat.para_birimi || 'TRY',
      durum: fiyat.durum || 'pending'
    })
    setDuzenlemeModu(false)
    setModalAcik(true)

    if (isAdmin) {
      const logs = await getAuditLogs(fiyat.id, 'fiyat_teklifleri')
      setAuditLogs(logs)
    }
  }

  const handleDuzenle = () => {
    setDuzenlemeModu(true)
  }

  const handleDuzenleIptal = () => {
    setDuzenlemeModu(false)
    setDuzenlenenVeri({
      urun_adi: secilenFiyat.urun_adi,
      marka: secilenFiyat.marka || '',
      firma_adi: secilenFiyat.firma_adi,
      kategori: secilenFiyat.kategori || '',
      fiyat: secilenFiyat.fiyat,
      para_birimi: secilenFiyat.para_birimi || 'TRY',
      durum: secilenFiyat.durum || 'pending'
    })
  }

  const handleDuzenleKaydet = async () => {
    if (!secilenFiyat) return

    const eskiVeri = { ...secilenFiyat }
    const yeniVeri = {
      ...secilenFiyat,
      urun_adi: duzenlenenVeri.urun_adi,
      marka: duzenlenenVeri.marka,
      firma_adi: duzenlenenVeri.firma_adi,
      kategori: duzenlenenVeri.kategori,
      fiyat: parseFloat(duzenlenenVeri.fiyat),
      para_birimi: duzenlenenVeri.para_birimi,
      durum: duzenlenenVeri.durum
    }

    try {
      const { error } = await supabase
        .from('fiyat_teklifleri')
        .update({
          urun_adi: yeniVeri.urun_adi,
          marka: yeniVeri.marka,
          firma_adi: yeniVeri.firma_adi,
          kategori: yeniVeri.kategori,
          fiyat: yeniVeri.fiyat,
          para_birimi: yeniVeri.para_birimi,
          durum: yeniVeri.durum
        })
        .eq('id', secilenFiyat.id)

      if (error) throw error

      await addAuditLog('fiyat_teklifleri', secilenFiyat.id, 'UPDATE', eskiVeri, yeniVeri)

      alert('✅ Fiyat başarıyla güncellendi!')
      setDuzenlemeModu(false)
      setModalAcik(false)
      fetchFiyatlar()
    } catch (error) {
      console.error('Güncelleme hatası:', error)
      alert('❌ Hata: ' + error.message)
    }
  }

  const handleSil = async () => {
    if (!secilenFiyat) return
    if (!confirm(`"${secilenFiyat.urun_adi}" fiyatını silmek istediğinize emin misiniz?`)) return

    try {
      await addAuditLog('fiyat_teklifleri', secilenFiyat.id, 'DELETE', secilenFiyat, null)

      const { error } = await supabase
        .from('fiyat_teklifleri')
        .delete()
        .eq('id', secilenFiyat.id)

      if (error) throw error

      alert('✅ Fiyat başarıyla silindi!')
      setModalAcik(false)
      fetchFiyatlar()
    } catch (error) {
      console.error('Silme hatası:', error)
      alert('❌ Hata: ' + error.message)
    }
  }

  const DetayModal = () => {
    if (!secilenFiyat) return null

    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 border border-slate-700/50 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              📄 Fiyat Detayı
              {isAdmin && (
                <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30">
                  Admin
                </span>
              )}
            </h2>
            <button
              onClick={() => {
                setModalAcik(false)
                setSecilenFiyat(null)
                setDuzenlemeModu(false)
                setAuditLogs([])
              }}
              className="text-slate-400 hover:text-white transition"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {duzenlemeModu ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1">Ürün Adı</label>
                <input
                  type="text"
                  value={duzenlenenVeri.urun_adi}
                  onChange={(e) => setDuzenlenenVeri({...duzenlenenVeri, urun_adi: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Marka</label>
                <input
                  type="text"
                  value={duzenlenenVeri.marka}
                  onChange={(e) => setDuzenlenenVeri({...duzenlenenVeri, marka: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Firma</label>
                <input
                  type="text"
                  value={duzenlenenVeri.firma_adi}
                  onChange={(e) => setDuzenlenenVeri({...duzenlenenVeri, firma_adi: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Kategori</label>
                <input
                  type="text"
                  value={duzenlenenVeri.kategori}
                  onChange={(e) => setDuzenlenenVeri({...duzenlenenVeri, kategori: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Fiyat</label>
                <input
                  type="number"
                  step="0.01"
                  value={duzenlenenVeri.fiyat}
                  onChange={(e) => setDuzenlenenVeri({...duzenlenenVeri, fiyat: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Para Birimi</label>
                <select
                  value={duzenlenenVeri.para_birimi}
                  onChange={(e) => setDuzenlenenVeri({...duzenlenenVeri, para_birimi: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  <option value="TRY">🇹🇷 TL</option>
                  <option value="USD">🇺🇸 USD</option>
                  <option value="EUR">🇪🇺 EUR</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Durum</label>
                <select
                  value={duzenlenenVeri.durum}
                  onChange={(e) => setDuzenlenenVeri({...duzenlenenVeri, durum: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  <option value="pending">⏳ Beklemede</option>
                  <option value="approved">✅ Onaylandı</option>
                  <option value="rejected">❌ Reddedildi</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleDuzenleKaydet}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 rounded-lg transition flex items-center gap-2"
                >
                  <Save className="h-4 w-4" /> Kaydet
                </button>
                <button
                  onClick={handleDuzenleIptal}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
                >
                  İptal
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-xs text-slate-400">Ürün Adı</p>
                  <p className="text-white font-medium">{secilenFiyat.urun_adi}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Marka</p>
                  <p className="text-white font-medium">{secilenFiyat.marka || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Firma</p>
                  <p className="text-white font-medium">{secilenFiyat.firma_adi}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Kategori</p>
                  <p className="text-white font-medium">{secilenFiyat.kategori || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Fiyat</p>
                  <p className="text-emerald-400 font-bold">
                    {formatPrice(secilenFiyat.fiyat, secilenFiyat.para_birimi)}
                    <span className="text-xs text-slate-400 ml-2">
                      ({gorunenParaBirimi}: {getConvertedPrice(secilenFiyat.fiyat, secilenFiyat.para_birimi)})
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Durum</p>
                  <span className={`text-xs px-2 py-1 rounded-full border ${getDurumRenk(secilenFiyat.durum)}`}>
                    {getDurumEtiket(secilenFiyat.durum)}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Oluşturulma</p>
                  <p className="text-white font-medium">{formatDate(secilenFiyat.created_at)}</p>
                </div>
              </div>

              {isAdmin && (
                <div className="flex gap-2 mb-6">
                  <button
                    onClick={handleDuzenle}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg transition flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" /> Düzenle
                  </button>
                  <button
                    onClick={handleSil}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-lg transition flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" /> Sil
                  </button>
                </div>
              )}

              {isAdmin && (
                <div className="border-t border-slate-700 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Shield className="h-4 w-4 text-amber-400" />
                      Aktivite Geçmişi
                      <span className="text-xs text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full">
                        Sadece Admin
                      </span>
                    </h3>
                    <span className="text-xs text-slate-500">{auditLogs.length} kayıt</span>
                  </div>

                  {auditLogs.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-4">
                      Bu ürün için henüz aktivite kaydı yok
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {auditLogs.map((log) => (
                        <div key={log.id} className="bg-slate-700/30 rounded-lg p-3 border border-slate-600/30">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                log.islem_turu === 'INSERT' ? 'bg-emerald-500/20 text-emerald-400' :
                                log.islem_turu === 'UPDATE' ? 'bg-blue-500/20 text-blue-400' :
                                'bg-red-500/20 text-red-400'
                              }`}>
                                {log.islem_turu === 'INSERT' ? '➕ Ekleme' :
                                 log.islem_turu === 'UPDATE' ? '✏️ Güncelleme' : '🗑️ Silme'}
                              </span>
                              <span className="text-sm text-white flex items-center gap-1">
                                <User className="h-3 w-3 text-slate-400" />
                                {log.kullanici_email}
                              </span>
                            </div>
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDate(log.created_at)}
                            </span>
                          </div>
                          {log.eski_veri && log.yeni_veri && log.islem_turu === 'UPDATE' && (
                            <div className="mt-1 text-xs text-slate-400">
                              <span className="text-red-400">Eski: {log.eski_veri.fiyat} ₺</span>
                              {' → '}
                              <span className="text-emerald-400">Yeni: {log.yeni_veri.fiyat} ₺</span>
                            </div>
                          )}
                          {log.eski_veri && log.islem_turu === 'DELETE' && (
                            <div className="mt-1 text-xs text-red-400">
                              Kayıt silindi: {log.eski_veri.urun_adi}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">📋 Fiyat Listesi</h1>
            <p className="text-slate-400 text-sm mt-1">
              {filteredFiyatlar.length} kayıt gösteriliyor
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg p-1 border border-slate-700">
              <button
                onClick={() => setGorunenParaBirimi('TRY')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  gorunenParaBirimi === 'TRY' 
                    ? 'bg-emerald-500/20 text-emerald-400' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🇹🇷 TL
              </button>
              <button
                onClick={() => setGorunenParaBirimi('USD')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  gorunenParaBirimi === 'USD' 
                    ? 'bg-blue-500/20 text-blue-400' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🇺🇸 USD
              </button>
              <button
                onClick={() => setGorunenParaBirimi('EUR')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  gorunenParaBirimi === 'EUR' 
                    ? 'bg-purple-500/20 text-purple-400' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🇪🇺 EUR
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Ürün, marka, firma veya kategori ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 w-64"
              />
            </div>

            <button
              onClick={() => router.push('/panel/fiyat-ekle')}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Yeni Fiyat
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-400">Yükleniyor...</p>
          </div>
        ) : filteredFiyatlar.length === 0 ? (
          <div className="text-center py-12 bg-slate-800/50 rounded-xl border border-slate-700">
            <p className="text-slate-400">Henüz hiç fiyat eklenmemiş</p>
            <button
              onClick={() => router.push('/panel/fiyat-ekle')}
              className="mt-4 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition"
            >
              İlk Fiyatı Ekle
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto bg-slate-800/50 rounded-xl border border-slate-700">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-800">
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Ürün</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Marka</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Firma</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium hidden md:table-cell">Kategori</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium">Fiyat</th>
                  <th className="text-center py-3 px-4 text-slate-400 font-medium">Orijinal</th>
                  <th className="text-center py-3 px-4 text-slate-400 font-medium">Detay</th>
                </tr>
              </thead>
              <tbody>
                {filteredFiyatlar.map((item) => {
                  const convertedPrice = getConvertedPrice(item.fiyat, item.para_birimi)
                  const isEnUcuz = item.fiyat === Math.min(...filteredFiyatlar.map(i => i.fiyat))
                  const isEnPahali = item.fiyat === Math.max(...filteredFiyatlar.map(i => i.fiyat))

                  return (
                    <tr key={item.id} className="border-b border-slate-700/50 hover:bg-slate-800/30 transition group">
                      <td className="py-3 px-4 text-white font-medium group-hover:text-emerald-400 transition-colors">
                        {item.urun_adi}
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {item.marka || '-'}
                      </td>
                      <td className="py-3 px-4 text-slate-300">{item.firma_adi}</td>
                      <td className="py-3 px-4 text-slate-400 hidden md:table-cell">
                        {item.kategori || '-'}
                      </td>
                      <td className="py-3 px-4 text-emerald-400 font-bold text-right">
                        {convertedPrice}
                      </td>
                      <td className="py-3 px-4 text-center text-slate-400 text-xs">
                        {formatPrice(item.fiyat, item.para_birimi)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleDetayGoster(item)}
                          className="text-blue-400 hover:text-blue-300 transition p-1 rounded-lg hover:bg-blue-500/20"
                          title="Detayları gör"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalAcik && <DetayModal />}
    </div>
  )
}
