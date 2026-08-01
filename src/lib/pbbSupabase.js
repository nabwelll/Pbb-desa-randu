import { supabase } from '../supabaseClient'
import * as xlsx from 'xlsx'

const toNumber = (value) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const toDateText = (value) => {
  if (!value) return ''
  if (typeof value === 'string') return value
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? String(value) : date.toISOString().slice(0, 10)
}

const normalizeStatus = (value) => {
  if (!value) return 'Belum Lunas'
  const text = String(value).toLowerCase()
  if (text.includes('lunas')) return 'Lunas'
  if (text.includes('bayar') || text.includes('sukses')) return 'Lunas'
  return 'Belum Lunas'
}

const CURRENT_YEAR = new Date().getFullYear()

const getNamaWp = (row) => row.nama_wp ?? row.wajib_pajak?.nama_wp ?? ''
const getKodeBlok = (row) => row.kode_blok ?? row.wajib_pajak?.kode_blok ?? ''
const getAlamatWp = (row) => row.alamat_wp ?? row.wajib_pajak?.alamat_wp ?? ''
const getLetakOp = (row) => row.letak_op ?? row.wajib_pajak?.letak_op ?? ''
const getRt = (row) => row.rt ?? ''

const getJatuhTempo = (row) => {
  if (row.tanggal_jatuh_tempo) return toDateText(row.tanggal_jatuh_tempo)
  const yr = row.tahun_pajak ? Number(row.tahun_pajak) : CURRENT_YEAR
  return `${yr}-09-30`
}

const normalizeWargaRow = (row) => ({
  id: row.id_tagihan ?? row.id,
  keluarga_id: row.keluarga_id ?? '',
  nop: row.nop ?? '',
  nama: getNamaWp(row),
  nama_kepala_keluarga: row.nama_kepala_keluarga || getNamaWp(row),
  nama_anggota_raw: row.nama_anggota_raw ?? '',
  wilayah: getKodeBlok(row),
  rt: getRt(row),
  tagihan: toNumber(row.nominal_tagihan),
  status: row.status_lunas ? 'Lunas' : 'Belum Lunas',
  metode_pembayaran: row.dibayarkan_oleh || (row.status_lunas ? 'Tunai / Kolektor' : 'Belum Bayar'),
  tahun_pajak: row.tahun_pajak ? Number(row.tahun_pajak) : CURRENT_YEAR,
  tanggal_bayar: row.tanggal_bayar ? toDateText(row.tanggal_bayar) : null,
  tanggal_jatuh_tempo: getJatuhTempo(row),
})

const normalizeLaporanRow = (row) => ({
  id_transaksi: row.id_tagihan ?? row.id ?? row.nop ?? '',
  tanggal: toDateText(row.tanggal_bayar) || '-',
  nop: row.nop ?? '',
  nama_wp: getNamaWp(row),
  wilayah: getNamaWilayah(getKodeBlok(row)),
  kode_blok: (getKodeBlok(row) || '').toLowerCase(),
  jumlah_bayar: toNumber(row.nominal_tagihan),
  status: row.status_lunas ? 'Lunas' : 'Belum Lunas',
  metode: (row.dibayarkan_oleh && row.dibayarkan_oleh.trim())
    ? row.dibayarkan_oleh.trim()
    : (row.status_lunas ? 'Tunai / Kolektor' : 'Belum Bayar'),
  tahun_pajak: row.tahun_pajak ? Number(row.tahun_pajak) : CURRENT_YEAR,
})

const normalizeSektorRow = (row, summary = {}) => ({
  kode_sektor: getKodeBlok(row),
  nama_sektor: row.nama_wilayah ?? getKodeBlok(row),
  penanggung_jawab: row.nama_kadus ?? getKodeBlok(row),
  total_wp: toNumber(summary.total_wp),
  target_nominal: toNumber(summary.target_nominal),
  terrealisasi_nominal: toNumber(summary.terrealisasi_nominal),
  persentase_progres: toNumber(summary.persentase_progres),
  warna_tema: 'bg-[#002b8c]',
})

const normalizeSettingsRow = (row) => ({
  namaDesa: row.nama_desa ?? row.namaDesa ?? '',
  kecamatan: row.kecamatan ?? '',
  kabupaten: row.kabupaten ?? '',
  tahunAnggaran: row.tahun_anggaran ?? row.tahunAnggaran ?? '',
  targetNominalDesa: toNumber(row.target_nominal ?? row.targetNominalDesa),
})

const fetchTagihanRows = async () => {
  const PAGE_SIZE = 1000
  let allRows = []
  let from = 0
  let hasMore = true

  while (hasMore) {
    const { data, error } = await supabase
      .from('vw_tagihan_pbb_detail')
      .select('*')
      .range(from, from + PAGE_SIZE - 1)

    if (error) throw error

    const rows = data ?? []
    allRows = allRows.concat(rows)

    if (rows.length < PAGE_SIZE) {
      hasMore = false
    } else {
      from += PAGE_SIZE
    }
  }

  if (allRows.length === 0) {
    console.warn('Supabase returned no rows for vw_tagihan_pbb_detail. Check RLS/select policies for anon/authenticated access.')
  }

  // Filter out any invalid/fake NOP tagihan rows (digits < 15 or digits > 18)
  const validRows = allRows.filter(row => {
    const digits = String(row.nop || '').replace(/\D/g, '')
    return digits.length >= 15 && digits.length <= 18
  })

  return validRows
}

const splitNamaAnggota = (nama) => {
  if (!nama) return []

  return String(nama)
    .split(/\s*&\s*|\s*,\s*|\s+dan\s+/i)
    .map((item) => item.trim())
    .filter(Boolean)
}

