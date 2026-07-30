import React, { useState, useEffect } from 'react'
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Map, 
  Settings, 
  Download, 
  RefreshCw,
  Plus,
  MapPin,
  TrendingUp,
  UserCheck,
  ChevronRight
} from 'lucide-react'
import { fetchSektorData } from '../lib/pbbSupabase'

function SektorWilayah() {
  const [isLoading, setIsLoading] = useState(true)
  const [totalSektor, setTotalSektor] = useState(0)

  // 🛠️ STERIL: State daftar sektor wilayah kosong [], murni menunggu pasokan data asli dari database
  const [daftarSektor, setDaftarSektor] = useState([])

  // Fungsi Sinkronisasi Mengambil Data Sektor dari Database Backend
  useEffect(() => {
    setIsLoading(true)
    fetchSektorData()
      .then(({ daftarSektor: daftarSektorData, totalSektor: totalSektorData }) => {
        setDaftarSektor(daftarSektorData)
        setTotalSektor(totalSektorData)
      })
      .catch(error => {
        console.error('Gagal mengambil data sektor wilayah dari Supabase:', error)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  return (
    <div className="min-h-screen bg-[#f8fafc] flex text-slate-800 antialiased">
      
      {/* ========================================================= */}
      {/* 1. SIDEBAR DESKTOP VIEW (Identik dengan Cetakan Utama Anda) */}
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

          {/* Menu Navigasi (Sorot Aktif di Sektor Wilayah) */}
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
            <a href="#" className="flex items-center space-x-3 bg-slate-700/50 text-white px-4 py-3 rounded-xl font-semibold text-sm transition-all shadow-sm">
              <Map className="w-4 h-4 text-blue-400" />
              <span>Sektor Wilayah</span>
            </a>
            <a href="#" className="flex items-center space-x-3 text-slate-400 hover:bg-slate-800/60 hover:text-white px-4 py-3 rounded-xl font-medium text-sm transition-all">
              <Settings className="w-4 h-4" />
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
        
        {/* Row Header Top */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Sektor Wilayah PBB</h2>
            <p className="text-xs text-slate-400 mt-1">Pantau rincian objek pajak, beban target, dan progres pemungutan per wilayah penanggung jawab.</p>
          </div>
          <button className="flex items-center space-x-2 bg-[#002b8c] hover:bg-blue-950 text-white text-xs font-bold py-3 px-5 rounded-xl shadow-sm transition-all">
            <Plus className="w-4 h-4" />
            <span>Tambah Sektor Baru</span>
          </button>
        </div>

        {/* Efek Loading Database */}
        {isLoading ? (
          <div className="flex items-center justify-center p-20 text-slate-400 gap-2 font-medium text-sm">
            <RefreshCw className="w-4 h-4 animate-spin text-[#002b8c]" />
            <span>Sinkronisasi pembagian zonasi wilayah desa...</span>
          </div>
        ) : (
          <>
            {/* INFORMASI MATRIKS TOTAL SEKTOR */}
            <div className="text-xs text-slate-400 font-semibold tracking-wide uppercase bg-white px-5 py-4 border border-slate-200/60 rounded-2xl shadow-sm w-fit flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#002b8c]" />
              <span>Terdaftar: <strong className="text-slate-800 font-extrabold">{totalSektor} Sektor Administrasi</strong></span>
            </div>

            {/* GRID SEKTOR WILAYAH (CLEAN CARD DESIGNS) */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {daftarSektor.length > 0 ? (
                daftarSektor.map((sektor, index) => (
                  <div key={index} className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col justify-between">
                    
                    {/* Top Card: Judul Wilayah & Penanggung Jawab */}
                    <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                          {sektor.kode_sektor || `Sektor 0${index + 1}`}
                        </span>
                        <h3 className="text-lg font-extrabold text-slate-800 pt-1">{sektor.nama_sektor}</h3>
                      </div>
                      <div className="text-right flex items-center gap-2 bg-white px-3 py-1.5 border border-slate-200/60 rounded-xl">
                        <UserCheck className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">Penanggung Jawab</p>
                          <p className="text-xs font-bold text-slate-700">{sektor.penanggung_jawab}</p>
                        </div>
                      </div>
                    </div>

                    {/* Middle Card: Angka Akuntansi Finansial */}
                    <div className="p-6 grid grid-cols-3 gap-4 text-xs font-semibold">
                      <div>
                        <span className="text-slate-400 block pb-1">Total Wajib Pajak</span>
                        <span className="text-base font-bold text-slate-800">{sektor.total_wp} Jiwa</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block pb-1">Beban Target</span>
                        <span className="text-base font-extrabold text-slate-800">
                          Rp {sektor.target_nominal.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block pb-1">Telah Setor</span>
                        <span className="text-base font-extrabold text-emerald-600">
                          Rp {sektor.terrealisasi_nominal.toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Card: Progress Batangan Bar & Persentase */}
                    <div className="px-6 pb-6 pt-2 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-400 flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                          Progres Wilayah
                        </span>
                        <span className="text-slate-800">{sektor.persentase_progres}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-700 ${sektor.warna_tema || 'bg-[#002b8c]'}`} 
                          style={{ width: `${sektor.persentase_progres}%` }}
                        ></div>
                      </div>
                    </div>

                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-16 bg-white border border-slate-200/60 rounded-2xl text-sm text-slate-400 font-medium">
                  Belum ada pembagian sektor wilayah desa di database backend.
                </div>
              )}
            </div>
          </>
        )}

        {/* Global Footer Credit */}
        <footer className="text-center text-xs text-slate-400 mt-6 pt-4 border-t border-slate-200/60">
          <p>© 2026 Pemerintah Desa Randu. | Didesain oleh KKNT 128 Undip 2026</p>
        </footer>

      </main>
    </div>
  )
}

export default SektorWilayah