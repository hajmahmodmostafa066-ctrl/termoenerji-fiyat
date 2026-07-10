import { supabase } from './supabase'

let kurCache = null
let kurCacheTime = 0

export const getKurlar = async () => {
  // 1 dakika cache
  if (kurCache && Date.now() - kurCacheTime < 60000) {
    return kurCache
  }

  try {
    const { data } = await supabase
      .from('kur_ayarlari')
      .select('usd_try, eur_try')
      .maybeSingle()

    kurCache = {
      usdTry: data?.usd_try || 34.50,
      eurTry: data?.eur_try || 37.20
    }
    kurCacheTime = Date.now()
    return kurCache
  } catch (error) {
    console.error('Kur getirme hatası:', error)
    return { usdTry: 34.50, eurTry: 37.20 }
  }
}

export const convertPrice = async (price, fromCurrency, toCurrency) => {
  if (!price || price === 0) return 0
  if (fromCurrency === toCurrency) return price

  const kurlar = await getKurlar()
  let tlValue = price

  // Önce TL'ye çevir
  if (fromCurrency === 'USD') {
    tlValue = price * kurlar.usdTry
  } else if (fromCurrency === 'EUR') {
    tlValue = price * kurlar.eurTry
  }

  // TL'den hedef para birimine
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