const parseNominal = (value) => {
  if (typeof value === 'number') return Math.round(value)
  const str = String(value ?? '').trim()
  if (!str) return 0

  let cleaned = str.replace(/[^\d.,]/g, '')
  if (cleaned.includes(',')) {
    cleaned = cleaned.replace(/\./g, '').replace(',', '.')
  } else {
    cleaned = cleaned.replace(/\./g, '')
  }

  const parsed = Number(cleaned)
  return Number.isFinite(parsed) ? Math.round(parsed) : 0
}

const KODE_BLOK_VALID = ['aw', 'ep', 'ir', 'fk', 'b', 'e', 'a', 'z', 'r']

const SEKTOR_ALIASES = {
  z: ['z', 'rajegan 1', 'rajegan1', 'rajegan_1', 'rw 6', 'rw6', 'rw_6', 'rw-6', 'rw.6', 'rw 06', 'rw06'],
  r: ['r', 'rajegan 2', 'rajegan2', 'rajegan_2', 'rw 7', 'rw7', 'rw_7', 'rw-7', 'rw.7', 'rw 07', 'rw07'],
  aw: ['aw', 'gondangsari', 'gondang', 'rw 5', 'rw5', 'rw_5', 'rw-5', 'rw.5', 'rw 05', 'rw05'],
  ir: ['ir', 'manggeran', 'rw 4', 'rw4', 'rw_4', 'rw-4', 'rw.4', 'rw 04', 'rw04'],
  e: ['e', 'randu tengah', 'tengah', 'rw 3', 'rw3', 'rw_3', 'rw-3', 'rw.3', 'rw 03', 'rw03'],
  b: ['b', 'bandon', 'rw 2', 'rw2', 'rw_2', 'rw-2', 'rw.2', 'rw 02', 'rw02'],
  ep: ['ep', 'randu krajan', 'krajan', 'randu', 'rw 1', 'rw1', 'rw_1', 'rw-1', 'rw.1', 'rw 01', 'rw01'],
  a: ['a', 'luar randu', 'luar'],
  fk: ['fk', 'tidak diketahui', 'belum diketahui'],
}

const detectWorkbookContext = (sheetName, fileName = '') => {
  const normalizedSheet = String(sheetName ?? '').toLowerCase().trim()
  const normalizedFile = String(fileName ?? '').toLowerCase().trim()
  const combined = `${normalizedSheet} ${normalizedFile}`

  for (const [kode, aliases] of Object.entries(SEKTOR_ALIASES)) {
    for (const alias of aliases) {
      const regex = new RegExp(`(?:^|[^a-z0-9])${alias}(?:$|[^a-z0-9])`, 'i')
      if (regex.test(combined)) return kode
    }
  }

  return 'z'
}

const detectExcelFormat = (rows) => {
  // Cek flat list: baris dengan (nomor urut | NOP | nama | nominal)
  const dataRows = rows.filter(r => r && (typeof r[0] === 'number' && r[0] > 0))
  if (dataRows.length >= 2) {
    const sample = dataRows[0]
    const col1 = String(sample[1] ?? '').replace(/\D/g, '')
    if (col1.length >= 15 && typeof sample[3] === 'number') {
      return 'flatlist'
    }
  }
  for (let i = 0; i < Math.min(10, rows.length); i++) {
    const headerStr = (rows[i] ?? []).map(h => String(h).toLowerCase()).join('|')
    if (headerStr.includes('nominal') || headerStr.includes('keterangan') || headerStr.includes('rekonsiliasi')) {
      return 'rekonsiliasi'
    }
  }
  const hasRtRow = rows.some(r => /^RT[\s.]*\d/i.test(String(r[0] ?? '')) || /^RT[\s.]*\d/i.test(String(r[1] ?? '')))
  if (hasRtRow) return 'dph'
  const hasNopDetail = rows.some(r => !r[0] && String(r[1] ?? '').replace(/\D/g, '').length >= 15)
  return hasNopDetail ? 'rekonsiliasi' : 'dph'
}

// Parser untuk format flat list: nomor | NOP | nama | nominal | (kode blok opsional)
const parseFlatListRows = (rows) => {
  const result = []
  for (const row of rows) {
    if (!row || typeof row[0] !== 'number' || row[0] <= 0) continue
    const nopRaw = String(row[1] ?? '').trim()
    const namaWp = String(row[2] ?? '').trim()
    const nominal = typeof row[3] === 'number' ? row[3] : 0
    const cleanDigits = nopRaw.replace(/\D/g, '')
    if (cleanDigits.length < 15 || !namaWp) continue
    result.push({
      nop: nopRaw.replace(/[^\d.-]/g, ''),
      namaWp,
      kepalaKeluarga: namaWp,
      rt: '',
      nominal,
    })
  }
  return result
}

