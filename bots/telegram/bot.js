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
const tempmail = require('../../lib/tempmail')
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
          { text: '🚀 1-Click Auto VIP (@codai.site)', callback_data: 'action_autovip' },
          { text: '⚡ Aktivasi Manual', callback_data: 'action_start_activate' }
        ],
        [
          { text: '📬 Buat Temp Mail (@codai.site)', callback_data: 'action_tempmail' },
          { text: '📊 Telemetri', callback_data: 'action_stats' }
        ],
        [
          { text: '🌐 Buka mail.codai.site', url: 'https://mail.codai.site/' },
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
Selamat datang di terminal otomatisasi *MOTION V*. Bot ini terhubung langsung ke Google Identity Toolkit, Upstream Alight Creative Cloud Functions, dan layanan email sekali pakai resmi *CODAI MAIL* (https://mail.codai.site/).

*Perintah Utama:*
• \`/autovip\` — *1-Click Instant Activation* (Buat tempmail @codai.site, ambil link & aktifkan VIP tanpa repot!)
• \`/tempmail\` — Generate alamat email sementara @codai.site
• \`/activate\` — Panduan interaktif aktivasi akun (email pribadi)
• \`/send <email>\` — Kirim magic link login ke email
• \`/verify <email> <tautan>\` — Verifikasi link & aktifkan VIP
• \`/stats\` — Cek telemetri lisensi terverifikasi
• \`/status\` — Cek status gateway server
• \`/cancel\` — Batalkan sesi aktivasi berjalan

_Zero-log retention. Tanpa kata sandi akun._
`
  bot.sendMessage(chatId, welcomeText, { parse_mode: 'Markdown', ...getMainKeyboard() })
})

/**
 * Handler Command: /tempmail & /mail
 */
bot.onText(/\/(tempmail|mail)/, (msg) => {
  const chatId = msg.chat.id
  const mailData = tempmail.generateEmail()

  const mailText = `
📬 *CODAI DISPOSABLE MAIL GENERATED*
────────────────────────────
• *Alamat Email:* \`${mailData.email}\`
• *Domain:* \`@${mailData.domain}\`
• *Penyedia:* [mail.codai.site](https://mail.codai.site/)
────────────────────────────
Kotak masuk email ini dipantau secara realtime oleh API CODAI MAIL. Anda dapat langsung mengaktifkan VIP Alight Motion menggunakan email ini dalam 1-klik!
`

  const keyboard = {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '⚡ Auto-Aktifkan VIP dengan Email Ini', callback_data: `autovip_with_${mailData.email}` }
        ],
        [
          { text: '🔍 Cek Kotak Masuk (API)', callback_data: `checkmail_${mailData.email}` },
          { text: '🌐 Buka di mail.codai.site', url: 'https://mail.codai.site/' }
        ]
      ]
    }
  }

  bot.sendMessage(chatId, mailText, { parse_mode: 'Markdown', ...keyboard })
})

/**
 * Handler Command: /autovip (1-Click Automated Activation)
 */
