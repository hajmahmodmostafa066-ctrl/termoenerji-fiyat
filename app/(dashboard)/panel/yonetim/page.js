'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../../lib/supabase'

export default function YonetimPage() {
  const [firmaAdi, setFirmaAdi] = useState('TermoEnerji')
  const [telefon, setTelefon] = useState('')
  const [adres, setAdres] = useState('')
  const [logoFile, setLogoFile] = useState(null)
  const [logoUrl, setLogoUrl] = useState('')
  const [usdTry, setUsdTry] = useState(34.50)
  const [eurTry, setEurTry] = useState(37.20)
  const [loading, setLoading] = useState(false)
  const [kurLoading, setKurLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: firmaData } = await supabase
          .from('firma_bilgileri')
          .select('*')
          .maybeSingle()

        if (firmaData) {
          setFirmaAdi(firmaData.ad || 'TermoEnerji')
          setTelefon(firmaData.telefon || '')
          setAdres(firmaData.adres || '')
          setLogoUrl(firmaData.logo_url || '')
        }

        const { data: kurData } = await supabase
          .from('kur_ayarlari')
          .select('*')
          .maybeSingle()

        if (kurData) {
          setUsdTry(kurData.usd_try || 34.50)
          setEurTry(kurData.eur_try || 37.20)
        }
      } catch (error) {
        console.error('Veri yükleme hatası:', error)
      }
    }
    fetchData()
  }, [])

  const handleKaydet = async () => {
    setLoading(true)
    try {
      let finalLogoUrl = logoUrl

      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop()
        const fileName = `logo_${Date.now()}.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from('firma')
          .upload(fileName, logoFile)

        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage
          .from('firma')
          .getPublicUrl(fileName)

        finalLogoUrl = urlData.publicUrl
      }

      await supabase
        .from('firma_bilgileri')
        .upsert({
          ad: firmaAdi,
          telefon: telefon,
          adres: adres,
          logo_url: finalLogoUrl,
          updated_at: new Date().toISOString()
        })

      await supabase
        .from('kur_ayarlari')
        .upsert({
          usd_try: parseFloat(usdTry),
          eur_try: parseFloat(eurTry),
          updated_at: new Date().toISOString()
        })

      alert('✅ Bilgiler başarıyla kaydedildi!')
    } catch (error) {
      console.error('Kaydetme hatası:', error)
      alert('❌ Hata: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchCanliKur = async () => {
    setKurLoading(true)
    try {
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD')
      const data = await response.json()
      
      if (data && data.rates) {
        const usdTry = data.rates.TRY || 34.50
        const eurTry = data.rates.EUR ? data.rates.EUR * usdTry : 37.20
        
        setUsdTry(parseFloat(usdTry.toFixed(4)))
        setEurTry(parseFloat(eurTry.toFixed(4)))
        alert('✅ Canlı kur güncellendi!')
      }
    } catch (error) {
      console.error('Canlı kur hatası:', error)
      alert('❌ Canlı kur alınamadı')
    } finally {
      setKurLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">⚙️ Yönetim</h1>

        <div className="space-y-6">
          {/* Firma Bilgileri */}
          <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50">
            <h2 className="text-lg font-semibold text-white mb-4">🏢 Firma Bilgileri</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1">Logo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setLogoFile(e.target.files[0])
                      const reader = new FileReader()
                      reader.onload = (event) => {
                        document.getElementById('logoPreview').src = event.target.result
                      }
                      reader.readAsDataURL(e.target.files[0])
                    }
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
                {logoUrl && (
                  <div className="mt-2">
                    <img id="logoPreview" src={logoUrl} alt="Logo" className="h-16 w-auto object-contain" />
                  </div>
                )}
              </div>

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
            </div>
          </div>

          {/* Kur Ayarları */}
          <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">💱 Döviz Kuru Ayarları</h2>
              <button
                onClick={fetchCanliKur}
                disabled={kurLoading}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition disabled:opacity-50 text-sm"
              >
                {kurLoading ? 'Güncelleniyor...' : '🔄 Canlı Kur Çek'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1">USD → TRY</label>
                <input
                  type="number"
                  step="0.01"
                  value={usdTry}
                  onChange={(e) => setUsdTry(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">EUR → TRY</label>
                <input
                  type="number"
                  step="0.01"
                  value={eurTry}
                  onChange={(e) => setEurTry(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              💡 Bu kurlar, fiyat listesinde ve raporlarda para birimi çevrimi için kullanılır.
            </p>
          </div>

          <button
            onClick={handleKaydet}
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Kaydediliyor...' : '💾 Tüm Bilgileri Kaydet'}
          </button>
        </div>
      </div>
    </div>
  )
}