const parseRekonsiliasiRows = (rows) => {
  const result = []
  let currentKK = null
  let currentRt = ''

  let nominalColIndex = 3
  for (let rIdx = 0; rIdx < Math.min(10, rows.length); rIdx++) {
    const rowStr = (rows[rIdx] ?? []).map(h => String(h).toLowerCase())
    const hasHeaderKey = rowStr.some(h => h.includes('nop') || h.includes('sppt') || h.includes('wajib') || h.includes('nama'))
    if (hasHeaderKey) {
      for (let i = 0; i < rowStr.length; i++) {
        if (rowStr[i].includes('nominal') || rowStr[i].includes('tagihan') || rowStr[i].includes('pbb') || rowStr[i].includes('pokok')) {
          nominalColIndex = i
          break
        }
      }
      break
    }
  }

  for (const row of rows) {
    const col0 = row[0]
    const col0Str = String(col0 ?? '').trim()
    const col1 = String(row[1] ?? '').trim()
    const col2 = String(row[2] ?? '').trim()
    const nominalVal = row[nominalColIndex]

    // Hanya cek keyword header di kolom utama (0-2), bukan kolom keterangan (3+)
    const rowStrHeader = [row[0], row[1], row[2]].map(c => String(c ?? '')).join(' ').toUpperCase()

    if (
      !col1 ||
      rowStrHeader.includes('JUMLAH') ||
      rowStrHeader.includes('TOTAL') ||
      rowStrHeader.includes('SUBTOTAL') ||
      rowStrHeader.includes('REKAP') ||
      rowStrHeader.includes('NO SPPT') ||
      rowStrHeader.includes('NOMINAL')
    ) {
      continue
    }

    if (/^RT[\s.]*\d+/i.test(col0Str) || /^RT[\s.]*\d+/i.test(col1)) {
      currentRt = (col0Str || col1).replace(/RT[\s.]*/i, 'RT ').trim()
      continue
    }

    const isNumCol0 = (typeof col0 === 'number' && col0 > 0) || (/^\d+$/.test(col0Str) && Number(col0Str) > 0)
    const cleanDigits = col1.replace(/\D/g, '')

    if (isNumCol0 && (!col2 || cleanDigits.length < 15)) {
      currentKK = col1
      continue
    }

    if (cleanDigits.length >= 15 && cleanDigits.length <= 18 && col2) {
      result.push({
        kepalaKeluarga: currentKK ?? col2,
        nop: col1.replace(/[^\d.-]/g, ''),
        namaWp: col2,
        nominal: parseNominal(nominalVal),
        rt: currentRt,
      })
    }
  }
  return result
}

