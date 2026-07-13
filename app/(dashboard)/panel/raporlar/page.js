'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { supabase } from '../../../../lib/supabase'
import { convertPrice, formatPrice, getKurlar, kurDegistiginde } from '../../../../lib/currency'
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'
import { X, TrendingUp, Building2, ChevronRight, BarChart3, Download, RefreshCw, ArrowUpDown, AlertCircle, FileText } from 'lucide-react'

// ============================================================
// PDF STILLERI (KURUMSAL VE PROFESYONEL TASARIM)
// ============================================================
const pdfStyles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
  },
  topAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 8,
    backgroundColor: '#059669', // Zümrüt yeşili kurumsal vurgu
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 2,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 20,
    marginBottom: 25,
    marginTop: 15,
  },
  headerLeft: { width: '55%', paddingRight: 15 },
  logo: { width: 140, height: 45, objectFit: 'contain', marginBottom: 12 },
  companyTitle: {
    fontSize: 16,
    fontWeight: 'extrabold',
    color: '#0f172a',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  companyAddress: { fontSize: 9, color: '#64748b', marginBottom: 3, lineHeight: 1.4 },
  headerRight: { width: '45%', alignItems: 'flex-end' },
  reportMainTitle: {
    fontSize: 22,
    fontWeight: 'black',
    color: '#0f172a',
    marginBottom: 10,
    letterSpacing: 1,
  },
  reportMetaBox: {
    backgroundColor: '#f8fafc',
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'flex-end',
    width: '100%',
  },
  reportMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 4,
  },
  reportMetaLabel: { fontSize: 8, color: '#64748b', fontWeight: 'bold' },
  reportMetaValue: { fontSize: 8, color: '#0f172a', fontWeight: 'bold' },
  summaryBox: {
    flexDirection: 'row',
    marginBottom: 25,
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 15,
  },
  summaryItem: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: '#334155',
    paddingHorizontal: 10,
  },
  summaryItemLast: {
    borderRightWidth: 0,
  },
  summaryLabel: { fontSize: 8, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 6, letterSpacing: 0.5 },
  summaryValue: { fontSize: 16, fontWeight: 'bold', color: '#ffffff' },
  sectionTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 5,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0f172a',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  statCard: {
    width: '32%', 
    marginRight: '2%',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
  },
  statCardLastInRow: {
    marginRight: 0, 
  },
  statProductName: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  statSectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  statLabelMin: { fontSize: 7, color: '#059669', fontWeight: 'bold' },
  statLabelMax: { fontSize: 7, color: '#dc2626', fontWeight: 'bold' },
  statCompanyText: { fontSize: 7, color: '#64748b', width: '50%' },
  statPriceText: { fontSize: 8, fontWeight: 'bold', color: '#0f172a', textAlign: 'right', width: '50%' },
  statDiffSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    padding: 6,
    borderRadius: 4,
    marginTop: 4,
  },
  statValueDiffLabel: { fontSize: 7, color: '#64748b', fontWeight: 'bold' },
  statValueDiff: { fontSize: 8, fontWeight: 'bold', color: '#d97706' },
  table: { width: '100%', marginBottom: 30 },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    alignItems: 'center',
  },
  tableRowStriped: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    alignItems: 'center',
  },
  col1: { width: '8%' },
  col2: { width: '37%', paddingRight: 8 },
  col3: { width: '15%', paddingRight: 8 },
  col4: { width: '20%', paddingRight: 8 },
  col5: { width: '20%', alignItems: 'flex-end' },
  tableHeaderCell: { fontSize: 8, fontWeight: 'bold', color: '#ffffff', textTransform: 'uppercase', letterSpacing: 0.5 },
  tableCell: { fontSize: 8, color: '#475569' },
  tableCellBold: { fontSize: 9, fontWeight: 'bold', color: '#0f172a' },
  tagContainer: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 4 },
  tagMin: { backgroundColor: '#d1fae5' },
  tagMax: { backgroundColor: '#fee2e2' },
  tagMinText: { fontSize: 8, fontWeight: 'bold', color: '#059669' },
  tagMaxText: { fontSize: 8, fontWeight: 'bold', color: '#dc2626' },
  tagNormalText: { fontSize: 9, fontWeight: 'bold', color: '#0f172a' },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 15,
  },
  footerText: { fontSize: 8, color: '#94a3b8' },
  footerPageNumber: { fontSize: 8, fontWeight: 'bold', color: '#64748b' },
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
            <Text style={pdfStyles.companyTitle}>{firmaBilgileri?.ad ? firmaBilgileri.ad : 'Mekanik & Tesisat A.S.'}</Text>
            {firmaBilgileri?.adres ? <Text style={pdfStyles.companyAddress}>{firmaBilgileri.adres}</Text> : null}
            {firmaBilgileri?.telefon ? <Text style={pdfStyles.companyAddress}>Tel: {firmaBilgileri.telefon}</Text> : null}
            {firmaBilgileri?.email ? <Text style={pdfStyles.companyAddress}>E-posta: {firmaBilgileri.email}</Text> : null}
          </View>
          <View style={pdfStyles.headerRight}>
            <Text style={pdfStyles.reportMainTitle}>FIYAT ANALIZ RAPORU</Text>
            <View style={pdfStyles.reportMetaBox}>
              <View style={pdfStyles.reportMetaRow}>
                <Text style={pdfStyles.reportMetaLabel}>Rapor Tarihi:</Text>
                <Text style={pdfStyles.reportMetaValue}>{formatDate(new Date())}</Text>
              </View>
              <View style={pdfStyles.reportMetaRow}>
                <Text style={pdfStyles.reportMetaLabel}>Referans Para Birimi:</Text>
                <Text style={pdfStyles.reportMetaValue}>{paraBirimi}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={pdfStyles.summaryBox}>
          <View style={pdfStyles.summaryItem}>
            <Text style={pdfStyles.summaryLabel}>Analiz Edilen Urun</Text>
            <Text style={pdfStyles.summaryValue}>{seciliIstatistikler.length} Kalem</Text>
          </View>
          <View style={pdfStyles.summaryItem}>
            <Text style={pdfStyles.summaryLabel}>Toplam Teklif</Text>
            <Text style={pdfStyles.summaryValue}>{data.length} Adet</Text>
          </View>
          <View style={[pdfStyles.summaryItem, pdfStyles.summaryItemLast]}>
            <Text style={pdfStyles.summaryLabel}>Fiyatlandirma Bazi</Text>
            <Text style={pdfStyles.summaryValue}>{paraBirimi === 'TRY' ? 'Turk Lirasi' : paraBirimi}</Text>
          </View>
        </View>

        {seciliIstatistikler && seciliIstatistikler.length > 0 ? (
          <View wrap={false}>
            <View style={pdfStyles.sectionTitleBox}>
              <Text style={pdfStyles.sectionTitle}>URUN BAZLI MALIYET OZETI</Text>
            </View>
            <View style={pdfStyles.statsGrid}>
              {seciliIstatistikler.map((urun, index) => {
                const isLastInRow = (index + 1) % 3 === 0;
                return (
                  <View key={index} style={[pdfStyles.statCard, isLastInRow ? pdfStyles.statCardLastInRow : {}]}>
                    <Text style={pdfStyles.statProductName}>{urun.urunAdi}</Text>
                    
                    <View style={pdfStyles.statSectionRow}>
                      <Text style={pdfStyles.statCompanyText}>{urun.enUcuzFirma}</Text>
                      <View style={[pdfStyles.tagContainer, pdfStyles.tagMin]}>
                        <Text style={pdfStyles.tagMinText}>{formatPriceForPDF(urun.enUcuz, paraBirimi)}</Text>
                      </View>
                    </View>
                    
                    <View style={pdfStyles.statSectionRow}>
                      <Text style={pdfStyles.statCompanyText}>{urun.enPahaliFirma}</Text>
                      <View style={[pdfStyles.tagContainer, pdfStyles.tagMax]}>
                        <Text style={pdfStyles.tagMaxText}>{formatPriceForPDF(urun.enPahali, paraBirimi)}</Text>
                      </View>
                    </View>
                    
                    <View style={pdfStyles.statDiffSection}>
                      <Text style={pdfStyles.statValueDiffLabel}>Fiyat Farki</Text>
                      <Text style={pdfStyles.statValueDiff}>{formatPriceForPDF(urun.fark, paraBirimi)}</Text>
                    </View>
                  </View>
                )
              })}
            </View>
          </View>
        ) : null}

        <View>
          <View style={pdfStyles.sectionTitleBox}>
            <Text style={pdfStyles.sectionTitle}>DETAYLI TEDARIKCI TEKLIFLERI</Text>
          </View>
          <View style={pdfStyles.table}>
            <View style={pdfStyles.tableHeader} fixed>
              <Text style={[pdfStyles.col1, pdfStyles.tableHeaderCell]}>NO</Text>
              <Text style={[pdfStyles.col2, pdfStyles.tableHeaderCell]}>URUN TANIMI</Text>
              <Text style={[pdfStyles.col3, pdfStyles.tableHeaderCell]}>MARKA</Text>
              <Text style={[pdfStyles.col4, pdfStyles.tableHeaderCell]}>TEDARIKCI FIRMA</Text>
              <Text style={[pdfStyles.col5, pdfStyles.tableHeaderCell, { textAlign: 'right' }]}>BIRIM FIYAT</Text>
            </View>
            
            {data.map((item, index) => (
              <View key={index} style={index % 2 === 0 ? pdfStyles.tableRow : pdfStyles.tableRowStriped} wrap={false}>
                <Text style={[pdfStyles.col1, pdfStyles.tableCell]}>{(index + 1).toString().padStart(2, '0')}</Text>
                <Text style={[pdfStyles.col2, pdfStyles.tableCellBold]}>{item.urun_adi}</Text>
                <Text style={[pdfStyles.col3, pdfStyles.tableCell]}>{item.marka ? item.marka : '-'}</Text>
                <Text style={[pdfStyles.col4, pdfStyles.tableCell]}>{item.firma_adi}</Text>
                
                <View style={pdfStyles.col5}>
                  {item._etiket === 'ucuz' ? (
                    <View style={[pdfStyles.tagContainer, pdfStyles.tagMin]}>
                      <Text style={pdfStyles.tagMinText}>{formatPriceForPDF(item._convertedPrice || item.fiyat, paraBirimi)}</Text>
                    </View>
                  ) : item._etiket === 'pahali' ? (
                    <View style={[pdfStyles.tagContainer, pdfStyles.tagMax]}>
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
          <Text style={pdfStyles.footerText}>Bu rapor sistem tarafindan otomatik uretilmistir. © {new Date().getFullYear()} {firmaBilgileri?.ad || ''}</Text>
          <Text style={pdfStyles.footerPageNumber} render={({ pageNumber, totalPages }) => `Sayfa ${pageNumber} / ${totalPages}`} />
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
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={urun.urunAdi} onClick={(e) => e.stopPropagation()} className="bg-slate-900 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-slate-700/80 shadow-2xl shadow-slate-900/50">
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur-md border-b border-slate-700/80 p-5 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <BarChart3 className="h-6 w-6 text-emerald-400" />
              </div>
              {urun.urunAdi}
            </h2>
            <p className="text-sm text-slate-400 mt-1 ml-11">{firmaDetaylari.length} farklı tedarikçiden teklif alındı</p>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all text-slate-400 hover:text-white border border-slate-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-800/40 rounded-xl p-5 border border-slate-700/50">
              <p className="text-sm font-medium text-slate-400 mb-1">Toplam Teklif</p>
              <p className="text-3xl font-bold text-white">{firmaDetaylari.length}</p>
            </div>
            <div className="bg-emerald-900/20 rounded-xl p-5 border border-emerald-500/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-20"><TrendingUp className="h-12 w-12 text-emerald-500" /></div>
              <p className="text-sm font-medium text-emerald-400/80 mb-1">En Uygun Teklif</p>
              <p className="text-3xl font-bold text-emerald-400">{enUcuz?._converted?.converted || '-'}</p>
              <p className="text-sm text-emerald-300 mt-1 font-medium">{enUcuz?.firma_adi}</p>
              <p className="text-xs text-slate-500 mt-2">Orijinal: {enUcuz?._converted?.original || '-'}</p>
            </div>
            <div className="bg-red-900/20 rounded-xl p-5 border border-red-500/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-20"><TrendingUp className="h-12 w-12 text-red-500 transform rotate-180" /></div>
              <p className="text-sm font-medium text-red-400/80 mb-1">En Yüksek Teklif</p>
              <p className="text-3xl font-bold text-red-400">{enPahali?._converted?.converted || '-'}</p>
              <p className="text-sm text-red-300 mt-1 font-medium">{enPahali?.firma_adi}</p>
              <p className="text-xs text-slate-500 mt-2">Orijinal: {enPahali?._converted?.original || '-'}</p>
            </div>
            <div className="bg-amber-900/20 rounded-xl p-5 border border-amber-500/30">
              <p className="text-sm font-medium text-amber-400/80 mb-1">Fiyat Dalgalanması</p>
              <p className="text-3xl font-bold text-amber-400">{formatPriceDisplay(fark, gorunenParaBirimi)}</p>
              <p className="text-xs text-slate-400 mt-2">Maksimum ve minimum arası fark</p>
            </div>
          </div>

          <div>
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-emerald-400" />
              Tedarikçi Analiz Tablosu
            </h3>
            <div className="overflow-x-auto bg-slate-800/40 rounded-xl border border-slate-700/80 shadow-inner">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700 bg-slate-900/50">
                    <th className="text-left py-4 px-5 text-slate-300 font-semibold uppercase tracking-wider text-xs">#</th>
                    <th className="text-left py-4 px-5 text-slate-300 font-semibold uppercase tracking-wider text-xs">Firma</th>
                    <th className="text-left py-4 px-5 text-slate-300 font-semibold uppercase tracking-wider text-xs hidden md:table-cell">Marka</th>
                    <th className="text-right py-4 px-5 text-slate-300 font-semibold uppercase tracking-wider text-xs">Çevrilmiş Fiyat</th>
                    <th className="text-right py-4 px-5 text-slate-300 font-semibold uppercase tracking-wider text-xs hidden md:table-cell">Orijinal Fiyat</th>
                    <th className="text-center py-4 px-5 text-slate-300 font-semibold uppercase tracking-wider text-xs">Durum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {sortedFiyatlar.map((item, index) => {
                    const isEnUcuz = item._converted.convertedValue === enUcuz?._converted?.convertedValue
                    const isEnPahali = item._converted.convertedValue === enPahali?._converted?.convertedValue
                    return (
                      <tr key={item.id} className="hover:bg-slate-700/30 transition-colors">
                        <td className="py-4 px-5 text-slate-400 font-medium">{index + 1}</td>
                        <td className="py-4 px-5 text-white font-semibold">
                          <div className="flex items-center gap-2">
                            {item.firma_adi}
                            {isEnUcuz && <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-md">En Avantajlı</span>}
                            {isEnPahali && <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-md">Yüksek</span>}
                          </div>
                        </td>
                        <td className="py-4 px-5 text-slate-400 hidden md:table-cell">{item.marka || '-'}</td>
                        <td className={`py-4 px-5 font-bold text-right text-base ${isEnUcuz ? 'text-emerald-400' : isEnPahali ? 'text-red-400' : 'text-slate-200'}`}>
                          {item._converted.converted}
                        </td>
                        <td className="py-4 px-5 text-slate-500 text-xs text-right hidden md:table-cell font-medium">
                          {item._converted.original}
                        </td>
                        <td className="py-4 px-5 text-center">
                          <span className={`text-xs font-medium px-3 py-1 rounded-full border ${item.durum === 'approved' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : item.durum === 'pending' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                            {item.durum === 'approved' ? 'Onaylı' : item.durum === 'pending' ? 'İncelemede' : 'Red'}
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
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
              Görsel Fiyat Dağılımı
            </h3>
            <div className="bg-slate-800/40 rounded-xl p-6 border border-slate-700/80">
              {sortedFiyatlar.map((item) => {
                const maxFiyat = sortedFiyatlar[sortedFiyatlar.length - 1]?._converted?.convertedValue || 1
                const yuzde = (item._converted.convertedValue / maxFiyat) * 100
                const isEnUcuz = item._converted.convertedValue === enUcuz?._converted?.convertedValue
                const isEnPahali = item._converted.convertedValue === enPahali?._converted?.convertedValue
                return (
                  <div key={item.id} className="flex items-center gap-4 mb-3 last:mb-0">
                    <span className="text-sm font-medium text-slate-300 w-32 truncate" title={item.firma_adi}>{item.firma_adi}</span>
                    <div className="flex-1 h-8 bg-slate-900 rounded-lg overflow-hidden border border-slate-700/50">
                      <div className={`h-full rounded-lg transition-all duration-700 ease-out flex items-center justify-end pr-3 ${isEnUcuz ? 'bg-emerald-500/80' : isEnPahali ? 'bg-red-500/80' : 'bg-slate-600/80'}`} style={{ width: `${Math.max(yuzde, 5)}%` }}>
                        <span className="text-xs font-bold text-white drop-shadow-md">{item._converted.converted}</span>
                      </div>
                    </div>
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
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

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
    loadData()
  }, [loadData])

  useEffect(() => {
    const kanal = supabase
      .channel('fiyat_teklifleri_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fiyat_teklifleri' }, async () => {
        const { data } = await supabase.from('fiyat_teklifleri').select('*').order('created_at', { ascending: false })
        if (data) setFiyatlar(data)
      })
      .subscribe()
    return () => { supabase.removeChannel(kanal) }
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
        return { ...item, tlFiyat: convertPrice(fiyat, paraBirimi, 'TRY', kurlar) }
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

  useEffect(() => { setSayfa(1) }, [arama, filtreKategori, filtreFirma, siralama])

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
    if (isNaN(parsedFiyat) || !parsedFiyat) return { original: '-', converted: '-', convertedValue: 0 }
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
        return { ...item, tlFiyat: convertPrice(fiyat, paraBirimi, 'TRY', kurlar) }
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
      if (prev.alan === alan) return { alan, yon: prev.yon === 'asc' ? 'desc' : 'asc' }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredFiyatlar, siralama, gorunenParaBirimi, kurlar])

  const toplamSayfa = Math.max(1, Math.ceil(sortedFiltered.length / SAYFA_BOYUTU))
  const sayfalanmisVeri = sortedFiltered.slice((sayfa - 1) * SAYFA_BOYUTU, sayfa * SAYFA_BOYUTU)

  // PROFESYONEL EXCEL/CSV ÇIKTISI
  const csvIndir = () => {
    // 1. BOM (Excel Türkçe karakter sorunu çözümü)
    let csvIcerik = '\uFEFF';
    
    // 2. Rapor Başlığı
    csvIcerik += 'FİYAT ANALİZ RAPORU\n';
    csvIcerik += `Tarih:;${new Date().toLocaleString('tr-TR')}\n`;
    csvIcerik += `Para Birimi:;${gorunenParaBirimi === 'TRY' ? 'Türk Lirası (TL)' : gorunenParaBirimi}\n`;
    csvIcerik += `Toplam Listelenen:;${filteredFiyatlar.length} Adet\n\n`;

    // 3. Özet İstatistikler Bölümü (Filtrelenen tüm veriler üzerinden)
    if (urunIstatistikleri.length > 0) {
      csvIcerik += '--- ÖZET İSTATİSTİKLER ---\n';
      csvIcerik += 'Ürün Adı;Tedarikçi Sayısı;En Uygun Fiyat;En Yüksek Fiyat;Fiyat Farkı\n';
      urunIstatistikleri.forEach(stat => {
        csvIcerik += `"${String(stat.urunAdi).replace(/"/g, '""')}";"${stat.adet}";"${stat.enUcuz}";"${stat.enPahali}";"${stat.fark}"\n`;
      });
      csvIcerik += '\n';
    }

    // 4. Detaylı Teklif Listesi
    csvIcerik += '--- DETAYLI TEKLİF LİSTESİ ---\n';
    const basliklar = ['Ürün Adı', 'Marka', 'Tedarikçi Firma', 'Kategori', `Çevrilmiş Fiyat (${gorunenParaBirimi})`, 'Orijinal Fiyat', 'Para Birimi', 'Durum', 'Kayıt Tarihi'];
    csvIcerik += basliklar.join(';') + '\n';

    filteredFiyatlar.forEach(item => {
      const fiyatlar = getConvertedPrice(item.fiyat, item.para_birimi);
      const satir = [
        item.urun_adi,
        item.marka || '-',
        item.firma_adi,
        item.kategori || '-',
        fiyatlar.converted,
        item.fiyat,
        item.para_birimi || 'TRY',
        item.durum === 'approved' ? 'Onaylı' : item.durum === 'pending' ? 'Beklemede' : 'Reddedildi',
        item.created_at ? new Date(item.created_at).toLocaleString('tr-TR') : '-'
      ];
      csvIcerik += satir.map(hucre => `"${String(hucre ?? '').replace(/"/g, '""')}"`).join(';') + '\n';
    });

    const blob = new Blob([csvIcerik], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Detayli_Fiyat_Raporu_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8 font-sans">
      <div className="max-w-[90rem] mx-auto space-y-8">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/50 p-6 rounded-2xl border border-slate-800 shadow-lg">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 shadow-inner">
                <FileText className="w-7 h-7 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-white tracking-tight">Analiz & Raporlama</h1>
                <p className="text-slate-400 text-sm mt-1 font-medium">{filteredFiyatlar.length} aktif kayıt listeleniyor</p>
              </div>
            </div>
          </div>
          <div className="flex items-center bg-slate-950 p-1.5 rounded-xl border border-slate-700/80 shadow-inner">
            {['TRY', 'USD', 'EUR'].map((currency) => (
              <button key={currency} onClick={() => setGorunenParaBirimi(currency)} className={`px-5 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${gorunenParaBirimi === currency ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}>
                {currency}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2 text-red-400 text-sm font-medium">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={loadData} className="text-xs font-bold bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 flex-shrink-0">
              <RefreshCw className="h-4 w-4" /> Sistemi Yenile
            </button>
          </div>
        )}

        <div className="bg-slate-900/60 rounded-2xl p-6 border border-slate-700/80 shadow-xl backdrop-blur-md">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <div className="relative group">
              <svg className="absolute left-4 top-3 w-5 h-5 text-slate-400 group-focus-within:text-emerald-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input type="text" value={arama} onChange={(e) => setArama(e.target.value)} placeholder="Ürün tanımı ara..." className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all font-medium placeholder-slate-500" />
            </div>
            <div className="relative group">
              <svg className="absolute left-4 top-3 w-5 h-5 text-slate-400 group-focus-within:text-emerald-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <select value={filtreKategori} onChange={(e) => setFiltreKategori(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all appearance-none font-medium">
                <option value="">Tüm Kategoriler</option>
                {kategoriler.map((k, i) => (<option key={i} value={k.ad}>{k.ad}</option>))}
              </select>
            </div>
            <div className="relative group">
              <Building2 className="absolute left-4 top-3 w-5 h-5 text-slate-400 group-focus-within:text-emerald-400 transition-colors" />
              <select value={filtreFirma} onChange={(e) => setFiltreFirma(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all appearance-none font-medium">
                <option value="">Tüm Tedarikçiler</option>
                {firmalar.map((f, i) => (<option key={i} value={f.ad}>{f.ad}</option>))}
              </select>
            </div>
            <div className="flex items-center justify-between px-4 bg-slate-950 rounded-xl border border-slate-700">
              <span className="text-sm text-slate-400 font-medium"><span className="text-lg font-bold text-emerald-400">{seciliIds.length}</span> kalem seçili</span>
              {seciliIds.length > 0 && (<button onClick={() => setSeciliIds([])} className="text-sm text-slate-400 hover:text-red-400 transition-colors flex items-center gap-1.5 font-bold"><X className="w-4 h-4" />Seçimi Temizle</button>)}
            </div>
          </div>
        </div>

        {urunIstatistikleri.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2 px-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              Tedarikçi Maliyet Analizi
              <span className="text-xs text-slate-500 font-medium ml-2 bg-slate-800 px-2 py-1 rounded-md">Detaylar için kartlara tıklayın</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {urunIstatistikleri.map((urun, index) => (
                <div key={index} onClick={() => handleDetayAc(urun)} className="bg-slate-900 rounded-2xl p-4 border border-slate-700 hover:border-emerald-500/50 hover:bg-slate-800/80 hover:shadow-lg hover:shadow-emerald-900/20 transition-all duration-300 cursor-pointer group">
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-base font-bold text-white truncate flex-1" title={urun.urunAdi}>{urun.urunAdi}</p>
                    <ChevronRight className="h-5 w-5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all duration-300 flex-shrink-0 ml-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center bg-slate-950/80 p-2.5 rounded-xl border border-emerald-500/20">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-emerald-400/80 uppercase font-bold tracking-wider">En Uygun</span>
                        <span className="text-xs text-slate-300 truncate max-w-[100px] font-medium mt-0.5" title={urun.enUcuzFirma}>{urun.enUcuzFirma}</span>
                      </div>
                      <span className="text-sm text-emerald-400 font-black">{formatPrice(urun.enUcuz, gorunenParaBirimi)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center bg-slate-950/80 p-2.5 rounded-xl border border-red-500/20">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-red-400/80 uppercase font-bold tracking-wider">En Yüksek</span>
                        <span className="text-xs text-slate-300 truncate max-w-[100px] font-medium mt-0.5" title={urun.enPahaliFirma}>{urun.enPahaliFirma}</span>
                      </div>
                      <span className="text-sm text-red-400 font-black">{formatPrice(urun.enPahali, gorunenParaBirimi)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-700/80">
                    <span className="text-xs text-amber-400 font-bold bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/20">Fark: {formatPrice(urun.fark, gorunenParaBirimi)}</span>
                    <span className="text-[10px] font-bold bg-slate-700 text-slate-200 px-2.5 py-1 rounded-md">{urun.adet} Tedarikçi</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden shadow-2xl">
          <div className="p-5 border-b border-slate-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/95">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-500" /> Detaylı Fiyat Veritabanı
            </h3>
            <div className="flex items-center gap-3 w-full md:w-auto">
            {isClient && filteredFiyatlar.length > 0 && (
              <button onClick={csvIndir} className="flex-1 md:flex-none bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm font-bold border border-slate-600 shadow-sm">
                <Download className="w-4 h-4 text-emerald-400" />
                Gelişmiş Excel/CSV
              </button>
            )}
            {isClient && seciliIds.length > 0 && (
              <PDFDownloadLink document={<RaporPDF data={preparedData} firmaBilgileri={firmaBilgileri} logoUrl={logoUrl} paraBirimi={gorunenParaBirimi} seciliIstatistikler={preparedIstatistikler} />} fileName={`Tesisat_Maliyet_Analizi_${new Date().toISOString().split('T')[0]}.pdf`}>
                {({ loading: pdfLoading }) => (<button disabled={pdfLoading} className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm font-bold shadow-lg shadow-emerald-900/50">{pdfLoading ? (<><RefreshCw className="animate-spin w-4 h-4" />Rapor Hazırlanıyor...</>) : (<><FileText className="w-4 h-4" />PDF Raporu Üret ({seciliIds.length})</>)}</button>)}
              </PDFDownloadLink>
            )}
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-6 space-y-5">{[...Array(6)].map((_, i) => (<div key={i} className="animate-pulse flex items-center gap-5"><div className="h-5 w-5 bg-slate-800 rounded"></div><div className="h-12 flex-1 bg-slate-800 rounded-xl"></div></div>))}</div>
            ) : filteredFiyatlar.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 px-4 bg-slate-950/30">
                <div className="w-20 h-20 bg-slate-800/80 rounded-full flex items-center justify-center mb-5 border border-slate-700 shadow-inner"><AlertCircle className="w-10 h-10 text-slate-500" /></div>
                <h3 className="text-white font-bold text-xl mb-2">Eşleşen Veri Bulunamadı</h3>
                <p className="text-slate-400 text-sm text-center max-w-md font-medium">Arama kriterlerinize veya uyguladığınız filtrelere uygun bir fiyat teklifi sistemde kayıtlı görünmüyor.</p>
              </div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-400 uppercase tracking-wider bg-slate-950 border-b border-slate-700">
                  <tr>
                    <th className="py-4 px-5 w-12"><div className="flex items-center justify-center"><input type="checkbox" onChange={() => { if (seciliIds.length === filteredFiyatlar.length) { setSeciliIds([]) } else { setSeciliIds(filteredFiyatlar.map(item => item.id)) } }} checked={seciliIds.length === filteredFiyatlar.length && filteredFiyatlar.length > 0} className="w-4 h-4 bg-slate-900 border-slate-600 rounded text-emerald-500 focus:ring-emerald-500/50 focus:ring-offset-slate-900 cursor-pointer" /></div></th>
                    <th className="py-4 px-5 font-bold cursor-pointer select-none hover:text-emerald-400 transition-colors group" onClick={() => siralamaDegistir('urun_adi')}>
                      <div className="flex items-center gap-2">Ürün Tanımı <ArrowUpDown className={`h-4 w-4 ${siralama.alan === 'urun_adi' ? 'text-emerald-500' : 'text-slate-600 group-hover:text-emerald-400/50'}`} /></div>
                    </th>
                    <th className="py-4 px-5 font-bold hidden md:table-cell">Marka</th>
                    <th className="py-4 px-5 font-bold cursor-pointer select-none hover:text-emerald-400 transition-colors group" onClick={() => siralamaDegistir('firma_adi')}>
                      <div className="flex items-center gap-2">Tedarikçi <ArrowUpDown className={`h-4 w-4 ${siralama.alan === 'firma_adi' ? 'text-emerald-500' : 'text-slate-600 group-hover:text-emerald-400/50'}`} /></div>
                    </th>
                    <th className="py-4 px-5 font-bold hidden lg:table-cell">Kategori</th>
                    <th className="py-4 px-5 font-bold text-right cursor-pointer select-none hover:text-emerald-400 transition-colors group" onClick={() => siralamaDegistir('fiyat')}>
                      <div className="flex items-center justify-end gap-2">Birim Fiyat <ArrowUpDown className={`h-4 w-4 ${siralama.alan === 'fiyat' ? 'text-emerald-500' : 'text-slate-600 group-hover:text-emerald-400/50'}`} /></div>
                    </th>
                    <th className="py-4 px-5 font-bold text-center">Durum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-900/50">
                  {sayfalanmisVeri.map((item) => {
                    const isSelected = seciliIds.includes(item.id)
                    const etiket = getUrunEtiketi(item)
                    const fiyatlar = getConvertedPrice(item.fiyat, item.para_birimi)
                    return (
                      <tr key={item.id} onClick={() => toggleSecim(item.id)} className={`group cursor-pointer transition-all hover:bg-slate-800 ${isSelected ? 'bg-emerald-900/20 hover:bg-emerald-900/30' : ''}`}>
                        <td className="py-4 px-5" onClick={(e) => e.stopPropagation()}><div className="flex items-center justify-center"><input type="checkbox" checked={isSelected} onChange={() => toggleSecim(item.id)} className="w-4 h-4 bg-slate-900 border-slate-600 rounded text-emerald-500 focus:ring-emerald-500/50 focus:ring-offset-slate-900 cursor-pointer" /></div></td>
                        <td className="py-4 px-5"><div className="flex flex-col gap-1.5"><span className="text-white font-bold">{item.urun_adi}</span><div className="flex gap-2">{etiket === 'ucuz' && (<span className="w-fit text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">En Avantajlı</span>)}{etiket === 'pahali' && (<span className="w-fit text-[10px] font-bold bg-red-500/20 text-red-400 px-2 py-0.5 rounded border border-red-500/30">Maliyetli</span>)}</div></div></td>
                        <td className="py-4 px-5 text-slate-400 font-medium hidden md:table-cell">{item.marka || '-'}</td>
                        <td className="py-4 px-5"><span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 text-slate-300 text-xs font-bold border border-slate-700 group-hover:border-slate-500 transition-colors shadow-sm">{item.firma_adi}</span></td>
                        <td className="py-4 px-5 text-slate-400 font-medium hidden lg:table-cell">{item.kategori || '-'}</td>
                        <td className="py-4 px-5 text-right"><div className="flex flex-col items-end gap-1"><span className={`text-base font-black tracking-tight ${etiket === 'ucuz' ? 'text-emerald-400' : etiket === 'pahali' ? 'text-red-400' : 'text-slate-100'}`}>{fiyatlar.converted}</span><span className="text-[10px] text-slate-500 font-bold bg-slate-950 px-2 py-0.5 rounded">Asıl: {fiyatlar.original}</span></div></td>
                        <td className="py-4 px-5"><div className="flex justify-center"><span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border shadow-sm ${item.durum === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : item.durum === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}`}><span className={`w-1.5 h-1.5 rounded-full ${item.durum === 'approved' ? 'bg-emerald-400' : item.durum === 'pending' ? 'bg-amber-400' : 'bg-red-400'}`}></span>{item.durum === 'approved' ? 'Aktif' : item.durum === 'pending' ? 'İncelemede' : 'Pasif'}</span></div></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>

          {!loading && filteredFiyatlar.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-slate-700 bg-slate-950/80">
              <span className="text-sm text-slate-400 font-medium">
                Toplam <span className="text-white font-bold">{sortedFiltered.length}</span> kayıttan <span className="text-white font-bold bg-slate-800 px-2 py-0.5 rounded">{(sayfa - 1) * SAYFA_BOYUTU + 1}-{Math.min(sayfa * SAYFA_BOYUTU, sortedFiltered.length)}</span> arası gösteriliyor
              </span>
              <div className="flex items-center gap-3">
                <button disabled={sayfa === 1} onClick={() => setSayfa(s => Math.max(1, s - 1))} className="px-4 py-2 text-sm font-bold rounded-xl bg-slate-800 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors border border-slate-600 shadow-sm">
                  Geri
                </button>
                <span className="text-sm font-bold text-slate-400 bg-slate-900 px-4 py-2 rounded-xl border border-slate-800">Sayfa {sayfa} / {toplamSayfa}</span>
                <button disabled={sayfa === toplamSayfa} onClick={() => setSayfa(s => Math.min(toplamSayfa, s + 1))} className="px-4 py-2 text-sm font-bold rounded-xl bg-slate-800 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors border border-slate-600 shadow-sm">
                  İleri
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
