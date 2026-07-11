'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../../lib/supabase'
import { convertPrice, formatPrice, getKurlar, kurDegistiginde, getCurrencySymbol } from '../../../../lib/currency'
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'

// ============================================================
// PDF STILLERI (GÜVENLİ VE EKSTRA PROFESYONEL TASARIM)
// Not: react-pdf çökmelerini önlemek için shorthand CSS (border: '1px...') 
// yerine ayrıntılı (borderWidth, borderColor) kullanılmıştır.
// ============================================================
const pdfStyles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: '#f8fafc',
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 2,
    borderBottomColor: '#1e293b',
    paddingBottom: 15,
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'column',
  },
  logo: {
    width: 100,
    height: 35,
    marginBottom: 6,
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  reportTitle: {
    fontSize: 11,
    color: '#3b82f6',
    marginTop: 4,
    textTransform: 'uppercase',
  },
  headerRight: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  dateText: {
    fontSize: 8,
    color: '#64748b',
    marginBottom: 4,
  },
  currencyBadge: {
    backgroundColor: '#e2e8f0',
    padding: 5,
    borderRadius: 4,
  },
  currencyBadgeText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  filterBox: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
    borderRadius: 4,
    padding: 10,
    marginBottom: 15,
  },
  filterColumn: {
    flex: 1,
  },
  filterLabel: {
    fontSize: 7,
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  filterValue: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 15,
  },
  statCard: {
    backgroundColor: '#ffffff',
    padding: 8,
    borderRadius: 4,
    width: '31%',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statCardTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 4,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  statLabel: {
    fontSize: 7,
    color: '#64748b',
  },
  statValueGreen: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#10b981',
  },
  statValueRed: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#ef4444',
  },
  statValueAmber: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#f59e0b',
  },
  table: {
    marginTop: 5,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    padding: 8,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
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
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    alignItems: 'center',
  },
  tableRowAlternate: {
    flexDirection: 'row',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#f1f5f9',
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
    color: '#0f172a',
    flex: 1,
    textAlign: 'right',
  },
  statusCell: {
    fontSize: 7,
    color: '#10b981',
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  statusCellPending: {
    fontSize: 7,
    color: '#eab308',
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  statusCellRejected: {
    fontSize: 7,
    color: '#ef4444',
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 7,
    color: '#94a3b8',
  },
  pageNumber: {
    fontSize: 7,
    color: '#94a3b8',
    fontWeight: 'bold',
  }
})