export async function importExcelSppt(file, { tahunPajak = CURRENT_YEAR, overrideKodeBlok = null } = {}) {
  const buffer = await file.arrayBuffer()
  const workbook = xlsx.read(buffer, { type: 'array', cellDates: true })

  const insertedFamilies = []
  const insertedRows = []

  for (const sheetName of workbook.SheetNames) {
    if (sheetName.toLowerCase().includes('rekap') || sheetName.toLowerCase().includes('summary')) {
      if (workbook.SheetNames.length > 1) continue
    }

    const sheet = workbook.Sheets[sheetName]
    if (!sheet) continue
    const rows = xlsx.utils.sheet_to_json(sheet, { header: 1, raw: true, defval: '' })
    if (!rows || rows.length === 0) continue

    const kodeBlokDefault = (overrideKodeBlok && overrideKodeBlok !== 'auto')
      ? overrideKodeBlok.toLowerCase().trim()
      : detectWorkbookContext(sheetName, file.name)

    const wilayahPayload = {
      kode_blok: kodeBlokDefault,
      nama_wilayah: getNamaWilayah(kodeBlokDefault),
      warna_tema: 'bg-[#002b8c]',
    }
    await supabase.from('wilayah_penagihan').upsert(wilayahPayload, { onConflict: 'kode_blok' })

    try {
      const targetKode = kodeBlokDefault.toLowerCase().trim()
      const { data: detailRows } = await supabase
        .from('vw_tagihan_pbb_detail')
        .select('id_tagihan, status_lunas')
        .eq('tahun_pajak', tahunPajak)
        .or(`kode_blok.eq.${targetKode},kode_blok.eq.${targetKode.toUpperCase()}`)

      if (detailRows && detailRows.length > 0) {
        const unPaidIds = detailRows.filter(r => !r.status_lunas).map(r => r.id_tagihan).filter(Boolean)
        const CHUNK_SIZE = 30
        for (let i = 0; i < unPaidIds.length; i += CHUNK_SIZE) {
          const chunk = unPaidIds.slice(i, i + CHUNK_SIZE)
          await supabase
            .from('tagihan_pbb')
            .delete()
            .in('id', chunk)
        }
      }
    } catch (cleanErr) {
      console.warn('Gagal bersihkan tagihan lama sektor:', cleanErr)
    }

    const format = detectExcelFormat(rows)

    if (format === 'flatlist') {
      const parsedItems = parseFlatListRows(rows)
      const tagihanMap = new Map()

      for (const item of parsedItems) {
        // Cari atau buat KK berdasarkan nama
        let familyId = null
        const { data: existingKK } = await supabase
          .from('keluarga_pbb')
          .select('id')
          .ilike('nama_kepala_keluarga', item.kepalaKeluarga)
          .eq('kode_blok', kodeBlokDefault)
          .limit(1)
          .maybeSingle()

        if (existingKK) {
          familyId = existingKK.id
        } else {
          const { data: newKK } = await supabase
            .from('keluarga_pbb')
            .insert({
              nama_kepala_keluarga: item.kepalaKeluarga,
              nama_anggota_raw: item.kepalaKeluarga,
              rt: '',
              kode_blok: kodeBlokDefault,
              status_aktif: true,
              catatan: `Diimpor dari ${file.name}`,
            })
            .select('id')
            .single()
          if (newKK) familyId = newKK.id
        }

        if (!familyId) continue

        const payload = {
          keluarga_id: familyId,
          nop: item.nop,
          nama_wp: item.namaWp,
          tahun_pajak: tahunPajak,
          nominal_tagihan: item.nominal,
          denda: 0,
          status_lunas: false,
          tertagih_ke: item.kepalaKeluarga,
          dibayarkan_oleh: '',
          tanggal_jatuh_tempo: `${tahunPajak}-09-30`,
        }

        if (!tagihanMap.has(item.nop)) tagihanMap.set(item.nop, payload)
      }

      const tagihanPayloads = Array.from(tagihanMap.values())
      const BATCH_SIZE = 100
      for (let i = 0; i < tagihanPayloads.length; i += BATCH_SIZE) {
        const batch = tagihanPayloads.slice(i, i + BATCH_SIZE)
        const { error: tagErr } = await supabase
          .from('tagihan_pbb')
          .upsert(batch, { onConflict: 'nop,tahun_pajak' })
        if (!tagErr) insertedRows.push(...batch)
        else {
          for (const t of batch) {
            const { error: e } = await supabase.from('tagihan_pbb').upsert(t, { onConflict: 'nop,tahun_pajak' })
            if (!e) insertedRows.push(t)
          }
        }
      }
    } else if (format === 'rekonsiliasi') {
      const parsedItems = parseRekonsiliasiRows(rows)

      const familyMap = new Map()
      for (const item of parsedItems) {
        const key = `${kodeBlokDefault}|${item.rt || ''}|${item.kepalaKeluarga}`
        if (!familyMap.has(key)) {
          familyMap.set(key, {
            nama_kepala_keluarga: item.kepalaKeluarga,
            nama_anggota_raw: item.kepalaKeluarga,
            alamat_wp: '',
            rt: item.rt || '',
            letak_op: '',
            kode_blok: kodeBlokDefault,
            status_aktif: true,
            catatan: `Diimpor dari ${file.name} (${sheetName})`,
          })
        }
      }

      const familyArray = Array.from(familyMap.values())
      const familyIdMap = new Map()
      const BATCH_SIZE = 100

      for (let i = 0; i < familyArray.length; i += BATCH_SIZE) {
        const batch = familyArray.slice(i, i + BATCH_SIZE)
        const { data: insertedFam, error: famErr } = await supabase
          .from('keluarga_pbb')
          .upsert(batch, { onConflict: 'kode_blok,rt,nama_kepala_keluarga' })
          .select('id, kode_blok, rt, nama_kepala_keluarga')

        if (!famErr && Array.isArray(insertedFam)) {
          for (const f of insertedFam) {
            const k = `${f.kode_blok}|${f.rt || ''}|${f.nama_kepala_keluarga}`
            familyIdMap.set(k, f.id)
          }
        } else {
          for (const item of batch) {
            const { data: singleFam } = await supabase
              .from('keluarga_pbb')
              .upsert(item, { onConflict: 'kode_blok,rt,nama_kepala_keluarga' })
              .select('id')
              .single()
            if (singleFam) {
              const k = `${item.kode_blok}|${item.rt || ''}|${item.nama_kepala_keluarga}`
              familyIdMap.set(k, singleFam.id)
            }
          }
        }
      }

      const tagihanMap = new Map()
      for (let idx = 0; idx < parsedItems.length; idx++) {
        const item = parsedItems[idx]
        const k = `${kodeBlokDefault}|${item.rt || ''}|${item.kepalaKeluarga}`
        const familyId = familyIdMap.get(k)
        if (!familyId) continue

        const payload = {
          keluarga_id: familyId,
          nop: item.nop,
          nama_wp: item.namaWp,
          urutan: idx + 1,
          tahun_pajak: tahunPajak,
          nominal_tagihan: item.nominal,
          denda: 0,
          status_lunas: false,
          tertagih_ke: item.kepalaKeluarga,
          dibayarkan_oleh: '',
          catatan: item.rt ? `RT ${item.rt}` : '',
          tanggal_jatuh_tempo: `${tahunPajak}-09-30`,
        }

        if (!tagihanMap.has(item.nop)) {
          tagihanMap.set(item.nop, payload)
        } else {
          const existing = tagihanMap.get(item.nop)
          if (item.nominal > 0 && existing.nominal_tagihan === 0) {
            tagihanMap.set(item.nop, payload)
          }
        }
      }

      const tagihanPayloads = Array.from(tagihanMap.values())

      for (let i = 0; i < tagihanPayloads.length; i += BATCH_SIZE) {
        const batch = tagihanPayloads.slice(i, i + BATCH_SIZE)
        const { error: tagErr } = await supabase
          .from('tagihan_pbb')
          .upsert(batch, { onConflict: 'nop,tahun_pajak' })
        if (!tagErr) {
          insertedRows.push(...batch)
        } else {
          for (const singleTag of batch) {
            const { error: singleErr } = await supabase
              .from('tagihan_pbb')
              .upsert(singleTag, { onConflict: 'nop,tahun_pajak' })
            if (!singleErr) insertedRows.push(singleTag)
          }
        }
      }
    } else {
      let currentRt = ''
      let currentFamily = null
      let currentFamilyId = null
      let currentFamilyNames = []

      for (const row of rows) {
        const firstCell = String(row[0] ?? '').trim()
        const secondCell = String(row[1] ?? '').trim()
        const namaCell = String(row[2] ?? '').trim()
        const tagihanCell = row[3]
        const dendaCell = row[4]
        const tertagihCell = String(row[5] ?? '').trim()

        if (/^RT[\s.]*\d+/i.test(firstCell)) {
          currentRt = firstCell.replace(/RT[\s.]*/i, 'RT ').trim()
          currentFamily = null
          currentFamilyId = null
          currentFamilyNames = []
          continue
        }

        const rowStr = row.map(c => String(c ?? '')).join(' ').toUpperCase()
        if (
          rowStr.includes('JUMLAH') ||
          rowStr.includes('TOTAL') ||
          rowStr.includes('SUBTOTAL') ||
          rowStr.includes('REKAP')
        ) {
          continue
        }

        const cleanDigits = secondCell.replace(/\D/g, '')
        if (cleanDigits.length < 15 || cleanDigits.length > 18) {
          continue
        }

        if (!secondCell || !namaCell) continue

        if (tertagihCell) {
          currentFamily = { headName: tertagihCell, alamat: '', letakOp: currentRt }
          currentFamilyNames = []
        }

        if (!currentFamily) {
          currentFamily = { headName: tertagihCell || namaCell, alamat: '', letakOp: currentRt }
        }

        currentFamilyNames.push(...splitNamaAnggota(namaCell))
        if (tertagihCell) currentFamilyNames.push(...splitNamaAnggota(tertagihCell))

        const uniqueNames = Array.from(new Set(currentFamilyNames))
        const { data: keluargaRow, error: keluargaError } = await supabase
          .from('keluarga_pbb')
          .upsert(
            {
              nama_kepala_keluarga: currentFamily.headName,
              nama_anggota_raw: uniqueNames.join(', '),
              alamat_wp: currentFamily.alamat || '',
              rt: currentRt,
              letak_op: currentFamily.letakOp || '',
              kode_blok: kodeBlokDefault,
              status_aktif: true,
              catatan: `Diimpor dari ${file.name} (${sheetName})`,
            },
            { onConflict: 'kode_blok,rt,nama_kepala_keluarga' }
          )
          .select('id')
          .single()

        if (keluargaError) continue

        currentFamilyId = keluargaRow.id
        if (!insertedFamilies.includes(currentFamilyId)) insertedFamilies.push(currentFamilyId)

        const tagihanPayload = {
          keluarga_id: currentFamilyId,
          nop: secondCell,
          nama_wp: namaCell,
          urutan: Number(firstCell) || insertedRows.length + 1,
          tahun_pajak: tahunPajak,
          nominal_tagihan: parseNominal(tagihanCell),
          denda: parseNominal(dendaCell),
          status_lunas: false,
          tertagih_ke: tertagihCell || currentFamily.headName,
          dibayarkan_oleh: '',
          catatan: currentRt ? `RT ${currentRt}` : '',
          tanggal_jatuh_tempo: `${tahunPajak}-09-30`,
        }

        const { error: tagihanError } = await supabase.from('tagihan_pbb').upsert(tagihanPayload, { onConflict: 'nop,tahun_pajak' })
        if (!tagihanError) insertedRows.push(tagihanPayload)
      }
    }
  }

  await supabase.from('import_batches').insert({
    nama_file: file.name,
    tahun_pajak: tahunPajak,
    total_baris: insertedRows.length,
    total_keluarga: insertedFamilies.length,
    total_tagihan: insertedRows.reduce((total, item) => total + toNumber(item.nominal_tagihan), 0),
    metadata: { filename: file.name, totalSheets: workbook.SheetNames.length },
  })

  return {
    totalRows: insertedRows.length,
    totalKeluarga: insertedFamilies.length,
    totalNominal: insertedRows.reduce((total, item) => total + toNumber(item.nominal_tagihan), 0),
  }
}

