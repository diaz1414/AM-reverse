/**
 * MOTION V // DISCORD BOT TERMINAL
 * Reverse Engineering & Alight Motion VIP Activator
 * Developed by DIAWW.DEV (https://diaww.my.id)
 */

require('dotenv').config()
const {
  Client,
  GatewayIntentBits,
  Partials,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  REST,
  Routes,
  SlashCommandBuilder
} = require('discord.js')

// Import core engine modules from root
const auth = require('../../lib/auth')
const { friendlyFirebaseError } = require('../../lib/errors')
const { getStats, incrementStats } = require('../../lib/stats')

const TOKEN = process.env.DISCORD_BOT_TOKEN
const CLIENT_ID = process.env.DISCORD_CLIENT_ID
const PREFIX = process.env.DISCORD_PREFIX || '!'

const BRAND_COLOR = 0x00f8b9 // Mint Green
const CYAN_COLOR = 0x40e5ff  // Electric Cyan
const ERROR_COLOR = 0xff4757 // Red

if (!TOKEN || TOKEN === 'YOUR_BOT_TOKEN') {
  console.error('[ERROR] DISCORD_BOT_TOKEN belum diset di file .env!')
  console.error('Silakan salin .env.example menjadi .env lalu masukkan token bot dari Discord Developer Portal.')
  process.exit(1)
}

// Inisialisasi Discord Client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ],
  partials: [Partials.Channel]
})

// Definisi Slash Commands
const commands = [
  new SlashCommandBuilder()
    .setName('sendlink')
    .setDescription('Kirim magic link otentikasi Alight Motion ke email Anda')
    .addStringOption(opt =>
      opt.setName('email')
        .setDescription('Alamat email akun Alight Motion')
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('verify')
    .setDescription('Verifikasi tautan login & aktifkan lisensi tahunan Alight Motion VIP')
    .addStringOption(opt =>
      opt.setName('email')
        .setDescription('Alamat email yang menerima magic link')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('link')
        .setDescription('Tautan verifikasi lengkap dari email atau kode oobCode')
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('stats')
    .setDescription('Tampilkan telemetri sistem dan total lisensi yang telah aktif'),

  new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Periksa latensi websocket bot dan status gateway'),

  new SlashCommandBuilder()
    .setName('help')
    .setDescription('Panduan penggunaan terminal bot MOTION V')
].map(c => c.toJSON())

// Registrasi Slash Commands ke Discord API saat bot siap
async function registerSlashCommands() {
  if (!CLIENT_ID) {
    console.warn('[WARN] DISCORD_CLIENT_ID tidak ditemukan. Slash commands dilewati.')
    return
  }
  const rest = new REST({ version: '10' }).setToken(TOKEN)
  try {
    console.log('[DISCORD] Mendaftarkan slash commands...')
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands })
    console.log('[DISCORD] Slash commands berhasil didaftarkan secara global.')
  } catch (err) {
    console.error('[DISCORD ERROR] Gagal mendaftarkan slash commands:', err.message)
  }
}

// Event: Ready
client.once('ready', async () => {
  console.log(`[BOT ONLINE] Masuk sebagai ${client.user.tag}`)
  console.log('[DEVELOPER] DIAWW.DEV (https://diaww.my.id)')

  client.user.setActivity('Alight Motion VIP // /help', { type: 3 })
  await registerSlashCommands()
})

// Helper: Tombol tautan developer
function getDeveloperButtons() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel('Web Portal')
      .setStyle(ButtonStyle.Link)
      .setURL('https://diaww.my.id'),
    new ButtonBuilder()
      .setLabel('Developer: DIAWW.DEV')
      .setStyle(ButtonStyle.Link)
      .setURL('https://diaww.my.id')
  )
}

