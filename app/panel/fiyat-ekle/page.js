'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function FiyatEklePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    urun_adi: '',
    firma_adi: '',
    kategori: '',
    fiyat: '',
    para_birimi: 'TRY',
    durum: 'pending'
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from('fiyat_teklifleri')
        .insert([
          {
            urun_adi: formData.urun_adi,
            firma_adi: formData.firma_adi || 'Genel',
            kategori: formData.kategori || 'Genel',
            fiyat: parseFloat(formData.fiyat),
            para_birimi: formData.para_birimi,
            durum: formData.durum
          }
        ])

      if (error) throw error

      alert('✅ Fiyat başarıyla eklendi!')
      setFormData({
        urun_adi: '',
        firma_adi: '',
        kategori: '',
        fiyat: '',
        para_birimi: 'TRY',
        durum: 'pending'
      })
      router.refresh()
    } catch (error) {
      alert('❌ Hata: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">💰 Fiyat Ekle</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Ürün Adı *</label>
            <input
              type="text"
              name="urun_adi"
              value={formData.urun_adi}
              onChange={handleChange}
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
              placeholder="Ürün adını girin"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1">Firma</label>
            <input
              type="text"
              name="firma_adi"
              value={formData.firma_adi}
              onChange={handleChange}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
              placeholder="Firma adı"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1">Kategori</label>
            <input
              type="text"
              name="kategori"
              value={formData.kategori}
              onChange={handleChange}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
              placeholder="Kategori"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1">Fiyat *</label>
            <input
              type="number"
              step="0.01"
              name="fiyat"
              value={formData.fiyat}
              onChange={handleChange}
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1">Para Birimi</label>
            <select
              name="para_birimi"
              value={formData.para_birimi}
              onChange={handleChange}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
            >
              <option value="TRY">🇹🇷 TL</option>
              <option value="USD">🇺🇸 USD</option>
              <option value="EUR">🇪🇺 EUR</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1">Durum</label>
            <select
              name="durum"
              value={formData.durum}
              onChange={handleChange}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
            >
              <option value="pending">⏳ Beklemede</option>
              <option value="approved">✅ Onaylandı</option>
              <option value="rejected">❌ Reddedildi</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Ekleniyor...' : '✨ Fiyat Ekle'}
          </button>
        </form>
      </div>
    </div>
  )
}
