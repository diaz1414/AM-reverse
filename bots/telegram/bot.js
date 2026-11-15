/**
 * MOTION V // TELEGRAM BOT TERMINAL
 * Reverse Engineering & Alight Motion VIP Activator
 * Developed by DIAWW.DEV (https://diaww.my.id)
 */

require('dotenv').config()
const TelegramBot = require('node-telegram-bot-api')
const path = require('path')

// Import core engine modules from root
const auth = require('../../lib/auth')
const { friendlyFirebaseError } = require('../../lib/errors')
const { getStats, incrementStats } = require('../../lib/stats')

const TOKEN = process.env.TELEGRAM_BOT_TOKEN

if (!TOKEN || TOKEN === 'YOUR_TELEGRAM_BOT_TOKEN_HERE') {
  console.error('[ERROR] TELEGRAM_BOT_TOKEN belum diset di file .env!')
  console.error('Silakan salin .env.example menjadi .env lalu masukkan token dari @BotFather.')
  process.exit(1)
}

// Inisialisasi bot dengan long polling
const bot = new TelegramBot(TOKEN, { polling: true })

// State management untuk alur interaktif multi-step
// Key: chatId, Value: { step: 'AWAITING_EMAIL' | 'AWAITING_LINK', email: string }
const userStates = new Map()

console.log('[BOT ONLINE] MOTION V Telegram Bot siap melayani.')
console.log('[DEVELOPER] DIAWW.DEV (https://diaww.my.id)')

/**
 * Menu Utama Keyboard Inline
 */
function getMainKeyboard() {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '⚡ Mulai Aktivasi VIP', callback_data: 'action_start_activate' },
          { text: '📊 Telemetri Sistem', callback_data: 'action_stats' }
        ],
        [
          { text: '🌐 Kunjungi Web Portal', url: 'https://diaww.my.id' },
          { text: '👨‍💻 Developer (DIAWW.DEV)', url: 'https://diaww.my.id' }
        ]
      ]
    }
  }
}

/**
 * Handler Command: /start & /help
 */
bot.onText(/\/(start|help)/, (msg) => {
  const chatId = msg.chat.id
  userStates.delete(chatId)

  const welcomeText = `
*MOTION V // TELEGRAM TERMINAL*
_Alight Motion VIP Activation Protocol Engine_
────────────────────────────
Selamat datang di terminal otomatisasi *MOTION V*. Bot ini berinteraksi langsung dengan Google Identity Toolkit & Alight Creative Cloud Functions.

*Perintah yang Tersedia:*
• \`/activate\` — Mulai panduan interaktif aktivasi akun
• \`/send <email>\` — Kirim magic link login ke email
• \`/verify <email> <tautan>\` — Verifikasi link & aktifkan VIP
• \`/stats\` — Cek total lisensi terverifikasi
• \`/status\` — Cek status gateway server
• \`/cancel\` — Batalkan sesi aktivasi berjalan

_Zero-log retention. Tanpa kata sandi akun._
`
  bot.sendMessage(chatId, welcomeText, { parse_mode: 'Markdown', ...getMainKeyboard() })
})

/**
 * Handler Command: /activate (Alur Interaktif)
 */
bot.onText(/\/activate/, (msg) => {
  const chatId = msg.chat.id
  userStates.set(chatId, { step: 'AWAITING_EMAIL' })

  const promptText = `
*TAHAP 01 : INPUT EMAIL AKUN*
────────────────────────────
Silakan kirimkan alamat email akun Alight Motion Anda.
Contoh: \`pengguna@gmail.com\`

_Ketik /cancel kapan saja untuk membatalkan._
`
  bot.sendMessage(chatId, promptText, { parse_mode: 'Markdown' })
})

/**
 * Handler Command: /cancel
 */
bot.onText(/\/cancel/, (msg) => {
  const chatId = msg.chat.id
  userStates.delete(chatId)
  bot.sendMessage(chatId, '✅ Sesi aktivasi telah dibatalkan.', getMainKeyboard())
})

/**
 * Handler Command: /send <email>
 */