export async function copyUnpaidTagihan(fromYear, toYear = CURRENT_YEAR) {
  try {
    const { data, error } = await supabase.rpc('copy_unpaid_tagihan', {
      p_from_year: Number(fromYear),
      p_to_year: Number(toYear),
    })
    if (!error && typeof data === 'number') return data
  } catch (e) {
    console.warn('RPC copy_unpaid_tagihan notice:', e)
  }

  // Robust Fallback in JS:
  const { data: unpaidRows, error: fetchErr } = await supabase
    .from('tagihan_pbb')
    .select('*')
    .eq('tahun_pajak', Number(fromYear))
    .eq('status_lunas', false)

  if (fetchErr || !unpaidRows || unpaidRows.length === 0) return 0

  const payload = unpaidRows.map(row => ({
    keluarga_id: row.keluarga_id,
    nop: row.nop,
    nama_wp: row.nama_wp,
    urutan: row.urutan,
    tahun_pajak: Number(toYear),
    nominal_tagihan: row.nominal_tagihan,
    denda: row.denda,
    status_lunas: false,
    tertagih_ke: row.tertagih_ke,
    catatan: `Salinan dari tahun ${fromYear}`,
  }))

  const { data: inserted, error: insertErr } = await supabase
    .from('tagihan_pbb')
    .upsert(payload, { onConflict: 'nop,tahun_pajak' })
    .select('id')

  if (insertErr) throw insertErr
  return inserted?.length ?? payload.length
}

const buildKecamatanBuckets = (rows) => {
  const buckets = rows.reduce((accumulator, row) => {
    const blok = getKodeBlok(row) || 'Tidak Diketahui'

    if (!accumulator[blok]) {
      accumulator[blok] = {
        total_wp: 0,
        target_nominal: 0,
        terrealisasi_nominal: 0,
      }
    }

    accumulator[blok].total_wp += 1
    accumulator[blok].target_nominal += toNumber(row.nominal_tagihan)
    if (row.status_lunas) {
      accumulator[blok].terrealisasi_nominal += toNumber(row.nominal_tagihan)
    }

    return accumulator
  }, {})

  return Object.entries(buckets).map(([kodeBlok, summary]) => {
    const persentase_progres = summary.target_nominal > 0
      ? Math.min(100, Math.round((summary.terrealisasi_nominal / summary.target_nominal) * 100))
      : 0

    return normalizeSektorRow({ kode_blok: kodeBlok }, { ...summary, persentase_progres })
  })
}

export async function fetchDashboardData() {
  const rows = await fetchTagihanRows()
  const warga = rows.map(normalizeWargaRow)
  const laporan = rows.map(normalizeLaporanRow)
  const sektor = buildKecamatanBuckets(rows)

  const targetDesa = rows.reduce((total, row) => total + toNumber(row.nominal_tagihan), 0)
  const terkumpul = rows.reduce((total, row) => total + (row.status_lunas ? toNumber(row.nominal_tagihan) : 0), 0)
  const sisa = Math.max(targetDesa - terkumpul, 0)
  const progres = targetDesa > 0 ? Math.min(100, Math.round((terkumpul / targetDesa) * 100)) : 0

  return {
    ringkasan: { targetDesa, terkumpul, sisa, progres },
    kadusData: sektor.length > 0
      ? sektor.map((row) => ({
          nama_wilayah: row.nama_sektor,
          warna_bar: row.warna_tema,
          persentase: row.persentase_progres,
        }))
      : warga.map((row) => ({
          nama_wilayah: row.wilayah,
          warna_bar: 'bg-blue-600',
          persentase: row.status === 'Lunas' ? 100 : 0,
        })),
  }
}

