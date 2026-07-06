

## PROPOSAL UAS
## WEB ADVANCED DEVELOPMENT
## “ TRACKER NABUNG TARGET (SAVING GOALS) ”

## Nama   : Ade Imah
## Nim   : 24110400016
Dosen Pengampu : Bapak Drestanto Muhammad Dyasputro, , ST, MCS

## BAGIAN 1 - TOPIC & BUSINESS GOAL
## 1. Latar Belakang
Menabung adalah kebiasaan baik yang ingin dimiliki banyak orang, namun seringkali
sulit untuk tetap konsisten. Berdasarkan pengamatan sehari-hari, banyak mahasiswa
dan masyarakat umum mengalami kesulitan dalam mencapai target menabung mereka
karena:
➔ Tidak ada sistem yang mencatat progress menabung secara terstruktur
➔ Sulit memvisualisasikan seberapa dekat mereka dengan target
➔ Lupa dengan target yang sudah ditetapkan
➔ Tidak ada motivasi visual untuk terus menabung
➔ Kesulitan melacak pemasukan dan pengeluaran untuk menabung
Proses menabung saat ini masih banyak dilakukan secara manual melalui catatan di
buku atau spreadsheet, sehingga menyulitkan pengguna untuk melihat gambaran besar
dari kebiasaan menabung mereka.
## 2. Business Goal
➔ Dashboard – Menampilkan ringkasan data, seperti total pesanan, total
pendapatan, dan status pesanan.
➔ Memungkinkan pengguna membuat dan mengelola target menabung dengan
mudah
➔ Menyediakan visualisasi progress yang jelas dan memotivasi
➔ Membantu pengguna melacak setoran dan estimasi waktu pencapaian target
➔ Memberikan dashboard statistik untuk melihat kebiasaan menabung secara
keseluruhan
➔ Mendorong pengguna untuk tetap konsisten menabung melalui fitur reminder
dan visual progress.
## ➔

## 3. Business Requirements
## No Requirement
BR-1 Pengguna dapat membuat target menabung baru (nama, target nominal, deadline)
BR-2 Pengguna dapat mencatat setoran ke target menabung
BR-3 Pengguna dapat melihat progress target (progress bar, persentase, estimasi
selesai)
BR-4 Pengguna dapat melihat dashboard semua target menabung
BR-5 Pengguna dapat mengupdate target menabung (ubah nominal, deadline)
BR-6 Pengguna dapat menghapus target menabung
BR-7 Sistem memberikan estimasi kapan target akan tercapai berdasarkan rata-rata
setoran
BR-8 Pengguna dapat melihat statistik total tabungan dan rata-rata setoran

## BAGIAN 2 - BENTUK DATA & API ENDPOINTS

## 1. Entitas Utama
➔ User (pengguna aplikasi)
➔ SavingGoal (target menabung)
➔ Deposit (setoran ke target menabung)
- Daftar Endpoint REST API









- Autentikasi (JWT)
➔ Login: User mengirim email & password, server mengembalikan JWT token
➔ Authorization: Setiap request ke endpoint terproteksi menyertakan header
## Authorization: Bearer <token>
## BAGIAN 3 - RENCANA TECH STACK
## Layer Teknologi
Back-End Node.js + Express.js
Front-End React.js
ORM Prisma
Database MySQL
## Api Testing Potsmen
## Authentication
JWT (JSON Web Token)
## BAGIAN 4 - IMPACT
## ● Bagi Pengguna:
➔ Kemudahan: Pengguna dapat membuat target menabung dengan mudah dan
melacak progress secara real-time
➔ Motivasi: Visualisasi progress bar dan estimasi waktu memberikan motivasi
untuk terus menabung
➔ Organisasi: Semua target menabung terorganisir dengan baik dalam satu
aplikasi
➔ Transparansi: Pengguna dapat melihat dengan jelas seberapa dekat mereka
dengan target
➔ Disiplin: Fitur tracking membantu pengguna lebih disiplin dalam menabung
## ● Manfaat Spesifik:
➔ Untuk Mahasiswa: Membantu mengatur keuangan untuk membeli buku,
gadget, atau keperluan kuliah
➔ Untuk Pekerja: Membantu merencanakan liburan, membeli kendaraan, atau
investasi
➔ Untuk Keluarga: Membantu merencanakan pengeluaran besar bersama

GAMBARAN WEB NYA (Hanya ilustrasi)

## FITUR - FITUR DI DALAM WEBSITE TERSEBUT:
- Login (JWT)
## 2. Dashboard
- Kelola Target Menabung (Tambah, Edit, Hapus)
## 4. Tambah Setoran
## 5. Riwayat Setoran
- Progress Target (Progress Bar & Persentase)
## 7. Statistik Tabungan.

## DESIGN WEBSITE:
- Gunakan tampilan modern, clean, dan minimalis.
- Untuk warna, gunakan: Biru sebagai warna utama
- Kuning sebagai warna aksen (tombol dan highlight)
- Putih sebagai background
- Abu-abu muda untuk card
- Hijau untuk status berhasil

- Merah untuk tombol hapus/error.



