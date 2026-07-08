'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'

export default function FirmalarPage() {
  const [firmalar, setFirmalar] = useState([])
  const [loading, setLoading] = useState(true)
  const [yeniFirma, setYeniFirma] = useState('')
  const [eklemeLoading, setEklemeLoading] = useState(false)
  const [duzenlenenId, setDuzenlenenId] = useState(null)
  const [duzenlenenAd, setDuzenlenenAd] = useState('')

  useEffect(() => {
    fetchFirmalar()
  }, [])

  const fetchFirmalar = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('firmalar')
        .select('*')
        .order('ad', { ascending: true })

      if (error) throw error
      setFirmalar(data || [])
    } catch (error) {
      console.error('Firma yükleme hatası:', error)
      alert('❌ Hata: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEkle = async () => {
    if (!yeniFirma.trim()) {
      alert('❌ Firma adı girin!')
      return
    }

    setEklemeLoading(true)
    try {
      const { error } = await supabase
        .from('firmalar')
        .insert([{ ad: yeniFirma.trim() }])

      if (error) throw error

      setYeniFirma('')
      await fetchFirmalar()
      alert('✅ Firma eklendi!')
    } catch (error) {
      console.error('Ekleme hatası:', error)
      alert('❌ Hata: ' + error.message)
    } finally {
      setEklemeLoading(false)
    }
  }

  const handleSil = async (id, ad) => {
    if (!confirm(`"${ad}" firmasını silmek istediğinize emin misiniz?`)) return

    try {
      const { error } = await supabase
        .from('firmalar')
        .delete()
        .eq('id', id)

      if (error) throw error
      await fetchFirmalar()
      alert('✅ Firma silindi!')
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
      alert('❌ Firma adı boş olamaz!')
      return
    }

    try {
      const { error } = await supabase
        .from('firmalar')
        .update({ ad: duzenlenenAd.trim() })
        .eq('id', id)

      if (error) throw error

      setDuzenlenenId(null)
      setDuzenlenenAd('')
      await fetchFirmalar()
      alert('✅ Firma güncellendi!')
    } catch (error) {
      console.error('Güncelleme hatası:', error)
      alert('❌ Hata: ' + error.message)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">🏢 Firmalar</h1>

      {/* Ekleme Formu */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 mb-6">
        <div className="flex gap-3">
          <input
            type="text"
            value={yeniFirma}
            onChange={(e) => setYeniFirma(e.target.value)}
            placeholder="Yeni firma adı..."
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
          <button
            onClick={handleEkle}
            disabled={eklemeLoading}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg transition disabled:opacity-50"
          >
            {eklemeLoading ? 'Ekleniyor...' : '➕ Ekle'}
          </button>
        </div>
      </div>

      {/* Liste */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-slate-400">Yükleniyor...</p>
        </div>
      ) : firmalar.length === 0 ? (
        <div className="text-center py-12 bg-slate-800/50 rounded-xl border border-slate-700">
          <p className="text-slate-400">Henüz firma eklenmemiş</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-slate-800/50 rounded-xl border border-slate-700">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-800">
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Firma</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Oluşturulma</th>
                <th className="text-right py-3 px-4 text-slate-400 font-medium">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {firmalar.map((item) => (
                <tr key={item.id} className="border-b border-slate-700/50 hover:bg-slate-800/30 transition">
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
                      <span className="text-white font-medium">{item.ad}</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-400 text-xs">
                    {new Date(item.created_at).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {duzenlenenId === item.id ? (
                      <>
                        <button
                          onClick={() => handleDuzenleKaydet(item.id)}
                          className="text-emerald-400 hover:text-emerald-300 mr-3"
                        >
                          💾 Kaydet
                        </button>
                        <button
                          onClick={() => {
                            setDuzenlenenId(null)
                            setDuzenlenenAd('')
                          }}
                          className="text-slate-400 hover:text-white"
                        >
                          ❌ İptal
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleDuzenle(item.id, item.ad)}
                          className="text-blue-400 hover:text-blue-300 mr-3"
                        >
                          ✏️ Düzenle
                        </button>
                        <button
                          onClick={() => handleSil(item.id, item.ad)}
                          className="text-red-400 hover:text-red-300"
                        >
                          🗑️ Sil
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
  )
}
