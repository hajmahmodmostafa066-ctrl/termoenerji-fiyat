'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
// Olası tüm ikonları buraya ekledim, eksik ikon hatası almayacaksın.
import { 
  LayoutDashboard, 
  Plus, 
  List, 'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../../lib/supabase'
import { convertPrice, formatPrice, getKurlar, kurDegistiginde, getCurrencySymbol } from '../../../../lib/currency'
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'

// ============================================================
// PDF STILLERI (EKSTRA PROFESYONEL KURUMSAL TASARIM)
// ============================================================
const pdfStyles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#f8fafc', // Göz yormayan çok açık gri-mavi arka plan
    fontFamily: 'Helvetica',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '2px solid #1e293b', // Koyu lacivert kurumsal çizgi
    paddingBottom: 15,
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'column',
  },
  logo: {
    width: 120,
    height: 40,
    marginBottom: 8,
    objectFit: 'contain',
  },
  companyName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
    letterSpacing: 0.5,
  },
  reportTitle: {
    fontSize: 11,
    color: '#3b82f6', // Kurumsal mavi
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  dateText: {
    fontSize: 9,
    color: '#64748b',
    marginBottom: 3,
  },
  currencyBadge: {
    backgroundColor: '#e2e8f0',
    padding: '4px 8px',
    borderRadius: 4,
    fontSize: 8,
    color: '#0f172a',
    fontWeight: 'bold',
    marginTop: 6,
  },
  summaryBox: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 6,
    padding: 12,
    marginBottom: 20,
    border: '1px solid #e2e8f0',
    borderLeft: '4px solid #3b82f6', // Sol vurgu çizgisi
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 7,
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 10,
    borderBottom: '1px solid #cbd5e1',
    paddingBottom: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    width: '31%', // Yanyana 3 kart sığması için
    backgroundColor: '#ffffff',
    padding: 10,
    borderRadius: 6,
    border: '1px solid #e2e8f0',
  },
  statCardTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 8,
    borderBottom: '1px solid #f1f5f9',
    paddingBottom: 4,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 8,
    color: '#64748b',
  },
  statValGreen: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#10b981',
  },
  statValRed: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#ef4444',
  },
  statValAmber: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#f59e0b',
  },
  table: {
    width: '100%',
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1e293b', // Koyu renk başlık
    padding: '8px 6px',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  tableHeaderCell: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#ffffff',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    padding: '8px 6px',
    borderBottom: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
    alignItems: 'center',
  },
  tableRowAlt: {
    flexDirection: 'row',
    padding: '8px 6px',
    borderBottom: '1px solid #e2e8f0',
    backgroundColor: '#f1f5f9', // Zebra deseni
    alignItems: 'center',
  },
  tableCell: {
    fontSize: 8,
    color: '#334155',
  },
  priceCell: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#0f172a',
    textAlign: 'right',
  },
  statusCell: {
    fontSize: 7,
    padding: '3px 0',
    textAlign: 'center',
    borderRadius: 4,
    fontWeight: 'bold',
  },
  statusApproved: {
    color: '#10b981',
    backgroundColor: '#d1fae5',
  },
  statusPending: {
    color: '#f59e0b',
    backgroundColor: '#fef3c7',
  },
  statusRejected: {
    color: '#ef4444',
    backgroundColor: '#fee2e2',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTop: '1px solid #cbd5e1',
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 8,
    color: '#94a3b8',
  },
  pageNumber: {
    fontSize: 8,
    color: '#94a3b8',
    fontWeight: 'bold',
  },
})

