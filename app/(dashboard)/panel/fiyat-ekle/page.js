'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import { addAuditLog } from '../../../lib/audit'

export default function FiyatEklePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [firmalar, setFirmalar] = useState([])
  const [kategoriler, setKategoriler] = useState([])
  const [formData, setFormData] = useState({
    urun_adi: '',
    firma_adi: '',
    kategori: '',
    fiyat: '',
    para_birimi: 'TRY',
    durum: 'pending'
  })

  // Firmaları ve kategorileri yükle
  useEffect(() => {
    const fetchData = async () => {
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
        console.error('Veri yükleme hatası:', error)
      }
    }
    fetchData()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validasyon
    if (!formData.urun_adi.trim()) {
      alert('❌ Ürün adı zorunludur!')
      return
    }

    if (!formData.fiyat || parseFloat(formData.fiyat) <= 0) {
      alert('❌ Geçerli bir fiyat girin!')
      return
    }

    const veri = {
      urun_adi: formData.urun_adi.trim(),
      firma_adi: formData.firma_adi || 'Genel',
      kategori: formData.kategori || 'Genel',
      fiyat: parseFloat(formData.fiyat),
      para_birimi: formData.para_birimi,
      durum: formData.durum
    }

    setLoading(true)

    try {
      const { data, error } = await supabase
        .from('fiyat_teklifleri')
        .insert([veri])
        .select()

      if (error) throw error

      // 📝 Log Ekle - Yeni kayıt oluşturuldu
     // if (data && data[0]) {
      //  await addAuditLog(
        //  'fiyat_teklifleri',
         // data[0].id,
         // 'INSERT',
         // null,
        //  data[0]
       // )
     // }

      alert('✅ Fiyat başarıyla eklendi!')
      
      // Formu temizle
      setFormData({
        urun_adi: '',
        firma_adi: '',
        kategori: '',
        fiyat: '',
        para_birimi: 'TRY',
        durum: 'pending'
      })

      router.push('/panel/fiyat-listesi')
      
    } catch (error) {
      console.error('Ekleme hatası:', error)
      alert('❌ Hata: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">💰 Fiyat Ekle</h1>
        <button
          onClick={() => router.push('/panel')}
          className="text-slate-400 hover:text-white transition"
        >
          ← Panoya Dön
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 bg-slate-800/50 p-6 rounded-xl border border-slate-700">
        {/* Ürün Adı */}
        <div>
          <label className="block text-sm text-slate-300 mb-1">
            Ürün Adı <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            name="urun_adi"
            value={formData.urun_adi}
            onChange={handleChange}
            required
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            placeholder="Ürün adını girin"
          />
        </div>

        {/* Firma */}
        <div>
          <label className="block text-sm text-slate-300 mb-1">Firma</label>
          <select
            name="firma_adi"
            value={formData.firma_adi}
            onChange={handleChange}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            <option value="">Firma seçin</option>
            {firmalar.map((firma, index) => (
              <option key={index} value={firma.ad}>{firma.ad}</option>
            ))}
            <option value="yeni">➕ Yeni Firma Ekle</option>
          </select>
        </div>

        {/* Kategori */}
        <div>
          <label className="block text-sm text-slate-300 mb-1">Kategori</label>
          <select
            name="kategori"
            value={formData.kategori}
            onChange={handleChange}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            <option value="">Kategori seçin</option>
            {kategoriler.map((kategori, index) => (
              <option key={index} value={kategori.ad}>{kategori.ad}</option>
            ))}
            <option value="yeni">➕ Yeni Kategori Ekle</option>
          </select>
        </div>

        {/* Fiyat */}
        <div>
          <label className="block text-sm text-slate-300 mb-1">
            Fiyat <span className="text-red-400">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            name="fiyat"
            value={formData.fiyat}
            onChange={handleChange}
            required
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            placeholder="0.00"
          />
        </div>

        {/* Para Birimi */}
        <div>
          <label className="block text-sm text-slate-300 mb-1">Para Birimi</label>
          <select
            name="para_birimi"
            value={formData.para_birimi}
            onChange={handleChange}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            <option value="TRY">🇹🇷 TL</option>
            <option value="USD">🇺🇸 USD</option>
            <option value="EUR">🇪🇺 EUR</option>
          </select>
        </div>

        {/* Durum */}
        <div>
          <label className="block text-sm text-slate-300 mb-1">Durum</label>
          <select
            name="durum"
            value={formData.durum}
            onChange={handleChange}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            <option value="pending">⏳ Beklemede</option>
            <option value="approved">✅ Onaylandı</option>
            <option value="rejected">❌ Reddedildi</option>
          </select>
        </div>

        {/* Buton */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
        >
          {loading ? 'Ekleniyor...' : '✨ Fiyat Ekle'}
        </button>

        <p className="text-xs text-slate-500 text-center">
          Firma ve kategori eklemek için listeden "➕ Yeni Firma Ekle" veya "➕ Yeni Kategori Ekle" seçeneğini kullanın.
        </p>
      </form>
    </div>
  )
}