export async function fetchWargaData() {
  const rows = await fetchTagihanRows()
  return rows.map(normalizeWargaRow)
}

export async function fetchLaporanData() {
  const rows = await fetchTagihanRows()
  const laporan = rows.map(normalizeLaporanRow)

  const penerimaanHariIni = rows
    .filter((row) => toDateText(row.tanggal_bayar) === new Date().toISOString().slice(0, 10))
    .reduce((total, row) => total + toNumber(row.nominal_tagihan), 0)

  const penerimaanBulanIni = rows.reduce((total, row) => total + (row.status_lunas ? toNumber(row.nominal_tagihan) : 0), 0)
  const totalTransaksiSukses = rows.filter((row) => row.status_lunas).length
  const efektivitasSistem = rows.length > 0 ? Math.round((totalTransaksiSukses / rows.length) * 100) : 0

  return {
    rekapKeuangan: {
      penerimaanHariIni,
      penerimaanBulanIni,
      totalTransaksiSukses,
      efektivitasSistem,
    },
    logTransaksi: laporan,
  }
}

export async function updateSektorWilayah(oldKode, data) {
  const oldKey = String(oldKode || '').toLowerCase().trim()
  const newKey = String(data.kode_sektor || oldKode || '').toLowerCase().trim()
  const namaWilayah = data.nama_sektor || data.nama_wilayah
  const namaKadus = data.penanggung_jawab || data.nama_kadus || ''
  const warnaTema = data.warna_tema || 'bg-[#002b8c]'

  try {
    if (oldKey && oldKey !== newKey) {
      await supabase.from('wilayah_penagihan').upsert({
        kode_blok: newKey,
        nama_wilayah: namaWilayah,
        nama_kadus: namaKadus,
        warna_tema: warnaTema,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'kode_blok' })

      await supabase.from('keluarga_pbb').update({ kode_blok: newKey }).eq('kode_blok', oldKey)
      await supabase.from('wilayah_penagihan').delete().eq('kode_blok', oldKey)
    } else {
      await supabase.from('wilayah_penagihan').upsert({
        kode_blok: newKey,
        nama_wilayah: namaWilayah,
        nama_kadus: namaKadus,
        warna_tema: warnaTema,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'kode_blok' })
    }
  } catch (err) {
    console.warn('Gagal upsert ke DB wilayah_penagihan, fallback localStorage:', err)
  }

  if (oldKey && oldKey !== newKey) {
    delete WILAYAH_MAP[oldKey]
  }
  WILAYAH_MAP[newKey] = namaWilayah

  const customMap = JSON.parse(localStorage.getItem('pbb_custom_sektor') || '{}')
  if (oldKey && oldKey !== newKey) {
    delete customMap[oldKey]
  }
  customMap[newKey] = {
    nama_wilayah: namaWilayah,
    nama_kadus: namaKadus,
    warna_tema: warnaTema,
  }
  localStorage.setItem('pbb_custom_sektor', JSON.stringify(customMap))
  return true
}

export async function fetchSektorData() {
  const rows = await fetchTagihanRows()

  let dbWilayah = {}
  try {
    const { data } = await supabase.from('wilayah_penagihan').select('*')
    if (Array.isArray(data)) {
      data.forEach(w => {
        if (w.kode_blok) {
          const k = w.kode_blok.toLowerCase()
          dbWilayah[k] = {
            nama_wilayah: w.nama_wilayah,
            nama_kadus: w.nama_kadus,
            warna_tema: w.warna_tema,
          }
          if (w.nama_wilayah) WILAYAH_MAP[k] = w.nama_wilayah
        }
      })
    }
  } catch (err) {
    console.warn('Gagal fetch database wilayah_penagihan:', err)
  }

  const localMap = JSON.parse(localStorage.getItem('pbb_custom_sektor') || '{}')
  Object.entries(localMap).forEach(([k, v]) => {
    if (v.nama_wilayah) WILAYAH_MAP[k] = v.nama_wilayah
  })


  const buckets = rows.reduce((accumulator, row) => {
    const blok = (getKodeBlok(row) || 'lainnya').toLowerCase()
    if (!accumulator[blok]) {
      accumulator[blok] = {
        total_wp: 0,
        target_nominal: 0,
        terrealisasi_nominal: 0,
      }
    }

    accumulator[blok].total_wp += 1
    accumulator[blok].target_nominal += toNumber(row.nominal_tagihan)
    if (row.status_lunas) {
      accumulator[blok].terrealisasi_nominal += toNumber(row.nominal_tagihan)
    }

    return accumulator
  }, {})

  const daftarSektor = Object.entries(buckets).map(([kodeBlok, summary]) => {
    const custom = dbWilayah[kodeBlok] || localMap[kodeBlok] || {}
    const persentase_progres = summary.target_nominal > 0
      ? Math.min(100, Math.round((summary.terrealisasi_nominal / summary.target_nominal) * 100))
      : 0

    return {
      kode_sektor: kodeBlok.toUpperCase(),
      nama_sektor: custom.nama_wilayah || getNamaWilayah(kodeBlok),
      penanggung_jawab: custom.nama_kadus || `Koordinator Dusun ${kodeBlok.toUpperCase()}`,
      total_wp: summary.total_wp,
      target_nominal: summary.target_nominal,
      terrealisasi_nominal: summary.terrealisasi_nominal,
      persentase_progres,
      warna_tema: custom.warna_tema || 'bg-[#002b8c]',
    }
  })

  return {
    totalSektor: daftarSektor.length,
    daftarSektor,
  }
}