// ============================================================
// PDF BİLEŞENİ (YENİLENMİŞ)
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
      <Page size="A4" style={pdfStyles.page} wrap>
        
        {/* HEADER (Kurumsal Antet) */}
        <View style={pdfStyles.headerContainer} fixed>
          <View style={pdfStyles.headerLeft}>
            {logoUrl && <Image src={logoUrl} style={pdfStyles.logo} />}
            <Text style={pdfStyles.companyName}>{firmaBilgileri?.ad || 'TermoEnerji A.Ş.'}</Text>
            <Text style={pdfStyles.reportTitle}>Fiyat Karşılaştırma Raporu</Text>
          </View>
          <View style={pdfStyles.headerRight}>
            <Text style={pdfStyles.dateText}>Oluşturulma: {formatDate(new Date())}</Text>
            <Text style={pdfStyles.dateText}>Kayıt Sayısı: {data.length}</Text>
            <View style={pdfStyles.currencyBadge}>
              <Text>Para Birimi: {paraBirimi} ({getSymbol(paraBirimi)})</Text>
            </View>
          </View>
        </View>

        {/* FİLTRE VE ÖZET BİLGİ KUTUSU */}
        <View style={pdfStyles.summaryBox}>
          <View style={pdfStyles.summaryItem}>
            <Text style={pdfStyles.summaryLabel}>Aranan Kelime</Text>
            <Text style={pdfStyles.summaryValue}>{baslik || 'Tümü'}</Text>
          </View>
          <View style={pdfStyles.summaryItem}>
            <Text style={pdfStyles.summaryLabel}>Seçili Kategori</Text>
            <Text style={pdfStyles.summaryValue}>{kategori || 'Tüm Kategoriler'}</Text>
          </View>
          <View style={pdfStyles.summaryItem}>
            <Text style={pdfStyles.summaryLabel}>Seçili Firma</Text>
            <Text style={pdfStyles.summaryValue}>{firma || 'Tüm Firmalar'}</Text>
          </View>
        </View>

        {/* İSTATİSTİK KARTLARI (Dashboard Görünümü) */}
        {urunIstatistikleri && urunIstatistikleri.length > 0 && (
          <>
            <Text style={pdfStyles.sectionTitle}>Ürün Fiyat Analizi</Text>
            <View style={pdfStyles.statsGrid}>
              {urunIstatistikleri.map((urun, index) => (
                <View key={index} style={pdfStyles.statCard} wrap={false}>
                  <Text style={pdfStyles.statCardTitle}>{urun.urunAdi}</Text>
                  
                  <View style={pdfStyles.statRow}>
                    <Text style={pdfStyles.statLabel}>En Ucuz:</Text>
                    <Text style={pdfStyles.statValGreen}>{formatPrice(urun.enUcuz, paraBirimi)}</Text>
                  </View>
                  
                  <View style={pdfStyles.statRow}>
                    <Text style={pdfStyles.statLabel}>En Pahalı:</Text>
                    <Text style={pdfStyles.statValRed}>{formatPrice(urun.enPahali, paraBirimi)}</Text>
                  </View>
                  
                  <View style={[pdfStyles.statRow, { marginTop: 4, paddingTop: 4, borderTop: '1px solid #f1f5f9' }]}>
                    <Text style={pdfStyles.statLabel}>Fiyat Farkı:</Text>
                    <Text style={pdfStyles.statValAmber}>{formatPrice(urun.fark, paraBirimi)}</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {/* DETAYLI VERİ TABLOSU */}
        <Text style={pdfStyles.sectionTitle}>Detaylı Fiyat Dökümü</Text>
        <View style={pdfStyles.table}>
          {/* Tablo Başlığı */}
          <View style={pdfStyles.tableHeader} fixed>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 0.4 }]}>#</Text>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 1.5 }]}>Ürün Adı</Text>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 1 }]}>Marka</Text>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 1.2 }]}>Tedarikçi Firma</Text>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 1 }]}>Kategori</Text>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 1, textAlign: 'right' }]}>Fiyat</Text>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 0.8, textAlign: 'center' }]}>Durum</Text>
          </View>
          
          {/* Tablo Satırları (Zebra Desenli) */}
          {data.map((item, index) => (
            <View key={index} style={index % 2 === 0 ? pdfStyles.tableRow : pdfStyles.tableRowAlt} wrap={false}>
              <Text style={[pdfStyles.tableCell, { flex: 0.4 }]}>{index + 1}</Text>
              <Text style={[pdfStyles.tableCell, { flex: 1.5, fontWeight: 'bold', color: '#0f172a' }]}>{item.urun_adi}</Text>
              <Text style={[pdfStyles.tableCell, { flex: 1 }]}>{item.marka || '-'}</Text>
              <Text style={[pdfStyles.tableCell, { flex: 1.2 }]}>{item.firma_adi}</Text>
              <Text style={[pdfStyles.tableCell, { flex: 1 }]}>{item.kategori || 'Genel'}</Text>
              <Text style={[pdfStyles.priceCell, { flex: 1 }]}>
                {formatPrice(item.fiyat, paraBirimi)}
              </Text>
              <View style={[{ flex: 0.8 }]}>
                <Text style={[
                  pdfStyles.statusCell,
                  item.durum === 'approved' ? pdfStyles.statusApproved : 
                  item.durum === 'pending' ? pdfStyles.statusPending : pdfStyles.statusRejected
                ]}>
                  {item.durum === 'approved' ? 'Aktif' : 
                   item.durum === 'pending' ? 'Beklemede' : 'Pasif'}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* FOOTER (Sayfa Numaralandırma ve Telif Hakkı) */}
        <View style={pdfStyles.footer} fixed>
          <Text style={pdfStyles.footerText}>
            © {new Date().getFullYear()} {firmaBilgileri?.ad || 'TermoEnerji A.Ş.'} - Tüm Hakları Saklıdır.
          </Text>
          <Text style={pdfStyles.footerText}>Sistem Tarafından Otomatik Üretilmiştir</Text>
          <Text render={({ pageNumber, totalPages }) => (
            `Sayfa ${pageNumber} / ${totalPages}`
          )} style={pdfStyles.pageNumber} />
        </View>

      </Page>
    </Document>
  )
}

// ============================================================
// ANA SAYFA BİLEŞENİ (Değiştirilmedi, Mantık Aynı)
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
    if (isNaN(parsedFiyat) || !parsedFiyat) return { original: '-', converted: '-' }
    
    const tlValue = convertPrice(parsedFiyat, paraBirimi, 'TRY', kurlar)
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
              {filteredFiyatlar.length} kayıt
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
              placeholder="Ürün ara..."
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
            <select
              value={filtreKategori}
              onChange={(e) => setFiltreKategori(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="">Tüm Kategoriler</option>
              {kategoriler.map((k, i) => (
                <option key={i} value={k.ad}>{k.ad}</option>
              ))}
            </select>
            <select
              value={filtreFirma}
              onChange={(e) => setFiltreFirma(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="">Tüm Firmalar</option>
              {firmalar.map((f, i) => (
                <option key={i} value={f.ad}>{f.ad}</option>
              ))}
            </select>
          </div>
        </div>

        {/* KÜÇÜK KARTLAR (Web Görünümü) */}
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
                  baslik={arama || 'Tümü'}
                  kategori={filtreKategori || 'Tüm Kategoriler'}
                  firma={filtreFirma || 'Tüm Firmalar'}
                  paraBirimi={gorunenParaBirimi}
                  urunIstatistikleri={urunIstatistikleri}
                />
              }
              fileName={`Profesyonel_Rapor_${new Date().toISOString().split('T')[0]}.pdf`}
            >
              {({ loading }) => (
                <button
                  disabled={loading}
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50 flex items-center gap-2 text-sm font-semibold shadow-lg shadow-emerald-500/20"
                >
                  {loading ? 'PDF Hazırlanıyor...' : `PDF Rapor İndir (${selectedFiyatlar.length} Kayıt)`}
                </button>
              )}
            </PDFDownloadLink>
          </div>
        )}

        {/* FİYAT LİSTESİ - ORİJİNAL VE ÇEVRİLMİŞ */}
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
                            En Pahalı
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
                            {fiyatlar.converted}
                          </span>
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
                          {item.durum === 'approved' ? 'Onaylandı' :
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
  Search, 
  Layers, 
  Building2, 
  BarChart3, 
  Settings, 
  Users,
  TrendingUp,
  DollarSign,
  Package,
  ArrowRight,
  Sparkles,
  Zap,
  Flame,
  Snowflake,
  FileText,
  Calendar
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
  const [loading, setLoading] = useState(true)

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
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const menuItems = [
    { 
      title: 'Fiyat Ekle', 
      icon: Plus, 
      href: '/panel/fiyat-ekle', 
      gradient: 'from-amber-500 to-amber-400',
      glow: 'shadow-amber-500/30 hover:shadow-amber-500/50',
      border: 'border-amber-500/20 hover:border-amber-400/50',
      textHover: 'group-hover:text-amber-400'
    },
    { 
      title: 'Fiyat Listesi', 
      icon: List, 
      href: '/panel/fiyat-listesi', 
      gradient: 'from-sky-500 to-sky-400',
      glow: 'shadow-sky-500/30 hover:shadow-sky-500/50',
      border: 'border-sky-500/20 hover:border-sky-400/50',
      textHover: 'group-hover:text-sky-400'
    },
    { 
      title: 'Fiyat Sorgula', 
      icon: Search, 
      href: '/panel/fiyat-sorgula', 
      gradient: 'from-emerald-500 to-emerald-400',
      glow: 'shadow-emerald-500/30 hover:shadow-emerald-500/50',
      border: 'border-emerald-500/20 hover:border-emerald-400/50',
      textHover: 'group-hover:text-emerald-400'
    },
    { 
      title: 'Kategoriler', 
      icon: Layers, 
      href: '/panel/kategoriler', 
      gradient: 'from-slate-600 to-slate-500',
      glow: 'shadow-slate-500/30 hover:shadow-slate-500/50',
      border: 'border-slate-500/20 hover:border-slate-400/50',
      textHover: 'group-hover:text-slate-300'
    },
    { 
      title: 'Firmalar', 
      icon: Building2, 
      href: '/panel/firmalar', 
      gradient: 'from-amber-500 to-orange-400',
      glow: 'shadow-orange-500/30 hover:shadow-orange-500/50',
      border: 'border-orange-500/20 hover:border-orange-400/50',
      textHover: 'group-hover:text-orange-400'
    },
    { 
      title: 'Raporlar', 
      icon: BarChart3, 
      href: '/panel/raporlar', 
      gradient: 'from-sky-500 to-blue-400',
      glow: 'shadow-blue-500/30 hover:shadow-blue-500/50',
      border: 'border-blue-500/20 hover:border-blue-400/50',
      textHover: 'group-hover:text-blue-400'
    },
    { 
      title: 'Yönetim', 
      icon: Settings, 
      href: '/panel/yonetim', 
      gradient: 'from-slate-600 to-slate-500',
      glow: 'shadow-slate-500/30 hover:shadow-slate-500/50',
      border: 'border-slate-500/20 hover:border-slate-400/50',
      textHover: 'group-hover:text-slate-300'
    },
    { 
      title: 'Kullanıcılar', 
      icon: Users, 
      href: '/panel/kullanıcılar', 
      gradient: 'from-emerald-500 to-teal-400',
      glow: 'shadow-teal-500/30 hover:shadow-teal-500/50',
      border: 'border-teal-500/20 hover:border-teal-400/50',
      textHover: 'group-hover:text-teal-400'
    },
  ]

  return (
    <div className="space-y-8 bg-slate-900 min-h-screen text-slate-200">
      
      {/* HERO BÖLÜMÜ */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-800/50 border border-slate-700/50 p-8 shadow-2xl">
        <div className="absolute top-0 left-0 w-1/2 h-full bg-sky-500/10 blur-3xl rounded-full mix-blend-screen pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-1/2 h-full bg-amber-500/10 blur-3xl rounded-full mix-blend-screen pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="flex items-center justify-center w-16 h-16 bg-slate-800 rounded-2xl shadow-inner border border-slate-700/50 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-sky-400/20 to-amber-400/20" />
              <Snowflake className="h-7 w-7 text-sky-400 absolute left-2" />
              <Flame className="h-7 w-7 text-amber-500 absolute right-2" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                <span className="text-slate-100">TERMO</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-500">ENERJİ</span>
              </h1>
              <p className="text-slate-400 text-sm flex items-center gap-2 mt-1 font-medium">
                <Sparkles className="h-4 w-4 text-emerald-400" />
                Merkezi Yönetim Sistemi
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-slate-900/80 backdrop-blur-md rounded-full px-5 py-2.5 border border-slate-700/50 shadow-lg">
            <Zap className="h-4 w-4 text-amber-400 animate-pulse" />
            <span className="text-slate-200 text-sm font-medium tracking-wide">Sistem Aktif</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          </div>
        </div>
      </div>

      {/* İSTATİSTİK KARTLARI */}
      {!loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          <div className="group relative bg-slate-800/40 rounded-2xl p-6 border border-slate-700/50 hover:border-sky-500/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-sky-500/10 overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <DollarSign className="w-16 h-16 text-sky-400" />
            </div>
            <div className="relative z-10 flex items-center gap-4">
              <div className="p-3 bg-sky-500/10 text-sky-400 rounded-xl group-hover:scale-110 transition-transform duration-300 border border-sky-500/20">
                <DollarSign className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400">Toplam Fiyat</p>
                <p className="text-2xl font-bold text-slate-100 group-hover:text-sky-400 transition-colors">
                  {stats.toplamFiyat}
                </p>
              </div>
            </div>
          </div>

          <div className="group relative bg-slate-800/40 rounded-2xl p-6 border border-slate-700/50 hover:border-emerald-500/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/10 overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <TrendingUp className="w-16 h-16 text-emerald-400" />
            </div>
            <div className="relative z-10 flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl group-hover:scale-110 transition-transform duration-300 border border-emerald-500/20">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400">Aktif Teklif</p>
                <p className="text-2xl font-bold text-slate-100 group-hover:text-emerald-400 transition-colors">
                  {stats.aktifFiyat}
                </p>
              </div>
            </div>
          </div>

          <div className="group relative bg-slate-800/40 rounded-2xl p-6 border border-slate-700/50 hover:border-amber-500/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/10 overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Building2 className="w-16 h-16 text-amber-400" />
            </div>
            <div className="relative z-10 flex items-center gap-4">
              <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl group-hover:scale-110 transition-transform duration-300 border border-amber-500/20">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400">Kayıtlı Firma</p>
                <p className="text-2xl font-bold text-slate-100 group-hover:text-amber-400 transition-colors">
                  {stats.toplamFirma}
                </p>
              </div>
            </div>
          </div>

          <div className="group relative bg-slate-800/40 rounded-2xl p-6 border border-slate-700/50 hover:border-slate-400/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-500/10 overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Layers className="w-16 h-16 text-slate-400" />
            </div>
            <div className="relative z-10 flex items-center gap-4">
              <div className="p-3 bg-slate-700/50 text-slate-300 rounded-xl group-hover:scale-110 transition-transform duration-300 border border-slate-600/50">
                <Layers className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400">Kategori</p>
                <p className="text-2xl font-bold text-slate-100 group-hover:text-white transition-colors">
                  {stats.toplamKategori}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MENÜ GRİD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={() => router.push(item.href)}
            className={`group relative bg-slate-800/40 backdrop-blur-sm rounded-2xl p-5 border ${item.border} transition-all duration-300 hover:-translate-y-1 overflow-hidden text-left shadow-lg ${item.glow}`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />

            <div className="relative z-10 flex items-center gap-4">
              <div className={`p-3 bg-gradient-to-br ${item.gradient} rounded-xl shadow-inner group-hover:scale-105 transition-transform duration-300`}>
                <item.icon className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold text-slate-200 transition-colors duration-300 ${item.textHover}`}>
                  {item.title}
                </h3>
                <p className="text-slate-400 text-xs flex items-center gap-1 mt-0.5 group-hover:text-slate-300 transition-colors">
                  Yönetime git <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform duration-300" />
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* SON EKLENEN FİYATLAR TABLOSU */}
      {sonFiyatlar.length > 0 && (
        <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 overflow-hidden shadow-xl">
          <div className="p-6 border-b border-slate-700/50 flex items-center gap-3">
            <div className="p-2.5 bg-slate-700/50 rounded-lg border border-slate-600/50">
              <Package className="h-5 w-5 text-slate-300" />
            </div>
            <h2 className="text-lg font-semibold text-slate-100">Son İşlem Gören Teklifler</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-900/50 text-slate-400 font-medium text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-4 px-6">Ürün / Hizmet</th>
                  <th className="py-4 px-6">Firma Detayı</th>
                  <th className="py-4 px-6 text-right">Tutar</th>
                  <th className="py-4 px-6 text-center">Mevcut Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {sonFiyatlar.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/60 transition-colors duration-200 group">
                    <td className="py-4 px-6 text-slate-200 font-medium group-hover:text-sky-400 transition-colors">
                      {item.urun_adi}
                    </td>
                    <td className="py-4 px-6 text-slate-400 flex items-center gap-2">
                      <Building2 className="h-4 w-4 opacity-50" />
                      {item.firma_adi}
                    </td>
                    <td className="py-4 px-6 text-right font-semibold text-slate-200 group-hover:text-amber-400 transition-colors">
                      {new Intl.NumberFormat('tr-TR', {
                        style: 'currency',
                        currency: item.para_birimi || 'TRY',
                      }).format(item.fiyat)}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                        item.durum === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        item.durum === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          item.durum === 'approved' ? 'bg-emerald-400' :
                          item.durum === 'pending' ? 'bg-amber-400' :
                          'bg-red-400'
                        }`} />
                        {item.durum === 'approved' ? 'Onaylandı' :
                         item.durum === 'pending' ? 'Beklemede' : 'Reddedildi'}
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
