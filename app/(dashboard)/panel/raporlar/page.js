'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../../lib/supabase'
import { convertPrice, formatPrice, getKurlar, kurDegistiginde } from '../../../../lib/currency'
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
  headerLeft: {
    flexDirection: 'column',
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  companySub: {
    fontSize: 9,
    color: '#64748b',
    marginTop: 2,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
    marginTop: 4,
  },
  dateText: {
    fontSize: 9,
    color: '#64748b',
    textAlign: 'right',
  },
  filterBox: {
    backgroundColor: '#f1f5f9',
    padding: 10,
    borderRadius: 6,
    marginVertical: 10,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  filterText: {
    fontSize: 8,
    color: '#475569',
  },
  summaryBox: {
    backgroundColor: '#f0fdf4',
    padding: 12,
    borderRadius: 6,
    border: '1px solid #bbf7d0',
    marginVertical: 10,
  },
  summaryText: {
    fontSize: 9,
    color: '#0f172a',
    lineHeight: 1.6,
  },
  summaryBold: {
    fontWeight: 'bold',
  },
  summaryGreen: {
    color: '#10b981',
    fontWeight: 'bold',
  },
  summaryRed: {
    color: '#ef4444',
    fontWeight: 'bold',
  },
  summaryAmber: {
    color: '#f59e0b',
    fontWeight: 'bold',
  },
  table: {
    marginTop: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    padding: 6,
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
    padding: 5,
    borderBottom: '1px solid #e2e8f0',
    alignItems: 'center',
  },
  tableRowAlternate: {
    flexDirection: 'row',
    padding: 5,
    borderBottom: '1px solid #e2e8f0',
    backgroundColor: '#fafafa',
    alignItems: 'center',
  },
  tableCell: {
    fontSize: 7,
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
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 7,
    color: '#94a3b8',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 8,
  },
  statCard: {
    backgroundColor: '#f8fafc',
    padding: 8,
    borderRadius: 4,
    width: '23%',
    border: '1px solid #e2e8f0',
  },
  statLabel: {
    fontSize: 6,
    color: '#64748b',
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0f172a',
    marginTop: 2,
  },
  statValueGreen: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#10b981',
    marginTop: 2,
  },
  statValueRed: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ef4444',
    marginTop: 2,
  },
  statValueAmber: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#f59e0b',
    marginTop: 2,
  },
})

// ============================================================
// PDF BİLEŞENİ - MARKA SÜTUNU EKLENDİ
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

  // Para birimi sembolü
  const getCurrencySymbol = (currency) => {
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
        <View style={pdfStyles.header}>
          <View style={pdfStyles.headerLeft}>
            {logoUrl && <Image src={logoUrl} style={{ width: 100, height: 35, marginBottom: 4 }} />}
            <Text style={pdfStyles.companyName}>{firmaBilgileri?.ad || 'TermoEnerji'}</Text>
            <Text style={pdfStyles.reportTitle}>Fiyat Karsilastirma Raporu</Text>
          </View>
          <View>
            <Text style={pdfStyles.dateText}>Tarih: {formatDate(new Date())}</Text>
            <Text style={[pdfStyles.dateText, { marginTop: 3 }]}>Para Birimi: {paraBirimi} ({getCurrencySymbol(paraBirimi)})</Text>
          </View>
        </View>

        <View style={pdfStyles.filterBox}>
          <View style={pdfStyles.filterRow}>
            <Text style={pdfStyles.filterText}>Arama: {baslik || 'Tumu'}</Text>
            <Text style={pdfStyles.filterText}>Kategori: {kategori || 'Tum Kategoriler'}</Text>
            <Text style={pdfStyles.filterText}>Firma: {firma || 'Tum Firmalar'}</Text>
            <Text style={pdfStyles.filterText}>Toplam: {data.length} kayit</Text>
          </View>
        </View>

        {urunIstatistikleri && urunIstatistikleri.length > 0 && (
          <View style={pdfStyles.statsGrid}>
            {urunIstatistikleri.map((urun, index) => (
              <View key={index} style={pdfStyles.statCard}>
                <Text style={pdfStyles.statLabel}>{urun.urunAdi}</Text>
                <Text style={pdfStyles.statValueGreen}>{formatPrice(urun.enUcuz, paraBirimi)}</Text>
                <Text style={pdfStyles.statValueRed}>{formatPrice(urun.enPahali, paraBirimi)}</Text>
                <Text style={pdfStyles.statValueAmber}>Fark: {formatPrice(urun.fark, paraBirimi)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* ✅ TABLO - MARKA SÜTUNU EKLENDİ */}
        <View style={pdfStyles.table}>
          <View style={pdfStyles.tableHeader}>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 0.5 }]}>#</Text>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 1.3 }]}>Urun</Text>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 1 }]}>Marka</Text>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 1.2 }]}>Firma</Text>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 1 }]}>Kategori</Text>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 1, textAlign: 'right' }]}>Fiyat</Text>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 0.8, textAlign: 'center' }]}>Durum</Text>
          </View>
          {data.map((item, index) => (
            <View key={index} style={index % 2 === 0 ? pdfStyles.tableRow : pdfStyles.tableRowAlternate}>
              <Text style={[pdfStyles.tableCell, { flex: 0.5 }]}>{index + 1}</Text>
              <Text style={[pdfStyles.tableCell, { flex: 1.3 }]}>{item.urun_adi}</Text>
              <Text style={[pdfStyles.tableCell, { flex: 1 }]}>{item.marka || '-'}</Text>
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

        <View style={pdfStyles.footer} fixed>
          <Text style={pdfStyles.footerText}>Telif {new Date().getFullYear()} {firmaBilgileri?.ad || 'TermoEnerji'}</Text>
          <Text style={pdfStyles.footerText}>Rapor {formatDate(new Date())}</Text>
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

  const getConvertedPrice = (fiyat, paraBirimi) => {
    const parsedFiyat = parseFloat(String(fiyat).replace(',', '.'))
    if (isNaN(parsedFiyat) || !parsedFiyat) return '-'
    const tlValue = convertPrice(parsedFiyat, paraBirimi, 'TRY', kurlar)
    const converted = convertPrice(tlValue, 'TRY', gorunenParaBirimi, kurlar)
    return formatPrice(converted, gorunenParaBirimi)
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

        {urunIstatistikleri.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-4">
            {urunIstatistikleri.map((urun, index) => (
              <div key={index} className="bg-slate-800/30 rounded-lg p-2 border border-slate-700/50">
                <p className="text-xs font-semibold text-white truncate" title={urun.urunAdi}>
                  {urun.urunAdi}
                </p>
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
        )}

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
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-4 py-1.5 rounded-lg transition disabled:opacity-50 flex items-center gap-2 text-sm"
                >
                  PDF Rapor ({selectedFiyatlar.length})
                </button>
              )}
            </PDFDownloadLink>
          </div>
        )}

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
                  const convertedPrice = getConvertedPrice(item.fiyat, item.para_birimi)

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
                          <span className={`text-xs font-bold ${
                            etiket === 'ucuz' ? 'text-emerald-400' : 
                            etiket === 'pahali' ? 'text-red-400' : 
                            'text-white'
                          }`}>
                            {convertedPrice}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {formatPrice(item.fiyat, item.para_birimi)}
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
