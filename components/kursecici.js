'use client'

import { useState, useEffect } from 'react'
import { getKurlar, setKurlar, kurDegistiginde } from '../lib/currency'

export default function KurSecici({ onKurDegisti }) {
  const [usdTry, setUsdTry] = useState(34.50)
  const [eurTry, setEurTry] = useState(37.20)
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    // ✅ DOĞRU - useEffect içinde async fonksiyon tanımla ve çağır
    const loadKurlar = async () => {
      const kurlar = await getKurlar()
      setUsdTry(kurlar.usdTry)
      setEurTry(kurlar.eurTry)
    }
    loadKurlar()

    const unsubscribe = kurDegistiginde((yeniKurlar) => {
      setUsdTry(yeniKurlar.usdTry)
      setEurTry(yeniKurlar.eurTry)
      if (onKurDegisti) onKurDegisti(yeniKurlar)
    })

    return () => unsubscribe()
  }, [onKurDegisti])

  // ✅ DOĞRU - event handler'lar async olabilir (çalışır)
  const handleKaydet = async () => {
    setLoading(true)
    try {
      await setKurlar(usdTry, eurTry)
      setShowModal(false)
      alert('✅ Kurlar güncellendi!')
    } catch (error) {
      alert('❌ Hata: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:text-white rounded-lg border border-slate-600/50 transition text-sm"
      >
        💱 Kur
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl max-w-md w-full p-6 border border-slate-700/50 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-white">💱 Kur Ayarları</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1">💵 USD → TRY</label>
                <input
                  type="number"
                  step="0.01"
                  value={usdTry}
                  onChange={(e) => setUsdTry(e.target.value)}
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
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              <button
                onClick={handleKaydet}
                disabled={loading}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
              >
                {loading ? 'Kaydediliyor...' : '💾 Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
