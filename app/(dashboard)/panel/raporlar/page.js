'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../../lib/supabase'
import { convertPrice, formatPrice, getKurlar, kurDegistiginde } from '../../../../lib/currency'
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'
import { X, TrendingUp, Building2, ChevronRight, BarChart3, Download, RefreshCw, ArrowUpDown, AlertCircle } from 'lucide-react'

// ============================================================
// PDF STILLERI (FONT HATASI ÇÖZÜLDÜ - STANDART FONT)
// ============================================================
const pdfStyles = StyleSheet.create({
  page: {
    padding: 20,
    backgroundColor: '#ffffff',
  },
  topAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: '#10b981',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    borderBottomStyle: 'solid',
    paddingBottom: 15,
    marginBottom: 20,
    marginTop: 10,
  },
  headerLeft: { width: '60%', paddingRight: 10 },
  logo: { width: 120, height: 40, objectFit: 'contain', marginBottom: 10 },
  companyTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  companyAddress: { fontSize: 9, color: '#475569', marginBottom: 2 },
  headerRight: { width: '40%', alignItems: 'flex-end' },
  reportMainTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 8,
  },
  reportDateContainer: {
    backgroundColor: '#f8fafc',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderStyle: 'solid',
    alignItems: 'flex-end',
  },
  reportDateLabel: { fontSize: 7, color: '#64748b', marginBottom: 2, fontWeight: 'bold' },
  reportDate: { fontSize: 9, fontWeight: 'bold', color: '#0f172a' },
  summaryBox: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  summaryItem: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderLeftWidth: 3,
    borderLeftColor: '#10b981',
    borderLeftStyle: 'solid',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    borderRightWidth: 1,
    borderRightColor: '#f1f5f9',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    borderRadius: 4,
    padding: 10,
    marginRight: 10,
  },
  summaryItemLast: {
    marginRight: 0,
  },
  summaryLabel: { fontSize: 7, color: '#64748b', textTransform: 'uppercase', marginBottom: 4, fontWeight: 'bold' },
  summaryValue: { fontSize: 12, fontWeight: 'bold', color: '#0f172a' },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0f172a',
    backgroundColor: '#f1f5f9',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#0f172a',
    borderLeftStyle: 'solid',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  statCard: {
    width: '18.8%', 
    marginRight: '1.5%',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderStyle: 'solid',
    borderRadius: 4,
    padding: 6,
    marginBottom: 10,
  },
  statCardLastInRow: {
    marginRight: 0, 
  },
  statProductName: {
    fontSize: 7.5,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 6,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    borderBottomStyle: 'solid',
  },
  statSection: {
    marginBottom: 5,
  },
  statLabel: { fontSize: 5.5, color: '#64748b', marginBottom: 2, textTransform: 'uppercase' },
  statCompanyText: { fontSize: 5.5, color: '#334155', marginTop: 2 },
  statValueMinContainer: { backgroundColor: '#d1fae5', paddingVertical: 2, paddingHorizontal: 4, borderRadius: 2, alignSelf: 'flex-start' },
  statValueMinText: { fontSize: 7, fontWeight: 'bold', color: '#059669' },
  statValueMaxContainer: { backgroundColor: '#fee2e2', paddingVertical: 2, paddingHorizontal: 4, borderRadius: 2, alignSelf: 'flex-start' },
  statValueMaxText: { fontSize: 7, fontWeight: 'bold', color: '#dc2626' },
  statDiffSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    borderTopStyle: 'dashed',
  },
  statValueDiffLabel: { fontSize: 5.5, color: '#64748b', textTransform: 'uppercase' },
  statValueDiff: { fontSize: 6.5, fontWeight: 'bold', color: '#d97706' },
  table: { width: '100%', marginBottom: 20, marginTop: 10 },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    borderBottomStyle: 'solid',
    alignItems: 'center',
  },
  tableRowStriped: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    borderBottomStyle: 'solid',
    alignItems: 'center',
  },
  col1: { width: '5%' },
  col2: { width: '35%', paddingRight: 5 },
  col3: { width: '15%', paddingRight: 5 },
  col4: { width: '25%', paddingRight: 5 },
  col5: { width: '20%', alignItems: 'flex-end' },
  tableHeaderCell: { fontSize: 7, fontWeight: 'bold', color: '#ffffff' },
  tableCell: { fontSize: 8, color: '#334155' },
  tableCellBold: { fontSize: 8, fontWeight: 'bold', color: '#0f172a' },
  tagMinContainer: { backgroundColor: '#d1fae5', paddingVertical: 3, paddingHorizontal: 6, borderRadius: 3 },
  tagMinText: { fontSize: 8, fontWeight: 'bold', color: '#059669' },
  tagMaxContainer: { backgroundColor: '#fee2e2', paddingVertical: 3, paddingHorizontal: 6, borderRadius: 3 },
  tagMaxText: { fontSize: 8, fontWeight: 'bold', color: '#dc2626' },
  tagNormalText: { fontSize: 8, fontWeight: 'bold', color: '#0f172a', paddingVertical: 3, paddingHorizontal: 6 },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    borderTopStyle: 'solid',
    paddingTop: 10,
  },
  footerText: { fontSize: 7, color: '#94a3b8' },
  footerPageNumber: { fontSize: 7, fontWeight: 'bold', color: '#64748b' },
})

