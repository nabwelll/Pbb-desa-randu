import React, { useState, useEffect } from 'react'
import { 
  User, 
  Lock, 
  ArrowRight, 
  LayoutDashboard, 
  Users, 
  FileText, 
  Map, 
  Settings, 
  Download, 
  Copy, 
  RefreshCw, 
  Menu, 
  X, 
  LogOut,
  Search,
  Plus,
  Eye,
  Edit,
  ChevronLeft,
  ChevronRight,
  Printer,
  Filter,
  CheckCircle2,
  TrendingUp,
  UserCheck,
  Building,
  Shield,
  Save
} from 'lucide-react'

// ==========================================================================
// 🛠️ KONFIGURASI GLOBAL LINK BACKEND PBB DESA RANDU
// ==========================================================================
const API_BASE_URL       = 'https://GANTI_DENGAN_LINK_BACKEND_KAMU/api';
const API_LINK_RINGKASAN = `${API_BASE_URL}/pbb/ringkasan`;
const API_LINK_KADUS     = `${API_BASE_URL}/pbb/kadus`;
const API_LINK_WARGA     = `${API_BASE_URL}/pbb/warga`;
const API_LINK_LAPORAN   = `${API_BASE_URL}/pbb/laporan`;
const API_LINK_SEKTOR    = `${API_BASE_URL}/pbb/sektor`;
const API_LINK_SETTINGS  = `${API_BASE_URL}/pbb/settings`;

/* ==========================================================================
   1. KOMPONEN LOGIN (Dengan Fitur Bypass Demo HP)
   ========================================================================== */
