'use client'

import { useRouter } from 'next/navigation'

export default function PanelPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">TermoEnerji Paneli</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Fiyat Ekle Butonu */}
          <button
            onClick={() => router.push('/panel/fiyat-ekle')}
            className="bg-emerald-500 hover:bg-emerald-600 text-white p-6 rounded-xl text-center transition"
          >
            <span className="text-2xl block">💰</span>
            Fiyat Ekle
          </button>

          {/* Fiyat Listesi Butonu (sonra ekleyeceğiz) */}
          <button
            onClick={() => router.push('/panel/fiyat-listesi')}
            className="bg-blue-500 hover:bg-blue-600 text-white p-6 rounded-xl text-center transition"
          >
            <span className="text-2xl block">📋</span>
            Fiyat Listesi
          </button>
        </div>
      </div>
    </div>
  )
}
