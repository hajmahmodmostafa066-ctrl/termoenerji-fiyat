'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../../lib/supabase'
import { convertPrice, formatPrice, getKurlar, kurDegistiginde } from '../../../../lib/currency'
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'

// ============================================================
// PDF STILLERI - ULTRA PROFESYONEL (KARAKTER SORUNU ÇÖZÜLDÜ)
// ============================================================
const pdfStyles = StyleSheet.create({
  page: {
    padding: 50,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '3px solid #10b981',
    paddingBottom: 20,
    marginBottom: 25,
  },
  headerLeft: {
    flexDirection: 'column',
  },
  companyName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  companySub: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    marginTop: 6,
  },
  dateText: {
    fontSize: 10,
    color: '#64748b',
    textAlign: 'right',
  },
  filterBox: {
    backgroundColor: '#f1f5f9',
    padding: 14,
    borderRadius: 8,
    marginVertical: 15,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  },
  filterText: {
    fontSize: 9,
    color: '#475569',
  },
  summaryBox: {
    backgroundColor: '#f0fdf4',
    padding: 16,
    borderRadius: 8,
    border: '1px solid #bbf7d0',
    marginVertical: 12,
  },
  summaryText: {
    fontSize: 10,
    color: '#0f172a',
    lineHeight: 1.8,
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
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    padding: 10,
    borderRadius: 6,
  },
  tableHeaderCell: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottom: '1px solid #e2e8f0',
    alignItems: 'center',
  },
  tableRowAlternate: {
    flexDirection: 'row',
    padding: 8,
    borderBottom: '1px solid #e2e8f0',
    backgroundColor: '#fafafa',
    alignItems: 'center',
  },
  tableCell: {
    fontSize: 8,
    color: '#0f172a',
    flex: 1,
  },
  priceCell: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#10b981',
    flex: 1,
    textAlign: 'right',
  },
  priceCellHigh: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#ef4444',
    flex: 1,
    textAlign: 'right',
  },
  priceCellAmber: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#f59e0b',
    flex: 1,
    textAlign: 'right',
  },
  statusCell: {
    fontSize: 8,
    color: '#10b981',
    flex: 1,
    textAlign: 'center',
  },
  statusCellPending: {
    fontSize: 8,
    color: '#eab308',
    flex: 1,
    textAlign: 'center',
  },
  statusCellRejected: {
    fontSize: 8,
    color: '#ef4444',
    flex: 1,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    borderTop: '1px solid #e2e8f0',
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 8,
    color: '#94a3b8',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 10,
  },
  statCard: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 6,
    width: '23%',
    border: '1px solid #e2e8f0',
  },
  statLabel: {
    fontSize: 7,
    color: '#64748b',
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
    marginTop: 2,
  },
  statValueGreen: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10b981',
    marginTop: 2,
  },
  statValueRed: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ef4444',
    marginTop: 2,
  },
  statValueAmber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#f59e0b',
    marginTop: 2,
  },
})