function LoginComponent({ onLoginSuccess }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (username.trim() === '' || password.trim() === '') {
      setError('Username dan kata sandi tidak boleh kosong!')
      return
    }

    setError('')
    setIsSubmitting(true)

    // 🛠️ TRICK BYPASS LOKAL: Sengaja dibuat langsung sukses untuk keperluan demo di HP
    setTimeout(() => {
      setIsSubmitting(false)
      onLoginSuccess()
    }, 800)
  }

  return (
    <div className="min-h-screen bg-[#1a1d24] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 flex flex-col items-center">
        
        <div className="flex items-center justify-center mb-6">
          <img src="/logo-undip.png" alt="Logo UNDIP" className="h-22 w-auto object-contain" onError={(e) => { e.target.src = "/logo-undip.png" }} />
          <img src="/logo-kknt.png" alt="Logo KKNT" className="h-32 w-auto object-contain" onError={(e) => { e.target.src = "/logo-kknt.png" }} />
        </div>

        <h2 className="text-2xl font-bold text-slate-800 mb-1">Portal PBB Randu</h2>
        <p className="text-sm text-slate-500 mb-8 text-center">Silakan masuk dengan akun perangkat desa Anda</p>

        {error && (
          <div className="w-full bg-red-50 text-red-600 text-xs font-semibold p-3 rounded-xl mb-4 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Username / ID Pegawai</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"><User className="w-5 h-5" /></span>
              <input type="text" placeholder="Masukkan nama bebas..." value={username} onChange={(e) => setUsername(e.target.value)} disabled={isSubmitting} className="w-full pl-10 pr-4 py-3 bg-[#f8fafc] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 text-slate-800 disabled:opacity-60" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Kata Sandi</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"><Lock className="w-5 h-5" /></span>
              <input type="password" placeholder="Masukkan sandi bebas..." value={password} onChange={(e) => setPassword(e.target.value)} disabled={isSubmitting} className="w-full pl-10 pr-4 py-3 bg-[#f8fafc] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 text-slate-800 disabled:opacity-60" />
            </div>
          </div>

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

        <div className="w-full border-t border-slate-100 my-6"></div>
        <div className="text-center text-xs text-slate-400 leading-relaxed">
          <p>© 2026 Pemerintah Desa Randu.</p>
          <p>Didesain oleh Tim KKNT 128 UNDIP 2026.</p>
        </div>
      </div>
    </div>
  )
}

/* ==========================================================================
   2. OPERASIONAL LAYOUT UTAMA (ENGINE CORE & SUB-PAGE SWITCHER)
   ========================================================================== */
function MainAppComponent({ onLogout, activeTab, onNavigate }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [notifikasi, setNotifikasi] = useState('')

  // State Halaman 1: Dashboard
  const [ringkasan, setRingkasan] = useState({ targetDesa: 0, terkumpul: 0, sisa: 0, progres: 0 })
  const [kadusData, setKadusData] = useState([])

  // State Halaman 2: Data Warga
  const [searchTerm, setSearchTerm] = useState('')
  const [filterWilayah, setFilterWilayah] = useState('Semua Wilayah')
  const [filterStatus, setFilterStatus] = useState('Semua Status')
  const [dataWarga, setDataWarga] = useState([])

  // State Halaman 3: Laporan Pajak (LPP)
  const [filterBulan, setFilterBulan] = useState('Semua Bulan')
  const [filterMetode, setFilterMetode] = useState('Semua Metode')
  const [rekapKeuangan, setRekapKeuangan] = useState({ penerimaanHariIni: 0, penerimaanBulanIni: 0, totalTransaksiSukses: 0, efektivitasSistem: 0 })
  const [logTransaksi, setLogTransaksi] = useState([])

  // State Halaman 4: Sektor Wilayah
  const [totalSektor, setTotalSektor] = useState(0)
  const [daftarSektor, setDaftarSektor] = useState([])

  // State Halaman 5: Pengaturan
  const [isSaving, setIsSaving] = useState(false)
  const [formDesa, setFormDesa] = useState({ namaDesa: '', kecamatan: '', kabupaten: '', tahunAnggaran: '', targetNominalDesa: 0 })
  const [formAkun, setFormAkun] = useState({ usernameLama: '', passwordBaru: '', konfirmasiPassword: '' })

  useEffect(() => {
    setIsLoading(true)

    if (activeTab === 'dashboard') {
      Promise.all([
        fetch(API_LINK_RINGKASAN).then(res => res.json()).catch(() => null),
        fetch(API_LINK_KADUS).then(res => res.json()).catch(() => null)
      ]).then(([d1, d2]) => {
        if (d1) setRingkasan({ targetDesa: d1.target_desa || 0, terkumpul: d1.terkumpul || 0, sisa: d1.sisa || 0, progres: d1.progres || 0 })
        if (d2) setKadusData(d2)
        setIsLoading(false)
      }).catch(() => setIsLoading(false))

    } else if (activeTab === 'data-warga') {
      fetch(API_LINK_WARGA).then(res => res.json()).then(data => {
        if (data) setDataWarga(data)
        setIsLoading(false)
      }).catch(() => setIsLoading(false))

    } else if (activeTab === 'laporan-pajak') {
      fetch(API_LINK_LAPORAN).then(res => res.json()).then(data => {
        if (data) {
          setRekapKeuangan({ penerimaanHariIni: data.penerimaan_hari_ini || 0, penerimaanBulanIni: data.penerimaan_bulan_ini || 0, totalTransaksiSukses: data.total_transaksi || 0, efektivitasSistem: data.efektivitas_persen || 0 })
          setLogTransaksi(data.daftar_transaksi || [])
        }
        setIsLoading(false)
      }).catch(() => setIsLoading(false))

    } else if (activeTab === 'sektor-wilayah') {
      fetch(API_LINK_SEKTOR).then(res => res.json()).then(data => {
        if (data) {
          setDaftarSektor(data.sektor || [])
          setTotalSektor(data.total_sektor || 0)
        }
        setIsLoading(false)
      }).catch(() => setIsLoading(false))

    } else if (activeTab === 'pengaturan') {
      fetch(API_LINK_SETTINGS).then(res => res.json()).then(data => {
        if (data) {
          setFormDesa({ namaDesa: data.nama_desa || '', kecamatan: data.kecamatan || '', kabupaten: data.kabupaten || '', tahunAnggaran: data.tahun_anggaran || '', targetNominalDesa: data.target_nominal || 0 })
        }
        setIsLoading(false)
      }).catch(() => setIsLoading(false))
    }
  }, [activeTab])

  const filteredWarga = dataWarga.filter(w => {
    const cocokKeyword = (w.nama?.toLowerCase().includes(searchTerm.toLowerCase()) || false) || (w.nop?.includes(searchTerm) || false)
    const cocokWilayah = filterWilayah === 'Semua Wilayah' || w.wilayah === filterWilayah
    const cocokStatus = filterStatus === 'Semua Status' || w.status === filterStatus
    return cocokKeyword && cocokWilayah && cocokStatus
  })

  const filteredLaporan = logTransaksi.filter(t => {
    const cocokWilayah = filterWilayah === 'Semua Wilayah' || t.wilayah === filterWilayah
    const cocokMetode = filterMetode === 'Semua Metode' || t.metode === filterMetode
    return cocokWilayah && cocokMetode
  })

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
    .catch(err => console.error(err))
    .finally(() => setIsSaving(false))
  }

  const handleMenuClick = (tabName) => {
    onNavigate(tabName)
    setIsMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col md:flex-row text-slate-800 antialiased overflow-x-hidden">
      
      {/* ========================================================= */}
      {/* A. SIDEBAR INTERAKTIF DESKTOP VIEW */}
      {/* ========================================================= */}
      <aside className="hidden md:flex md:w-64 bg-[#1e293b] text-white flex-col justify-between flex-shrink-0 border-r border-slate-200">
        <div className="flex flex-col">
          
          <div className="bg-[#002b8c] px-6 py-4 flex items-center space-x-2 shadow-sm">
            <span className="font-bold text-base tracking-wider text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              PBB RANDU
            </span>
          </div>
          
          <div className="p-5 border-b border-slate-700/50 bg-slate-800/30">
            <h4 className="font-bold text-sm text-slate-100">Sekdes Randu</h4>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Administrator</p>
          </div>

          <nav className="p-3 space-y-1 mt-2">
            <button onClick={() => handleMenuClick('dashboard')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm transition-all ${activeTab === 'dashboard' ? 'bg-slate-700/50 text-white font-semibold shadow-sm' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white font-medium'}`}>
              <LayoutDashboard className={`w-4 h-4 ${activeTab === 'dashboard' ? 'text-blue-400' : ''}`} />
              <span>Dashboard</span>
            </button>
            <button onClick={() => handleMenuClick('data-warga')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm transition-all ${activeTab === 'data-warga' ? 'bg-slate-700/50 text-white font-semibold shadow-sm' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white font-medium'}`}>
              <Users className={`w-4 h-4 ${activeTab === 'data-warga' ? 'text-blue-400' : ''}`} />
              <span>Data Warga</span>
            </button>
            <button onClick={() => handleMenuClick('laporan-pajak')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm transition-all ${activeTab === 'laporan-pajak' ? 'bg-slate-700/50 text-white font-semibold shadow-sm' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white font-medium'}`}>
              <FileText className={`w-4 h-4 ${activeTab === 'laporan-pajak' ? 'text-blue-400' : ''}`} />
              <span>Laporan Pajak</span>
            </button>
            <button onClick={() => handleMenuClick('sektor-wilayah')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm transition-all ${activeTab === 'sektor-wilayah' ? 'bg-slate-700/50 text-white font-semibold shadow-sm' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white font-medium'}`}>
              <Map className={`w-4 h-4 ${activeTab === 'sektor-wilayah' ? 'text-blue-400' : ''}`} />
              <span>Sektor Wilayah</span>
            </button>
            <button onClick={() => handleMenuClick('pengaturan')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm transition-all ${activeTab === 'pengaturan' ? 'bg-slate-700/50 text-white font-semibold shadow-sm' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white font-medium'}`}>
              <Settings className={`w-4 h-4 ${activeTab === 'pengaturan' ? 'text-blue-400' : ''}`} />
              <span>Pengaturan</span>
            </button>
          </nav>
        </div>

        <div className="p-4 space-y-2">
          <button className="w-full flex items-center justify-center space-x-2 bg-[#2563eb] hover:bg-blue-700 text-white py-2.5 px-4 rounded-xl text-xs font-semibold shadow-sm transition-all"><FileText className="w-4 h-4" /><span>Import Excel</span></button>
          <button onClick={onLogout} className="w-full flex items-center justify-center space-x-2 bg-slate-800 hover:bg-rose-900 text-slate-300 hover:text-white py-2.5 px-4 rounded-xl text-xs font-semibold shadow-sm border border-slate-700/60 transition-all"><LogOut className="w-4 h-4" /><span>Keluar Sistem</span></button>
          <div className="text-center pt-2 border-t border-slate-700/40"><p className="text-[10px] text-slate-500 font-medium tracking-wide">Didesain oleh KKNT 128 Undip 2026</p></div>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* B. NAVBAR HEADER MOBILE TOP */}
      {/* ========================================================= */}
      <header className="md:hidden bg-[#002b8c] text-white p-4 flex items-center justify-between shadow-md sticky top-0 z-50">
        <h1 className="font-bold tracking-wide text-sm">PBB RANDU</h1>
        {/* Tombol Hamburger di Pojok Kanan Atas */}
        <button onClick={() => setIsMobileMenuOpen(true)} className="p-1 focus:outline-none">
          <Menu className="w-6 h-6" />
        </button>
      </header>

      {/* 🛠️ BACKDROP OVERLAY: Membuat latar belakang meredup hitam saat menu kanan keluar */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 z-40 transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* 🛠️ MOBILE DRAWER SIDEBAR: Meluncur presisi dari Kanan ke Kiri */}
      <div className={`md:hidden fixed top-0 right-0 bottom-0 w-[75%] max-w-[300px] bg-[#1e293b] text-white z-50 shadow-2xl flex flex-col justify-between transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col">
          
          {/* Header Internal Mobile Drawer */}
          <div className="bg-[#002b8c] px-5 py-4 flex items-center justify-between shadow-sm">
            <span className="font-bold text-sm tracking-wider text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              PBB RANDU
            </span>
            {/* Tombol X Silang di Pojok Kanan Internal Drawer */}
            <button onClick={() => setIsMobileMenuOpen(false)} className="text-white p-1 focus:outline-none">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Status Profil Ringkas */}
          <div className="p-5 border-b border-slate-700/50 bg-slate-800/30">
            <h4 className="font-bold text-xs text-slate-100">Sekdes Randu</h4>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Administrator</p>
          </div>

          {/* Navigasi Link Menu */}
          <nav className="p-3 space-y-1 mt-2">
            <button onClick={() => handleMenuClick('dashboard')} className={`w-full text-left py-2.5 px-4 rounded-xl text-xs font-semibold block transition-all ${activeTab === 'dashboard' ? 'bg-slate-700/50 text-blue-400' : 'text-slate-300'}`}>Dashboard</button>
            <button onClick={() => handleMenuClick('data-warga')} className={`w-full text-left py-2.5 px-4 rounded-xl text-xs font-semibold block transition-all ${activeTab === 'data-warga' ? 'bg-slate-700/50 text-blue-400' : 'text-slate-300'}`}>Data Warga</button>
            <button onClick={() => handleMenuClick('laporan-pajak')} className={`w-full text-left py-2.5 px-4 rounded-xl text-xs font-semibold block transition-all ${activeTab === 'laporan-pajak' ? 'bg-slate-700/50 text-blue-400' : 'text-slate-300'}`}>Laporan Pajak</button>
            <button onClick={() => handleMenuClick('sektor-wilayah')} className={`w-full text-left py-2.5 px-4 rounded-xl text-xs font-semibold block transition-all ${activeTab === 'sektor-wilayah' ? 'bg-slate-700/50 text-blue-400' : 'text-slate-300'}`}>Sektor Wilayah</button>
            <button onClick={() => handleMenuClick('pengaturan')} className={`w-full text-left py-2.5 px-4 rounded-xl text-xs font-semibold block transition-all ${activeTab === 'pengaturan' ? 'bg-slate-700/50 text-blue-400' : 'text-slate-300'}`}>Pengaturan</button>
          </nav>
        </div>

        {/* Footer Tombol Keluar di Bagian Bawah Drawer */}
        <div className="p-4 border-t border-slate-700/40 bg-slate-900/20">
          <button onClick={onLogout} className="w-full flex items-center justify-center space-x-2 bg-slate-800 hover:bg-rose-900 text-slate-300 hover:text-white py-2 px-3 rounded-xl text-xs font-semibold shadow-sm border border-slate-700/60 transition-all">
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar Sistem</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* C. KONTEN ENGINE UTAMA */}
      {/* ========================================================= */}
      <main className="flex-1 p-4 md:p-8 space-y-6 overflow-y-auto pb-24 md:pb-8 flex flex-col justify-between">
        
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-20 text-slate-400 gap-2 font-medium text-sm">
            <RefreshCw className="w-6 h-6 animate-spin text-[#002b8c]" />
            <span>Memuat lembar data real-time...</span>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* ====== SUB-PAGE 1: DASHBOARD ====== */}
            {activeTab === 'dashboard' && (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 pb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">Ringkasan PBB 2026</h2>
                    <p className="text-xs text-slate-400 mt-1">Sistem monitoring kas pembukuan wajib pajak.</p>
                  </div>
                  <button className="text-xs font-bold border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 px-4 py-2 rounded-xl shadow-sm transition-all self-start sm:self-auto">Switch Role</button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between"><span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Target Desa</span><span className="text-xl font-extrabold text-slate-800 mt-2">Rp {ringkasan.targetDesa.toLocaleString('id-ID')}</span></div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between"><span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Terkumpul</span><span className="text-xl font-extrabold text-blue-700 mt-2">Rp {ringkasan.terkumpul.toLocaleString('id-ID')}</span></div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between"><span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sisa</span><span className="text-xl font-extrabold text-red-600 mt-2">Rp {ringkasan.sisa.toLocaleString('id-ID')}</span></div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-center"><span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Progres</span><span className="text-base font-extrabold text-slate-800">{ringkasan.progres}%</span></div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full mt-4 overflow-hidden"><div className="bg-[#002b8c] h-full rounded-full transition-all duration-500" style={{ width: `${ringkasan.progres}%` }}></div></div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button className="flex items-center space-x-2 bg-[#002b8c] hover:bg-blue-950 text-white text-xs font-bold py-3 px-5 rounded-xl shadow-sm transition-all"><Download className="w-4 h-4" /><span>Import Excel SPPT 2026</span></button>
                  <button className="flex items-center space-x-2 bg-white border-2 border-[#002b8c] text-[#002b8c] hover:bg-blue-50/50 text-xs font-bold py-2.5 px-5 rounded-xl shadow-sm transition-all"><Copy className="w-4 h-4" /><span>Salin Tunggakan 2025 ke 2026</span></button>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                  <div className="bg-slate-50 px-6 py-4 border-b border-slate-100"><h3 className="font-bold text-sm text-slate-700">Progres per Wilayah Kadus</h3></div>
                  <div className="p-6 space-y-5">
                    {kadusData.length > 0 ? (
                      kadusData.map((kadus, idx) => (
                        <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between text-xs sm:text-sm">
                          <span className="w-32 font-semibold text-slate-600 mb-1 sm:mb-0">{kadus.nama_wilayah}</span>
                          <div className="flex-1 sm:mx-4 flex items-center space-x-3">
                            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden"><div className={`${kadus.warna_bar || 'bg-blue-600'} h-full rounded-full transition-all duration-700`} style={{ width: `${kadus.persentase}%` }}></div></div>
                            <span className="w-10 text-right font-bold text-slate-700">{kadus.persentase}%</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 text-center py-2">Belum ada progres wilayah tersedia.</p>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* ====== SUB-PAGE 2: DATA WARGA ====== */}
            {activeTab === 'data-warga' && (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 pb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">Manajemen Data Warga</h2>
                    <p className="text-xs text-slate-400 mt-1">Daftar lembar pencatatan wajib pajak desa.</p>
                  </div>
                  <button className="flex items-center space-x-2 bg-[#002b8c] hover:bg-blue-950 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-sm self-start sm:self-auto"><Plus className="w-4 h-4" /><span>Tambah Warga</span></button>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col lg:flex-row gap-3">
                  <div className="flex-1 relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400"><Search className="w-4 h-4" /></span>
                    <input type="text" placeholder="Cari berdasarkan NOP atau Nama..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 text-slate-800 placeholder-slate-400" />
                  </div>
                  <select value={filterWilayah} onChange={(e) => setFilterWilayah(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 focus:outline-none"><option>Semua Wilayah</option><option>Kadus 1</option><option>Kadus 2</option><option>Kadus 3</option><option>Kadus 4</option></select>
                  <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 focus:outline-none"><option>Semua Status</option><option>Lunas</option><option>Belum Lunas</option></select>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        <th className="px-6 py-4">NOP</th><th className="px-6 py-4">Nama Wajib Pajak</th><th className="px-6 py-4">Wilayah</th><th className="px-6 py-4">Tagihan</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                      {filteredWarga.length > 0 ? (
                        filteredWarga.map((w) => (
                          <tr key={w.id} className="hover:bg-slate-50/50">
                            <td className="px-6 py-4 font-mono text-xs text-slate-400 font-semibold">{w.nop}</td>
                            <td className="px-6 py-4 font-bold text-slate-800">{w.nama}</td>
                            <td className="px-6 py-4">{w.wilayah} (RT {w.rt})</td>
                            <td className="px-6 py-4">Rp {w.tagihan?.toLocaleString('id-ID')}</td>
                            <td className="px-6 py-4"><span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-bold ${w.status === 'Lunas' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>{w.status}</span></td>
                            <td className="px-6 py-4 text-center"><div className="flex justify-center space-x-1"><button className="p-2 text-slate-400 hover:text-blue-700"><Eye className="w-4 h-4" /></button><button className="p-2 text-slate-400 hover:text-amber-600"><Edit className="w-4 h-4" /></button></div></td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan="6" className="text-center py-12 text-slate-400">Belum ada data warga di database.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* ====== SUB-PAGE 3: LAPORAN PAJAK (LPP) ====== */}
            {activeTab === 'laporan-pajak' && (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 pb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">Laporan Penerimaan Pajak (LPP)</h2>
                    <p className="text-xs text-slate-400 mt-1">Jurnal histori arus dana kas masuk.</p>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button className="flex items-center space-x-1 bg-white border border-slate-200 text-slate-600 text-xs font-bold py-2.5 px-3 rounded-xl shadow-sm"><Printer className="w-4 h-4" /><span>Cetak</span></button>
                    <button className="flex items-center space-x-1 bg-[#002b8c] text-white text-xs font-bold py-2.5 px-3 rounded-xl shadow-sm"><Download className="w-4 h-4" /><span>Ekspor</span></button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between"><span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Setoran Hari Ini</span><span className="text-xl font-extrabold text-slate-800 mt-2">Rp {rekapKeuangan.penerimaanHariIni.toLocaleString('id-ID')}</span></div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between"><span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Bulan Ini</span><span className="text-xl font-extrabold text-blue-700 mt-2">Rp {rekapKeuangan.penerimaanBulanIni.toLocaleString('id-ID')}</span></div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between"><span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Transaksi Sukses</span><span className="text-xl font-extrabold text-emerald-600 mt-2">{rekapKeuangan.totalTransaksiSukses} Berkas</span></div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-center"><span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Efektivitas LPP</span><span className="text-base font-extrabold text-slate-800">{rekapKeuangan.efektivitasSistem}%</span></div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full mt-4 overflow-hidden"><div className="bg-emerald-500 h-full rounded-full" style={{ width: `${rekapKeuangan.efektivitasSistem}%` }}></div></div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm flex flex-wrap gap-3">
                  <select value={filterBulan} onChange={(e) => setFilterBulan(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-semibold text-slate-600"><option>Semua Bulan</option><option>Januari</option><option>Februari</option><option>Maret</option></select>
                  <select value={filterMetode} onChange={(e) => setFilterMetode(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-semibold text-slate-600"><option>Semua Metode</option><option>Tunai / Kolektor</option><option>QRIS / BRImo</option></select>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        <th className="px-6 py-4">ID</th><th className="px-6 py-4">Tanggal</th><th className="px-6 py-4">Nama WP</th><th className="px-6 py-4">Sektor</th><th className="px-6 py-4">Setoran</th><th className="px-6 py-4 text-center">Metode</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                      {filteredLaporan.length > 0 ? (
                        filteredLaporan.map((trx, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/40">
                            <td className="px-6 py-4 font-bold text-xs text-[#002b8c]">{trx.id_transaksi}</td>
                            <td className="px-6 py-4 text-xs text-slate-400">{trx.tanggal}</td>
                            <td className="px-6 py-4 font-bold text-slate-800">{trx.nama_wp}</td>
                            <td className="px-6 py-4 text-xs font-bold text-slate-600">{trx.wilayah}</td>
                            <td className="px-6 py-4 font-extrabold text-emerald-600">+ Rp {trx.jumlah_bayar.toLocaleString('id-ID')}</td>
                            <td className="px-6 py-4 text-center"><span className="inline-flex items-center gap-1 bg-slate-50 text-slate-600 px-2.5 py-1 rounded-lg text-xs font-bold border border-slate-100"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> {trx.metode}</span></td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan="6" className="text-center py-12 text-slate-400">Belum ada catatan penerimaan kas masuk.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* ====== SUB-PAGE 4: SEKTOR WILAYAH ====== */}
            {activeTab === 'sektor-wilayah' && (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 pb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">Sektor Wilayah PBB</h2>
                    <p className="text-xs text-slate-400 mt-1">Matriks target operasional masing-masing zonasi.</p>
                  </div>
                  <button className="flex items-center space-x-2 bg-[#002b8c] text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-sm self-start sm:self-auto"><Plus className="w-4 h-4" /><span>Tambah Sektor</span></button>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {daftarSektor.length > 0 ? (
                    daftarSektor.map((sektor, idx) => (
                      <div key={idx} className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col justify-between">
                        <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
                          <div>
                            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded-md">{sektor.kode_sektor || `Sektor 0${idx + 1}`}</span>
                            <h3 className="text-lg font-extrabold text-slate-800 pt-1">{sektor.nama_sektor}</h3>
                          </div>
                          <div className="text-right flex items-center gap-2 bg-white px-3 py-1.5 border border-slate-200/60 rounded-xl">
                            <UserCheck className="w-4 h-4 text-blue-600" /><span className="text-xs font-bold text-slate-700">{sektor.penanggung_jawab}</span>
                          </div>
                        </div>
                        <div className="p-6 grid grid-cols-3 gap-4 text-xs font-semibold">
                          <div><span className="text-slate-400 block pb-1">Total WP</span><span className="text-base font-bold text-slate-800">{sektor.total_wp} Jiwa</span></div>
                          <div><span className="text-slate-400 block pb-1">Beban Target</span><span className="text-base font-extrabold text-slate-800">Rp {sektor.target_nominal.toLocaleString('id-ID')}</span></div>
                          <div><span className="text-slate-400 block pb-1">Telah Setor</span><span className="text-base font-extrabold text-emerald-600">Rp {sektor.terrealisasi_nominal.toLocaleString('id-ID')}</span></div>
                        </div>
                        <div className="px-6 pb-6 pt-2 space-y-2">
                          <div className="flex items-center justify-between text-xs font-bold"><span className="text-slate-400 flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> Progres</span><span className="text-slate-800">{sektor.persentase_progres}%</span></div>
                          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden"><div className={`h-full rounded-full ${sektor.warna_tema || 'bg-[#002b8c]'}`} style={{ width: `${sektor.persentase_progres}%` }}></div></div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-12 bg-white border border-slate-200/60 rounded-2xl text-slate-400">Belum ada pembagian sektor wilayah desa di database.</div>
                  )}
                </div>
              </>
            )}

            {/* ====== SUB-PAGE 5: PENGATURAN ====== */}
            {activeTab === 'pengaturan' && (
              <>
                <div className="border-b border-slate-200 pb-4">
                  <h2 className="text-2xl font-bold text-slate-800">Pengaturan Sistem</h2>
                  <p className="text-xs text-slate-400 mt-1">Konfigurasikan variabel makro desa serta hak akses portal.</p>
                </div>

                {notifikasi && (
                  <div className="bg-emerald-50 text-emerald-600 text-xs font-bold p-4 rounded-xl border border-emerald-100 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /><span>{notifikasi}</span></div>
                )}

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
                  <form onSubmit={handleSaveDesa} className="xl:col-span-2 bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 space-y-5">
                    <div className="flex items-center gap-2 text-slate-800 font-bold border-b border-slate-100 pb-3"><Building className="w-5 h-5 text-[#002b8c]" /><h3 className="text-sm uppercase tracking-wider">Profil Wilayah Kerja</h3></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                      <div className="space-y-2"><label className="text-slate-600">Nama Desa</label><input type="text" value={formDesa.namaDesa} onChange={(e) => setFormDesa({...formDesa, namaDesa: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800" /></div>
                      <div className="space-y-2"><label className="text-slate-600">Tahun Anggaran</label><input type="text" value={formDesa.tahunAnggaran} onChange={(e) => setFormDesa({...formDesa, tahunAnggaran: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800" /></div>
                      <div className="space-y-2"><label className="text-slate-600">Kecamatan</label><input type="text" value={formDesa.kecamatan} onChange={(e) => setFormDesa({...formDesa, kecamatan: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800" /></div>
                      <div className="space-y-2"><label className="text-slate-600">Kabupaten</label><input type="text" value={formDesa.kabupaten} onChange={(e) => setFormDesa({...formDesa, kabupaten: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800" /></div>
                      <div className="space-y-2 sm:col-span-2"><label className="text-slate-600">Target PBB Desa (Rp)</label><input type="number" value={formDesa.targetNominalDesa} onChange={(e) => setFormDesa({...formDesa, targetNominalDesa: parseInt(e.target.value) || 0})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800" /></div>
                    </div>
                    <div className="border-t border-slate-100 pt-4 flex justify-end"><button type="submit" disabled={isSaving} className="flex items-center space-x-2 bg-[#002b8c] text-white text-xs font-bold py-3 px-5 rounded-xl shadow-sm disabled:opacity-60"><Save className="w-4 h-4" /><span>{isSaving ? 'Menyimpan...' : 'Simpan Profil Desa'}</span></button></div>
                  </form>

                  <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 space-y-5">
                    <div className="flex items-center gap-2 text-slate-800 font-bold border-b border-slate-100 pb-3"><Shield className="w-5 h-5 text-amber-600" /><h3 className="text-sm uppercase tracking-wider">Kredensial Akun</h3></div>
                    <div className="space-y-4 text-xs font-semibold">
                      <div className="space-y-2"><label className="text-slate-600">Username Perangkat</label><input type="text" value={formAkun.usernameLama} onChange={(e) => setFormAkun({...formAkun, usernameLama: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800" /></div>
                      <div className="space-y-2"><label className="text-slate-600">Sandi Baru</label><input type="password" placeholder="••••••••" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800" /></div>
                      <button type="button" className="w-full bg-slate-800 text-white text-xs font-bold py-3 px-4 rounded-xl shadow-sm">Perbarui Sandi</button>
                    </div>
                  </div>
                </div>
              </>
            )}

          </div>
        )}

        <footer className="text-center text-xs text-slate-400 mt-12 pt-4 border-t border-slate-200/60">
          <p>© 2026 Pemerintah Desa Randu. | Didesain oleh KKNT 128 Undip 2026</p>
        </footer>
      </main>

      {/* ========================================================= */}
      {/* D. BAR NAVIGASI MOBILE (NAVBAR BAWAH HP) */}
      {/* ========================================================= */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-2 z-40 shadow-lg">
        <button onClick={() => handleMenuClick('dashboard')} className={`flex flex-col items-center py-1 ${activeTab === 'dashboard' ? 'text-[#002b8c] font-bold' : 'text-slate-400'}`}>
          <LayoutDashboard className="w-5 h-5" /><span className="text-[10px] mt-0.5">Beranda</span>
        </button>
        <button onClick={() => handleMenuClick('data-warga')} className={`flex flex-col items-center py-1 ${activeTab === 'data-warga' ? 'text-[#002b8c] font-bold' : 'text-slate-400'}`}>
          <Users className="w-5 h-5" /><span className="text-[10px] mt-0.5">Warga</span>
        </button>
        <button onClick={() => handleMenuClick('laporan-pajak')} className={`flex flex-col items-center py-1 ${activeTab === 'laporan-pajak' ? 'text-[#002b8c] font-bold' : 'text-slate-400'}`}>
          <FileText className="w-5 h-5" /><span className="text-[10px] mt-0.5">LPP</span>
        </button>
        <button onClick={() => handleMenuClick('sektor-wilayah')} className={`flex flex-col items-center py-1 ${activeTab === 'sektor-wilayah' ? 'text-[#002b8c] font-bold' : 'text-slate-400'}`}>
          <Map className="w-5 h-5" /><span className="text-[10px] mt-0.5">Sektor</span>
        </button>
        <button onClick={() => handleMenuClick('pengaturan')} className={`flex flex-col items-center py-1 ${activeTab === 'pengaturan' ? 'text-[#002b8c] font-bold' : 'text-slate-400'}`}>
          <Settings className="w-5 h-5" /><span className="text-[10px] mt-0.5">Setelan</span>
        </button>
      </nav>

    </div>
  )
}

/* ==========================================================================
   3. ENTRY POINT SWITCHER
   ========================================================================== */
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')

  return (
    <>
      {isLoggedIn ? (
        <MainAppComponent 
          activeTab={activeTab} 
          onNavigate={(tabName) => setActiveTab(tabName)} 
          onLogout={() => {
            setIsLoggedIn(false)
            setActiveTab('dashboard')
          }} 
        />
      ) : (
        <LoginComponent onLoginSuccess={() => setIsLoggedIn(true)} />
      )}
    </>
  )
}

export default App