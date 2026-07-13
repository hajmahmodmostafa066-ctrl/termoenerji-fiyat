// ============================================================
// 1. CUSTOM HOOKS (hooks/useFiyatVerileri.ts)
// ============================================================
import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '../../../../lib/supabase'
import { convertPrice, getKurlar, kurDegistiginde } from '../../../../lib/currency'

interface FiyatTeklifi {
  id: string
  urun_adi: string
  marka?: string
  firma_adi: string
  kategori?: string
  fiyat: number
  para_birimi: string
  durum: 'approved' | 'pending' | 'rejected'
  created_at: string
}

interface Kurlar {
  usdTry: number
  eurTry: number
}

interface UrunIstatistik {
  urunAdi: string
  enUcuz: number
  enUcuzFirma: string
  enPahali: number
  enPahaliFirma: string
  fark: number
  adet: number
}

export function useFiyatVerileri() {
  const [fiyatlar, setFiyatlar] = useState<FiyatTeklifi[]>([])
  const [filteredFiyatlar, setFilteredFiyatlar] = useState<FiyatTeklifi[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [kurlar, setKurlar] = useState<Kurlar>({ usdTry: 34.50, eurTry: 37.20 })
  
  // Gelişmiş cache mekanizması
  const [cache, setCache] = useState<Map<string, any>>(new Map())

  // Veri yükleme - retry mekanizmalı
  const loadData = useCallback(async (retryCount = 3) => {
    setLoading(true)
    setError(null)
    
    const cacheKey = 'fiyat_teklifleri_data'
    const cachedData = cache.get(cacheKey)
    
    // Cache kontrolü (5 dakika)
    if (cachedData && Date.now() - cachedData.timestamp < 300000) {
      setFiyatlar(cachedData.data)
      setFilteredFiyatlar(cachedData.data)
      setLoading(false)
      return
    }

    for (let attempt = 1; attempt <= retryCount; attempt++) {
      try {
        const { data: fiyatData, error: fiyatError } = await supabase
          .from('fiyat_teklifleri')
          .select('*')
          .order('created_at', { ascending: false })
          .timeout(10000) // 10 saniye timeout

        if (fiyatError) throw fiyatError
        
        if (fiyatData) {
          // Cache'e kaydet
          setCache(prev => new Map(prev).set(cacheKey, {
            data: fiyatData,
            timestamp: Date.now()
          }))
          
          setFiyatlar(fiyatData)
          setFilteredFiyatlar(fiyatData)
          setLoading(false)
          return
        }
      } catch (err) {
        console.error(`Veri yükleme denemesi ${attempt} başarısız:`, err)
        
        if (attempt === retryCount) {
          setError('Veriler yüklenirken bir sorun oluştu. Lütfen bağlantınızı kontrol edin.')
          setLoading(false)
        } else {
          // Bekle ve tekrar dene (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
        }
      }
    }
  }, [cache])

  // Kurları yükle
  useEffect(() => {
    const loadKurlar = async () => {
      try {
        const k = await getKurlar()
        setKurlar(k)
      } catch (err) {
        console.error('Kur yükleme hatası:', err)
        // Fallback değerler
        setKurlar({ usdTry: 34.50, eurTry: 37.20 })
      }
    }
    
    loadKurlar()
    const unsubscribe = kurDegistiginde((yeniKurlar: Kurlar) => setKurlar(yeniKurlar))
    return () => unsubscribe()
  }, [])

  // Real-time subscription - gelişmiş
  useEffect(() => {
    const kanal = supabase
      .channel('fiyat_teklifleri_realtime')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'fiyat_teklifleri' 
        },
        async (payload) => {
          // Optimistic update
          const eventType = payload.eventType
          const newRecord = payload.new as FiyatTeklifi
          
          setFiyatlar(prev => {
            let updated = [...prev]
            
            if (eventType === 'INSERT') {
              updated = [newRecord, ...updated]
            } else if (eventType === 'UPDATE') {
              const index = updated.findIndex(item => item.id === newRecord.id)
              if (index !== -1) updated[index] = newRecord
            } else if (eventType === 'DELETE') {
              updated = updated.filter(item => item.id !== payload.old.id)
            }
            
            return updated
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(kanal)
    }
  }, [])

  // Gelişmiş filtreleme
  const filterData = useCallback((
    data: FiyatTeklifi[],
    filters: {
      arama?: string
      kategori?: string
      firma?: string
      durum?: string
      fiyatMin?: number
      fiyatMax?: number
    }
  ) => {
    return data.filter(item => {
      // Metin araması
      if (filters.arama?.trim()) {
        const searchLower = filters.arama.toLowerCase()
        const urunMatch = item.urun_adi?.toLowerCase().includes(searchLower)
        const firmaMatch = item.firma_adi?.toLowerCase().includes(searchLower)
        const markaMatch = item.marka?.toLowerCase().includes(searchLower)
        if (!urunMatch && !firmaMatch && !markaMatch) return false
      }
      
      // Kategori filtresi
      if (filters.kategori && item.kategori !== filters.kategori) return false
      
      // Firma filtresi
      if (filters.firma && item.firma_adi !== filters.firma) return false
      
      // Durum filtresi
      if (filters.durum && item.durum !== filters.durum) return false
      
      // Fiyat aralığı
      if (filters.fiyatMin !== undefined) {
        const converted = convertPrice(item.fiyat, item.para_birimi, 'TRY', kurlar)
        if (converted < filters.fiyatMin) return false
      }
      
      if (filters.fiyatMax !== undefined) {
        const converted = convertPrice(item.fiyat, item.para_birimi, 'TRY', kurlar)
        if (converted > filters.fiyatMax) return false
      }
      
      return true
    })
  }, [kurlar])

  // İstatistik hesaplama - memoized
  const calculateStatistics = useCallback((data: FiyatTeklifi[], paraBirimi: string): UrunIstatistik[] => {
    const urunGruplari = new Map<string, FiyatTeklifi[]>()
    
    data.forEach(item => {
      const urunAdi = item.urun_adi || 'Bilinmiyor'
      if (!urunGruplari.has(urunAdi)) {
        urunGruplari.set(urunAdi, [])
      }
      urunGruplari.get(urunAdi)!.push(item)
    })

    const istatistikler: UrunIstatistik[] = []
    
    urunGruplari.forEach((items, urunAdi) => {
      const siraliItems = items
        .map(item => ({
          ...item,
          tlFiyat: convertPrice(item.fiyat, item.para_birimi, 'TRY', kurlar)
        }))
        .sort((a, b) => a.tlFiyat - b.tlFiyat)

      if (siraliItems.length === 0) return

      const enUcuzItem = siraliItems[0]
      const enPahaliItem = siraliItems[siraliItems.length - 1]

      const enUcuzConverted = convertPrice(enUcuzItem.tlFiyat, 'TRY', paraBirimi, kurlar)
      const enPahaliConverted = convertPrice(enPahaliItem.tlFiyat, 'TRY', paraBirimi, kurlar)
      
      istatistikler.push({
        urunAdi,
        enUcuz: enUcuzConverted,
        enUcuzFirma: enUcuzItem.firma_adi,
        enPahali: enPahaliConverted,
        enPahaliFirma: enPahaliItem.firma_adi,
        fark: enPahaliConverted - enUcuzConverted,
        adet: items.length
      })
    })

    return istatistikler.sort((a, b) => a.urunAdi.localeCompare(b.urunAdi))
  }, [kurlar])

  return {
    fiyatlar,
    filteredFiyatlar,
    loading,
    error,
    kurlar,
    loadData,
    filterData,
    calculateStatistics,
    setFilteredFiyatlar
  }
}

// ============================================================
// 2. CUSTOM HOOK - PAGINATION (hooks/usePagination.ts)
// ============================================================
import { useState, useMemo } from 'react'

export function usePagination<T>(
  data: T[],
  pageSize: number = 20
) {
  const [currentPage, setCurrentPage] = useState(1)
  
  const totalPages = Math.max(1, Math.ceil(data.length / pageSize))
  
  const currentData = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    const end = start + pageSize
    return data.slice(start, end)
  }, [data, currentPage, pageSize])

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  const nextPage = () => goToPage(currentPage + 1)
  const prevPage = () => goToPage(currentPage - 1)
  
  return {
    currentData,
    currentPage,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
    pageSize
  }
}

