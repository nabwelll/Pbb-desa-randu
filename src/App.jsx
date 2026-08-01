import React, { useState, useEffect, useRef } from 'react'
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
  Save,
  Calendar,
  Trash2,
  Wallet,
  CreditCard,
  AlertCircle
} from 'lucide-react'
import {
  fetchDashboardData,
  fetchLaporanData,
  fetchSettingsData,
  fetchSektorData,
  fetchWargaData,
  importExcelSppt,
  copyUnpaidTagihan,
  saveSettingsData,
  exportDataWargaPerKK,
  formatIndoDate,
  authenticateUser,
  registerNewUser,
  getAppUsers,
  updateSektorWilayah,
} from './lib/pbbSupabase'
import { supabase } from './supabaseClient'



/* ==========================================================================
   MAPPING KODE BLOK EXCEL → NAMA WILAYAH
   ========================================================================== */
const WILAYAH_MAP = {
  ep:  'RW 1 – Randu',
  b:   'RW 2 – Bandon',
  e:   'RW 3 – Randu Tengah',
  ir:  'RW 4 – Manggeran',
  a:   'Orang Luar Randu',
  aw:  'RW 5 – Gondangsari',
  z:   'RW 6 – Rajegan 1',
  r:   'RW 7 – Rajegan 2',
  fk:  'Tanah Belum Diketahui',
}

const WILAYAH_OPTIONS = [
  { value: 'Semua Wilayah', label: 'Semua Wilayah' },
  ...Object.entries(WILAYAH_MAP).map(([kode, nama]) => ({
    value: kode,
    label: `${kode.toUpperCase()} – ${nama.split('–')[1]?.trim() ?? nama}`,
  })),
]

const getNamaWilayah = (kode) =>
  WILAYAH_MAP[kode?.toLowerCase()] ?? kode ?? '-'

/* ==========================================================================
   1. KOMPONEN LOGIN & REGISTRASI REAL (Sekdes vs Kadus)
   ========================================================================== */