bot.onText(/\/autovip/, async (msg) => {
  const chatId = msg.chat.id
  await runAutoVip(chatId)
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

_Ingin menggunakan email sementara tanpa registrasi? Tekan tombol di bawah:_
`
  const keyboard = {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '🚀 1-Click Auto VIP (@codai.site)', callback_data: 'action_autovip' },
          { text: '📬 Buat Temp Mail', callback_data: 'action_tempmail' }
        ],
        [
          { text: '❌ Batalkan Sesi', callback_data: 'action_cancel' },
          { text: '🌐 mail.codai.site', url: 'https://mail.codai.site/' }
        ]
      ]
    }
  }

  bot.sendMessage(chatId, promptText, { parse_mode: 'Markdown', ...keyboard })
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
  } else if (action === 'action_autovip') {
    await runAutoVip(chatId)
  } else if (action === 'action_tempmail') {
    const mailData = tempmail.generateEmail()
    const mailText = `
📬 *CODAI DISPOSABLE MAIL GENERATED*
────────────────────────────
• *Alamat Email:* \`${mailData.email}\`
• *Domain:* \`@${mailData.domain}\`
• *Portal Web:* [mail.codai.site](https://mail.codai.site/)
────────────────────────────
`
    const keyboard = {
      reply_markup: {
        inline_keyboard: [
          [{ text: '⚡ Auto-Aktifkan VIP dengan Email Ini', callback_data: `autovip_with_${mailData.email}` }],
          [{ text: '🔍 Cek Kotak Masuk (API)', callback_data: `checkmail_${mailData.email}` }],
          [{ text: '🌐 Buka mail.codai.site', url: 'https://mail.codai.site/' }]
        ]
      }
    }
    bot.sendMessage(chatId, mailText, { parse_mode: 'Markdown', ...keyboard })
  } else if (action === 'action_stats') {
    const stats = getStats()
    const statsText = `
*TELEMETRI SISTEM // MOTION V*
• *Total Lisensi Aktif:* \`${Number(stats.total).toLocaleString('id-ID')}\`
• *Aktivasi Hari Ini:* \`${Number(stats.today).toLocaleString('id-ID')}\`
• *Status:* \`ONLINE (200 OK)\`
`
    bot.sendMessage(chatId, statsText, { parse_mode: 'Markdown', ...getMainKeyboard() })
  } else if (action === 'action_cancel') {
    userStates.delete(chatId)
    bot.sendMessage(chatId, '✅ Sesi aktivasi telah dibatalkan.', getMainKeyboard())
  } else if (action.startsWith('autovip_with_')) {
    const targetEmail = action.replace('autovip_with_', '').trim()
    await runAutoVip(chatId, targetEmail)
  } else if (action.startsWith('poll_link_')) {
    const targetEmail = action.replace('poll_link_', '').trim()
    await pollAndVerifyForTelegram(chatId, targetEmail)
  } else if (action.startsWith('checkmail_')) {
    const targetEmail = action.replace('checkmail_', '').trim()
    const inbox = await tempmail.getInbox(targetEmail)
    if (!inbox.ok || inbox.count === 0) {
      return bot.sendMessage(
        chatId,
        `📭 Kotak masuk untuk \`${targetEmail}\` masih kosong.\nSilakan tunggu beberapa saat atau cek di [mail.codai.site](https://mail.codai.site/).`,
        { parse_mode: 'Markdown' }
      )
    }

    let inboxMsg = `📬 *KOTAK MASUK CODAI MAIL (${inbox.count} Pesan)*\n• Akun: \`${targetEmail}\`\n────────────────────────────\n`
    for (const msgItem of inbox.messages) {
      inboxMsg += `• *Dari:* ${msgItem.from || 'Alight Motion'}\n  *Subjek:* ${msgItem.subject || '-'}\n`
    }

    bot.sendMessage(chatId, inboxMsg, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '⚡ Ambil Tautan & Aktifkan VIP', callback_data: `poll_link_${targetEmail}` }],
          [{ text: '🌐 Buka di mail.codai.site', url: 'https://mail.codai.site/' }]
        ]
      }
    })
  }
})

/**
 * Helper: 1-Click Auto VIP Flow
 */
