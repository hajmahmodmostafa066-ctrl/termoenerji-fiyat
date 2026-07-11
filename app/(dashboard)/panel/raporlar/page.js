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
    backgroundColor: '#f1f5f9',
    padding: 10,
    borderRadius: 4,
    marginVertical: 10,
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
    gap: 6,
  },
  statCard: {
    backgroundColor: '#f8fafc',
    padding: 8,
    borderRadius: 4,
    border: '1px solid #e2e8f0',
    width: '23%',
    minWidth: 100,
  },
  statProductName: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 3,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  statLabel: {
    fontSize: 6,
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
    marginTop: 2,
  },
  
  // Tablo
  table: {
    marginTop: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    padding: 8,
    borderRadius: 4,
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
    padding: 6,
    borderBottom: '1px solid #e2e8f0',
    alignItems: 'center',
  },
  tableRowAlternate: {
    flexDirection: 'row',
    padding: 6,
    borderBottom: '1px solid #e2e8f0',
    backgroundColor: '#fafafa',
    alignItems: 'center',
  },
  tableCell: {
    fontSize: 7,
    color: '#0f172a',
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
    color: '#eab308',
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
    paddingTop: 8,
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
  const formatPrice = (price, currency = 'TRY') => {
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
        {/* HEADER */}
        <View style={pdfStyles.header}>
          <View>
            {logoUrl && <Image src={logoUrl} style={{ width: 100, height: 35, marginBottom: 4 }} />}
            <Text style={pdfStyles.companyName}>{firmaBilgileri?.ad || 'TermoEnerji'}</Text>
            {firmaBilgileri?.adres && <Text style={pdfStyles.companySub}>{firmaBilgileri.adres}</Text>}
            {firmaBilgileri?.telefon && <Text style={pdfStyles.companySub}>Tel: {firmaBilgileri.telefon}</Text>}
          </View>
          <View>
            <Text style={pdfStyles.dateText}>Tarih: {formatDate(new Date())}</Text>
            <Text style={[pdfStyles.dateText, { marginTop: 3 }]}>Para Birimi: {paraBirimi}</Text>
          </View>
        </View>

        {/* FİLTRE BİLGİLERİ */}
        <View style={pdfStyles.filterBox}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            <Text style={pdfStyles.filterText}>🔍 Arama: {baslik || 'Tümü'}</Text>
            <Text style={pdfStyles.filterText}>📂 Kategori: {kategori || 'Tüm Kategoriler'}</Text>
            <Text style={pdfStyles.filterText}>🏢 Firma: {firma || 'Tüm Firmalar'}</Text>
            <Text style={pdfStyles.filterText}>📦 Toplam: {data.length} kayıt</Text>
          </View>
        </View>

        {/* ÜRÜN BAZLI FİYAT ANALİZİ KARTLARI */}
        {urunIstatistikleri && urunIstatistikleri.length > 0 && (
          <View style={pdfStyles.statsContainer}>
            <Text style={pdfStyles.statsTitle}>📊 Ürün Bazlı Fiyat Analizi</Text>
            <View style={pdfStyles.statsGrid}>
              {urunIstatistikleri.map((urun, index) => (
                <View key={index} style={pdfStyles.statCard}>
                  <Text style={pdfStyles.statProductName}>{urun.urunAdi}</Text>
                  <View style={pdfStyles.statRow}>
                    <Text style={pdfStyles.statLabel}>En Ucuz</Text>
                    <Text style={pdfStyles.statValueGreen}>{formatPrice(urun.enUcuz, paraBirimi)}</Text>
                  </View>
                  <View style={pdfStyles.statRow}>
                    <Text style={pdfStyles.statLabel}>En Pahalı</Text>
                    <Text style={pdfStyles.statValueRed}>{formatPrice(urun.enPahali, paraBirimi)}</Text>
                  </View>
                  <View style={pdfStyles.statRow}>
                    <Text style={pdfStyles.statLabel}>Fark</Text>
                    <Text style={pdfStyles.statValueAmber}>{formatPrice(urun.fark, paraBirimi)}</Text>
                  </View>
                  <Text style={pdfStyles.statFirmaCount}>{urun.adet} firma</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* TABLO */}
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
                {formatPrice(item._convertedPrice || item.fiyat, paraBirimi)}
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

        {/* FOOTER */}
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

  // Kurları çek
  useEffect(() => {
    const loadKurlar = async () => {
      const k = await getKurlar()
      setKurlar(k)
    }
    loadKurlar()
    const unsubscribe = kurDegistiginde((yeniKurlar) => setKurlar(yeniKurlar))
    return () => unsubscribe()
  }, [])

  // Filtreleme ve istatistik
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

    // Ürün istatistikleri
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
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">📊 Raporlar</h1>
            <p className="text-slate-400 text-sm">{filteredFiyatlar.length} kayıt</p>
          </div>
          <div className="flex items-center gap-1 bg-slate-800/50 rounded-lg p-1 border border-slate-700">
            <button 
              onClick={() => setGorunenParaBirimi('TRY')} 
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                gorunenParaBirimi === 'TRY' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              TL
            </button>
            <button 
              onClick={() => setGorunenParaBirimi('USD')} 
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                gorunenParaBirimi === 'USD' ? 'bg-blue-500/20 text-blue-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              USD
            </button>
            <button 
              onClick={() => setGorunenParaBirimi('EUR')} 
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                gorunenParaBirimi === 'EUR' ? 'bg-purple-500/20 text-purple-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              EUR
            </button>
          </div>
        </div>

        {/* FİLTRELER */}
        <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input 
              type="text" 
              value={arama} 
              onChange={(e) => setArama(e.target.value)} 
              placeholder="🔍 Ürün ara..." 
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
            <select 
              value={filtreKategori} 
              onChange={(e) => setFiltreKategori(e.target.value)} 
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="">📂 Tüm Kategoriler</option>
              {kategoriler.map((k, i) => (
                <option key={i} value={k.ad}>{k.ad}</option>
              ))}
            </select>
            <select 
              value={filtreFirma} 
              onChange={(e) => setFiltreFirma(e.target.value)} 
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="">🏢 Tüm Firmalar</option>
              {firmalar.map((f, i) => (
                <option key={i} value={f.ad}>{f.ad}</option>
              ))}
            </select>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">{seciliIds.length} seçili</span>
              {seciliIds.length > 0 && (
                <button 
                  onClick={() => setSeciliIds([])} 
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Temizle
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ÜRÜN İSTATİSTİKLERİ */}
        {urunIstatistikleri.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-white mb-2">📊 Ürün Bazlı Fiyat Analizi</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {urunIstatistikleri.map((urun, index) => (
                <div key={index} className="bg-slate-800/30 rounded-lg p-2 border border-slate-700/50">
                  <p className="text-xs font-medium text-white truncate">{urun.urunAdi}</p>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-emerald-400 font-bold">
                      {formatPrice(urun.enUcuz, gorunenParaBirimi)}
                    </span>
                    <span className="text-xs text-red-400 font-bold">
                      {formatPrice(urun.enPahali, gorunenParaBirimi)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-0.5">
                    <span className="text-[10px] text-amber-400">
                      Fark: {formatPrice(urun.fark, gorunenParaBirimi)}
                    </span>
                    <span className="text-[10px] text-slate-500">{urun.adet} firma</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PDF BUTONU */}
        {seciliIds.length > 0 && (
          <div className="flex justify-end mb-4">
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
              {({ loading }) => (
                <button 
                  disabled={loading} 
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50 flex items-center gap-2 text-sm"
                >
                  {loading ? '⏳ Oluşturuluyor...' : `📄 PDF Rapor (${seciliIds.length})`}
                </button>
              )}
            </PDFDownloadLink>
          </div>
        )}

        {/* TABLO */}
        {loading ? (
          <div className="text-center py-8">
            <p className="text-slate-400">Yükleniyor...</p>
          </div>
        ) : filteredFiyatlar.length === 0 ? (
          <div className="text-center py-8 bg-slate-800/50 rounded-xl border border-slate-700">
            <p className="text-slate-400">Henüz fiyat bulunmuyor</p>
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
                  <th className="text-left py-2 px-3 text-slate-400 font-medium text-xs">Ürün</th>
                  <th className="text-left py-2 px-3 text-slate-400 font-medium text-xs hidden md:table-cell">Marka</th>
                  <th className="text-left py-2 px-3 text-slate-400 font-medium text-xs">Firma</th>
                  <th className="text-left py-2 px-3 text-slate-400 font-medium text-xs hidden lg:table-cell">Kategori</th>
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
                    <tr key={item.id} className={`border-b border-slate-700/50 hover:bg-slate-800/30 transition ${isSelected ? 'bg-emerald-500/5' : ''}`}>
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
                          <span className="ml-1 text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full">En Ucuz</span>
                        )}
                        {etiket === 'pahali' && (
                          <span className="ml-1 text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full">En Pahalı</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-slate-300 text-xs hidden md:table-cell">{item.marka || '-'}</td>
                      <td className="py-2 px-3 text-slate-300 text-xs">{item.firma_adi}</td>
                      <td className="py-2 px-3 text-slate-400 text-xs hidden lg:table-cell">{item.kategori || '-'}</td>
                      <td className="py-2 px-3 text-right">
                        <div className="flex flex-col items-end">
                          <span className={`text-xs font-bold ${
                            etiket === 'ucuz' ? 'text-emerald-400' : 
                            etiket === 'pahali' ? 'text-red-400' : 
                            'text-white'
                          }`}>
                            {fiyatlar.converted}
                          </span>
                          <span className="text-[9px] text-slate-500">{fiyatlar.original}</span>
                        </div>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                          item.durum === 'approved' ? 'bg-emerald-500/20 text-emerald-400' : 
                          item.durum === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : 
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {item.durum === 'approved' ? 'Onaylandı' : 
                           item.durum === 'pending' ? 'Beklemede' : 
                           'Reddedildi'}
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
