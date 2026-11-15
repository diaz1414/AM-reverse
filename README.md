# MOTION V — Alight Motion Reverse Engineering Suite

<div align="center">

```
  __  __  ____ _____ ___ ___  _   _  __     __
 |  \/  |/ __ \_   _|_ _/ _ \| \ | | \ \   / /
 | |\/| | |  | || |  | | | | |  \| |  \ \ / / 
 | |  | | |__| || |  | | |_| | |\  |   \ V /  
 |_|  |_|\____/ |_| |___\___/|_| \_|    \_/   
```

**Next-Gen Protocol Automation & VIP License Verification Suite for Alight Motion**  
*Web Interface (NoPixel V Design Language) • Telegram Bot • Discord Bot • RESTful Gateway API*

[![Node.js](https://img.shields.io/badge/Node.js-v20%2B-00F8B9?style=for-the-badge&logo=node.js&logoColor=black)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-40E5FF?style=for-the-badge)](LICENSE)
[![UI: NoPixel V](https://img.shields.io/badge/UI-NoPixel%20V%20Aesthetic-FEFEFE?style=for-the-badge&logo=rockstargames&logoColor=black)](https://www.nopixel.net/)
[![Developer](https://img.shields.io/badge/Developer-DIAWW.DEV-00F8B9?style=for-the-badge&logo=googlechrome&logoColor=black)](https://diaww.my.id)

</div>

---

## Daftar Isi
- [Tentang Proyek](#tentang-proyek)
- [Fitur Utama](#fitur-utama)
- [Arsitektur Teknis](#arsitektur-teknis)
- [Struktur Direktori](#struktur-direktori)
- [Panduan Instalasi & Menjalankan](#panduan-instalasi--menjalankan)
  - [1. Web Portal (Express Server)](#1-web-portal-express-server)
  - [2. Telegram Bot](#2-telegram-bot)
  - [3. Discord Bot](#3-discord-bot)
- [Deployment via Cloudflare Tunnel](#deployment-via-cloudflare-tunnel)
- [Dokumentasi REST API](#dokumentasi-rest-api)
- [Penyangkalan Hukum (Disclaimer)](#penyangkalan-hukum-disclaimer)
- [Kontributor & Pengembang](#kontributor--pengembang)

---

## Tentang Proyek

**MOTION V** adalah suite otomasi berbasis riset rekayasa balik (*reverse engineering*) independen terhadap aplikasi **Alight Motion**. Proyek ini merekayasa komunikasi jaringan antara aplikasi Android resmi, Firebase Identity Toolkit, dan endpoint verifikasi lisensi Google Cloud Functions.

Sistem ini hadir dalam 3 antarmuka yang siap digunakan:
1. **Web Portal Sinematik:** Terinspirasi 1000% dari bahasa desain gelap taktis **NoPixel V** (`nopixel.net`) dengan tipografi *Barlow Condensed*, palet *Ink & Paper*, latar belakang artwork 4K GTA VI & GTA V, serta animasi dinamis saat scroll.
2. **Telegram Bot:** Menawarkan wizard interaktif dua langkah (Input Email &rarr; Tempel Tautan Verifikasi) serta perintah langsung.
3. **Discord Bot:** Mendukung *Slash Commands* modern (`/sendlink`, `/verify`) dan *Embeds* bertema gelap taktis NoPixel.

---

## Fitur Utama

- ⚡ **Otentikasi Tanpa Sandi (Passwordless):** Memanfaatkan protokol resmi Firebase Out-Of-Band (`getOobConfirmationCode` & `emailLinkSignin`). Pengguna tidak perlu memberikan password akun sama sekali.
- 🛡️ **Stealth Dalvik 2.1 Virtualization:** Menginjeksi identitas paket resmi `com.alightcreative.motion`, hash sertifikat SHA-1 asli, dan rotasi multi-IP spoofing untuk mencegah limitasi upstream.
- 🔒 **Arsitektur Zero-Log:** Bersifat *stateless* murni. Server tidak pernah menyimpan email, password, maupun token sesi pengguna ke database permanen apa pun.
- 🎮 **NoPixel V UI/UX:** Memadukan tipografi bold condensed, switcher latar belakang dinamis (GTA VI, GTA V, NoPixel V), dan efek transformatif navbar saat scroll.
- 🤖 **Multi-Platform Bot Suite:** Folder modular terpisah untuk bot Telegram dan bot Discord.

---

## Arsitektur Teknis

```
[ Klien / Pengguna ]
       │
       ▼  (Pilih Antarmuka)
┌───────────────────────────────────────────────┐
│  • Web Portal (Express.js / Tailwind CSS)     │
│  • Telegram Bot (node-telegram-bot-api)      │
│  • Discord Bot (discord.js v14)               │
└───────────────────────┬───────────────────────┘
                        │
                        ▼  (Menggunakan Shared Library)
               [ lib/auth.js Engine ]
                        │
       ┌────────────────┴────────────────┐
       ▼                                 ▼
[ Google Identity Toolkit ]    [ Alight Creative Cloud Functions ]
  - getOobConfirmationCode       - verifyPurchase
  - emailLinkSignin                (SKU: am.full.sub.annual.19q4)
  - getAccountInfo               - Google Play Order Signature
```

---

## Struktur Direktori

```
AM-premium/
├── bots/
│   ├── discord/               # Bot Discord (discord.js v14)
│   │   ├── bot.js             # Skrip utama Discord bot
│   │   ├── package.json       # Dependensi bot Discord
│   │   ├── .env.example       # Template konfigurasi token Discord
│   │   └── README.md          # Panduan khusus bot Discord
│   │
│   └── telegram/              # Bot Telegram (node-telegram-bot-api)
│       ├── bot.js             # Skrip utama Telegram bot
│       ├── package.json       # Dependensi bot Telegram
│       ├── .env.example       # Template konfigurasi token Telegram
│       └── README.md          # Panduan khusus bot Telegram
│
├── data/
│   └── stats.json             # Counter telemetri agregat (total & hari ini)
│
├── lib/
│   ├── auth.js                # Core reverse engineering & Google API relay
│   ├── errors.js              # Pemetaan pesan error teknis ke teks ramah
│   └── stats.js               # Pengelola counter telemetri persisten
│
├── public/                    # Frontend Web Portal (NoPixel V Design)
│   ├── index.html             # Halaman utama konsol aktivasi
│   ├── changelog.html         # Halaman riwayat pembaruan sistem (/changelog)
│   ├── terms.html             # Regulasi operasional & disclaimer (/terms)
│   ├── privacy.html           # Kebijakan transparansi zero-log (/privacy)
│   ├── css/
│   │   └── tactical.css       # Sistem desain taktis NoPixel, font, animasi
│   ├── images/                # Aset visual GTA VI, GTA V, dan NoPixel V
│   │   ├── nopixel_hero_keyart.webp
│   │   ├── gta6_hero_lucia_jason.jpg
│   │   ├── gta5_los_santos_city.jpg
│   │   └── gta_downtown_night.webp
│   └── js/
│       └── app.js             # Logika interaktif tab, switcher background, audio
│
├── server.js                  # Entry point server web Express.js
├── package.json               # Root dependencies
└── README.md                  # Dokumentasi utama proyek
```

---

## Panduan Instalasi & Menjalankan

### Persyaratan Sistem
- Node.js versi **18.x** atau **20.x / 22.x** ke atas.
- npm atau pnpm.

### Kloning Repositori
```bash
git clone https://github.com/username/motion-v.git
cd motion-v
```

---

### 1. Web Portal (Express Server)

Pasang dependensi root:
```bash
npm install
```

Jalankan server:
```bash
npm start
```
Buka peramban di `http://localhost:3300`.

---

### 2. Telegram Bot

1. Masuk ke folder bot Telegram:
   ```bash
   cd bots/telegram
   npm install
   ```
2. Buat file `.env` dari `.env.example`:
   ```bash
   cp .env.example .env
   ```
3. Isi token bot Telegram dari [@BotFather](https://t.me/BotFather):
   ```env
   TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrSTUvwxYZ
   ```
4. Jalankan bot:
   ```bash
   npm start
   ```

---

### 3. Discord Bot

1. Masuk ke folder bot Discord:
   ```bash
   cd bots/discord
   npm install
   ```
2. Buat file `.env` dari `.env.example`:
   ```bash
   cp .env.example .env
   ```
3. Isi kredensial bot dari [Discord Developer Portal](https://discord.com/developers/applications):
   ```env
   DISCORD_BOT_TOKEN=MTE5OTg4...YOUR_BOT_TOKEN
   DISCORD_CLIENT_ID=123456789012345678
   DISCORD_PREFIX=!
   ```
4. Jalankan bot:
   ```bash
   npm start
   ```

---

## Deployment via Cloudflare Tunnel

Jika Anda menjalankan proyek ini di **Home Server** atau VPS tanpa IP publik statis, **Cloudflare Tunnel (`cloudflared`)** adalah solusi terbaik:

1. Jalankan server web menggunakan PM2:
   ```bash
   npm install -g pm2
   pm2 start server.js --name "motion-v-web"
   ```
2. Arahkan Cloudflare Tunnel ke port lokal `3300`:
   ```yaml
   ingress:
     - hostname: am.domainanda.com
       service: http://localhost:3300
     - service: http_status:404
   ```
Website langsung aktif di domain Anda dengan sertifikat SSL/HTTPS otomatis dari Cloudflare.

---

## Dokumentasi REST API

Server web menyediakan API JSON publik yang dapat diintegrasikan dengan aplikasi lain:

### 1. `POST /api/send-link`
Mengirimkan tautan login sekali pakai ke alamat email pengguna.
```json
// Request Body
{
  "email": "creator@example.com"
}

// Response (200 OK)
{
  "success": true,
  "email": "creator@example.com",
  "message": "Tautan otentikasi telah dikirim..."
}
```

### 2. `POST /api/verify-link`
Memvalidasi parameter `oobCode` dan mengeksekusi aktivasi lisensi tahunan Alight Motion Pro.
```json
// Request Body
{
  "email": "creator@example.com",
  "magicLink": "https://alightcreative.com?ui_sid=...&oobCode=..."
}

// Response (200 OK)
{
  "success": true,
  "message": "Otentikasi berhasil. Lisensi Alight Motion VIP Annual telah aktif...",
  "data": {
    "uid": "FIREBASE_UID",
    "email": "creator@example.com",
    "status": "ACTIVE",
    "membershipStatus": "VIP_ANNUAL_ACTIVE",
    "planName": "Alight Motion Pro / VIP License",
    "orderId": "np-a1b2c3d4",
    "validUntil": "16 November 2027",
    "idToken": "eyJhbGciOiJSUzI1Ni..."
  }
}
```

### 3. `GET /api/stats`
Mengambil jumlah total aktivasi lisensi agregat.
```json
{
  "success": true,
  "data": {
    "total": 3842,
    "today": 42,
    "serverUptime": 18450,
    "status": "ONLINE"
  }
}
```

---

## Penyangkalan Hukum (Disclaimer)

1. Proyek ini dikembangkan **semata-mata untuk tujuan riset akademis, keamanan siber, dan studi rekayasa balik protokol otentikasi**.
2. Proyek ini **sama sekali tidak terafiliasi, tidak didukung, dan tidak memiliki hubungan kerja sama resmi** dengan **Alight Creative, Inc.** maupun **Google LLC**.
3. Segala bentuk merek dagang, nama produk, dan hak cipta Alight Motion merupakan hak milik eksklusif dari masing-masing pemegang hak cipta.
4. Penggunaan sistem ini sepenuhnya menjadi tanggung jawab dan risiko mandiri pengguna masing-masing.

---

## Kontributor & Pengembang

Dikembangkan dan dipelihara secara independen oleh:

**DIAWW.DEV**  
- Website: [https://diaww.my.id](https://diaww.my.id)  
- Portfolio & Projects: [diaww.my.id](https://diaww.my.id)

---

## Lisensi

Didistribusikan di bawah lisensi open source **MIT License**. Lihat berkas [LICENSE](LICENSE) untuk informasi lebih lanjut.
