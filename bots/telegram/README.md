# MOTION V — Telegram Bot Interface

Antarmuka bot Telegram untuk sistem aktivasi otomatis lisensi Alight Motion VIP (**MOTION V**).

---

## Fitur Utama

- **Alur Interaktif Wizard:** Cukup ketik `/activate`, bot akan memandu input email dan penempelan tautan masuk secara otomatis.
- **Perintah Cepat Direct:** Mendukung perintah direct `/send <email>` dan `/verify <email> <tautan>`.
- **Integrasi Penuh Engine:** Terhubung langsung ke modul `lib/auth.js` (Firebase Identity Toolkit & Upstream Cloud Functions).
- **Telemetri Sistem:** Pengecekan status gateway, latensi, dan jumlah total aktivasi harian melalui `/stats`.
- **Zero Credentials Saved:** Tidak ada data akun atau token yang disimpan ke disk.

---

## Cara Instalasi & Menjalankan

### 1. Buat Bot di Telegram
1. Buka Telegram dan cari **[@BotFather](https://t.me/BotFather)**.
2. Kirim perintah `/newbot` dan ikuti instruksi untuk menentukan nama serta username bot Anda.
3. Simpan **HTTP API Token** yang diberikan oleh BotFather.

### 2. Konfigurasi Lingkungan (.env)
Masuk ke folder `bots/telegram`:

```bash
cd bots/telegram
```

Salin file `.env.example` menjadi `.env`:

```bash
cp .env.example .env
```

Buka file `.env` dan masukkan token bot Anda:

```env
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrSTUvwxYZ
```

### 3. Pasang Dependensi
```bash
npm install
```

### 4. Jalankan Bot
```bash
npm start
```

Atau menggunakan PM2 agar berjalan di background:
```bash
pm2 start bot.js --name "motion-v-telegram"
```

---

## Daftar Perintah Bot

| Perintah | Deskripsi |
| :--- | :--- |
| `/start` atau `/help` | Menampilkan menu utama dan tombol interaktif |
| `/activate` | Memulai alur interaktif dua langkah (Email -> Link) |
| `/send <email>` | Mengirimkan magic link login langsung ke alamat email |
| `/verify <email> <link>` | Melakukan verifikasi dan aktivasi lisensi tahunan |
| `/stats` | Menampilkan jumlah total dan aktivasi lisensi hari ini |
| `/ping` atau `/status` | Melakukan tes latensi bot dan koneksi gateway |
| `/cancel` | Membatalkan sesi aktivasi yang sedang berjalan |

---

## Pengembang

Dikembangkan oleh **[DIAWW.DEV](https://diaww.my.id)**.
Lisensi Open Source: MIT.
