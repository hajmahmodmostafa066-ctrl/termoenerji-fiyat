import { supabase } from './supabase'

/**
 * Audit log ekleme fonksiyonu
 * @param {string} tabloAdi - Hangi tabloda işlem yapıldı
 * @param {string} kayitId - Hangi kayıt üzerinde işlem yapıldı
 * @param {string} islemTuru - INSERT, UPDATE, DELETE
 * @param {object} eskiVeri - Değişiklik öncesi veri
 * @param {object} yeniVeri - Değişiklik sonrası veri
 */
export const addAuditLog = async (tabloAdi, kayitId, islemTuru, eskiVeri = null, yeniVeri = null) => {
  try {
    // Oturum açmış kullanıcıyı al
    const { data: { user } } = await supabase.auth.getUser()
    const kullaniciEmail = user?.email || 'bilinmiyor'

    await supabase
      .from('audit_log')
      .insert([{
        tablo_adi: tabloAdi,
        kayit_id: kayitId,
        islem_turu: islemTuru,
        kullanici_email: kullaniciEmail,
        eski_veri: eskiVeri,
        yeni_veri: yeniVeri
      }])
  } catch (error) {
    console.error('Audit log hatası:', error)
  }
}
