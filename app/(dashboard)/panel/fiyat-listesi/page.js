'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function FiyatListesiPage() {
  const router = useRouter()
  const [fiyatlar, setFiyatlar] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFiyatlar()
  }, [])

  const fetchFiyatlar = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('fiyat_teklifleri')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setFiyatlar(data || [])
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
    return new Date(date).toLocaleString('tr-TR')
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
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">📋 Fiyat Listesi</h1>
        <button
          onClick={() => router.push('/panel/fiyat-ekle')}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition"
        >
          + Yeni Fiyat Ekle
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-slate-400">Yükleniyor...</p>
        </div>
      ) : fiyatlar.length === 0 ? (
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
                <th className="text-left py-3 px-4 text-slate-400 font-medium hidden lg:table-cell">Tarih</th>
              </tr>
            </thead>
            <tbody>
              {fiyatlar.map((item) => (
                <tr key={item.id} className="border-b border-slate-700/50 hover:bg-slate-800/30 transition">
                  <td className="py-3 px-4 text-white font-medium">{item.urun_adi}</td>
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
                  <td className="py-3 px-4 text-slate-400 text-xs hidden lg:table-cell">
                    {formatDate(item.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
