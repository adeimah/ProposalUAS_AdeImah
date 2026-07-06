# SavingGoals Backend API

Pondasi backend untuk aplikasi SavingGoals menggunakan Node.js, Express.js, Prisma ORM, dan PostgreSQL.

## Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database ORM**: Prisma ORM
- **Database**: PostgreSQL (Supabase)
- **Logger**: Morgan
- **CORS Handler**: cors
- **Environment config**: dotenv
- **Validator**: express-validator
- **Encryption**: bcrypt

## Struktur Proyek
```text
server/
├── prisma/               # Konfigurasi skema database Prisma
├── src/
│   ├── config/           # Konfigurasi modul (seperti DB client)
│   ├── controllers/      # Logika handler request/response
│   ├── middleware/       # Custom middleware (auth, logging, error handler)
│   ├── routes/           # Routing endpoints API
│   ├── services/         # Logika bisnis/integrasi database
│   ├── validations/      # Aturan validasi request payload
│   ├── utils/            # Fungsi helper umum
│   ├── app.js            # Express app configuration
│   └── server.js         # Entry point listener server
├── .env.example          # Contoh variabel lingkungan
├── .env                  # Variabel lingkungan lokal
├── .gitignore            # Berkas gitignore
├── package.json          # Manifest proyek Node.js
└── README.md             # Dokumentasi ini
```

## Memulai
1. Install seluruh dependensi:
   ```bash
   npm install
   ```
2. Copy berkas `.env.example` ke `.env` dan isi kredensial PostgreSQL Supabase Anda:
   ```bash
   cp .env.example .env
   ```
3. Jalankan server dalam mode development:
   ```bash
   npm run dev
   ```