async function runAutoVip(chatId, specificEmail = null) {
  const mailData = specificEmail ? { email: specificEmail } : tempmail.generateEmail()
  const email = mailData.email

  const progressMsg = await bot.sendMessage(
    chatId,
    `🚀 *MOTION V // 1-CLICK AUTO VIP*\n────────────────────────────\n[1/4] Inisialisasi email disposable: \`${email}\`...`,
    { parse_mode: 'Markdown' }
  )

  // Step 2: Send Link
  await bot.editMessageText(
    `🚀 *MOTION V // 1-CLICK AUTO VIP*\n────────────────────────────\n✓ Email: \`${email}\`\n[2/4] Mengirimkan magic link otentikasi via Google Identity Toolkit...`,
    { chat_id: chatId, message_id: progressMsg.message_id, parse_mode: 'Markdown' }
  )

  const sendRes = await auth.sendMagicLink(email)
  if (!sendRes.ok) {
    const errMsg = friendlyFirebaseError(sendRes.error)
    return bot.editMessageText(
      `❌ *Auto-Aktivasi Gagal pada Step 2:*\n${errMsg}`,
      { chat_id: chatId, message_id: progressMsg.message_id, parse_mode: 'Markdown' }
    )
  }

  // Step 3: Poll Inbox
  await bot.editMessageText(
    `🚀 *MOTION V // 1-CLICK AUTO VIP*\n────────────────────────────\n✓ Magic link terkirim ke upstream.\n[3/4] Memantau kotak masuk CODAI MAIL API (Polling)...`,
    { chat_id: chatId, message_id: progressMsg.message_id, parse_mode: 'Markdown' }
  )

  const pollRes = await tempmail.pollForMagicLink(email, 75, 3)
  if (!pollRes.ok || !pollRes.link) {
    return bot.editMessageText(
      `⚠️ *Waktu Tunggu Habis (Timeout)*\nEmail verifikasi belum masuk ke kotak masuk \`${email}\`.\nAnda dapat memeriksa manual di [mail.codai.site](https://mail.codai.site/).`,
      {
        chat_id: chatId,
        message_id: progressMsg.message_id,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔄 Coba Pindai Ulang', callback_data: `poll_link_${email}` }],
            [{ text: '🌐 Buka mail.codai.site', url: 'https://mail.codai.site/' }]
          ]
        }
      }
    )
  }

  // Step 4: Verify & Activate
  await bot.editMessageText(
    `🚀 *MOTION V // 1-CLICK AUTO VIP*\n────────────────────────────\n✓ Tautan verifikasi ditemukan di inbox!\n[4/4] Melakukan handshake verifikasi ke verifyPurchase Cloud Function...`,
    { chat_id: chatId, message_id: progressMsg.message_id, parse_mode: 'Markdown' }
  )

  const magicLink = pollRes.oobCode || pollRes.link
  const verifyResult = await auth.verifyMagicLink(email, magicLink)
  if (!verifyResult.ok) {
    const errMsg = friendlyFirebaseError(verifyResult.error)
    return bot.editMessageText(
      `❌ *Auto-Aktivasi Gagal saat Verifikasi:*\n${errMsg}`,
      { chat_id: chatId, message_id: progressMsg.message_id, parse_mode: 'Markdown' }
    )
  }

  const premiumResult = await auth.activatePremium(verifyResult.idToken)
  if (premiumResult.ok) incrementStats()

  const now = new Date()
  const validUntil = new Date()
  validUntil.setFullYear(validUntil.getFullYear() + 1)
  const formattedDate = validUntil.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })

  const receiptText = `
🎉 *1-CLICK AUTO AKTIVASI BERHASIL!*
────────────────────────────
• *Status Lisensi:* \`PREMIUM_ACTIVE (ANNUAL VIP)\`
• *Email CODAI MAIL:* \`${email}\`
• *Firebase UID:* \`${verifyResult.uid || '-'}\`
• *Order ID Upstream:* \`${premiumResult.orderId || '-'}\`
• *Masa Berlaku:* \`${formattedDate} (1 Tahun)\`
• *Tipe Akun:* \`Alight Motion Pro / Member\`
────────────────────────────
*Sesi ID Token:*
\`${verifyResult.idToken}\`
────────────────────────────
_Akun Alight Motion VIP Anda telah aktif penuh. Gunakan email di atas untuk login ke aplikasi Alight Motion._

*Portal Email:* https://mail.codai.site
*Engineered by DIAWW.DEV* (https://diaww.my.id)
`

  await bot.editMessageText(receiptText, {
    chat_id: chatId,
    message_id: progressMsg.message_id,
    parse_mode: 'Markdown',
    ...getMainKeyboard()
  })
}

/**
 * Helper: Polling link and verify
 */
async function pollAndVerifyForTelegram(chatId, email) {
  const waitMsg = await bot.sendMessage(chatId, `🔍 _Memindai kotak masuk CODAI MAIL untuk_ \`${email}\`...`, { parse_mode: 'Markdown' })
  const pollRes = await tempmail.pollForMagicLink(email, 60, 3)

  if (!pollRes.ok || !pollRes.link) {
    return bot.editMessageText(
      `⚠️ Tautan verifikasi belum ditemukan di \`${email}\`.\nSilakan coba lagi beberapa saat atau periksa di [mail.codai.site](https://mail.codai.site/).`,
      { chat_id: chatId, message_id: waitMsg.message_id, parse_mode: 'Markdown' }
    )
  }

  await bot.editMessageText(`✓ Tautan ditemukan! Memproses aktivasi lisensi...`, { chat_id: chatId, message_id: waitMsg.message_id, parse_mode: 'Markdown' })
  await processVerifyLink(chatId, email, pollRes.oobCode || pollRes.link)
}

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

  const isCodai = email.includes('@codai.site') || email.includes('@daz.codai.site') || email.includes('@mkr.codai.site')

  let sendKeyboard = {}
  if (isCodai) {
    sendKeyboard = {
      reply_markup: {
        inline_keyboard: [
          [{ text: '⚡ Ambil Tautan Otomatis dari CODAI MAIL', callback_data: `poll_link_${email}` }],
          [{ text: '🌐 Buka mail.codai.site', url: 'https://mail.codai.site/' }]
        ]
      }
    }
  }

  await bot.editMessageText(successText, {
    chat_id: chatId,
    message_id: loadingMsg.message_id,
    parse_mode: 'Markdown',
    ...sendKeyboard
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