// ==========================================
// 1. SLASH COMMANDS HANDLER
// ==========================================
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return

  const { commandName } = interaction

  // Command: /ping
  if (commandName === 'ping') {
    const sent = await interaction.reply({ content: '📡 Memeriksa koneksi gateway...', fetchReply: true })
    const latency = sent.createdTimestamp - interaction.createdTimestamp

    const embed = new EmbedBuilder()
      .setTitle('GATEWAY DIAGNOSTICS // PING')
      .setColor(CYAN_COLOR)
      .addFields(
        { name: 'Bot Latency', value: `\`${latency}ms\``, inline: true },
        { name: 'WebSocket Heartbeat', value: `\`${client.ws.ping}ms\``, inline: true },
        { name: 'Protokol', value: '`Dalvik 2.1 / Android 15`', inline: true }
      )
      .setFooter({ text: 'MOTION V // DEVELOPED BY DIAWW.DEV' })

    return interaction.editReply({ content: '', embeds: [embed], components: [getDeveloperButtons()] })
  }

  // Command: /stats
  if (commandName === 'stats') {
    const stats = getStats()
    const embed = new EmbedBuilder()
      .setTitle('TELEMETRI SISTEM // MOTION V')
      .setColor(BRAND_COLOR)
      .addFields(
        { name: 'Total Lisensi Aktif', value: `\`${Number(stats.total).toLocaleString('id-ID')}\``, inline: true },
        { name: 'Aktivasi Hari Ini', value: `\`${Number(stats.today).toLocaleString('id-ID')}\``, inline: true },
        { name: 'Gateway Uptime', value: `\`${stats.serverUptime}s\``, inline: true },
        { name: 'Signature Android', value: '`com.alightcreative.motion`', inline: false }
      )
      .setFooter({ text: 'MOTION V // DEVELOPED BY DIAWW.DEV' })

    return interaction.reply({ embeds: [embed], components: [getDeveloperButtons()] })
  }

  // Command: /help
  if (commandName === 'help') {
    const embed = new EmbedBuilder()
      .setTitle('TERMINAL PANDUAN // MOTION V')
      .setColor(BRAND_COLOR)
      .setDescription('Sistem otomatisasi protokol rekayasa balik Alight Motion via Firebase Auth.')
      .addFields(
        { name: '1. /sendlink <email>', value: 'Mengirimkan magic link login resmi ke email Anda.' },
        { name: '2. /verify <email> <link>', value: 'Memvalidasi link dan mengaktifkan lisensi VIP 1 tahun.' },
        { name: '3. /stats', value: 'Melihat jumlah total aktivasi lisensi.' },
        { name: '4. /ping', value: 'Memeriksa latensi respon bot.' }
      )
      .setFooter({ text: 'MOTION V // DEVELOPED BY DIAWW.DEV (https://diaww.my.id)' })

    return interaction.reply({ embeds: [embed], components: [getDeveloperButtons()] })
  }

  // Command: /sendlink
  if (commandName === 'sendlink') {
    const email = interaction.options.getString('email').trim().toLowerCase()
    if (!email.includes('@') || !email.includes('.')) {
      return interaction.reply({
        content: '⚠️ Format email tidak valid. Harap periksa kembali penulisan alamat email Anda.',
        ephemeral: true
      })
    }

    await interaction.deferReply()
    const result = await auth.sendMagicLink(email)

    if (!result.ok) {
      const errMsg = friendlyFirebaseError(result.error)
      const errEmbed = new EmbedBuilder()
        .setTitle('GAGAL MENGIRIM TAUTAN')
        .setColor(ERROR_COLOR)
        .setDescription(errMsg)
        .setFooter({ text: 'MOTION V' })

      return interaction.editReply({ embeds: [errEmbed] })
    }

    const embed = new EmbedBuilder()
      .setTitle('TAUTAN OTENTIKASI TERKIRIM')
      .setColor(BRAND_COLOR)
      .setDescription(`Tautan sekali pakai telah dikirimkan ke \`${email}\`.\nPeriksa folder **Inbox** atau **Spam** email Anda.`)
      .addFields(
        { name: 'Langkah Selanjutnya', value: 'Salin tautan dari email, lalu jalankan perintah:\n`/verify email:' + email + ' link:<tautan_anda>`' }
      )
      .setFooter({ text: 'MOTION V // ZERO-LOG PROTOCOL' })

    return interaction.editReply({ embeds: [embed] })
  }

  // Command: /verify
  if (commandName === 'verify') {
    const email = interaction.options.getString('email').trim().toLowerCase()
    const link = interaction.options.getString('link').trim()

    await interaction.deferReply()

    const verifyResult = await auth.verifyMagicLink(email, link)
    if (!verifyResult.ok) {
      const errMsg = friendlyFirebaseError(verifyResult.error)
      const errEmbed = new EmbedBuilder()
        .setTitle('VERIFIKASI GAGAL')
        .setColor(ERROR_COLOR)
        .setDescription(errMsg)
        .setFooter({ text: 'Pastikan menempelkan seluruh tautan atau kode oobCode secara utuh.' })

      return interaction.editReply({ embeds: [errEmbed] })
    }

    // Panggil verifyPurchase
    const premiumResult = await auth.activatePremium(verifyResult.idToken)
    if (premiumResult.ok) incrementStats()

    const now = new Date()
    const validUntil = new Date()
    validUntil.setFullYear(validUntil.getFullYear() + 1)
    const formattedDate = validUntil.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })

    const embed = new EmbedBuilder()
      .setTitle('🎉 LISENSI ALIGHT MOTION VIP AKTIF!')
      .setColor(BRAND_COLOR)
      .addFields(
        { name: 'Status Lisensi', value: '`PREMIUM_ACTIVE (ANNUAL)`', inline: true },
        { name: 'Email Akun', value: `\`${email}\``, inline: true },
        { name: 'Masa Berlaku', value: `\`${formattedDate} (1 Tahun)\``, inline: true },
        { name: 'Firebase UID', value: `\`${verifyResult.uid || '-'}\``, inline: false },
        { name: 'Order ID Transaksi', value: `\`${premiumResult.orderId || '-'}\``, inline: true },
        { name: 'ID Token (JWT)', value: `\`${verifyResult.idToken.slice(0, 80)}...\``, inline: false }
      )
      .setFooter({ text: 'MOTION V // DEVELOPED BY DIAWW.DEV (https://diaww.my.id)' })

    return interaction.editReply({ embeds: [embed], components: [getDeveloperButtons()] })
  }
})

