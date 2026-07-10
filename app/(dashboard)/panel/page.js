'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import { 
  LayoutDashboard, 
  Plus, 
  List, 
  Search, 
  Layers, 
  Building2, 
  BarChart3, 
  Settings, 
  Users,
  TrendingUp,
  DollarSign,
  Package
} from 'lucide-react'

export default function PanelPage() {
  const router = useRouter()
  const [stats, setStats] = useState({
    toplamFiyat: 0,
    aktifFiyat: 0,
    toplamFirma: 0,
    toplamKategori: 0
  })
  const [sonFiyatlar, setSonFiyatlar] = useState([])

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

        const { data: sonFiyatlar } = await supabase
          .from('fiyat_teklifleri')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5)

        setStats({
          toplamFiyat: fiyatCount || 0,
          aktifFiyat: aktifCount || 0,
          toplamFirma: firmaCount || 0,
          toplamKategori: kategoriCount || 0
        })
        setSonFiyatlar(sonFiyatlar || [])
      } catch (error) {
        console.error('İstatistik yükleme hatası:', error)
      }
    }

    fetchStats()
  }, [])

  const menuItems = [
    { title: 'Fiyat Ekle', icon: Plus, href: '/panel/fiyat-ekle', color: 'from-emerald-500 to-emerald-600' },
    { title: 'Fiyat Listesi', icon: List, href: '/panel/fiyat-listesi', color: 'from-blue-500 to-blue-600' },
    { title: 'Fiyat Sorgula', icon: Search, href: '/panel/fiyat-sorgula', color: 'from-cyan-500 to-cyan-600' },
    { title: 'Kategoriler', icon: Layers, href: '/panel/kategoriler', color: 'from-purple-500 to-purple-600' },
    { title: 'Firmalar', icon: Building2, href: '/panel/firmalar', color: 'from-amber-500 to-amber-600' },
    { title: 'Raporlar', icon: BarChart3, href: '/panel/raporlar', color: 'from-rose-500 to-rose-600' },
    { title: 'Yönetim', icon: Settings, href: '/panel/yonetim', color: 'from-slate-500 to-slate-600' },
    { title: 'Kullanıcılar', icon: Users, href: '/panel/kullanıcılar', color: 'from-indigo-500 to-indigo-600' },
  ]

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg shadow-emerald-500/25">
          <LayoutDashboard className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Ana Panel</h1>
          <p className="text-slate-400 text-sm">TermoEnerji Fiyat Yönetim Sistemi</p>
        </div>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 rounded-2xl p-6 border border-slate-700/50 backdrop-blur-sm hover:border-emerald-500/50 transition-all duration-300 group">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <DollarSign className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Toplam Fiyat</p>
              <p className="text-2xl font-bold text-white">{stats.toplamFiyat}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 rounded-2xl p-6 border border-slate-700/50 backdrop-blur-sm hover:border-emerald-500/50 transition-all duration-300 group">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <TrendingUp className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Aktif Fiyat</p>
              <p className="text-2xl font-bold text-emerald-400">{stats.aktifFiyat}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 rounded-2xl p-6 border border-slate-700/50 backdrop-blur-sm hover:border-emerald-500/50 transition-all duration-300 group">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <Building2 className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Firma</p>
              <p className="text-2xl font-bold text-white">{stats.toplamFirma}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 rounded-2xl p-6 border border-slate-700/50 backdrop-blur-sm hover:border-emerald-500/50 transition-all duration-300 group">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <Layers className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Kategori</p>
              <p className="text-2xl font-bold text-white">{stats.toplamKategori}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Menü Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={() => router.push(item.href)}
            className="group relative bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-emerald-500/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/10 text-left overflow-hidden"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
            <div className="relative z-10">
              <div className={`p-3 bg-gradient-to-br ${item.color} rounded-xl shadow-lg inline-block group-hover:scale-110 transition-transform duration-300`}>
                <item.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-white font-semibold mt-4 group-hover:text-emerald-400 transition-colors">
                {item.title}
              </h3>
              <p className="text-slate-400 text-sm mt-1">Hemen başla →</p>
            </div>
          </button>
        ))}
      </div>

      {/* Son Fiyatlar */}
      {sonFiyatlar.length > 0 && (
        <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/50">
          <h2 className="text-white font-semibold mb-4">📋 Son Eklenen Fiyatlar</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-2 px-3 text-slate-400 font-medium">Ürün</th>
                  <th className="text-left py-2 px-3 text-slate-400 font-medium">Firma</th>
                  <th className="text-right py-2 px-3 text-slate-400 font-medium">Fiyat</th>
                  <th className="text-center py-2 px-3 text-slate-400 font-medium">Durum</th>
                </tr>
              </thead>
              <tbody>
                {sonFiyatlar.map((item) => (
                  <tr key={item.id} className="border-b border-slate-700/50 hover:bg-slate-800/30 transition">
                    <td className="py-2 px-3 text-white">{item.urun_adi}</td>
                    <td className="py-2 px-3 text-slate-300">{item.firma_adi}</td>
                    <td className="py-2 px-3 text-emerald-400 font-bold text-right">
                      {new Intl.NumberFormat('tr-TR', {
                        style: 'currency',
                        currency: item.para_birimi || 'TRY',
                      }).format(item.fiyat)}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        item.durum === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                        item.durum === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {item.durum === 'approved' ? '✅ Onaylandı' :
                         item.durum === 'pending' ? '⏳ Beklemede' : '❌ Reddedildi'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
