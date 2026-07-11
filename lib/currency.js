import { supabase } from './supabase'

let kurCache = null
let kurCacheTime = 0
let kurDinleyiciler = []

export const kurDegistiginde = (callback) => {
  kurDinleyiciler.push(callback)
  return () => {
    kurDinleyiciler = kurDinleyiciler.filter(cb => cb !== callback)
  }
}

const kurDegistir = (yeniKurlar) => {
  kurCache = yeniKurlar
  kurCacheTime = Date.now()
  kurDinleyiciler.forEach(callback => callback(yeniKurlar))
}

export const getKurlar = async () => {
  if (kurCache && Date.now() - kurCacheTime < 60000) {
    return kurCache
  }

  try {
    const { data, error } = await supabase
      .from('kur_ayarlari')
      .select('usd_try, eur_try')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error('Kur getirme hatası:', error)
      return { usdTry: 34.50, eurTry: 37.20 }
    }

    const kurlar = {
      usdTry: data?.usd_try ? parseFloat(data.usd_try) : 34.50,
      eurTry: data?.eur_try ? parseFloat(data.eur_try) : 37.20
    }
    
    kurCache = kurlar
    kurCacheTime = Date.now()
    return kurlar
  } catch (error) {
    console.error('Kur getirme hatası:', error)
    return { usdTry: 34.50, eurTry: 37.20 }
  }
}

export const setKurlar = async (usdTry, eurTry) => {
  try {
    const { data, error } = await supabase
      .from('kur_ayarlari')
      .insert({
        usd_try: parseFloat(usdTry),
        eur_try: parseFloat(eurTry),
        created_at: new Date().toISOString()
      })
      .select()

    if (error) {
      console.error('Kur kaydetme hatası:', error)
      throw error
    }

    const yeniKurlar = {
      usdTry: parseFloat(usdTry),
      eurTry: parseFloat(eurTry)
    }
    
    kurCache = yeniKurlar
    kurCacheTime = Date.now()
    kurDegistir(yeniKurlar)
    
    return data
  } catch (error) {
    console.error('Kur kaydetme hatası:', error)
    throw error
  }
}

// ✅ PARA BİRİMİ SEMBOLÜ
export const getCurrencySymbol = (currency) => {
  switch(currency) {
    case 'TRY': return '₺'
    case 'USD': return '$'
    case 'EUR': return '€'
    default: return '₺'
  }
}

// ✅ DOĞRU FİYAT ÇEVİRİSİ
export const convertPrice = (price, fromCurrency, toCurrency, kurlar) => {
  const parsedPrice = parseFloat(String(price).replace(',', '.'))
  if (!parsedPrice || isNaN(parsedPrice) || parsedPrice === 0) return 0
  if (fromCurrency === toCurrency) return parsedPrice

  const kur = kurlar || { usdTry: 34.50, eurTry: 37.20 }
  let tlValue = parsedPrice

  if (fromCurrency === 'USD') {
    tlValue = parsedPrice * kur.usdTry
  } else if (fromCurrency === 'EUR') {
    tlValue = parsedPrice * kur.eurTry
  }

  if (toCurrency === 'TRY') return tlValue
  if (toCurrency === 'USD') return tlValue / kur.usdTry
  if (toCurrency === 'EUR') return tlValue / kur.eurTry

  return tlValue
}

// ✅ FİYAT FORMATLA
export const formatPrice = (price, currency = 'TRY') => {
  if (price === null || price === undefined || isNaN(price)) return '-'
  const symbol = getCurrencySymbol(currency)
  return `${symbol}${new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price)}`
}