// ============================================================
// 3. CUSTOM HOOK - SORTING (hooks/useSorting.ts)
// ============================================================
import { useState, useMemo } from 'react'

type SortDirection = 'asc' | 'desc'

interface SortConfig {
  field: string | null
  direction: SortDirection
}

export function useSorting<T>(
  data: T[],
  initialField: string | null = null,
  initialDirection: SortDirection = 'asc'
) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: initialField,
    direction: initialDirection
  })

  const sortedData = useMemo(() => {
    if (!sortConfig.field) return data

    return [...data].sort((a, b) => {
      const aValue = (a as any)[sortConfig.field]
      const bValue = (b as any)[sortConfig.field]

      if (aValue === null || aValue === undefined) return 1
      if (bValue === null || bValue === undefined) return -1

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue
      }

      const aString = String(aValue).toLowerCase()
      const bString = String(bValue).toLowerCase()
      
      return sortConfig.direction === 'asc'
        ? aString.localeCompare(bString)
        : bString.localeCompare(aString)
    })
  }, [data, sortConfig])

  const toggleSort = (field: string) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  return { sortedData, sortConfig, toggleSort }
}

// ============================================================
// 4. PERFORMANS İYİLEŞTİRİLMİŞ ANA BİLEŞEN
// ============================================================
'use client'

