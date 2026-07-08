'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function PanelPage() {
  const router = useRouter()
  const [stats, setStats] = useState({
    toplamFiyat: 0,
    aktifFiyat: 0,
    toplamFirma: 0,
    toplamKategori: 0
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { count: fiyatCount } = await supabase
          .from('fiyat_teklifleri')
          .select('*', { count: 'exact', head: true })

        const { count: aktifCount } = await supabase
          .from('fiyat_teklifleri')
          .select('*', { count: 'exact', head: true })
          .eq('durum', 'approved')

        const { count: firmaCount } = await supabase
          .from('firmalar')
          .select('*', { count: 'exact', head: true })

        const { count: kategoriCount } = await supabase
          .from('kategoriler')
          .select('*', { count: 'exact', head: true })

        setStats({
          toplamFiyat: fiyatCount || 0,
          aktifFiyat: aktifCount || 0,
          toplamFirma: firmaCount || 0,
          toplamKategori: kategoriCount || 0
        })
      } catch (error) {
        console.error('İstatistik yükleme hatası:', error)
      }
    }

    fetchStats()
  }, [])

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Ana Panel</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
          <p className="text-slate-400 text-sm">Toplam Fiyat</p>
          <p className="text-3xl font-bold text-white">{stats.toplamFiyat}</p>
        </div>
        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
          <p className="text-slate-400 text-sm">Aktif Fiyat</p>
          <p className="text-3xl font-bold text-emerald-400">{stats.aktifFiyat}</p>
        </div>
        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
          <p className="text-slate-400 text-sm">Firma</p>
          <p className="text-3xl font-bold text-blue-400">{stats.toplamFirma}</p>
        </div>
        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
          <p className="text-slate-400 text-sm">Kategori</p>
          <p className="text-3xl font-bold text-purple-400">{stats.toplamKategori}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-4">Hızlı İşlemler</h2>
          <button
            onClick={() => router.push('/panel/fiyat-ekle')}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-lg transition"
          >
            + Yeni Fiyat Ekle
          </button>
        </div>
        <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-4">Bilgi</h2>
          <p className="text-slate-400 text-sm">
            Toplam {stats.toplamFiyat} fiyat kaydı bulunuyor.
          </p>
        </div>
      </div>
    </div>
  )
}
