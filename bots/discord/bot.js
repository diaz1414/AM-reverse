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
const tempmail = require('../../lib/tempmail')
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
    .setName('autovip')
    .setDescription('1-Click Full Auto: Buat tempmail @codai.site, ambil link & aktifkan VIP Alight Motion'),

  new SlashCommandBuilder()
    .setName('tempmail')
    .setDescription('Generate alamat disposable email @codai.site resmi dari CODAI MAIL (https://mail.codai.site)'),

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

// Helper: Action rows tombol interaktif & developer
function getQuickActionRows() {
  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('btn_quick_autovip')
      .setLabel('🚀 1-Click Auto VIP')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId('btn_quick_tempmail')
      .setLabel('📬 Temp Mail (@codai.site)')
      .setStyle(ButtonStyle.Primary)
  )

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel('Buka mail.codai.site')
      .setStyle(ButtonStyle.Link)
      .setURL('https://mail.codai.site/'),
    new ButtonBuilder()
      .setLabel('DEV: DIAWW.DEV')
      .setStyle(ButtonStyle.Link)
      .setURL('https://diaww.my.id')
  )

  return [row1, row2]
}

function getDeveloperButtons() {
  return getQuickActionRows()
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
      .setDescription('Sistem otomatisasi protokol rekayasa balik Alight Motion via Firebase Auth & CODAI MAIL.')
      .addFields(
        { name: '1. /autovip', value: '🚀 **1-Click Auto VIP**: Buat email @codai.site, ambil link & aktifkan VIP tanpa repot.' },
        { name: '2. /tempmail', value: '📬 Generate email sementara resmi @codai.site (https://mail.codai.site).' },
        { name: '3. /sendlink <email>', value: 'Mengirimkan magic link login resmi ke email Anda.' },
        { name: '4. /verify <email> <link>', value: 'Memvalidasi link dan mengaktifkan lisensi VIP 1 tahun.' },
        { name: '5. /stats & /ping', value: 'Melihat telemetri aktivasi & latensi bot.' }
      )
      .setFooter({ text: 'MOTION V // DEVELOPED BY DIAWW.DEV (https://diaww.my.id)' })

    return interaction.reply({ embeds: [embed], components: [getDeveloperButtons()] })
  }

  // Command: /tempmail
  if (commandName === 'tempmail') {
    const mailData = tempmail.generateEmail()
    const embed = new EmbedBuilder()
      .setTitle('📬 CODAI DISPOSABLE MAIL GENERATED')
      .setColor(BRAND_COLOR)
      .setDescription('Alamat email sementara resmi via [mail.codai.site](https://mail.codai.site/).')
      .addFields(
        { name: 'Alamat Email', value: `\`${mailData.email}\``, inline: true },
        { name: 'Domain', value: `\`@${mailData.domain}\``, inline: true },
        { name: 'Infrastruktur', value: '`CODAI MAIL API (api-mail.codai.site)`', inline: false }
      )
      .setFooter({ text: 'MOTION V // ZERO-LOG PROTOCOL' })

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`btn_autovip_${mailData.email}`)
        .setLabel('🚀 1-Click Auto VIP')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(`btn_checkmail_${mailData.email}`)
        .setLabel('📬 Cek Inbox API')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setLabel('Buka mail.codai.site')
        .setStyle(ButtonStyle.Link)
        .setURL('https://mail.codai.site/')
    )

    return interaction.reply({ embeds: [embed], components: [row] })
  }

  // Command: /autovip
  if (commandName === 'autovip') {
    await interaction.deferReply()
    return runDiscordAutoVip(interaction, null, false)
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

    const isCodai = email.includes('@codai.site') || email.includes('@daz.codai.site') || email.includes('@mkr.codai.site')
    const components = []

    if (isCodai) {
      components.push(
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`btn_polllink_${email}`)
            .setLabel('⚡ Ambil Link Otomatis dari CODAI')
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setLabel('Buka mail.codai.site')
            .setStyle(ButtonStyle.Link)
            .setURL('https://mail.codai.site/')
        )
      )
    }

    return interaction.editReply({ embeds: [embed], components: components })
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

  // ==========================================
  // BUTTON INTERACTIONS HANDLER
  // ==========================================
  if (interaction.isButton()) {
    const customId = interaction.customId

    if (customId === 'btn_quick_autovip') {
      await interaction.deferReply()
      return runDiscordAutoVip(interaction, null, false)
    }

    if (customId === 'btn_quick_tempmail') {
      const mailData = tempmail.generateEmail()
      const embed = new EmbedBuilder()
        .setTitle('📬 CODAI DISPOSABLE MAIL GENERATED')
        .setColor(BRAND_COLOR)
        .setDescription('Alamat email sementara resmi via [mail.codai.site](https://mail.codai.site/).')
        .addFields(
          { name: 'Alamat Email', value: `\`${mailData.email}\``, inline: true },
          { name: 'Domain', value: `\`@${mailData.domain}\``, inline: true },
          { name: 'Infrastruktur', value: '`CODAI MAIL API (api-mail.codai.site)`', inline: false }
        )
        .setFooter({ text: 'MOTION V // ZERO-LOG PROTOCOL' })

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`btn_autovip_${mailData.email}`)
          .setLabel('🚀 1-Click Auto VIP')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(`btn_checkmail_${mailData.email}`)
          .setLabel('📬 Cek Inbox API')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setLabel('Buka mail.codai.site')
          .setStyle(ButtonStyle.Link)
          .setURL('https://mail.codai.site/')
      )

      return interaction.reply({ embeds: [embed], components: [row] })
    }

    if (customId.startsWith('btn_autovip_')) {
      const email = customId.replace('btn_autovip_', '')
      await interaction.deferReply()
      return runDiscordAutoVip(interaction, email, false)
    }

    if (customId.startsWith('btn_checkmail_')) {
      const email = customId.replace('btn_checkmail_', '')
      await interaction.deferReply({ ephemeral: true })
      const inbox = await tempmail.getInbox(email)
      if (!inbox.ok || inbox.count === 0) {
        return interaction.editReply(`📭 Kotak masuk \`${email}\` masih kosong. Silakan periksa kembali beberapa saat lagi.`)
      }
      let summary = `📬 **Kotak Masuk CODAI MAIL (${inbox.count} Pesan)** untuk \`${email}\`:\n`
      for (const m of inbox.messages) {
        summary += `• Dari: **${m.from || 'Alight Motion'}** | Subjek: *${m.subject || '-'}*\n`
      }
      return interaction.editReply(summary)
    }

    if (customId.startsWith('btn_polllink_')) {
      const email = customId.replace('btn_polllink_', '')
      await interaction.deferReply()
      const pollRes = await tempmail.pollForMagicLink(email, 60, 3)
      if (!pollRes.ok || !pollRes.link) {
        return interaction.editReply(`⚠️ Belum ada tautan masuk untuk \`${email}\`. Anda dapat memeriksa di https://mail.codai.site/`)
      }
      const magicLink = pollRes.oobCode || pollRes.link
      const verifyResult = await auth.verifyMagicLink(email, magicLink)
      if (!verifyResult.ok) {
        return interaction.editReply(`❌ Verifikasi Gagal: ${friendlyFirebaseError(verifyResult.error)}`)
      }
      const prem = await auth.activatePremium(verifyResult.idToken)
      if (prem.ok) incrementStats()

      const now = new Date()
      const validUntil = new Date()
      validUntil.setFullYear(validUntil.getFullYear() + 1)
      const formattedDate = validUntil.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })

      const finalEmbed = new EmbedBuilder()
        .setTitle('🎉 LISENSI ALIGHT MOTION VIP AKTIF!')
        .setColor(BRAND_COLOR)
        .addFields(
          { name: 'Status Lisensi', value: '`PREMIUM_ACTIVE (ANNUAL VIP)`', inline: true },
          { name: 'Email Akun', value: `\`${email}\``, inline: true },
          { name: 'Masa Berlaku', value: `\`${formattedDate} (1 Tahun)\``, inline: true },
          { name: 'Order ID', value: `\`${prem.orderId || '-'}\``, inline: true }
        )
        .setFooter({ text: 'MOTION V // DEVELOPED BY DIAWW.DEV' })

      return interaction.editReply({ embeds: [finalEmbed], components: [getDeveloperButtons()] })
    }
  }
})

