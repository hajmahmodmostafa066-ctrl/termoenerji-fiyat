'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'

export default function KullaniciPage() {
  const [kullanicilar, setKullanicilar] = useState([])
  const [loading, setLoading] = useState(true)
  const [yeniEmail, setYeniEmail] = useState('')
  const [yeniSifre, setYeniSifre] = useState('')
  const [yeniRol, setYeniRol] = useState('kullanici')
  const [eklemeLoading, setEklemeLoading] = useState(false)
  const [benimBilgilerim, setBenimBilgilerim] = useState(null)
  
  // Profil düzenleme state'leri
  const [profilDuzenle, setProfilDuzenle] = useState(false)
  const [duzenlenecekKullanici, setDuzenlenecekKullanici] = useState(null)
  const [duzenlemeLoading, setDuzenlemeLoading] = useState(false)

  useEffect(() => {
    fetchKullanicilar()
    getMyInfo()
  }, [])

  // Giriş yapan kullanıcıyı al
  const getMyInfo = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        // Users tablosundan ek bilgileri al
        const { data: userData, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', session.user.email)
          .single()
        
        setBenimBilgilerim({
          ...session.user,
          full_name: userData?.full_name || '',
          phone: userData?.phone || '',
          title: userData?.title || '',
          role: userData?.role || 'kullanici'
        })
        localStorage.setItem('userEmail', session.user.email)
      }
    } catch (error) {
      console.error('Kullanıcı bilgisi alınamadı:', error)
    }
  }

  // Kullanıcı listesini çek
  const fetchKullanicilar = async () => {
    setLoading(true)
    try {
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (usersError) throw usersError

      setKullanicilar(usersData || [])
    } catch (error) {
      console.error('Kullanıcı yükleme hatası:', error)
      alert('❌ Hata: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // Profil bilgilerini güncelle
  const handleProfilGuncelle = async (e) => {
    e.preventDefault()
    setDuzenlemeLoading(true)

    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: duzenlenecekKullanici.full_name,
          phone: duzenlenecekKullanici.phone,
          title: duzenlenecekKullanici.title
        })
        .eq('email', duzenlenecekKullanici.email)

      if (error) throw error

      // Benim bilgilerimi güncelle
      if (duzenlenecekKullanici.email === localStorage.getItem('userEmail')) {
        setBenimBilgilerim(prev => ({
          ...prev,
          full_name: duzenlenecekKullanici.full_name,
          phone: duzenlenecekKullanici.phone,
          title: duzenlenecekKullanici.title
        }))
      }

      await fetchKullanicilar()
      setProfilDuzenle(false)
      setDuzenlenecekKullanici(null)
      alert('✅ Profil bilgileri güncellendi!')
    } catch (error) {
      console.error('Güncelleme hatası:', error)
      alert('❌ Hata: ' + error.message)
    } finally {
      setDuzenlemeLoading(false)
    }
  }

  // Rol değiştir
  const handleRolDegistir = async (email, yeniRol) => {
    if (email === localStorage.getItem('userEmail')) {
      alert('❌ Kendi rolünüzü değiştiremezsiniz!')
      return
    }

    try {
      const { error } = await supabase
        .from('users')
        .update({ role: yeniRol })
        .eq('email', email)

      if (error) throw error

      await fetchKullanicilar()
      alert('✅ Rol güncellendi!')
    } catch (error) {
      console.error('Rol güncelleme hatası:', error)
      alert('❌ Hata: ' + error.message)
    }
  }

  // Kullanıcı sil
  const handleKullaniciSil = async (email) => {
    const benimEmail = localStorage.getItem('userEmail')
    
    if (email === benimEmail) {
      alert('❌ Kendinizi silemezsiniz!')
      return
    }

    const silinecekKullanici = kullanicilar.find(u => u.email === email)
    if (silinecekKullanici?.role === 'admin') {
      alert('❌ Admin kullanıcıyı silemezsiniz!')
      return
    }

    if (!confirm(`${email} kullanıcısını silmek istediğinize emin misiniz?`)) return

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('email', email)

      if (error) throw error

      await fetchKullanicilar()
      alert('✅ Kullanıcı silindi!')
    } catch (error) {
      console.error('Silme hatası:', error)
      alert('❌ Hata: ' + error.message)
    }
  }

  // Yeni kullanıcı ekle
  const handleYeniKullanici = async () => {
    if (!yeniEmail || !yeniSifre) {
      alert('❌ E-posta ve şifre girin!')
      return
    }

    if (!yeniEmail.includes('@') || !yeniEmail.includes('.')) {
      alert('❌ Geçerli bir e-posta adresi girin!')
      return
    }

    if (yeniSifre.length < 6) {
      alert('❌ Şifre en az 6 karakter olmalı!')
      return
    }

    setEklemeLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email: yeniEmail,
        password: yeniSifre,
        options: {
          data: {
            role: yeniRol
          }
        }
      })

      if (error) throw error

      if (yeniRol !== 'kullanici') {
        await supabase
          .from('users')
          .update({ role: yeniRol })
          .eq('email', yeniEmail)
      }

      setYeniEmail('')
      setYeniSifre('')
      setYeniRol('kullanici')
      
      setTimeout(() => {
        fetchKullanicilar()
      }, 1500)
      
      alert('✅ Kullanıcı eklendi!')
    } catch (error) {
      console.error('Ekleme hatası:', error)
      if (error.message.includes('User already registered')) {
        alert('❌ Bu e-posta zaten kayıtlı!')
      } else {
        alert('❌ Hata: ' + error.message)
      }
    } finally {
      setEklemeLoading(false)
    }
  }

  // Çıkış yap
  const handleCikis = async () => {
    if (confirm('Çıkış yapmak istediğinize emin misiniz?')) {
      await supabase.auth.signOut()
      localStorage.removeItem('userEmail')
      window.location.href = '/login'
    }
  }

  // Profil düzenleme modal'ını aç
  const profiliDuzenle = (user) => {
    setDuzenlenecekKullanici({
      email: user.email,
      full_name: user.full_name || '',
      phone: user.phone || '',
      title: user.title || '',
      role: user.role || 'kullanici'
    })
    setProfilDuzenle(true)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Kullanıcı Bilgileri - ÜST BANNER */}
      {benimBilgilerim && (
        <div className="bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 border border-emerald-500/30 rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center text-xl">
              👤
            </div>
            <div>
              <p className="text-white font-medium">
                {benimBilgilerim.full_name || benimBilgilerim.email}
              </p>
              <p className="text-slate-400 text-sm flex items-center gap-1">
                <span>📧</span> {benimBilgilerim.email}
                <span className="ml-2 text-emerald-400 text-xs bg-emerald-500/20 px-2 py-0.5 rounded-full">
                  {benimBilgilerim.role === 'admin' ? '👑 Admin' : 
                   benimBilgilerim.role === 'yonetici' ? '⚙️ Yönetici' : '👤 Kullanıcı'}
                </span>
              </p>
              {benimBilgilerim.title && (
                <p className="text-xs text-slate-500">{benimBilgilerim.title}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => profiliDuzenle(benimBilgilerim)}
              className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 px-4 py-2 rounded-lg transition text-sm"
            >
              ✏️ Profili Düzenle
            </button>
            <button
              onClick={handleCikis}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg transition text-sm"
            >
              🚪 Çıkış Yap
            </button>
          </div>
        </div>
      )}

      <h1 className="text-2xl font-bold text-white mb-6">👥 Kullanıcılar</h1>

      {/* Yeni Kullanıcı Ekle - Sadece Admin Görebilir */}
      {benimBilgilerim?.role === 'admin' && (
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">➕ Yeni Kullanıcı Ekle</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="email"
              value={yeniEmail}
              onChange={(e) => setYeniEmail(e.target.value)}
              placeholder="E-posta"
              className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
            <input
              type="password"
              value={yeniSifre}
              onChange={(e) => setYeniSifre(e.target.value)}
              placeholder="Şifre (en az 6 karakter)"
              className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
            <select
              value={yeniRol}
              onChange={(e) => setYeniRol(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="kullanici">Kullanıcı</option>
              <option value="yonetici">Yönetici</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button
            onClick={handleYeniKullanici}
            disabled={eklemeLoading}
            className="mt-4 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg transition disabled:opacity-50"
          >
            {eklemeLoading ? 'Ekleniyor...' : '➕ Ekle'}
          </button>
        </div>
      )}

      {/* Kullanıcı Listesi */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent"></div>
          <p className="text-slate-400 mt-3">Yükleniyor...</p>
        </div>
      ) : kullanicilar.length === 0 ? (
        <div className="text-center py-12 bg-slate-800/50 rounded-xl border border-slate-700">
          <p className="text-slate-400">Henüz kullanıcı yok</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-slate-800/50 rounded-xl border border-slate-700">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-800">
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Kullanıcı</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Rol</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">İletişim</th>
                <th className="text-center py-3 px-4 text-slate-400 font-medium">Durum</th>
                <th className="text-right py-3 px-4 text-slate-400 font-medium">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {kullanicilar.map((user) => {
                const benimEmail = localStorage.getItem('userEmail')
                const isBenim = user.email === benimEmail
                const isAdmin = user.role === 'admin'

                return (
                  <tr key={user.id} className={`border-b border-slate-700/50 hover:bg-slate-800/30 transition ${isBenim ? 'bg-emerald-500/5' : ''}`}>
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-white font-medium">
                          {user.full_name || user.email}
                          {isBenim && (
                            <span className="ml-2 text-xs text-emerald-400">(Ben)</span>
                          )}
                        </p>
                        <p className="text-slate-500 text-xs">{user.email}</p>
                        {user.title && (
                          <p className="text-slate-500 text-xs">{user.title}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {isBenim ? (
                        <span className="text-slate-400 text-xs">(kendin)</span>
                      ) : (
                        <select
                          value={user.role || 'kullanici'}
                          onChange={(e) => handleRolDegistir(user.email, e.target.value)}
                          disabled={isAdmin}
                          className={`bg-slate-900 border border-slate-700 rounded-lg px-3 py-1 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                            isAdmin ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          <option value="kullanici">Kullanıcı</option>
                          <option value="yonetici">Yönetici</option>
                          <option value="admin">Admin</option>
                        </select>
                      )}
                      {isAdmin && !isBenim && <span className="text-xs text-emerald-400 ml-2">🔒</span>}
                    </td>
                    <td className="py-3 px-4">
                      {user.phone ? (
                        <span className="text-slate-300 text-xs">{user.phone}</span>
                      ) : (
                        <span className="text-slate-500 text-xs">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        user.email_confirmed_at ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {user.email_confirmed_at ? '✅ Onaylı' : '⏳ Bekliyor'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => profiliDuzenle(user)}
                          className="text-blue-400 hover:text-blue-300 transition text-sm"
                          title="Profili Düzenle"
                        >
                          ✏️
                        </button>
                        {!isBenim && !isAdmin && (
                          <button
                            onClick={() => handleKullaniciSil(user.email)}
                            className="text-red-400 hover:text-red-300 transition text-sm"
                            title="Sil"
                          >
                            🗑️
                          </button>
                        )}
                        {isAdmin && !isBenim && (
                          <span className="text-xs text-slate-500">🔒</span>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Toplam Kullanıcı Sayısı */}
      {!loading && (
        <div className="mt-4 text-sm text-slate-400">
          Toplam: {kullanicilar.length} kullanıcı
        </div>
      )}

      {/* PROFİL DÜZENLEME MODAL */}
      {profilDuzenle && duzenlenecekKullanici && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-6 max-w-md w-full border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">✏️ Profili Düzenle</h2>
              <button
                onClick={() => setProfilDuzenle(false)}
                className="text-slate-400 hover:text-white transition"
              >
                ✕
              </button>
            </div>
            <p className="text-slate-400 text-sm mb-4">{duzenlenecekKullanici.email}</p>
            
            <form onSubmit={handleProfilGuncelle} className="space-y-4">
              <div>
                <label className="text-sm text-slate-300 block mb-1">Ad Soyad</label>
                <input
                  type="text"
                  value={duzenlenecekKullanici.full_name || ''}
                  onChange={(e) => setDuzenlenecekKullanici({
                    ...duzenlenecekKullanici,
                    full_name: e.target.value
                  })}
                  placeholder="Ad Soyad"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
              
              <div>
                <label className="text-sm text-slate-300 block mb-1">Telefon</label>
                <input
                  type="text"
                  value={duzenlenecekKullanici.phone || ''}
                  onChange={(e) => setDuzenlenecekKullanici({
                    ...duzenlenecekKullanici,
                    phone: e.target.value
                  })}
                  placeholder="Telefon"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
              
              <div>
                <label className="text-sm text-slate-300 block mb-1">Unvan</label>
                <input
                  type="text"
                  value={duzenlenecekKullanici.title || ''}
                  onChange={(e) => setDuzenlenecekKullanici({
                    ...duzenlenecekKullanici,
                    title: e.target.value
                  })}
                  placeholder="Unvan (Örn: Satış Müdürü)"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setProfilDuzenle(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={duzenlemeLoading}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
                >
                  {duzenlemeLoading ? 'Kaydediliyor...' : '💾 Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
