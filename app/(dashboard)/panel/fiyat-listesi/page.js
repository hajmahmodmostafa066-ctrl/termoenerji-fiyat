'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
//import { getAuditLogs, isUserAdmin } from '../../../lib/audit'
import { 
  FileText, 
  Building2, 
  Layers, 
  Calendar, 
  User,
  Clock,
  Eye,
  X,
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Info,
  Shield,
  Edit,
  Trash2,
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Search,
  Filter
} from 'lucide-react'

export default function FiyatListesiPage() {
  const router = useRouter()
  const [fiyatlar, setFiyatlar] = useState([])
  const [loading, setLoading] = useState(true)
  const [secilenFiyat, setSecilenFiyat] = useState(null)
  const [modalAcik, setModalAcik] = useState(false)
  //const [auditLogs, setAuditLogs] = useState([])
  //const [isAdmin, setIsAdmin] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredFiyatlar, setFilteredFiyatlar] = useState([])

  useEffect(() => {
    const checkAdminAndFetch = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const adminStatus = await isUserAdmin(user.email)
        setIsAdmin(adminStatus)
      }
      await fetchFiyatlar()
    }
    checkAdminAndFetch()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      setFilteredFiyatlar(
        fiyatlar.filter(item =>
          item.urun_adi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.firma_adi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.kategori?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    } else {
      setFilteredFiyatlar(fiyatlar)
    }
  }, [searchTerm, fiyatlar])

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

  const formatPrice = (price, currency = 'TRY') => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency
    }).format(price)
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
    setModalAcik(true)

    if (isAdmin) {
      const logs = await getAuditLogs(fiyat.id, 'fiyat_teklifleri')
      setAuditLogs(logs)
    }
  }

  const DetayModal = () => {
    if (!secilenFiyat) return null

    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 border border-slate-700/50 shadow-2xl">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-emerald-400" />
              Fiyat Detayı
            </h2>
            <button
              onClick={() => {
                setModalAcik(false)
                setSecilenFiyat(null)
                setAuditLogs([])
              }}
              className="text-slate-400 hover:text-white transition"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Ürün Bilgileri */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-xs text-slate-400">Ürün Adı</p>
              <p className="text-white font-medium">{secilenFiyat.urun_adi}</p>
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
              <p className="text-emerald-400 font-bold text-lg">
                {formatPrice(secilenFiyat.fiyat, secilenFiyat.para_birimi)}
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
              <p className="text-white font-medium flex items-center gap-1">
                <Calendar className="h-3 w-3 text-slate-400" />
                {formatDate(secilenFiyat.created_at)}
              </p>
            </div>
          </div>

          {/* Audit Log - Sadece Admin Görebilir */}
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
                    <div
                      key={log.id}
                      className="bg-slate-700/30 rounded-lg p-3 border border-slate-600/30 hover:border-slate-500/50 transition"
                    >
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
                          <span className="text-sm text-white font-medium flex items-center gap-1">
                            <User className="h-3 w-3 text-slate-400" />
                            {log.kullanici_email}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(log.created_at)}
                        </span>
                      </div>

                      {/* Değişiklik detayı */}
                      {log.islem_turu === 'UPDATE' && log.eski_veri && log.yeni_veri && (
                        <div className="mt-2 text-xs flex flex-wrap gap-3">
                          <span className="text-red-400">
                            Eski: {log.eski_veri.fiyat} ₺
                          </span>
                          <span className="text-slate-500">→</span>
                          <span className="text-emerald-400">
                            Yeni: {log.yeni_veri.fiyat} ₺
                          </span>
                          {log.eski_veri.durum !== log.yeni_veri.durum && (
                            <span className="text-amber-400">
                              Durum: {log.eski_veri.durum} → {log.yeni_veri.durum}
                            </span>
                          )}
                        </div>
                      )}

                      {log.islem_turu === 'INSERT' && log.yeni_veri && (
                        <div className="mt-1 text-xs text-emerald-400">
                          Yeni kayıt oluşturuldu: {log.yeni_veri.urun_adi}
                        </div>
                      )}

                      {log.islem_turu === 'DELETE' && log.eski_veri && (
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

          {/* Kapat Butonu */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => {
                setModalAcik(false)
                setSecilenFiyat(null)
                setAuditLogs([])
              }}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
            >
              Kapat
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">📋 Fiyat Listesi</h1>
            <p className="text-slate-400 text-sm mt-1">
              {filteredFiyatlar.length} kayıt gösteriliyor
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Ürün, firma veya kategori ara..."
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

        {/* Liste */}
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
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Firma</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium hidden md:table-cell">Kategori</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium">Fiyat</th>
                  <th className="text-center py-3 px-4 text-slate-400 font-medium">Durum</th>
                  <th className="text-center py-3 px-4 text-slate-400 font-medium">Detay</th>
                </tr>
              </thead>
              <tbody>
                {filteredFiyatlar.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-slate-700/50 hover:bg-slate-800/30 transition cursor-pointer group"
                  >
                    <td className="py-3 px-4 text-white font-medium group-hover:text-emerald-400 transition-colors">
                      {item.urun_adi}
                    </td>
                    <td className="py-3 px-4 text-slate-300">{item.firma_adi}</td>
                    <td className="py-3 px-4 text-slate-400 hidden md:table-cell">
                      {item.kategori || '-'}
                    </td>
                    <td className="py-3 px-4 text-emerald-400 font-bold text-right">
                      {formatPrice(item.fiyat, item.para_birimi)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`text-xs px-2 py-1 rounded-full border ${getDurumRenk(item.durum)}`}>
                        {getDurumEtiket(item.durum)}
                      </span>
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalAcik && <DetayModal />}
    </div>
  )
}
