'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../../lib/supabase'
import { convertPrice, formatPrice, getKurlar, kurDegistiginde } from '../../../../lib/currency'
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'
import { X, TrendingUp, Building2, ChevronRight, BarChart3, Download, RefreshCw, ArrowUpDown, AlertCircle } from 'lucide-react'

// ============================================================
// PDF STILLERI (AYNI)
// ============================================================
const pdfStyles = StyleSheet.create({
  // ... (AYNEN KALSIN)
})

// ============================================================
// PDF BİLEŞENİ (AYNI)
// ============================================================
const RaporPDF = ({ data, firmaBilgileri, logoUrl, paraBirimi, seciliIstatistikler }) => {
  // ... (AYNEN KALSIN)
}

// ============================================================
// DETAY MODALI (AYNI)
// ============================================================
const DetayModal = ({ urun, firmaDetaylari, onClose, gorunenParaBirimi, kurlar }) => {
  // ... (AYNEN KALSIN)
}

// ============================================================
// ANA SAYFA - SADECE BAŞLANGIÇ KISMI DEĞİŞTİ
// ============================================================
export default function RaporlarPage() {
  const router = useRouter()
  
  // ✅ TÜM STATE'LER EN ÜSTTE
  const [sessionLoading, setSessionLoading] = useState(true)
  const [fiyatlar, setFiyatlar] = useState([])
  const [filteredFiyatlar, setFilteredFiyatlar] = useState([])
  const [loading, setLoading] = useState(true)
  const [arama, setArama] = useState('')
  const [filtreKategori, setFiltreKategori] = useState('')
  const [filtreFirma, setFiltreFirma] = useState('')
  const [firmalar, setFirmalar] = useState([])
  const [kategoriler, setKategoriler] = useState([])
  const [firmaBilgileri, setFirmaBilgileri] = useState({})
  const [logoUrl, setLogoUrl] = useState('')
  const [seciliIds, setSeciliIds] = useState([])
  const [gorunenParaBirimi, setGorunenParaBirimi] = useState('TRY')
  const [kurlar, setKurlar] = useState({ usdTry: 34.50, eurTry: 37.20 })
  const [urunIstatistikleri, setUrunIstatistikleri] = useState([])
  const [detayModalAcik, setDetayModalAcik] = useState(false)
  const [detayUrun, setDetayUrun] = useState(null)
  const [detayFirmaDetaylari, setDetayFirmaDetaylari] = useState([])
  const [error, setError] = useState(null)
  const [siralama, setSiralama] = useState({ alan: null, yon: 'asc' })
  const [sayfa, setSayfa] = useState(1)
  const SAYFA_BOYUTU = 20
  const [isClient, setIsClient] = useState(false)

  // ✅ useEffect'LER
  useEffect(() => {
    const kontrol = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login?redirect=/panel/raporlar')
      } else {
        setSessionLoading(false)
      }
    }
    kontrol()
  }, [])

  useEffect(() => {
    setIsClient(true)
  }, [])

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: fiyatData, error: fiyatError } = await supabase.from('fiyat_teklifleri').select('*').order('created_at', { ascending: false })
      if (fiyatError) throw fiyatError
      setFiyatlar(fiyatData || [])
      setFilteredFiyatlar(fiyatData || [])
      const { data: firmalarData } = await supabase.from('firmalar').select('ad')
      setFirmalar(firmalarData || [])
      const { data: kategoriData } = await supabase.from('kategoriler').select('ad')
      setKategoriler(kategoriData || [])
      const { data: firmaData } = await supabase.from('firma_bilgileri').select('*').maybeSingle()
      if (firmaData) {
        setFirmaBilgileri(firmaData)
        setLogoUrl(firmaData.logo_url || '')
      }
    } catch (err) {
      console.error('Veri yükleme hatası:', err)
      setError('Veriler yüklenirken bir sorun oluştu. Bağlantınızı kontrol edip tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (sessionLoading) return
    loadData()
  }, [loadData, sessionLoading])

  useEffect(() => {
    if (sessionLoading) return
    const kanal = supabase
      .channel('fiyat_teklifleri_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fiyat_teklifleri' }, async () => {
        const { data } = await supabase.from('fiyat_teklifleri').select('*').order('created_at', { ascending: false })
        if (data) setFiyatlar(data)
      })
      .subscribe()
    return () => {
      supabase.removeChannel(kanal)
    }
  }, [sessionLoading])

  useEffect(() => {
    if (sessionLoading) return
    const loadKurlar = async () => {
      const k = await getKurlar()
      setKurlar(k)
    }
    loadKurlar()
    const unsubscribe = kurDegistiginde((yeniKurlar) => setKurlar(yeniKurlar))
    return () => unsubscribe()
  }, [sessionLoading])

  // ✅ useMemo'LAR (AYNI)
  useEffect(() => {
    let filtered = [...fiyatlar]
    if (arama.trim()) {
      filtered = filtered.filter(item => item.urun_adi?.toLowerCase().includes(arama.toLowerCase()))
    }
    if (filtreKategori) {
      filtered = filtered.filter(item => item.kategori === filtreKategori)
    }
    if (filtreFirma) {
      filtered = filtered.filter(item => item.firma_adi === filtreFirma)
    }
    setFilteredFiyatlar(filtered)

    const urunGruplari = {}
    filtered.forEach(item => {
      const urunAdi = item.urun_adi || 'Bilinmiyor'
      if (!urunGruplari[urunAdi]) urunGruplari[urunAdi] = []
      urunGruplari[urunAdi].push(item)
    })

    const istatistikler = Object.keys(urunGruplari).map(urunAdi => {
      const items = urunGruplari[urunAdi]
      
      const siraliItems = items.map(item => {
        const fiyat = parseFloat(item.fiyat)
        const paraBirimi = item.para_birimi || 'TRY'
        return {
          ...item,
          tlFiyat: convertPrice(fiyat, paraBirimi, 'TRY', kurlar)
        }
      }).sort((a, b) => a.tlFiyat - b.tlFiyat)

      const enUcuzItem = siraliItems[0]
      const enPahaliItem = siraliItems[siraliItems.length - 1]

      const enUcuzConverted = convertPrice(enUcuzItem.tlFiyat, 'TRY', gorunenParaBirimi, kurlar)
      const enPahaliConverted = convertPrice(enPahaliItem.tlFiyat, 'TRY', gorunenParaBirimi, kurlar)
      
      return {
        urunAdi: urunAdi,
        enUcuz: enUcuzConverted,
        enUcuzFirma: enUcuzItem.firma_adi, 
        enPahali: enPahaliConverted,
        enPahaliFirma: enPahaliItem.firma_adi, 
        fark: enPahaliConverted - enUcuzConverted,
        adet: items.length
      }
    })
    setUrunIstatistikleri(istatistikler)
  }, [arama, filtreKategori, filtreFirma, fiyatlar, gorunenParaBirimi, kurlar])

  useEffect(() => {
    setSayfa(1)
  }, [arama, filtreKategori, filtreFirma, siralama])

  // ✅ useMemo'LAR (AYNI)
  const preparedData = useMemo(() => {
    return filteredFiyatlar.filter(item => seciliIds.includes(item.id)).map(item => {
      const etiket = getUrunEtiketi(item)
      const converted = getConvertedPrice(item.fiyat, item.para_birimi)
      return {
        ...item,
        _etiket: etiket,
        _convertedPrice: converted.convertedValue,
      }
    })
  }, [seciliIds, filteredFiyatlar, gorunenParaBirimi, kurlar])

  const preparedIstatistikler = useMemo(() => {
    const selectedData = filteredFiyatlar.filter(item => seciliIds.includes(item.id))
    const urunGruplari = {}
    selectedData.forEach(item => {
      const urunAdi = item.urun_adi || 'Bilinmiyor'
      if (!urunGruplari[urunAdi]) urunGruplari[urunAdi] = []
      urunGruplari[urunAdi].push(item)
    })

    return Object.keys(urunGruplari).map(urunAdi => {
      const items = urunGruplari[urunAdi]
      
      const siraliItems = items.map(item => {
        const fiyat = parseFloat(item.fiyat)
        const paraBirimi = item.para_birimi || 'TRY'
        return {
          ...item,
          tlFiyat: convertPrice(fiyat, paraBirimi, 'TRY', kurlar)
        }
      }).sort((a, b) => a.tlFiyat - b.tlFiyat)

      const enUcuzItem = siraliItems[0]
      const enPahaliItem = siraliItems[siraliItems.length - 1]

      const enUcuzConverted = convertPrice(enUcuzItem.tlFiyat, 'TRY', gorunenParaBirimi, kurlar)
      const enPahaliConverted = convertPrice(enPahaliItem.tlFiyat, 'TRY', gorunenParaBirimi, kurlar)
      
      return {
        urunAdi: urunAdi,
        enUcuz: enUcuzConverted,
        enUcuzFirma: enUcuzItem.firma_adi,
        enPahali: enPahaliConverted,
        enPahaliFirma: enPahaliItem.firma_adi,
        fark: enPahaliConverted - enUcuzConverted,
        adet: items.length
      }
    })
  }, [seciliIds, filteredFiyatlar, gorunenParaBirimi, kurlar])

  const sortedFiltered = useMemo(() => {
    if (!siralama.alan) return filteredFiyatlar
    const veri = [...filteredFiyatlar]
    veri.sort((a, b) => {
      let aDeger, bDeger
      if (siralama.alan === 'fiyat') {
        aDeger = getConvertedPrice(a.fiyat, a.para_birimi).convertedValue
        bDeger = getConvertedPrice(b.fiyat, b.para_birimi).convertedValue
      } else {
        aDeger = (a[siralama.alan] || '').toString().toLowerCase()
        bDeger = (b[siralama.alan] || '').toString().toLowerCase()
      }
      if (aDeger < bDeger) return siralama.yon === 'asc' ? -1 : 1
      if (aDeger > bDeger) return siralama.yon === 'asc' ? 1 : -1
      return 0
    })
    return veri
  }, [filteredFiyatlar, siralama, gorunenParaBirimi, kurlar])

  // ✅ ERKEN RETURN - EN SONDA
  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
          <p className="text-slate-400 mt-4">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  // ============================================================
  // FONKSİYONLAR (AYNI)
  // ============================================================
  const toggleSecim = (id) => {
    setSeciliIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const getUrunEtiketi = (item) => {
    // ... (AYNEN KALSIN)
  }

  const getConvertedPrice = (fiyat, paraBirimi) => {
    // ... (AYNEN KALSIN)
  }

  const handleDetayAc = (urun) => {
    // ... (AYNEN KALSIN)
  }

  const siralamaDegistir = (alan) => {
    // ... (AYNEN KALSIN)
  }

  const toplamSayfa = Math.max(1, Math.ceil(sortedFiltered.length / SAYFA_BOYUTU))
  const sayfalanmisVeri = sortedFiltered.slice((sayfa - 1) * SAYFA_BOYUTU, sayfa * SAYFA_BOYUTU)

  const csvIndir = () => {
    // ... (AYNEN KALSIN)
  }

  // ============================================================
  // JSX (AYNI)
  // ============================================================
  return (
    // ... (AYNEN KALSIN)
  )
}
