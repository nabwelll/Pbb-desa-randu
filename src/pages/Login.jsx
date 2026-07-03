import React, { useState } from 'react'
import { User, Lock, ArrowRight, RefreshCw } from 'lucide-react'

// ==========================================================================
// 🛠️ TEMPAT MENARUH LINK BACKEND LOGIN (Ganti di sini jika Backend sudah siap)
// ==========================================================================
const API_LINK_LOGIN = 'https://GANTI_DENGAN_LINK_BACKEND_KAMU/api/login';

function Login({ onLoginSuccess }) {
  // State untuk menangani input form dan status server
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // 1. Validasi awal di sisi klien (Frontend)
    if (username.trim() === '' || password.trim() === '') {
      setError('Username dan kata sandi tidak boleh kosong!')
      return
    }

    setError('')
    setIsSubmitting(true)

    // 2. Kirim data akun ke Database Backend untuk diverifikasi
    fetch(API_LINK_LOGIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username,
        password: password
      })
    })
    .then(async (res) => {
      if (res.ok) {
        // Jika akun cocok dengan database, langsung picu masuk halaman dashboard
        onLoginSuccess()
      } else {
        // Jika server menolak (misal salah password), tangkap pesan errornya
        const errorData = await res.json()
        throw new Error(errorData.message || 'Username atau kata sandi Anda salah!')
      }
    })
    .catch((err) => {
      console.error("Gagal melakukan proses autentikasi:", err)
      setError(err.message || 'Gagal terhubung ke server backend.')
    })
    .finally(() => {
      setIsSubmitting(false)
    })
  }

  return (
    <div className="min-h-screen bg-[#1a1d24] flex items-center justify-center p-4">
      {/* Card Utama */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 flex flex-col items-center">
        
        {/* logo undip dan kknt */}
        <div className="flex items-center justify-center mb-6">
          <img 
            src="/logo-undip.png" 
            alt="Logo UNDIP" 
            className="h-22 w-auto object-contain transition-transform hover:scale-105" 
            onError={(e) => { e.target.src = "/logo-undip.png.png" }}
          />
          <img 
            src="/logo-kknt.png" 
            alt="Logo KKNT" 
            className="h-32 w-auto object-contain transition-transform hover:scale-105" 
            onError={(e) => { e.target.src = "/logo-kknt.png.png" }}
          />
        </div>

        {/* Judul Teks */}
        <h2 className="text-2xl font-bold text-slate-800 mb-1">Portal PBB Randu</h2>
        <p className="text-sm text-slate-500 mb-8 text-center">
          Silakan masuk dengan akun perangkat desa Anda
        </p>

        {/* Notifikasi Pesan Error Nyata dari Database */}
        {error && (
          <div className="w-full bg-red-50 text-red-600 text-xs font-semibold p-3 rounded-xl mb-4 border border-red-100 animate-fade-in">
            {error}
          </div>
        )}

        {/* Form Input */}
        <form onSubmit={handleSubmit} className="w-full space-y-5">
          {/* Input Username */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Username / ID Pegawai
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <User className="w-5 h-5" />
              </span>
              <input
                type="text"
                placeholder="Masukkan ID Anda"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isSubmitting}
                className="w-full pl-10 pr-4 py-3 bg-[#f8fafc] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent text-slate-800 placeholder-slate-400 transition-all disabled:opacity-60"
              />
            </div>
          </div>

          {/* Input Password */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Kata Sandi
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Lock className="w-5 h-5" />
              </span>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                className="w-full pl-10 pr-4 py-3 bg-[#f8fafc] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent text-slate-800 placeholder-slate-400 transition-all disabled:opacity-60"
              />
            </div>
          </div>

          {/* Opsi Ingat Saya & Lupa Sandi */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center space-x-2 text-slate-600 cursor-pointer">
              <input type="checkbox" disabled={isSubmitting} className="rounded text-blue-900 focus:ring-blue-900 w-4 h-4" />
              <span>Ingat Saya</span>
            </label>
            <a href="#lupa" className="text-blue-900 font-semibold hover:underline">
              Lupa Sandi?
            </a>
          </div>

          {/* Tombol Masuk - Loading State Handle */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#002b8c] hover:bg-blue-950 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition-all mt-4 group disabled:bg-blue-800/70"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin mr-1" />
                <span>Memverifikasi Akun...</span>
              </>
            ) : (
              <>
                <span>Masuk ke Sistem</span>
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>

        {/* Garis Pembatas Footer */}
        <div className="w-full border-t border-slate-100 my-6"></div>

        {/* Copyright Footer */}
        <div className="text-center text-xs text-slate-400 leading-relaxed">
          <p>© 2026 Pemerintah Desa Randu.</p>
          <p>Didesain oleh Tim KKNT 128 UNDIP 2026.</p>
        </div>

      </div>
    </div>
  )
}

export default Login