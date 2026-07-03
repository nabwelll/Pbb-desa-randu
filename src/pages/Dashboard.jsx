import React, { useState, useEffect } from 'react'
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Map, 
  Settings, 
  Download, 
  Copy, 
  RefreshCw,
  Menu,
  X
} from 'lucide-react'

// ==========================================================================
// 🛠️ TEMPAT MENARUH LINK BACKEND (Ganti di sini jika Backend sudah siap)
// ==========================================================================
const API_LINK_RINGKASAN = 'https://GANTI_DENGAN_LINK_BACKEND_KAMU/api/pbb/ringkasan';
const API_LINK_KADUS     = 'https://GANTI_DENGAN_LINK_BACKEND_KAMU/api/pbb/kadus';

function Dashboard() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // 1. State untuk menampung data ringkasan 4 kartu utama
  const [ringkasan, setRingkasan] = useState({
    targetDesa: 0,
    terkumpul: 0,
    sisa: 0,
    progres: 0
  })

  // 2. State untuk menampung data grafik wilayah kadus
  const [kadusData, setKadusData] = useState([])

  // 3. Fungsi Sinkronisasi Mengambil Data dari Database (Backend)
  useEffect(() => {
    // Mengambil data secara bersamaan dari kedua endpoint API
    Promise.all([
      fetch(API_LINK_RINGKASAN).then(res => res.json()),
      fetch(API_LINK_KADUS).then(res => res.json())
    ])
    .then(([dataRingkasan, dataKadus]) => {
      // Masukkan data asli dari database ke dalam state React
      setRingkasan({
        targetDesa: dataRingkasan.target_desa,
        terkumpul: dataRingkasan.terkumpul,
        sisa: dataRingkasan.sisa,
        progres: dataRingkasan.progres
      })
      setKadusData(dataKadus)
      setIsLoading(false)
    })
    .catch(error => {
      console.error("Gagal mengambil data dari database backend:", error)
      setIsLoading(false)
    })
  }, [])

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col md:flex-row text-slate-800 antialiased">
      
      {/* ========================================================= */}
      {/* 1. SIDEBAR DESKTOP */}
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

          {/* Menu Navigasi */}
          <nav className="p-3 space-y-1 mt-2">
            <a href="#" className="flex items-center space-x-3 bg-slate-700/50 text-white px-4 py-3 rounded-xl font-semibold text-sm transition-all shadow-sm">
              <LayoutDashboard className="w-4 h-4 text-blue-400" />
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
            <a href="#" className="flex items-center space-x-3 text-slate-400 hover:bg-slate-800/60 hover:text-white px-4 py-3 rounded-xl font-medium text-sm transition-all">
              <Settings className="w-4 h-4" />
              <span>Pengaturan</span>
            </a>
          </nav>
        </div>

        {/* Tombol Aksi & Credit Sidebar Bottom */}
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
      {/* 2. NAVBAR HEADER TOP MOBILE */}
      {/* ========================================================= */}
      <header className="md:hidden bg-[#002b8c] text-white p-4 flex items-center justify-between shadow-md sticky top-0 z-50">
        <h1 className="font-bold tracking-wide text-sm">PBB RANDU</h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-1 focus:outline-none">
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Dropdown Menu Drawer Mobile */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#1e293b] text-white p-4 space-y-2 border-b border-slate-700">
          <a href="#" className="block py-2.5 px-4 bg-slate-800 rounded-xl text-blue-400 font-bold text-sm">Dashboard</a>
          <a href="#" className="block py-2.5 px-4 text-slate-300 text-sm">Data Warga</a>
          <a href="#" className="block py-2.5 px-4 text-slate-300 text-sm">Laporan Pajak</a>
          <a href="#" className="block py-2.5 px-4 text-slate-300 text-sm">Sektor Wilayah</a>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. HALAMAN KONTEN UTAMA */}
      {/* ========================================================= */}
      <main className="flex-1 p-4 md:p-8 space-y-6 overflow-y-auto pb-24 md:pb-8 flex flex-col justify-between">
        
        <div className="space-y-6">
          {/* Row Judul Atas */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Ringkasan PBB 2026</h2>
              <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-full w-fit">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
                <span>Last updated: Real-time Database</span>
              </div>
            </div>
            <button className="text-xs font-bold border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 px-4 py-2 rounded-xl shadow-sm flex items-center space-x-1 self-start sm:self-auto transition-all">
              <span>Switch Role</span>
            </button>
          </div>

          {/* Efek Loading Animasi Halus Saat Menunggu Database */}
          {isLoading ? (
            <div className="flex items-center justify-center p-12 text-slate-400 gap-2 font-medium text-sm">
              <RefreshCw className="w-4 h-4 animate-spin text-[#002b8c]" />
              <span>Menghubungkan ke database PBB Randu...</span>
            </div>
          ) : (
            <>
              {/* ROW 4 KARTU RINGKASAN DATA REAL-TIME */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Target Desa</span>
                  <span className="text-xl font-extrabold text-slate-800 mt-2">
                    Rp {(ringkasan.targetDesa).toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Terkumpul</span>
                  <span className="text-xl font-extrabold text-blue-700 mt-2">
                    Rp {(ringkasan.terkumpul).toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sisa</span>
                  <span className="text-xl font-extrabold text-red-600 mt-2">
                    Rp {(ringkasan.sisa).toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Progres</span>
                    <span className="text-base font-extrabold text-slate-800">{ringkasan.progres}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full mt-4 overflow-hidden">
                    <div className="bg-[#002b8c] h-full rounded-full transition-all duration-500" style={{ width: `${ringkasan.progres}%` }}></div>
                  </div>
                </div>
              </div>

              {/* DUA TOMBOL AKSI UTAMA */}
              <div className="flex flex-wrap gap-3">
                <button className="flex items-center space-x-2 bg-[#002b8c] hover:bg-blue-950 text-white text-xs font-bold py-3 px-5 rounded-xl shadow-sm transition-all">
                  <Download className="w-4 h-4" />
                  <span>Import Excel SPPT 2026</span>
                </button>
                <button className="flex items-center space-x-2 bg-white border-2 border-[#002b8c] text-[#002b8c] hover:bg-blue-50/50 text-xs font-bold py-2.5 px-5 rounded-xl shadow-sm transition-all">
                  <Copy className="w-4 h-4" />
                  <span>Salin Tunggakan 2025 ke 2026</span>
                </button>
              </div>

              {/* BOX GRAFIK: PROGRES WILAYAH KADUS DARI DATABASE */}
              <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-100">
                  <h3 className="font-bold text-sm text-slate-700">Progres per Wilayah Kadus</h3>
                </div>
                <div className="p-6 space-y-5">
                  {kadusData.length > 0 ? (
                    kadusData.map((kadus, index) => (
                      <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between text-xs sm:text-sm">
                        <span className="w-32 font-semibold text-slate-600 mb-1 sm:mb-0">{kadus.nama_wilayah}</span>
                        <div className="flex-1 sm:mx-4 flex items-center space-x-3">
                          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                            <div className={`${kadus.warna_bar || 'bg-blue-600'} h-full rounded-full transition-all duration-700`} style={{ width: `${kadus.persentase}%` }}></div>
                          </div>
                          <span className="w-10 text-right font-bold text-slate-700">{kadus.persentase}%</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-4">Belum ada data wilayah tersedia.</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Global Footer Credit */}
        <footer className="text-center text-xs text-slate-400 mt-12 pt-4 border-t border-slate-200/60">
          <p>© 2026 Pemerintah Desa Randu. | Didesain oleh KKNT 128 Undip 2026</p>
        </footer>

      </main>

      {/* ========================================================= */}
      {/* 4. BOTTOM NAVIGATION UTAMA (Mobile View HP) */}
      {/* ========================================================= */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-2 z-40 shadow-lg">
        <a href="#" className="flex flex-col items-center text-[#002b8c] py-1">
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-bold">Beranda</span>
        </a>
        <a href="#" className="flex flex-col items-center text-slate-400 py-1">
          <Users className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-medium">Cari</span>
        </a>
        <a href="#" className="flex flex-col items-center text-slate-400 py-1">
          <FileText className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-medium">LPP</span>
        </a>
        <a href="#" className="flex flex-col items-center text-slate-400 py-1">
          <RefreshCw className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-medium">Riwayat</span>
        </a>
      </nav>

    </div>
  )
}

export default Dashboard