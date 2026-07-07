'use client'

import Link from 'next/link'

export default function PanelPage() {
  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">TermoEnerji Paneli</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Fiyat Ekle Butonu - Link ile */}
          <Link href="/panel/fiyat-ekle">
            <div className="bg-emerald-500 hover:bg-emerald-600 text-white p-6 rounded-xl text-center transition cursor-pointer">
              <span className="text-2xl block">💰</span>
              Fiyat Ekle
            </div>
          </Link>

          {/* Fiyat Listesi Butonu - Link ile */}
          <Link href="/panel/fiyat-listesi">
            <div className="bg-blue-500 hover:bg-blue-600 text-white p-6 rounded-xl text-center transition cursor-pointer">
              <span className="text-2xl block">📋</span>
              Fiyat Listesi
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
