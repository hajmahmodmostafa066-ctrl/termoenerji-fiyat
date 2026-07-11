'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../../lib/supabase'
import { convertPrice, formatPrice, getKurlar, kurDegistiginde, getCurrencySymbol } from '../../../../lib/currency'
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer'

// ============================================================
// TÜRKÇE KARAKTER DESTEKLI FONT
// ============================================================
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf' },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Bold.ttf', fontWeight: 'bold' },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Italic.ttf', fontStyle: 'italic' },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf', fontWeight: 500 },
  ]
})

// ============================================================
// PROFESYONEL PDF STILLERI
// ============================================================
const pdfStyles = StyleSheet.create({
  page: {
    fontFamily: 'Roboto',
    padding: 0,
    backgroundColor: '#ffffff',
  },

  // --- HEADER ---
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '28pt 30pt 16pt 30pt',
    borderBottom: '2pt solid #10b981',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoBox: {
    width: 70,
    height: 24,
    marginRight: 4,
  },
  companyInfo: {
    flexDirection: 'column',
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    letterSpacing: 0.5,
  },
  companySub: {
    fontSize: 8,
    color: '#64748b',
    marginTop: 2,
  },
  reportTitleBlock: {
    marginTop: 6,
  },
  reportTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#10b981',
  },
  reportSubtitle: {
    fontSize: 7,
    color: '#64748b',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  dateText: {
    fontSize: 8,
    color: '#64748b',
    textAlign: 'right',
  },
  currencyBadge: {
    fontSize: 7,
    color: '#0f172a',
    fontWeight: 500,
    backgroundColor: '#f1f5f9',
    padding: '3pt 6pt',
    borderRadius: 3,
    marginTop: 3,
  },

  // --- FILTRE BILGI ---
  filterBox: {
    backgroundColor: '#f8fafc',
    padding: '8pt 12pt',
    borderRadius: 4,
    marginHorizontal: 30,
    marginTop: 10,
    border: '1pt solid #e2e8f0',
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  filterItem: {
    fontSize: 7,
    color: '#475569',
  },
  filterLabel: {
    fontSize: 7,
    color: '#94a3b8',
    marginRight: 3,
  },

  // --- ISTATISTIK KARTLARI ---
  statsTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0f172a',
    marginHorizontal: 30,
    marginTop: 12,
    marginBottom: 6,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginHorizontal: 30,
    marginBottom: 10,
  },
  statCard: {
    backgroundColor: '#ffffff',
    padding: '6pt 8pt',
    borderRadius: 4,
    width: '23%',
    border: '1pt solid #e2e8f0',
  },
  statProductName: {
    fontSize: 6,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 3,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 1,
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
    fontSize: 6,
    color: '#f59e0b',
    marginTop: 2,
  },

  // --- TABLO ---
  table: {
    marginHorizontal: 30,
    marginTop: 4,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    padding: '5pt 4pt',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  tableHeaderCell: {
    fontSize: 6,
    fontWeight: 'bold',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    padding: '4pt 4pt',
    borderBottom: '0.5pt solid #e2e8f0',
    alignItems: 'center',
  },
  tableRowAlternate: {
    flexDirection: 'row',
    padding: '4pt 4pt',
    borderBottom: '0.5pt solid #e2e8f0',
    backgroundColor: '#f8fafc',
    alignItems: 'center',
  },
  tableCell: {
    fontSize: 6,
    color: '#0f172a',
  },
  tableCellBold: {
    fontSize: 6,
    fontWeight: 500,
    color: '#0f172a',
  },
  priceCell: {
    fontSize: 6,
    fontWeight: 'bold',
    color: '#10b981',
  },
  priceCellHigh: {
    fontSize: 6,
    fontWeight: 'bold',
    color: '#ef4444',
  },
  originalPrice: {
    fontSize: 5,
    color: '#94a3b8',
    marginTop: 1,
  },
  statusCell: {
    fontSize: 6,
    color: '#10b981',
    textAlign: 'center',
  },
  statusCellPending: {
    fontSize: 6,
    color: '#eab308',
    textAlign: 'center',
  },
  statusCellRejected: {
    fontSize: 6,
    color: '#ef4444',
    textAlign: 'center',
  },
  statusBadgeApproved: {
    fontSize: 5,
    color: '#10b981',
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 3,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  statusBadgePending: {
    fontSize: 5,
    color: '#eab308',
    backgroundColor: '#fefce8',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 3,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  statusBadgeRejected: {
    fontSize: 5,
    color: '#ef4444',
    backgroundColor: '#fef2f2',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 3,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  etiketUcuz: {
    fontSize: 5,
    color: '#10b981',
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderRadius: 2,
    marginLeft: 2,
    fontWeight: 'bold',
  },
  etiketPahali: {
    fontSize: 5,
    color: '#ef4444',
    backgroundColor: '#fef2f2',
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderRadius: 2,
    marginLeft: 2,
    fontWeight: 'bold',
  },

  // --- FOOTER ---
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    borderTop: '0.5pt solid #e2e8f0',
    paddingTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 5,
    color: '#94a3b8',
  },
  pageNumber: {
    fontSize: 5,
    color: '#94a3b8',
  },

  // --- ÖZET SATIR (Sayfa sonu) ---
  summaryBox: {
    marginHorizontal: 30,
    marginTop: 8,
    padding: '6pt 10pt',
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    border: '1pt solid #e2e8f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: 6,
    color: '#64748b',
    fontWeight: 500,
  },
  summaryValue: {
    fontSize: 7,
    color: '#0f172a',
    fontWeight: 'bold',
  },

  // --- SAYFA NUMARALANDIRMA ---
  pageNumberWrapper: {
    position: 'absolute',
    bottom: 20,
    right: 30,
  },
})

// ============================================================
// HELPER FONKSIYONLAR (PDF içinde kullanılır)
// ============================================================
const pdfFormatPrice = (price, currency = 'TRY') => {
  if (price === null || price === undefined || isNaN(parseFloat(price))) return '-'
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: currency || 'TRY',
  }).format(parseFloat(price))
}

const pdfFormatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('tr-TR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const pdfGetSymbol = (currency) => {
  switch(currency) {
    case 'TRY': return '₺'
    case 'USD': return '$'
    case 'EUR': return '€'
    default: return '₺'
  }
}

// ============================================================
// PDF ICIN YARDIMCI: DURUM BADGE
// ============================================================
const StatusBadge = ({ durum }) => {
  let style = pdfStyles.statusCell
  let badgeStyle = pdfStyles.statusBadgeApproved
  let label = 'Aktif'

  if (durum === 'pending') {
    badgeStyle = pdfStyles.statusBadgePending
    label = 'Beklemede'
  } else if (durum === 'rejected') {
    badgeStyle = pdfStyles.statusBadgeRejected
    label = 'Pasif'
  }

  return <Text style={badgeStyle}>{label}</Text>
}

// ============================================================
// EKSIK FONKSIYONLARIN PDF IÇI TANIMLARI
// ============================================================
const pdfConvertPrice = (fiyat, fromCurrency, toCurrency, kurlar) => {
  const val = parseFloat(fiyat)
  if (isNaN(val)) return 0

  if (fromCurrency === toCurrency) return val

  let tlValue = val
  if (fromCurrency === 'USD') tlValue = val * (kurlar?.usdTry || 34.50)
  if (fromCurrency === 'EUR') tlValue = val * (kurlar?.eurTry || 37.20)

  if (toCurrency === 'USD') return tlValue / (kurlar?.usdTry || 34.50)
  if (toCurrency === 'EUR') return tlValue / (kurlar?.eurTry || 37.20)

  return tlValue
}

const pdfGetConvertedPrice = (fiyat, paraBirimi, gorunenParaBirimi, kurlar) => {
  const parsedFiyat = parseFloat(String(fiyat).replace(',', '.'))
  if (isNaN(parsedFiyat) || !parsedFiyat) return { original: '-', converted: '-' }

  const tlValue = pdfConvertPrice(parsedFiyat, paraBirimi, 'TRY', kurlar)
  const converted = pdfConvertPrice(tlValue, 'TRY', gorunenParaBirimi, kurlar)

  return {
    original: pdfFormatPrice(parsedFiyat, paraBirimi),
    converted: pdfFormatPrice(converted, gorunenParaBirimi),
  }
}

// ============================================================
// ANA PDF BILEŞENI
// ============================================================
const RaporPDF = ({
  data,
  firmaBilgileri,
  logoUrl,
  baslik,
  kategori,
  firma,
  paraBirimi,
  urunIstatistikleri,
  kurlar = { usdTry: 34.50, eurTry: 37.20 },
}) => {
  // Sadece seçili veri varsa kullan, yoksa tüm veriyi kullan
  const raporData = data || []

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        {/* ===== HEADER ===== */}
        <View style={pdfStyles.header}>
          <View style={pdfStyles.headerLeft}>
            {logoUrl && (
              <Image src={logoUrl} style={pdfStyles.logoBox} />
            )}
            <View style={pdfStyles.companyInfo}>
              <Text style={pdfStyles.companyName}>
                {firmaBilgileri?.ad || 'Şirket Adı'}
              </Text>
              {firmaBilgileri?.aciklama && (
                <Text style={pdfStyles.companySub}>
                  {firmaBilgileri.aciklama}
                </Text>
              )}
              <View style={pdfStyles.reportTitleBlock}>
                <Text style={pdfStyles.reportTitle}>Fiyat Karşılaştırma Raporu</Text>
                <Text style={pdfStyles.reportSubtitle}>
                  {raporData.length} kayıt listelenmektedir
                </Text>
              </View>
            </View>
          </View>
          <View style={pdfStyles.headerRight}>
            <Text style={pdfStyles.dateText}>Tarih: {pdfFormatDate(new Date())}</Text>
            <View style={pdfStyles.currencyBadge}>
              <Text>Para Birimi: {paraBirimi} ({pdfGetSymbol(paraBirimi)})</Text>
            </View>
          </View>
        </View>

        {/* ===== FILTRE BILGI ===== */}
        <View style={pdfStyles.filterBox}>
          <View style={pdfStyles.filterRow}>
            <Text style={pdfStyles.filterRow}>
              <Text style={pdfStyles.filterLabel}>Arama:</Text>
              <Text style={pdfStyles.filterItem}>{baslik || 'Tümü'}</Text>
            </Text>
            <Text style={pdfStyles.filterRow}>
              <Text style={pdfStyles.filterLabel}>Kategori:</Text>
              <Text style={pdfStyles.filterItem}>{kategori || 'Tüm Kategoriler'}</Text>
            </Text>
            <Text style={pdfStyles.filterRow}>
              <Text style={pdfStyles.filterLabel}>Firma:</Text>
              <Text style={pdfStyles.filterItem}>{firma || 'Tüm Firmalar'}</Text>
            </Text>
          </View>
        </View>

        {/* ===== ÜRÜN ISTATISTIKLERI ===== */}
        {urunIstatistikleri && urunIstatistikleri.length > 0 && (
          <>
            <Text style={pdfStyles.statsTitle}>Ürün Bazında Fiyat Özeti</Text>
            <View style={pdfStyles.statsGrid}>
              {urunIstatistikleri.map((urun, index) => (
                <View key={index} style={pdfStyles.statCard}>
                  <Text style={pdfStyles.statProductName} numberOfLines={1}>
                    {urun.urunAdi}
                  </Text>
                  <View style={pdfStyles.statRow}>
                    <Text style={pdfStyles.statValueGreen}>
                      En Ucuz: {pdfFormatPrice(urun.enUcuz, paraBirimi)}
                    </Text>
                    <Text style={pdfStyles.statValueRed}>
                      {pdfFormatPrice(urun.enPahali, paraBirimi)}
                    </Text>
                  </View>
                  <Text style={pdfStyles.statValueAmber}>
                    Fark: {pdfFormatPrice(urun.fark, paraBirimi)} ({urun.adet || 1} firma)
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* ===== ANA TABLO ===== */}
        <View style={pdfStyles.table}>
          {/* Tablo Bașliği */}
          <View style={pdfStyles.tableHeader}>
            <Text style={[pdfStyles.tableHeaderCell, { width: '4%' }]}>#</Text>
            <Text style={[pdfStyles.tableHeaderCell, { width: '22%' }]}>Ürün Adı</Text>
            <Text style={[pdfStyles.tableHeaderCell, { width: '10%' }]}>Marka</Text>
            <Text style={[pdfStyles.tableHeaderCell, { width: '16%' }]}>Firma</Text>
            <Text style={[pdfStyles.tableHeaderCell, { width: '12%' }]}>Kategori</Text>
            <Text style={[pdfStyles.tableHeaderCell, { width: '18%', textAlign: 'right' }]}>Fiyat</Text>
            <Text style={[pdfStyles.tableHeaderCell, { width: '10%', textAlign: 'center' }]}>Durum</Text>
          </View>

          {/* Tablo Satirlari */}
          {raporData.map((item, index) => {
            const fiyatlar = pdfGetConvertedPrice(item.fiyat, item.para_birimi || 'TRY', paraBirimi, kurlar)
            const urunItems = raporData.filter(i => i.urun_adi === item.urun_adi)
            const tlFiyatlar = urunItems.map(i => {
              const fiy = parseFloat(i.fiyat)
              return pdfConvertPrice(isNaN(fiy) ? 0 : fiy, i.para_birimi || 'TRY', 'TRY', kurlar)
            })
            const minFiyat = tlFiyatlar.length > 0 ? Math.min(...tlFiyatlar) : 0
            const maxFiyat = tlFiyatlar.length > 0 ? Math.max(...tlFiyatlar) : 0
            const mevcutTL = pdfConvertPrice(parseFloat(item.fiyat) || 0, item.para_birimi || 'TRY', 'TRY', kurlar)
            const isUcuz = urunItems.length > 1 && mevcutTL === minFiyat
            const isPahali = urunItems.length > 1 && mevcutTL === maxFiyat

            return (
              <View
                key={index}
                style={index % 2 === 0 ? pdfStyles.tableRow : pdfStyles.tableRowAlternate}
              >
                <Text style={[pdfStyles.tableCell, { width: '4%' }]}>{index + 1}</Text>
                <Text style={[pdfStyles.tableCellBold, { width: '22%' }]}>
                  {item.urun_adi || '-'}
                  {isUcuz && <Text style={pdfStyles.etiketUcuz}>  En Ucuz</Text>}
                  {isPahali && <Text style={pdfStyles.etiketPahali}>  En Pahalı</Text>}
                </Text>
                <Text style={[pdfStyles.tableCell, { width: '10%' }]}>{item.marka || '-'}</Text>
                <Text style={[pdfStyles.tableCell, { width: '16%' }]}>{item.firma_adi || '-'}</Text>
                <Text style={[pdfStyles.tableCell, { width: '12%' }]}>{item.kategori || '-'}</Text>
                <View style={{ width: '18%', alignItems: 'flex-end' }}>
                  <Text style={[
                    isUcuz ? pdfStyles.priceCell :
                    isPahali ? pdfStyles.priceCellHigh :
                    pdfStyles.priceCell,
                  ]}>
                    {fiyatlar.converted}
                  </Text>
                  <Text style={pdfStyles.originalPrice}>{fiyatlar.original}</Text>
                </View>
                <View style={{ width: '10%', alignItems: 'center' }}>
                  <StatusBadge durum={item.durum} />
                </View>
              </View>
            )
          })}
        </View>

        {/* ===== ÖZET ===== */}
        <View style={pdfStyles.summaryBox}>
          <Text style={pdfStyles.summaryLabel}>
            Toplam Kayıt: {raporData.length}
          </Text>
          <Text style={pdfStyles.summaryLabel}>
            Rapor: {pdfFormatDate(new Date())}
          </Text>
        </View>

        {/* ===== FOOTER ===== */}
        <View style={pdfStyles.footer} fixed>
          <Text style={pdfStyles.footerText}>
            Telif © {new Date().getFullYear()} {firmaBilgileri?.ad || 'Şirket Adı'}
          </Text>
          <Text style={pdfStyles.pageNumber} render={({ pageNumber, totalPages }) => (
            `${pageNumber} / ${totalPages}`
          )} />
        </View>
      </Page>
    </Document>
  )
}

// ============================================================
// ANA SAYFA BILEŞENI
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
        return convertPrice(isNaN(fiyat) ? 0 : fiyat, paraBirimi, 'TRY', kurlar)
      })

      const enUcuzTL = tlFiyatlar.length > 0 ? Math.min(...tlFiyatlar) : 0
      const enPahaliTL = tlFiyatlar.length > 0 ? Math.max(...tlFiyatlar) : 0

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
      return convertPrice(isNaN(fiyat) ? 0 : fiyat, paraBirimi, 'TRY', kurlar)
    })

    const minFiyat = tlFiyatlar.length > 0 ? Math.min(...tlFiyatlar) : 0
    const maxFiyat = tlFiyatlar.length > 0 ? Math.max(...tlFiyatlar) : 0
    const mevcutTL = convertPrice(parseFloat(item.fiyat) || 0, item.para_birimi || 'TRY', 'TRY', kurlar)

    if (mevcutTL === minFiyat) return 'ucuz'
    if (mevcutTL === maxFiyat) return 'pahali'
    return null
  }

  // ✅ DOĞRU FIYAT ÇEVIRISI
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

        {/* FILTRELER */}
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

        {/* PDF RAPOR BUTONLARI */}
        <div className="flex justify-end gap-2 mb-4">
          {/* Tüm Filtrelenmiş Veriler için PDF */}
          <PDFDownloadLink
            document={
              <RaporPDF
                data={filteredFiyatlar}
                firmaBilgileri={firmaBilgileri}
                logoUrl={logoUrl}
                baslik={arama || 'Tümü'}
                kategori={filtreKategori || 'Tüm Kategoriler'}
                firma={filtreFirma || 'Tüm Firmalar'}
                paraBirimi={gorunenParaBirimi}
                urunIstatistikleri={urunIstatistikleri}
                kurlar={kurlar}
              />
            }
            fileName={`rapor_tumu_${new Date().toISOString().split('T')[0]}.pdf`}
          >
            {({ loading }) => (
              <button
                disabled={loading}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-3 py-1 rounded-lg transition disabled:opacity-50 flex items-center gap-2 text-xs"
              >
                📄 Tümü PDF ({filteredFiyatlar.length})
              </button>
            )}
          </PDFDownloadLink>

          {/* Seçili Veriler için PDF */}
          {selectedFiyatlar.length > 0 && (
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
                  kurlar={kurlar}
                />
              }
              fileName={`rapor_secili_${new Date().toISOString().split('T')[0]}.pdf`}
            >
              {({ loading }) => (
                <button
                  disabled={loading}
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-3 py-1 rounded-lg transition disabled:opacity-50 flex items-center gap-2 text-xs"
                >
                  ✅ Seçili PDF ({selectedFiyatlar.length})
                </button>
              )}
            </PDFDownloadLink>
          )}
        </div>

        {/* FIYAT LISTESI - ORIJINAL VE ÇEVRILMIȘ */}
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
