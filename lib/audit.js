import { supabase } from './supabase'

export const addAuditLog = async (tabloAdi, kayitId, islemTuru, eskiVeri = null, yeniVeri = null) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    const kullaniciEmail = user?.email || 'bilinmiyor'

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

    if (error) console.error('Audit log hatası:', error)
  } catch (error) {
    console.error('Audit log hatası:', error)
  }
}

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
