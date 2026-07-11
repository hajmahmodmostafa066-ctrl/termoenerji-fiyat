'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../../lib/supabase'
import { convertPrice, formatPrice, getKurlar, kurDegistiginde, getCurrencySymbol } from '../../../../lib/currency'
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'

// ============================================================
// PDF STILLERI
// ============================================================
const pdfStyles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '2px solid #10b981',
    paddingBottom: 15,
    marginBottom: 20,
  },
  companyName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  companySub: {
    fontSize: 9,
    color: '#64748b',
    marginTop: 2,
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 10,
  },
  dateText: {
    fontSize: 9,
    color: '#64748b',
    textAlign: 'right',
  },
  filterBox: {
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 6,
    marginVertical: 10,
    border: '1px solid #e2e8f0',
  },
  filterText: {
    fontSize: 8,
    color: '#475569',
  },
  
  // Ürün İstatistik Kartları
  statsContainer: {
    marginVertical: 12,
  },
  statsTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statCard: {
    backgroundColor: '#ffffff',
    padding: 10,
    borderRadius: 6,
    border: '1px solid #e2e8f0',
    width: '23%',
    minWidth: 110,
  },
  statProductName: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 3,
  },
  statLabel: {
    fontSize: 7,
    color: '#64748b',
  },
  statValueGreen: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#10b981',
  },
  statValueRed: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#ef4444',
  },
  statValueAmber: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#f59e0b',
  },
  statFirmaCount: {
    fontSize: 7,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 6,
    paddingTop: 4,
    borderTop: '1px dashed #e2e8f0',
  },
  
  // Tablo
  table: {
    marginTop: 12,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    padding: 10,
    borderRadius: 6,
  },
  tableHeaderCell: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottom: '1px solid #f1f5f9',
    alignItems: 'center',
  },
  tableRowAlternate: {
    flexDirection: 'row',
    padding: 8,
    borderBottom: '1px solid #f1f5f9',
    backgroundColor: '#fafafa',
    alignItems: 'center',
  },
  tableCell: {
    fontSize: 7,
    color: '#334155',
    flex: 1,
  },
  tableCellBold: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#0f172a',
    flex: 1,
  },
  priceCell: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#10b981',
    flex: 1,
    textAlign: 'right',
  },
  priceCellHigh: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#ef4444',
    flex: 1,
    textAlign: 'right',
  },
  statusCell: {
    fontSize: 7,
    color: '#10b981',
    flex: 1,
    textAlign: 'center',
  },
  statusCellPending: {
    fontSize: 7,
    color: '#f59e0b',
    flex: 1,
    textAlign: 'center',
  },
  statusCellRejected: {
    fontSize: 7,
    color: '#ef4444',
    flex: 1,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTop: '1px solid #e2e8f0',
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 7,
    color: '#94a3b8',
  },
})

