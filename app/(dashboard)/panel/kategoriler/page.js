'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../../lib/supabase'
import { addAuditLog, getAuditLogs, isUserAdmin } from '../../../../lib/audit'
import { Eye, Plus, Edit, Trash2, Save, X, Search, Calendar, User, Clock, Shield } from 'lucide-react'

export default function KategorilerPage() {
  const router = useRouter()
  const [kategoriler, setKategoriler] = useState([])
  const [loading, setLoading] = useState(true)
  const [sessionLoading, setSessionLoading] = useState(true)
  const [yeniKategori, setYeniKategori] = useState('')
  const [eklemeLoading, setEklemeLoading] = useState(false)
  const [duzenlenenId, setDuzenlenenId] = useState(null)
  const [duzenlenenAd, setDuzenlenenAd] = useState('')
  const [secilenKategori, setSecilenKategori] = useState(null)
  const [modalAcik, setModalAcik] = useState(false)
  const [auditLogs, setAuditLogs] = useState([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredKategoriler, setFilteredKategoriler] = useState([])

  // OTURUM KONTROLÜ
  useEffect(() => {
    const kontrol = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login?redirect=/panel/kategoriler')
      } else {
        setSessionLoading(false)
      }
    }
    kontrol()
  }, [])

  useEffect(() => {
    if (sessionLoading) return

    const checkAdminAndFetch = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const admin = await isUserAdmin(user.email)
        setIsAdmin(admin)
      }
      await fetchKategoriler()
    }
    checkAdminAndFetch()
  }, [sessionLoading])

  useEffect(() => {
    if (searchTerm) {
      setFilteredKategoriler(
        kategoriler.filter(item =>
          item.ad?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    } else {
      setFilteredKategoriler(kategoriler)
    }
  }, [searchTerm, kategoriler])

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

  const fetchKategoriler = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('kategoriler')
        .select('*')
        .order('ad', { ascending: true })

      if (error) throw error
      setKategoriler(data || [])
      setFilteredKategoriler(data || [])
    } catch (error) {
      console.error('Kategori yükleme hatası:', error)
      alert('❌ Hata: ' + error.message)
    } finally {
      setLoading(false)
    }
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

  const handleDetayGoster = async (kategori) => {
    setSecilenKategori(kategori)
    setModalAcik(true)

    if (isAdmin) {
      const logs = await getAuditLogs(kategori.id, 'kategoriler')
      setAuditLogs(logs)
    }
  }

  const handleEkle = async () => {
    if (!yeniKategori.trim()) {
      alert('❌ Kategori adı girin!')
      return
    }

    setEklemeLoading(true)
    try {
      const { data, error } = await supabase
        .from('kategoriler')
        .insert([{ ad: yeniKategori.trim() }])
        .select()

      if (error) throw error

      if (data && data[0]) {
        await addAuditLog('kategoriler', data[0].id, 'INSERT', null, data[0])
      }

      setYeniKategori('')
      await fetchKategoriler()
      alert('✅ Kategori eklendi!')
    } catch (error) {
      console.error('Ekleme hatası:', error)
      alert('❌ Hata: ' + error.message)
    } finally {
      setEklemeLoading(false)
    }
  }

  const handleSil = async (id, ad) => {
    if (!confirm(`"${ad}" kategorisini silmek istediğinize emin misiniz?`)) return

    try {
      await addAuditLog('kategoriler', id, 'DELETE', { ad }, null)

      const { error } = await supabase
        .from('kategoriler')
        .delete()
        .eq('id', id)

      if (error) throw error
      await fetchKategoriler()
      alert('✅ Kategori silindi!')
    } catch (error) {
      console.error('Silme hatası:', error)
      alert('❌ Hata: ' + error.message)
    }
  }

  const handleDuzenle = (id, ad) => {
    setDuzenlenenId(id)
    setDuzenlenenAd(ad)
  }

  const handleDuzenleKaydet = async (id) => {
    if (!duzenlenenAd.trim()) {
      alert('❌ Kategori adı boş olamaz!')
      return
    }

    try {
      const eskiVeri = kategoriler.find(k => k.id === id)
      const yeniVeri = { ...eskiVeri, ad: duzenlenenAd.trim() }

      const { error } = await supabase
        .from('kategoriler')
        .update({ ad: duzenlenenAd.trim() })
        .eq('id', id)

      if (error) throw error

      await addAuditLog('kategoriler', id, 'UPDATE', eskiVeri, yeniVeri)

      setDuzenlenenId(null)
      setDuzenlenenAd('')
      await fetchKategoriler()
      alert('✅ Kategori güncellendi!')
    } catch (error) {
      console.error('Güncelleme hatası:', error)
      alert('❌ Hata: ' + error.message)
    }
  }

  const DetayModal = () => {
    if (!secilenKategori) return null

    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 border border-slate-700/50 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              📂 Kategori Detayı
              {isAdmin && (
                <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30">
                  Admin
                </span>
              )}
            </h2>
            <button
              onClick={() => {
                setModalAcik(false)
                setSecilenKategori(null)
                setAuditLogs([])
              }}
              className="text-slate-400 hover:text-white transition"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-xs text-slate-400">Kategori Adı</p>
              <p className="text-white font-medium">{secilenKategori.ad}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Oluşturulma</p>
              <p className="text-white font-medium flex items-center gap-1">
                <Calendar className="h-3 w-3 text-slate-400" />
                {formatDate(secilenKategori.created_at)}
              </p>
            </div>
          </div>

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
                  Bu kategori için henüz aktivite kaydı yok
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
                      {log.islem_turu === 'UPDATE' && log.eski_veri && log.yeni_veri && (
                        <div className="mt-1 text-xs text-slate-400">
                          <span className="text-red-400">Eski: {log.eski_veri.ad}</span>
                          {' → '}
                          <span className="text-emerald-400">Yeni: {log.yeni_veri.ad}</span>
                        </div>
                      )}
                      {log.islem_turu === 'INSERT' && log.yeni_veri && (
                        <div className="mt-1 text-xs text-emerald-400">
                          Yeni kategori oluşturuldu: {log.yeni_veri.ad}
                        </div>
                      )}
                      {log.islem_turu === 'DELETE' && log.eski_veri && (
                        <div className="mt-1 text-xs text-red-400">
                          Kategori silindi: {log.eski_veri.ad}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
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
            <h1 className="text-2xl font-bold text-white">📂 Kategoriler</h1>
            <p className="text-slate-400 text-sm mt-1">
              {filteredKategoriler.length} kategori
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Kategori ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 w-64"
              />
            </div>
          </div>
        </div>

        {/* Ekleme Formu */}
        <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50 mb-6">
          <div className="flex gap-3">
            <input
              type="text"
              value={yeniKategori}
              onChange={(e) => setYeniKategori(e.target.value)}
              placeholder="Yeni kategori adı..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
            <button
              onClick={handleEkle}
              disabled={eklemeLoading}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg transition disabled:opacity-50 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              {eklemeLoading ? 'Ekleniyor...' : 'Ekle'}
            </button>
          </div>
        </div>

        {/* Liste */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-400">Yükleniyor...</p>
          </div>
        ) : filteredKategoriler.length === 0 ? (
          <div className="text-center py-12 bg-slate-800/50 rounded-xl border border-slate-700">
            <p className="text-slate-400">Henüz kategori eklenmemiş</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-slate-800/50 rounded-xl border border-slate-700">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-800">
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Kategori</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium hidden md:table-cell">Oluşturulma</th>
                  <th className="text-center py-3 px-4 text-slate-400 font-medium">Detay</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {filteredKategoriler.map((item) => (
                  <tr key={item.id} className="border-b border-slate-700/50 hover:bg-slate-800/30 transition group">
                    <td className="py-3 px-4">
                      {duzenlenenId === item.id ? (
                        <input
                          type="text"
                          value={duzenlenenAd}
                          onChange={(e) => setDuzenlenenAd(e.target.value)}
                          className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                          autoFocus
                        />
                      ) : (
                        <span className="text-white font-medium group-hover:text-emerald-400 transition-colors">
                          {item.ad}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-xs hidden md:table-cell">
                      {formatDate(item.created_at)}
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
                    <td className="py-3 px-4 text-right">
                      {duzenlenenId === item.id ? (
                        <>
                          <button
                            onClick={() => handleDuzenleKaydet(item.id)}
                            className="text-emerald-400 hover:text-emerald-300 mr-3"
                          >
                            <Save className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setDuzenlenenId(null)
                              setDuzenlenenAd('')
                            }}
                            className="text-slate-400 hover:text-white"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleDuzenle(item.id, item.ad)}
                            className="text-blue-400 hover:text-blue-300 mr-3"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleSil(item.id, item.ad)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalAcik && <DetayModal />}
    </div>
  )
}