import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react'
import { supabase } from '../../../../lib/supabase'
import { convertPrice, formatPrice, getKurlar, kurDegistiginde } from '../../../../lib/currency'
import { useFiyatVerileri } from './hooks/useFiyatVerileri'
import { usePagination } from './hooks/usePagination'
import { useSorting } from './hooks/useSorting'
import {
  X,
  TrendingUp,
  Building2,
  ChevronRight,
  BarChart3,
  Download,
  RefreshCw,
  ArrowUpDown,
  AlertCircle,
  Search,
  Filter,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

// Lazy loading for PDF component
const RaporPDF = lazy(() => import('./components/RaporPDF'))

// ============================================================
// PERFORMANS İYİLEŞTİRİLMİŞ DETAY MODALI
// ============================================================
const DetayModal = React.memo(({ 
  urun, 
  firmaDetaylari, 
  onClose, 
  gorunenParaBirimi, 
  kurlar 
}: {
  urun: any
  firmaDetaylari: any[]
  onClose: () => void
  gorunenParaBirimi: string
  kurlar: any
}) => {
  // ESC tuşu ile kapatma
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    
    // Arka plan kaydırmasını engelle
    document.body.style.overflow = 'hidden'
    
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  if (!urun) return null

  // Fiyat dönüşümü - memoized
  const getConvertedPrice = useCallback((fiyat: number, paraBirimi: string) => {
    const parsedFiyat = parseFloat(String(fiyat).replace(',', '.'))
    if (isNaN(parsedFiyat) || !parsedFiyat) {
      return { original: '-', converted: '-', convertedValue: 0 }
    }
    
    const tlValue = convertPrice(parsedFiyat, paraBirimi, 'TRY', kurlar)
    const converted = convertPrice(tlValue, 'TRY', gorunenParaBirimi, kurlar)
    
    return {
      original: formatPrice(parsedFiyat, paraBirimi),
      converted: formatPrice(converted, gorunenParaBirimi),
      convertedValue: converted
    }
  }, [kurlar, gorunenParaBirimi])

  // Sıralı fiyatlar - memoized
  const sortedFiyatlar = useMemo(() => {
    return [...firmaDetaylari]
      .map(item => ({
        ...item,
        _converted: getConvertedPrice(item.fiyat, item.para_birimi || 'TRY')
      }))
      .sort((a, b) => a._converted.convertedValue - b._converted.convertedValue)
  }, [firmaDetaylari, getConvertedPrice])

  const enUcuz = sortedFiyatlar[0]
  const enPahali = sortedFiyatlar[sortedFiyatlar.length - 1]
  const fark = (enPahali?._converted?.convertedValue || 0) - (enUcuz?._converted?.convertedValue || 0)

  // Fiyat formatı
  const formatPriceDisplay = useCallback((price: number, currency: string) => {
    if (price === null || price === undefined) return '-'
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency
    }).format(price)
  }, [])

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        role="dialog" 
        aria-modal="true" 
        aria-label={urun.urunAdi} 
        onClick={(e) => e.stopPropagation()} 
        className="bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-700/50 shadow-2xl animate-in slide-in-from-bottom-4 duration-300"
      >
        {/* Modal içeriği */}
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50 p-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-emerald-400" />
              {urun.urunAdi}
            </h2>
            <p className="text-sm text-slate-400">
              {firmaDetaylari.length} firma tarafından teklif verilmiş
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-slate-800 rounded-lg transition text-slate-400 hover:text-white"
            aria-label="Kapat"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Özet kartları */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
              <p className="text-xs text-slate-400">Toplam Teklif</p>
              <p className="text-2xl font-bold text-white">{firmaDetaylari.length}</p>
            </div>
            
            <div className="bg-slate-800/50 rounded-xl p-4 border border-emerald-500/30">
              <p className="text-xs text-slate-400">💚 En Ucuz</p>
              <p className="text-2xl font-bold text-emerald-400">
                {enUcuz?._converted?.converted || '-'}
              </p>
              <p className="text-xs text-slate-400 truncate">{enUcuz?.firma_adi}</p>
              <p className="text-xs text-slate-500">Orijinal: {enUcuz?._converted?.original || '-'}</p>
            </div>
            
            <div className="bg-slate-800/50 rounded-xl p-4 border border-red-500/30">
              <p className="text-xs text-slate-400">❤️ En Pahalı</p>
              <p className="text-2xl font-bold text-red-400">
                {enPahali?._converted?.converted || '-'}
              </p>
              <p className="text-xs text-slate-400 truncate">{enPahali?.firma_adi}</p>
              <p className="text-xs text-slate-500">Orijinal: {enPahali?._converted?.original || '-'}</p>
            </div>
            
            <div className="bg-slate-800/50 rounded-xl p-4 border border-amber-500/30">
              <p className="text-xs text-slate-400">💰 Fiyat Farkı</p>
              <p className="text-2xl font-bold text-amber-400">
                {formatPriceDisplay(fark, gorunenParaBirimi)}
              </p>
              <p className="text-xs text-slate-400">En yüksek - En düşük</p>
            </div>
          </div>

          {/* Firma fiyat tablosu */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-emerald-400" />
              Firma Bazında Fiyatlar
            </h3>
            <div className="overflow-x-auto bg-slate-800/30 rounded-xl border border-slate-700/50">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700 bg-slate-800/50">
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">#</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Firma</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium hidden md:table-cell">Marka</th>
                    <th className="text-right py-3 px-4 text-slate-400 font-medium">Çevrilmiş Fiyat</th>
                    <th className="text-right py-3 px-4 text-slate-400 font-medium hidden md:table-cell">Orijinal</th>
                    <th className="text-center py-3 px-4 text-slate-400 font-medium">Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedFiyatlar.map((item, index) => {
                    const isEnUcuz = item._converted.convertedValue === enUcuz?._converted?.convertedValue
                    const isEnPahali = item._converted.convertedValue === enPahali?._converted?.convertedValue
                    
                    return (
                      <tr 
                        key={item.id} 
                        className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="py-3 px-4 text-slate-500 text-xs">{index + 1}</td>
                        <td className="py-3 px-4 text-white font-medium">
                          {item.firma_adi}
                          {isEnUcuz && (
                            <span className="ml-2 text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                              En Ucuz
                            </span>
                          )}
                          {isEnPahali && (
                            <span className="ml-2 text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">
                              En Pahalı
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-400 hidden md:table-cell">
                          {item.marka || '-'}
                        </td>
                        <td className={`py-3 px-4 font-bold text-right ${
                          isEnUcuz ? 'text-emerald-400' : 
                          isEnPahali ? 'text-red-400' : 
                          'text-white'
                        }`}>
                          {item._converted.converted}
                        </td>
                        <td className="py-3 px-4 text-slate-400 text-xs text-right hidden md:table-cell">
                          {item._converted.original}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            item.durum === 'approved' ? 'bg-emerald-500/20 text-emerald-400' : 
                            item.durum === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : 
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {item.durum === 'approved' ? '✅ Onaylandı' : 
                             item.durum === 'pending' ? '⏳ Beklemede' : 
                             '❌ Reddedildi'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Grafik */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              Fiyat Karşılaştırma Grafiği
            </h3>
            <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
              {sortedFiyatlar.map((item) => {
                const maxFiyat = sortedFiyatlar[sortedFiyatlar.length - 1]?._converted?.convertedValue || 1
                const yuzde = (item._converted.convertedValue / maxFiyat) * 100
                const isEnUcuz = item._converted.convertedValue === enUcuz?._converted?.convertedValue
                const isEnPahali = item._converted.convertedValue === enPahali?._converted?.convertedValue
                
                return (
                  <div key={item.id} className="flex items-center gap-4 mb-2 group">
                    <span className="text-xs text-slate-400 w-24 truncate group-hover:text-white transition-colors">
                      {item.firma_adi}
                    </span>
                    <div className="flex-1 h-6 bg-slate-700/30 rounded-lg overflow-hidden">
                      <div 
                        className={`h-full rounded-lg transition-all duration-700 ${
                          isEnUcuz ? 'bg-emerald-500' : 
                          isEnPahali ? 'bg-red-500' : 
                          'bg-blue-500'
                        }`} 
                        style={{ width: `${Math.max(yuzde, 5)}%` }}
                      />
                    </div>
                    <span className={`text-xs font-bold w-20 text-right ${
                      isEnUcuz ? 'text-emerald-400' : 
                      isEnPahali ? 'text-red-400' : 
                      'text-white'
                    }`}>
                      {item._converted.converted}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

DetayModal.displayName = 'DetayModal'

// ============================================================
// ANA BİLEŞEN - OPTİMİZE EDİLMİŞ
// ============================================================
export default function RaporlarPage() {
  // Custom hooks
  const {
    fiyatlar,
    filteredFiyatlar,
    loading,
    error,
    kurlar,
    loadData,
    filterData,
    calculateStatistics,
    setFilteredFiyatlar
  } = useFiyatVerileri()

  // State
  const [arama, setArama] = useState('')
  const [filtreKategori, setFiltreKategori] = useState('')
  const [filtreFirma, setFiltreFirma] = useState('')
  const [filtreDurum, setFiltreDurum] = useState('')
  const [fiyatMin, setFiyatMin] = useState<number | undefined>()
  const [fiyatMax, setFiyatMax] = useState<number | undefined>()
  const [seciliIds, setSeciliIds] = useState<string[]>([])
  const [gorunenParaBirimi, setGorunenParaBirimi] = useState('TRY')
  const [detayModalAcik, setDetayModalAcik] = useState(false)
  const [detayUrun, setDetayUrun] = useState<any>(null)
  const [detayFirmaDetaylari, setDetayFirmaDetaylari] = useState<any[]>([])
  const [firmalar, setFirmalar] = useState<any[]>([])
  const [kategoriler, setKategoriler] = useState<any[]>([])
  const [firmaBilgileri, setFirmaBilgileri] = useState({})
  const [logoUrl, setLogoUrl] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // Sorting
  const { sortedData: sortedFiltered, sortConfig, toggleSort } = useSorting(
    filteredFiyatlar,
    'created_at',
    'desc'
  )

  // Pagination
  const { currentData: sayfalanmisVeri, currentPage, totalPages, goToPage, nextPage, prevPage } = usePagination(
    sortedFiltered,
    20
  )

  // Client-side rendering
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Sidebar verileri
  useEffect(() => {
    const loadSidebarData = async () => {
      try {
        const [firmalarRes, kategoriRes, firmaRes] = await Promise.all([
          supabase.from('firmalar').select('ad'),
          supabase.from('kategoriler').select('ad'),
          supabase.from('firma_bilgileri').select('*').maybeSingle()
        ])
        
        if (firmalarRes.data) setFirmalar(firmalarRes.data)
        if (kategoriRes.data) setKategoriler(kategoriRes.data)
        if (firmaRes.data) {
          setFirmaBilgileri(firmaRes.data)
          setLogoUrl(firmaRes.data.logo_url || '')
        }
      } catch (err) {
        console.error('Sidebar veri yükleme hatası:', err)
      }
    }
    
    loadSidebarData()
  }, [])

  // Filtreleme - debounce ile
  useEffect(() => {
    const timer = setTimeout(() => {
      const filters = {
        arama: arama,
        kategori: filtreKategori,
        firma: filtreFirma,
        durum: filtreDurum,
        fiyatMin: fiyatMin,
        fiyatMax: fiyatMax
      }
      
      const filtered = filterData(fiyatlar, filters)
      setFilteredFiyatlar(filtered)
    }, 300)

    return () => clearTimeout(timer)
  }, [arama, filtreKategori, filtreFirma, filtreDurum, fiyatMin, fiyatMax, fiyatlar, filterData, setFilteredFiyatlar])

  // İstatistikler
  const urunIstatistikleri = useMemo(() => {
    return calculateStatistics(filteredFiyatlar, gorunenParaBirimi)
  }, [filteredFiyatlar, gorunenParaBirimi, calculateStatistics])

  // Seçili kayıtlar
  const toggleSecim = useCallback((id: string) => {
    setSeciliIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }, [])

  // Tümünü seç
  const toggleAll = useCallback(() => {
    if (seciliIds.length === filteredFiyatlar.length) {
      setSeciliIds([])
    } else {
      setSeciliIds(filteredFiyatlar.map(item => item.id))
    }
  }, [seciliIds, filteredFiyatlar])

  // Ürün etiketi
  const getUrunEtiketi = useCallback((item: any) => {
    const urunItems = filteredFiyatlar.filter(i => i.urun_adi === item.urun_adi)
    if (urunItems.length < 2) return null
    
    const tlFiyatlar = urunItems.map(i => {
      const fiyat = parseFloat(i.fiyat)
      const paraBirimi = i.para_birimi || 'TRY'
      return convertPrice(fiyat, paraBirimi, 'TRY', kurlar)
    })
    
    const minFiyat = Math.min(...tlFiyatlar)
    const maxFiyat = Math.max(...tlFiyatlar)
    const mevcutTL = convertPrice(parseFloat(item.fiyat), item.para_birimi || 'TRY', 'TRY', kurlar)
    
    if (mevcutTL === minFiyat) return 'ucuz'
    if (mevcutTL === maxFiyat) return 'pahali'
    return null
  }, [filteredFiyatlar, kurlar])

  // Fiyat dönüşümü
  const getConvertedPrice = useCallback((fiyat: number, paraBirimi: string) => {
    const parsedFiyat = parseFloat(String(fiyat).replace(',', '.'))
    if (isNaN(parsedFiyat) || !parsedFiyat) {
      return { original: '-', converted: '-', convertedValue: 0 }
    }
    
    const tlValue = convertPrice(parsedFiyat, paraBirimi, 'TRY', kurlar)
    const converted = convertPrice(tlValue, 'TRY', gorunenParaBirimi, kurlar)
    
    return {
      original: formatPrice(parsedFiyat, paraBirimi),
      converted: formatPrice(converted, gorunenParaBirimi),
      convertedValue: converted
    }
  }, [kurlar, gorunenParaBirimi])

  // Detay aç
  const handleDetayAc = useCallback((urun: any) => {
    const firmaDetaylari = filteredFiyatlar.filter(item => item.urun_adi === urun.urunAdi)
    setDetayUrun(urun)
    setDetayFirmaDetaylari(firmaDetaylari)
    setDetayModalAcik(true)
  }, [filteredFiyatlar])

  // CSV indir
  const csvIndir = useCallback(() => {
    const basliklar = ['Ürün Adı', 'Marka', 'Firma', 'Kategori', 'Fiyat', 'Para Birimi', 'Durum', 'Tarih']
    const satirlar = filteredFiyatlar.map(item => [
      item.urun_adi,
      item.marka || '',
      item.firma_adi,
      item.kategori || '',
      item.fiyat,
      item.para_birimi || 'TRY',
      item.durum === 'approved' ? 'Aktif' : item.durum === 'pending' ? 'Beklemede' : 'Pasif',
      item.created_at ? new Date(item.created_at).toLocaleString('tr-TR') : '',
    ])
    
    const csvIcerik = [basliklar, ...satirlar]
      .map(satir => satir.map(hucre => `"${String(hucre ?? '').replace(/"/g, '""')}"`).join(';'))
      .join('\n')
    
    const blob = new Blob(['\uFEFF' + csvIcerik], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Fiyat_Teklifleri_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [filteredFiyatlar])

  // PDF verileri
  const preparedData = useMemo(() => {
    return filteredFiyatlar
      .filter(item => seciliIds.includes(item.id))
      .map(item => {
        const etiket = getUrunEtiketi(item)
        const converted = getConvertedPrice(item.fiyat, item.para_birimi)
        return {
          ...item,
          _etiket: etiket,
          _convertedPrice: converted.convertedValue,
        }
      })
  }, [seciliIds, filteredFiyatlar, getUrunEtiketi, getConvertedPrice])

  const preparedIstatistikler = useMemo(() => {
    const selectedData = filteredFiyatlar.filter(item => seciliIds.includes(item.id))
    return calculateStatistics(selectedData, gorunenParaBirimi)
  }, [seciliIds, filteredFiyatlar, gorunenParaBirimi, calculateStatistics])

  // Skeleton loading
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-800 rounded-lg animate-pulse" />
            <div className="flex-1">
              <div className="h-6 w-32 bg-slate-800 rounded animate-pulse" />
              <div className="h-4 w-48 bg-slate-800/50 rounded mt-2 animate-pulse" />
            </div>
          </div>
          
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-slate-900/40 rounded-2xl p-5 border border-slate-700/50">
              <div className="animate-pulse space-y-4">
                <div className="h-4 w-1/4 bg-slate-800 rounded" />
                <div className="h-10 bg-slate-800 rounded" />
                <div className="h-20 bg-slate-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Raporlar</h1>
            </div>
            <p className="text-slate-400 text-sm mt-1 ml-11">
              {filteredFiyatlar.length} kayıt listeleniyor
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 bg-slate-900/80 hover:bg-slate-800/80 text-slate-300 px-3 py-2 rounded-xl transition-all border border-slate-700/50"
            >
              <Filter className="h-4 w-4" />
              <span className="text-sm">Filtreler</span>
              {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            
            <div className="flex items-center bg-slate-900/80 p-1 rounded-xl border border-slate-700/50 backdrop-blur-sm">
              {['TRY', 'USD', 'EUR'].map((currency) => (
                <button
                  key={currency}
                  onClick={() => setGorunenParaBirimi(currency)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    gorunenParaBirimi === currency 
                      ? 'bg-slate-700 text-white shadow-sm' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  {currency}
                </button>
              ))}
            </div>
            
            <button
              onClick={loadData}
              className="p-2 hover:bg-slate-800 rounded-xl transition text-slate-400 hover:text-white border border-slate-700/50"
              aria-label="Yenile"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Hata mesajı */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={loadData}
              className="text-xs font-medium bg-red-500/20 hover:bg-red-500/30 text-red-300 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 flex-shrink-0"
            >
              <RefreshCw className="h-3 w-3" /> Tekrar Dene
            </button>
          </div>
        )}

        {/* Gelişmiş filtreler */}
        {showFilters && (
          <div className="bg-slate-900/40 rounded-2xl p-5 border border-slate-700/50 backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Arama */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={arama}
                  onChange={(e) => setArama(e.target.value)}
                  placeholder="Ürün, firma veya marka ara..."
                  className="w-full bg-slate-950 border border-slate-700/50 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                />
              </div>

              {/* Kategori */}
              <div className="relative">
                <select
                  value={filtreKategori}
                  onChange={(e) => setFiltreKategori(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/50 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all appearance-none"
                >
                  <option value="">Tüm Kategoriler</option>
                  {kategoriler.map((k, i) => (
                    <option key={i} value={k.ad}>{k.ad}</option>
                  ))}
                </select>
              </div>

              {/* Firma */}
              <div className="relative">
                <select
                  value={filtreFirma}
                  onChange={(e) => setFiltreFirma(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/50 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all appearance-none"
                >
                  <option value="">Tüm Firmalar</option>
                  {firmalar.map((f, i) => (
                    <option key={i} value={f.ad}>{f.ad}</option>
                  ))}
                </select>
              </div>

              {/* Durum */}
              <div className="relative">
                <select
                  value={filtreDurum}
                  onChange={(e) => setFiltreDurum(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/50 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all appearance-none"
                >
                  <option value="">Tüm Durumlar</option>
                  <option value="approved">Aktif</option>
                  <option value="pending">Beklemede</option>
                  <option value="rejected">Pasif</option>
                </select>
              </div>
            </div>

            {/* Fiyat aralığı */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Min Fiyat (TL)</label>
                <input
                  type="number"
                  value={fiyatMin || ''}
                  onChange={(e) => setFiyatMin(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="0"
                  className="w-full bg-slate-950 border border-slate-700/50 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Max Fiyat (TL)</label>
                <input
                  type="number"
                  value={fiyatMax || ''}
                  onChange={(e) => setFiyatMax(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="999999"
                  className="w-full bg-slate-950 border border-slate-700/50 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                />
              </div>
            </div>
          </div>
        )}

        {/* İstatistik kartları */}
        {urunIstatistikleri.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              Genel Fiyat Analizi
              <span className="text-xs text-slate-500 font-normal">
                ({urunIstatistikleri.length} ürün)
              </span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {urunIstatistikleri.map((urun, index) => (
                <div
                  key={index}
                  onClick={() => handleDetayAc(urun)}
                  className="bg-slate-900/40 rounded-xl p-3 border border-slate-700/50 shadow-sm hover:border-emerald-500/50 hover:shadow-emerald-500/10 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                >
                  <div className="flex items-start justify-between">
                    <p className="text-sm font-semibold text-white truncate flex-1" title={urun.urunAdi}>
                      {urun.urunAdi}
                    </p>
                    <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all duration-300 flex-shrink-0 ml-1" />
                  </div>
                  
                  <div className="space-y-1.5 mt-2">
                    <div className="flex justify-between items-center bg-slate-950/50 p-1.5 rounded-lg border border-emerald-500/10">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-slate-400 uppercase tracking-wider">En Uygun</span>
                        <span className="text-[10px] text-slate-300 truncate max-w-[80px]" title={urun.enUcuzFirma}>
                          {urun.enUcuzFirma}
                        </span>
                      </div>
                      <span className="text-xs text-emerald-400 font-bold">
                        {formatPrice(urun.enUcuz, gorunenParaBirimi)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center bg-slate-950/50 p-1.5 rounded-lg border border-red-500/10">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-slate-400 uppercase tracking-wider">En Yüksek</span>
                        <span className="text-[10px] text-slate-300 truncate max-w-[80px]" title={urun.enPahaliFirma}>
                          {urun.enPahaliFirma}
                        </span>
                      </div>
                      <span className="text-xs text-red-400 font-bold">
                        {formatPrice(urun.enPahali, gorunenParaBirimi)}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-2.5 pt-2.5 border-t border-slate-700/50">
                    <span className="text-[10px] text-amber-400/90 font-medium">
                      Fark: {formatPrice(urun.fark, gorunenParaBirimi)}
                    </span>
                    <span className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded-full">
                      {urun.adet} firma
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ana tablo */}
        <div className="bg-slate-900/40 rounded-2xl border border-slate-700/50 overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-700/50 flex flex-wrap items-center justify-between gap-3 bg-slate-900/80">
            <h3 className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-emerald-400" />
              Fiyat Teklifleri Tablosu
              <span className="text-xs text-slate-500 font-normal ml-1">
                ({filteredFiyatlar.length} kayıt)
              </span>
            </h3>
            
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={csvIndir}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 text-sm font-medium border border-slate-700/50"
              >
                <Download className="h-4 w-4" />
                CSV
              </button>
              
              {isClient && seciliIds.length > 0 && (
                <Suspense fallback={
                  <button className="bg-emerald-500/50 text-white px-4 py-1.5 rounded-xl flex items-center gap-2 text-sm font-medium" disabled>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Yükleniyor...
                  </button>
                }>
                  <PDFDownloadLink
                    document={
                      <RaporPDF 
                        data={preparedData} 
                        firmaBilgileri={firmaBilgileri} 
                        logoUrl={logoUrl} 
                        paraBirimi={gorunenParaBirimi} 
                        seciliIstatistikler={preparedIstatistikler} 
                      />
                    }
                    fileName={`Analiz_Raporu_${new Date().toISOString().split('T')[0]}.pdf`}
                  >
                    {({ loading: pdfLoading }) => (
                      <button
                        disabled={pdfLoading}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-1.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium shadow-lg shadow-emerald-500/20"
                      >
                        {pdfLoading ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            Oluşturuluyor...
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4" />
                            PDF ({seciliIds.length})
                          </>
                        )}
                      </button>
                    )}
                  </PDFDownloadLink>
                </Suspense>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[11px] text-slate-400 uppercase tracking-wider bg-slate-900/50 border-b border-slate-700/50 sticky top-0 z-10">
                <tr>
                  <th className="py-3 px-4 w-10">
                    <div className="flex items-center justify-center">
                      <input
                        type="checkbox"
                        onChange={toggleAll}
                        checked={seciliIds.length === filteredFiyatlar.length && filteredFiyatlar.length > 0}
                        className="w-4 h-4 bg-slate-900 border-slate-700 rounded text-emerald-500 focus:ring-emerald-500/50 focus:ring-offset-slate-900 cursor-pointer"
                      />
                    </div>
                  </th>
                  <th 
                    className="py-3 px-4 font-semibold cursor-pointer select-none hover:text-slate-200 transition-colors"
                    onClick={() => toggleSort('urun_adi')}
                  >
                    <div className="flex items-center gap-1">
                      Ürün Adı
                      <ArrowUpDown className={`h-3 w-3 ${sortConfig.field === 'urun_adi' ? 'text-emerald-400' : 'text-slate-600'}`} />
                    </div>
                  </th>
                  <th className="py-3 px-4 font-semibold hidden md:table-cell">Marka</th>
                  <th 
                    className="py-3 px-4 font-semibold cursor-pointer select-none hover:text-slate-200 transition-colors"
                    onClick={() => toggleSort('firma_adi')}
                  >
                    <div className="flex items-center gap-1">
                      Firma
                      <ArrowUpDown className={`h-3 w-3 ${sortConfig.field === 'firma_adi' ? 'text-emerald-400' : 'text-slate-600'}`} />
                    </div>
                  </th>
                  <th className="py-3 px-4 font-semibold hidden lg:table-cell">Kategori</th>
                  <th 
                    className="py-3 px-4 font-semibold text-right cursor-pointer select-none hover:text-slate-200 transition-colors"
                    onClick={() => toggleSort('fiyat')}
                  >
                    <div className="flex items-center justify-end gap-1">
                      Fiyat
                      <ArrowUpDown className={`h-3 w-3 ${sortConfig.field === 'fiyat' ? 'text-emerald-400' : 'text-slate-600'}`} />
                    </div>
                  </th>
                  <th className="py-3 px-4 font-semibold text-center">Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {sayfalanmisVeri.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <div className="flex flex-col items-center">
                        <Search className="h-12 w-12 text-slate-600 mb-3" />
                        <p className="text-slate-400 font-medium">Kayıt bulunamadı</p>
                        <p className="text-slate-500 text-sm mt-1">Filtre kriterlerinize uygun veri yok</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  sayfalanmisVeri.map((item) => {
                    const isSelected = seciliIds.includes(item.id)
                    const etiket = getUrunEtiketi(item)
                    const fiyatlar = getConvertedPrice(item.fiyat, item.para_birimi)
                    
                    return (
                      <tr 
                        key={item.id} 
                        onClick={() => toggleSecim(item.id)}
                        className={`group cursor-pointer transition-colors hover:bg-slate-800/40 ${
                          isSelected ? 'bg-emerald-500/5 hover:bg-emerald-500/10' : ''
                        }`}
                      >
                        <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSecim(item.id)}
                              className="w-4 h-4 bg-slate-900 border-slate-700 rounded text-emerald-500 focus:ring-emerald-500/50 focus:ring-offset-slate-900 cursor-pointer"
                            />
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col gap-1">
                            <span className="text-slate-200 font-medium">{item.urun_adi}</span>
                            {etiket === 'ucuz' && (
                              <span className="w-fit text-[10px] font-medium bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-500/20">
                                En Ucuz
                              </span>
                            )}
                            {etiket === 'pahali' && (
                              <span className="w-fit text-[10px] font-medium bg-red-500/10 text-red-400 px-2 py-0.5 rounded-md border border-red-500/20">
                                En Yüksek
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-400 hidden md:table-cell">
                          {item.marka || '-'}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/50 text-slate-300 text-xs font-medium border border-slate-700/50 group-hover:border-slate-600/50 transition-colors">
                            {item.firma_adi}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-400 hidden lg:table-cell">
                          {item.kategori || '-'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex flex-col items-end gap-0.5">
                            <span className={`text-sm font-bold tracking-tight ${
                              etiket === 'ucuz' ? 'text-emerald-400' : 
                              etiket === 'pahali' ? 'text-red-400' : 
                              'text-white'
                            }`}>
                              {fiyatlar.converted}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium">
                              Asıl: {fiyatlar.original}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex justify-center">
                            <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full border ${
                              item.durum === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                              item.durum === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                              'bg-red-500/10 text-red-400 border-red-500/20'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                item.durum === 'approved' ? 'bg-emerald-400' : 
                                item.durum === 'pending' ? 'bg-amber-400' : 
                                'bg-red-400'
                              }`} />
                              {item.durum === 'approved' ? 'Aktif' : 
                               item.durum === 'pending' ? 'Beklemede' : 
                               'Pasif'}
                            </span>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredFiyatlar.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-700/50 bg-slate-900/50">
              <span className="text-xs text-slate-400">
                Toplam <span className="text-white font-medium">{filteredFiyatlar.length}</span> kayıttan{' '}
                <span className="text-white font-medium">
                  {(currentPage - 1) * 20 + 1}-
                  {Math.min(currentPage * 20, filteredFiyatlar.length)}
                </span> arası gösteriliyor
              </span>
              
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={prevPage}
                  className="px-3 py-1.5 text-xs rounded-lg bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
                >
                  Önceki
                </button>
                
                <span className="text-xs text-slate-400">
                  Sayfa {currentPage} / {totalPages}
                </span>
                
                <button
                  disabled={currentPage === totalPages}
                  onClick={nextPage}
                  className="px-3 py-1.5 text-xs rounded-lg bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
                >
                  Sonraki
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detay Modal */}
      {detayModalAcik && detayUrun && (
        <DetayModal
          urun={detayUrun}
          firmaDetaylari={detayFirmaDetaylari}
          onClose={() => {
            setDetayModalAcik(false)
            setDetayUrun(null)
            setDetayFirmaDetaylari([])
          }}
          gorunenParaBirimi={gorunenParaBirimi}
          kurlar={kurlar}
        />
      )}
    </div>
  )
}
