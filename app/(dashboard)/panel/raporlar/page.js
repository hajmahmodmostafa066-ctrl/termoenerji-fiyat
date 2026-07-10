'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../../lib/supabase'
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'

// ============================================================
// PDF STİLLERİ - ULTRA PROFESYONEL
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
    borderBottom: '3px solid #10b981',
    paddingBottom: 15,
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'column',
  },
  companyName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  companySub: {
    fontSize: 10,
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
    padding: 12,
    borderRadius: 6,
    marginVertical: 12,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 20,
    flexWrap: 'wrap',
  },
  filterText: {
    fontSize: 9,
    color: '#475569',
  },
  summaryBox: {
    backgroundColor: '#f0fdf4',
    padding: 14,
    borderRadius: 8,
    border: '1px solid #bbf7d0',
    marginVertical: 12,
  },
  summaryText: {
    fontSize: 10,
    color: '#0f172a',
    lineHeight: 1.6,
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    padding: 8,
    borderRadius: 4,
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
    padding: 6,
    borderBottom: '1px solid #e2e8f0',
  },
  tableRowAlternate: {
    flexDirection: 'row',
    padding: 6,
    borderBottom: '1px solid #e2e8f0',
    backgroundColor: '#fafafa',
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
  statusCell: {
    fontSize: 8,
    color: '#10b981',
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
    fontSize: 8,
    color: '#94a3b8',
  },
})

