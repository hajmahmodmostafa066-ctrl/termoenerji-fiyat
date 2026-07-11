'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../../lib/supabase'
import { convertPrice, formatPrice, getKurlar, kurDegistiginde, getCurrencySymbol } from '../../../../lib/currency'
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'

// ============================================================
// KURUMSAL VE PROFESYONEL PDF STILLERI
// ============================================================
const pdfStyles = StyleSheet.create({
page: {
paddingTop: 40,
paddingBottom: 60, // Footer için boşluk
paddingHorizontal: 40,
backgroundColor: '#ffffff',
fontFamily: 'Helvetica',
},
// Üstteki ince kurumsal şerit
topBand: {
position: 'absolute',
top: 0,
left: 0,
right: 0,
height: 6,
backgroundColor: '#10b981', // Emerald 500
},
header: {
flexDirection: 'row',
justifyContent: 'space-between',
alignItems: 'flex-start',
borderBottomWidth: 1,
borderBottomColor: '#e2e8f0',
paddingBottom: 15,
marginBottom: 20,
},
logo: {
width: 120,
height: 40,
objectFit: 'contain',
marginBottom: 8,
},
companyName: {
fontSize: 18,
fontWeight: 'bold',
color: '#0f172a',
fontFamily: 'Helvetica-Bold',
},
companyInfo: {
fontSize: 9,
color: '#64748b',
marginTop: 3,
lineHeight: 1.4,
},
reportTitleBox: {
alignItems: 'flex-end',
},
reportTitle: {
fontSize: 22,
fontWeight: 'bold',
color: '#0f172a',
fontFamily: 'Helvetica-Bold',
textTransform: 'uppercase',
letterSpacing: 1,
},
reportMetaText: {
fontSize: 9,
color: '#475569',
marginTop: 4,
},
// Yönetici Özeti (Filtreler ve Kriterler)
summarySection: {
backgroundColor: '#f8fafc',
borderRadius: 6,
padding: 12,
marginBottom: 20,
borderWidth: 1,
borderColor: '#e2e8f0',
},
summaryTitle: {
fontSize: 11,
fontFamily: 'Helvetica-Bold',
color: '#334155',
marginBottom: 8,
textTransform: 'uppercase',
},
filterGrid: {
flexDirection: 'row',
flexWrap: 'wrap',
gap: 15,
},
filterItem: {
flexDirection: 'column',
width: '22%',
},
filterLabel: {
fontSize: 8,
color: '#64748b',
textTransform: 'uppercase',
marginBottom: 2,
},
filterValue: {
fontSize: 10,
color: '#0f172a',
fontFamily: 'Helvetica-Bold',
},
// İstatistik Kartları
statsContainer: {
flexDirection: 'row',
flexWrap: 'wrap',
justifyContent: 'space-between',
marginBottom: 20,
},
statCard: {
width: '31%', // Yan yana 3 kart
backgroundColor: '#ffffff',
borderRadius: 6,
padding: 12,
borderWidth: 1,
borderColor: '#e2e8f0',
borderLeftWidth: 3,
borderLeftColor: '#10b981', // Vurgu rengi
marginBottom: 10,
},
statProductTitle: {
fontSize: 10,
fontFamily: 'Helvetica-Bold',
color: '#0f172a',
marginBottom: 6,
},
statRow: {
flexDirection: 'row',
justifyContent: 'space-between',
marginBottom: 3,
},
statLabelText: {
fontSize: 8,
color: '#64748b',
},
statValueGreen: {
fontSize: 9,
fontFamily: 'Helvetica-Bold',
color: '#059669', // Daha koyu yeşil
},
statValueRed: {
fontSize: 9,
fontFamily: 'Helvetica-Bold',
color: '#dc2626', // Daha koyu kırmızı
},
statValueNeutral: {
fontSize: 9,
fontFamily: 'Helvetica-Bold',
color: '#475569',
},
// Tablo Tasarımı
table: {
width: '100%',
marginBottom: 20,
},
tableHeader: {
flexDirection: 'row',
backgroundColor: '#1e293b', // Koyu kurumsal mavi/gri
borderTopLeftRadius: 4,
borderTopRightRadius: 4,
paddingVertical: 10,
paddingHorizontal: 8,
},
tableHeaderCell: {
fontSize: 8,
fontFamily: 'Helvetica-Bold',
color: '#ffffff',
textTransform: 'uppercase',
letterSpacing: 0.5,
},
tableRow: {
flexDirection: 'row',
paddingVertical: 8,
paddingHorizontal: 8,
borderBottomWidth: 1,
borderBottomColor: '#e2e8f0',
alignItems: 'center',
backgroundColor: '#ffffff',
},
tableRowAlternate: {
flexDirection: 'row',
paddingVertical: 8,
paddingHorizontal: 8,
borderBottomWidth: 1,
borderBottomColor: '#e2e8f0',
alignItems: 'center',
backgroundColor: '#f8fafc', // Zebra deseni
},
tableCell: {
fontSize: 8,
color: '#334155',
},
tableCellBold: {
fontSize: 8,
color: '#0f172a',
fontFamily: 'Helvetica-Bold',
},
priceCell: {
fontSize: 9,
fontFamily: 'Helvetica-Bold',
color: '#0f172a',
textAlign: 'right',
},
// Durum Rozetleri (Badges)
badge: {
paddingVertical: 3,
paddingHorizontal: 6,
borderRadius: 4,
textAlign: 'center',
},
badgeText: {
fontSize: 7,
fontFamily: 'Helvetica-Bold',
textTransform: 'uppercase',
},
badgeApproved: {
backgroundColor: '#d1fae5',
color: '#065f46',
},
badgePending: {
backgroundColor: '#fef3c7',
color: '#92400e',
},
badgeRejected: {
backgroundColor: '#fee2e2',
color: '#991b1b',
},
// Altbilgi
footer: {
position: 'absolute',
bottom: 25,
left: 40,
right: 40,
borderTopWidth: 1,
borderTopColor: '#e2e8f0',
paddingTop: 10,
flexDirection: 'row',
justifyContent: 'space-between',
alignItems: 'center',
},
footerText: {
fontSize: 8,
color: '#94a3b8',
},
pageNumber: {
fontSize: 8,
color: '#94a3b8',
fontFamily: 'Helvetica-Bold',
}
})