// ============================================================
// PDF BİLEŞENİ - KATEGORİ BAZINDA
// ============================================================
const RaporPDF = ({ 
  data, 
  firmaBilgileri, 
  logoUrl, 
  baslik, 
  kategori, 
  firma,
  paraBirimi,
  kategoriIstatistikleri
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

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        {/* HEADER */}
        <View style={pdfStyles.header}>
          <View style={pdfStyles.headerLeft}>
            {logoUrl && (
              <Image src={logoUrl} style={{ width: 130, height: 45, marginBottom: 5 }} />
            )}
            <Text style={pdfStyles.companyName}>{firmaBilgileri?.ad || 'TermoEnerji'}</Text>
            {firmaBilgileri?.adres && (
              <Text style={pdfStyles.companySub}>{firmaBilgileri.adres}</Text>
            )}
            {firmaBilgileri?.telefon && (
              <Text style={pdfStyles.companySub}>Tel: {firmaBilgileri.telefon}</Text>
            )}
            <Text style={pdfStyles.reportTitle}>Fiyat Karşılaştırma Raporu</Text>
          </View>
          <View>
            <Text style={pdfStyles.dateText}>Tarih: {formatDate(new Date())}</Text>
            <Text style={[pdfStyles.dateText, { marginTop: 4 }]}>Para Birimi: {paraBirimi}</Text>
          </View>
        </View>

        {/* FİLTRE BİLGİSİ */}
        <View style={pdfStyles.filterBox}>
          <View style={pdfStyles.filterRow}>
            <Text style={pdfStyles.filterText}>Arama: {baslik || 'Tumu'}</Text>
            <Text style={pdfStyles.filterText}>Kategori: {kategori || 'Tum Kategoriler'}</Text>
            <Text style={pdfStyles.filterText}>Firma: {firma || 'Tum Firmalar'}</Text>
            <Text style={pdfStyles.filterText}>Toplam: {data.length} kayit</Text>
          </View>
        </View>

        {/* KATEGORİ BAZINDA İSTATİSTİKLER */}
        {kategoriIstatistikleri && kategoriIstatistikleri.length > 0 && (
          <View style={pdfStyles.statsGrid}>
            {kategoriIstatistikleri.map((kat, index) => (
              <View key={index} style={pdfStyles.statCard}>
                <Text style={pdfStyles.statLabel}>{kat.kategori}</Text>
                <Text style={pdfStyles.statValueGreen}>En Ucuz: {formatPrice(kat.enUcuz, paraBirimi)}</Text>
                <Text style={pdfStyles.statValueRed}>En Pahali: {formatPrice(kat.enPahali, paraBirimi)}</Text>
                <Text style={pdfStyles.statValueAmber}>Fark: {formatPrice(kat.fark, paraBirimi)}</Text>
                <Text style={pdfStyles.statLabel}>Teklif: {kat.adet} adet</Text>
              </View>
            ))}
          </View>
        )}

        {/* TABLO */}
        <View style={pdfStyles.table}>
          <View style={pdfStyles.tableHeader}>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 0.5 }]}>#</Text>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 1.5 }]}>Urun Adi</Text>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 1.2 }]}>Firma</Text>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 1 }]}>Kategori</Text>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 1, textAlign: 'right' }]}>Fiyat</Text>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 0.8, textAlign: 'center' }]}>Durum</Text>
          </View>
          {data.map((item, index) => (
            <View key={index} style={index % 2 === 0 ? pdfStyles.tableRow : pdfStyles.tableRowAlternate}>
              <Text style={[pdfStyles.tableCell, { flex: 0.5 }]}>{index + 1}</Text>
              <Text style={[pdfStyles.tableCell, { flex: 1.5 }]}>{item.urun_adi}</Text>
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

        {/* FOOTER */}
        <View style={pdfStyles.footer} fixed>
          <Text style={pdfStyles.footerText}>Telif {new Date().getFullYear()} {firmaBilgileri?.ad || 'TermoEnerji'} - Tum haklari saklidir.</Text>
          <Text style={pdfStyles.footerText}>Rapor {formatDate(new Date())} tarihinde olusturulmustur.</Text>
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
  const [kategoriIstatistikleri, setKategoriIstatistikleri] = useState([])

  // Tüm fiyatları yükle
  useEffect(() => {
    const loadData = async () => {
      // Fiyatları çek
      const { data: fiyatData } = await supabase
        .from('fiyat_teklifleri')
        .select('*')
        .order('created_at', { ascending: false })
      
      setFiyatlar(fiyatData || [])
      setFilteredFiyatlar(fiyatData || [])
      setLoading(false)

      // Firmaları ve kategorileri çek
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

  // Filtreleme ve kategori istatistikleri
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

    // KATEGORİ BAZINDA İSTATİSTİKLER
    const kategoriGruplari = {}
    filtered.forEach(item => {
      const kat = item.kategori || 'Kategorisiz'
      if (!kategoriGruplari[kat]) {
        kategoriGruplari[kat] = []
      }
      kategoriGruplari[kat].push(item)
    })

    const istatistikler = Object.keys(kategoriGruplari).map(kat => {
      const items = kategoriGruplari[kat]
      const fiyatlar = items.map(i => i.fiyat)
      const enUcuz = Math.min(...fiyatlar)
      const enPahali = Math.max(...fiyatlar)
      return {
        kategori: kat,
        enUcuz: enUcuz,
        enPahali: enPahali,
        fark: enPahali - enUcuz,
        adet: items.length
      }
    })

    setKategoriIstatistikleri(istatistikler)
  }, [arama, filtreKategori, filtreFirma, fiyatlar])

  const toggleSecim = (id) => {
    setSeciliIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const selectedFiyatlar = filteredFiyatlar.filter(item => seciliIds.includes(item.id))

  // Kategori bazında en ucuz/en pahalı işaretleme
  const getKategoriEtiketi = (item) => {
    const kategoriItems = filteredFiyatlar.filter(i => i.kategori === item.kategori)
    if (kategoriItems.length === 0) return null
    
    const minFiyat = Math.min(...kategoriItems.map(i => i.fiyat))
    const maxFiyat = Math.max(...kategoriItems.map(i => i.fiyat))
    
    if (item.fiyat === minFiyat) return 'ucuz'
    if (item.fiyat === maxFiyat) return 'pahali'
    return null
  }

  const getConvertedPrice = (fiyat, paraBirimi) => {
    const parsedFiyat = parseFloat(String(fiyat).replace(',', '.'))
    if (isNaN(parsedFiyat) || !parsedFiyat) return '-'
    const converted = convertPrice(parsedFiyat, paraBirimi, gorunenParaBirimi, kurlar)
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
              {filteredFiyatlar.length} kayit gosteriliyor
            </p>
          </div>

          {/* Para Birimi Seçici */}
          <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg p-1 border border-slate-700">
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
        <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              value={arama}
              onChange={(e) => setArama(e.target.value)}
              placeholder="Urun adi ara..."
              className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
            <select
              value={filtreKategori}
              onChange={(e) => setFiltreKategori(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="">Tum Kategoriler</option>
              {kategoriler.map((k, i) => (
                <option key={i} value={k.ad}>{k.ad}</option>
              ))}
            </select>
            <select
              value={filtreFirma}
              onChange={(e) => setFiltreFirma(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="">Tum Firmalar</option>
              {firmalar.map((f, i) => (
                <option key={i} value={f.ad}>{f.ad}</option>
              ))}
            </select>
          </div>
        </div>

        {/* KATEGORİ BAZINDA İSTATİSTİK KARTLARI */}
        {kategoriIstatistikleri.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {kategoriIstatistikleri.map((kat, index) => (
              <div key={index} className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
                <p className="text-sm font-semibold text-white">{kat.kategori}</p>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <div>
                    <p className="text-xs text-slate-400">En Ucuz</p>
                    <p className="text-sm font-bold text-emerald-400">
                      {getConvertedPrice(kat.enUcuz, 'TRY')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">En Pahali</p>
                    <p className="text-sm font-bold text-red-400">
                      {getConvertedPrice(kat.enPahali, 'TRY')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Fark</p>
                    <p className="text-sm font-bold text-amber-400">
                      {getConvertedPrice(kat.fark, 'TRY')}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-2">{kat.adet} teklif</p>
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
                  kategoriIstatistikleri={kategoriIstatistikleri}
                />
              }
              fileName={`rapor_${new Date().toISOString().split('T')[0]}.pdf`}
            >
              {({ loading }) => (
                <button
                  disabled={loading}
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 py-2 rounded-lg transition disabled:opacity-50 flex items-center gap-2"
                >
                  PDF Rapor ({selectedFiyatlar.length})
                </button>
              )}
            </PDFDownloadLink>
          </div>
        )}

        {/* FİYAT LİSTESİ */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-400">Yukleniyor...</p>
          </div>
        ) : filteredFiyatlar.length === 0 ? (
          <div className="text-center py-12 bg-slate-800/50 rounded-xl border border-slate-700">
            <p className="text-slate-400">Henuz fiyat bulunmuyor</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-slate-800/50 rounded-xl border border-slate-700">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-800">
                  <th className="py-3 px-4 text-slate-400 font-medium w-10">
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
                      className="w-4 h-4 accent-emerald-500"
                    />
                  </th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Urun</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Firma</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium hidden md:table-cell">Kategori</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium">Fiyat</th>
                  <th className="text-center py-3 px-4 text-slate-400 font-medium">Durum</th>
                </tr>
              </thead>
              <tbody>
                {filteredFiyatlar.map((item) => {
                  const isSelected = seciliIds.includes(item.id)
                  const etiket = getKategoriEtiketi(item)

                  return (
                    <tr 
                      key={item.id} 
                      className={`border-b border-slate-700/50 hover:bg-slate-800/30 transition ${
                        isSelected ? 'bg-emerald-500/5' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSecim(item.id)}
                          className="w-4 h-4 accent-emerald-500"
                        />
                      </td>
                      <td className="py-3 px-4 text-white font-medium">
                        {item.urun_adi}
                        {etiket === 'ucuz' && (
                          <span className="ml-2 text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                            En Ucuz
                          </span>
                        )}
                        {etiket === 'pahali' && (
                          <span className="ml-2 text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">
                            En Pahali
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-300">{item.firma_adi}</td>
                      <td className="py-3 px-4 text-slate-400 hidden md:table-cell">
                        {item.kategori || '-'}
                      </td>
                      <td className={`py-3 px-4 font-bold text-right ${
                        etiket === 'ucuz' ? 'text-emerald-400' : 
                        etiket === 'pahali' ? 'text-red-400' : 
                        'text-white'
                      }`}>
                        {getConvertedPrice(item.fiyat, item.para_birimi)}
                        <span className="text-xs text-slate-500 ml-1">
                          ({item.para_birimi})
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-xs px-2 py-1 rounded-full ${
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
