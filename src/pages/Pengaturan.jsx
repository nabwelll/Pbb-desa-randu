import React, { useState, useEffect } from 'react'
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Map, 
  Settings, 
  Download, 
  RefreshCw,
  Save,
  Shield,
  Building,
  CheckCircle2
} from 'lucide-react'

// ==========================================================================
// 🛠️ TEMPAT MENARUH LINK BACKEND SETTINGS (Ganti di sini jika Backend sudah siap)
// ==========================================================================
const API_LINK_SETTINGS = 'https://GANTI_DENGAN_LINK_BACKEND_KAMU/api/pbb/settings';

function Pengaturan() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [notifikasi, setNotifikasi] = useState('')

  // 🛠️ STERIL: State Form Profil Desa & Akun (Kosong murni, menunggu database)
  const [formDesa, setFormDesa] = useState({
    namaDesa: '',
    kecamatan: '',
    kabupaten: '',
    tahunAnggaran: '',
    targetNominalDesa: 0
  })

  const [formAkun, setFormAkun] = useState({
    usernameLama: '',
    passwordBaru: '',
    konfirmasiPassword: ''
  })

  // Fungsi Ambil Data Pengaturan yang Tersimpan di Database
  useEffect(() => {
    setIsLoading(true)
    fetch(API_LINK_SETTINGS)
      .then(res => res.json())
      .then(dataAsli => {
        if (dataAsli) {
          setFormDesa({
            namaDesa: dataAsli.nama_desa || '',
            kecamatan: dataAsli.kecamatan || '',
            kabupaten: dataAsli.kabupaten || '',
            tahunAnggaran: dataAsli.tahun_anggaran || '',
            targetNominalDesa: dataAsli.target_nominal || 0
          })
        }
        setIsLoading(false)
      })
      .catch(error => {
        console.error("Gagal memuat konfigurasi pengaturan:", error)
        setIsLoading(false)
      })
  }, [])

  // Fungsi Menyimpan Perubahan Pengaturan ke Backend (HTTP POST/PUT)
  const handleSaveDesa = (e) => {
    e.preventDefault()
    setIsSaving(true)
    
    fetch(API_LINK_SETTINGS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formDesa)
    })
    .then(res => {
      if(res.ok) {
        setNotifikasi('Konfigurasi profil desa berhasil diperbarui!')
        setTimeout(() => setNotifikasi(''), 3000)
      }
    })
    .catch(err => console.error("Gagal menyimpan pengaturan desa:", err))
    .finally(() => setIsSaving(false))
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex text-slate-800 antialiased">
      
      {/* ========================================================= */}
      {/* 1. SIDEBAR DESKTOP VIEW (Identik dengan Seluruh Modul Anda) */}
      {/* ========================================================= */}
      <aside className="hidden md:flex md:w-64 bg-[#1e293b] text-white flex-col justify-between flex-shrink-0 border-r border-slate-200">
        <div className="flex flex-col">
          {/* Header Sidebar Brand */}
          <div className="bg-[#002b8c] px-6 py-4 flex items-center space-x-2 shadow-sm">
            <span className="font-bold text-base tracking-wider text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              PBB RANDU
            </span>
          </div>
          
          {/* Profil Admin */}
          <div className="p-5 border-b border-slate-700/50 bg-slate-800/30">
            <h4 className="font-bold text-sm text-slate-100">Sekdes Randu</h4>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Administrator</p>
          </div>

          {/* Menu Navigasi (Sorot Aktif di Pengaturan) */}
          <nav className="p-3 space-y-1 mt-2">
            <a href="#" className="flex items-center space-x-3 text-slate-400 hover:bg-slate-800/60 hover:text-white px-4 py-3 rounded-xl font-medium text-sm transition-all">
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </a>
            <a href="#" className="flex items-center space-x-3 text-slate-400 hover:bg-slate-800/60 hover:text-white px-4 py-3 rounded-xl font-medium text-sm transition-all">
              <Users className="w-4 h-4" />
              <span>Data Warga</span>
            </a>
            <a href="#" className="flex items-center space-x-3 text-slate-400 hover:bg-slate-800/60 hover:text-white px-4 py-3 rounded-xl font-medium text-sm transition-all">
              <FileText className="w-4 h-4" />
              <span>Laporan Pajak</span>
            </a>
            <a href="#" className="flex items-center space-x-3 text-slate-400 hover:bg-slate-800/60 hover:text-white px-4 py-3 rounded-xl font-medium text-sm transition-all">
              <Map className="w-4 h-4" />
              <span>Sektor Wilayah</span>
            </a>
            <a href="#" className="flex items-center space-x-3 bg-slate-700/50 text-white px-4 py-3 rounded-xl font-semibold text-sm transition-all shadow-sm">
              <Settings className="w-4 h-4 text-blue-400" />
              <span>Pengaturan</span>
            </a>
          </nav>
        </div>

        {/* Sidebar Bottom Action */}
        <div className="p-4 space-y-3">
          <button className="w-full flex items-center justify-center space-x-2 bg-[#2563eb] hover:bg-blue-700 text-white py-2.5 px-4 rounded-xl text-xs font-semibold shadow-sm transition-all">
            <FileText className="w-4 h-4" />
            <span>Import Excel</span>
          </button>
          <div className="text-center pt-1 border-t border-slate-700/40">
            <p className="text-[10px] text-slate-500 font-medium tracking-wide">
              Didesain oleh KKNT 128 Undip 2026
            </p>
          </div>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* 2. MAIN CONTENT AREA (Lapang Desktop) */}
      {/* ========================================================= */}
      <main className="flex-1 p-8 space-y-6 overflow-y-auto">
        
        {/* Header Title */}
        <div className="border-b border-slate-200 pb-4">
          <h2 className="text-2xl font-bold text-slate-800">Pengaturan Sistem</h2>
          <p className="text-xs text-slate-400 mt-1">Konfigurasikan variabel data makro desa serta hak akses keamanan utama portal PBB.</p>
        </div>

        {/* Notifikasi Toast Berhasil */}
        {notifikasi && (
          <div className="bg-emerald-50 text-emerald-600 text-xs font-bold p-4 rounded-xl border border-emerald-100 flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>{notifikasi}</span>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center p-20 text-slate-400 gap-2 font-medium text-sm">
            <RefreshCw className="w-4 h-4 animate-spin text-[#002b8c]" />
            <span>Sinkronisasi lembar berkas konfigurasi sistem...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
            
            {/* Form Kolom Kiri: Profil Wilayah Desa */}
            <form onSubmit={handleSaveDesa} className="xl:col-span-2 bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 space-y-5">
              <div className="flex items-center gap-2 text-slate-800 font-bold border-b border-slate-100 pb-3">
                <Building className="w-5 h-5 text-[#002b8c]" />
                <h3 className="text-sm uppercase tracking-wider">Profil Wilayah Kerja</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                <div className="space-y-2">
                  <label className="text-slate-600">Nama Desa / Kelurahan</label>
                  <input type="text" value={formDesa.namaDesa} onChange={(e) => setFormDesa({...formDesa, namaDesa: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 text-slate-800" placeholder="Contoh: Desa Randu" />
                </div>
                <div className="space-y-2">
                  <label className="text-slate-600">Tahun Anggaran PBB</label>
                  <input type="text" value={formDesa.tahunAnggaran} onChange={(e) => setFormDesa({...formDesa, tahunAnggaran: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 text-slate-800" placeholder="Contoh: 2026" />
                </div>
                <div className="space-y-2">
                  <label className="text-slate-600">Kecamatan</label>
                  <input type="text" value={formDesa.kecamatan} onChange={(e) => setFormDesa({...formDesa, kecamatan: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 text-slate-800" placeholder="Kecamatan" />
                </div>
                <div className="space-y-2">
                  <label className="text-slate-600">Kabupaten</label>
                  <input type="text" value={formDesa.kabupaten} onChange={(e) => setFormDesa({...formDesa, kabupaten: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 text-slate-800" placeholder="Kabupaten" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-slate-600">Target Nominal Total PBB Desa (Rp)</label>
                  <input type="number" value={formDesa.targetNominalDesa} onChange={(e) => setFormDesa({...formDesa, targetNominalDesa: parseInt(e.target.value) || 0})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 font-mono text-slate-800" />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 flex justify-end">
                <button type="submit" disabled={isSaving} className="flex items-center space-x-2 bg-[#002b8c] hover:bg-blue-950 text-white text-xs font-bold py-3 px-5 rounded-xl shadow-sm transition-all disabled:opacity-60">
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Menyimpan...' : 'Simpan Profil Desa'}</span>
                </button>
              </div>
            </form>

            {/* Form Kolom Kanan: Hak Akses Keamanan */}
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 space-y-5">
              <div className="flex items-center gap-2 text-slate-800 font-bold border-b border-slate-100 pb-3">
                <Shield className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm uppercase tracking-wider">Kredensial Akun</h3>
              </div>

              <div className="space-y-4 text-xs font-semibold">
                <div className="space-y-2">
                  <label className="text-slate-600">Username Perangkat</label>
                  <input type="text" value={formAkun.usernameLama} onChange={(e) => setFormAkun({...formAkun, usernameLama: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 text-slate-800" placeholder="Sekdes Randu" />
                </div>
                <div className="space-y-2">
                  <label className="text-slate-600">Kata Sandi Baru</label>
                  <input type="password" value={formAkun.passwordBaru} onChange={(e) => setFormAkun({...formAkun, passwordBaru: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 text-slate-800" placeholder="••••••••" />
                </div>
                <div className="space-y-2">
                  <label className="text-slate-600">Konfirmasi Sandi Baru</label>
                  <input type="password" value={formAkun.konfirmasiPassword} onChange={(e) => setFormAkun({...formAkun, konfirmasiPassword: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 text-slate-800" placeholder="••••••••" />
                </div>
                <button type="button" className="w-full bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold py-3 px-4 rounded-xl shadow-sm transition-all mt-2">
                  Perbarui Kata Sandi
                </button>
              </div>
            </div>

          </div>
        )}

        {/* Global Footer Credit */}
        <footer className="text-center text-xs text-slate-400 mt-6 pt-4 border-t border-slate-200/60">
          <p>© 2026 Pemerintah Desa Randu. | Didesain oleh KKNT 128 Undip 2026</p>
        </footer>

      </main>
    </div>
  )
}

export default Pengaturan