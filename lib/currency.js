import { supabase } from './supabase'

export const getKurlar = async () => {
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

    if (data) {
      return {
        usdTry: parseFloat(data.usd_try) || 34.50,
        eurTry: parseFloat(data.eur_try) || 37.20
      }
    }

    return { usdTry: 34.50, eurTry: 37.20 }
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

    return data
  } catch (error) {
    console.error('Kur kaydetme hatası:', error)
    throw error
  }
}

export const convertPrice = (price, fromCurrency, toCurrency, kurlar) => {
  if (!price || isNaN(price)) return 0
  if (fromCurrency === toCurrency) return price

  const kur = kurlar || { usdTry: 34.50, eurTry: 37.20 }
  let tlValue = price

  if (fromCurrency === 'USD') {
    tlValue = price * kur.usdTry
  } else if (fromCurrency === 'EUR') {
    tlValue = price * kur.eurTry
  }

  if (toCurrency === 'TRY') return tlValue
  if (toCurrency === 'USD') return tlValue / kur.usdTry
  if (toCurrency === 'EUR') return tlValue / kur.eurTry

  return tlValue
}

export const formatPrice = (price, currency = 'TRY') => {
  if (price === null || price === undefined || isNaN(price)) return '-'
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: currency
  }).format(price)
}
