'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'

export default function YonetimPage() {
  const [firmaAdi, setFirmaAdi] = useState('TermoEnerji')
  const [telefon, setTelefon] = useState('')
  const [adres, setAdres] = useState('')
  const [loading, setLoading] = useState(false)

  // Kayıtlı firma bilgilerini yükle
  useEffect(() => {
    const fetchFirma = async () => {
      try {
        const { data, error } = await supabase
          .from('firma_bilgileri')
          .select('*')
          .maybeSingle()

        if (error && error.code !== 'PGRST116') throw error

        if (data) {
          setFirmaAdi(data.ad || 'TermoEnerji')
          setTelefon(data.telefon || '')
          setAdres(data.adres || '')
        }
      } catch (error) {
        console.error('Firma bilgisi yükleme hatası:', error)
      }
    }
    fetchFirma()
  }, [])

  const handleKaydet = async () => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('firma_bilgileri')
        .upsert({
          ad: firmaAdi,
          telefon: telefon,
          adres: adres,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' })

      if (error) throw error

      alert('✅ Firma bilgileri güncellendi!')
    } catch (error) {
      console.error('Güncelleme hatası:', error)
      alert('❌ Hata: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">⚙️ Yönetim</h1>
      <p className="text-slate-400 mb-6">Firma bilgilerini buradan güncelleyebilirsin.</p>

      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 max-w-xl">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Firma Adı</label>
            <input
              type="text"
              value={firmaAdi}
              onChange={(e) => setFirmaAdi(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1">Telefon</label>
            <input
              type="text"
              value={telefon}
              onChange={(e) => setTelefon(e.target.value)}
              placeholder="0 555 123 45 67"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1">Adres</label>
            <textarea
              value={adres}
              onChange={(e) => setAdres(e.target.value)}
              placeholder="Adres girin"
              rows={3}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          <button
            onClick={handleKaydet}
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Kaydediliyor...' : '💾 Bilgileri Kaydet'}
          </button>
        </div>
      </div>
    </div>
  )
}
