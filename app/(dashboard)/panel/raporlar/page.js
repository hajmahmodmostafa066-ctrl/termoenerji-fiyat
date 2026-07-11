'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../../lib/supabase'
import { convertPrice, formatPrice, getKurlar, kurDegistiginde, getCurrencySymbol } from '../../../../lib/currency'
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer'

// ============================================================
// PROFESYONEL FONT VE RENK TANIMLARI
// ============================================================
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf', fontWeight: 300 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 400 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf', fontWeight: 500 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 700 },
  ]
})

const COLORS = {
  primary: '#0f172a',
  secondary: '#1e293b',
  accent: '#10b981',
  accentLight: '#d1fae5',
  danger: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
  text: '#1e293b',
  textLight: '#64748b',
  border: '#e2e8f0',
  background: '#f8fafc',
  white: '#ffffff',
}

// ============================================================
// GELİŞMİŞ PDF STILLERI
// ============================================================
const pdfStyles = StyleSheet.create({
  page: {
    padding: 50,
    backgroundColor: COLORS.white,
    fontFamily: 'Roboto',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 25,
    paddingBottom: 15,
    borderBottom: `2px solid ${COLORS.accent}`,
  },
  headerLeft: {
    flex: 1,
  },
  companyLogo: {
    width: 120,
    height: 45,
    marginBottom: 8,
    objectFit: 'contain',
  },
  companyName: {
    fontSize: 22,
    fontWeight: 700,
    color: COLORS.primary,
    letterSpacing: 1,
  },
  companySub: {
    fontSize: 9,
    color: COLORS.textLight,
    marginTop: 2,
    lineHeight: 1.4,
  },
  headerRight: {
    alignItems: 'flex-end',
    flexShrink: 0,
    marginLeft: 20,
  },
  reportBadge: {
    backgroundColor: COLORS.accent,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginBottom: 6,
  },
  reportBadgeText: {
    fontSize: 10,
    fontWeight: 700,
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  dateText: {
    fontSize: 9,
    color: COLORS.textLight,
    marginTop: 2,
  },
  summaryContainer: {
    backgroundColor: COLORS.background,
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    border: `1px solid ${COLORS.border}`,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  summaryItem: {
    flex: 1,
    minWidth: '22%',
    padding: 10,
    backgroundColor: COLORS.white,
    borderRadius: 6,
    border: `1px solid ${COLORS.border}`,
  },
  summaryLabel: {
    fontSize: 7,
    fontWeight: 500,
    color: COLORS.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: 700,
    color: COLORS.primary,
    marginTop: 4,
  },
  summaryValueGreen: {
    fontSize: 14,
    fontWeight: 700,
    color: COLORS.accent,
    marginTop: 4,
  },
  summaryValueRed: {
    fontSize: 14,
    fontWeight: 700,
    color: COLORS.danger,
    marginTop: 4,
  },
  summaryValueAmber: {
    fontSize: 14,
    fontWeight: 700,
    color: COLORS.warning,
    marginTop: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    padding: 12,
    backgroundColor: COLORS.white,
    borderRadius: 6,
    border: `1px solid ${COLORS.border}`,
    marginBottom: 20,
  },
  filterTag: {
    backgroundColor: COLORS.background,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    border: `1px solid ${COLORS.border}`,
  },
  filterTagText: {
    fontSize: 8,
    color: COLORS.textLight,
  },
  filterTagBold: {
    fontWeight: 500,
    color: COLORS.primary,
  },
  statsContainer: {
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: COLORS.primary,
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  statCard: {
    width: '24%',
    backgroundColor: COLORS.white,
    padding: 8,
    borderRadius: 4,
    border: `1px solid ${COLORS.border}`,
    minWidth: 120,
  },
  statProductName: {
    fontSize: 8,
    fontWeight: 700,
    color: COLORS.primary,
    marginBottom: 4,
    textOverflow: 'ellipsis',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  statLabel: {
    fontSize: 6,
    color: COLORS.textLight,
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 8,
    fontWeight: 700,
  },
  statValueGreen: {
    fontSize: 8,
    fontWeight: 700,
    color: COLORS.accent,
  },
  statValueRed: {
    fontSize: 8,
    fontWeight: 700,
    color: COLORS.danger,
  },
  statValueAmber: {
    fontSize: 8,
    fontWeight: 700,
    color: COLORS.warning,
  },
  statFirmaCount: {
    fontSize: 7,
    color: COLORS.textLight,
    marginTop: 2,
    textAlign: 'center',
  },
  tableContainer: {
    marginTop: 10,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 6,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  tableHeaderCell: {
    fontSize: 8,
    fontWeight: 700,
    color: COLORS.white,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    alignItems: 'center',
  },
  tableRowAlternate: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.background,
    alignItems: 'center',
  },
  tableRowLast: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  tableCell: {
    fontSize: 8,
    color: COLORS.text,
  },
  tableCellBold: {
    fontSize: 8,
    fontWeight: 700,
    color: COLORS.primary,
  },
  tableCellPrice: {
    fontSize: 8,
    fontWeight: 700,
    color: COLORS.accent,
    textAlign: 'right',
  },
  tableCellPriceHigh: {
    fontSize: 8,
    fontWeight: 700,
    color: COLORS.danger,
    textAlign: 'right',
  },
  statusBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 10,
    textAlign: 'center',
  },
  statusText: {
    fontSize: 7,
    fontWeight: 600,
  },
  tag: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
    marginLeft: 4,
  },
  tagCheap: {
    backgroundColor: '#dcfce7',
  },
  tagExpensive: {
    backgroundColor: '#fee2e2',
  },
  tagText: {
    fontSize: 6,
    fontWeight: 700,
  },
  tagTextCheap: {
    color: '#16a34a',
  },
  tagTextExpensive: {
    color: '#dc2626',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    borderTop: `1px solid ${COLORS.border}`,
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 7,
    color: COLORS.textLight,
  },
  footerBold: {
    fontWeight: 500,
    color: COLORS.primary,
  },
  watermark: {
    position: 'absolute',
    top: '40%',
    left: '25%',
    fontSize: 60,
    color: '#f1f5f9',
    transform: 'rotate(-30deg)',
    opacity: 0.3,
  },
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
  urunIstatistikleri,
  toplamFiyat,
  ortalamaFiyat,
  minFiyat,
  maxFiyat
}) => {
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

  const formatDateShort = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const getStatusStyle = (status) => {
    switch(status) {
      case 'approved': return { bg: '#dcfce7', color: '#16a34a', text: 'Aktif' }
      case 'pending': return { bg: '#fef9c3', color: '#ca8a04', text: 'Beklemede' }
      default: return { bg: '#fee2e2', color: '#dc2626', text: 'Pasif' }
    }
  }

  const colWidths = {
    no: '6%',
    product: '20%',
    brand: '12%',
    company: '16%',
    category: '12%',
    price: '14%',
    status: '10%',
    tags: '10%',
  }

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <Text style={pdfStyles.watermark}>RAPOR</Text>

        <View style={pdfStyles.header}>
          <View style={pdfStyles.headerLeft}>
            {logoUrl && <Image src={logoUrl} style={pdfStyles.companyLogo} />}
            <Text style={pdfStyles.companyName}>{firmaBilgileri?.ad || 'TermoEnerji'}</Text>
            {firmaBilgileri?.adres && <Text style={pdfStyles.companySub}>{firmaBilgileri.adres}</Text>}
            {firmaBilgileri?.telefon && <Text style={pdfStyles.companySub}>📞 {firmaBilgileri.telefon}</Text>}
            {firmaBilgileri?.email && <Text style={pdfStyles.companySub}>✉️ {firmaBilgileri.email}</Text>}
          </View>
          <View style={pdfStyles.headerRight}>
            <View style={pdfStyles.reportBadge}>
              <Text style={pdfStyles.reportBadgeText}>FİYAT RAPORU</Text>
            </View>
            <Text style={pdfStyles.dateText}>📅 Oluşturma: {formatDate(new Date())}</Text>
            <Text style={pdfStyles.dateText}>💰 Para Birimi: {paraBirimi}</Text>
            <Text style={pdfStyles.dateText}>📊 Toplam: {data.length} kayıt</Text>
          </View>
        </View>

        <View style={pdfStyles.summaryContainer}>
          <View style={pdfStyles.summaryGrid}>
            <View style={pdfStyles.summaryItem}>
              <Text style={pdfStyles.summaryLabel}>Toplam Kayıt</Text>
              <Text style={pdfStyles.summaryValue}>{data.length}</Text>
            </View>
            <View style={pdfStyles.summaryItem}>
              <Text style={pdfStyles.summaryLabel}>Toplam Fiyat</Text>
              <Text style={pdfStyles.summaryValueGreen}>{formatPrice(toplamFiyat, paraBirimi)}</Text>
            </View>
            <View style={pdfStyles.summaryItem}>
              <Text style={pdfStyles.summaryLabel}>Ortalama Fiyat</Text>
              <Text style={pdfStyles.summaryValue}>{formatPrice(ortalamaFiyat, paraBirimi)}</Text>
            </View>
            <View style={pdfStyles.summaryItem}>
              <Text style={pdfStyles.summaryLabel}>Fiyat Aralığı</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 }}>
                <Text style={pdfStyles.summaryValueGreen}>{formatPrice(minFiyat, paraBirimi)}</Text>
                <Text style={pdfStyles.summaryValueRed}>{formatPrice(maxFiyat, paraBirimi)}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={pdfStyles.filterContainer}>
          <View style={pdfStyles.filterTag}>
            <Text style={pdfStyles.filterTagText}>
              🔍 <Text style={pdfStyles.filterTagBold}>{baslik || 'Tümü'}</Text>
            </Text>
          </View>
          <View style={pdfStyles.filterTag}>
            <Text style={pdfStyles.filterTagText}>
              📂 <Text style={pdfStyles.filterTagBold}>{kategori || 'Tüm Kategoriler'}</Text>
            </Text>
          </View>
          <View style={pdfStyles.filterTag}>
            <Text style={pdfStyles.filterTagText}>
              🏢 <Text style={pdfStyles.filterTagBold}>{firma || 'Tüm Firmalar'}</Text>
            </Text>
          </View>
        </View>

        {urunIstatistikleri && urunIstatistikleri.length > 0 && (
          <View style={pdfStyles.statsContainer}>
            <Text style={pdfStyles.statsTitle}>📊 Ürün Bazlı Fiyat Analizi</Text>
            <View style={pdfStyles.statsGrid}>
              {urunIstatistikleri.slice(0, 8).map((urun, index) => (
                <View key={index} style={pdfStyles.statCard}>
                  <Text style={pdfStyles.statProductName} numberOfLines={1}>{urun.urunAdi}</Text>
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

        <View style={pdfStyles.tableContainer}>
          <View style={pdfStyles.tableHeader}>
            <Text style={[pdfStyles.tableHeaderCell, { width: colWidths.no, textAlign: 'center' }]}>#</Text>
            <Text style={[pdfStyles.tableHeaderCell, { width: colWidths.product }]}>Ürün</Text>
            <Text style={[pdfStyles.tableHeaderCell, { width: colWidths.brand }]}>Marka</Text>
            <Text style={[pdfStyles.tableHeaderCell, { width: colWidths.company }]}>Firma</Text>
            <Text style={[pdfStyles.tableHeaderCell, { width: colWidths.category }]}>Kategori</Text>
            <Text style={[pdfStyles.tableHeaderCell, { width: colWidths.price, textAlign: 'right' }]}>Fiyat</Text>
            <Text style={[pdfStyles.tableHeaderCell, { width: colWidths.status, textAlign: 'center' }]}>Durum</Text>
            <Text style={[pdfStyles.tableHeaderCell, { width: colWidths.tags, textAlign: 'center' }]}>Etiket</Text>
          </View>
          
          {data.slice(0, 20).map((item, index) => {
            const isLast = index === data.length - 1 || index === 19
            const statusInfo = getStatusStyle(item.durum)
            const etiket = item._etiket || null
            
            return (
              <View key={index} style={[
                isLast ? pdfStyles.tableRowLast : (index % 2 === 0 ? pdfStyles.tableRow : pdfStyles.tableRowAlternate)
              ]}>
                <Text style={[pdfStyles.tableCell, { width: colWidths.no, textAlign: 'center' }]}>{index + 1}</Text>
                <Text style={[pdfStyles.tableCellBold, { width: colWidths.product }]}>{item.urun_adi}</Text>
                <Text style={[pdfStyles.tableCell, { width: colWidths.brand }]}>{item.marka || '-'}</Text>
                <Text style={[pdfStyles.tableCell, { width: colWidths.company }]}>{item.firma_adi}</Text>
                <Text style={[pdfStyles.tableCell, { width: colWidths.category }]}>{item.kategori || 'Genel'}</Text>
                <Text style={[
                  etiket === 'ucuz' ? pdfStyles.tableCellPrice : 
                  etiket === 'pahali' ? pdfStyles.tableCellPriceHigh : 
                  pdfStyles.tableCellPrice,
                  { width: colWidths.price }
                ]}>
                  {formatPrice(item._convertedPrice || item.fiyat, paraBirimi)}
                </Text>
                <View style={{ width: colWidths.status, alignItems: 'center' }}>
                  <View style={[pdfStyles.statusBadge, { backgroundColor: statusInfo.bg }]}>
                    <Text style={[pdfStyles.statusText, { color: statusInfo.color }]}>{statusInfo.text}</Text>
                  </View>
                </View>
                <View style={{ width: colWidths.tags, alignItems: 'center' }}>
                  {etiket === 'ucuz' && (
                    <View style={[pdfStyles.tag, pdfStyles.tagCheap]}>
                      <Text style={[pdfStyles.tagText, pdfStyles.tagTextCheap]}>⭐ En Ucuz</Text>
                    </View>
                  )}
                  {etiket === 'pahali' && (
                    <View style={[pdfStyles.tag, pdfStyles.tagExpensive]}>
                      <Text style={[pdfStyles.tagText, pdfStyles.tagTextExpensive]}>⚠️ En Pahalı</Text>
                    </View>
                  )}
                  {!etiket && <Text style={{ fontSize: 6, color: COLORS.textLight }}>-</Text>}
                </View>
              </View>
            )
          })}
        </View>

        {data.length > 20 && (
          <View style={{ marginTop: 8, alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 7, color: COLORS.textLight, fontStyle: 'italic' }}>
              * {data.length - 20} kayıt daha gösterilmemiştir
            </Text>
          </View>
        )}

        <View style={pdfStyles.footer} fixed>
          <View>
            <Text style={pdfStyles.footerText}>
              © {new Date().getFullYear()} <Text style={pdfStyles.footerBold}>{firmaBilgileri?.ad || 'TermoEnerji'}</Text>
            </Text>
            <Text style={[pdfStyles.footerText, { marginTop: 2 }]}>Tüm hakları saklıdır.</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={pdfStyles.footerText}>
              Rapor No: <Text style={pdfStyles.footerBold}>#{new Date().getTime().toString().slice(-8)}</Text>
            </Text>
            <Text style={[pdfStyles.footerText, { marginTop: 2 }]}>{formatDate(new Date())}</Text>
          </View>
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
  const [toplamFiyat, setToplamFiyat] = useState(0)
  const [ortalamaFiyat, setOrtalamaFiyat] = useState(0)
  const [minFiyat, setMinFiyat] = useState(0)
  const [maxFiyat, setMaxFiyat] = useState(0)

  // ============================================================
  // VERİLERİ ÇEKEN useEffect'ler
  // ============================================================
  
  // 1. Fiyat verilerini ve diğer verileri çek
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        // Fiyat verilerini çek
        const { data: fiyatData, error: fiyatError } = await supabase
          .from('fiyat_teklifleri')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (fiyatError) {
          console.error('Fiyat verisi çekme hatası:', fiyatError)
        } else {
          setFiyatlar(fiyatData || [])
          setFilteredFiyatlar(fiyatData || [])
        }

        // Firmaları çek
        const { data: firmalarData, error: firmalarError } = await supabase
          .from('firmalar')
          .select('ad')
        
        if (!firmalarError) {
          setFirmalar(firmalarData || [])
        }

        // Kategorileri çek
        const { data: kategoriData, error: kategoriError } = await supabase
          .from('kategoriler')
          .select('ad')
        
        if (!kategoriError) {
          setKategoriler(kategoriData || [])
        }

        // Firma bilgilerini çek
        const { data: firmaData, error: firmaError } = await supabase
          .from('firma_bilgileri')
          .select('*')
          .maybeSingle()
        
        if (!firmaError && firmaData) {
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

  // 2. Kurları çek
  useEffect(() => {
    const loadKurlar = async () => {
      try {
        const k = await getKurlar()
        setKurlar(k)
      } catch (error) {
        console.error('Kur çekme hatası:', error)
      }
    }
    loadKurlar()
    
    const unsubscribe = kurDegistiginde((yeniKurlar) => {
      setKurlar(yeniKurlar)
    })
    
    return () => unsubscribe()
  }, [])

  // 3. Filtreleme ve istatistik hesaplama
  useEffect(() => {
    // Filtrele
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

    // Fiyat istatistikleri
    const fiyatlarTL = filtered.map(item => {
      const fiyat = parseFloat(item.fiyat)
      const paraBirimi = item.para_birimi || 'TRY'
      return convertPrice(fiyat, paraBirimi, 'TRY', kurlar)
    })
    
    if (fiyatlarTL.length > 0) {
      const toplam = fiyatlarTL.reduce((a, b) => a + b, 0)
      const ortalama = toplam / fiyatlarTL.length
      const min = Math.min(...fiyatlarTL)
      const max = Math.max(...fiyatlarTL)
      
      setToplamFiyat(convertPrice(toplam, 'TRY', gorunenParaBirimi, kurlar))
      setOrtalamaFiyat(convertPrice(ortalama, 'TRY', gorunenParaBirimi, kurlar))
      setMinFiyat(convertPrice(min, 'TRY', gorunenParaBirimi, kurlar))
      setMaxFiyat(convertPrice(max, 'TRY', gorunenParaBirimi, kurlar))
    } else {
      setToplamFiyat(0)
      setOrtalamaFiyat(0)
      setMinFiyat(0)
      setMaxFiyat(0)
    }
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
    if (urunItems.length === 0) return null
    
    const tlFiyatlar = urunItems.map(i => {
      const fiyat = parseFloat(i.fiyat)
      const paraBirimi = i.para_birimi || 'TRY'
      return convertPrice(fiyat, paraBirimi, 'TRY', kurlar)
    })
    
    const minFiyat = Math.min(...tlFiyatlar)
    const maxFiyat = Math.max(...tlFiyatlar)
    const mevcutTL = convertPrice(parseFloat(item.fiyat), item.para_birimi || 'TRY', 'TRY', kurlar)
    
    if (mevcutTL === minFiyat && tlFiyatlar.length > 1) return 'ucuz'
    if (mevcutTL === maxFiyat && tlFiyatlar.length > 1) return 'pahali'
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

  // PDF için verileri hazırla
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
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">📊 Fiyat Raporlama</h1>
            <p className="text-slate-400 text-sm">
              {filteredFiyatlar.length} kayıt gösteriliyor
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-slate-800/50 rounded-lg p-1 border border-slate-700">
              <button 
                onClick={() => setGorunenParaBirimi('TRY')} 
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  gorunenParaBirimi === 'TRY' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                ₺ TL
              </button>
              <button 
                onClick={() => setGorunenParaBirimi('USD')} 
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  gorunenParaBirimi === 'USD' ? 'bg-blue-500/20 text-blue-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                $ USD
              </button>
              <button 
                onClick={() => setGorunenParaBirimi('EUR')} 
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  gorunenParaBirimi === 'EUR' ? 'bg-purple-500/20 text-purple-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                € EUR              </button>
            </div>
          </div>
        </div>

        {/* Filtreler */}
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
              <span className="text-xs text-slate-400">
                {seciliIds.length} seçili
              </span>
              {seciliIds.length > 0 && (
                <button 
                  onClick={() => setSeciliIds([])} 
                  className="text-xs text-red-400 hover:text-red-300 transition"
                >
                  Temizle
                </button>
              )}
            </div>
          </div>
        </div>

        {/* İstatistikler */}
        {filteredFiyatlar.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
            <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/50">
              <p className="text-xs text-slate-400">Toplam Kayıt</p>
              <p className="text-lg font-bold text-white">{filteredFiyatlar.length}</p>
            </div>
            <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/50">
              <p className="text-xs text-slate-400">Toplam Fiyat</p>
              <p className="text-lg font-bold text-emerald-400">
                {formatPrice(toplamFiyat, gorunenParaBirimi)}
              </p>
            </div>
            <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/50">
              <p className="text-xs text-slate-400">Ortalama Fiyat</p>
              <p className="text-lg font-bold text-white">
                {formatPrice(ortalamaFiyat, gorunenParaBirimi)}
              </p>
            </div>
            <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/50">
              <p className="text-xs text-slate-400">Fiyat Aralığı</p>
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-emerald-400">
                  {formatPrice(minFiyat, gorunenParaBirimi)}
                </span>
                <span className="text-xs text-slate-500">-</span>
                <span className="text-sm font-bold text-red-400">
                  {formatPrice(maxFiyat, gorunenParaBirimi)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Ürün İstatistikleri */}
        {urunIstatistikleri.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-white mb-2">📊 Ürün Bazlı Fiyat Analizi</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {urunIstatistikleri.slice(0, 4).map((urun, index) => (
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

        {/* PDF İndirme Butonu */}
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
                  toplamFiyat={toplamFiyat}
                  ortalamaFiyat={ortalamaFiyat}
                  minFiyat={minFiyat}
                  maxFiyat={maxFiyat}
                />
              } 
              fileName={`Fiyat_Raporu_${new Date().toISOString().split('T')[0]}.pdf`}
            >
              {({ loading }) => (
                <button 
                  disabled={loading} 
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 py-2 rounded-lg transition disabled:opacity-50 flex items-center gap-2 font-medium"
                >
                  {loading ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      PDF Oluşturuluyor...
                    </>
                  ) : (
                    <>
                      📄 PDF Rapor İndir ({seciliIds.length} kayıt)
                    </>
                  )}
                </button>
              )}
            </PDFDownloadLink>
          </div>
        )}

        {/* Tablo */}
        {loading ? (
          <div className="text-center py-8">
            <p className="text-slate-400">⏳ Yükleniyor...</p>
          </div>
        ) : filteredFiyatlar.length === 0 ? (
          <div className="text-center py-8 bg-slate-800/50 rounded-xl border border-slate-700">
            <p className="text-slate-400">📭 Henüz fiyat kaydı bulunmuyor</p>
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
                  <th className="text-center py-2 px-3 text-slate-400 font-medium text-xs hidden sm:table-cell">Durum</th>
                  <th className="text-center py-2 px-3 text-slate-400 font-medium text-xs hidden xl:table-cell">Etiket</th>
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
                          <span className="ml-1 text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full">⭐ En Ucuz</span>
                        )}
                        {etiket === 'pahali' && (
                          <span className="ml-1 text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full">⚠️ En Pahalı</span>
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
                      <td className="py-2 px-3 text-center hidden sm:table-cell">
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
                      <td className="py-2 px-3 text-center hidden xl:table-cell">
                        {etiket === 'ucuz' && (
                          <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full">⭐</span>
                        )}
                        {etiket === 'pahali' && (
                          <span className="text-[9px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full">⚠️</span>
                        )}
                        {!etiket && <span className="text-xs text-slate-500">-</span>}
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