export async function fetchSettingsData() {
  const { data, error } = await supabase
    .from('pengaturan_desa')
    .select('nama_desa, kecamatan, kabupaten, tahun_anggaran, target_nominal')
    .limit(1)

  if (error) {
    throw error
  }

  const row = Array.isArray(data) ? data[0] ?? {} : data ?? {}
  return normalizeSettingsRow({
    nama_desa: row.nama_desa ?? '',
    kecamatan: row.kecamatan ?? '',
    kabupaten: row.kabupaten ?? '',
    tahun_anggaran: row.tahun_anggaran ?? CURRENT_YEAR,
    target_nominal: row.target_nominal ?? 0,
  })
}

export async function saveSettingsData(formDesa) {
  const payload = {
    id: 1,
    nama_desa: formDesa.namaDesa,
    kecamatan: formDesa.kecamatan,
    kabupaten: formDesa.kabupaten,
    tahun_anggaran: formDesa.tahunAnggaran,
    target_nominal: toNumber(formDesa.targetNominalDesa),
  }

  const { error } = await supabase.from('pengaturan_desa').upsert(payload, { onConflict: 'id' })

  if (error) {
    throw error
  }
}

export const WILAYAH_MAP = {
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

export const getNamaWilayah = (kode) =>
  WILAYAH_MAP[kode?.toLowerCase()] ?? kode ?? '-'

export const formatIndoDate = (dateStr) => {
  if (!dateStr) return '-'
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  const parts = String(dateStr).split('-')
  if (parts.length === 3) {
    const year = parts[0]
    const month = months[parseInt(parts[1], 10) - 1] || parts[1]
    const day = parseInt(parts[2], 10)
    return `${day} ${month} ${year}`
  }
  return dateStr
}

export function exportDataWargaPerKK(dataWargaList, filterTahun = 'Semua Tahun') {
  if (!dataWargaList || dataWargaList.length === 0) {
    alert('Tidak ada data warga untuk diekspor!')
    return
  }

  const kkMap = new Map()

  dataWargaList.forEach((item) => {
    const key = item.keluarga_id || `${item.wilayah}_${item.rt}_${item.nama_kepala_keluarga || item.nama}`
    if (!kkMap.has(key)) {
      kkMap.set(key, {
        nama_kepala_keluarga: item.nama_kepala_keluarga || item.nama,
        wilayah: getNamaWilayah(item.wilayah),
        rt: item.rt ? item.rt.replace(/^RT\s*/i, 'RT ') : '-',
        tahun_pajak: item.tahun_pajak,
        total_tagihan: 0,
        nops: [],
        items: [],
        status_list: [],
        jatuh_tempo: item.tanggal_jatuh_tempo || `${item.tahun_pajak || CURRENT_YEAR}-09-30`,
        tanggal_bayar_list: []
      })
    }
    const group = kkMap.get(key)
    group.total_tagihan += Number(item.tagihan || 0)
    group.nops.push(item.nop)
    group.items.push(item)
    group.status_list.push(item.status)
    if (item.tanggal_bayar) group.tanggal_bayar_list.push(item.tanggal_bayar)
  })

  const rekapRows = []
  let no = 1
  kkMap.forEach((group) => {
    const isSemuaLunas = group.status_list.every(s => s === 'Lunas')
    const isSemuaBelum = group.status_list.every(s => s === 'Belum Lunas')
    const overallStatus = isSemuaLunas ? 'Lunas' : isSemuaBelum ? 'Belum Lunas' : 'Sebagian Lunas'

    rekapRows.push({
      'No': no++,
      'Nama Kepala Keluarga': group.nama_kepala_keluarga,
      'Wilayah / Dusun': group.wilayah,
      'RT': group.rt,
      'Jumlah Bidang (NOP)': group.nops.length,
      'Daftar NOP': group.nops.join(', '),
      'Tahun Pajak': group.tahun_pajak,
      'Total Tagihan PBB (Rp)': group.total_tagihan,
      'Status Pembayaran': overallStatus,
      'Masa Tenggat (Jatuh Tempo)': formatIndoDate(group.jatuh_tempo),
      'Tanggal Bayar': group.tanggal_bayar_list.length > 0 ? group.tanggal_bayar_list.map(formatIndoDate).join(', ') : '-'
    })
  })

  const rincianRows = []
  let rincianNo = 1
  dataWargaList.forEach((item) => {
    rincianRows.push({
      'No': rincianNo++,
      'Nama Kepala Keluarga': item.nama_kepala_keluarga || item.nama,
      'Nama Wajib Pajak (SPPT)': item.nama,
      'NOP': item.nop,
      'Wilayah / Dusun': getNamaWilayah(item.wilayah),
      'RT': item.rt ? item.rt.replace(/^RT\s*/i, 'RT ') : '-',
      'Tahun Pajak': item.tahun_pajak,
      'Nominal Tagihan (Rp)': Number(item.tagihan || 0),
      'Status Pembayaran': item.status,
      'Masa Tenggat (Jatuh Tempo)': formatIndoDate(item.tanggal_jatuh_tempo || `${item.tahun_pajak}-09-30`),
      'Tanggal Bayar': item.tanggal_bayar ? formatIndoDate(item.tanggal_bayar) : '-'
    })
  })

  const wb = xlsx.utils.book_new()
  const wsRekap = xlsx.utils.json_to_sheet(rekapRows)
  const wsRincian = xlsx.utils.json_to_sheet(rincianRows)

  const setColsWidth = (ws, rows) => {
    if (!rows || rows.length === 0) return
    const keys = Object.keys(rows[0])
    ws['!cols'] = keys.map(k => {
      let maxLen = k.length
      rows.forEach(r => {
        const valStr = String(r[k] ?? '')
        if (valStr.length > maxLen) maxLen = Math.min(valStr.length, 50)
      })
      return { wch: maxLen + 3 }
    })
  }

  setColsWidth(wsRekap, rekapRows)
  setColsWidth(wsRincian, rincianRows)

  xlsx.utils.book_append_sheet(wb, wsRekap, 'Rekap Per Kepala Keluarga')
  xlsx.utils.book_append_sheet(wb, wsRincian, 'Rincian Per NOP')

  const yearSuffix = filterTahun !== 'Semua Tahun' ? `_${filterTahun}` : ''
  const filename = `PBB_Desa_Randu_Per_KK${yearSuffix}.xlsx`

  xlsx.writeFile(wb, filename)
}

/* ==========================================================================
   MANAJEMEN AKUN & AUTENTIKASI REAL (Sekdes vs Kadus)
   ========================================================================== */
const DEFAULT_APP_USERS = [
  {
    username: 'sekdes',
    password: '123',
    nama_lengkap: 'Sekdes Randu',
    role: 'sekdes',
    wilayah: 'Semua Wilayah'
  },
  {
    username: 'kadus_rw1',
    password: '123',
    nama_lengkap: 'Kadus RW 1 Randu',
    role: 'kadus',
    wilayah: 'ep'
  },
  {
    username: 'kadus_rw2',
    password: '123',
    nama_lengkap: 'Kadus RW 2 Bandon',
    role: 'kadus',
    wilayah: 'b'
  },
  {
    username: 'kadus_rw3',
    password: '123',
    nama_lengkap: 'Kadus RW 3 Randu Tengah',
    role: 'kadus',
    wilayah: 'e'
  }
]

export function getAppUsers() {
  try {
    const localData = localStorage.getItem('pbb_registered_users')
    if (localData) {
      const parsed = JSON.parse(localData)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch (err) {
    console.error('Gagal membaca akun terdaftar dari localStorage:', err)
  }
  localStorage.setItem('pbb_registered_users', JSON.stringify(DEFAULT_APP_USERS))
  return DEFAULT_APP_USERS
}

export async function registerNewUser({ nama_lengkap, username, password, role, wilayah }) {
  const users = getAppUsers()
  const cleanUsername = String(username).trim().toLowerCase()

  if (!cleanUsername || !password || !nama_lengkap) {
    throw new Error('Seluruh kolom pendaftaran (Nama, Username, Password) wajib diisi!')
  }

  if (users.some(u => String(u.username).trim().toLowerCase() === cleanUsername)) {
    throw new Error(`Username "${username}" sudah terdaftar! Silakan gunakan username lain atau langsung Masuk.`)
  }

  const newUser = {
    username: cleanUsername,
    password: String(password).trim(),
    nama_lengkap: String(nama_lengkap).trim(),
    role: role === 'sekdes' ? 'sekdes' : 'kadus',
    wilayah: role === 'sekdes' ? 'Semua Wilayah' : (wilayah || 'ep')
  }

  // Simpan ke Supabase tabel users_pbb
  try {
    const { error: dbErr } = await supabase
      .from('users_pbb')
      .upsert({
        nama: newUser.nama_lengkap,
        username: newUser.username,
        password_hash: newUser.password,
        role: newUser.role,
        wilayah: newUser.wilayah,
        is_active: true,
      }, { onConflict: 'username' })

    if (dbErr) {
      console.error('Gagal upsert users_pbb:', dbErr.message)
      throw new Error(`Gagal menyimpan akun ke database: ${dbErr.message}`)
    }
  } catch (err) {
    throw err
  }

  // Simpan ke LocalStorage cache
  users.push(newUser)
  localStorage.setItem('pbb_registered_users', JSON.stringify(users))

  return newUser
}

export async function authenticateUser(usernameInput, passwordInput) {
  const cleanUsername = String(usernameInput).trim().toLowerCase()
  const cleanPassword = String(passwordInput).trim()

  if (!cleanUsername || !cleanPassword) {
    throw new Error('Username dan kata sandi wajib diisi!')
  }

  // 1. Cek langsung ke database Supabase PostgreSQL 'users_pbb'
  try {
    const { data: dbUser, error } = await supabase
      .from('users_pbb')
      .select('*')
      .eq('username', cleanUsername)
      .maybeSingle()

    if (dbUser && !error) {
      // Verifikasi password
      if (dbUser.password_hash !== cleanPassword) {
        throw new Error('Kata sandi yang Anda masukkan salah!')
      }
      const userRole = dbUser.role === 'sekdes' ? 'sekdes' : 'kadus'
      const userWilayah = userRole === 'sekdes' ? 'Semua Wilayah' : (dbUser.wilayah || 'ep')
      const dbAuthUser = {
        username: dbUser.username,
        password: cleanPassword,
        nama_lengkap: dbUser.nama || cleanUsername,
        role: userRole,
        wilayah: userWilayah
      }

      // Sync ke local storage cache
      const localUsers = getAppUsers()
      const existingIdx = localUsers.findIndex(u => u.username === cleanUsername)
      if (existingIdx >= 0) {
        localUsers[existingIdx] = dbAuthUser
      } else {
        localUsers.push(dbAuthUser)
      }
      localStorage.setItem('pbb_registered_users', JSON.stringify(localUsers))

      return dbAuthUser
    }
  } catch (err) {
    // Kalau error dari password salah, lempar langsung
    if (err.message?.includes('salah')) throw err
    console.warn('Gagal cek Supabase DB user, fallback ke local storage:', err.message)
  }

  // 2. Fallback ke Local Storage (jika offline/lokal)
  const users = getAppUsers()
  const foundUser = users.find(u => String(u.username).trim().toLowerCase() === cleanUsername)
  if (!foundUser) {
    throw new Error(`Username "${usernameInput}" belum terdaftar. Silakan klik tab "Daftar Akun Baru".`)
  }

  if (foundUser.password !== cleanPassword) {
    throw new Error('Kata sandi yang Anda masukkan salah!')
  }

  return foundUser
}