bot.onText(/\/send(?:\s+(.+))?/, async (msg, match) => {
  const chatId = msg.chat.id
  const emailInput = match[1] ? match[1].trim().toLowerCase() : null

  if (!emailInput || !emailInput.includes('@') || !emailInput.includes('.')) {
    return bot.sendMessage(
      chatId,
      '⚠️ *Format salah!*\nGunakan format: `/send nama@email.com`',
      { parse_mode: 'Markdown' }
    )
  }

  await processSendLink(chatId, emailInput)
})

/**
 * Handler Command: /verify <email> <link>
 */
bot.onText(/\/verify(?:\s+(\S+)\s+(.+))?/, async (msg, match) => {
  const chatId = msg.chat.id
  const email = match[1] ? match[1].trim().toLowerCase() : null
  const linkOrCode = match[2] ? match[2].trim() : null

  if (!email || !linkOrCode) {
    return bot.sendMessage(
      chatId,
      '⚠️ *Format salah!*\nGunakan format:\n`/verify nama@email.com <link_atau_oobCode>`',
      { parse_mode: 'Markdown' }
    )
  }

  await processVerifyLink(chatId, email, linkOrCode)
})

/**
 * Handler Command: /stats
 */
bot.onText(/\/stats/, (msg) => {
  const chatId = msg.chat.id
  const stats = getStats()

  const statsText = `
*TELEMETRI SISTEM // MOTION V*
────────────────────────────
• *Total Lisensi Aktif:* \`${Number(stats.total).toLocaleString('id-ID')}\`
• *Aktivasi Hari Ini:* \`${Number(stats.today).toLocaleString('id-ID')}\`
• *Server Uptime:* \`${stats.serverUptime} detik\`
• *Gateway Gateway:* \`ONLINE (200 OK)\`
• *Protokol:* \`Dalvik 2.1 / Android 15\`
────────────────────────────
_Engineered by DIAWW.DEV (https://diaww.my.id)_
`
  bot.sendMessage(chatId, statsText, { parse_mode: 'Markdown', ...getMainKeyboard() })
})

/**
 * Handler Command: /status /ping
 */
bot.onText(/\/(status|ping)/, (msg) => {
  const chatId = msg.chat.id
  const start = Date.now()

  bot.sendMessage(chatId, '📡 Melakukan handshake ke gateway...').then((sentMsg) => {
    const latency = Date.now() - start
    const pingText = `
*GATEWAY DIAGNOSTICS*
────────────────────────────
• *Status:* \`OPERATIONAL\`
• *Node:* \`ID-CGK-01\`
• *Latensi Bot:* \`${latency}ms\`
• *Dalvik Fingerprint:* \`VALIDATED (bp1a.250505)\`
`
    bot.editMessageText(pingText, {
      chat_id: chatId,
      message_id: sentMsg.message_id,
      parse_mode: 'Markdown'
    })
  })
})

/**
 * Handler Callback Query (Tombol Menu)
 */
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id
  const action = query.data

  await bot.answerCallbackQuery(query.id)

  if (action === 'action_start_activate') {
    userStates.set(chatId, { step: 'AWAITING_EMAIL' })
    bot.sendMessage(
      chatId,
      '*TAHAP 01 : INPUT EMAIL*\nSilakan kirimkan alamat email akun Alight Motion Anda:',
      { parse_mode: 'Markdown' }
    )
  } else if (action === 'action_stats') {
    const stats = getStats()
    const statsText = `
*TELEMETRI SISTEM // MOTION V*
• *Total Lisensi Aktif:* \`${Number(stats.total).toLocaleString('id-ID')}\`
• *Aktivasi Hari Ini:* \`${Number(stats.today).toLocaleString('id-ID')}\`
• *Status:* \`ONLINE (200 OK)\`
`
    bot.sendMessage(chatId, statsText, { parse_mode: 'Markdown', ...getMainKeyboard() })
  }
})

/**
 * Handler Pesan Teks Umum (Mendukung Alur Multi-Step)
 */
bot.on('message', async (msg) => {
  const chatId = msg.chat.id
  const text = msg.text ? msg.text.trim() : ''

  // Abaikan jika berupa command yang sudah dihandle di atas
  if (!text || text.startsWith('/')) return

  const state = userStates.get(chatId)
  if (!state) return

  // STEP 1: Input Email
  if (state.step === 'AWAITING_EMAIL') {
    const cleanEmail = text.toLowerCase()
    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return bot.sendMessage(
        chatId,
        '⚠️ Alamat email tidak valid. Harap periksa kembali dan kirim ulang:'
      )
    }

    userStates.delete(chatId)
    await processSendLink(chatId, cleanEmail, true)
  }
  // STEP 2: Input Magic Link
  else if (state.step === 'AWAITING_LINK') {
    const email = state.email
    userStates.delete(chatId)
    await processVerifyLink(chatId, email, text)
  }
})

