const express = require('express')
const path = require('path')
const cors = require('cors')
const auth = require('./lib/auth')
const tempmail = require('./lib/tempmail')
const { friendlyFirebaseError } = require('./lib/errors')
const { getStats, incrementStats } = require('./lib/stats')

const app = express()
const PORT = process.env.PORT || 3300

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Cache-busting static headers for development & snappy updates
app.use(express.static(path.join(__dirname, 'public'), {
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html') || filePath.endsWith('.css') || filePath.endsWith('.js')) {
      res.setHeader('Cache-Control', 'no-cache, must-revalidate')
    }
  }
}))

// Dedicated Page Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

app.get('/terms', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'terms.html'))
})

app.get('/privacy', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'privacy.html'))
})

app.get('/changelog', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'changelog.html'))
})

// ==========================================
// API ENDPOINTS
// ==========================================

// 1. Health / System Status
app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    status: 'OPERATIONAL',
    node: 'ID-CGK-01',
    engine: 'Motion V Core v2.2.0',
    dalvikPackage: 'com.alightcreative.motion',
    dalvikCert: 'ECA6BF91B8715A6F810ED0BBFC65B6CD578F52A8',
    serverUptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  })
})

// 2. Telemetry Statistics
app.get('/api/stats', (req, res) => {
  res.json({
    success: true,
    data: getStats()
  })
})

// 3. Dispatch Magic Link
app.post('/api/send-link', async (req, res) => {
  const { email } = req.body
  if (!email || !email.includes('@') || !email.includes('.')) {
    return res.status(400).json({
      success: false,
      message: 'Format alamat email tidak valid.'
    })
  }

  const cleanEmail = email.trim().toLowerCase()
  const result = await auth.sendMagicLink(cleanEmail)

  if (!result.ok) {
    return res.status(400).json({
      success: false,
      message: friendlyFirebaseError(result.error),
      code: result.error
    })
  }

  return res.json({
    success: true,
    email: cleanEmail,
    message: `Tautan otentikasi telah dikirim ke ${cleanEmail}. Periksa folder Kotak Masuk atau Spam.`
  })
})

// 4. Verify Link and Activate Premium
app.post('/api/verify-link', async (req, res) => {
  const { email, magicLink } = req.body

  if (!email || !email.includes('@')) {
    return res.status(400).json({
      success: false,
      message: 'Alamat email wajib diisi.'
    })
  }

  if (!magicLink || !magicLink.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Tautan atau kode verifikasi wajib diisi.'
    })
  }

  const cleanEmail = email.trim().toLowerCase()
  const verifyResult = await auth.verifyMagicLink(cleanEmail, magicLink.trim())

  if (!verifyResult.ok) {
    return res.status(400).json({
      success: false,
      message: friendlyFirebaseError(verifyResult.error),
      code: verifyResult.error
    })
  }

  // Dispatch VIP subscription activation
  const premiumResult = await auth.activatePremium(verifyResult.idToken)
  const stats = premiumResult.ok ? incrementStats() : getStats()

  const now = new Date()
  const validUntil = new Date()
  validUntil.setFullYear(validUntil.getFullYear() + 1)

  return res.json({
    success: true,
    message: premiumResult.ok
      ? 'Otentikasi berhasil. Lisensi Alight Motion VIP Annual telah aktif pada akun Anda.'
      : 'Otentikasi berhasil, namun aktivasi lisensi menemui kendala pada upstream.',
    data: {
      stats: stats,
      uid: verifyResult.uid,
      email: verifyResult.user?.email || cleanEmail,
      emailVerified: verifyResult.user?.emailVerified ?? true,
      displayName: verifyResult.user?.displayName || 'Alight Creator',
      photoUrl: verifyResult.user?.photoUrl || null,
      createdAt: verifyResult.user?.createdAt ? new Date(Number(verifyResult.user.createdAt)).toISOString() : null,
      lastLoginAt: verifyResult.user?.lastLoginAt ? new Date(Number(verifyResult.user.lastLoginAt)).toISOString() : now.toISOString(),
      isNewUser: verifyResult.isNewUser,
      status: premiumResult.ok ? 'ACTIVE' : 'INACTIVE',
      membershipStatus: premiumResult.ok ? 'VIP_ANNUAL_ACTIVE' : 'AUTH_ONLY',
      planName: 'Alight Motion Pro / VIP License',
      subscriptionType: 'Annual Subscription (Full Access)',
      orderId: premiumResult.orderId || null,
      activatedAt: now.toISOString(),
      validUntil: validUntil.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }),
      validUntilTimestamp: validUntil.getTime(),
      tokenType: 'Bearer',
      idToken: verifyResult.idToken,
      refreshToken: verifyResult.refreshToken,
      cloudResponse: premiumResult.ok ? premiumResult.response : null,
      cloudError: premiumResult.ok ? null : premiumResult.error,
      profile: verifyResult.user || null
    }
  })
})

// 5. Refresh Session
app.post('/api/refresh', async (req, res) => {
  const { refreshToken } = req.body
  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      message: 'Parameter refreshToken wajib disediakan.'
    })
  }

  const result = await auth.refreshAuthToken(refreshToken)
  if (!result.ok) {
    return res.status(400).json({
      success: false,
      message: friendlyFirebaseError(result.error),
      code: result.error
    })
  }

  return res.json({
    success: true,
    data: result
  })
})

// ==========================================
// 6. CODAI MAIL API ENDPOINTS (https://mail.codai.site)
// ==========================================

// 6a. Generate New Disposable Email
app.get('/api/tempmail/generate', (req, res) => {
  const { prefix, domain } = req.query
  const mailData = tempmail.generateEmail(prefix, domain)
  res.json({
    success: true,
    data: mailData
  })
})

