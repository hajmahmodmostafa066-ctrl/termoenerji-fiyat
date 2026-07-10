'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../../lib/supabase'
import { getKurlar, setKurlar } from '../../../../lib/currency'

export default function YonetimPage() {
  const [firmaAdi, setFirmaAdi] = useState('TermoEnerji')
  const [telefon, setTelefon] = useState('')
  const [adres, setAdres] = useState('')
  const [logoFile, setLogoFile] = useState(null)
  const [logoUrl, setLogoUrl] = useState('')
  const [usdTry, setUsdTry] = useState('')
  const [eurTry, setEurTry] = useState('')
  const [loading, setLoading] = useState(false)

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

        const kurlar = await getKurlar()
        setUsdTry(kurlar.usdTry?.toString() || '')
        setEurTry(kurlar.eurTry?.toString() || '')
        
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
        const { data: urlData } = supabase.storage.from('firma').getPublicUrl(fileName)
        finalLogoUrl = urlData.publicUrl
      }

      const { error: firmaError } = await supabase
        .from('firma_bilgileri')
        .upsert({
          ad: firmaAdi,
          telefon: telefon,
          adres: adres,
          logo_url: finalLogoUrl,
          updated_at: new Date().toISOString()
        })
      if (firmaError) throw firmaError

      if (usdTry && eurTry) {
        await setKurlar(parseFloat(usdTry), parseFloat(eurTry))
      }

      alert('✅ Bilgiler başarıyla kaydedildi!')
      window.location.reload()
    } catch (error) {
      console.error('❌ Kaydetme hatası:', error)
      alert('❌ Hata: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">⚙️ Yönetim</h1>

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

        <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50 mt-6">
          <h2 className="text-lg font-semibold text-white mb-4">💱 Döviz Kuru Ayarları</h2>
          
          <p className="text-sm text-slate-400 mb-4">
            Kurları manuel olarak girin. Her kayıt yeni bir kur kaydı oluşturur.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1">💵 USD → TRY</label>
              <input
                type="number"
                step="0.01"
                value={usdTry}
                onChange={(e) => setUsdTry(e.target.value)}
                placeholder="34.50"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">💶 EUR → TRY</label>
              <input
                type="number"
                step="0.01"
                value={eurTry}
                onChange={(e) => setEurTry(e.target.value)}
                placeholder="37.20"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleKaydet}
          disabled={loading}
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 mt-6"
        >
          {loading ? 'Kaydediliyor...' : '💾 Tüm Bilgileri Kaydet'}
        </button>
      </div>
    </div>
  )
}