// ============================================================
// PDF BİLEŞENİ
// ============================================================
const RaporPDF = ({ data, firmaBilgileri, logoUrl, baslik, kategori, firma, paraBirimi, urunIstatistikleri }) => {
const formatPrice = (price, currency = 'TRY') => {
if (price === null || price === undefined) return '-'
const symbol = getCurrencySymbol(currency)
return ${symbol}${new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2, }).format(price)}
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

// Sütun genişlikleri (Toplam 100 olmalı)
const colWidths = {
no: '5%',
urun: '35%',
marka: '15%',
firma: '20%',
fiyat: '15%',
durum: '10%'
};

return (




    {/* HEADER */}
    <View style={pdfStyles.header} fixed>
      <View style={{ flex: 1 }}>
        {logoUrl ? (
          <Image src={logoUrl} style={pdfStyles.logo} />
        ) : (
          <Text style={pdfStyles.companyName}>{firmaBilgileri?.ad || 'TermoEnerji A.Ş.'}</Text>
        )}
        {firmaBilgileri?.adres && <Text style={pdfStyles.companyInfo}>{firmaBilgileri.adres}</Text>}
        {firmaBilgileri?.telefon && <Text style={pdfStyles.companyInfo}>Tel: {firmaBilgileri.telefon}</Text>}
        {firmaBilgileri?.eposta && <Text style={pdfStyles.companyInfo}>E-posta: {firmaBilgileri.eposta}</Text>}
      </View>
      <View style={pdfStyles.reportTitleBox}>
        <Text style={pdfStyles.reportTitle}>Teklİf Raporu</Text>
        <Text style={pdfStyles.reportMetaText}>Tarih: {formatDate(new Date())}</Text>
        <Text style={pdfStyles.reportMetaText}>Rapor Kur: {paraBirimi}</Text>
      </View>
    </View>

    {/* YÖNETİCİ ÖZETİ (FİLTRELER) */}
    <View style={pdfStyles.summarySection}>
      <Text style={pdfStyles.summaryTitle}>Rapor Kriterleri & Özet</Text>
      <View style={pdfStyles.filterGrid}>
        <View style={pdfStyles.filterItem}>
          <Text style={pdfStyles.filterLabel}>Arama Kriteri</Text>
          <Text style={pdfStyles.filterValue}>{baslik || 'Tüm Ürünler'}</Text>
        </View>
        <View style={pdfStyles.filterItem}>
          <Text style={pdfStyles.filterLabel}>Kategori</Text>
          <Text style={pdfStyles.filterValue}>{kategori || 'Tümü'}</Text>
        </View>
        <View style={pdfStyles.filterItem}>
          <Text style={pdfStyles.filterLabel}>Firma</Text>
          <Text style={pdfStyles.filterValue}>{firma || 'Tümü'}</Text>
        </View>
        <View style={pdfStyles.filterItem}>
          <Text style={pdfStyles.filterLabel}>Toplam Kayıt</Text>
          <Text style={pdfStyles.filterValue}>{data.length} Adet Teklif</Text>
        </View>
      </View>
    </View>

    {/* ÜRÜN İSTATİSTİKLERİ (Sadece birden fazla ürün teklifi varsa göster) */}
    {data.length > 0 && urunIstatistikleri && urunIstatistikleri.length > 0 && (
      <View style={pdfStyles.statsContainer}>
        {urunIstatistikleri.map((urun, index) => (
          <View key={index} style={pdfStyles.statCard} wrap={false}>
            <Text style={pdfStyles.statProductTitle} numberOfLines={1}>{urun.urunAdi}</Text>
            
            <View style={pdfStyles.statRow}>
              <Text style={pdfStyles.statLabelText}>En Uygun:</Text>
              <Text style={pdfStyles.statValueGreen}>{formatPrice(urun.enUcuz, paraBirimi)}</Text>
            </View>
            
            <View style={pdfStyles.statRow}>
              <Text style={pdfStyles.statLabelText}>En Yüksek:</Text>
              <Text style={pdfStyles.statValueRed}>{formatPrice(urun.enPahali, paraBirimi)}</Text>
            </View>

            <View style={[pdfStyles.statRow, { marginTop: 4, paddingTop: 4, borderTopWidth: 1, borderTopColor: '#f1f5f9' }]}>
              <Text style={pdfStyles.statLabelText}>Fiyat Farkı:</Text>
              <Text style={pdfStyles.statValueNeutral}>{formatPrice(urun.fark, paraBirimi)}</Text>
            </View>
          </View>
        ))}
      </View>
    )}

    {/* TABLO */}
    <View style={pdfStyles.table}>
      {/* Tablo Başlığı */}
      <View style={pdfStyles.tableHeader} fixed>
        <Text style={[pdfStyles.tableHeaderCell, { width: colWidths.no }]}>#</Text>
        <Text style={[pdfStyles.tableHeaderCell, { width: colWidths.urun }]}>Ürün Adı</Text>
        <Text style={[pdfStyles.tableHeaderCell, { width: colWidths.marka }]}>Marka</Text>
        <Text style={[pdfStyles.tableHeaderCell, { width: colWidths.firma }]}>Tedarikçi Firma</Text>
        <Text style={[pdfStyles.tableHeaderCell, { width: colWidths.fiyat, textAlign: 'right' }]}>Birim Fiyat</Text>
        <Text style={[pdfStyles.tableHeaderCell, { width: colWidths.durum, textAlign: 'center' }]}>Durum</Text>
      </View>

      {/* Tablo İçeriği */}
      {data.map((item, index) => {
        const isAlternate = index % 2 !== 0;
        return (
          <View key={index} style={isAlternate ? pdfStyles.tableRowAlternate : pdfStyles.tableRow} wrap={false}>
            <Text style={[pdfStyles.tableCell, { width: colWidths.no }]}>{index + 1}</Text>
            <Text style={[pdfStyles.tableCellBold, { width: colWidths.urun }]} numberOfLines={2}>{item.urun_adi}</Text>
            <Text style={[pdfStyles.tableCell, { width: colWidths.marka }]}>{item.marka || '-'}</Text>
            <Text style={[pdfStyles.tableCell, { width: colWidths.firma }]} numberOfLines={1}>{item.firma_adi}</Text>
            <Text style={[pdfStyles.priceCell, { width: colWidths.fiyat }]}>
              {formatPrice(item.fiyat, paraBirimi)}
            </Text>
            <View style={{ width: colWidths.durum, alignItems: 'center' }}>
              <View style={[
                pdfStyles.badge,
                item.durum === 'approved' ? pdfStyles.badgeApproved : 
                item.durum === 'pending' ? pdfStyles.badgePending : pdfStyles.badgeRejected
              ]}>
                <Text style={[
                  pdfStyles.badgeText,
                  item.durum === 'approved' ? { color: '#065f46' } : 
                  item.durum === 'pending' ? { color: '#92400e' } : { color: '#991b1b' }
                ]}>
                  {item.durum === 'approved' ? 'Aktİf' : item.durum === 'pending' ? 'Bekliyor' : 'Pasif'}
                </Text>
              </View>
            </View>
          </View>
        );
      })}
    </View>

    {/* FOOTER */}
    <View style={pdfStyles.footer} fixed>
      <Text style={pdfStyles.footerText}>
        © {new Date().getFullYear()} {firmaBilgileri?.ad || 'TermoEnerji'} - Sistem tarafından otomatik üretilmiştir.
      </Text>
      <Text style={pdfStyles.pageNumber} render={({ pageNumber, totalPages }) => (
        `Sayfa ${pageNumber} / ${totalPages}`
      )} />
    </View>
  </Page>
</Document>


)
}