// 6b. Check Temp Mail Health & Domains
app.get('/api/tempmail/status', async (req, res) => {
  const health = await tempmail.getHealth()
  res.json({
    success: health.ok,
    data: health
  })
})

// 6c. Get Inbox Messages
app.get('/api/tempmail/inbox', async (req, res) => {
  const { address } = req.query
  if (!address) {
    return res.status(400).json({
      success: false,
      message: 'Parameter address wajib disediakan.'
    })
  }

  const result = await tempmail.getInbox(address)
  res.json({
    success: result.ok,
    data: result
  })
})

// 6d. Get Single Message Details
app.get('/api/tempmail/message', async (req, res) => {
  const { address, id } = req.query
  if (!address || !id) {
    return res.status(400).json({
      success: false,
      message: 'Parameter address dan id wajib disediakan.'
    })
  }

  const result = await tempmail.getMessage(address, id)
  res.json({
    success: result.ok,
    data: result.data || null,
    error: result.error || null
  })
})

// 6e. Poll Inbox for Alight Motion Magic Link
app.post('/api/tempmail/poll-link', async (req, res) => {
  const { address, timeoutSeconds } = req.body
  if (!address) {
    return res.status(400).json({
      success: false,
      message: 'Parameter address wajib disediakan.'
    })
  }

  const timeout = Math.min(Number(timeoutSeconds) || 60, 120)
  const pollResult = await tempmail.pollForMagicLink(address, timeout, 3)

  res.json({
    success: pollResult.ok,
    data: pollResult
  })
})

// 6f. 1-Click End-to-End Auto Activation with CODAI Temp Mail
app.post('/api/tempmail/auto-activate', async (req, res) => {
  const { customPrefix, domain } = req.body

  // Step 1: Generate Email
  const tempEmailData = tempmail.generateEmail(customPrefix, domain)
  const email = tempEmailData.email

  // Step 2: Send Magic Link via Google Identity Toolkit
  const sendRes = await auth.sendMagicLink(email)
  if (!sendRes.ok) {
    return res.status(400).json({
      success: false,
      step: 'SEND_LINK',
      email: email,
      message: friendlyFirebaseError(sendRes.error),
      code: sendRes.error
    })
  }

  // Step 3: Poll CODAI Mail Inbox for Incoming Verification Email
  const pollRes = await tempmail.pollForMagicLink(email, 75, 3)
  if (!pollRes.ok || !pollRes.link) {
    return res.status(408).json({
      success: false,
      step: 'POLL_INBOX',
      email: email,
      inboxWebUrl: tempEmailData.inboxWebUrl,
      message: 'Waktu tunggu habis (timeout). Tautan verifikasi belum masuk ke kotak masuk mail.codai.site. Anda dapat mengecek manual di https://mail.codai.site/'
    })
  }

  // Step 4: Verify Magic Link
  const linkOrCode = pollRes.oobCode || pollRes.link
  const verifyResult = await auth.verifyMagicLink(email, linkOrCode)
  if (!verifyResult.ok) {
    return res.status(400).json({
      success: false,
      step: 'VERIFY_LINK',
      email: email,
      message: friendlyFirebaseError(verifyResult.error),
      code: verifyResult.error
    })
  }

  // Step 5: Activate Premium VIP Annual Subscription
  const premiumResult = await auth.activatePremium(verifyResult.idToken)
  const stats = premiumResult.ok ? incrementStats() : getStats()

  const now = new Date()
  const validUntil = new Date()
  validUntil.setFullYear(validUntil.getFullYear() + 1)

  return res.json({
    success: true,
    message: '1-Click Auto Aktivasi Berhasil! Lisensi Alight Motion VIP Annual aktif dengan email CODAI MAIL.',
    tempmail: tempEmailData,
    data: {
      stats: stats,
      uid: verifyResult.uid,
      email: verifyResult.user?.email || email,
      emailVerified: verifyResult.user?.emailVerified ?? true,
      displayName: verifyResult.user?.displayName || 'Alight Creator',
      photoUrl: verifyResult.user?.photoUrl || null,
      createdAt: verifyResult.user?.createdAt ? new Date(Number(verifyResult.user.createdAt)).toISOString() : null,
      lastLoginAt: verifyResult.user?.lastLoginAt ? new Date(Number(verifyResult.user.lastLoginAt)).toISOString() : now.toISOString(),
      isNewUser: verifyResult.isNewUser,
      status: premiumResult.ok ? 'ACTIVE' : 'INACTIVE',
      membershipStatus: premiumResult.ok ? 'VIP_ANNUAL_ACTIVE' : 'AUTH_ONLY',
      planName: 'Alight Motion Pro / VIP License',
      subscriptionType: 'Annual Subscription (Full Access)',
      orderId: premiumResult.orderId || null,
      activatedAt: now.toISOString(),
      validUntil: validUntil.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }),
      validUntilTimestamp: validUntil.getTime(),
      tokenType: 'Bearer',
      idToken: verifyResult.idToken,
      refreshToken: verifyResult.refreshToken,
      cloudResponse: premiumResult.ok ? premiumResult.response : null,
      cloudError: premiumResult.ok ? null : premiumResult.error,
      profile: verifyResult.user || null
    }
  })
})

// 404 Catch-all
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'))
})

app.listen(PORT, () => {
  console.log(`[TERMINAL ONLINE] Server berjalan di http://localhost:${PORT}`)
  console.log(`[DEVELOPER] DIAWW.DEV (https://diaww.my.id)`)
})
