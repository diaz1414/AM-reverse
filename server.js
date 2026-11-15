const express = require('express')
const path = require('path')
const cors = require('cors')
const auth = require('./lib/auth')
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

// 404 Catch-all
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'))
})

app.listen(PORT, () => {
  console.log(`[TERMINAL ONLINE] Server berjalan di http://localhost:${PORT}`)
  console.log(`[DEVELOPER] DIAWW.DEV (https://diaww.my.id)`)
})
