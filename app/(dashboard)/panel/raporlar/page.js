'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

// PDF Stilleri
const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#ffffff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#0f172a',
  },
  subheader: {
    fontSize: 14,
    marginBottom: 10,
    color: '#475569',
  },
  table: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: 20,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1px solid #e2e8f0',
    paddingVertical: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottom: '2px solid #0f172a',
    paddingVertical: 8,
    fontWeight: 'bold',
  },
  tableCell: {
    flex: 1,
    fontSize: 10,
    color: '#0f172a',
  },
  footer: {
    marginTop: 30,
    fontSize: 10,
    color: '#94a3b8',
    textAlign: 'center',
  },
})

// PDF Belgesi
const RaporPDF = ({ data, baslik }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>📊 TermoEnerji - Fiyat Raporu</Text>
      <Text style={styles.subheader}>Rapor Tarihi: {new Date().toLocaleString('tr-TR')}</Text>
      <Text style={styles.subheader}>Aranan: {baslik}</Text>

      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={styles.tableCell}>Ürün Adı</Text>
          <Text style={styles.tableCell}>Firma</Text>
          <Text style={styles.tableCell}>Kategori</Text>
          <Text style={[styles.tableCell, { textAlign: 'right' }]}>Fiyat</Text>
          <Text style={[styles.tableCell, { textAlign: 'center' }]}>Durum</Text>
        </View>

        {data.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.tableCell}>{item.urun_adi}</Text>
            <Text style={styles.tableCell}>{item.firma_adi}</Text>
            <Text style={styles.tableCell}>{item.kategori || '-'}</Text>
            <Text style={[styles.tableCell, { textAlign: 'right' }]}>
              {new Intl.NumberFormat('tr-TR', {
                style: 'currency',
                currency: item.para_birimi || 'TRY',
              }).format(item.fiyat)}
            </Text>
            <Text style={[styles.tableCell, { textAlign: 'center' }]}>
              {item.durum === 'approved' ? '✅ Onaylandı' :
               item.durum === 'pending' ? '⏳ Beklemede' : '❌ Reddedildi'}
            </Text>
          </View>
        ))}
      </View>

      <Text style={styles.footer}>
        TermoEnerji Fiyat Yönetim Sistemi © {new Date().getFullYear()}
      </Text>
    </Page>
  </Document>
)

export default function RaporlarPage() {
  const [fiyatlar, setFiyatlar] = useState([])
  const [loading, setLoading] = useState(false)
  const [arama, setArama] = useState('')
  const [selectedFiyatlar, setSelectedFiyatlar] = useState([])
  const [seciliIds, setSeciliIds] = useState([])

  const handleAra = async () => {
    if (!arama.trim()) {
      alert('🔍 Lütfen bir ürün adı girin!')
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('fiyat_teklifleri')
        .select('*')
        .ilike('urun_adi', `%${arama}%`)
        .order('created_at', { ascending: false })

      if (error) throw error
      setFiyatlar(data || [])
    } catch (error) {
      console.error('Arama hatası:', error)
      alert('❌ Hata: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleSecim = (id) => {
    setSeciliIds(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  useEffect(() => {
    const secili = fiyatlar.filter(item => seciliIds.includes(item.id))
    setSelectedFiyatlar(secili)
  }, [seciliIds, fiyatlar])

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">📊 Raporlar</h1>

      {/* Arama */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 mb-6">
        <div className="flex gap-3">
          <input
            type="text"
            value={arama}
            onChange={(e) => setArama(e.target.value)}
            placeholder="Ürün adı gir (örnek: SCH40 BORU)"
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
          <button
            onClick={handleAra}
            disabled={loading}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Aranıyor...' : '🔎 Ara'}
          </button>
        </div>
      </div>

      {/* Sonuçlar */}
      {fiyatlar.length > 0 && (
        <>
          <div className="flex justify-between items-center mb-4">
            <p className="text-slate-400">{fiyatlar.length} kayıt bulundu</p>
            {selectedFiyatlar.length > 0 && (
              <PDFDownloadLink
                document={<RaporPDF data={selectedFiyatlar} baslik={arama} />}
                fileName={`rapor_${arama}_${new Date().toISOString().slice(0,10)}.pdf`}
              >
                {({ loading }) => (
                  <button
                    disabled={loading}
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 py-2 rounded-lg transition disabled:opacity-50"
                  >
                    {loading ? 'Hazırlanıyor...' : '📄 PDF Rapor (${selectedFiyatlar.length})'}
                  </button>
                )}
              </PDFDownloadLink>
            )}
          </div>

          <div className="overflow-x-auto bg-slate-800/50 rounded-xl border border-slate-700">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-800">
                  <th className="py-3 px-4 text-slate-400 font-medium w-10">
                    <input
                      type="checkbox"
                      onChange={() => {
                        if (seciliIds.length === fiyatlar.length) {
                          setSeciliIds([])
                        } else {
                          setSeciliIds(fiyatlar.map(item => item.id))
                        }
                      }}
                      checked={seciliIds.length === fiyatlar.length && fiyatlar.length > 0}
                      className="w-4 h-4 accent-emerald-500"
                    />
                  </th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Ürün</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Firma</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium hidden md:table-cell">Kategori</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium">Fiyat</th>
                  <th className="text-center py-3 px-4 text-slate-400 font-medium">Durum</th>
                </tr>
              </thead>
              <tbody>
                {fiyatlar.map((item) => (
                  <tr key={item.id} className="border-b border-slate-700/50 hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={seciliIds.includes(item.id)}
                        onChange={() => toggleSecim(item.id)}
                        className="w-4 h-4 accent-emerald-500"
                      />
                    </td>
                    <td className="py-3 px-4 text-white font-medium">{item.urun_adi}</td>
                    <td className="py-3 px-4 text-slate-300">{item.firma_adi}</td>
                    <td className="py-3 px-4 text-slate-400 hidden md:table-cell">{item.kategori || '-'}</td>
                    <td className="py-3 px-4 text-emerald-400 font-bold text-right">
                      {new Intl.NumberFormat('tr-TR', {
                        style: 'currency',
                        currency: item.para_birimi || 'TRY',
                      }).format(item.fiyat)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        item.durum === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                        item.durum === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {item.durum === 'approved' ? '✅ Onaylandı' :
                         item.durum === 'pending' ? '⏳ Beklemede' : '❌ Reddedildi'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {fiyatlar.length === 0 && !loading && (
        <div className="text-center py-12 bg-slate-800/50 rounded-xl border border-slate-700">
          <p className="text-slate-400">Ürün adı girerek arama yapın.</p>
        </div>
      )}
    </div>
  )
}