function LoginComponent({ onLoginSuccess }) {
  const [authTab, setAuthTab] = useState('login') // 'login' | 'register'

  // State Form Login
  const [loginUsername, setLoginUsername] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // State Form Registrasi
  const [regNama, setRegNama] = useState('')
  const [regUsername, setRegUsername] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regRole, setRegRole] = useState('kadus') // 'sekdes' | 'kadus'
  const [regWilayah, setRegWilayah] = useState('ep') // default RW 1

  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Proses Submit Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')
    setIsSubmitting(true)

    try {
      const user = await authenticateUser(loginUsername, loginPassword)
      setIsSubmitting(false)
      onLoginSuccess({
        role: user.role,
        wilayah: user.role === 'sekdes' ? 'Semua Wilayah' : user.wilayah,
        nama: user.nama_lengkap || user.username,
      })
    } catch (err) {
      setIsSubmitting(false)
      setErrorMsg(err.message)
    }
  }

  // Proses Submit Registrasi
  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')
    setIsSubmitting(true)

    try {
      const newUser = await registerNewUser({
        nama_lengkap: regNama,
        username: regUsername,
        password: regPassword,
        role: regRole,
        wilayah: regWilayah,
      })

      setIsSubmitting(false)
      setSuccessMsg(`Akun "${newUser.username}" berhasil terdaftar di database! Mengalihkan ke halaman Masuk...`)
      setLoginUsername(newUser.username)
      setLoginPassword(newUser.password)

      setTimeout(() => {
        setAuthTab('login')
        setSuccessMsg('')
      }, 1500)
    } catch (err) {
      setIsSubmitting(false)
      setErrorMsg(err.message)
    }
  }

  // Quick Preset Click
  const handleQuickLogin = async (uname, pass) => {
    setLoginUsername(uname)
    setLoginPassword(pass)
    setErrorMsg('')
    setSuccessMsg('')
    setIsSubmitting(true)

    try {
      const user = await authenticateUser(uname, pass)
      setIsSubmitting(false)
      onLoginSuccess({
        role: user.role,
        wilayah: user.role === 'sekdes' ? 'Semua Wilayah' : user.wilayah,
        nama: user.nama_lengkap || user.username,
      })
    } catch (err) {
      setIsSubmitting(false)
      setErrorMsg(err.message)
    }
  }

  return (
    <div className="min-h-screen bg-[#1a1d24] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 flex flex-col items-center">
        
        {/* Header Branding */}
        <div className="flex items-center justify-center mb-4">
          <img src="/logo-undip.png" alt="Logo UNDIP" className="h-16 w-auto object-contain" onError={(e) => { e.target.src = "/logo-undip.png" }} />
          <img src="/logo-kknt.png" alt="Logo KKNT" className="h-24 w-auto object-contain" onError={(e) => { e.target.src = "/logo-kknt.png" }} />
        </div>

        <h2 className="text-2xl font-extrabold text-slate-800 mb-1 text-center">Portal PBB Desa Randu</h2>
        <p className="text-xs text-slate-500 mb-6 text-center">Sistem Pengelolaan & Penagihan PBB-P2 Perangkat Desa</p>

        {/* Tab Selector: Masuk vs Buat Akun */}
        <div className="w-full bg-slate-100 p-1 rounded-xl flex gap-1 mb-6 border border-slate-200">
          <button
            type="button"
            onClick={() => { setAuthTab('login'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${authTab === 'login' ? 'bg-[#002b8c] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <Lock className="w-4 h-4" />
            <span>Masuk (Login)</span>
          </button>
          <button
            type="button"
            onClick={() => { setAuthTab('register'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${authTab === 'register' ? 'bg-[#002b8c] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <Plus className="w-4 h-4" />
            <span>Buat Akun Baru</span>
          </button>
        </div>

        {errorMsg && (
          <div className="w-full bg-rose-50 text-rose-700 text-xs font-semibold p-3.5 rounded-xl mb-4 border border-rose-200">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="w-full bg-emerald-50 text-emerald-700 text-xs font-semibold p-3.5 rounded-xl mb-4 border border-emerald-200">
            {successMsg}
          </div>
        )}

        {/* TAB 1: FORM MASUK (LOGIN) */}
        {authTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="w-full space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Username / ID Pegawai</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"><User className="w-4 h-4" /></span>
                <input
                  type="text"
                  placeholder="Contoh: sekdes atau kadus_rw1"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-[#f8fafc] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 text-slate-800 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Kata Sandi</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"><Lock className="w-4 h-4" /></span>
                <input
                  type="password"
                  placeholder="Masukkan kata sandi..."
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-[#f8fafc] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 text-slate-800 font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#002b8c] hover:bg-blue-950 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition-all mt-2 disabled:bg-blue-800/70 text-xs shadow-md"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin mr-1" />
                  <span>Memverifikasi Akun...</span>
                </>
              ) : (
                <>
                  <span>Masuk ke Sistem</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* TAB 2: FORM REGISTRASI AKUN BARU */}
        {authTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="w-full space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap Pegawai</label>
              <input
                type="text"
                placeholder="Contoh: Bpk. Agus Raharjo"
                value={regNama}
                onChange={(e) => setRegNama(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-3.5 py-2 text-xs bg-[#f8fafc] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 text-slate-800 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Username Baru</label>
                <input
                  type="text"
                  placeholder="sekdes_randu"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-3.5 py-2 text-xs bg-[#f8fafc] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 text-slate-800 font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kata Sandi</label>
                <input
                  type="password"
                  placeholder="Sandi..."
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-3.5 py-2 text-xs bg-[#f8fafc] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 text-slate-800 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Role / Hak Akses Akun</label>
              <select
                value={regRole}
                onChange={(e) => setRegRole(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900"
              >
                <option value="kadus">Koordinator Dusun (Kadus) — Akses Wilayah Binaan Saja</option>
                <option value="sekdes">Sekretaris Desa (Sekdes) — Akses Seluruh RW/Desa</option>
              </select>
            </div>

            {regRole === 'kadus' && (
              <div className="bg-blue-50/80 p-3.5 rounded-xl border border-blue-200 space-y-1.5">
                <label className="block text-xs font-bold text-[#002b8c]">Pilih Wilayah Binaan / Dusun Tugas (RW)</label>
                <select
                  value={regWilayah}
                  onChange={(e) => setRegWilayah(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-blue-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 text-slate-800 text-xs font-bold"
                >
                  {Object.entries(WILAYAH_MAP).map(([kode, nama]) => (
                    <option key={kode} value={kode}>{nama}</option>
                  ))}
                </select>
                <p className="text-[11px] text-blue-700 font-medium">
                  *Akun Kadus ini otomatis <strong>dikunci hanya pada wilayah {getNamaWilayah(regWilayah)}</strong>.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition-all mt-2 text-xs shadow-md"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin mr-1" />
                  <span>Mendaftarkan Akun...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Daftar & Buat Akun Baru</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Panel Daftar Akun Default (Siap Pakai untuk Demo) */}
        <div className="w-full mt-6 pt-4 border-t border-slate-100">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 text-center">Akun Terdaftar Siap Pakai (Uji Coba 1-Klik)</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleQuickLogin('sekdes', '123')}
              className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 text-[11px] font-bold rounded-xl border border-amber-200 text-left transition-all flex flex-col"
            >
              <span>Sekdes (Semua RW)</span>
              <span className="text-[10px] text-amber-700 font-mono font-semibold">User: sekdes | Pass: 123</span>
            </button>
            <button
              onClick={() => handleQuickLogin('kadus_rw1', '123')}
              className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 text-[11px] font-bold rounded-xl border border-blue-200 text-left transition-all flex flex-col"
            >
              <span>Kadus RW 1 (Randu)</span>
              <span className="text-[10px] text-blue-700 font-mono font-semibold">User: kadus_rw1 | Pass: 123</span>
            </button>
            <button
              onClick={() => handleQuickLogin('kadus_rw2', '123')}
              className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 text-[11px] font-bold rounded-xl border border-blue-200 text-left transition-all flex flex-col"
            >
              <span>Kadus RW 2 (Bandon)</span>
              <span className="text-[10px] text-blue-700 font-mono font-semibold">User: kadus_rw2 | Pass: 123</span>
            </button>
            <button
              onClick={() => handleQuickLogin('kadus_rw3', '123')}
              className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 text-[11px] font-bold rounded-xl border border-amber-200 text-left transition-all flex flex-col"
            >
              <span>Kadus RW 3 (Randu Tengah)</span>
              <span className="text-[10px] text-blue-700 font-mono font-semibold">User: kadus_rw3 | Pass: 123</span>
            </button>
          </div>
        </div>

        <div className="text-center text-[11px] text-slate-400 mt-6 leading-relaxed">
          <p>© 2026 Pemerintah Desa Randu. | Tim KKNT 128 UNDIP</p>
        </div>
      </div>
    </div>
  )
}

/* ==========================================================================
   2. OPERASIONAL LAYOUT UTAMA (ENGINE CORE & SUB-PAGE SWITCHER)
   ========================================================================== */
function MainAppComponent({ currentUser, onLogout, activeTab, onNavigate }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [notifikasi, setNotifikasi] = useState('')
  const fileInputRef = useRef(null)

  // State Halaman 1: Dashboard
  const [ringkasan, setRingkasan] = useState({ targetDesa: 0, terkumpul: 0, sisa: 0, progres: 0 })
  const [kadusData, setKadusData] = useState([])

  // State Halaman 2: Data Warga (Otomatis Terkunci Jika Role = Kadus)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterWilayah, setFilterWilayah] = useState(() => {
    return currentUser?.role === 'kadus' ? currentUser.wilayah : 'Semua Wilayah'
  })

  // Lock filterWilayah apabila Role = Kadus
  useEffect(() => {
    if (currentUser?.role === 'kadus' && currentUser?.wilayah) {
      setFilterWilayah(currentUser.wilayah)
      setPrintFilterWilayah(currentUser.wilayah)
    }
  }, [currentUser])
  const [filterStatus, setFilterStatus] = useState('Semua Status')
  const [dataWarga, setDataWarga] = useState([])
  const [selectedWarga, setSelectedWarga] = useState(null)
  const [modalMode, setModalMode] = useState(null) // 'view' | 'edit' | 'add' | 'delete'
  const [editForm, setEditForm] = useState({})
  const [isClosingModal, setIsClosingModal] = useState(false)
  const [isSavingWarga, setIsSavingWarga] = useState(false)
  const [tanahKeluarga, setTanahKeluarga] = useState([])
  const [isLoadingTanah, setIsLoadingTanah] = useState(false)
  // State Halaman 2: Data Warga CRUD
  const [addForm, setAddForm] = useState({
    nop: '',
    nama: '',
    wilayah: 'ep',
    rt: 'RT 01',
    tagihan: 0,
    status: 'Belum Lunas',
    tahun_pajak: String(new Date().getFullYear()),
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [currentLaporanPage, setCurrentLaporanPage] = useState(1)

  // State Halaman 3: Laporan Pajak (LPP)
  const [filterTahun, setFilterTahun] = useState(String(new Date().getFullYear()))
  const [filterBulan, setFilterBulan] = useState('Semua Bulan')
  const [filterTanggalDari, setFilterTanggalDari] = useState('')
  const [filterTanggalSampai, setFilterTanggalSampai] = useState('')
  const [filterStatusLaporan, setFilterStatusLaporan] = useState('Semua Status')
  const [rekapKeuangan, setRekapKeuangan] = useState({ penerimaanHariIni: 0, penerimaanBulanIni: 0, totalTransaksiSukses: 0, efektivitasSistem: 0 })
  const [logTransaksi, setLogTransaksi] = useState([])

  // Modal Salin Tagihan Ke Tahun Baru
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false)
  const [copyFromYear, setCopyFromYear] = useState('2026')
  const [copyToYear, setCopyToYear] = useState('2027')

  const availableYearsList = [2035, 2034, 2033, 2032, 2031, 2030, 2029, 2028, 2027, 2026, 2025, 2024]
  const defaultYearsList = availableYearsList

  // State Halaman 4: Sektor Wilayah
  const [totalSektor, setTotalSektor] = useState(0)
  const [daftarSektor, setDaftarSektor] = useState([])
  const [selectedSektor, setSelectedSektor] = useState(null)
  const [sektorForm, setSektorForm] = useState({ kode_sektor: '', nama_sektor: '', penanggung_jawab: '', warna_tema: 'bg-[#002b8c]' })

  const handleOpenAddSektor = () => {
    setSelectedSektor({ isNew: true })
    setSektorForm({
      kode_sektor: '',
      nama_sektor: '',
      penanggung_jawab: '',
      warna_tema: 'bg-[#002b8c]',
    })
    setModalMode('edit-sektor')
  }

  const handleOpenEditSektor = (sektor) => {
    setSelectedSektor(sektor)
    setSektorForm({
      kode_sektor: sektor.kode_sektor || '',
      nama_sektor: sektor.nama_sektor || '',
      penanggung_jawab: sektor.penanggung_jawab || '',
      warna_tema: sektor.warna_tema || 'bg-[#002b8c]',
    })
    setModalMode('edit-sektor')
  }

  const handleSaveEditSektor = async () => {
    if (!sektorForm.kode_sektor.trim() || !sektorForm.nama_sektor.trim()) {
      setNotifikasi('Kode Sektor dan Nama Sektor wajib diisi!')
      setTimeout(() => setNotifikasi(''), 3500)
      return
    }
    setIsSaving(true)
    try {
      const oldKode = selectedSektor?.isNew ? sektorForm.kode_sektor : (selectedSektor?.kode_sektor || sektorForm.kode_sektor)
      await updateSektorWilayah(oldKode, sektorForm)
      setNotifikasi(`Sektor ${sektorForm.kode_sektor.toUpperCase()} (${sektorForm.nama_sektor}) berhasil disimpan!`)
      setTimeout(() => setNotifikasi(''), 4000)
      handleCloseModal()
      await loadDataForActiveTab()
    } catch (err) {
      console.error('Gagal update sektor:', err)
      setNotifikasi(`Gagal menyimpan sektor: ${err.message}`)
      setTimeout(() => setNotifikasi(''), 5000)
    } finally {
      setIsSaving(false)
    }
  }

  // Modal Cetak PDF / Slip Per RT & KK
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
  const [printFilterWilayah, setPrintFilterWilayah] = useState('Semua Wilayah')
  const [printFilterRt, setPrintFilterRt] = useState('Semua RT')
  const [printFilterStatus, setPrintFilterStatus] = useState('Belum Lunas')
  const [printFilterTahun, setPrintFilterTahun] = useState('Semua Tahun')

  // State Halaman 5: Pengaturan
  const [isSaving, setIsSaving] = useState(false)
  const [formDesa, setFormDesa] = useState({ namaDesa: '', kecamatan: '', kabupaten: '', tahunAnggaran: '', targetNominalDesa: 0 })
  const [formAkun, setFormAkun] = useState({ usernameLama: '', passwordBaru: '', konfirmasiPassword: '' })

  const loadDataForActiveTab = async () => {
    setIsLoading(true)

    try {
      if (activeTab === 'dashboard') {
        const { ringkasan: ringkasanData, kadusData: kadusDataAsli } = await fetchDashboardData()
        setRingkasan(ringkasanData)
        setKadusData(kadusDataAsli)
      } else if (activeTab === 'data-warga') {
        setDataWarga(await fetchWargaData())
      } else if (activeTab === 'laporan-pajak') {
        const { rekapKeuangan: rekapKeuanganData, logTransaksi: logTransaksiData } = await fetchLaporanData()
        setRekapKeuangan(rekapKeuanganData)
        setLogTransaksi(logTransaksiData)
      } else if (activeTab === 'sektor-wilayah') {
        const { totalSektor: totalSektorData, daftarSektor: daftarSektorData } = await fetchSektorData()
        setTotalSektor(totalSektorData)
        setDaftarSektor(daftarSektorData)
      } else if (activeTab === 'pengaturan') {
        setFormDesa(await fetchSettingsData())
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadDataForActiveTab().catch((error) => {
      console.error('Gagal memuat data dari Supabase:', error)
      setIsLoading(false)
    })
  }, [activeTab])

  useEffect(() => { setCurrentPage(1) }, [searchTerm, filterWilayah, filterStatus, filterTahun])
  useEffect(() => { setCurrentLaporanPage(1) }, [filterBulan, filterTanggalDari, filterTanggalSampai, filterWilayah, filterTahun])

  const handleOpenImportDialog = () => {
    fileInputRef.current?.click()
  }

  const handleImportFileChange = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) return

    setIsLoading(true)

    try {
      const result = await importExcelSppt(file, { tahunPajak: new Date().getFullYear() })
      setNotifikasi(`Import selesai: ${result.totalRows} tagihan berhasil diimpor!`)
      setTimeout(() => setNotifikasi(''), 4500)
      await loadDataForActiveTab()
    } catch (error) {
      console.error('Gagal import Excel:', error)
      const msg = error?.message ?? String(error) ?? 'Unknown error'
      setNotifikasi(`Import Excel gagal: ${msg}`)
      setTimeout(() => setNotifikasi(''), 8000)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExecuteCopyTunggakan = async () => {
    setIsLoading(true)
    try {
      const fromY = Number(copyFromYear)
      const toY = Number(copyToYear)
      const copied = await copyUnpaidTagihan(fromY, toY)
      setNotifikasi(`Salin tagihan selesai: ${copied} data disalin dari tahun ${fromY} ke tahun ${toY}.`)
      setTimeout(() => setNotifikasi(''), 4500)
      setIsCopyModalOpen(false)
      setFilterTahun(String(toY))
      await loadDataForActiveTab()
    } catch (error) {
      console.error('Gagal copy tagihan:', error)
      setNotifikasi(`Gagal salin tagihan: ${error?.message || error}`)
      setTimeout(() => setNotifikasi(''), 5000)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenView = async (warga) => {
    setSelectedWarga(warga)
    setModalMode('view')
    setTanahKeluarga([])
    if (!warga.keluarga_id) return
    setIsLoadingTanah(true)
    try {
      const { data, error } = await supabase
        .from('tagihan_pbb')
        .select('nop, nama_wp, nominal_tagihan, status_lunas, tahun_pajak')
        .eq('keluarga_id', warga.keluarga_id)
        .order('nop')
      if (error) throw error
      setTanahKeluarga(data ?? [])
    } catch (err) {
      console.error('Gagal fetch tanah keluarga:', err)
    } finally {
      setIsLoadingTanah(false)
    }
  }

  const handleOpenAddModal = () => {
    setAddForm({
      nop: '',
      nama: '',
      tertagih_ke: '',
      wilayah: filterWilayah !== 'Semua Wilayah' ? filterWilayah : 'ep',
      rt: '',
      tagihan: 0,
      status: 'Belum Lunas',
      metode_pembayaran: 'Tunai / Kolektor',
      tahun_pajak: filterTahun !== 'Semua Tahun' ? filterTahun : String(new Date().getFullYear()),
      tanggal_jatuh_tempo: `${filterTahun !== 'Semua Tahun' ? filterTahun : new Date().getFullYear()}-09-30`,
    })
    setModalMode('add')
  }

  const handleOpenEdit = (warga) => {
    setSelectedWarga(warga)
    setEditForm({
      nama: warga.nama || '',
      tertagih_ke: warga.tertagih_ke || warga.nama_kepala_keluarga || warga.nama || '',
      tagihan: warga.tagihan || 0,
      status: warga.status || 'Belum Lunas',
      metode_pembayaran: warga.metode_pembayaran || 'Tunai / Kolektor',
      wilayah: warga.wilayah || 'ep',
      rt: warga.rt || '',
      tanggal_jatuh_tempo: warga.tanggal_jatuh_tempo || `${warga.tahun_pajak || new Date().getFullYear()}-09-30`,
    })
    setModalMode('edit')
  }

  const handleOpenDelete = (warga) => {
    setSelectedWarga(warga)
    setModalMode('delete')
  }

  const handleCloseModal = () => {
    setIsClosingModal(true)
    setTimeout(() => {
      setModalMode(null)
      setSelectedWarga(null)
      setIsClosingModal(false)
    }, 180)
  }

  const handleConfirmDelete = async () => {
    if (!selectedWarga) return
    setIsLoading(true)
    try {
      let query = supabase.from('tagihan_pbb').delete()
      if (selectedWarga.id) {
        query = query.eq('id', selectedWarga.id)
      } else {
        query = query.eq('nop', selectedWarga.nop).eq('tahun_pajak', selectedWarga.tahun_pajak || Number(filterTahun))
      }
      const { error } = await query
      if (error) throw error

      setNotifikasi(`Data NOP ${selectedWarga.nop} (${selectedWarga.nama}) Periode ${selectedWarga.tahun_pajak} berhasil dihapus.`)
      setTimeout(() => setNotifikasi(''), 4000)
      handleCloseModal()
      await loadDataForActiveTab()
    } catch (err) {
      console.error('Gagal hapus warga:', err)
      setNotifikasi(`Gagal menghapus: ${err.message}`)
      setTimeout(() => setNotifikasi(''), 5000)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveAddWarga = async () => {
    if (!addForm.nop || !addForm.nama) {
      setNotifikasi('NOP dan Nama Wajib Pajak harus diisi!')
      setTimeout(() => setNotifikasi(''), 3500)
      return
    }
    setIsSavingWarga(true)
    try {
      const headOfFamily = (addForm.tertagih_ke && addForm.tertagih_ke.trim()) ? addForm.tertagih_ke.trim() : addForm.nama.trim()

      // Cari KK existing berdasarkan nama (case-insensitive) — jangan buat baru kalau sudah ada
      const { data: existingKK } = await supabase
        .from('keluarga_pbb')
        .select('id')
        .ilike('nama_kepala_keluarga', headOfFamily)
        .limit(1)
        .maybeSingle()

      let keluargaId
      if (existingKK) {
        // Pakai KK yang sudah ada
        keluargaId = existingKK.id
      } else {
        // Buat KK baru hanya kalau benar-benar tidak ada
        const { data: newKK, error: keluargaError } = await supabase
          .from('keluarga_pbb')
          .insert({
            nama_kepala_keluarga: headOfFamily,
            nama_anggota_raw: headOfFamily,
            rt: addForm.rt.trim(),
            kode_blok: addForm.wilayah || 'ep',
            status_aktif: true,
            catatan: 'Input Manual Perangkat Desa',
          })
          .select('id')
          .single()
        if (keluargaError) throw keluargaError
        keluargaId = newKK.id
      }

      const isLunas = addForm.status === 'Lunas'
      const targetYear = Number(addForm.tahun_pajak) || Number(filterTahun) || new Date().getFullYear()

      const tagihanPayload = {
        keluarga_id: keluargaId,
        nop: addForm.nop.trim(),
        nama_wp: addForm.nama.trim(),
        tahun_pajak: targetYear,
        nominal_tagihan: Number(addForm.tagihan) || 0,
        denda: 0,
        status_lunas: isLunas,
        tanggal_bayar: isLunas ? new Date().toISOString().slice(0, 10) : null,
        dibayarkan_oleh: isLunas ? (addForm.metode_pembayaran || 'Tunai / Kolektor') : '',
        tanggal_jatuh_tempo: addForm.tanggal_jatuh_tempo || `${targetYear}-09-30`,
        tertagih_ke: headOfFamily,
        catatan: 'Manual Input',
      }

      const { error: tagihanError } = await supabase
        .from('tagihan_pbb')
        .upsert(tagihanPayload, { onConflict: 'nop,tahun_pajak' })

      if (tagihanError) throw tagihanError

      setNotifikasi(`Wajib Pajak Baru NOP ${addForm.nop} (${addForm.nama}) berhasil ditambahkan untuk Periode ${targetYear}!`)
      setTimeout(() => setNotifikasi(''), 4000)
      handleCloseModal()
      await loadDataForActiveTab()
    } catch (err) {
      console.error('Gagal tambah warga:', err)
      setNotifikasi(`Gagal menambah warga: ${err.message}`)
      setTimeout(() => setNotifikasi(''), 5000)
    } finally {
      setIsSavingWarga(false)
    }
  }

  const handleSaveEditWarga = async () => {
    if (!selectedWarga) return
    setIsSavingWarga(true)
    try {
      const isLunas = editForm.status === 'Lunas'
      const tertagihTarget = (editForm.tertagih_ke && editForm.tertagih_ke.trim()) ? editForm.tertagih_ke.trim() : editForm.nama.trim()

      let targetKeluargaId = selectedWarga.keluarga_id
      if (tertagihTarget) {
        // Cari KK existing berdasarkan nama (case-insensitive) — jangan buat baru kalau sudah ada
        const { data: existingKK } = await supabase
          .from('keluarga_pbb')
          .select('id')
          .ilike('nama_kepala_keluarga', tertagihTarget)
          .limit(1)
          .maybeSingle()

        if (existingKK) {
          // Pakai KK yang sudah ada
          targetKeluargaId = existingKK.id
        } else {
          // Buat KK baru hanya kalau benar-benar tidak ada
          const { data: newKK } = await supabase
            .from('keluarga_pbb')
            .insert({
              nama_kepala_keluarga: tertagihTarget,
              nama_anggota_raw: tertagihTarget,
              rt: editForm.rt || '',
              kode_blok: editForm.wilayah || 'ep',
              status_aktif: true,
            })
            .select('id')
            .single()
          if (newKK) targetKeluargaId = newKK.id
        }
      }

      const updatePayload = {
        nama_wp: editForm.nama.trim(),
        tertagih_ke: tertagihTarget,
        keluarga_id: targetKeluargaId,
        nominal_tagihan: Number(editForm.tagihan),
        status_lunas: isLunas,
        tanggal_bayar: isLunas ? (selectedWarga.tanggal_bayar || new Date().toISOString().slice(0, 10)) : null,
        dibayarkan_oleh: isLunas ? (editForm.metode_pembayaran || 'Tunai / Kolektor') : '',
        tanggal_jatuh_tempo: editForm.tanggal_jatuh_tempo || `${selectedWarga.tahun_pajak || new Date().getFullYear()}-09-30`,
      }

      let query = supabase.from('tagihan_pbb').update(updatePayload)
      if (selectedWarga.id) {
        query = query.eq('id', selectedWarga.id)
      } else {
        query = query.eq('nop', selectedWarga.nop).eq('tahun_pajak', selectedWarga.tahun_pajak || Number(filterTahun))
      }
      const { error } = await query
      if (error) throw error

      setNotifikasi(`Data NOP ${selectedWarga.nop} berhasil diperbarui (Pemilik: ${editForm.nama}, Tertagih Ke KK: ${tertagihTarget}).`)
      setTimeout(() => setNotifikasi(''), 3500)
      handleCloseModal()
      await loadDataForActiveTab()
    } catch (err) {
      setNotifikasi(`Gagal menyimpan: ${err.message}`)
      setTimeout(() => setNotifikasi(''), 5000)
    } finally {
      setIsSavingWarga(false)
    }
  }

  const dynamicBaseYear = new Date().getFullYear()
  const yearOffsets = Array.from({ length: 15 }, (_, i) => dynamicBaseYear + 10 - i)
  const availableYears = Array.from(
    new Set([
      ...yearOffsets,
      2026,
      2025,
      ...dataWarga.map(w => Number(w.tahun_pajak)).filter(Boolean),
      ...logTransaksi.map(t => Number(t.tahun_pajak)).filter(Boolean)
    ])
  ).sort((a, b) => b - a)

  const availableRts = Array.from(
    new Set(
      dataWarga
        .filter(w => printFilterWilayah === 'Semua Wilayah' || w.wilayah === printFilterWilayah)
        .map(w => w.rt ? w.rt.replace(/^RT\s*/i, 'RT ') : '')
        .filter(Boolean)
    )
  ).sort()

  const getPrintDataGrouped = () => {
    const filtered = dataWarga.filter(w => {
      const cocokWilayah = printFilterWilayah === 'Semua Wilayah' || w.wilayah === printFilterWilayah
      const cocokRt = printFilterRt === 'Semua RT' || (w.rt && w.rt.replace(/^RT\s*/i, 'RT ') === printFilterRt.replace(/^RT\s*/i, 'RT '))
      const cocokStatus = printFilterStatus === 'Semua Status' || w.status === printFilterStatus
      const cocokTahun = printFilterTahun === 'Semua Tahun' || String(w.tahun_pajak) === String(printFilterTahun)
      return cocokWilayah && cocokRt && cocokStatus && cocokTahun
    })

    const rwGroup = {}

    filtered.forEach(w => {
      const rwKey = getNamaWilayah(w.wilayah)
      const rtKey = w.rt ? w.rt.replace(/^RT\s*/i, 'RT ') : 'RT (Lainnya)'
      const kkKey = w.keluarga_id || `${w.wilayah}_${rtKey}_${w.nama_kepala_keluarga || w.nama}`

      if (!rwGroup[rwKey]) rwGroup[rwKey] = {}
      if (!rwGroup[rwKey][rtKey]) rwGroup[rwKey][rtKey] = {}
      if (!rwGroup[rwKey][rtKey][kkKey]) {
        rwGroup[rwKey][rtKey][kkKey] = {
          nama_kepala_keluarga: w.nama_kepala_keluarga || w.nama,
          nama_anggota_raw: w.nama_anggota_raw,
          wilayah: rwKey,
          rt: rtKey,
          tahun_pajak: w.tahun_pajak,
          tanggal_jatuh_tempo: w.tanggal_jatuh_tempo || `${w.tahun_pajak}-09-30`,
          items: [],
          total_tagihan: 0
        }
      }

      rwGroup[rwKey][rtKey][kkKey].items.push(w)
      rwGroup[rwKey][rtKey][kkKey].total_tagihan += Number(w.tagihan || 0)
    })

    return rwGroup
  }

  const filteredWarga = dataWarga.filter(w => {
    const cocokKeyword = (w.nama?.toLowerCase().includes(searchTerm.toLowerCase()) || false) || (w.nop?.includes(searchTerm) || false)
    const cocokWilayah = filterWilayah === 'Semua Wilayah' || w.wilayah?.toLowerCase() === filterWilayah?.toLowerCase()
    const cocokStatus = filterStatus === 'Semua Status' || w.status === filterStatus
    const cocokTahun = filterTahun === 'Semua Tahun' || String(w.tahun_pajak) === String(filterTahun)
    return cocokKeyword && cocokWilayah && cocokStatus && cocokTahun
  })

  const ITEMS_PER_PAGE = 15
  const totalPages = Math.max(1, Math.ceil(filteredWarga.length / ITEMS_PER_PAGE))
  const paginatedWarga = filteredWarga.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const filteredLaporan = logTransaksi.filter(t => {
    const cocokWilayah = filterWilayah === 'Semua Wilayah' || (t.kode_blok && t.kode_blok.toLowerCase() === filterWilayah.toLowerCase()) || t.wilayah === filterWilayah
    const cocokTahun = filterTahun === 'Semua Tahun' || String(t.tahun_pajak) === String(filterTahun)
    const cocokStatus = filterStatusLaporan === 'Semua Status' || t.status === filterStatusLaporan
    let cocokTanggal = true
    if (filterTanggalDari || filterTanggalSampai) {
      // Hanya filter tanggal untuk yang sudah bayar (punya tanggal)
      const tgl = t.tanggal && t.tanggal !== '-' ? t.tanggal : null
      if (!tgl) {
        // Kalau belum bayar (tanggal kosong) dan ada filter tanggal → tetap tampil kecuali filter status = Lunas
        cocokTanggal = filterStatusLaporan !== 'Lunas'
      } else {
        // Parse tanggal format DD/MM/YYYY atau YYYY-MM-DD
        let tglDate
        if (tgl.includes('/')) {
          const [d, m, y] = tgl.split('/')
          tglDate = new Date(`${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`)
        } else {
          tglDate = new Date(tgl)
        }
        if (filterTanggalDari) cocokTanggal = cocokTanggal && tglDate >= new Date(filterTanggalDari)
        if (filterTanggalSampai) cocokTanggal = cocokTanggal && tglDate <= new Date(filterTanggalSampai)
      }
    }
    return cocokWilayah && cocokTahun && cocokStatus && cocokTanggal
  })

  const LAPORAN_PER_PAGE = 20
  const totalLaporanPages = Math.max(1, Math.ceil(filteredLaporan.length / LAPORAN_PER_PAGE))
  const paginatedLaporan = filteredLaporan.slice((currentLaporanPage - 1) * LAPORAN_PER_PAGE, currentLaporanPage * LAPORAN_PER_PAGE)

  const handleSaveDesa = (e) => {
    e.preventDefault()
    setIsSaving(true)
    saveSettingsData(formDesa)
      .then(() => {
        setNotifikasi('Target nominal PBB Desa berhasil diperbarui!')
        setTimeout(() => setNotifikasi(''), 3000)
      })
      .catch((err) => console.error(err))
      .finally(() => setIsSaving(false))
  }

  const handleUpdatePassword = (e) => {
    e.preventDefault()
    if (!formAkun.passwordBaru) {
      setNotifikasi('Kata sandi baru tidak boleh kosong!')
      setTimeout(() => setNotifikasi(''), 3000)
      return
    }
    try {
      const users = getAppUsers()
      const found = users.find(u => String(u.username).trim().toLowerCase() === String(currentUser.username || '').trim().toLowerCase())
      if (found) {
        found.password = formAkun.passwordBaru
        localStorage.setItem('pbb_registered_users', JSON.stringify(users))
      }
      setNotifikasi('Kata sandi akun Anda berhasil diperbarui!')
      setFormAkun({ ...formAkun, passwordBaru: '' })
      setTimeout(() => setNotifikasi(''), 3000)
    } catch (err) {
      setNotifikasi(`Gagal memperbarui sandi: ${err.message}`)
      setTimeout(() => setNotifikasi(''), 3500)
    }
  }

  const renderMetodeBadge = (metodeStr, statusStr) => {
    const val = (metodeStr || '').toLowerCase().trim()
    const isLunas = statusStr === 'Lunas'
    if (val.includes('transfer') || val.includes('bank') || val.includes('qris') || val.includes('brimo')) {
      return (
        <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-800 px-2.5 py-1 rounded-lg text-xs font-bold border border-blue-200">
          <Building className="w-3.5 h-3.5 text-blue-600" />
          <span>Transfer Bank</span>
        </span>
      )
    }
    if (val.includes('tunai') || val.includes('kolektor') || isLunas) {
      return (
        <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-lg text-xs font-bold border border-emerald-200/80">
          <Wallet className="w-3.5 h-3.5 text-emerald-600" />
          <span>Tunai / Kolektor</span>
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-500 px-2.5 py-1 rounded-lg text-xs font-medium border border-slate-200">
        <span>Belum Bayar</span>
      </span>
    )
  }



  const renderStatusBadge = (statusStr) => {
    if (statusStr === 'Lunas') {
      return (
        <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-lg text-xs font-extrabold border border-emerald-300 shadow-xs">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
          <span>Lunas</span>
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 px-2.5 py-1 rounded-lg text-xs font-extrabold border border-rose-300 shadow-xs">
        <AlertCircle className="w-3.5 h-3.5 text-rose-700" />
        <span>Belum Lunas</span>
      </span>
    )
  }

  const kadusDashboardStats = (() => {
    if (currentUser?.role !== 'kadus') return null

    const filtered = dataWarga.filter(w => w.wilayah === currentUser.wilayah)
    const totalTagihan = filtered.reduce((acc, w) => acc + Number(w.tagihan || 0), 0)
    const totalTerkumpul = filtered.filter(w => w.status === 'Lunas').reduce((acc, w) => acc + Number(w.tagihan || 0), 0)
    const sisaTagihan = totalTagihan - totalTerkumpul
    const progres = totalTagihan > 0 ? Math.round((totalTerkumpul / totalTagihan) * 100) : 0

    // Grouping per RT
    const rtMap = {}
    filtered.forEach(w => {
      const rtKey = w.rt ? w.rt.replace(/^RT\s*/i, 'RT ') : 'RT (Lainnya)'
      if (!rtMap[rtKey]) {
        rtMap[rtKey] = {
          rtName: rtKey,
          totalNominal: 0,
          terkumpulNominal: 0,
          sisaNominal: 0,
          totalWarga: 0,
          lunasWarga: 0,
        }
      }
      const tag = Number(w.tagihan || 0)
      rtMap[rtKey].totalNominal += tag
      rtMap[rtKey].totalWarga += 1
      if (w.status === 'Lunas') {
        rtMap[rtKey].terkumpulNominal += tag
        rtMap[rtKey].lunasWarga += 1
      } else {
        rtMap[rtKey].sisaNominal += tag
      }
    })

    const rtList = Object.values(rtMap).map(rt => {
      const rtProgres = rt.totalNominal > 0 ? Math.round((rt.terkumpulNominal / rt.totalNominal) * 100) : 0
      return { ...rt, progres: rtProgres }
    }).sort((a, b) => a.rtName.localeCompare(b.rtName))

    return {
      totalTagihan,
      totalTerkumpul,
      sisaTagihan,
      progres,
      totalWarga: filtered.length,
      lunasWarga: filtered.filter(w => w.status === 'Lunas').length,
      rtList,
    }
  })()

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
          
          <div className="p-5 border-b border-slate-700/50 bg-slate-800/30 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-sm text-slate-100">{currentUser?.nama || 'Sekdes Randu'}</h4>
              <p className="text-xs text-blue-400 font-semibold mt-0.5">
                {currentUser?.role === 'kadus' 
                  ? `Koordinator (${getNamaWilayah(currentUser.wilayah)})`
                  : 'Sekretaris Desa (Semua RW)'}
              </p>
            </div>
            <button 
              onClick={onLogout} 
              title="Keluar / Ganti Role Akun" 
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-700/50 transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
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
          <button onClick={handleOpenImportDialog} className="w-full flex items-center justify-center space-x-2 bg-[#2563eb] hover:bg-blue-700 text-white py-2.5 px-4 rounded-xl text-xs font-semibold shadow-sm transition-all"><FileText className="w-4 h-4" /><span>Import Excel</span></button>
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
            <h4 className="font-bold text-xs text-slate-100">{currentUser?.nama || 'Sekdes Randu'}</h4>
            <p className="text-[10px] text-blue-400 font-semibold mt-0.5">
              {currentUser?.role === 'kadus' 
                ? `Koordinator (${getNamaWilayah(currentUser.wilayah)})`
                : 'Sekretaris Desa (Semua RW)'}
            </p>
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
        <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImportFileChange} />
        {notifikasi && activeTab !== 'pengaturan' && (
          <div className="bg-emerald-50 text-emerald-700 text-xs font-bold p-4 rounded-xl border border-emerald-100 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>{notifikasi}</span>
          </div>
        )}
        
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
                {currentUser?.role === 'kadus' ? (
                  /* DASHBOARD KHUSUS ROLE KADUS */
                  <>
                    <div className="border-b border-slate-200 pb-4">
                      <div className="flex items-center gap-2">
                        <h2 className="text-2xl font-bold text-slate-800">Dashboard {getNamaWilayah(currentUser.wilayah)}</h2>
                        <span className="bg-blue-100 text-[#002b8c] text-xs font-bold px-2.5 py-0.5 rounded-md border border-blue-200">
                          Akses Kadus
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Pemantauan & progres penagihan PBB-P2 khusus wilayah binaan <strong>{getNamaWilayah(currentUser.wilayah)}</strong>.
                      </p>
                    </div>

                    {/* 4 Kartu Ringkasan Wilayah Kadus */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Target Tagihan {getNamaWilayah(currentUser.wilayah)}</span>
                        <span className="text-xl font-extrabold text-slate-800 mt-2">Rp {(kadusDashboardStats?.totalTagihan || 0).toLocaleString('id-ID')}</span>
                        <span className="text-[11px] text-slate-500 font-medium mt-1">{kadusDashboardStats?.totalWarga || 0} Bidang Tanah / NOP</span>
                      </div>

                      <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Lunas Terkumpul</span>
                        <span className="text-xl font-extrabold text-emerald-700 mt-2">Rp {(kadusDashboardStats?.totalTerkumpul || 0).toLocaleString('id-ID')}</span>
                        <span className="text-[11px] text-emerald-600 font-semibold mt-1">{kadusDashboardStats?.lunasWarga || 0} Tagihan Terbayar</span>
                      </div>

                      <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sisa Belum Lunas</span>
                        <span className="text-xl font-extrabold text-rose-600 mt-2">Rp {(kadusDashboardStats?.sisaTagihan || 0).toLocaleString('id-ID')}</span>
                        <span className="text-[11px] text-rose-500 font-semibold mt-1">{(kadusDashboardStats?.totalWarga || 0) - (kadusDashboardStats?.lunasWarga || 0)} Tagihan Tertunggak</span>
                      </div>

                      <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Capaian Progres</span>
                          <span className="text-base font-extrabold text-slate-800">{kadusDashboardStats?.progres || 0}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2.5 rounded-full mt-4 overflow-hidden">
                          <div className="bg-[#002b8c] h-full rounded-full transition-all duration-500" style={{ width: `${kadusDashboardStats?.progres || 0}%` }}></div>
                        </div>
                      </div>
                    </div>

                    {/* Action Quick Buttons */}
                    <div className="flex flex-wrap gap-3">
                      <button onClick={() => onNavigate('data-warga')} className="flex items-center space-x-2 bg-[#002b8c] hover:bg-blue-950 text-white text-xs font-bold py-3 px-5 rounded-xl shadow-sm transition-all">
                        <Users className="w-4 h-4" />
                        <span>Lihat Data Warga {getNamaWilayah(currentUser.wilayah)}</span>
                      </button>
                      <button onClick={() => setIsPrintModalOpen(true)} className="flex items-center space-x-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold py-3 px-5 rounded-xl shadow-sm transition-all">
                        <Printer className="w-4 h-4" />
                        <span>Cetak Slip Penagihan Per RT</span>
                      </button>
                    </div>

                    {/* Tabel Rincian Progres Per RT di Wilayah Kadus */}
                    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                      <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="font-bold text-sm text-slate-700">Rincian Capaian Penagihan Per RT ({getNamaWilayah(currentUser.wilayah)})</h3>
                        <span className="text-xs font-semibold text-slate-500">{kadusDashboardStats?.rtList.length || 0} Wilayah RT</span>
                      </div>
                      <div className="p-6 space-y-4">
                        {kadusDashboardStats?.rtList && kadusDashboardStats.rtList.length > 0 ? (
                          kadusDashboardStats.rtList.map((rt, idx) => (
                            <div key={idx} className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/60 space-y-2">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs sm:text-sm gap-1">
                                <strong className="font-bold text-slate-800 text-sm">{rt.rtName}</strong>
                                <div className="flex items-center gap-4 text-xs">
                                  <span className="text-slate-500">Terkumpul: <strong className="text-emerald-700">Rp {rt.terkumpulNominal.toLocaleString('id-ID')}</strong></span>
                                  <span className="text-slate-500">Sisa: <strong className="text-rose-600">Rp {rt.sisaNominal.toLocaleString('id-ID')}</strong></span>
                                  <span className="font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">{rt.progres}%</span>
                                </div>
                              </div>
                              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                                <div className="bg-[#002b8c] h-full rounded-full transition-all duration-700" style={{ width: `${rt.progres}%` }}></div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-slate-400 text-center py-4">Belum ada data rincian RT untuk wilayah ini.</p>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  /* DASHBOARD KESELURUHAN UNTUK SEKDES (ADMINISTRATOR DESA) */
                  <>
                    <div className="border-b border-slate-200 pb-4">
                      <div className="flex items-center gap-2">
                        <h2 className="text-2xl font-bold text-slate-800">Ringkasan PBB Desa Randu</h2>
                        <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2.5 py-0.5 rounded-md border border-amber-200">
                          Sekretaris Desa (Admin)
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Sistem monitoring realisasi kas pembukuan PBB-P2 seluruh wilayah Desa Randu.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between"><span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Target Desa</span><span className="text-xl font-extrabold text-slate-800 mt-2">Rp {ringkasan.targetDesa.toLocaleString('id-ID')}</span></div>
                      <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between"><span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Terkumpul</span><span className="text-xl font-extrabold text-emerald-700 mt-2">Rp {ringkasan.terkumpul.toLocaleString('id-ID')}</span></div>
                      <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between"><span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sisa</span><span className="text-xl font-extrabold text-rose-600 mt-2">Rp {ringkasan.sisa.toLocaleString('id-ID')}</span></div>
                      <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between">
                        <div className="flex justify-between items-center"><span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Progres Desa</span><span className="text-base font-extrabold text-slate-800">{ringkasan.progres}%</span></div>
                        <div className="w-full bg-slate-100 h-2.5 rounded-full mt-4 overflow-hidden"><div className="bg-[#002b8c] h-full rounded-full transition-all duration-500" style={{ width: `${ringkasan.progres}%` }}></div></div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button onClick={handleOpenImportDialog} className="flex items-center space-x-2 bg-[#002b8c] hover:bg-blue-950 text-white text-xs font-bold py-3 px-5 rounded-xl shadow-sm transition-all"><Download className="w-4 h-4" /><span>Import Excel SPPT</span></button>
                      <button onClick={() => setIsCopyModalOpen(true)} className="flex items-center space-x-2 bg-white border-2 border-[#002b8c] text-[#002b8c] hover:bg-blue-50/50 text-xs font-bold py-2.5 px-5 rounded-xl shadow-sm transition-all"><Copy className="w-4 h-4" /><span>Salin Tagihan ke Tahun Baru (2027, 2028, dst)</span></button>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                      <div className="bg-slate-50 px-6 py-4 border-b border-slate-100"><h3 className="font-bold text-sm text-slate-700">Perbandingan Capaian Per Wilayah Kadus (RW 1 – RW 7)</h3></div>
                      <div className="p-6 space-y-5">
                        {kadusData.length > 0 ? (
                          kadusData.map((kadus, idx) => (
                            <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between text-xs sm:text-sm">
                              <span className="w-36 font-semibold text-slate-600 mb-1 sm:mb-0">{kadus.nama_wilayah}</span>
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
                  <div className="flex items-center space-x-2 self-start sm:self-auto">
                    <button onClick={() => setIsPrintModalOpen(true)} className="flex items-center space-x-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-sm transition-all">
                      <Printer className="w-4 h-4" />
                      <span>Cetak Slip Per RT</span>
                    </button>
                    <button onClick={handleOpenAddModal} className="flex items-center space-x-2 bg-[#002b8c] hover:bg-blue-950 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-sm transition-all">
                      <Plus className="w-4 h-4" />
                      <span>Tambah Warga</span>
                    </button>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col lg:flex-row gap-3">
                  <div className="flex-1 relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400"><Search className="w-4 h-4" /></span>
                    <input type="text" placeholder="Cari berdasarkan NOP atau Nama..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900 text-slate-800 placeholder-slate-400" />
                  </div>
                  <select value={filterTahun} onChange={(e) => setFilterTahun(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-[#002b8c] focus:outline-none">
                    <option value="Semua Tahun">Semua Periode Tahun</option>
                    {availableYears.map(yr => (
                      <option key={yr} value={String(yr)}>Tahun Pajak {yr}</option>
                    ))}
                  </select>
                  <select 
                    value={filterWilayah} 
                    onChange={(e) => setFilterWilayah(e.target.value)} 
                    disabled={currentUser?.role === 'kadus'}
                    className={`rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none transition-all ${currentUser?.role === 'kadus' ? 'bg-blue-50/70 border border-blue-200 text-[#002b8c] font-bold cursor-not-allowed' : 'bg-slate-50 border border-slate-200 text-slate-600'}`}
                  >
                    {currentUser?.role === 'kadus' ? (
                      <option value={currentUser.wilayah}>🔒 {getNamaWilayah(currentUser.wilayah)} (Terkunci Role Kadus)</option>
                    ) : (
                      WILAYAH_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))
                    )}
                  </select>
                  <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 focus:outline-none"><option>Semua Status</option><option>Lunas</option><option>Belum Lunas</option></select>
                </div>

                {/* Desktop View (Table) */}
                <div className="hidden md:block bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        <th className="px-6 py-4">NOP</th><th className="px-6 py-4">Periode</th><th className="px-6 py-4">Nama Wajib Pajak</th><th className="px-6 py-4">Wilayah</th><th className="px-6 py-4">Tagihan</th><th className="px-6 py-4">Masa Tenggat</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                      {paginatedWarga.length > 0 ? (
                        paginatedWarga.map((w) => (
                          <tr key={w.id} className="hover:bg-slate-50/50">
                            <td className="px-6 py-4 font-mono text-xs text-slate-400 font-semibold">{w.nop}</td>
                            <td className="px-6 py-4"><span className="font-bold text-xs text-[#002b8c] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">{w.tahun_pajak}</span></td>
                            <td className="px-6 py-4 font-bold text-slate-800">{w.nama}</td>
                            <td className="px-6 py-4">{getNamaWilayah(w.wilayah)}{w.rt ? ` (${w.rt.replace(/^RT\s*/i, 'RT ')})` : ''}</td>
                            <td className="px-6 py-4 font-extrabold text-slate-800">Rp {w.tagihan?.toLocaleString('id-ID')}</td>
                            <td className="px-6 py-4">
                              <span className="text-xs font-semibold text-amber-800 bg-amber-50/80 px-2.5 py-1 rounded-lg border border-amber-200/60 inline-flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-amber-600" />
                                {formatIndoDate(w.tanggal_jatuh_tempo || `${w.tahun_pajak}-09-30`)}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <button 
                                onClick={() => handleToggleStatus(w)}
                                title="Klik untuk ubah status lunas/belum lunas"
                                className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all hover:scale-105 active:scale-95 ${w.status === 'Lunas' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100'}`}
                              >
                                {w.status}
                              </button>
                            </td>
                            <td className="px-6 py-4 text-center"><div className="flex justify-center space-x-1"><button onClick={() => handleOpenView(w)} className="p-2 text-slate-400 hover:text-blue-700" title="Lihat Detail"><Eye className="w-4 h-4" /></button><button onClick={() => handleOpenEdit(w)} className="p-2 text-slate-400 hover:text-amber-600" title="Edit Data & Wilayah"><Edit className="w-4 h-4" /></button><button onClick={() => handleOpenDelete(w)} className="p-2 text-slate-400 hover:text-rose-600" title="Hapus Data Warga"><Trash2 className="w-4 h-4" /></button></div></td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan="8" className="text-center py-12 text-slate-400">Belum ada data warga di database.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View (Cards) */}
                <div className="md:hidden space-y-3">
                  {paginatedWarga.length > 0 ? (
                    paginatedWarga.map((w) => (
                      <div key={w.id} className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200/60">{w.nop}</span>
                            <span className="font-bold text-[11px] text-[#002b8c] bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">{w.tahun_pajak}</span>
                          </div>
                          <button 
                            onClick={() => handleToggleStatus(w)}
                            title="Klik untuk ubah status lunas/belum lunas"
                            className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${w.status === 'Lunas' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}
                          >
                            {w.status}
                          </button>
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 text-base">{w.nama}</h3>
                          <p className="text-xs text-slate-500 mt-0.5">{getNamaWilayah(w.wilayah)}{w.rt ? ` (${w.rt.replace(/^RT\s*/i, 'RT ')})` : ''}</p>
                          <div className="flex items-center space-x-1.5 text-[11px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60 mt-1.5 w-fit font-semibold">
                            <Calendar className="w-3.5 h-3.5 text-amber-600" />
                            <span>Jatuh Tempo: {formatIndoDate(w.tanggal_jatuh_tempo || `${w.tahun_pajak}-09-30`)}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Tagihan</span>
                            <span className="text-sm font-extrabold text-slate-800">Rp {w.tagihan?.toLocaleString('id-ID')}</span>
                          </div>
                          <div className="flex items-center space-x-1.5">
                            <button onClick={() => handleOpenView(w)} className="flex items-center space-x-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all">
                              <Eye className="w-3.5 h-3.5 text-blue-600" />
                              <span>Detail</span>
                            </button>
                            <button onClick={() => handleOpenEdit(w)} className="flex items-center space-x-1 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl text-xs font-semibold transition-all border border-amber-200/60">
                              <Edit className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>
                            <button onClick={() => handleOpenDelete(w)} className="flex items-center space-x-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold transition-all border border-rose-200/60">
                              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                              <span>Hapus</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-white p-8 rounded-2xl border border-slate-200/60 shadow-sm text-center text-slate-400 text-sm">
                      Belum ada data warga di database.
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {filteredWarga.length > ITEMS_PER_PAGE && (
                  <div className="flex items-center justify-between bg-white px-5 py-3 rounded-2xl border border-slate-200/60 shadow-sm">
                    <p className="text-xs text-slate-500">
                      Menampilkan <span className="font-semibold text-slate-700">{(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredWarga.length)}</span> dari <span className="font-semibold text-slate-700">{filteredWarga.length}</span> data
                    </p>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className="px-2 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
                      >«</button>
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
                      ><ChevronLeft className="w-3 h-3" /> Prev</button>

                      {/* Nomor halaman */}
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                        .reduce((acc, p, idx, arr) => {
                          if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...')
                          acc.push(p)
                          return acc
                        }, [])
                        .map((p, idx) =>
                          p === '...'
                            ? <span key={`ellipsis-${idx}`} className="px-2 text-slate-400 text-xs">…</span>
                            : <button
                                key={p}
                                onClick={() => setCurrentPage(p)}
                                className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${currentPage === p ? 'bg-[#002b8c] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
                              >{p}</button>
                        )
                      }

                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
                      >Next <ChevronRight className="w-3 h-3" /></button>
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="px-2 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
                      >»</button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ====== MODAL DETAIL WARGA ====== */}
            {modalMode === 'view' && selectedWarga && (
              <div className={`modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 ${isClosingModal ? 'closing' : ''}`} onClick={handleCloseModal}>
                <div className="modal-panel bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-bold text-slate-800">Detail Wajib Pajak</h3>
                    <button onClick={handleCloseModal} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><X className="w-5 h-5" /></button>
                  </div>

                  {/* Info Kepala Keluarga */}
                  <div className="space-y-2 text-sm mb-5">
                    {[
                      ['Kepala Keluarga', selectedWarga.nama_kepala_keluarga || selectedWarga.nama],
                      ['Anggota', selectedWarga.nama_anggota_raw || '-'],
                      ['Wilayah', `${getNamaWilayah(selectedWarga.wilayah)}${selectedWarga.rt ? ` (${selectedWarga.rt.replace(/^RT\s*/i, 'RT ')})` : ''}`],
                      ['Masa Tenggat (Jatuh Tempo)', formatIndoDate(selectedWarga.tanggal_jatuh_tempo || `${selectedWarga.tahun_pajak}-09-30`)],
                    ].map(([label, value]) => (
                      <div key={label} className="flex justify-between py-2 border-b border-slate-100">
                        <span className="text-slate-500 font-medium">{label}</span>
                        <span className="font-semibold text-slate-800 text-right max-w-[60%]">{value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Daftar Bidang Tanah */}
                  <div className="mb-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Bidang Tanah / NOP</h4>
                    {isLoadingTanah ? (
                      <p className="text-sm text-slate-400 text-center py-4">Memuat data tanah...</p>
                    ) : tanahKeluarga.length === 0 ? (
                      <p className="text-sm text-slate-400 text-center py-4">Tidak ada data tanah.</p>
                    ) : (
                      <div className="space-y-2">
                        {tanahKeluarga.map((t, i) => (
                          <div key={t.nop} className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                            <div>
                              <p className="font-mono text-xs text-slate-400 font-semibold">{t.nop}</p>
                              <p className="text-sm font-semibold text-slate-700">{t.nama_wp}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-slate-800">Rp {Number(t.nominal_tagihan).toLocaleString('id-ID')}</p>
                              <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-bold ${t.status_lunas ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                {t.status_lunas ? 'Lunas' : 'Belum Lunas'}
                              </span>
                            </div>
                          </div>
                        ))}
                        {/* Total */}
                        <div className="flex justify-between px-4 py-2 bg-blue-50 rounded-xl border border-blue-100 mt-1">
                          <span className="text-sm font-bold text-blue-800">Total ({tanahKeluarga.length} bidang)</span>
                          <span className="text-sm font-bold text-blue-800">
                            Rp {tanahKeluarga.reduce((s, t) => s + Number(t.nominal_tagihan), 0).toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <button onClick={handleCloseModal} className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 text-sm">Tutup</button>
                </div>
              </div>
            )}

            {/* ====== MODAL TAMBAH WARGA BARU ====== */}
            {modalMode === 'add' && (
              <div className={`modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 ${isClosingModal ? 'closing' : ''}`} onClick={handleCloseModal}>
                <div className="modal-panel bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-800">Tambah Wajib Pajak / Tanah Baru</h3>
                    <button onClick={handleCloseModal} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><X className="w-5 h-5" /></button>
                  </div>

                  <div className="space-y-4 text-sm">
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1 text-xs">Periode Tahun Pajak</label>
                      <select value={addForm.tahun_pajak} onChange={e => setAddForm(f => ({ ...f, tahun_pajak: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl bg-blue-50/60 border border-blue-200 font-bold text-[#002b8c] text-sm focus:outline-none">
                        {availableYears.map(yr => (
                          <option key={yr} value={String(yr)}>Tahun Pajak {yr}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-600 font-semibold mb-1 text-xs">NOP (Nomor Objek Pajak)</label>
                      <input type="text" placeholder="Contoh: 33.27.010.005.001-0002.0" value={addForm.nop} onChange={e => setAddForm(f => ({ ...f, nop: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-900 text-slate-800 text-sm font-mono" />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-semibold mb-1 text-xs">Nama Pemilik / Wajib Pajak (SPPT)</label>
                      <input type="text" placeholder="Masukkan nama pemilik tanah" value={addForm.nama} onChange={e => setAddForm(f => ({ ...f, nama: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-900 text-slate-800 text-sm font-semibold" />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-semibold mb-1 text-xs">Penanggung Jawab / Kepala Keluarga (Tertagih Ke)</label>
                      <input
                        type="text"
                        list="kk-list-add"
                        placeholder="Ketik atau pilih nama KK yang sudah ada..."
                        value={addForm.tertagih_ke ?? ''}
                        onChange={e => setAddForm(f => ({ ...f, tertagih_ke: e.target.value }))}
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-900 text-slate-800 text-sm font-semibold"
                      />
                      <datalist id="kk-list-add">
                        {Array.from(new Set(dataWarga.map(w => w.nama_kepala_keluarga || w.nama).filter(Boolean))).sort().map(nama => (
                          <option key={nama} value={nama} />
                        ))}
                      </datalist>
                      <span className="text-[10px] text-slate-400 mt-1 block">Pilih KK yang sudah ada, atau ketik nama baru jika belum terdaftar. Kosongkan jika sama dengan nama pemilik.</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-600 font-semibold mb-1 text-xs">Wilayah / Dusun / RW</label>
                        <select value={addForm.wilayah} onChange={e => setAddForm(f => ({ ...f, wilayah: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-900 text-slate-800 text-xs font-semibold">
                          {Object.entries(WILAYAH_MAP).map(([kode, nama]) => (
                            <option key={kode} value={kode}>{nama}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-600 font-semibold mb-1 text-xs">RT</label>
                        <input type="text" placeholder="RT 01" value={addForm.rt} onChange={e => setAddForm(f => ({ ...f, rt: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-900 text-slate-800 text-sm" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-600 font-semibold mb-1 text-xs">Nominal Tagihan (Rp)</label>
                      <input type="number" placeholder="0" value={addForm.tagihan} onChange={e => setAddForm(f => ({ ...f, tagihan: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-900 text-slate-800 text-sm" />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-semibold mb-1 text-xs">Masa Tenggat (Tanggal Jatuh Tempo)</label>
                      <input type="date" value={addForm.tanggal_jatuh_tempo || ''} onChange={e => setAddForm(f => ({ ...f, tanggal_jatuh_tempo: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-900 text-slate-800 text-sm font-semibold" />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-semibold mb-1 text-xs">Status Pembayaran</label>
                      <select value={addForm.status} onChange={e => setAddForm(f => ({ ...f, status: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-900 text-slate-700 text-sm font-semibold">
                        <option value="Belum Lunas">Belum Lunas</option>
                        <option value="Lunas">Lunas</option>
                      </select>
                    </div>

                    {addForm.status === 'Lunas' && (
                      <div>
                        <label className="block text-slate-600 font-semibold mb-1 text-xs">Metode Pembayaran</label>
                        <select value={addForm.metode_pembayaran ?? 'Tunai / Kolektor'} onChange={e => setAddForm(f => ({ ...f, metode_pembayaran: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl bg-blue-50/70 border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-900 text-[#002b8c] text-sm font-bold">
                          <option value="Tunai / Kolektor">Tunai / Kolektor</option>
                          <option value="Transfer Bank">Transfer Bank</option>
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button onClick={handleCloseModal} className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 text-sm">Batal</button>
                    <button onClick={handleSaveAddWarga} disabled={isSavingWarga} className="flex-1 py-2.5 rounded-xl bg-[#002b8c] text-white font-semibold hover:bg-blue-950 text-sm disabled:opacity-60 flex items-center justify-center">
                      {isSavingWarga ? 'Menyimpan...' : 'Simpan Warga Baru'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ====== MODAL EDIT WARGA ====== */}
            {modalMode === 'edit' && selectedWarga && (
              <div className={`modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 ${isClosingModal ? 'closing' : ''}`} onClick={handleCloseModal}>
                <div className="modal-panel bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-bold text-slate-800">Edit Wajib Pajak & Lokasi Tanah</h3>
                    <button onClick={handleCloseModal} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><X className="w-5 h-5" /></button>
                  </div>
                  <div className="space-y-4 text-sm">
                    <div>
                      <label className="block text-slate-600 font-medium mb-1 text-xs">Periode Pajak</label>
                      <input value={`Tahun Pajak ${selectedWarga.tahun_pajak || filterTahun}`} disabled className="w-full px-3 py-2.5 rounded-xl bg-blue-50/70 text-[#002b8c] font-bold border border-blue-100 text-sm" />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1 text-xs">NOP</label>
                      <input value={selectedWarga.nop} disabled className="w-full px-3 py-2.5 rounded-xl bg-slate-100 text-slate-400 border border-slate-200 text-sm font-mono" />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1 text-xs">Nama Pemilik / Wajib Pajak (SPPT)</label>
                      <input value={editForm.nama ?? ''} onChange={e => setEditForm(f => ({ ...f, nama: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-900 text-slate-800 text-sm font-semibold" />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-semibold mb-1 text-xs">Penanggung Jawab / Kepala Keluarga (Tertagih Ke)</label>
                      <input
                        type="text"
                        list="kk-list-edit"
                        placeholder="Ketik atau pilih nama KK yang sudah ada..."
                        value={editForm.tertagih_ke ?? ''}
                        onChange={e => setEditForm(f => ({ ...f, tertagih_ke: e.target.value }))}
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-900 text-slate-800 text-sm font-semibold"
                      />
                      <datalist id="kk-list-edit">
                        {Array.from(new Set(dataWarga.map(w => w.nama_kepala_keluarga || w.nama).filter(Boolean))).sort().map(nama => (
                          <option key={nama} value={nama} />
                        ))}
                      </datalist>
                      <span className="text-[10px] text-slate-400 mt-1 block">Pilih KK yang sudah ada, atau ketik nama baru jika belum terdaftar. Kosongkan jika sama dengan nama pemilik.</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-600 font-semibold mb-1 text-xs">Wilayah / Dusun / RW</label>
                        <select value={editForm.wilayah ?? 'ep'} onChange={e => setEditForm(f => ({ ...f, wilayah: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-900 text-slate-800 text-xs font-semibold">
                          {Object.entries(WILAYAH_MAP).map(([kode, nama]) => (
                            <option key={kode} value={kode}>{nama}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-600 font-semibold mb-1 text-xs">RT</label>
                        <input type="text" placeholder="RT 01" value={editForm.rt ?? ''} onChange={e => setEditForm(f => ({ ...f, rt: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-900 text-slate-800 text-sm" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-600 font-medium mb-1 text-xs">Nominal Tagihan (Rp)</label>
                      <input type="number" value={editForm.tagihan ?? 0} onChange={e => setEditForm(f => ({ ...f, tagihan: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-900 text-slate-800 text-sm" />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1 text-xs">Masa Tenggat (Tanggal Jatuh Tempo)</label>
                      <input type="date" value={editForm.tanggal_jatuh_tempo || ''} onChange={e => setEditForm(f => ({ ...f, tanggal_jatuh_tempo: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-900 text-slate-800 text-sm font-semibold" />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-medium mb-1 text-xs">Status Pembayaran</label>
                      <select value={editForm.status ?? 'Belum Lunas'} onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-900 text-slate-700 text-sm font-semibold">
                        <option value="Belum Lunas">Belum Lunas</option>
                        <option value="Lunas">Lunas</option>
                      </select>
                    </div>

                    {editForm.status === 'Lunas' && (
                      <div>
                        <label className="block text-slate-600 font-semibold mb-1 text-xs">Metode Pembayaran</label>
                        <select value={editForm.metode_pembayaran ?? 'Tunai / Kolektor'} onChange={e => setEditForm(f => ({ ...f, metode_pembayaran: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl bg-blue-50/70 border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-900 text-[#002b8c] text-sm font-bold">
                          <option value="Tunai / Kolektor">Tunai / Kolektor</option>
                          <option value="Transfer Bank">Transfer Bank</option>
                        </select>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button onClick={handleCloseModal} className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 text-sm">Batal</button>
                    <button onClick={handleSaveEditWarga} disabled={isSavingWarga} className="flex-1 py-2.5 rounded-xl bg-[#002b8c] text-white font-semibold hover:bg-blue-950 text-sm disabled:opacity-60 flex items-center justify-center">
                      {isSavingWarga ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ====== MODAL EDIT / TAMBAH SEKTOR WILAYAH ====== */}
            {modalMode === 'edit-sektor' && selectedSektor && (
              <div className={`modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 ${isClosingModal ? 'closing' : ''}`} onClick={handleCloseModal}>
                <div className="modal-panel bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-bold text-slate-800">{selectedSektor.isNew ? 'Tambah Sektor Wilayah Baru' : `Edit Sektor Wilayah ${sektorForm.kode_sektor}`}</h3>
                    <button onClick={handleCloseModal} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><X className="w-5 h-5" /></button>
                  </div>

                  <div className="space-y-4 text-sm">
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1 text-xs">Kode Sektor / Kode Blok</label>
                      <input 
                        type="text" 
                        placeholder="Contoh: EP, RW1, Sektor-A" 
                        value={sektorForm.kode_sektor || ''} 
                        onChange={e => setSektorForm(f => ({ ...f, kode_sektor: e.target.value.toUpperCase() }))} 
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-50 font-mono font-bold text-slate-800 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-900" 
                      />
                      <p className="text-[10px] text-slate-400 mt-1">*Kode unik sektor penandaan pada NOP & lembar SPPT.</p>
                    </div>

                    <div>
                      <label className="block text-slate-600 font-semibold mb-1 text-xs">Nama Sektor / Wilayah (RW / Dusun)</label>
                      <input 
                        type="text" 
                        placeholder="Contoh: RW 1 – Randu" 
                        value={sektorForm.nama_sektor || ''} 
                        onChange={e => setSektorForm(f => ({ ...f, nama_sektor: e.target.value }))} 
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-900 text-slate-800 text-sm font-bold" 
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-semibold mb-1 text-xs">Penanggung Jawab / Nama Kadus</label>
                      <input 
                        type="text" 
                        placeholder="Contoh: Bpk. Agus (Kadus RW 1)" 
                        value={sektorForm.penanggung_jawab || ''} 
                        onChange={e => setSektorForm(f => ({ ...f, penanggung_jawab: e.target.value }))} 
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-900 text-slate-800 text-sm font-semibold" 
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-semibold mb-1 text-xs">Warna Tema Indicator Bar</label>
                      <select 
                        value={sektorForm.warna_tema || 'bg-[#002b8c]'} 
                        onChange={e => setSektorForm(f => ({ ...f, warna_tema: e.target.value }))} 
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-900 text-slate-800 text-xs font-semibold"
                      >
                        <option value="bg-[#002b8c]">Biru Tua (Standard)</option>
                        <option value="bg-blue-600">Biru Muda</option>
                        <option value="bg-emerald-600">Hijau Emerald</option>
                        <option value="bg-purple-600">Ungu</option>
                        <option value="bg-amber-600">Oranye Amber</option>
                        <option value="bg-rose-600">Merah Rose</option>
                        <option value="bg-teal-600">Teal</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button onClick={handleCloseModal} className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 text-sm">Batal</button>
                    <button onClick={handleSaveEditSektor} disabled={isSaving} className="flex-1 py-2.5 rounded-xl bg-[#002b8c] text-white font-semibold hover:bg-blue-950 text-sm disabled:opacity-60 flex items-center justify-center">
                      {isSaving ? 'Menyimpan...' : 'Simpan Perubahan Sektor'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ====== MODAL HAPUS WARGA ====== */}
            {modalMode === 'delete' && selectedWarga && (
              <div className={`modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 ${isClosingModal ? 'closing' : ''}`} onClick={handleCloseModal}>
                <div className="modal-panel bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2 text-rose-600">
                      <Trash2 className="w-5 h-5" />
                      <h3 className="text-lg font-bold text-slate-800">Hapus Data Wajib Pajak</h3>
                    </div>
                    <button onClick={handleCloseModal} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><X className="w-5 h-5" /></button>
                  </div>
                  <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                    Apakah Anda yakin ingin menghapus data NOP <strong className="font-mono text-slate-800">{selectedWarga.nop}</strong> atas nama <strong>{selectedWarga.nama}</strong> untuk Periode Tahun Pajak <strong>{selectedWarga.tahun_pajak || filterTahun}</strong>?
                  </p>
                  <div className="flex gap-3">
                    <button onClick={handleCloseModal} className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 text-sm">Batal</button>
                    <button onClick={handleConfirmDelete} disabled={isLoading} className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white font-semibold hover:bg-rose-700 text-sm disabled:opacity-60">
                      {isLoading ? 'Hapus...' : 'Ya, Hapus Data'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ====== MODAL SALIN TAGIHAN ====== */}
            {isCopyModalOpen && (
              <div className={`modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 ${isClosingModal ? 'closing' : ''}`} onClick={() => setIsCopyModalOpen(false)}>
                <div className="modal-panel bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2 text-[#002b8c]">
                      <Copy className="w-5 h-5" />
                      <h3 className="text-lg font-bold text-slate-800">Salin Tagihan Belum Lunas</h3>
                    </div>
                    <button onClick={() => setIsCopyModalOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><X className="w-5 h-5" /></button>
                  </div>

                  <p className="text-xs text-slate-500 mb-5 leading-relaxed">
                    Pilih tahun asal dan tahun tujuan. Seluruh daftar wajib pajak yang belum lunas pada tahun asal akan otomatis didaftarkan ke tahun baru dengan status awal <strong>Belum Lunas</strong>.
                  </p>

                  <div className="space-y-4 text-sm">
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1 text-xs">Salin Dari Tahun Pajak</label>
                      <select value={copyFromYear} onChange={e => setCopyFromYear(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900">
                        {defaultYearsList.map(yr => (
                          <option key={yr} value={String(yr)}>Tahun Pajak {yr}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-600 font-semibold mb-1 text-xs">Ke Tahun Pajak Baru (Tujuan)</label>
                      <select value={copyToYear} onChange={e => setCopyToYear(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl bg-blue-50/60 border border-blue-200 font-bold text-[#002b8c] text-sm focus:outline-none focus:ring-2 focus:ring-blue-900">
                        {Array.from({ length: 12 }, (_, i) => currentYearNum + i).map(yr => (
                          <option key={yr} value={String(yr)}>Tahun Pajak {yr}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button onClick={() => setIsCopyModalOpen(false)} className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 text-sm">Batal</button>
                    <button onClick={handleExecuteCopyTunggakan} disabled={isLoading} className="flex-1 py-2.5 rounded-xl bg-[#002b8c] text-white font-semibold hover:bg-blue-950 text-sm disabled:opacity-60 flex items-center justify-center space-x-1">
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin mr-1" />
                          <span>Memproses...</span>
                        </>
                      ) : (
                        <span>Proses Salin Tagihan</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ====== MODAL CETAK SLIP PER RT / KK ====== */}
            {isPrintModalOpen && (
              <div className={`modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 ${isClosingModal ? 'closing' : ''}`} onClick={() => setIsPrintModalOpen(false)}>
                <div className="modal-panel bg-white rounded-2xl shadow-2xl w-full max-w-xl p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2 text-[#002b8c]">
                      <Printer className="w-5 h-5" />
                      <h3 className="text-lg font-bold text-slate-800">Cetak Slip Penagihan PBB Per RT</h3>
                    </div>
                    <button onClick={() => setIsPrintModalOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><X className="w-5 h-5" /></button>
                  </div>

                  <p className="text-xs text-slate-500 mb-5 leading-relaxed">
                    Pilih kriteria wilayah & RT yang ingin dicetak. Hasil cetakan berupa <strong>Slip Per Kepala Keluarga (KK)</strong> yang dikelompokkan per RT, siap digunting dan dibagikan ke rumah warga.
                  </p>

                  <div className="space-y-4 text-sm">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-600 font-semibold mb-1 text-xs">Pilih Wilayah / Dusun (RW)</label>
                        <select value={printFilterWilayah} onChange={e => { setPrintFilterWilayah(e.target.value); setPrintFilterRt('Semua RT'); }} className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900">
                          {WILAYAH_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-600 font-semibold mb-1 text-xs">Pilih RT</label>
                        <select value={printFilterRt} onChange={e => setPrintFilterRt(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900">
                          <option value="Semua RT">Semua RT</option>
                          {availableRts.map(rt => (
                            <option key={rt} value={rt}>{rt}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-600 font-semibold mb-1 text-xs">Status Pembayaran</label>
                        <select value={printFilterStatus} onChange={e => setPrintFilterStatus(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900">
                          <option value="Belum Lunas">Belum Lunas Saja (Rekomendasi)</option>
                          <option value="Lunas">Lunas Saja</option>
                          <option value="Semua Status">Semua Status</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-600 font-semibold mb-1 text-xs">Periode Tahun Pajak</label>
                        <select value={printFilterTahun} onChange={e => setPrintFilterTahun(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#002b8c] focus:outline-none focus:ring-2 focus:ring-blue-900">
                          <option value="Semua Tahun">Semua Tahun</option>
                          {defaultYearsList.map(yr => (
                            <option key={yr} value={String(yr)}>Tahun Pajak {yr}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Dynamic Summary Card */}
                    {(() => {
                      const groupedData = getPrintDataGrouped()
                      let countKK = 0
                      Object.values(groupedData).forEach(rts => {
                        Object.values(rts).forEach(kks => {
                          countKK += Object.keys(kks).length
                        })
                      })
                      return (
                        <div className="p-3.5 bg-amber-50/90 rounded-xl border border-amber-200/80 flex items-center justify-between text-xs text-amber-900 font-semibold">
                          <div className="flex items-center space-x-2">
                            <Printer className="w-4 h-4 text-amber-700" />
                            <span>Siap mencetak <strong>{countKK} Slip Penagihan (per KK)</strong></span>
                          </div>
                          <span className="font-bold bg-white px-2.5 py-1 rounded-md border border-amber-300 text-amber-800">{printFilterRt}</span>
                        </div>
                      )
                    })()}
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button onClick={() => setIsPrintModalOpen(false)} className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 text-sm">Batal</button>
                    <button onClick={() => window.print()} className="flex-1 py-2.5 rounded-xl bg-[#002b8c] hover:bg-blue-950 text-white font-semibold text-sm flex items-center justify-center space-x-2 shadow-sm">
                      <Printer className="w-4 h-4" />
                      <span>Cetak PDF / Print Sekarang</span>
                    </button>
                  </div>
                </div>
              </div>
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
                    <button onClick={() => {
                      const filteredLaporanWarga = dataWarga.filter(w => {
                        if (filterTahun !== 'Semua Tahun' && String(w.tahun_pajak) !== String(filterTahun)) return false
                        if (filterWilayah !== 'Semua Wilayah' && w.wilayah !== filterWilayah) return false
                        return true
                      })
                      exportDataWargaPerKK(filteredLaporanWarga, filterTahun)
                    }} className="flex items-center space-x-2 bg-[#002b8c] hover:bg-blue-950 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-sm transition-all">
                      <Download className="w-4 h-4" />
                      <span>Ekspor per KK (.xlsx)</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between"><span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Setoran Hari Ini</span><span className="text-xl font-extrabold text-slate-800 mt-2">Rp {(rekapKeuangan?.penerimaanHariIni || 0).toLocaleString('id-ID')}</span></div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between"><span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Bulan Ini</span><span className="text-xl font-extrabold text-blue-700 mt-2">Rp {(rekapKeuangan?.penerimaanBulanIni || 0).toLocaleString('id-ID')}</span></div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between"><span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Transaksi Sukses</span><span className="text-xl font-extrabold text-emerald-600 mt-2">{rekapKeuangan?.totalTransaksiSukses || 0} Berkas</span></div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-center"><span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Efektivitas LPP</span><span className="text-base font-extrabold text-slate-800">{rekapKeuangan?.efektivitasSistem || 0}%</span></div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full mt-4 overflow-hidden"><div className="bg-emerald-500 h-full rounded-full" style={{ width: `${rekapKeuangan?.efektivitasSistem || 0}%` }}></div></div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm flex flex-wrap gap-3">
                  <select value={filterTahun} onChange={(e) => setFilterTahun(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-[#002b8c]">
                    <option value="Semua Tahun">Semua Periode Tahun</option>
                    {defaultYearsList.map(yr => (
                      <option key={yr} value={String(yr)}>Tahun Pajak {yr}</option>
                    ))}
                  </select>
                  <select 
                    value={filterWilayah} 
                    onChange={(e) => setFilterWilayah(e.target.value)} 
                    disabled={currentUser?.role === 'kadus'}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 disabled:opacity-80"
                  >
                    {WILAYAH_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide shrink-0">Dari</span>
                    <input
                      type="date"
                      value={filterTanggalDari}
                      onChange={e => { setFilterTanggalDari(e.target.value); setCurrentLaporanPage(1) }}
                      className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide shrink-0">Sampai</span>
                    <input
                      type="date"
                      value={filterTanggalSampai}
                      onChange={e => { setFilterTanggalSampai(e.target.value); setCurrentLaporanPage(1) }}
                      className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
                    />
                  </div>
                  {(filterTanggalDari || filterTanggalSampai) && (
                    <button
                      onClick={() => { setFilterTanggalDari(''); setFilterTanggalSampai('') }}
                      className="text-[10px] font-bold text-slate-400 hover:text-red-500 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors shrink-0"
                    >
                      Reset Tanggal
                    </button>
                  )}
                  <select value={filterStatusLaporan} onChange={(e) => setFilterStatusLaporan(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-semibold text-slate-600">
                    <option value="Semua Status">Semua Status</option>
                    <option value="Lunas">Lunas</option>
                    <option value="Belum Lunas">Belum Lunas</option>
                  </select>
                </div>

                {/* Desktop View (Table) */}
                <div className="hidden md:block bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        <th className="px-6 py-4">ID</th>
                        <th className="px-6 py-4">Tanggal</th>
                        <th className="px-6 py-4">Nama WP</th>
                        <th className="px-6 py-4">Sektor</th>
                        <th className="px-6 py-4">Setoran</th>
                        <th className="px-6 py-4 text-center">Status</th>
                        <th className="px-6 py-4 text-center">Metode Pembayaran</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                      {paginatedLaporan.length > 0 ? (
                        paginatedLaporan.map((trx, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/40">
                            <td className="px-6 py-4 font-bold text-xs text-[#002b8c] font-mono">{trx.id_transaksi}</td>
                            <td className="px-6 py-4 text-xs text-slate-500 font-medium">{trx.tanggal}</td>
                            <td className="px-6 py-4 font-bold text-slate-800">{trx.nama_wp}</td>
                            <td className="px-6 py-4 text-xs font-bold text-slate-600">{trx.wilayah}</td>
                            <td className="px-6 py-4 font-extrabold text-emerald-700">+ Rp {trx.jumlah_bayar.toLocaleString('id-ID')}</td>
                            <td className="px-6 py-4 text-center">{renderStatusBadge(trx.status)}</td>
                            <td className="px-6 py-4 text-center">{renderMetodeBadge(trx.metode, trx.status)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan="7" className="text-center py-12 text-slate-400">Belum ada catatan penerimaan kas masuk.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View (Cards) */}
                <div className="md:hidden space-y-3">
                  {paginatedLaporan.length > 0 ? (
                    paginatedLaporan.map((trx, idx) => (
                      <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-[#002b8c] bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100 font-mono">{trx.id_transaksi}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400">{trx.tanggal}</span>
                            {renderStatusBadge(trx.status)}
                          </div>
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 text-base">{trx.nama_wp}</h3>
                          <p className="text-xs font-semibold text-slate-500 mt-0.5">{trx.wilayah}</p>
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Jumlah Setoran</span>
                            <span className="text-sm font-extrabold text-emerald-700">+ Rp {trx.jumlah_bayar.toLocaleString('id-ID')}</span>
                          </div>
                          {renderMetodeBadge(trx.metode, trx.status)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-white p-8 rounded-2xl border border-slate-200/60 shadow-sm text-center text-slate-400 text-sm">
                      Belum ada catatan penerimaan kas masuk.
                    </div>
                  )}
                </div>

                {/* Pagination Laporan */}
                {filteredLaporan.length > LAPORAN_PER_PAGE && (
                  <div className="flex items-center justify-between bg-white px-5 py-3 rounded-2xl border border-slate-200/60 shadow-sm">
                    <p className="text-xs text-slate-500">
                      Menampilkan <span className="font-semibold text-slate-700">{(currentLaporanPage - 1) * LAPORAN_PER_PAGE + 1}–{Math.min(currentLaporanPage * LAPORAN_PER_PAGE, filteredLaporan.length)}</span> dari <span className="font-semibold text-slate-700">{filteredLaporan.length}</span> transaksi
                    </p>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setCurrentLaporanPage(1)} disabled={currentLaporanPage === 1} className="px-2 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed">«</button>
                      <button onClick={() => setCurrentLaporanPage(p => Math.max(1, p - 1))} disabled={currentLaporanPage === 1} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"><ChevronLeft className="w-3 h-3" /> Prev</button>
                      {Array.from({ length: totalLaporanPages }, (_, i) => i + 1)
                        .filter(p => p === 1 || p === totalLaporanPages || Math.abs(p - currentLaporanPage) <= 1)
                        .reduce((acc, p, idx, arr) => {
                          if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...')
                          acc.push(p)
                          return acc
                        }, [])
                        .map((p, idx) =>
                          p === '...'
                            ? <span key={`ellipsis-${idx}`} className="px-2 text-slate-400 text-xs">…</span>
                            : <button key={p} onClick={() => setCurrentLaporanPage(p)} className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${currentLaporanPage === p ? 'bg-[#002b8c] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}>{p}</button>
                        )
                      }
                      <button onClick={() => setCurrentLaporanPage(p => Math.min(totalLaporanPages, p + 1))} disabled={currentLaporanPage === totalLaporanPages} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1">Next <ChevronRight className="w-3 h-3" /></button>
                      <button onClick={() => setCurrentLaporanPage(totalLaporanPages)} disabled={currentLaporanPage === totalLaporanPages} className="px-2 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed">»</button>
                    </div>
                  </div>
                )}
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
                  <button onClick={handleOpenAddSektor} className="flex items-center space-x-2 bg-[#002b8c] hover:bg-blue-950 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-sm self-start sm:self-auto transition-all"><Plus className="w-4 h-4" /><span>Tambah Sektor</span></button>
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
                          <div className="flex items-center gap-2">
                            <div className="text-right flex items-center gap-2 bg-white px-3 py-1.5 border border-slate-200/60 rounded-xl">
                              <UserCheck className="w-4 h-4 text-blue-600" /><span className="text-xs font-bold text-slate-700">{sektor.penanggung_jawab}</span>
                            </div>
                            <button onClick={() => handleOpenEditSektor(sektor)} className="p-2 bg-white hover:bg-amber-50 text-slate-400 hover:text-amber-700 rounded-xl border border-slate-200/60 transition-all shadow-xs" title="Edit Sektor Wilayah">
                              <Edit className="w-4 h-4" />
                            </button>
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
                  <h2 className="text-2xl font-bold text-slate-800">Pengaturan & Akun</h2>
                  <p className="text-xs text-slate-500 mt-1">Kelola profil akun dan keamanan kata sandi.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                  
                  {/* CARD 1: PROFIL AKUN AKTIF & GANTI SANDI */}
                  <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 space-y-5">
                    <div className="flex items-center gap-2 text-slate-800 font-bold border-b border-slate-100 pb-3">
                      <User className="w-5 h-5 text-[#002b8c]" />
                      <h3 className="text-sm uppercase tracking-wider">Profil Akun Saya</h3>
                    </div>

                    <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-100 space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-semibold">Nama Pegawai</span>
                        <strong className="text-slate-800 text-sm font-bold">{currentUser?.nama || 'Sekdes Randu'}</strong>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-semibold">Peran / Role</span>
                        <span className="font-bold text-[#002b8c] bg-white px-2.5 py-0.5 rounded-md border border-blue-200">
                          {currentUser?.role === 'sekdes' ? 'Sekretaris Desa (Admin)' : 'Koordinator Dusun (Kadus)'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-semibold">Wilayah Tugas</span>
                        <strong className="text-slate-800 font-bold">
                          {currentUser?.role === 'sekdes' ? 'Seluruh RW / Desa' : getNamaWilayah(currentUser?.wilayah)}
                        </strong>
                      </div>
                    </div>

                    {/* Form Ganti Kata Sandi */}
                    <form onSubmit={handleUpdatePassword} className="space-y-3 pt-2">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Ubah Kata Sandi Akun</h4>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Kata Sandi Baru</label>
                        <input
                          type="password"
                          placeholder="Masukkan sandi baru..."
                          value={formAkun.passwordBaru || ''}
                          onChange={(e) => setFormAkun({ ...formAkun, passwordBaru: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900 font-medium"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-[#002b8c] hover:bg-blue-950 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-sm transition-all"
                      >
                        Perbarui Kata Sandi
                      </button>
                    </form>
                  </div>

                </div>

                {/* CARD 3: DAFTAR AKUN TERDAFTAR DI SISTEM (USER MANAGEMENT) */}
                <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 space-y-4 mt-6">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2 text-slate-800 font-bold">
                      <Users className="w-5 h-5 text-purple-600" />
                      <h3 className="text-sm uppercase tracking-wider">Daftar Akun Terdaftar Di Sistem</h3>
                    </div>
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                      Total: {getAppUsers().length} Akun Terdaftar
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 font-bold text-slate-500 uppercase tracking-wider">
                          <th className="py-3 px-4">No</th>
                          <th className="py-3 px-4">Nama Lengkap</th>
                          <th className="py-3 px-4">Username</th>
                          <th className="py-3 px-4">Role / Jabatan</th>
                          <th className="py-3 px-4">Wilayah Tugas</th>
                          <th className="py-3 px-4 text-center">Status Akun</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                        {getAppUsers().map((u, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="py-2.5 px-4 font-bold text-slate-400">{idx + 1}</td>
                            <td className="py-2.5 px-4 font-bold text-slate-800">{u.nama_lengkap}</td>
                            <td className="py-2.5 px-4 font-mono font-bold text-[#002b8c]">{u.username}</td>
                            <td className="py-2.5 px-4">
                              <span className={`px-2.5 py-0.5 rounded-md font-bold text-[11px] ${u.role === 'sekdes' ? 'bg-amber-50 text-amber-900 border border-amber-200' : 'bg-blue-50 text-blue-900 border border-blue-200'}`}>
                                {u.role === 'sekdes' ? 'Sekretaris Desa' : 'Kadus'}
                              </span>
                            </td>
                            <td className="py-2.5 px-4 font-semibold text-slate-700">
                              {u.role === 'sekdes' ? 'Seluruh Desa' : getNamaWilayah(u.wilayah)}
                            </td>
                            <td className="py-2.5 px-4 text-center">
                              <span className="bg-emerald-50 text-emerald-700 font-bold text-[10px] px-2 py-0.5 rounded-full border border-emerald-200">
                                Aktif
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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

      {/* ========================================================= */}
      {/* E. AREA RENDER KHUSUS CETAK PDF / SLIP PENAGIHAN PER RT  */}
      {/* ========================================================= */}
      <div id="print-area">
        {(() => {
          const groupedPrintData = getPrintDataGrouped()
          const entriesRW = Object.entries(groupedPrintData)

          if (entriesRW.length === 0) {
            return (
              <div className="p-8 text-center">
                <h2 className="text-lg font-bold">Tidak ada data penagihan PBB untuk dicetak dengan filter yang dipilih.</h2>
              </div>
            )
          }

          let globalPageCounter = 0

          return entriesRW.map(([rwName, rtGroup]) =>
            Object.entries(rtGroup).map(([rtName, kkGroup]) => {
              const kkList = Object.values(kkGroup)
              if (kkList.length === 0) return null

              const isNewPage = globalPageCounter > 0
              globalPageCounter++

              return (
                <div key={`${rwName}-${rtName}`} className={`p-6 bg-white text-black font-sans ${isNewPage ? 'rt-page-break' : ''}`}>
                  
                  {/* Header Sampul Per RT */}
                  <div className="border-b-2 border-black pb-3 mb-6 flex justify-between items-end">
                    <div>
                      <h1 className="text-xl font-bold uppercase tracking-wider text-black">PEMERINTAH DESA RANDU</h1>
                      <p className="text-xs font-semibold text-slate-700">KECAMATAN TAMAN — KABUPATEN PEMALANG</p>
                      <p className="text-sm font-bold text-black mt-1">LEMBAR SLIP PENAGIHAN PBB-P2 PER KEPALA KELUARGA</p>
                    </div>
                    <div className="text-right">
                      <div className="border-2 border-black px-3 py-1 bg-slate-100 font-extrabold text-sm text-black">
                        {rwName} | {rtName}
                      </div>
                      <p className="text-[11px] text-slate-600 font-semibold mt-1">Jumlah: {kkList.length} Kepala Keluarga</p>
                    </div>
                  </div>

                  {/* List Slips KK */}
                  <div className="space-y-6">
                    {kkList.map((kk, kkIdx) => (
                      <div key={kkIdx} className="kk-slip-item border-2 border-black rounded-xl p-4 bg-white relative text-black shadow-sm">
                        
                        {/* Header Slip */}
                        <div className="flex justify-between items-center border-b border-black pb-2 mb-3">
                          <div className="flex items-center space-x-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-black"></span>
                            <h2 className="font-extrabold text-sm text-black uppercase tracking-wider">SLIP PENAGIHAN PBB DESA RANDU</h2>
                          </div>
                          <div className="flex items-center space-x-3 text-xs">
                            <span className="font-bold border border-black px-2 py-0.5 bg-slate-100">Tahun Pajak: {kk.tahun_pajak}</span>
                            <span className="font-bold text-black border border-black px-2 py-0.5 bg-amber-50">Jatuh Tempo: {formatIndoDate(kk.tanggal_jatuh_tempo)}</span>
                          </div>
                        </div>

                        {/* Sub Header Warga */}
                        <div className="grid grid-cols-2 gap-4 text-xs mb-3 bg-slate-50 p-2.5 rounded-lg border border-slate-300">
                          <div>
                            <span className="text-slate-500 block text-[10px] uppercase font-semibold">Nama Kepala Keluarga</span>
                            <strong className="text-sm font-bold text-black uppercase">{kk.nama_kepala_keluarga}</strong>
                            {kk.nama_anggota_raw && <span className="block text-[11px] text-slate-600 font-medium">({kk.nama_anggota_raw})</span>}
                          </div>
                          <div className="text-right">
                            <span className="text-slate-500 block text-[10px] uppercase font-semibold">Lokasi Penagihan</span>
                            <strong className="text-xs font-bold text-black">{kk.wilayah} ({kk.rt})</strong>
                          </div>
                        </div>

                        {/* Table Bidang Tanah (NOP) */}
                        <table className="w-full text-left text-xs border-collapse mb-3">
                          <thead>
                            <tr className="border-b border-t border-black bg-slate-100 font-bold">
                              <th className="py-1.5 px-2">No</th>
                              <th className="py-1.5 px-2">Nomor Objek Pajak (NOP)</th>
                              <th className="py-1.5 px-2">Nama Wajib Pajak (SPPT)</th>
                              <th className="py-1.5 px-2 text-right">Nominal Tagihan</th>
                              <th className="py-1.5 px-2 text-center">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {kk.items.map((item, itemIdx) => (
                              <tr key={itemIdx}>
                                <td className="py-1 px-2 font-semibold">{itemIdx + 1}</td>
                                <td className="py-1 px-2 font-mono font-bold text-black">{item.nop}</td>
                                <td className="py-1 px-2 font-medium">{item.nama}</td>
                                <td className="py-1 px-2 text-right font-bold">Rp {Number(item.tagihan).toLocaleString('id-ID')}</td>
                                <td className="py-1 px-2 text-center font-bold">{item.status}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>

                        {/* Total & Tanda Terima */}
                        <div className="flex justify-between items-end pt-3 border-t-2 border-black">
                          <div className="space-y-1">
                            <p className="text-[10px] text-slate-600 italic">Harap melakukan pembayaran kepada Petugas Penagih PBB Desa Randu sebelum tanggal jatuh tempo ({formatIndoDate(kk.tanggal_jatuh_tempo)}).</p>
                            <div className="flex gap-12 text-[10px] text-slate-800 pt-3">
                              <div>
                                <span>Tanda Terima Warga / Wajib Pajak:</span>
                                <div className="border-b border-dashed border-black w-40 mt-8"></div>
                              </div>
                              <div>
                                <span>Petugas Penagih PBB Desa:</span>
                                <div className="border-b border-dashed border-black w-40 mt-8"></div>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Tagihan PBB Keluarga</span>
                            <span className="text-xl font-extrabold text-black">Rp {kk.total_tagihan.toLocaleString('id-ID')}</span>
                          </div>
                        </div>

                        {/* Dotted Cut Line */}
                        <div className="text-center mt-5 text-[11px] font-mono text-slate-400 border-t-2 border-dashed border-slate-400 pt-2">
                          - - - - - - - - - - GUNTING DI SINI (BATAS POTONG SLIP PER KEPALA KELUARGA) - - - - - - - - - -
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              )
            })
          )
        })()}
      </div>

    </div>
  )
}

/* ==========================================================================
   3. ENTRY POINT SWITCHER
   ========================================================================== */
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('pbb_logged_in') === 'true')
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('pbb_active_tab') || 'dashboard')
  const [currentUser, setCurrentUser] = useState(() => {
    const role = localStorage.getItem('pbb_user_role') || 'sekdes'
    const wilayah = localStorage.getItem('pbb_user_wilayah') || 'Semua Wilayah'
    const nama = localStorage.getItem('pbb_user_nama') || 'Sekretaris Desa'
    return { role, wilayah, nama }
  })

  const handleLoginSuccess = (userData) => {
    localStorage.setItem('pbb_logged_in', 'true')
    localStorage.setItem('pbb_user_role', userData.role)
    localStorage.setItem('pbb_user_wilayah', userData.wilayah)
    localStorage.setItem('pbb_user_nama', userData.nama)
    setCurrentUser(userData)
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('pbb_logged_in')
    localStorage.removeItem('pbb_active_tab')
    localStorage.removeItem('pbb_user_role')
    localStorage.removeItem('pbb_user_wilayah')
    localStorage.removeItem('pbb_user_nama')
    setIsLoggedIn(false)
    setActiveTab('dashboard')
  }

  return (
    <>
      {isLoggedIn ? (
        <MainAppComponent 
          currentUser={currentUser}
          activeTab={activeTab} 
          onNavigate={(tabName) => {
            localStorage.setItem('pbb_active_tab', tabName)
            setActiveTab(tabName)
          }} 
          onLogout={handleLogout} 
        />
      ) : (
        <LoginComponent onLoginSuccess={handleLoginSuccess} />
      )}
    </>
  )
}

export default App