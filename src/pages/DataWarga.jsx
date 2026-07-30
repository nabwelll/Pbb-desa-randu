import React, { useState, useEffect } from 'react'
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Map, 
  Settings, 
  Download, 
  RefreshCw,
  Menu,
  X,
  Search,
  Plus,
  Eye,
  Edit,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { fetchWargaData } from '../lib/pbbSupabase'

function DataWarga() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  // State Filter & Pencarian
  const [searchTerm, setSearchTerm] = useState('')
  const [filterWilayah, setFilterWilayah] = useState('Semua Wilayah')
  const [filterStatus, setFilterStatus] = useState('Semua Status')

  // 🛠️ SUDAH BERSIH: State di-set kosong, murni menunggu data dari database backend
  const [dataWarga, setDataWarga] = useState([])

  // Fungsi Sinkronisasi Mengambil Data dari Database (Backend)
  useEffect(() => {
    setIsLoading(true)
    fetchWargaData()
      .then((dataAsli) => {
        setDataWarga(dataAsli)
      })
      .catch((error) => {
        console.error('Gagal mengambil data warga dari Supabase:', error)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  // Logika Filter & Live Search Otomatis
  const filteredData = dataWarga.filter(warga => {
    // Antisipasi error jika data properti dari backend ada yang kosong (null/undefined)
    const cocokKeyword = (warga.nama?.toLowerCase().includes(searchTerm.toLowerCase()) || false) || (warga.nop?.includes(searchTerm) || false)
    const cocokWilayah = filterWilayah === 'Semua Wilayah' || warga.wilayah === filterWilayah
    const cocokStatus = filterStatus === 'Semua Status' || warga.status === filterStatus
    return cocokKeyword && cocokWilayah && cocokStatus
  })

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col md:flex-row text-slate-800 antialiased">
      
      {/* ========================================================= */}
      {/* 1. SIDEBAR DESKTOP (Sesuai Struktur Acuan Dashboard Anda) */}
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
          <div className="p-4 border-b border-slate-700/50 flex items-center space-x-3 bg-slate-800/30">
            <div className="w-10 h-10 rounded-full bg-slate-600 overflow-hidden border border-slate-500 flex items-center justify-center font-bold text-sm text-white">
              Sekdes
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-100">Sekdes Randu</h4>
              <p className="text-xs text-slate-400 font-medium">Administrator</p>
            </div>
          </div>

          {/* Menu Navigasi (Sorot Aktif di Data Warga) */}
          <nav className="p-3 space-y-1 mt-2">
            <a href="#" className="flex items-center space-x-3 text-slate-400 hover:bg-slate-800/60 hover:text-white px-4 py-3 rounded-xl font-medium text-sm transition-all">
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </a>
            <a href="#" className="flex items-center space-x-3 bg-slate-700/50 text-white px-4 py-3 rounded-xl font-semibold text-sm transition-all shadow-sm">
              <Users className="w-4 h-4 text-blue-400" />
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

        {/* Tombol Bawah Sidebar */}
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

      {/* Menu Drawer Mobile */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#1e293b] text-white p-4 space-y-2 border-b border-slate-700">
          <a href="#" className="block py-2.5 px-4 text-slate-300 text-sm">Dashboard</a>
          <a href="#" className="block py-2.5 px-4 bg-slate-800 rounded-xl text-blue-400 font-bold text-sm">Data Warga</a>
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
              <h2 className="text-2xl font-bold text-slate-800">Manajemen Data Warga</h2>
              <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-full w-fit">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
                <span>Last updated: Real-time Database</span>
              </div>
            </div>
            <button className="flex items-center space-x-2 bg-[#002b8c] hover:bg-blue-950 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-sm transition-all">
              <Plus className="w-4 h-4" />
              <span>Tambah Warga</span>
            </button>
          </div>

          {/* Handler Animasi Loading Menunggu Data Backend */}
          {isLoading ? (
            <div className="flex items-center justify-center p-12 text-slate-400 gap-2 font-medium text-sm">
              <RefreshCw className="w-4 h-4 animate-spin text-[#002b8c]" />
              <span>Memuat lembar data warga dari database...</span>
            </div>
          ) : (
            <>
              {/* BAR FILTER & CONTROL PENCARIAN */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col lg:flex-row gap-3">
                <div className="flex-1 relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Cari berdasarkan NOP atau Nama Warga..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all placeholder-slate-400"
                  />
                </div>
                <select value={filterWilayah} onChange={(e) => setFilterWilayah(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 focus:outline-none">
                  <option>Semua Wilayah</option>
                  <option>Kadus 1</option>
                  <option>Kadus 2</option>
                  <option>Kadus 3</option>
                  <option>Kadus 4</option>
                </select>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 focus:outline-none">
                  <option>Semua Status</option>
                  <option>Lunas</option>
                  <option>Belum Lunas</option>
                </select>
              </div>

              {/* TABLE DESKTOP VIEW */}
              <div className="hidden md:block bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        <th className="px-6 py-4">Nomor Objek Pajak (NOP)</th>
                        <th className="px-6 py-4">Nama Wajib Pajak</th>
                        <th className="px-6 py-4">Wilayah / RT</th>
                        <th className="px-6 py-4">Tagihan PBB</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                      {filteredData.length > 0 ? (
                        filteredData.map((warga) => (
                          <tr key={warga.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 font-mono text-xs text-slate-400 font-semibold tracking-wide">{warga.nop}</td>
                            <td className="px-6 py-4 font-bold text-slate-800">{warga.nama}</td>
                            <td className="px-6 py-4">
                              <span className="block text-slate-800 text-xs font-bold">{warga.wilayah}</span>
                              <span className="text-[11px] text-slate-400">RT {warga.rt}</span>
                            </td>
                            <td className="px-6 py-4 font-extrabold text-slate-800">Rp {warga.tagihan?.toLocaleString('id-ID')}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-bold ${
                                warga.status === 'Lunas' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                              }`}>{warga.status}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center space-x-1">
                                <button className="p-2 text-slate-400 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-all"><Eye className="w-4 h-4" /></button>
                                <button className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"><Edit className="w-4 h-4" /></button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="text-center py-12 text-sm text-slate-400 font-medium">
                            Belum ada data warga di database.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* CARD MOBILE VIEW */}
              <div className="md:hidden space-y-3">
                {filteredData.length > 0 ? (
                  filteredData.map((warga) => (
                    <div key={warga.id} className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-slate-800 text-base">{warga.nama}</h4>
                          <p className="text-xs font-mono text-slate-400 mt-0.5">NOP: {warga.nop}</p>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${warga.status === 'Lunas' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'}`}>{warga.status}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs border-t border-slate-100 pt-2">
                        <div>
                          <span className="block text-slate-400 text-[10px]">Wilayah</span>
                          <span className="font-semibold text-slate-700">{warga.wilayah}, RT {warga.rt}</span>
                        </div>
                        <div className="text-right">
                          <span className="block text-slate-400 text-[10px]">Tagihan</span>
                          <span className="font-bold text-blue-700">Rp {warga.tagihan?.toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-xs text-slate-400 py-6">Belum ada data warga di database.</p>
                )}
              </div>

              {/* CONTROLLER NAVIGATION PAGINATION */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-400">
                <span>Menampilkan {filteredData.length} data wajib pajak</span>
                <div className="flex items-center space-x-1 bg-white p-1 rounded-xl border border-slate-200/60 shadow-sm">
                  <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400"><ChevronLeft className="w-4 h-4" /></button>
                  <button className="px-3 py-1.5 bg-[#002b8c] text-white rounded-lg font-bold">1</button>
                  <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400"><ChevronRight className="w-4 h-4" /></button>
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
    </div>
  )
}

export default DataWarga