// ============================================================
// PDF BİLEŞENİ
// ============================================================
const RaporPDF = ({ data, firmaBilgileri, logoUrl, paraBirimi, seciliIstatistikler }) => {
  const formatPriceForPDF = (price, currency = 'TRY') => {
    if (price === null || price === undefined) return '-'
    const safeCurrencyCode = currency === 'TRY' ? 'TL' : currency
    const formattedAmount = new Intl.NumberFormat('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price)
    return `${formattedAmount} ${safeCurrencyCode}`
  }

  const formatDate = (date) => {
    if (!date) return '-'
    const d = new Date(date)
    return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getFullYear()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
  }

  const hasValidLogo = logoUrl && typeof logoUrl === 'string' && logoUrl.startsWith('http')

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <View style={pdfStyles.topAccent} fixed />
        
        <View style={pdfStyles.headerContainer} fixed>
          <View style={pdfStyles.headerLeft}>
            {hasValidLogo ? <Image src={logoUrl} style={pdfStyles.logo} /> : null}
            <Text style={pdfStyles.companyTitle}>{firmaBilgileri?.ad ? firmaBilgileri.ad : 'TermoEnerji Sistemleri'}</Text>
            {firmaBilgileri?.adres ? <Text style={pdfStyles.companyAddress}>{firmaBilgileri.adres}</Text> : null}
            {firmaBilgileri?.telefon ? <Text style={pdfStyles.companyAddress}>Tel: {firmaBilgileri.telefon}</Text> : null}
          </View>
          <View style={pdfStyles.headerRight}>
            <Text style={pdfStyles.reportMainTitle}>FIYAT ANALIZI</Text>
            <View style={pdfStyles.reportDateContainer}>
              <Text style={pdfStyles.reportDateLabel}>Olusturulma Tarihi</Text>
              <Text style={pdfStyles.reportDate}>{formatDate(new Date())}</Text>
            </View>
          </View>
        </View>

        <View style={pdfStyles.summaryBox}>
          <View style={pdfStyles.summaryItem}>
            <Text style={pdfStyles.summaryLabel}>Para Birimi</Text>
            <Text style={pdfStyles.summaryValue}>{paraBirimi === 'TRY' ? 'Turk Lirasi (TL)' : paraBirimi}</Text>
          </View>
          <View style={pdfStyles.summaryItem}>
            <Text style={pdfStyles.summaryLabel}>Listelenen Teklif</Text>
            <Text style={pdfStyles.summaryValue}>{data.length} Adet</Text>
          </View>
          <View style={[pdfStyles.summaryItem, pdfStyles.summaryItemLast]}>
            <Text style={pdfStyles.summaryLabel}>Analiz Edilen Urun</Text>
            <Text style={pdfStyles.summaryValue}>{seciliIstatistikler.length} Cesit</Text>
          </View>
        </View>

        {seciliIstatistikler && seciliIstatistikler.length > 0 ? (
          <View wrap={false}>
            <Text style={pdfStyles.sectionTitle}>SECILI URUN ANALIZI</Text>
            <View style={pdfStyles.statsGrid}>
              {seciliIstatistikler.map((urun, index) => {
                const isLastInRow = (index + 1) % 5 === 0;
                return (
                  <View key={index} style={[pdfStyles.statCard, isLastInRow ? pdfStyles.statCardLastInRow : {}]}>
                    <Text style={pdfStyles.statProductName}>{urun.urunAdi}</Text>
                    
                    <View style={pdfStyles.statSection}>
                      <Text style={pdfStyles.statLabel}>EN UYGUN</Text>
                      <View style={pdfStyles.statValueMinContainer}>
                        <Text style={pdfStyles.statValueMinText}>{formatPriceForPDF(urun.enUcuz, paraBirimi)}</Text>
                      </View>
                      <Text style={pdfStyles.statCompanyText}>{urun.enUcuzFirma}</Text>
                    </View>
                    
                    <View style={pdfStyles.statSection}>
                      <Text style={pdfStyles.statLabel}>EN YUKSEK</Text>
                      <View style={pdfStyles.statValueMaxContainer}>
                        <Text style={pdfStyles.statValueMaxText}>{formatPriceForPDF(urun.enPahali, paraBirimi)}</Text>
                      </View>
                      <Text style={pdfStyles.statCompanyText}>{urun.enPahaliFirma}</Text>
                    </View>
                    
                    <View style={pdfStyles.statDiffSection}>
                      <Text style={pdfStyles.statValueDiffLabel}>FARK</Text>
                      <Text style={pdfStyles.statValueDiff}>{formatPriceForPDF(urun.fark, paraBirimi)}</Text>
                    </View>
                  </View>
                )
              })}
            </View>
          </View>
        ) : null}

        <View>
          <Text style={pdfStyles.sectionTitle}>TEDARIKCI TEKLIFLERI</Text>
          <View style={pdfStyles.table}>
            <View style={pdfStyles.tableHeader} fixed>
              <Text style={[pdfStyles.col1, pdfStyles.tableHeaderCell]}>#</Text>
              <Text style={[pdfStyles.col2, pdfStyles.tableHeaderCell]}>URUN</Text>
              <Text style={[pdfStyles.col3, pdfStyles.tableHeaderCell]}>MARKA</Text>
              <Text style={[pdfStyles.col4, pdfStyles.tableHeaderCell]}>FIRMA</Text>
              <Text style={[pdfStyles.col5, pdfStyles.tableHeaderCell, { textAlign: 'right' }]}>FIYAT</Text>
            </View>
            
            {data.map((item, index) => (
              <View key={index} style={index % 2 === 0 ? pdfStyles.tableRow : pdfStyles.tableRowStriped} wrap={false}>
                <Text style={[pdfStyles.col1, pdfStyles.tableCell]}>{index + 1}</Text>
                <Text style={[pdfStyles.col2, pdfStyles.tableCellBold]}>{item.urun_adi}</Text>
                <Text style={[pdfStyles.col3, pdfStyles.tableCell]}>{item.marka ? item.marka : '-'}</Text>
                <Text style={[pdfStyles.col4, pdfStyles.tableCell]}>{item.firma_adi}</Text>
                
                <View style={pdfStyles.col5}>
                  {item._etiket === 'ucuz' ? (
                    <View style={pdfStyles.tagMinContainer}>
                      <Text style={pdfStyles.tagMinText}>{formatPriceForPDF(item._convertedPrice || item.fiyat, paraBirimi)}</Text>
                    </View>
                  ) : item._etiket === 'pahali' ? (
                    <View style={pdfStyles.tagMaxContainer}>
                      <Text style={pdfStyles.tagMaxText}>{formatPriceForPDF(item._convertedPrice || item.fiyat, paraBirimi)}</Text>
                    </View>
                  ) : (
                    <Text style={pdfStyles.tagNormalText}>{formatPriceForPDF(item._convertedPrice || item.fiyat, paraBirimi)}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={pdfStyles.footer} fixed>
          <Text style={pdfStyles.footerText}>© {new Date().getFullYear()} {firmaBilgileri?.ad ? firmaBilgileri.ad : 'TermoEnerji'}</Text>
          <Text style={pdfStyles.footerPageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  )
}

// ============================================================
// DETAY MODALI BİLEŞENİ
// ============================================================
const DetayModal = ({ urun, firmaDetaylari, onClose, gorunenParaBirimi, kurlar }) => {
  useEffect(() => {
    if (!urun) return
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    const oncekiOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = oncekiOverflow
    }
  }, [urun, onClose])

  if (!urun) return null

  const getConvertedPrice = (fiyat, paraBirimi) => {
    const parsedFiyat = parseFloat(String(fiyat).replace(',', '.'))
    if (isNaN(parsedFiyat) || !parsedFiyat) return { original: '-', converted: '-', convertedValue: 0 }
    
    const tlValue = convertPrice(parsedFiyat, paraBirimi, 'TRY', kurlar)
    const converted = convertPrice(tlValue, 'TRY', gorunenParaBirimi, kurlar)
    
    return {
      original: formatPrice(parsedFiyat, paraBirimi),
      converted: formatPrice(converted, gorunenParaBirimi),
      convertedValue: converted
    }
  }

  const sortedFiyatlar = [...firmaDetaylari].map(item => ({
    ...item,
    _converted: getConvertedPrice(item.fiyat, item.para_birimi || 'TRY')
  })).sort((a, b) => a._converted.convertedValue - b._converted.convertedValue)

  const enUcuz = sortedFiyatlar[0]
  const enPahali = sortedFiyatlar[sortedFiyatlar.length - 1]
  const fark = (enPahali?._converted?.convertedValue || 0) - (enUcuz?._converted?.convertedValue || 0)

  const formatPriceDisplay = (price, currency = 'TRY') => {
    if (price === null || price === undefined) return '-'
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency
    }).format(price)
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={urun.urunAdi} onClick={(e) => e.stopPropagation()} className="bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-700/50 shadow-2xl">
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50 p-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-emerald-400" />
              {urun.urunAdi}
            </h2>
            <p className="text-sm text-slate-400">{firmaDetaylari.length} firma tarafından teklif verilmiş</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg transition text-slate-400 hover:text-white">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
              <p className="text-xs text-slate-400">Toplam Teklif</p>
              <p className="text-2xl font-bold text-white">{firmaDetaylari.length}</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 border border-emerald-500/30">
              <p className="text-xs text-slate-400">💚 En Ucuz</p>
              <p className="text-2xl font-bold text-emerald-400">{enUcuz?._converted?.converted || '-'}</p>
              <p className="text-xs text-slate-400">{enUcuz?.firma_adi}</p>
              <p className="text-xs text-slate-500">Orijinal: {enUcuz?._converted?.original || '-'}</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 border border-red-500/30">
              <p className="text-xs text-slate-400">❤️ En Pahalı</p>
              <p className="text-2xl font-bold text-red-400">{enPahali?._converted?.converted || '-'}</p>
              <p className="text-xs text-slate-400">{enPahali?.firma_adi}</p>
              <p className="text-xs text-slate-500">Orijinal: {enPahali?._converted?.original || '-'}</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 border border-amber-500/30">
              <p className="text-xs text-slate-400">💰 Fiyat Farkı</p>
              <p className="text-2xl font-bold text-amber-400">{formatPriceDisplay(fark, gorunenParaBirimi)}</p>
              <p className="text-xs text-slate-400">En yüksek - En düşük</p>
            </div>
          </div>

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
                    <th className="text-right py-3 px-4 text-slate-400 font-medium hidden md:table-cell">Orijinal Fiyat</th>
                    <th className="text-center py-3 px-4 text-slate-400 font-medium">Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedFiyatlar.map((item, index) => {
                    const isEnUcuz = item._converted.convertedValue === enUcuz?._converted?.convertedValue
                    const isEnPahali = item._converted.convertedValue === enPahali?._converted?.convertedValue
                    return (
                      <tr key={item.id} className="border-b border-slate-700/50 hover:bg-slate-800/30 transition">
                        <td className="py-3 px-4 text-slate-500 text-xs">{index + 1}</td>
                        <td className="py-3 px-4 text-white font-medium">
                          {item.firma_adi}
                          {isEnUcuz && <span className="ml-2 text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">En Ucuz</span>}
                          {isEnPahali && <span className="ml-2 text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">En Pahalı</span>}
                        </td>
                        <td className="py-3 px-4 text-slate-400 hidden md:table-cell">{item.marka || '-'}</td>
                        <td className={`py-3 px-4 font-bold text-right ${isEnUcuz ? 'text-emerald-400' : isEnPahali ? 'text-red-400' : 'text-white'}`}>
                          {item._converted.converted}
                        </td>
                        <td className="py-3 px-4 text-slate-400 text-xs text-right hidden md:table-cell">
                          {item._converted.original}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`text-xs px-2 py-1 rounded-full ${item.durum === 'approved' ? 'bg-emerald-500/20 text-emerald-400' : item.durum === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                            {item.durum === 'approved' ? '✅ Onaylandı' : item.durum === 'pending' ? '⏳ Beklemede' : '❌ Reddedildi'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

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
                  <div key={item.id} className="flex items-center gap-4 mb-2">
                    <span className="text-xs text-slate-400 w-24 truncate">{item.firma_adi}</span>
                    <div className="flex-1 h-6 bg-slate-700/30 rounded-lg overflow-hidden">
                      <div className={`h-full rounded-lg transition-all duration-500 ${isEnUcuz ? 'bg-emerald-500' : isEnPahali ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${Math.max(yuzde, 5)}%` }} />
                    </div>
                    <span className={`text-xs font-bold w-20 text-right ${isEnUcuz ? 'text-emerald-400' : isEnPahali ? 'text-red-400' : 'text-white'}`}>
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
}

// ============================================================
// ANA SAYFA
// ============================================================
export default function RaporlarPage() {
  const router = useRouter()
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

  // ✅ SADECE OTURUM KONTROLÜ EKLENDİ
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

  // ===== useMemo'lar AYNI =====
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

  // ✅ SADECE OTURUM KONTROLÜ EKLENDİ - Loading
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

  const toggleSecim = (id) => {
    setSeciliIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
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

  const handleDetayAc = (urun) => {
    const firmaDetaylari = filteredFiyatlar.filter(item => item.urun_adi === urun.urunAdi)
    setDetayUrun(urun)
    setDetayFirmaDetaylari(firmaDetaylari)
    setDetayModalAcik(true)
  }

  const siralamaDegistir = (alan) => {
    setSiralama(prev => {
      if (prev.alan === alan) {
        return { alan, yon: prev.yon === 'asc' ? 'desc' : 'asc' }
      }
      return { alan, yon: 'asc' }
    })
  }

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

  const toplamSayfa = Math.max(1, Math.ceil(sortedFiltered.length / SAYFA_BOYUTU))
  const sayfalanmisVeri = sortedFiltered.slice((sayfa - 1) * SAYFA_BOYUTU, sayfa * SAYFA_BOYUTU)

  const csvIndir = () => {
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
  }

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
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
          <div className="flex items-center bg-slate-900/80 p-1 rounded-xl border border-slate-700/50 backdrop-blur-sm">
            {['TRY', 'USD', 'EUR'].map((currency) => (
              <button key={currency} onClick={() => setGorunenParaBirimi(currency)} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${gorunenParaBirimi === currency ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}>
                {currency}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={loadData} className="text-xs font-medium bg-red-500/20 hover:bg-red-500/30 text-red-300 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 flex-shrink-0">
              <RefreshCw className="h-3 w-3" /> Tekrar Dene
            </button>
          </div>
        )}

        <div className="bg-slate-900/40 rounded-2xl p-5 border border-slate-700/50 backdrop-blur-sm shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <svg className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input type="text" value={arama} onChange={(e) => setArama(e.target.value)} placeholder="Ürün ara..." className="w-full bg-slate-950 border border-slate-700/50 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all" />
            </div>
            <div className="relative">
              <svg className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <select value={filtreKategori} onChange={(e) => setFiltreKategori(e.target.value)} className="w-full bg-slate-950 border border-slate-700/50 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all appearance-none">
                <option value="">Tüm Kategoriler</option>
                {kategoriler.map((k, i) => (<option key={i} value={k.ad}>{k.ad}</option>))}
              </select>
            </div>
            <div className="relative">
              <svg className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <select value={filtreFirma} onChange={(e) => setFiltreFirma(e.target.value)} className="w-full bg-slate-950 border border-slate-700/50 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all appearance-none">
                <option value="">Tüm Firmalar</option>
                {firmalar.map((f, i) => (<option key={i} value={f.ad}>{f.ad}</option>))}
              </select>
            </div>
            <div className="flex items-center justify-between px-2">
              <span className="text-sm text-slate-400"><span className="font-semibold text-white">{seciliIds.length}</span> seçili</span>
              {seciliIds.length > 0 && (<button onClick={() => setSeciliIds([])} className="text-sm text-slate-400 hover:text-red-400 transition-colors flex items-center gap-1"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>Temizle</button>)}
            </div>
          </div>
        </div>

        {urunIstatistikleri.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Genel Fiyat Analizi (Filtrelenenler)
              <span className="text-xs text-slate-500 font-normal">(Kartlara tıklayarak detayları görün)</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {urunIstatistikleri.map((urun, index) => (
                <div key={index} onClick={() => handleDetayAc(urun)} className="bg-slate-900/40 rounded-xl p-3 border border-slate-700/50 shadow-sm hover:border-emerald-500/50 hover:shadow-emerald-500/10 hover:shadow-lg transition-all duration-300 cursor-pointer group">
                  <div className="flex items-start justify-between">
                    <p className="text-sm font-semibold text-white truncate flex-1" title={urun.urunAdi}>{urun.urunAdi}</p>
                    <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all duration-300 flex-shrink-0 ml-1" />
                  </div>
                  
                  <div className="space-y-1.5 mt-2">
                    <div className="flex justify-between items-center bg-slate-950/50 p-1.5 rounded-lg border border-emerald-500/10">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-slate-400 uppercase tracking-wider">En Uygun</span>
                        <span className="text-[10px] text-slate-300 truncate max-w-[80px]" title={urun.enUcuzFirma}>{urun.enUcuzFirma}</span>
                      </div>
                      <span className="text-xs text-emerald-400 font-bold">{formatPrice(urun.enUcuz, gorunenParaBirimi)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center bg-slate-950/50 p-1.5 rounded-lg border border-red-500/10">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-slate-400 uppercase tracking-wider">En Yüksek</span>
                        <span className="text-[10px] text-slate-300 truncate max-w-[80px]" title={urun.enPahaliFirma}>{urun.enPahaliFirma}</span>
                      </div>
                      <span className="text-xs text-red-400 font-bold">{formatPrice(urun.enPahali, gorunenParaBirimi)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-2.5 pt-2.5 border-t border-slate-700/50">
                    <span className="text-[10px] text-amber-400/90 font-medium">Fark: {formatPrice(urun.fark, gorunenParaBirimi)}</span>
                    <span className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded-full">{urun.adet} firma</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-slate-900/40 rounded-2xl border border-slate-700/50 overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-700/50 flex justify-between items-center bg-slate-900/80">
            <h3 className="text-sm font-medium text-slate-300">Fiyat Teklifleri Tablosu</h3>
            <div className="flex items-center gap-2">
            {isClient && filteredFiyatlar.length > 0 && (
              <button onClick={csvIndir} className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl transition-all flex items-center gap-2 text-sm font-medium border border-slate-700/50">
                <Download className="w-4 h-4" />
                CSV İndir
              </button>
            )}
            {isClient && seciliIds.length > 0 && (
              <PDFDownloadLink document={<RaporPDF data={preparedData} firmaBilgileri={firmaBilgileri} logoUrl={logoUrl} paraBirimi={gorunenParaBirimi} seciliIstatistikler={preparedIstatistikler} />} fileName={`Analiz_Raporu_${new Date().toISOString().split('T')[0]}.pdf`}>
                {({ loading: pdfLoading }) => (<button disabled={pdfLoading} className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium shadow-lg shadow-emerald-500/20">{pdfLoading ? (<><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Oluşturuluyor...</>) : (<><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>Seçili Kayıtları İndir ({seciliIds.length})</>)}</button>)}
              </PDFDownloadLink>
            )}
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-4 space-y-4">{[...Array(5)].map((_, i) => (<div key={i} className="animate-pulse flex items-center gap-4"><div className="h-4 w-4 bg-slate-800 rounded"></div><div className="h-10 flex-1 bg-slate-800 rounded-lg"></div></div>))}</div>
            ) : filteredFiyatlar.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4"><svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg></div>
                <h3 className="text-slate-300 font-medium text-lg mb-1">Kayıt Bulunamadı</h3>
                <p className="text-slate-500 text-sm text-center max-w-sm">Arama kriterlerinize veya seçili filtrelere uygun fiyat teklifi bulunmuyor.</p>
              </div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="text-[11px] text-slate-400 uppercase tracking-wider bg-slate-900/50 border-b border-slate-700/50">
                  <tr>
                    <th className="py-3 px-4 w-10"><div className="flex items-center justify-center"><input type="checkbox" onChange={() => { if (seciliIds.length === filteredFiyatlar.length) { setSeciliIds([]) } else { setSeciliIds(filteredFiyatlar.map(item => item.id)) } }} checked={seciliIds.length === filteredFiyatlar.length && filteredFiyatlar.length > 0} className="w-4 h-4 bg-slate-900 border-slate-700 rounded text-emerald-500 focus:ring-emerald-500/50 focus:ring-offset-slate-900 cursor-pointer" /></div></th>
                    <th className="py-3 px-4 font-semibold cursor-pointer select-none hover:text-slate-200 transition-colors" onClick={() => siralamaDegistir('urun_adi')}>
                      <div className="flex items-center gap-1">Ürün Adı <ArrowUpDown className={`h-3 w-3 ${siralama.alan === 'urun_adi' ? 'text-emerald-400' : 'text-slate-600'}`} /></div>
                    </th>
                    <th className="py-3 px-4 font-semibold hidden md:table-cell">Marka</th>
                    <th className="py-3 px-4 font-semibold cursor-pointer select-none hover:text-slate-200 transition-colors" onClick={() => siralamaDegistir('firma_adi')}>
                      <div className="flex items-center gap-1">Firma <ArrowUpDown className={`h-3 w-3 ${siralama.alan === 'firma_adi' ? 'text-emerald-400' : 'text-slate-600'}`} /></div>
                    </th>
                    <th className="py-3 px-4 font-semibold hidden lg:table-cell">Kategori</th>
                    <th className="py-3 px-4 font-semibold text-right cursor-pointer select-none hover:text-slate-200 transition-colors" onClick={() => siralamaDegistir('fiyat')}>
                      <div className="flex items-center justify-end gap-1">Fiyat <ArrowUpDown className={`h-3 w-3 ${siralama.alan === 'fiyat' ? 'text-emerald-400' : 'text-slate-600'}`} /></div>
                    </th>
                    <th className="py-3 px-4 font-semibold text-center">Durum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {sayfalanmisVeri.map((item) => {
                    const isSelected = seciliIds.includes(item.id)
                    const etiket = getUrunEtiketi(item)
                    const fiyatlar = getConvertedPrice(item.fiyat, item.para_birimi)
                    return (
                      <tr key={item.id} onClick={() => toggleSecim(item.id)} className={`group cursor-pointer transition-colors hover:bg-slate-800/40 ${isSelected ? 'bg-emerald-500/5 hover:bg-emerald-500/10' : ''}`}>
                        <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}><div className="flex items-center justify-center"><input type="checkbox" checked={isSelected} onChange={() => toggleSecim(item.id)} className="w-4 h-4 bg-slate-900 border-slate-700 rounded text-emerald-500 focus:ring-emerald-500/50 focus:ring-offset-slate-900 cursor-pointer" /></div></td>
                        <td className="py-3 px-4"><div className="flex flex-col gap-1"><span className="text-slate-200 font-medium">{item.urun_adi}</span>{etiket === 'ucuz' && (<span className="w-fit text-[10px] font-medium bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-500/20">En Ucuz Seçenek</span>)}{etiket === 'pahali' && (<span className="w-fit text-[10px] font-medium bg-red-500/10 text-red-400 px-2 py-0.5 rounded-md border border-red-500/20">En Yüksek Fiyat</span>)}</div></td>
                        <td className="py-3 px-4 text-slate-400 hidden md:table-cell">{item.marka || '-'}</td>
                        <td className="py-3 px-4"><span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/50 text-slate-300 text-xs font-medium border border-slate-700/50 group-hover:border-slate-600/50 transition-colors">{item.firma_adi}</span></td>
                        <td className="py-3 px-4 text-slate-400 hidden lg:table-cell">{item.kategori || '-'}</td>
                        <td className="py-3 px-4 text-right"><div className="flex flex-col items-end gap-0.5"><span className={`text-sm font-bold tracking-tight ${etiket === 'ucuz' ? 'text-emerald-400' : etiket === 'pahali' ? 'text-red-400' : 'text-white'}`}>{fiyatlar.converted}</span><span className="text-[10px] text-slate-500 font-medium">Asıl: {fiyatlar.original}</span></div></td>
                        <td className="py-3 px-4"><div className="flex justify-center"><span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full border ${item.durum === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : item.durum === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}><span className={`w-1.5 h-1.5 rounded-full ${item.durum === 'approved' ? 'bg-emerald-400' : item.durum === 'pending' ? 'bg-amber-400' : 'bg-red-400'}`}></span>{item.durum === 'approved' ? 'Aktif' : item.durum === 'pending' ? 'Beklemede' : 'Pasif'}</span></div></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>

          {!loading && filteredFiyatlar.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-700/50 bg-slate-900/50">
              <span className="text-xs text-slate-400">
                Toplam <span className="text-white font-medium">{sortedFiltered.length}</span> kayıttan{' '}
                <span className="text-white font-medium">{(sayfa - 1) * SAYFA_BOYUTU + 1}-{Math.min(sayfa * SAYFA_BOYUTU, sortedFiltered.length)}</span> arası gösteriliyor
              </span>
              <div className="flex items-center gap-2">
                <button disabled={sayfa === 1} onClick={() => setSayfa(s => Math.max(1, s - 1))} className="px-3 py-1.5 text-xs rounded-lg bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors">
                  Önceki
                </button>
                <span className="text-xs text-slate-400">Sayfa {sayfa} / {toplamSayfa}</span>
                <button disabled={sayfa === toplamSayfa} onClick={() => setSayfa(s => Math.min(toplamSayfa, s + 1))} className="px-3 py-1.5 text-xs rounded-lg bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors">
                  Sonraki
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {detayModalAcik && detayUrun && (
        <DetayModal urun={detayUrun} firmaDetaylari={detayFirmaDetaylari} onClose={() => { setDetayModalAcik(false); setDetayUrun(null); setDetayFirmaDetaylari([]) }} gorunenParaBirimi={gorunenParaBirimi} kurlar={kurlar} />
      )}
    </div>
  )
}
