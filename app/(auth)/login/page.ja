'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Oturum kontrolü
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (session) {
        router.push('/panel')
      }
      if (error) {
        console.log('Session kontrol hatası:', error)
      }
    }
    checkSession()
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    console.log('Giriş deneniyor:', email) // Debug için

    try {
      // Önce bağlantıyı test et
      const { data: testData, error: testError } = await supabase.from('users').select('count').limit(1)
      if (testError) {
        console.log('Supabase bağlantı testi başarısız:', testError)
        throw new Error('Veritabanı bağlantısı kurulamadı')
      }
      console.log('Supabase bağlantısı başarılı ✅')

      // Giriş işlemi
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.log('Login error details:', error)
        throw error
      }

      console.log('Giriş başarılı ✅', data.user.email)
      router.push('/panel')
      
    } catch (error) {
      console.error('Login hatası:', error)
      
      // Türkçe hata mesajları
      const errorMap = {
        'Invalid login credentials': '❌ E-posta veya şifre hatalı',
        'Email not confirmed': '❌ E-posta adresiniz doğrulanmamış',
        'Too many requests': '⏳ Çok fazla deneme, lütfen 1 dakika bekleyin',
        'User not found': '❌ Bu e-posta ile kayıtlı kullanıcı bulunamadı',
        'Missing Supabase environment variables': '⚠️ Sunucu yapılandırması eksik'
      }
      
      setError(errorMap[error.message] || '❌ ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950/20 to-slate-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-800/30 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50 shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-2xl shadow-emerald-500/40 mb-4">
            <span className="text-4xl">⚡</span>
          </div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">
            TermoEnerji
          </h1>
          <p className="text-slate-400 text-sm mt-2">Fiyat Yönetim Sistemi</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">E-posta</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition"
              placeholder="ornek@firma.com"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1">Şifre</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition"
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm animate-pulse">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Giriş yapılıyor...
              </span>
            ) : (
              '🚀 Giriş Yap'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => router.push('/reset-password')}
            className="text-sm text-emerald-400 hover:text-emerald-300 transition"
          >
            Şifremi unuttum?
          </button>
        </div>

        <p className="text-xs text-slate-500 text-center mt-6">
          Yetkili kullanıcılar içindir.
        </p>
      </div>
    </div>
  )
}
