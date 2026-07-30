-- Supabase schema rebuild for PBB Desa Randu
-- Run this in the Supabase SQL Editor after backing up existing data.

create extension if not exists pgcrypto;

drop view if exists public.vw_tagihan_pbb_detail cascade;
drop function if exists public.copy_unpaid_tagihan(integer, integer);
drop table if exists public.pembayaran_pbb cascade;
drop table if exists public.import_batches cascade;
drop table if exists public.tagihan_pbb cascade;
drop table if exists public.anggota_keluarga_pbb cascade;
drop table if exists public.keluarga_pbb cascade;
drop table if exists public.wilayah_penagihan cascade;
drop table if exists public.pengaturan_desa cascade;
drop table if exists public.users cascade;

create table public.pengaturan_desa (
  id smallint primary key default 1,
  nama_desa text not null default 'Desa Randu',
  kecamatan text not null default '',
  kabupaten text not null default '',
  tahun_anggaran integer not null default extract(year from now())::integer,
  target_nominal numeric(18,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pengaturan_desa_single_row check (id = 1)
);

create table public.wilayah_penagihan (
  kode_blok text primary key,
  nama_wilayah text not null,
  nama_kadus text not null default '',
  urutan integer not null default 0,
  warna_tema text not null default 'bg-[#002b8c]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.keluarga_pbb (
  id uuid primary key default gen_random_uuid(),
  nama_kepala_keluarga text not null,
  nama_anggota_raw text not null default '',
  alamat_wp text not null default '',
  rt text not null default '',
  letak_op text not null default '',
  kode_blok text not null references public.wilayah_penagihan(kode_blok) on update cascade on delete restrict,
  status_aktif boolean not null default true,
  catatan text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (kode_blok, rt, nama_kepala_keluarga)
);

create table public.anggota_keluarga_pbb (
  id uuid primary key default gen_random_uuid(),
  keluarga_id uuid not null references public.keluarga_pbb(id) on delete cascade,
  nama text not null,
  urutan smallint not null default 1,
  is_kepala_keluarga boolean not null default false,
  created_at timestamptz not null default now(),
  unique (keluarga_id, nama)
);

create table public.tagihan_pbb (
  id uuid primary key default gen_random_uuid(),
  keluarga_id uuid not null references public.keluarga_pbb(id) on delete cascade,
  nop text not null,
  nama_wp text not null default '',
  urutan integer not null default 0,
  tahun_pajak integer not null,
  nominal_tagihan numeric(18,2) not null default 0,
  denda numeric(18,2) not null default 0,
  status_lunas boolean not null default false,
  tanggal_bayar date,
  tanggal_tagih date,
  tanggal_jatuh_tempo date,
  tertagih_ke text not null default '',
  dibayarkan_oleh text not null default '',
  catatan text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (nop, tahun_pajak)
);

create table public.import_batches (
  id uuid primary key default gen_random_uuid(),
  nama_file text not null,
  tahun_pajak integer not null,
  total_baris integer not null default 0,
  total_keluarga integer not null default 0,
  total_tagihan numeric(18,2) not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.pembayaran_pbb (
  id uuid primary key default gen_random_uuid(),
  tagihan_id uuid not null references public.tagihan_pbb(id) on delete cascade,
  tanggal_bayar date not null default current_date,
  jumlah_bayar numeric(18,2) not null default 0,
  metode text not null default '',
  petugas_nama text not null default '',
  catatan text not null default '',
  created_at timestamptz not null default now()
);

create table public.users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete set null,
  nama_lengkap text not null,
  username text not null unique,
  role text not null check (role in ('admin', 'kadus')),
  kode_blok_tugas text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.pengaturan_desa enable row level security;
alter table public.wilayah_penagihan enable row level security;
alter table public.keluarga_pbb enable row level security;
alter table public.anggota_keluarga_pbb enable row level security;
alter table public.tagihan_pbb enable row level security;
alter table public.import_batches enable row level security;
alter table public.pembayaran_pbb enable row level security;
alter table public.users enable row level security;

drop policy if exists "public read pengaturan_desa" on public.pengaturan_desa;
create policy "public read pengaturan_desa"
on public.pengaturan_desa
for select
using (true);

drop policy if exists "public read wilayah_penagihan" on public.wilayah_penagihan;
create policy "public read wilayah_penagihan"
on public.wilayah_penagihan
for select
using (true);

drop policy if exists "public read keluarga_pbb" on public.keluarga_pbb;
create policy "public read keluarga_pbb"
on public.keluarga_pbb
for select
using (true);

drop policy if exists "public read anggota_keluarga_pbb" on public.anggota_keluarga_pbb;
create policy "public read anggota_keluarga_pbb"
on public.anggota_keluarga_pbb
for select
using (true);

drop policy if exists "public read tagihan_pbb" on public.tagihan_pbb;
create policy "public read tagihan_pbb"
on public.tagihan_pbb
for select
using (true);

drop policy if exists "public read import_batches" on public.import_batches;
create policy "public read import_batches"
on public.import_batches
for select
using (true);

drop policy if exists "public read pembayaran_pbb" on public.pembayaran_pbb;
create policy "public read pembayaran_pbb"
on public.pembayaran_pbb
for select
using (true);

drop policy if exists "public read users" on public.users;
create policy "public read users"
on public.users
for select
using (true);

-- Write policies (INSERT / UPDATE / DELETE)
drop policy if exists "public write pengaturan_desa" on public.pengaturan_desa;
create policy "public write pengaturan_desa"
on public.pengaturan_desa
for all
using (true)
with check (true);

drop policy if exists "public write wilayah_penagihan" on public.wilayah_penagihan;
create policy "public write wilayah_penagihan"
on public.wilayah_penagihan
for all
using (true)
with check (true);

drop policy if exists "public write keluarga_pbb" on public.keluarga_pbb;
create policy "public write keluarga_pbb"
on public.keluarga_pbb
for all
using (true)
with check (true);

drop policy if exists "public write anggota_keluarga_pbb" on public.anggota_keluarga_pbb;
create policy "public write anggota_keluarga_pbb"
on public.anggota_keluarga_pbb
for all
using (true)
with check (true);

drop policy if exists "public write tagihan_pbb" on public.tagihan_pbb;
create policy "public write tagihan_pbb"
on public.tagihan_pbb
for all
using (true)
with check (true);

drop policy if exists "public write import_batches" on public.import_batches;
create policy "public write import_batches"
on public.import_batches
for all
using (true)
with check (true);

drop policy if exists "public write users" on public.users;
create policy "public write users"
on public.users
for all
using (true)
with check (true);

create or replace view public.vw_tagihan_pbb_detail as
select
  tp.id as id_tagihan,
  tp.keluarga_id,
  tp.nop,
  tp.nama_wp,
  tp.urutan,
  tp.tahun_pajak,
  tp.nominal_tagihan,
  tp.denda,
  tp.status_lunas,
  tp.tanggal_bayar,
  tp.tanggal_tagih,
  tp.tanggal_jatuh_tempo,
  tp.tertagih_ke,
  tp.dibayarkan_oleh,
  kp.nama_kepala_keluarga,
  kp.nama_anggota_raw,
  kp.alamat_wp,
  kp.rt,
  kp.letak_op,
  kp.kode_blok,
  wp.nama_wilayah,
  wp.nama_kadus,
  wp.warna_tema,
  coalesce(
    string_agg(case when ak.nama is not null then ak.nama end, ', ' order by ak.urutan),
    kp.nama_kepala_keluarga
  ) as daftar_anggota
from public.tagihan_pbb tp
join public.keluarga_pbb kp on kp.id = tp.keluarga_id
left join public.wilayah_penagihan wp on wp.kode_blok = kp.kode_blok
left join public.anggota_keluarga_pbb ak on ak.keluarga_id = kp.id
group by
  tp.id,
  tp.keluarga_id,
  tp.nop,
  tp.nama_wp,
  tp.urutan,
  tp.tahun_pajak,
  tp.nominal_tagihan,
  tp.denda,
  tp.status_lunas,
  tp.tanggal_bayar,
  tp.tanggal_tagih,
  tp.tanggal_jatuh_tempo,
  tp.tertagih_ke,
  tp.dibayarkan_oleh,
  kp.nama_kepala_keluarga,
  kp.nama_anggota_raw,
  kp.alamat_wp,
  kp.rt,
  kp.letak_op,
  kp.kode_blok,
  wp.nama_wilayah,
  wp.nama_kadus,
  wp.warna_tema;

create or replace function public.copy_unpaid_tagihan(
  p_from_year integer,
  p_to_year integer default extract(year from now())::integer
)
returns integer
language plpgsql
as $$
declare
  inserted_count integer := 0;
begin
  insert into public.tagihan_pbb (
    keluarga_id,
    tahun_pajak,
    nominal_tagihan,
    status_lunas,
    tanggal_bayar,
    tanggal_tagih,
    tanggal_jatuh_tempo,
    dibayarkan_oleh,
    catatan
  )
  select
    tp.keluarga_id,
    p_to_year,
    tp.nominal_tagihan,
    false,
    null,
    null,
    null,
    '',
    'Salinan otomatis dari tahun ' || p_from_year
  from public.tagihan_pbb tp
  where tp.tahun_pajak = p_from_year
    and coalesce(tp.status_lunas, false) = false
  on conflict (keluarga_id, tahun_pajak) do nothing;

  get diagnostics inserted_count = row_count;
  return inserted_count;
end;
$$;
