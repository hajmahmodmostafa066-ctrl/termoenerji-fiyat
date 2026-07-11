'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'

export default function FiyatSorgulaPage() {
  const [fiyatlar, setFiyatlar] = useState([])
  const [loading, setLoading] = useState(false)
  const [firmalar, setFirmalar] = useState([])
  const [kategoriler, setKategoriler] = useState([])
  const [filtreler, setFiltreler] = useState({
    arama: '',
    marka: '',
    firma: '',
    kategori: ''
  })

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const { data: firmalarData } = await supabase
          .from('firmalar')
          .select('ad')
          .order('ad')
        const { data: kategoriData } = await supabase
          .from('kategoriler')
          .select('ad')
          .order('ad')
        if (firmalarData) setFirmalar(firmalarData)
        if (kategoriData) setKategoriler(kategoriData)
      } catch (error) {
        console.error('Filtre yükleme hatası:', error)
      }
    }
    fetchFilters()
  }, [])

  const handleSearch = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('fiyat_teklifleri')
        .select('*')
        .order('created_at', { ascending: false })

      if (filtreler.arama) {
        query = query.or(
          `urun_adi.ilike.%${filtreler.arama}%,` +
          `marka.ilike.%${filtreler.arama}%,` +
          `firma_adi.ilike.%${filtreler.arama}%,` +
          `kategori.ilike.%${filtreler.arama}%`
        )
      }
      if (filtreler.marka) {
        query = query.ilike('marka', `%${filtreler.marka}%`)
      }
      if (filtreler.firma) {
        query = query.eq('firma_adi', filtreler.firma)
      }
      if (filtreler.kategori) {
        query = query.eq('kategori', filtreler.kategori)
      }

      const { data, error } = await query
      if (error) throw error
      setFiyatlar(data || [])
    } catch (error) {
      console.error('Sorgulama hatası:', error)
      alert('❌ Hata: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFiltreler(prev => ({ ...prev, [name]: value }))
  }

  const formatPrice = (price, currency = 'TRY') => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency
    }).format(price)
  }

  const getDurumRenk = (durum) => {
    switch(durum) {
      case 'approved': return 'text-emerald-400 bg-emerald-500/20'
      case 'pending': return 'text-yellow-400 bg-yellow-500/20'
      case 'rejected': return 'text-red-400 bg-red-500/20'
      default: return 'text-slate-400 bg-slate-500/20'
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

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">🔍 Fiyat Sorgula</h1>

        {/* Filtreler - Marka Eklendi */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1">Ürün Ara</label>
              <input
                type="text"
                name="arama"
                value={filtreler.arama}
                onChange={handleChange}
                placeholder="Ürün adı girin"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
            {/* ✅ MARKA FİLTRESİ EKLENDİ */}
            <div>
              <label className="block text-sm text-slate-300 mb-1">Marka</label>
              <input
                type="text"
                name="marka"
                value={filtreler.marka}
                onChange={handleChange}
                placeholder="Marka adı"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Firma</label>
              <select
                name="firma"
                value={filtreler.firma}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                <option value="">Tüm Firmalar</option>
                {firmalar.map((firma, index) => (
                  <option key={index} value={firma.ad}>{firma.ad}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Kategori</label>
              <select
                name="kategori"
                value={filtreler.kategori}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                <option value="">Tüm Kategoriler</option>
                {kategoriler.map((kategori, index) => (
                  <option key={index} value={kategori.ad}>{kategori.ad}</option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="mt-4 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Aranıyor...' : '🔎 Sorgula'}
          </button>
        </div>

        {/* Sonuçlar - Marka Sütunu Eklendi */}
        {fiyatlar.length === 0 && !loading && (
          <div className="text-center py-12 bg-slate-800/50 rounded-xl border border-slate-700">
            <p className="text-slate-400">Henüz sonuç yok. Filtreleri kullanarak arama yapın.</p>
          </div>
        )}

        {fiyatlar.length > 0 && (
          <div className="overflow-x-auto bg-slate-800/50 rounded-xl border border-slate-700">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-800">
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Ürün</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Marka</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Firma</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium hidden md:table-cell">Kategori</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium">Fiyat</th>
                  <th className="text-center py-3 px-4 text-slate-400 font-medium">Durum</th>
                </tr>
              </thead>
              <tbody>
                {fiyatlar.map((item) => (
                  <tr key={item.id} className="border-b border-slate-700/50 hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4 text-white font-medium">{item.urun_adi}</td>
                    <td className="py-3 px-4 text-slate-300">{item.marka || '-'}</td>
                    <td className="py-3 px-4 text-slate-300">{item.firma_adi}</td>
                    <td className="py-3 px-4 text-slate-400 hidden md:table-cell">{item.kategori || '-'}</td>
                    <td className="py-3 px-4 text-emerald-400 font-bold text-right">
                      {formatPrice(item.fiyat, item.para_birimi)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`text-xs px-2 py-1 rounded-full ${getDurumRenk(item.durum)}`}>
                        {getDurumEtiket(item.durum)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
