import { supabase } from './supabase'

/**
 * Audit log ekleme fonksiyonu
 * @param {string} tabloAdi - Hangi tabloda işlem yapıldı (fiyat_teklifleri, firmalar, kategoriler)
 * @param {string} kayitId - Hangi kayıt üzerinde işlem yapıldı (UUID)
 * @param {string} islemTuru - INSERT, UPDATE, DELETE
 * @param {object} eskiVeri - Değişiklik öncesi veri (UPDATE ve DELETE için)
 * @param {object} yeniVeri - Değişiklik sonrası veri (INSERT ve UPDATE için)
 */
export const addAuditLog = async (tabloAdi, kayitId, islemTuru, eskiVeri = null, yeniVeri = null) => {
  try {
    // Oturum açmış kullanıcıyı al
    const { data: { user } } = await supabase.auth.getUser()
    const kullaniciEmail = user?.email || 'bilinmiyor'

    // Log kaydını ekle
    const { error } = await supabase
      .from('audit_log')
      .insert([{
        tablo_adi: tabloAdi,
        kayit_id: kayitId,
        islem_turu: islemTuru,
        kullanici_email: kullaniciEmail,
        eski_veri: eskiVeri,
        yeni_veri: yeniVeri
      }])

    if (error) {
      console.error('Audit log ekleme hatası:', error)
    }
  } catch (error) {
    console.error('Audit log hatası:', error)
  }
}

/**
 * Belirli bir kayıt için audit log'ları getirir
 * @param {string} kayitId - Kayıt ID'si (UUID)
 * @param {string} tabloAdi - Tablo adı
 * @returns {Promise<Array>} Audit log kayıtları
 */
export const getAuditLogs = async (kayitId, tabloAdi) => {
  try {
    const { data, error } = await supabase
      .from('audit_log')
      .select('*')
      .eq('kayit_id', kayitId)
      .eq('tablo_adi', tabloAdi)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Audit log getirme hatası:', error)
    return []
  }
}

/**
 * Kullanıcının admin olup olmadığını kontrol eder
 * @param {string} email - Kullanıcı email'i
 * @returns {Promise<boolean>}
 */
export const isUserAdmin = async (email) => {
  try {
    const { data, error } = await supabase
      .from('kullanici_rolleri')
      .select('rol')
      .eq('email', email)
      .maybeSingle()

    if (error) throw error
    return data?.rol === 'admin'
  } catch (error) {
    console.error('Admin kontrol hatası:', error)
    return false
  }
}