/**
 * Helper: Eksekusi Pengiriman Magic Link
 */
async function processSendLink(chatId, email, continueFlow = false) {
  const loadingMsg = await bot.sendMessage(
    chatId,
    `⏳ _Menghubungkan ke Google Identity Toolkit untuk mengirimkan tautan ke_ \`${email}\`...`,
    { parse_mode: 'Markdown' }
  )

  const result = await auth.sendMagicLink(email)

  if (!result.ok) {
    const errMsg = friendlyFirebaseError(result.error)
    return bot.editMessageText(
      `❌ *Gagal Mengirim Tautan:*\n${errMsg}`,
      {
        chat_id: chatId,
        message_id: loadingMsg.message_id,
        parse_mode: 'Markdown'
      }
    )
  }

  const successText = `
*TAUTAN TERKIRIM // STEP 01 SUKSES*
────────────────────────────
Tautan otentikasi telah dikirimkan ke \`${email}\`.
Silakan periksa folder *Kotak Masuk* atau *Spam* email Anda.

Salin tautan dari email Alight Motion tersebut, lalu tempelkan (paste) langsung ke chat ini.
`

  await bot.editMessageText(successText, {
    chat_id: chatId,
    message_id: loadingMsg.message_id,
    parse_mode: 'Markdown'
  })

  // Simpan state untuk menunggu link verifikasi
  userStates.set(chatId, { step: 'AWAITING_LINK', email: email })
}

/**
 * Helper: Eksekusi Verifikasi & Aktivasi Lisensi
 */
async function processVerifyLink(chatId, email, rawLink) {
  const loadingMsg = await bot.sendMessage(
    chatId,
    '⏳ _Memproses dekode oobCode & verifikasi lisensi upstream..._',
    { parse_mode: 'Markdown' }
  )

  const verifyResult = await auth.verifyMagicLink(email, rawLink)

  if (!verifyResult.ok) {
    const errMsg = friendlyFirebaseError(verifyResult.error)
    return bot.editMessageText(
      `❌ *Otentikasi Gagal:*\n${errMsg}\n\n_Pastikan Anda menyalin seluruh tautan atau kode oobCode secara utuh._`,
      {
        chat_id: chatId,
        message_id: loadingMsg.message_id,
        parse_mode: 'Markdown'
      }
    )
  }

  // Panggil Cloud Functions verifyPurchase
  const premiumResult = await auth.activatePremium(verifyResult.idToken)
  if (premiumResult.ok) incrementStats()

  const now = new Date()
  const validUntil = new Date()
  validUntil.setFullYear(validUntil.getFullYear() + 1)
  const formattedDate = validUntil.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })

  const receiptText = `
🎉 *LISENSI ALIGHT MOTION VIP AKTIF!*
────────────────────────────
• *Status:* \`PREMIUM_ACTIVE (ANNUAL)\`
• *Email:* \`${email}\`
• *Firebase UID:* \`${verifyResult.uid || '-'}\`
• *Order ID:* \`${premiumResult.orderId || '-'}\`
• *Masa Berlaku:* \`${formattedDate} (1 Tahun)\`
• *Tipe Akun:* \`Alight Motion Pro / Member\`
────────────────────────────
*Sesi ID Token:*
\`${verifyResult.idToken}\`
────────────────────────────
_Silakan buka aplikasi Alight Motion di perangkat Anda dan login menggunakan email tersebut. Status VIP akan aktif otomatis._

*Engineered by DIAWW.DEV* (https://diaww.my.id)
`

  await bot.editMessageText(receiptText, {
    chat_id: chatId,
    message_id: loadingMsg.message_id,
    parse_mode: 'Markdown',
    ...getMainKeyboard()
  })
}

// Global error handlers agar bot tidak crash tiba-tiba
bot.on('polling_error', (error) => {
  console.warn('[POLLING ERROR]', error.message || error)
})
