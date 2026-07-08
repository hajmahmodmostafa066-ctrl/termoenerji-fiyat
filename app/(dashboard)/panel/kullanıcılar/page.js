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

  useEffect(() => {
    fetchKullanicilar()
  }, [])

  const fetchKullanicilar = async () => {
    setLoading(true)
    try {
      // Supabase Auth'dan kullanıcıları çek
      const { data, error } = await supabase.auth.admin.listUsers()
      if (error) throw error

      // Kullanıcı rollerini kendi tablomuzdan çek
      const { data: rolData, error: rolError } = await supabase
        .from('kullanici_rolleri')
        .select('*')

      if (rolError) throw rolError

      // Rolleri birleştir
      const kullanicilarWithRol = data.users.map(user => {
        const rol = rolData.find(r => r.email === user.email)
        return {
          ...user,
          rol: rol?.rol || 'kullanici'
        }
      })

      setKullanicilar(kullanicilarWithRol)
    } catch (error) {
      console.error('Kullanıcı yükleme hatası:', error)
      alert('❌ Hata: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRolDegistir = async (email, yeniRol) => {
    try {
      const { error } = await supabase
        .from('kullanici_rolleri')
        .upsert({ email, rol: yeniRol }, { onConflict: 'email' })

      if (error) throw error

      await fetchKullanicilar()
      alert('✅ Rol güncellendi!')
    } catch (error) {
      console.error('Rol güncelleme hatası:', error)
      alert('❌ Hata: ' + error.message)
    }
  }

  const handleKullaniciSil = async (userId) => {
    if (!confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) return

    try {
      const { error } = await supabase.auth.admin.deleteUser(userId)
      if (error) throw error

      await fetchKullanicilar()
      alert('✅ Kullanıcı silindi!')
    } catch (error) {
      console.error('Silme hatası:', error)
      alert('❌ Hata: ' + error.message)
    }
  }

  const handleYeniKullanici = async () => {
    if (!yeniEmail || !yeniSifre) {
      alert('❌ E-posta ve şifre girin!')
      return
    }

    setEklemeLoading(true)
    try {
      // Supabase Auth'a yeni kullanıcı ekle
      const { data, error } = await supabase.auth.admin.createUser({
        email: yeniEmail,
        password: yeniSifre,
        email_confirm: true
      })

      if (error) throw error

      // Rol tablosuna ekle
      if (data.user) {
        await supabase
          .from('kullanici_rolleri')
          .insert({ email: yeniEmail, rol: yeniRol })
      }

      setYeniEmail('')
      setYeniSifre('')
      setYeniRol('kullanici')
      await fetchKullanicilar()
      alert('✅ Kullanıcı eklendi!')
    } catch (error) {
      console.error('Ekleme hatası:', error)
      alert('❌ Hata: ' + error.message)
    } finally {
      setEklemeLoading(false)
    }
  }

  return (
    <div>
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
            placeholder="Şifre"
            className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
          <select
            value={yeniRol}
            onChange={(e) => setYeniRol(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            <option value="admin">Admin</option>
            <option value="yonetici">Yönetici</option>
            <option value="kullanici">Kullanıcı</option>
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
          <p className="text-slate-400">Yükleniyor...</p>
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
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Durum</th>
                <th className="text-right py-3 px-4 text-slate-400 font-medium">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {kullanicilar.map((user) => (
                <tr key={user.id} className="border-b border-slate-700/50 hover:bg-slate-800/30 transition">
                  <td className="py-3 px-4 text-white">{user.email}</td>
                  <td className="py-3 px-4">
                    <select
                      value={user.rol || 'kullanici'}
                      onChange={(e) => handleRolDegistir(user.email, e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    >
                      <option value="admin">Admin</option>
                      <option value="yonetici">Yönetici</option>
                      <option value="kullanici">Kullanıcı</option>
                    </select>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      user.email_confirmed_at ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {user.email_confirmed_at ? '✅ Onaylandı' : '⏳ Onaylanmadı'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleKullaniciSil(user.id)}
                      className="text-red-400 hover:text-red-300 transition"
                    >
                      🗑️ Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
