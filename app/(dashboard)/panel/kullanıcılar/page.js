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

  useEffect(() => {
    fetchKullanicilar()
    getMyInfo()
  }, [])

  // Giriş yapan kullanıcıyı al
  const getMyInfo = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setBenimBilgilerim(session.user)
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

  // Rol değiştir
  const handleRolDegistir = async (email, yeniRol) => {
    // Kendi rolünü değiştirmesin
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
    // Admin kullanıcının kendisini silemez
    const benimEmail = localStorage.getItem('userEmail')
    
    if (email === benimEmail) {
      alert('❌ Kendinizi silemezsiniz!')
      return
    }

    // Silinecek kullanıcı admin mi?
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

    // Email format kontrolü
    if (!yeniEmail.includes('@') || !yeniEmail.includes('.')) {
      alert('❌ Geçerli bir e-posta adresi girin!')
      return
    }

    // Şifre uzunluk kontrolü
    if (yeniSifre.length < 6) {
      alert('❌ Şifre en az 6 karakter olmalı!')
      return
    }

    setEklemeLoading(true)
    try {
      // 1. Kullanıcıyı Auth'a ekle
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

      // 2. Trigger otomatik olarak users tablosuna ekleyecek
      // 3. Rolünü güncelle (trigger 'user' olarak ekler, biz seçilen rolü verelim)
      if (yeniRol !== 'kullanici') {
        await supabase
          .from('users')
          .update({ role: yeniRol })
          .eq('email', yeniEmail)
      }

      setYeniEmail('')
      setYeniSifre('')
      setYeniRol('kullanici')
      
      // Listeyi yenile
      setTimeout(() => {
        fetchKullanicilar()
      }, 1500)
      
      alert('✅ Kullanıcı eklendi!')
    } catch (error) {
      console.error('Ekleme hatası:', error)
      
      // Özel hata mesajları
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
              <p className="text-white font-medium">{benimBilgilerim.email}</p>
              <p className="text-emerald-400 text-sm flex items-center gap-1">
                <span>✅</span> Giriş yaptınız
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-emerald-500/20 px-3 py-1 rounded-full text-emerald-400 text-xs font-medium">
              Admin
            </span>
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

      {/* Yeni Kullanıcı Ekle */}
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
                <th className="text-left py-3 px-4 text-slate-400 font-medium">E-posta</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Rol</th>
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
                      <span className="text-white">
                        {user.email}
                        {isBenim && (
                          <span className="ml-2 text-xs text-emerald-400">(Ben)</span>
                        )}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={user.role || 'kullanici'}
                        onChange={(e) => handleRolDegistir(user.email, e.target.value)}
                        disabled={isBenim || isAdmin}
                        className={`bg-slate-900 border border-slate-700 rounded-lg px-3 py-1 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                          isBenim || isAdmin ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <option value="kullanici">Kullanıcı</option>
                        <option value="yonetici">Yönetici</option>
                        <option value="admin">Admin</option>
                      </select>
                      {isBenim && <span className="text-xs text-slate-500 ml-2">(kendin)</span>}
                      {isAdmin && !isBenim && <span className="text-xs text-emerald-400 ml-2">🔒</span>}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        user.email_confirmed_at ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {user.email_confirmed_at ? '✅ Onaylı' : '⏳ Bekliyor'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleKullaniciSil(user.email)}
                        disabled={isBenim || isAdmin}
                        className={`text-red-400 hover:text-red-300 transition ${
                          isBenim || isAdmin ? 'opacity-30 cursor-not-allowed' : ''
                        }`}
                        title={isBenim ? 'Kendinizi silemezsiniz' : isAdmin ? 'Admin silinemez' : ''}
                      >
                        🗑️ Sil
                      </button>
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
    </div>
  )
}
