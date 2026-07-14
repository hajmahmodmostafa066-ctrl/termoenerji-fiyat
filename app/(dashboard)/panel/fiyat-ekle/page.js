'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import { addAuditLog } from '../../../../lib/audit'

export default function FiyatEklePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [sessionLoading, setSessionLoading] = useState(true)
  const [firmalar, setFirmalar] = useState([])
  const [kategoriler, setKategoriler] = useState([])
  const [formData, setFormData] = useState({
    urun_adi: '',
    marka: '',
    firma_adi: '',
    kategori: '',
    fiyat: '',
    para_birimi: 'TRY',
    durum: 'pending'
  })

  const [yeniKategori, setYeniKategori] = useState('')
  const [showYeniKategori, setShowYeniKategori] = useState(false)
  const [yeniFirma, setYeniFirma] = useState('')
  const [showYeniFirma, setShowYeniFirma] = useState(false)

  // OTURUM KONTROLÜ
  useEffect(() => {
    const kontrol = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login?redirect=/panel/fiyat-ekle')
      } else {
        setSessionLoading(false)
      }
    }
    kontrol()
  }, [])

  useEffect(() => {
    if (sessionLoading) return

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
  }, [sessionLoading])

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

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddKategori = async () => {
    if (!yeniKategori.trim()) {
      alert('❌ Kategori adı girin!')
      return
    }

    try {
      const { data, error } = await supabase
        .from('kategoriler')
        .insert([{ ad: yeniKategori.trim() }])
        .select()

      if (error) throw error

      setKategoriler([...kategoriler, data[0]])
      setFormData({ ...formData, kategori: data[0].ad })
      setYeniKategori('')
      setShowYeniKategori(false)
      alert('✅ Kategori eklendi!')
    } catch (error) {
      console.error('Kategori ekleme hatası:', error)
      alert('❌ Hata: ' + error.message)
    }
  }

  const handleAddFirma = async () => {
    if (!yeniFirma.trim()) {
      alert('❌ Firma adı girin!')
      return
    }

    try {
      const { data, error } = await supabase
        .from('firmalar')
        .insert([{ ad: yeniFirma.trim() }])
        .select()

      if (error) throw error

      setFirmalar([...firmalar, data[0]])
      setFormData({ ...formData, firma_adi: data[0].ad })
      setYeniFirma('')
      setShowYeniFirma(false)
      alert('✅ Firma eklendi!')
    } catch (error) {
      console.error('Firma ekleme hatası:', error)
      alert('❌ Hata: ' + error.message)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

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
      marka: formData.marka || null,
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

      if (data && data[0]) {
        await addAuditLog('fiyat_teklifleri', data[0].id, 'INSERT', null, data[0])
      }

      alert('✅ Fiyat başarıyla eklendi!')
      
      setFormData({
        urun_adi: '',
        marka: '',
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
    <div className="max-w-2xl mx-auto p-6">
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

        {/* Marka */}
        <div>
          <label className="block text-sm text-slate-300 mb-1">Marka</label>
          <input
            type="text"
            name="marka"
            value={formData.marka}
            onChange={handleChange}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            placeholder="Marka adı (örn: DİNÇ, DEĞİŞİM)"
          />
        </div>

        {/* Firma */}
        <div>
          <label className="block text-sm text-slate-300 mb-1">Firma</label>
          <div className="flex gap-2">
            <select
              name="firma_adi"
              value={formData.firma_adi}
              onChange={handleChange}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="">Firma seçin</option>
              {firmalar.map((firma, index) => (
                <option key={index} value={firma.ad}>{firma.ad}</option>
              ))}
              <option value="yeni">➕ Yeni Firma Ekle</option>
            </select>
            {!showYeniFirma && (
              <button
                type="button"
                onClick={() => setShowYeniFirma(true)}
                className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-xl hover:bg-emerald-500/30 transition text-sm font-medium"
              >
                +
              </button>
            )}
          </div>
          {showYeniFirma && (
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={yeniFirma}
                onChange={(e) => setYeniFirma(e.target.value)}
                placeholder="Yeni firma adı"
                className="flex-1 bg-slate-900 border border-emerald-500/30 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
              <button
                type="button"
                onClick={handleAddFirma}
                className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm hover:bg-emerald-600 transition"
              >
                Ekle
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowYeniFirma(false)
                  setYeniFirma('')
                }}
                className="px-4 py-2 bg-slate-700 text-slate-300 rounded-xl text-sm hover:bg-slate-600 transition"
              >
                İptal
              </button>
            </div>
          )}
        </div>

        {/* Kategori */}
        <div>
          <label className="block text-sm text-slate-300 mb-1">Kategori</label>
          <div className="flex gap-2">
            <select
              name="kategori"
              value={formData.kategori}
              onChange={handleChange}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="">Kategori seçin</option>
              {kategoriler.map((kategori, index) => (
                <option key={index} value={kategori.ad}>{kategori.ad}</option>
              ))}
              <option value="yeni">➕ Yeni Kategori Ekle</option>
            </select>
            {!showYeniKategori && (
              <button
                type="button"
                onClick={() => setShowYeniKategori(true)}
                className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-xl hover:bg-emerald-500/30 transition text-sm font-medium"
              >
                +
              </button>
            )}
          </div>
          {showYeniKategori && (
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={yeniKategori}
                onChange={(e) => setYeniKategori(e.target.value)}
                placeholder="Yeni kategori adı"
                className="flex-1 bg-slate-900 border border-emerald-500/30 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
              <button
                type="button"
                onClick={handleAddKategori}
                className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm hover:bg-emerald-600 transition"
              >
                Ekle
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowYeniKategori(false)
                  setYeniKategori('')
                }}
                className="px-4 py-2 bg-slate-700 text-slate-300 rounded-xl text-sm hover:bg-slate-600 transition"
              >
                İptal
              </button>
            </div>
          )}
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

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
        >
          {loading ? 'Ekleniyor...' : '✨ Fiyat Ekle'}
        </button>

        <p className="text-xs text-slate-500 text-center">
          Firma ve kategori eklemek için + butonunu kullanabilirsiniz.
        </p>
      </form>
    </div>
  )
}