// ============================================================
// PDF BİLEŞENİ
// ============================================================
const RaporPDF = ({ 
  data, 
  firmaBilgileri, 
  logoUrl, 
  baslik, 
  kategori, 
  firma,
  paraBirimi,
  urunIstatistikleri
}) => {
  const formatPrice = (price, currency = 'TRY') => {
    if (price === null || price === undefined) return '-'
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency || 'TRY',
    }).format(price)
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

  const getSymbol = (currency) => {
    switch(currency) {
      case 'TRY': return '₺'
      case 'USD': return '$'
      case 'EUR': return '€'
      default: return '₺'
    }
  }

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        
        {/* KURUMSAL BAŞLIK */}
        <View style={pdfStyles.header}>
          <View style={pdfStyles.headerLeft}>
            {logoUrl && <Image src={logoUrl} style={pdfStyles.logo} />}
            <Text style={pdfStyles.companyName}>{firmaBilgileri?.ad || 'TermoEnerji A.Ş.'}</Text>
            <Text style={pdfStyles.reportTitle}>Fiyat Karşılaştırma Raporu</Text>
          </View>
          <View style={pdfStyles.headerRight}>
            <Text style={pdfStyles.dateText}>Tarih: {formatDate(new Date())}</Text>
            <Text style={pdfStyles.dateText}>Kayıt Sayısı: {data.length}</Text>
            <View style={pdfStyles.currencyBadge}>
              <Text style={pdfStyles.currencyBadgeText}>Birim: {paraBirimi} ({getSymbol(paraBirimi)})</Text>
            </View>
          </View>
        </View>

        {/* FİLTRE BİLGİLERİ KUTUSU */}
        <View style={pdfStyles.filterBox}>
          <View style={pdfStyles.filterColumn}>
            <Text style={pdfStyles.filterLabel}>Aranan Ürün</Text>
            <Text style={pdfStyles.filterValue}>{baslik || 'Tümü'}</Text>
          </View>
          <View style={pdfStyles.filterColumn}>
            <Text style={pdfStyles.filterLabel}>Kategori</Text>
            <Text style={pdfStyles.filterValue}>{kategori || 'Tüm Kategoriler'}</Text>
          </View>
          <View style={pdfStyles.filterColumn}>
            <Text style={pdfStyles.filterLabel}>Tedarikçi Firma</Text>
            <Text style={pdfStyles.filterValue}>{firma || 'Tüm Firmalar'}</Text>
          </View>
        </View>

        {/* ÜRÜN İSTATİSTİKLERİ KARTLARI */}
        {urunIstatistikleri && urunIstatistikleri.length > 0 && (
          <>
            <Text style={pdfStyles.sectionTitle}>Ürün Fiyat Analizi</Text>
            <View style={pdfStyles.statsGrid}>
              {urunIstatistikleri.map((urun, index) => (
                <View key={index} style={pdfStyles.statCard}>
                  <Text style={pdfStyles.statCardTitle}>{urun.urunAdi}</Text>
                  <View style={pdfStyles.statRow}>
                    <Text style={pdfStyles.statLabel}>En Ucuz:</Text>
                    <Text style={pdfStyles.statValueGreen}>{formatPrice(urun.enUcuz, paraBirimi)}</Text>
                  </View>
                  <View style={pdfStyles.statRow}>
                    <Text style={pdfStyles.statLabel}>En Pahalı:</Text>
                    <Text style={pdfStyles.statValueRed}>{formatPrice(urun.enPahali, paraBirimi)}</Text>
                  </View>
                  <View style={[pdfStyles.statRow, { borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 3, marginTop: 2 }]}>
                    <Text style={pdfStyles.statLabel}>Fark:</Text>
                    <Text style={pdfStyles.statValueAmber}>{formatPrice(urun.fark, paraBirimi)}</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {/* DETAYLI VERİ TABLOSU */}
        <Text style={pdfStyles.sectionTitle}>Fiyat Listesi Detayı</Text>
        <View style={pdfStyles.table}>
          <View style={pdfStyles.tableHeader}>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 0.4 }]}>#</Text>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 1.5 }]}>Ürün</Text>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 0.8 }]}>Marka</Text>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 1.2 }]}>Firma</Text>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 1 }]}>Kategori</Text>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 1, textAlign: 'right' }]}>Fiyat</Text>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 0.8, textAlign: 'center' }]}>Durum</Text>
          </View>
          
          {data.map((item, index) => (
            <View key={index} style={index % 2 === 0 ? pdfStyles.tableRow : pdfStyles.tableRowAlternate}>
              <Text style={[pdfStyles.tableCell, { flex: 0.4 }]}>{index + 1}</Text>
              <Text style={[pdfStyles.tableCellBold, { flex: 1.5 }]}>{item.urun_adi}</Text>
              <Text style={[pdfStyles.tableCell, { flex: 0.8 }]}>{item.marka || '-'}</Text>
              <Text style={[pdfStyles.tableCell, { flex: 1.2 }]}>{item.firma_adi}</Text>
              <Text style={[pdfStyles.tableCell, { flex: 1 }]}>{item.kategori || 'Genel'}</Text>
              <Text style={[pdfStyles.priceCell, { flex: 1 }]}>
                {formatPrice(item.fiyat, paraBirimi)}
              </Text>
              <Text style={[
                item.durum === 'approved' ? pdfStyles.statusCell : 
                item.durum === 'pending' ? pdfStyles.statusCellPending : pdfStyles.statusCellRejected,
                { flex: 0.8 }
              ]}>
                {item.durum === 'approved' ? 'Aktif' : 
                 item.durum === 'pending' ? 'Beklemede' : 'Pasif'}
              </Text>
            </View>
          ))}
        </View>

        {/* ALT BİLGİ VE SAYFA NUMARASI */}
        <View style={pdfStyles.footer} fixed>
          <Text style={pdfStyles.footerText}>© {new Date().getFullYear()} {firmaBilgileri?.ad || 'TermoEnerji'}. Sistem tarafından otomatik üretilmiştir.</Text>
          <Text render={({ pageNumber, totalPages }) => (
            `Sayfa ${pageNumber} / ${totalPages}`
          )} style={pdfStyles.pageNumber} />
        </View>

      </Page>
    </Document>
  )
}

