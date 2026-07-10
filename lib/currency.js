import { supabase } from './supabase'

let kurCache = null
let kurCacheTime = 0
let kurDinleyiciler = []

// Kur değişikliğini dinleyen fonksiyonlar
export const kurDegistiginde = (callback) => {
  kurDinleyiciler.push(callback)
  return () => {
    kurDinleyiciler = kurDinleyiciler.filter(cb => cb !== callback)
  }
}

const kurDegistir = (yeniKurlar) => {
  kurCache = yeniKurlar
  kurCacheTime = Date.now()
  // Tüm dinleyicileri haberdar et
  kurDinleyiciler.forEach(callback => callback(yeniKurlar))
}

export const getKurlar = async () => {
  if (kurCache && Date.now() - kurCacheTime < 60000) {
    return kurCache
  }

  try {
    const { data } = await supabase
      .from('kur_ayarlari')
      .select('usd_try, eur_try')
      .maybeSingle()

    const kurlar = {
      usdTry: data?.usd_try || 34.50,
      eurTry: data?.eur_try || 37.20
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
    await supabase
      .from('kur_ayarlari')
      .upsert({
        usd_try: parseFloat(usdTry),
        eur_try: parseFloat(eurTry),
        updated_at: new Date().toISOString()
      })
    
    const yeniKurlar = { usdTry: parseFloat(usdTry), eurTry: parseFloat(eurTry) }
    kurCache = yeniKurlar
    kurCacheTime = Date.now()
    kurDegistir(yeniKurlar)
    
    return yeniKurlar
  } catch (error) {
    console.error('Kur kaydetme hatası:', error)
    throw error
  }
}

export const convertPrice = async (price, fromCurrency, toCurrency) => {
  if (!price || price === 0) return 0
  if (fromCurrency === toCurrency) return price

  const kurlar = await getKurlar()
  let tlValue = price

  if (fromCurrency === 'USD') {
    tlValue = price * kurlar.usdTry
  } else if (fromCurrency === 'EUR') {
    tlValue = price * kurlar.eurTry
  }

  if (toCurrency === 'TRY') return tlValue
  if (toCurrency === 'USD') return tlValue / kurlar.usdTry
  if (toCurrency === 'EUR') return tlValue / kurlar.eurTry

  return tlValue
}

export const formatPrice = (price, currency = 'TRY') => {
  if (price === null || price === undefined) return '-'
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: currency
  }).format(price)
}
