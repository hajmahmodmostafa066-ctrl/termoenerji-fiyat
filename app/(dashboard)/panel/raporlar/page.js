'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../../../lib/supabase'
import { convertPrice, formatPrice, getKurlar, kurDegistiginde } from '../../../../lib/currency'
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'
import {
  AlertCircle,
  ArrowUpDown,
  BarChart3,
  ChevronRight,
  Download,
  FileSpreadsheet,
  Package,
  RefreshCw,
  RotateCcw,
  TrendingUp,
  Users,
  X,
} from 'lucide-react'

const PARA_BIRIMLERI = ['TRY', 'USD', 'EUR']
const EPSILON = 0.000001

const pdfStyles = StyleSheet.create({
  page: { paddingTop: 28, paddingBottom: 38, paddingHorizontal: 24, backgroundColor: '#ffffff' },
  accent: { position: 'absolute', top: 0, left: 0, right: 0, height: 6, backgroundColor: '#10b981' },
  header: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingBottom: 12, marginBottom: 14 },
  company: { width: '58%' },
  title: { fontSize: 17, fontWeight: 'bold', color: '#059669', marginBottom: 6 },
  companyName: { fontSize: 13, fontWeight: 'bold', color: '#0f172a', marginBottom: 3 },
  muted: { fontSize: 8, color: '#64748b', marginBottom: 2 },
  dateBox: { width: '34%', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 4, padding: 8, alignItems: 'flex-end' },
  dateLabel: { fontSize: 7, color: '#64748b', marginBottom: 2 },
  date: { fontSize: 9, color: '#0f172a', fontWeight: 'bold' },
  logo: { width: 110, height: 34, objectFit: 'contain', marginBottom: 7 },
  summary: { flexDirection: 'row', marginBottom: 15 },
  summaryCard: { flex: 1, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderLeftWidth: 3, borderLeftColor: '#10b981', borderRadius: 4, padding: 8, marginRight: 7 },
  summaryCardLast: { marginRight: 0 },
  summaryLabel: { fontSize: 6.5, color: '#64748b', marginBottom: 3 },
  summaryValue: { fontSize: 11, color: '#0f172a', fontWeight: 'bold' },
  section: { fontSize: 10, fontWeight: 'bold', color: '#0f172a', backgroundColor: '#f1f5f9', padding: 6, borderLeftWidth: 3, borderLeftColor: '#0f172a', marginBottom: 8 },
  stats: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
  stat: { width: '32%', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 4, padding: 6, marginRight: '2%', marginBottom: 7 },
  statLast: { marginRight: 0 },
  statName: { fontSize: 7, color: '#0f172a', fontWeight: 'bold', marginBottom: 4 },
  statLabel: { fontSize: 5.5, color: '#64748b', marginBottom: 1 },
  statGood: { fontSize: 7, color: '#059669', fontWeight: 'bold', marginBottom: 1 },
  statBad: { fontSize: 7, color: '#dc2626', fontWeight: 'bold', marginBottom: 1 },
  statSupplier: { fontSize: 5.5, color: '#475569', marginBottom: 4 },
  statDiff: { fontSize: 6.5, color: '#b45309', fontWeight: 'bold', borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 3 },
  table: { marginTop: 5 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#1e293b', paddingVertical: 6, paddingHorizontal: 7 },
  row: { flexDirection: 'row', paddingVertical: 6, paddingHorizontal: 7, borderBottomWidth: 1, borderBottomColor: '#e2e8f0', alignItems: 'center' },
  rowAlt: { flexDirection: 'row', paddingVertical: 6, paddingHorizontal: 7, backgroundColor: '#f8fafc', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', alignItems: 'center' },
  c1: { width: '5%' }, c2: { width: '31%', paddingRight: 3 }, c3: { width: '15%', paddingRight: 3 }, c4: { width: '25%', paddingRight: 3 }, c5: { width: '24%', textAlign: 'right' },
  headCell: { color: '#ffffff', fontSize: 6.5, fontWeight: 'bold' },
  cell: { color: '#334155', fontSize: 7 },
  cellBold: { color: '#0f172a', fontSize: 7, fontWeight: 'bold' },
  cheap: { color: '#059669', fontSize: 7, fontWeight: 'bold' },
  expensive: { color: '#dc2626', fontSize: 7, fontWeight: 'bold' },
  footer: { position: 'absolute', left: 24, right: 24, bottom: 15, borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 6, flexDirection: 'row', justifyContent: 'space-between' },
  footerText: { color: '#94a3b8', fontSize: 6.5 },
})

function parseAmount(value) {
  const amount = Number.parseFloat(String(value ?? '').replace(',', '.'))
  return Number.isFinite(amount) ? amount : null
}

function formatDate(value = new Date()) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(date)
}

function formatPdfPrice(price, currency = 'TRY') {
  if (!Number.isFinite(price)) return '-'
  const formatted = new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(price)
  return `${formatted} ${currency === 'TRY' ? 'TL' : currency}`
}

function createPriceInfo(fiyat, paraBirimi, gorunenParaBirimi, kurlar) {
  const originalValue = parseAmount(fiyat)
  if (originalValue === null) {
    return { isValid: false, original: '-', converted: '-', convertedValue: 0, tlValue: 0 }
  }

  const sourceCurrency = paraBirimi || 'TRY'
  const tlValue = convertPrice(originalValue, sourceCurrency, 'TRY', kurlar)
  const convertedValue = convertPrice(tlValue, 'TRY', gorunenParaBirimi, kurlar)

  if (!Number.isFinite(tlValue) || !Number.isFinite(convertedValue)) {
    return { isValid: false, original: formatPrice(originalValue, sourceCurrency), converted: '-', convertedValue: 0, tlValue: 0 }
  }

  return {
    isValid: true,