/**
 * Helper: 1-Click Automated Activation Engine for Discord
 */
async function runDiscordAutoVip(context, specificEmail = null, isMessage = false) {
  const mailData = specificEmail ? { email: specificEmail } : tempmail.generateEmail()
  const email = mailData.email

  const step1Embed = new EmbedBuilder()
    .setTitle('🚀 MOTION V // 1-CLICK AUTO VIP')
    .setColor(CYAN_COLOR)
    .setDescription('Menjalankan automasi end-to-end aktivasi lisensi via CODAI MAIL (https://mail.codai.site).')
    .addFields(
      { name: '1. Inisialisasi Email', value: `✓ Dibuat: \`${email}\``, inline: false },
      { name: '2. Upstream Magic Link', value: '⏳ _Mengirimkan tautan otentikasi via Google Identity Toolkit..._', inline: false },
      { name: '3. Polling CODAI MAIL Inbox', value: '○ _Menunggu tautan masuk..._', inline: false },
      { name: '4. Aktivasi Lisensi Upstream', value: '○ _Pending_', inline: false }
    )
    .setFooter({ text: 'CODAI MAIL PROTOCOL // mail.codai.site' })

  let currentMsg
  if (isMessage) {
    currentMsg = await context.reply({ embeds: [step1Embed] })
  } else {
    currentMsg = await context.editReply({ embeds: [step1Embed] })
  }

  // Step 2: Send Magic Link
  const sendRes = await auth.sendMagicLink(email)
  if (!sendRes.ok) {
    const errEmbed = new EmbedBuilder()
      .setTitle('❌ AUTO-AKTIVASI GAGAL (STEP 2)')
      .setColor(ERROR_COLOR)
      .setDescription(`Gagal saat mengirim magic link: ${friendlyFirebaseError(sendRes.error)}`)
    return isMessage ? currentMsg.edit({ embeds: [errEmbed] }) : context.editReply({ embeds: [errEmbed] })
  }

  const step2Embed = new EmbedBuilder()
    .setTitle('🚀 MOTION V // 1-CLICK AUTO VIP')
    .setColor(CYAN_COLOR)
    .setDescription('Menjalankan automasi end-to-end aktivasi lisensi via CODAI MAIL.')
    .addFields(
      { name: '1. Inisialisasi Email', value: `✓ \`${email}\``, inline: false },
      { name: '2. Upstream Magic Link', value: '✓ _Tautan otentikasi terkirim_', inline: false },
      { name: '3. Polling CODAI MAIL Inbox', value: '⏳ _Memantau inbox API (maks 75 detik)..._', inline: false },
      { name: '4. Aktivasi Lisensi Upstream', value: '○ _Pending_', inline: false }
    )
    .setFooter({ text: 'CODAI MAIL PROTOCOL // mail.codai.site' })

  if (isMessage) await currentMsg.edit({ embeds: [step2Embed] })
  else await context.editReply({ embeds: [step2Embed] })

  // Step 3: Poll Inbox
  const pollRes = await tempmail.pollForMagicLink(email, 75, 3)
  if (!pollRes.ok || !pollRes.link) {
    const timeoutEmbed = new EmbedBuilder()
      .setTitle('⚠️ WAKTU TUNGGU HABIS (TIMEOUT)')
      .setColor(ERROR_COLOR)
      .setDescription(`Tautan verifikasi belum masuk ke kotak surat \`${email}\`.\nSilakan periksa di [mail.codai.site](https://mail.codai.site/).`)

    const retryRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`btn_polllink_${email}`)
        .setLabel('🔄 Coba Pindai Ulang')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setLabel('Buka mail.codai.site')
        .setStyle(ButtonStyle.Link)
        .setURL('https://mail.codai.site/')
    )

    return isMessage ? currentMsg.edit({ embeds: [timeoutEmbed], components: [retryRow] }) : context.editReply({ embeds: [timeoutEmbed], components: [retryRow] })
  }

  // Step 4: Verify & Activate
  const magicLink = pollRes.oobCode || pollRes.link
  const verifyResult = await auth.verifyMagicLink(email, magicLink)
  if (!verifyResult.ok) {
    const errEmbed = new EmbedBuilder()
      .setTitle('❌ VERIFIKASI GAGAL')
      .setColor(ERROR_COLOR)
      .setDescription(friendlyFirebaseError(verifyResult.error))
    return isMessage ? currentMsg.edit({ embeds: [errEmbed] }) : context.editReply({ embeds: [errEmbed] })
  }

  const premiumResult = await auth.activatePremium(verifyResult.idToken)
  if (premiumResult.ok) incrementStats()

  const now = new Date()
  const validUntil = new Date()
  validUntil.setFullYear(validUntil.getFullYear() + 1)
  const formattedDate = validUntil.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })

  const finalEmbed = new EmbedBuilder()
    .setTitle('🎉 1-CLICK AUTO AKTIVASI BERHASIL!')
    .setColor(BRAND_COLOR)
    .addFields(
      { name: 'Status Lisensi', value: '`PREMIUM_ACTIVE (ANNUAL VIP)`', inline: true },
      { name: 'Email Akun', value: `\`${email}\``, inline: true },
      { name: 'Masa Berlaku', value: `\`${formattedDate} (1 Tahun)\``, inline: true },
      { name: 'Firebase UID', value: `\`${verifyResult.uid || '-'}\``, inline: false },
      { name: 'Order ID Transaksi', value: `\`${premiumResult.orderId || '-'}\``, inline: true },
      { name: 'ID Token (JWT)', value: `\`${verifyResult.idToken.slice(0, 80)}...\``, inline: false }
    )
    .setFooter({ text: 'MOTION V // DEVELOPED BY DIAWW.DEV (https://diaww.my.id)' })

  const devRow = getDeveloperButtons()
  if (isMessage) return currentMsg.edit({ embeds: [finalEmbed], components: [devRow] })
  return context.editReply({ embeds: [finalEmbed], components: [devRow] })
}

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

  // Command: !autovip
  if (command === 'autovip') {
    return runDiscordAutoVip(message, null, true)
  }

  // Command: !tempmail
  if (command === 'tempmail') {
    const mailData = tempmail.generateEmail()
    const embed = new EmbedBuilder()
      .setTitle('📬 CODAI DISPOSABLE MAIL')
      .setColor(BRAND_COLOR)
      .setDescription(`Disposable email resmi via [mail.codai.site](https://mail.codai.site/)\n• Email: \`${mailData.email}\`\n• Domain: \`@${mailData.domain}\``)
      .setFooter({ text: 'Gunakan !autovip untuk aktivasi otomatis 1-klik!' })

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`btn_autovip_${mailData.email}`)
        .setLabel('🚀 Auto Aktifkan VIP')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(`btn_checkmail_${mailData.email}`)
        .setLabel('📬 Cek Inbox API')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setLabel('Buka mail.codai.site')
        .setStyle(ButtonStyle.Link)
        .setURL('https://mail.codai.site/')
    )

    return message.reply({ embeds: [embed], components: [row] })
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