// ============================================================
// PDF BİLEŞENİ
// ============================================================
const RaporPDF = ({ data, firmaBilgileri, logoUrl, baslik, kategori, firma, paraBirimi, urunIstatistikleri }) => {
  const formatPriceLocal = (price, currency = 'TRY') => {
    if (price === null || price === undefined) return '-'
    const symbol = getCurrencySymbol(currency)
    return `${symbol}${new Intl.NumberFormat('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price)}`
  }

  const formatDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleString('tr-TR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <View style={pdfStyles.header}>
          <View>
            {logoUrl && <Image src={logoUrl} style={{ width: 100, height: 35, marginBottom: 6 }} />}
            <Text style={pdfStyles.companyName}>{firmaBilgileri?.ad || 'TermoEnerji'}</Text>
            {firmaBilgileri?.adres && <Text style={pdfStyles.companySub}>{firmaBilgileri.adres}</Text>}
            {firmaBilgileri?.telefon && <Text style={pdfStyles.companySub}>Tel: {firmaBilgileri.telefon}</Text>}
          </View>
          <View>
            <Text style={pdfStyles.dateText}>Tarih: {formatDate(new Date())}</Text>
            <Text style={[pdfStyles.dateText, { marginTop: 4 }]}>Para Birimi: {paraBirimi}</Text>
          </View>
        </View>

        <View style={pdfStyles.filterBox}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
            <Text style={pdfStyles.filterText}>Arama: {baslik || 'Tümü'}</Text>
            <Text style={pdfStyles.filterText}>Kategori: {kategori || 'Tüm Kategoriler'}</Text>
            <Text style={pdfStyles.filterText}>Firma: {firma || 'Tüm Firmalar'}</Text>
            <Text style={pdfStyles.filterText}>Toplam: {data.length} kayıt</Text>
          </View>
        </View>

        {urunIstatistikleri && urunIstatistikleri.length > 0 && (
          <View style={pdfStyles.statsContainer}>
            <Text style={pdfStyles.statsTitle}>Ürün Bazlı Fiyat Analizi</Text>
            <View style={pdfStyles.statsGrid}>
              {urunIstatistikleri.map((urun, index) => (
                <View key={index} style={pdfStyles.statCard}>
                  <Text style={pdfStyles.statProductName}>{urun.urunAdi}</Text>
                  <View style={pdfStyles.statRow}>
                    <Text style={pdfStyles.statLabel}>En Ucuz</Text>
                    <Text style={pdfStyles.statValueGreen}>{formatPriceLocal(urun.enUcuz, paraBirimi)}</Text>
                  </View>
                  <View style={pdfStyles.statRow}>
                    <Text style={pdfStyles.statLabel}>En Pahalı</Text>
                    <Text style={pdfStyles.statValueRed}>{formatPriceLocal(urun.enPahali, paraBirimi)}</Text>
                  </View>
                  <View style={pdfStyles.statRow}>
                    <Text style={pdfStyles.statLabel}>Fark</Text>
                    <Text style={pdfStyles.statValueAmber}>{formatPriceLocal(urun.fark, paraBirimi)}</Text>
                  </View>
                  <Text style={pdfStyles.statFirmaCount}>{urun.adet} firma</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={pdfStyles.table}>
          <View style={pdfStyles.tableHeader}>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 0.4 }]}>#</Text>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 1.3 }]}>Ürün</Text>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 0.8 }]}>Marka</Text>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 1 }]}>Firma</Text>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 0.8 }]}>Kategori</Text>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 0.8, textAlign: 'right' }]}>Fiyat</Text>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 0.6, textAlign: 'center' }]}>Durum</Text>
          </View>
          
          {data.map((item, index) => (
            <View key={index} style={index % 2 === 0 ? pdfStyles.tableRow : pdfStyles.tableRowAlternate}>
              <Text style={[pdfStyles.tableCell, { flex: 0.4 }]}>{index + 1}</Text>
              <Text style={[pdfStyles.tableCellBold, { flex: 1.3 }]}>{item.urun_adi}</Text>
              <Text style={[pdfStyles.tableCell, { flex: 0.8 }]}>{item.marka || '-'}</Text>
              <Text style={[pdfStyles.tableCell, { flex: 1 }]}>{item.firma_adi}</Text>
              <Text style={[pdfStyles.tableCell, { flex: 0.8 }]}>{item.kategori || 'Genel'}</Text>
              <Text style={[
                item._etiket === 'ucuz' ? pdfStyles.priceCell : 
                item._etiket === 'pahali' ? pdfStyles.priceCellHigh : 
                pdfStyles.priceCell,
                { flex: 0.8 }
              ]}>
                {formatPriceLocal(item._convertedPrice || item.fiyat, paraBirimi)}
              </Text>
              <Text style={[
                item.durum === 'approved' ? pdfStyles.statusCell : 
                item.durum === 'pending' ? pdfStyles.statusCellPending : pdfStyles.statusCellRejected,
                { flex: 0.6, textAlign: 'center' }
              ]}>
                {item.durum === 'approved' ? 'Aktif' : 
                 item.durum === 'pending' ? 'Beklemede' : 'Pasif'}
              </Text>
            </View>
          ))}
        </View>

        <View style={pdfStyles.footer} fixed>
          <Text style={pdfStyles.footerText}>© {new Date().getFullYear()} {firmaBilgileri?.ad || 'TermoEnerji'} - Tüm hakları saklıdır.</Text>
          <Text style={pdfStyles.footerText}>Bu rapor {formatDate(new Date())} tarihinde oluşturulmuştur.</Text>
        </View>
      </Page>
    </Document>
  )
}

// ============================================================
// ANA SAYFA
// ============================================================
export default function RaporlarPage() {
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

  // ============================================================
  // VERİLERİ ÇEK
  // ============================================================
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const { data: fiyatData } = await supabase
          .from('fiyat_teklifleri')
          .select('*')
          .order('created_at', { ascending: false })
        
        setFiyatlar(fiyatData || [])
        setFilteredFiyatlar(fiyatData || [])

        const { data: firmalarData } = await supabase.from('firmalar').select('ad')
        setFirmalar(firmalarData || [])

        const { data: kategoriData } = await supabase.from('kategoriler').select('ad')
        setKategoriler(kategoriData || [])

        const { data: firmaData } = await supabase
          .from('firma_bilgileri')
          .select('*')
          .maybeSingle()
        
        if (firmaData) {
          setFirmaBilgileri(firmaData)
          setLogoUrl(firmaData.logo_url || '')
        }
      } catch (error) {
        console.error('Veri yükleme hatası:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  useEffect(() => {
    const loadKurlar = async () => {
      const k = await getKurlar()
      setKurlar(k)
    }
    loadKurlar()
    const unsubscribe = kurDegistiginde((yeniKurlar) => setKurlar(yeniKurlar))
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    let filtered = [...fiyatlar]
    
    if (arama.trim()) {
      filtered = filtered.filter(item => 
        item.urun_adi?.toLowerCase().includes(arama.toLowerCase())
      )
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
      const tlFiyatlar = items.map(item => {
        const fiyat = parseFloat(item.fiyat)
        const paraBirimi = item.para_birimi || 'TRY'
        return convertPrice(fiyat, paraBirimi, 'TRY', kurlar)
      })
      
      const enUcuzTL = Math.min(...tlFiyatlar)
      const enPahaliTL = Math.max(...tlFiyatlar)
      const enUcuzConverted = convertPrice(enUcuzTL, 'TRY', gorunenParaBirimi, kurlar)
      const enPahaliConverted = convertPrice(enPahaliTL, 'TRY', gorunenParaBirimi, kurlar)
      
      return {
        urunAdi: urunAdi,
        enUcuz: enUcuzConverted,
        enPahali: enPahaliConverted,
        fark: enPahaliConverted - enUcuzConverted,
        adet: items.length
      }
    })
    setUrunIstatistikleri(istatistikler)
  }, [arama, filtreKategori, filtreFirma, fiyatlar, gorunenParaBirimi, kurlar])

  // ============================================================
  // YARDIMCI FONKSİYONLAR
  // ============================================================
  const toggleSecim = (id) => {
    setSeciliIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const getUrunEtiketi = (item) => {
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
  }

  const getConvertedPrice = (fiyat, paraBirimi) => {
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
  }

  const getPreparedData = () => {
    return filteredFiyatlar.filter(item => seciliIds.includes(item.id)).map(item => {
      const etiket = getUrunEtiketi(item)
      const converted = getConvertedPrice(item.fiyat, item.para_birimi)
      return {
        ...item,
        _etiket: etiket,
        _convertedPrice: converted.convertedValue,
      }
    })
  }

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER */}
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
            <p className="text-slate-400 text-sm mt-1 ml-11">{filteredFiyatlar.length} kayıt listeleniyor</p>
          </div>
          
          {/* CURRENCY TOGGLE (Segmented Control) */}
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
        </div>

        {/* FİLTRELER */}
        <div className="bg-slate-900/40 rounded-2xl p-5 border border-slate-700/50 backdrop-blur-sm shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <svg className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input 
                type="text" 
                value={arama} 
                onChange={(e) => setArama(e.target.value)} 
                placeholder="Ürün ara..." 
                className="w-full bg-slate-950 border border-slate-700/50 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
              />
            </div>
            
            <div className="relative">
              <svg className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <select 
                value={filtreKategori} 
                onChange={(e) => setFiltreKategori(e.target.value)} 
                className="w-full bg-slate-950 border border-slate-700/50 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all appearance-none"
              >
                <option value="">Tüm Kategoriler</option>
                {kategoriler.map((k, i) => (
                  <option key={i} value={k.ad}>{k.ad}</option>
                ))}
              </select>
            </div>

            <div className="relative">
              <svg className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <select 
                value={filtreFirma} 
                onChange={(e) => setFiltreFirma(e.target.value)} 
                className="w-full bg-slate-950 border border-slate-700/50 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all appearance-none"
              >
                <option value="">Tüm Firmalar</option>
                {firmalar.map((f, i) => (
                  <option key={i} value={f.ad}>{f.ad}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between px-2">
              <span className="text-sm text-slate-400">
                <span className="font-semibold text-white">{seciliIds.length}</span> seçili
              </span>
              {seciliIds.length > 0 && (
                <button 
                  onClick={() => setSeciliIds([])} 
                  className="text-sm text-slate-400 hover:text-red-400 transition-colors flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Temizle
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ÜRÜN İSTATİSTİKLERİ */}
        {urunIstatistikleri.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Ürün Bazlı Fiyat Analizi
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {urunIstatistikleri.map((urun, index) => (
                <div key={index} className="bg-slate-900/40 rounded-xl p-4 border border-slate-700/50 shadow-sm hover:border-slate-600/50 transition-colors group">
                  <p className="text-sm font-semibold text-white truncate mb-3" title={urun.urunAdi}>{urun.urunAdi}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center bg-slate-950/50 p-2 rounded-lg">
                      <span className="text-xs text-slate-400">Min</span>
                      <span className="text-sm text-emerald-400 font-bold">{formatPrice(urun.enUcuz, gorunenParaBirimi)}</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-950/50 p-2 rounded-lg">
                      <span className="text-xs text-slate-400">Max</span>
                      <span className="text-sm text-red-400 font-bold">{formatPrice(urun.enPahali, gorunenParaBirimi)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-700/50">
                    <span className="text-xs text-amber-400/90 font-medium">Fark: {formatPrice(urun.fark, gorunenParaBirimi)}</span>
                    <span className="text-[11px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">{urun.adet} firma</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PDF BUTONU VE TABLO */}
        <div className="bg-slate-900/40 rounded-2xl border border-slate-700/50 overflow-hidden shadow-xl">
          {/* Tablo Üst Araç Çubuğu */}
          <div className="p-4 border-b border-slate-700/50 flex justify-between items-center bg-slate-900/80">
            <h3 className="text-sm font-medium text-slate-300">Fiyat Teklifleri</h3>
            {seciliIds.length > 0 && (
              <PDFDownloadLink 
                document={
                  <RaporPDF 
                    data={getPreparedData()}
                    firmaBilgileri={firmaBilgileri}
                    logoUrl={logoUrl}
                    baslik={arama || 'Tümü'}
                    kategori={filtreKategori || 'Tüm Kategoriler'}
                    firma={filtreFirma || 'Tüm Firmalar'}
                    paraBirimi={gorunenParaBirimi}
                    urunIstatistikleri={urunIstatistikleri}
                  />
                } 
                fileName={`rapor_${new Date().toISOString().split('T')[0]}.pdf`}
              >
                {({ loading: pdfLoading }) => (
                  <button 
                    disabled={pdfLoading} 
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium shadow-lg shadow-emerald-500/20"
                  >
                    {pdfLoading ? (
                      <>
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Oluşturuluyor...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        PDF İndir ({seciliIds.length})
                      </>
                    )}
                  </button>
                )}
              </PDFDownloadLink>
            )}
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-4 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center gap-4">
                    <div className="h-4 w-4 bg-slate-800 rounded"></div>
                    <div className="h-10 flex-1 bg-slate-800 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : filteredFiyatlar.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <h3 className="text-slate-300 font-medium text-lg mb-1">Kayıt Bulunamadı</h3>
                <p className="text-slate-500 text-sm text-center max-w-sm">Arama kriterlerinize veya seçili filtrelere uygun fiyat teklifi bulunmuyor.</p>
              </div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="text-[11px] text-slate-400 uppercase tracking-wider bg-slate-900/50 border-b border-slate-700/50">
                  <tr>
                    <th className="py-3 px-4 w-10">
                      <div className="flex items-center justify-center">
                        <input 
                          type="checkbox" 
                          onChange={() => {
                            if (seciliIds.length === filteredFiyatlar.length) {
                              setSeciliIds([])
                            } else {
                              setSeciliIds(filteredFiyatlar.map(item => item.id))
                            }
                          }} 
                          checked={seciliIds.length === filteredFiyatlar.length && filteredFiyatlar.length > 0} 
                          className="w-4 h-4 bg-slate-900 border-slate-700 rounded text-emerald-500 focus:ring-emerald-500/50 focus:ring-offset-slate-900 cursor-pointer"
                        />
                      </div>
                    </th>
                    <th className="py-3 px-4 font-semibold">Ürün Adı</th>
                    <th className="py-3 px-4 font-semibold hidden md:table-cell">Marka</th>
                    <th className="py-3 px-4 font-semibold">Firma</th>
                    <th className="py-3 px-4 font-semibold hidden lg:table-cell">Kategori</th>
                    <th className="py-3 px-4 font-semibold text-right">Fiyat</th>
                    <th className="py-3 px-4 font-semibold text-center">Durum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {filteredFiyatlar.map((item) => {
                    const isSelected = seciliIds.includes(item.id)
                    const etiket = getUrunEtiketi(item)
                    const fiyatlar = getConvertedPrice(item.fiyat, item.para_birimi)
                    
                    return (
                      <tr 
                        key={item.id} 
                        onClick={() => toggleSecim(item.id)}
                        className={`group cursor-pointer transition-colors hover:bg-slate-800/40 ${isSelected ? 'bg-emerald-500/5 hover:bg-emerald-500/10' : ''}`}
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
                              <span className="w-fit text-[10px] font-medium bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-500/20">En Ucuz Seçenek</span>
                            )}
                            {etiket === 'pahali' && (
                              <span className="w-fit text-[10px] font-medium bg-red-500/10 text-red-400 px-2 py-0.5 rounded-md border border-red-500/20">En Yüksek Fiyat</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-400 hidden md:table-cell">{item.marka || '-'}</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/50 text-slate-300 text-xs font-medium border border-slate-700/50 group-hover:border-slate-600/50 transition-colors">
                            {item.firma_adi}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-400 hidden lg:table-cell">{item.kategori || '-'}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex flex-col items-end gap-0.5">
                            <span className={`text-sm font-bold tracking-tight ${
                              etiket === 'ucuz' ? 'text-emerald-400' : 
                              etiket === 'pahali' ? 'text-red-400' : 
                              'text-white'
                            }`}>
                              {fiyatlar.converted}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium">Asıl: {fiyatlar.original}</span>
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
                                item.durum === 'pending' ? 'bg-amber-400' : 'bg-red-400'
                              }`}></span>
                              {item.durum === 'approved' ? 'Aktif' : 
                               item.durum === 'pending' ? 'Beklemede' : 'Pasif'}
                            </span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
