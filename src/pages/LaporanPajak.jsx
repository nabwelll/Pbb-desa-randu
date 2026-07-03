import React, { useState, useEffect } from 'react'
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Map, 
  Settings, 
  Download, 
  RefreshCw,
  Calendar,
  Printer,
  ArrowUpRight,
  Filter,
  CheckCircle2
} from 'lucide-react'

// ==========================================================================
// 🛠️ TEMPAT MENARUH LINK BACKEND LAPORAN (Ganti di sini jika Backend sudah siap)
// ==========================================================================
const API_LINK_LAPORAN = 'https://GANTI_DENGAN_LINK_BACKEND_KAMU/api/pbb/laporan';

function LaporanPajak() {
  const [isLoading, setIsLoading] = useState(true)
  
  // State Filter Laporan
  const [filterBulan, setFilterBulan] = useState('Semua Bulan')
  const [filterWilayah, setFilterWilayah] = useState('Semua Wilayah')
  const [filterMetode, setFilterMetode] = useState('Semua Metode')

  // 🛠️ STERIL: State ringkasan keuangan harian/bulanan mulai dari angka 0
  const [rekapKeuangan, setRekapKeuangan] = useState({
    penerimaanHariIni: 0,
    penerimaanBulanIni: 0,
    totalTransaksiSukses: 0,
    efektivitasSistem: 0
  })

  // 🛠️ STERIL: State daftar riwayat transaksi masuk kosong [], murni menunggu database
  const [logTransaksi, setLogTransaksi] = useState([])

  // Fungsi Sinkronisasi Mengambil Catatan Laporan dari Database Backend
  useEffect(() => {
    setIsLoading(true)
    fetch(API_LINK_LAPORAN)
      .then(res => res.json())
      .then(dataAsli => {
        if (dataAsli) {
          setRekapKeuangan({
            penerimaanHariIni: dataAsli.penerimaan_hari_ini || 0,
            penerimaanBulanIni: dataAsli.penerimaan_bulan_ini || 0,
            totalTransaksiSukses: dataAsli.total_transaksi || 0,
            efektivitasSistem: dataAsli.efektivitas_persen || 0
          })
          setLogTransaksi(dataAsli.daftar_transaksi || [])
        }
        setIsLoading(false)
      })
      .catch(error => {
        console.error("Gagal mengambil lembar laporan pajak dari database:", error)
        setIsLoading(false)
      })
  }, [])

  // Logika Penyaringan Filter Otomatis di Sisi Frontend
  const filteredLaporan = logTransaksi.filter(transaksi => {
    const cocokWilayah = filterWilayah === 'Semua Wilayah' || transaksi.wilayah === filterWilayah
    const cocokMetode = filterMetode === 'Semua Metode' || transaksi.metode === filterMetode
    return cocokWilayah && cocokMetode
  })

  return (
    <div className="min-h-screen bg-[#f8fafc] flex text-slate-800 antialiased">
      
      {/* ========================================================= */}
      {/* 1. SIDEBAR DESKTOP VIEW (Sesuai Cetakan Acuan Utama Anda) */}
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
          
          {/* Profil Admin Rata Kiri Bersih */}
          <div className="p-5 border-b border-slate-700/50 bg-slate-800/30">
            <h4 className="font-bold text-sm text-slate-100">Sekdes Randu</h4>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Administrator</p>
          </div>

          {/* Menu Navigasi (Sorot Aktif di Laporan Pajak) */}
          <nav className="p-3 space-y-1 mt-2">
            <a href="#" className="flex items-center space-x-3 text-slate-400 hover:bg-slate-800/60 hover:text-white px-4 py-3 rounded-xl font-medium text-sm transition-all">
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </a>
            <a href="#" className="flex items-center space-x-3 text-slate-400 hover:bg-slate-800/60 hover:text-white px-4 py-3 rounded-xl font-medium text-sm transition-all">
              <Users className="w-4 h-4" />
              <span>Data Warga</span>
            </a>
            <a href="#" className="flex items-center space-x-3 bg-slate-700/50 text-white px-4 py-3 rounded-xl font-semibold text-sm transition-all shadow-sm">
              <FileText className="w-4 h-4 text-blue-400" />
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

        {/* Sidebar Bottom Component */}
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
      {/* 2. MAIN CONTENT AREA (Penerimaan Lapang Desktop) */}
      {/* ========================================================= */}
      <main className="flex-1 p-8 space-y-6 overflow-y-auto">
        
        {/* Row Header Menu Atas */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Laporan Penerimaan Pajak</h2>
            <p className="text-xs text-slate-400 mt-1">Pantau arus kas masuk, efisiensi setoran wajib pajak, dan cetak dokumen Buku LPP resmi.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center space-x-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold py-3 px-4 rounded-xl shadow-sm transition-all">
              <Printer className="w-4 h-4" />
              <span>Cetak Buku LPP</span>
            </button>
            <button className="flex items-center space-x-2 bg-[#002b8c] hover:bg-blue-950 text-white text-xs font-bold py-3 px-4 rounded-xl shadow-sm transition-all">
              <Download className="w-4 h-4" />
              <span>Ekspor laporan (.XLS)</span>
            </button>
          </div>
        </div>

        {/* Efek Tunggu Sinc Database */}
        {isLoading ? (
          <div className="flex items-center justify-center p-20 text-slate-400 gap-2 font-medium text-sm">
            <RefreshCw className="w-4 h-4 animate-spin text-[#002b8c]" />
            <span>Sinkronisasi jurnal kas masuk wajib pajak...</span>
          </div>
        ) : (
          <>
            {/* ROW STATISTIK RINGKASAN DATA REAL-TIME */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Setoran Hari Ini</span>
                <span className="text-xl font-extrabold text-slate-800 mt-2">
                  Rp {rekapKeuangan.penerimaanHariIni.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Bulan Ini</span>
                <span className="text-xl font-extrabold text-blue-700 mt-2">
                  Rp {rekapKeuangan.penerimaanBulanIni.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Transaksi Sukses</span>
                <span className="text-xl font-extrabold text-emerald-600 mt-2">
                  {rekapKeuangan.totalTransaksiSukses} Berkas
                </span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Efektivitas LPP</span>
                  <span className="text-base font-extrabold text-slate-800">{rekapKeuangan.efektivitasSistem}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full mt-4 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${rekapKeuangan.efektivitasSistem}%` }}></div>
                </div>
              </div>
            </div>

            {/* BAR KONTROL FILTER STRUKTUR */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-4">
              <div className="flex items-center gap-2 text-slate-400 text-sm font-bold pr-2 border-r border-slate-200">
                <Filter className="w-4 h-4 text-[#002b8c]" />
                <span className="text-xs text-slate-500 uppercase tracking-wider">Filter Data:</span>
              </div>

              {/* Urut Bulan */}
              <select value={filterBulan} onChange={(e) => setFilterBulan(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 focus:outline-none">
                <option>Semua Bulan</option>
                <option>Januari</option><option>Februari</option><option>Maret</option>
                <option>April</option><option>Mei</option><option>Juni</option>
              </select>

              {/* Urut Sektor Kadus */}
              <select value={filterWilayah} onChange={(e) => setFilterWilayah(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 focus:outline-none">
                <option>Semua Wilayah</option>
                <option>Kadus 1</option><option>Kadus 2</option>
                <option>Kadus 3</option><option>Kadus 4</option>
              </select>

              {/* Urut Jalur Bayar */}
              <select value={filterMetode} onChange={(e) => setFilterMetode(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 focus:outline-none">
                <option>Semua Metode</option>
                <option>Tunai / Kolektor</option>
                <option>QRIS / BRImo</option>
                <option>Transfer Bank</option>
              </select>
            </div>

            {/* TABEL JURNAL PENERIMAAN KAS MASUK (CLEAN DESIGN) */}
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <th className="px-6 py-4">ID Transaksi</th>
                      <th className="px-6 py-4">Tanggal Setor</th>
                      <th className="px-6 py-4">Nomor Objek Pajak (NOP)</th>
                      <th className="px-6 py-4">Nama Wajib Pajak</th>
                      <th className="px-6 py-4">Sektor</th>
                      <th className="px-6 py-4">Nominal Setoran</th>
                      <th className="px-6 py-4 text-center">Metode</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                    {filteredLaporan.length > 0 ? (
                      filteredLaporan.map((trx, index) => (
                        <tr key={index} className="hover:bg-slate-50/40 transition-colors">
                          <td className="px-6 py-4 font-bold text-xs text-[#002b8c] tracking-wide">{trx.id_transaksi}</td>
                          <td className="px-6 py-4 text-xs text-slate-400">{trx.tanggal}</td>
                          <td className="px-6 py-4 font-mono text-xs text-slate-500 font-semibold">{trx.nop}</td>
                          <td className="px-6 py-4 font-bold text-slate-800">{trx.nama_wp}</td>
                          <td className="px-6 py-4 text-xs font-bold text-slate-600">{trx.wilayah}</td>
                          <td className="px-6 py-4 font-extrabold text-emerald-600">
                            + Rp {trx.jumlah_bayar.toLocaleString('id-ID')}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center">
                              <span className="inline-flex items-center gap-1 bg-slate-50 text-slate-600 px-2.5 py-1 rounded-lg text-xs font-bold border border-slate-100">
                                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                {trx.metode}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center py-16 text-sm text-slate-400 font-medium">
                          Belum ada catatan penerimaan kas wajib pajak masuk di database.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Global Footer Credit Proyek KKN */}
        <footer className="text-center text-xs text-slate-400 mt-6 pt-4 border-t border-slate-200/60">
          <p>© 2026 Pemerintah Desa Randu. | Didesain oleh KKNT 128 Undip 2026</p>
        </footer>

      </main>
    </div>
  )
}

export default LaporanPajak