// ==========================================
// 2. TEXT PREFIX COMMANDS HANDLER (!send, !verify, !stats, !ping)
// ==========================================
client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.content.startsWith(PREFIX)) return

  const args = message.content.slice(PREFIX.length).trim().split(/ +/)
  const command = args.shift().toLowerCase()

  // Command: !ping
  if (command === 'ping') {
    const embed = new EmbedBuilder()
      .setTitle('PING // GATEWAY')
      .setColor(CYAN_COLOR)
      .setDescription(`🏓 Latensi WebSocket: \`${client.ws.ping}ms\``)
      .setFooter({ text: 'MOTION V // DIAWW.DEV' })
    return message.reply({ embeds: [embed] })
  }

  // Command: !stats
  if (command === 'stats') {
    const stats = getStats()
    const embed = new EmbedBuilder()
      .setTitle('TELEMETRI SISTEM // MOTION V')
      .setColor(BRAND_COLOR)
      .addFields(
        { name: 'Total Lisensi', value: `\`${Number(stats.total).toLocaleString('id-ID')}\``, inline: true },
        { name: 'Hari Ini', value: `\`${Number(stats.today).toLocaleString('id-ID')}\``, inline: true }
      )
      .setFooter({ text: 'MOTION V // DEVELOPED BY DIAWW.DEV' })
    return message.reply({ embeds: [embed], components: [getDeveloperButtons()] })
  }

  // Command: !send <email>
  if (command === 'send') {
    const email = args[0] ? args[0].trim().toLowerCase() : null
    if (!email || !email.includes('@') || !email.includes('.')) {
      return message.reply('⚠️ Format: `!send nama@email.com`')
    }

    const waitMsg = await message.reply('⏳ Mengirimkan tautan otentikasi...')
    const result = await auth.sendMagicLink(email)

    if (!result.ok) {
      return waitMsg.edit(`❌ Gagal: ${friendlyFirebaseError(result.error)}`)
    }

    return waitMsg.edit(`✅ Tautan login telah dikirim ke \`${email}\`. Cek inbox/spam, lalu salin tautan verifikasi.`)
  }

  // Command: !verify <email> <link>
  if (command === 'verify') {
    const email = args[0] ? args[0].trim().toLowerCase() : null
    const link = args[1] ? args.slice(1).join(' ').trim() : null

    if (!email || !link) {
      return message.reply('⚠️ Format: `!verify nama@email.com <tautan_atau_oobCode>`')
    }

    const waitMsg = await message.reply('⏳ Memproses verifikasi & aktivasi lisensi...')
    const verifyResult = await auth.verifyMagicLink(email, link)

    if (!verifyResult.ok) {
      return waitMsg.edit(`❌ Verifikasi Gagal: ${friendlyFirebaseError(verifyResult.error)}`)
    }

    const premiumResult = await auth.activatePremium(verifyResult.idToken)
    if (premiumResult.ok) incrementStats()

    const embed = new EmbedBuilder()
      .setTitle('🎉 LISENSI ALIGHT MOTION VIP AKTIF!')
      .setColor(BRAND_COLOR)
      .addFields(
        { name: 'Email Akun', value: `\`${email}\``, inline: true },
        { name: 'Order ID', value: `\`${premiumResult.orderId || '-'}\``, inline: true },
        { name: 'Masa Berlaku', value: '`1 Tahun (Annual VIP)`', inline: true }
      )
      .setFooter({ text: 'MOTION V // DEVELOPED BY DIAWW.DEV' })

    return waitMsg.edit({ content: '', embeds: [embed] })
  }
})

// Login bot ke Discord
client.login(TOKEN)
