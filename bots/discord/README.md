# MOTION V — Discord Bot Interface

Antarmuka bot Discord resmi untuk sistem aktivasi otomatis lisensi Alight Motion VIP (**MOTION V**).

---

## Fitur Utama

- **🚀 1-Click Auto VIP (`/autovip` & `!autovip`):** Automasi end-to-end tanpa email pribadi. Membuat email disposable `@codai.site`, mengirim magic link, memantau inbox via polling API CODAI MAIL, dan langsung mengaktifkan VIP Annual!
- **📬 Integrasi Resmi CODAI MAIL (`/tempmail` & `!tempmail`):** Buat alamat email disposable `@codai.site` resmi via [mail.codai.site](https://mail.codai.site/) lengkap dengan interactive buttons untuk cek inbox dan auto-aktivasi.
- **Slash Commands Modern:** Mendukung `/autovip`, `/tempmail`, `/sendlink`, `/verify`, `/stats`, `/ping`, dan `/help`.
- **Legacy Prefix Commands:** Mendukung perintah teks tradisional seperti `!autovip`, `!tempmail`, `!send`, `!verify`, `!stats`, dan `!ping`.
- **Tampilan Dark Tactical NoPixel:** Output embed menggunakan palet resmi NoPixel V (Mint Green `0x00F8B9` & Electric Cyan `0x40E5FF`).
- **Keamanan Token Ephemeral:** Respon token JWT sesi ditampilkan secara aman dan terenkripsi.
- **Zero Credentials Saved:** Tidak ada data akun atau token yang disimpan ke disk.

---

## Cara Instalasi & Menjalankan

### 1. Buat Aplikasi di Discord Developer Portal
1. Buka [Discord Developer Portal](https://discord.com/developers/applications).
2. Klik **New Application**, beri nama (misal: `MOTION V`).
3. Masuk ke tab **Bot**:
   - Klik **Reset Token** dan simpan token tersebut.
   - Aktifkan opsi **Message Content Intent** di bagian *Privileged Gateway Intents*.
4. Masuk ke tab **OAuth2 -> URL Generator**:
   - Beri centang pada scope: `bot` dan `applications.commands`.
   - Beri centang pada permissions: `Send Messages`, `Embed Links`, `Read Message History`.
   - Buka link URL yang dihasilkan di peramban untuk mengundang bot ke server Discord Anda.

### 2. Konfigurasi Lingkungan (.env)
Masuk ke folder `bots/discord`:

```bash
cd bots/discord
```

Salin file `.env.example` menjadi `.env`:

```bash
cp .env.example .env
```

Buka file `.env` dan masukkan kredensial bot Anda:

```env
DISCORD_BOT_TOKEN=MTE5OTg4...YOUR_BOT_TOKEN
DISCORD_CLIENT_ID=123456789012345678
DISCORD_PREFIX=!
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
pm2 start bot.js --name "motion-v-discord"
```

---

## Daftar Perintah Bot

### Slash Commands:
| Command | Deskripsi |
| :--- | :--- |
| `/sendlink email:<email>` | Mengirimkan magic link login resmi ke email Anda |
| `/verify email:<email> link:<link>` | Memvalidasi link dan mengaktifkan lisensi VIP 1 tahun |
| `/stats` | Melihat jumlah total dan aktivasi lisensi hari ini |
| `/ping` | Memeriksa latensi respon bot dan status gateway |
| `/help` | Menampilkan ringkasan panduan penggunaan |

### Prefix Commands:
| Command | Contoh Penggunaan |
| :--- | :--- |
| `!send <email>` | `!send user@gmail.com` |
| `!verify <email> <link>` | `!verify user@gmail.com https://alightcreative.com?...` |
| `!stats` | `!stats` |
| `!ping` | `!ping` |

---

## Pengembang

Dikembangkan oleh **[DIAWW.DEV](https://diaww.my.id)**.
Lisensi Open Source: MIT.