// ============================================================
// ANA SAYFA (HİÇBİR MANTIĞI DEĞİŞTİRİLMEDİ)
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

  // Tüm fiyatları yükle
  useEffect(() => {
    const loadData = async () => {
      const { data: fiyatData } = await supabase
        .from('fiyat_teklifleri')
        .select('*')
        .order('created_at', { ascending: false })
      
      setFiyatlar(fiyatData || [])
      setFilteredFiyatlar(fiyatData || [])
      setLoading(false)

      const { data: firmalarData } = await supabase.from('firmalar').select('ad')
      const { data: kategoriData } = await supabase.from('kategoriler').select('ad')
      const { data: firmaData } = await supabase.from('firma_bilgileri').select('*').maybeSingle()
      
      setFirmalar(firmalarData || [])
      setKategoriler(kategoriData || [])
      if (firmaData) {
        setFirmaBilgileri(firmaData)
        setLogoUrl(firmaData.logo_url || '')
      }
    }
    loadData()
  }, [])

  // Kur değişimini dinle
  useEffect(() => {
    const loadKurlar = async () => {
      const k = await getKurlar()
      setKurlar(k)
    }
    loadKurlar()

    const unsubscribe = kurDegistiginde((yeniKurlar) => {
      setKurlar(yeniKurlar)
    })
    return () => unsubscribe()
  }, [])

  // Filtreleme ve ürün bazında istatistikler
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
      if (!urunGruplari[urunAdi]) {
        urunGruplari[urunAdi] = []
      }
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

  const toggleSecim = (id) => {
    setSeciliIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const selectedFiyatlar = filteredFiyatlar.filter(item => seciliIds.includes(item.id))

  const getUrunEtiketi = (item) => {
    const urunItems = filteredFiyatlar.filter(i => i.urun_adi === item.urun_adi)
    if (urunItems.length === 0) return null
    
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

  // ✅ DOĞRU FİYAT ÇEVİRİSİ - ORİJİNAL VE ÇEVRİLMİŞ
  const getConvertedPrice = (fiyat, paraBirimi) => {
    const parsedFiyat = parseFloat(String(fiyat).replace(',', '.'))
    if (isNaN(parsedFiyat) || !parsedFiyat) return { original: '-', converted: '-' }
    
    // Önce TL'ye çevir
    const tlValue = convertPrice(parsedFiyat, paraBirimi, 'TRY', kurlar)
    // TL'den hedef para birimine çevir
    const converted = convertPrice(tlValue, 'TRY', gorunenParaBirimi, kurlar)
    
    return {
      original: formatPrice(parsedFiyat, paraBirimi),
      converted: formatPrice(converted, gorunenParaBirimi)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Raporlar</h1>
            <p className="text-slate-400 text-sm">
              {filteredFiyatlar.length} kayit
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-800/50 rounded-lg p-1 border border-slate-700">
            <button
              onClick={() => setGorunenParaBirimi('TRY')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                gorunenParaBirimi === 'TRY' 
                  ? 'bg-emerald-500/20 text-emerald-400' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              TL
            </button>
            <button
              onClick={() => setGorunenParaBirimi('USD')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                gorunenParaBirimi === 'USD' 
                  ? 'bg-blue-500/20 text-blue-400' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              USD
            </button>
            <button
              onClick={() => setGorunenParaBirimi('EUR')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                gorunenParaBirimi === 'EUR' 
                  ? 'bg-purple-500/20 text-purple-400' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              EUR
            </button>
          </div>
        </div>

        {/* FİLTRELER */}
        <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              value={arama}
              onChange={(e) => setArama(e.target.value)}
              placeholder="Urun ara..."
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
            <select
              value={filtreKategori}
              onChange={(e) => setFiltreKategori(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="">Tum Kategoriler</option>
              {kategoriler.map((k, i) => (
                <option key={i} value={k.ad}>{k.ad}</option>
              ))}
            </select>
            <select
              value={filtreFirma}
              onChange={(e) => setFiltreFirma(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="">Tum Firmalar</option>
              {firmalar.map((f, i) => (
                <option key={i} value={f.ad}>{f.ad}</option>
              ))}
            </select>
          </div>
        </div>

        {/* KÜÇÜK KARTLAR */}
        {urunIstatistikleri.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1.5 mb-4">
            {urunIstatistikleri.map((urun, index) => (
              <div key={index} className="bg-slate-800/30 rounded-lg p-1.5 border border-slate-700/50">
                <p className="text-[10px] font-semibold text-white truncate" title={urun.urunAdi}>
                  {urun.urunAdi}
                </p>
                <div className="flex justify-between items-center mt-0.5">
                  <span className="text-[10px] text-emerald-400 font-bold">
                    {formatPrice(urun.enUcuz, gorunenParaBirimi)}
                  </span>
                  <span className="text-[10px] text-red-400 font-bold">
                    {formatPrice(urun.enPahali, gorunenParaBirimi)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[8px] text-amber-400">
                    Fark: {formatPrice(urun.fark, gorunenParaBirimi)}
                  </span>
                  <span className="text-[8px] text-slate-500">{urun.adet} firma</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PDF RAPOR BUTONU */}
        {selectedFiyatlar.length > 0 && (
          <div className="flex justify-end mb-4">
            <PDFDownloadLink
              document={
                <RaporPDF 
                  data={selectedFiyatlar}
                  firmaBilgileri={firmaBilgileri}
                  logoUrl={logoUrl}
                  baslik={arama || 'Tumu'}
                  kategori={filtreKategori || 'Tum Kategoriler'}
                  firma={filtreFirma || 'Tum Firmalar'}
                  paraBirimi={gorunenParaBirimi}
                  urunIstatistikleri={urunIstatistikleri}
                />
              }
              fileName={`rapor_${new Date().toISOString().split('T')[0]}.pdf`}
            >
              {({ loading }) => (
                <button
                  disabled={loading}
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-3 py-1 rounded-lg transition disabled:opacity-50 flex items-center gap-2 text-xs"
                >
                  PDF Rapor ({selectedFiyatlar.length})
                </button>
              )}
            </PDFDownloadLink>
          </div>
        )}

        {/* FİYAT LİSTESİ - ORİJİNAL VE ÇEVRİLMİŞ */}
        {loading ? (
          <div className="text-center py-8">
            <p className="text-slate-400">Yukleniyor...</p>
          </div>
        ) : filteredFiyatlar.length === 0 ? (
          <div className="text-center py-8 bg-slate-800/50 rounded-xl border border-slate-700">
            <p className="text-slate-400">Henuz fiyat bulunmuyor</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-slate-800/50 rounded-xl border border-slate-700">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-800">
                  <th className="py-2 px-3 text-slate-400 font-medium w-8">
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
                      className="w-3 h-3 accent-emerald-500"
                    />
                  </th>
                  <th className="text-left py-2 px-3 text-slate-400 font-medium text-xs">Urun</th>
                  <th className="text-left py-2 px-3 text-slate-400 font-medium text-xs">Marka</th>
                  <th className="text-left py-2 px-3 text-slate-400 font-medium text-xs">Firma</th>
                  <th className="text-left py-2 px-3 text-slate-400 font-medium text-xs hidden md:table-cell">Kategori</th>
                  <th className="text-right py-2 px-3 text-slate-400 font-medium text-xs">Fiyat</th>
                  <th className="text-center py-2 px-3 text-slate-400 font-medium text-xs">Durum</th>
                </tr>
              </thead>
              <tbody>
                {filteredFiyatlar.map((item) => {
                  const isSelected = seciliIds.includes(item.id)
                  const etiket = getUrunEtiketi(item)
                  const fiyatlar = getConvertedPrice(item.fiyat, item.para_birimi)

                  return (
                    <tr 
                      key={item.id} 
                      className={`border-b border-slate-700/50 hover:bg-slate-800/30 transition ${
                        isSelected ? 'bg-emerald-500/5' : ''
                      }`}
                    >
                      <td className="py-2 px-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSecim(item.id)}
                          className="w-3 h-3 accent-emerald-500"
                        />
                      </td>
                      <td className="py-2 px-3 text-white text-xs font-medium">
                        {item.urun_adi}
                        {etiket === 'ucuz' && (
                          <span className="ml-1 text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full">
                            En Ucuz
                          </span>
                        )}
                        {etiket === 'pahali' && (
                          <span className="ml-1 text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full">
                            En Pahali
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-slate-300 text-xs">{item.marka || '-'}</td>
                      <td className="py-2 px-3 text-slate-300 text-xs">{item.firma_adi}</td>
                      <td className="py-2 px-3 text-slate-400 text-xs hidden md:table-cell">
                        {item.kategori || '-'}
                      </td>
                      <td className="py-2 px-3 text-right">
                        <div className="flex flex-col items-end">
                          {/* ✅ ÇEVRİLMİŞ FİYAT (BÜYÜK) */}
                          <span className={`text-xs font-bold ${
                            etiket === 'ucuz' ? 'text-emerald-400' : 
                            etiket === 'pahali' ? 'text-red-400' : 
                            'text-white'
                          }`}>
                            {fiyatlar.converted}
                          </span>
                          {/* ✅ ORİJİNAL FİYAT (KÜÇÜK) */}
                          <span className="text-[9px] text-slate-500">
                            {fiyatlar.original}
                          </span>
                        </div>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                          item.durum === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                          item.durum === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {item.durum === 'approved' ? 'Onaylandi' :
                           item.durum === 'pending' ? 'Beklemede' : 'Reddedildi'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