// ============================================================
// PDF BİLEŞENİ
// ============================================================
const RaporPDF = ({ 
  data, 
  firmaBilgileri, 
  baslik, 
  filtre, 
  enUcuz, 
  enPahali, 
  fark,
  logoUrl 
}) => {
  const formatPrice = (price, currency = 'TRY') => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency || 'TRY',
    }).format(price)
  }

  const formatDate = (date) => {
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
              <Image src={logoUrl} style={{ width: 120, height: 40, marginBottom: 5 }} />
            )}
            <Text style={pdfStyles.companyName}>{firmaBilgileri?.ad || 'TermoEnerji'}</Text>
            <Text style={pdfStyles.companySub}>
              {firmaBilgileri?.adres || ''} {firmaBilgileri?.telefon ? `• ${firmaBilgileri.telefon}` : ''}
            </Text>
            <Text style={pdfStyles.reportTitle}>📊 Fiyat Karşılaştırma Raporu</Text>
          </View>
          <View>
            <Text style={pdfStyles.dateText}>Tarih: {formatDate(new Date())}</Text>
          </View>
        </View>

        {/* FİLTRE BİLGİSİ */}
        <View style={pdfStyles.filterBox}>
          <View style={pdfStyles.filterRow}>
            <Text style={pdfStyles.filterText}>🔍 Arama: {baslik || 'Tümü'}</Text>
            <Text style={pdfStyles.filterText}>📂 Kategori: {filtre?.kategori || 'Tüm Kategoriler'}</Text>
            <Text style={pdfStyles.filterText}>🏢 Firma: {filtre?.firma || 'Tüm Firmalar'}</Text>
            <Text style={pdfStyles.filterText}>📦 Toplam: {data.length} kayıt</Text>
          </View>
        </View>

        {/* ÖZET */}
        {data.length > 0 && (
          <View style={pdfStyles.summaryBox}>
            <Text style={pdfStyles.summaryText}>
              📌 Özet: {data.length} firmadan alınan verilere göre, en uygun fiyat <Text style={{ fontWeight: 'bold', color: '#10b981' }}>{formatPrice(enUcuz)}</Text>, 
              en pahalı fiyat ise <Text style={{ fontWeight: 'bold', color: '#ef4444' }}>{formatPrice(enPahali)}</Text>. 
              Fiyat farkı: <Text style={{ fontWeight: 'bold', color: '#f59e0b' }}>{formatPrice(fark)}</Text>
            </Text>
          </View>
        )}

        {/* TABLO */}
        <View style={pdfStyles.table}>
          <View style={pdfStyles.tableHeader}>
            <Text style={pdfStyles.tableHeaderCell}>#</Text>
            <Text style={pdfStyles.tableHeaderCell}>Ürün Adı</Text>
            <Text style={pdfStyles.tableHeaderCell}>Firma</Text>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 0.8 }]}>Kategori</Text>
            <Text style={[pdfStyles.tableHeaderCell, { textAlign: 'right', flex: 0.8 }]}>Fiyat</Text>
            <Text style={[pdfStyles.tableHeaderCell, { textAlign: 'center', flex: 0.7 }]}>Durum</Text>
          </View>
          {data.map((item, index) => (
            <View key={index} style={index % 2 === 0 ? pdfStyles.tableRow : pdfStyles.tableRowAlternate}>
              <Text style={pdfStyles.tableCell}>{index + 1}</Text>
              <Text style={pdfStyles.tableCell}>{item.urun_adi}</Text>
              <Text style={pdfStyles.tableCell}>{item.firma_adi}</Text>
              <Text style={[pdfStyles.tableCell, { flex: 0.8 }]}>{item.kategori || 'Genel'}</Text>
              <Text style={[pdfStyles.priceCell, { flex: 0.8 }]}>
                {formatPrice(item.fiyat, item.para_birimi)}
              </Text>
              <Text style={[pdfStyles.statusCell, { flex: 0.7 }]}>
                {item.durum === 'approved' ? '✅ Aktif' :
                 item.durum === 'pending' ? '⏳ Beklemede' : '❌ Pasif'}
              </Text>
            </View>
          ))}
        </View>

        {/* FOOTER */}
        <View style={pdfStyles.footer} fixed>
          <Text style={pdfStyles.footerText}>© {new Date().getFullYear()} {firmaBilgileri?.ad || 'TermoEnerji'} - Tüm hakları saklıdır.</Text>
          <Text style={pdfStyles.footerText}>Bu rapor otomatik olarak oluşturulmuştur.</Text>
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
  const [selectedFiyatlar, setSelectedFiyatlar] = useState([])
  const [loading, setLoading] = useState(false)
  const [arama, setArama] = useState('')
  const [filtreKategori, setFiltreKategori] = useState('')
  const [filtreFirma, setFiltreFirma] = useState('')
  const [firmalar, setFirmalar] = useState([])
  const [kategoriler, setKategoriler] = useState([])
  const [firmaBilgileri, setFirmaBilgileri] = useState({})
  const [logoUrl, setLogoUrl] = useState('')
  const [seciliIds, setSeciliIds] = useState([])

  useEffect(() => {
    const fetchData = async () => {
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
    fetchData()
  }, [])

  const handleAra = async () => {
    if (!arama.trim() && !filtreKategori && !filtreFirma) {
      alert('🔍 Lütfen en az bir filtre seçin!')
      return
    }

    setLoading(true)
    try {
      let query = supabase.from('fiyat_teklifleri').select('*')

      if (arama.trim()) {
        query = query.ilike('urun_adi', `%${arama}%`)
      }
      if (filtreKategori) {
        query = query.eq('kategori', filtreKategori)
      }
      if (filtreFirma) {
        query = query.eq('firma_adi', filtreFirma)
      }

      const { data, error } = await query.order('created_at', { ascending: false })
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
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  useEffect(() => {
    setSelectedFiyatlar(fiyatlar.filter(item => seciliIds.includes(item.id)))
  }, [seciliIds, fiyatlar])

  const enUcuz = selectedFiyatlar.length > 0 
    ? Math.min(...selectedFiyatlar.map(i => i.fiyat)) 
    : 0
  const enPahali = selectedFiyatlar.length > 0 
    ? Math.max(...selectedFiyatlar.map(i => i.fiyat)) 
    : 0
  const fark = enPahali - enUcuz

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">📊 Raporlar</h1>

        {/* Filtreler */}
        <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              value={arama}
              onChange={(e) => setArama(e.target.value)}
              placeholder="Ürün adı ara..."
              className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
            <select
              value={filtreKategori}
              onChange={(e) => setFiltreKategori(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="">Tüm Kategoriler</option>
              {kategoriler.map((k, i) => (
                <option key={i} value={k.ad}>{k.ad}</option>
              ))}
            </select>
            <select
              value={filtreFirma}
              onChange={(e) => setFiltreFirma(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="">Tüm Firmalar</option>
              {firmalar.map((f, i) => (
                <option key={i} value={f.ad}>{f.ad}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleAra}
            disabled={loading}
            className="mt-4 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Aranıyor...' : '🔎 Ara'}
          </button>
        </div>

        {/* Sonuçlar */}
        {fiyatlar.length > 0 && (
          <>
            <div className="flex justify-between items-center mb-4">
              <p className="text-slate-400">{fiyatlar.length} kayıt bulundu</p>
              {selectedFiyatlar.length > 0 && (
                <PDFDownloadLink
                  document={
                    <RaporPDF 
                      data={selectedFiyatlar}
                      firmaBilgileri={firmaBilgileri}
                      logoUrl={logoUrl}
                      baslik={arama || 'Tümü'}
                      filtre={{ kategori: filtreKategori || 'Tümü', firma: filtreFirma || 'Tümü' }}
                      enUcuz={enUcuz}
                      enPahali={enPahali}
                      fark={fark}
                    />
                  }
                  fileName={`rapor_${new Date().toISOString().split('T')[0]}.pdf`}
                >
                  {({ loading }) => (
                    <button
                      disabled={loading}
                      className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 py-2 rounded-lg transition disabled:opacity-50 flex items-center gap-2"
                    >
                      📄 PDF Rapor ({selectedFiyatlar.length})
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
            <p className="text-slate-400">Filtreleri kullanarak arama yapın.</p>
          </div>
        )}
      </div>
    </div>
  )
}