// ============================================================
// ANA SAYFA (Arayüzde küçük profesyonel iyileştirmeler yapıldı)
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

useEffect(() => {
const loadData = async () => {
const { data: fiyatData } = await supabase.from('fiyat_teklifleri').select('*').order('created_at', { ascending: false })
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

useEffect(() => {
const loadKurlar = async () => {
const k = await getKurlar()
setKurlar(k)
}
loadKurlar()
const unsubscribe = kurDegistiginde((yeniKurlar) => { setKurlar(yeniKurlar) })
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
  if (!urunGruplari[urunAdi]) { urunGruplari[urunAdi] = [] }
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
}).filter(ist => ist.adet > 1) // Sadece karşılaştırma yapılacak birden fazla teklif varsa istatistik göster

setUrunIstatistikleri(istatistikler)


}, [arama, filtreKategori, filtreFirma, fiyatlar, gorunenParaBirimi, kurlar])

const toggleSecim = (id) => {
setSeciliIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
}
const selectedFiyatlar = filteredFiyatlar.filter(item => seciliIds.includes(item.id))

const getUrunEtiketi = (item) => {
const urunItems = filteredFiyatlar.filter(i => i.urun_adi === item.urun_adi)
if (urunItems.length <= 1) return null // Tek teklif varsa etiket basma

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



    {/* Üst Kısım ve Para Birimi Seçimi */}
    <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-white">📊 Raporlar ve Karşılaştırma</h1>
        <p className="text-slate-400 text-sm">Görüntülenen: {filteredFiyatlar.length} teklif</p>
      </div>
      
      <div className="flex items-center gap-4">
        {selectedFiyatlar.length > 0 && (
          <PDFDownloadLink 
            document={
              <RaporPDF 
                data={selectedFiyatlar} 
                firmaBilgileri={firmaBilgileri} 
                logoUrl={logoUrl} 
                baslik={arama} 
                kategori={filtreKategori} 
                firma={filtreFirma} 
                paraBirimi={gorunenParaBirimi} 
                urunIstatistikleri={urunIstatistikleri} 
              />
            } 
            fileName={`Teklif_Raporu_${new Date().toISOString().split('T')[0]}.pdf`}
          >
            {({ loading }) => (
              <button disabled={loading} className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-lg font-medium transition shadow-lg shadow-emerald-900/20 disabled:opacity-50 flex items-center gap-2 text-sm border border-emerald-500">
                {loading ? '⏳ Hazırlanıyor...' : `📄 PDF İndir (${selectedFiyatlar.length} Seçili)`}
              </button>
            )}
          </PDFDownloadLink>
        )}

        <div className="flex items-center gap-1 bg-slate-800/80 rounded-lg p-1 border border-slate-700 shadow-inner">
          {['TRY', 'USD', 'EUR'].map(currency => (
            <button 
              key={currency}
              onClick={() => setGorunenParaBirimi(currency)} 
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                gorunenParaBirimi === currency 
                ? 'bg-slate-700 text-white shadow' 
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              {currency}
            </button>
          ))}
        </div>
      </div>
    </div>

    {/* Filtreleme Kartı */}
    <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 mb-6 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Ürün Arama</label>
          <input type="text" value={arama} onChange={(e) => setArama(e.target.value)} placeholder="Örn: Vana, Pompa..." className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Kategori</label>
          <select value={filtreKategori} onChange={(e) => setFiltreKategori(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition appearance-none">
            <option value="">Tüm Kategoriler</option>
            {kategoriler.map((k, i) => (<option key={i} value={k.ad}>{k.ad}</option>))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Tedarikçi Firma</label>
          <select value={filtreFirma} onChange={(e) => setFiltreFirma(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition appearance-none">
            <option value="">Tüm Firmalar</option>
            {firmalar.map((f, i) => (<option key={i} value={f.ad}>{f.ad}</option>))}
          </select>
        </div>
      </div>
    </div>

    {/* Tablo Alanı */}
    {loading ? (
      <div className="text-center py-12 bg-slate-900 rounded-xl border border-slate-800">
        <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-slate-400 font-medium">Veriler yükleniyor...</p>
      </div>
    ) : filteredFiyatlar.length === 0 ? (
      <div className="text-center py-12 bg-slate-900 rounded-xl border border-slate-800">
        <span className="text-4xl block mb-3">📭</span>
        <p className="text-slate-400 font-medium text-lg">Bu kriterlere uygun teklif bulunamadı.</p>
        <button onClick={() => {setArama(''); setFiltreFirma(''); setFiltreKategori('');}} className="mt-4 text-emerald-400 hover:text-emerald-300 text-sm font-medium">Filtreleri Temizle</button>
      </div>
    ) : (
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-950/50 border-b border-slate-800">
              <tr>
                <th className="py-4 px-4 w-12">
                  <input 
                    type="checkbox" 
                    onChange={() => seciliIds.length === filteredFiyatlar.length ? setSeciliIds([]) : setSeciliIds(filteredFiyatlar.map(item => item.id))} 
                    checked={seciliIds.length === filteredFiyatlar.length && filteredFiyatlar.length > 0} 
                    className="w-4 h-4 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500/20 bg-slate-900" 
                  />
                </th>
                <th className="py-4 px-4 text-slate-400 font-semibold text-xs uppercase tracking-wider">Ürün Bilgisi</th>
                <th className="py-4 px-4 text-slate-400 font-semibold text-xs uppercase tracking-wider">Marka</th>
                <th className="py-4 px-4 text-slate-400 font-semibold text-xs uppercase tracking-wider">Tedarikçi</th>
                <th className="py-4 px-4 text-slate-400 font-semibold text-xs uppercase tracking-wider text-right">Birim Fiyat</th>
                <th className="py-4 px-4 text-slate-400 font-semibold text-xs uppercase tracking-wider text-center">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredFiyatlar.map((item) => {
                const isSelected = seciliIds.includes(item.id)
                const etiket = getUrunEtiketi(item)
                const fiyatlar = getConvertedPrice(item.fiyat, item.para_birimi)
                
                return (
                  <tr key={item.id} className={`hover:bg-slate-800/50 transition-colors ${isSelected ? 'bg-emerald-900/10' : ''}`}>
                    <td className="py-3 px-4">
                      <input 
                        type="checkbox" 
                        checked={isSelected} 
                        onChange={() => toggleSecim(item.id)} 
                        className="w-4 h-4 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500/20 bg-slate-900" 
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-200 font-medium">{item.urun_adi}</span>
                        {etiket === 'ucuz' && <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-medium border border-emerald-500/20">En İyi Fiyat</span>}
                        {etiket === 'pahali' && <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full font-medium border border-red-500/20">Yüksek Fiyat</span>}
                      </div>
                      {item.kategori && <span className="text-xs text-slate-500 mt-0.5 block">{item.kategori}</span>}
                    </td>
                    <td className="py-3 px-4 text-slate-400">{item.marka || '-'}</td>
                    <td className="py-3 px-4">
                      <span className="text-slate-300 font-medium bg-slate-800 px-2.5 py-1 rounded-md text-xs border border-slate-700/50">{item.firma_adi}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex flex-col items-end justify-center">
                        <span className={`text-sm font-bold tracking-tight ${etiket === 'ucuz' ? 'text-emerald-400' : etiket === 'pahali' ? 'text-red-400' : 'text-slate-200'}`}>
                          {fiyatlar.converted}
                        </span>
                        {item.para_birimi !== gorunenParaBirimi && (
                          <span className="text-[10px] text-slate-500 mt-0.5 font-medium">Orj: {fiyatlar.original}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center justify-center text-[11px] px-2.5 py-1 rounded-md font-medium border ${
                        item.durum === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                        item.durum === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                        'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {item.durum === 'approved' ? 'Onaylı' : item.durum === 'pending' ? 'Bekliyor' : 'Reddedildi'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    )}
  </div>
</div>


)
}
