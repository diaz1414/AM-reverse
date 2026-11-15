const axios = require('axios')
const crypto = require('crypto')

const FIREBASE_API_KEY = 'AIzaSyDtG1AU22ErnQD60AzBAcaknySiz9_CEq0'
const IDENTITY_TOOLKIT_URL = 'https://www.googleapis.com/identitytoolkit/v3/relyingparty'
const VERIFY_PURCHASE_URL = 'https://us-central1-alight-creative.cloudfunctions.net/verifyPurchase'
const SECURE_TOKEN_URL = 'https://securetoken.googleapis.com/v1/token'

// Generate random realistic client IP for proxy rotation
const randomClientIp = () => `${crypto.randomInt(1, 255)}.${crypto.randomInt(0, 255)}.${crypto.randomInt(0, 255)}.${crypto.randomInt(1, 255)}`

// Inject stealth spoofing headers
const withStealthHeaders = (headers = {}) => {
  const ip = randomClientIp()
  return {
    ...headers,
    'x-forwarded-for': ip,
    'x-real-ip': ip,
    'client-ip': ip,
    'x-client-ip': ip,
    'x-originating-ip': ip,
    'x-cluster-client-ip': ip
  }
}

// Android Dalvik 2.1 stealth signature (Alight Motion build bp1a.250505.005)
const ANDROID_DALVIK_HEADERS = {
  'content-type': 'application/json',
  'x-android-package': 'com.alightcreative.motion',
  'x-android-cert': 'ECA6BF91B8715A6F810ED0BBFC65B6CD578F52A8',
  'user-agent': 'dalvik/2.1.0 (linux; u; android 15; 23127pn0cc build/bp1a.250505.005)'
}

// OkHttp client signature
const OKHTTP_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'user-agent': 'okhttp/3.12.1',
  'accept-encoding': 'gzip'
}

// Parse error response cleanly
const parseError = (error) => {
  const data = error.response?.data
  if (data) {
    if (typeof data === 'object') {
      return data.error?.message || JSON.stringify(data)
    }
    return String(data)
  }
  return error.message || 'Unknown network error'
}

/**
 * Extract oobCode from magic link or raw string
 */
function extractCode(raw) {
  if (!raw) return null
  let s = String(raw).replace(/&amp;/g, '&')
  try {
    s = decodeURIComponent(s)
  } catch { }

  try {
    const u = new URL(s)
    let c = u.searchParams.get('oobCode')
    if (!c) {
      const nested = u.searchParams.get('link') || u.searchParams.get('q') || u.searchParams.get('url')
      if (nested) {
        try {
          c = new URL(nested).searchParams.get('oobCode')
        } catch { }
      }
    }
    if (c) return c.replace(/[^a-zA-Z0-9_-]/g, '')
  } catch { }

  const match = s.match(/oobCode=([a-zA-Z0-9_-]+)/i)
  if (match) return match[1]

  const clean = String(raw).trim()
  if (/^[a-zA-Z0-9_-]{10,}$/.test(clean) && !clean.includes('://')) {
    return clean
  }
  return null
}

/**
 * Send Firebase Magic Link to target email
 */
async function sendMagicLink(email) {
  try {
    await axios.post(
      `${IDENTITY_TOOLKIT_URL}/getOobConfirmationCode?key=${FIREBASE_API_KEY}`,
      {
        requestType: 6,
        email: email,
        androidInstallApp: true,
        canHandleCodeInApp: true,
        continueUrl: 'https://alightcreative.com?ui_sid=0366624874&ui_sd=0',
        iosBundleId: 'com.alightcreative.motion',
        androidPackageName: 'com.alightcreative.motion',
        androidMinimumVersion: '585',
        clientType: 'CLIENT_TYPE_ANDROID'
      },
      { headers: withStealthHeaders(ANDROID_DALVIK_HEADERS), timeout: 15000 }
    )
    return { ok: true }
  } catch (err) {
    return { ok: false, error: parseError(err) }
  }
}

/**
 * Authenticate with email & magic link / oobCode
 */
async function verifyMagicLink(email, rawCode) {
  const code = extractCode(rawCode)
  if (!code) {
    return { ok: false, error: 'MISSING_OR_INVALID_OOB_CODE' }
  }

  try {
    const signinRes = await axios.post(
      `${IDENTITY_TOOLKIT_URL}/emailLinkSignin?key=${FIREBASE_API_KEY}`,
      {
        email: email,
        oobCode: code,
        clientType: 'CLIENT_TYPE_ANDROID'
      },
      { headers: withStealthHeaders(ANDROID_DALVIK_HEADERS), timeout: 15000 }
    )

    let userInfo = null
    try {
      const accountRes = await axios.post(
        `${IDENTITY_TOOLKIT_URL}/getAccountInfo?key=${FIREBASE_API_KEY}`,
        { idToken: signinRes.data.idToken },
        { headers: withStealthHeaders(ANDROID_DALVIK_HEADERS), timeout: 15000 }
      )
      userInfo = accountRes.data?.users?.[0] || null
    } catch (acctErr) {
      console.warn('getAccountInfo warning:', parseError(acctErr))
    }

    return {
      ok: true,
      email: email,
      idToken: signinRes.data.idToken,
      refreshToken: signinRes.data.refreshToken,
      uid: signinRes.data.localId,
      isNewUser: Boolean(signinRes.data.isNewUser),
      user: userInfo
    }
  } catch (err) {
    return { ok: false, error: parseError(err) }
  }
}

/**
 * Activate Annual VIP License via Alight Creative Cloud Function
 */
async function activatePremium(idToken) {
  const orderId = 'np-' + crypto.randomBytes(6).toString('hex')
  const payload = {
    data: {
      productId: 'am.full.sub.annual.19q4',
      token: 'mmgaobamlahbbeccfplmbkbb.AO-J1OzqG0or_GJJIx-ms8GrTm-jaglCRfhQSRPUZKpl2YspYS-oN7_94uv8RC5vQbvd_Ios2pPDStZ2n7F0hLE3FiOU7HS3R6Fquulv5xLXFECSv4ctElw',
      skuType: 'subs',
      orderId: orderId
    }
  }

  const headers = {
    ...OKHTTP_HEADERS,
    authorization: 'Bearer ' + idToken,
    'firebase-instance-id-token': 'cSDnCyp3T-uwp07z3tL86T:APA91bFkmvvsHw5nnqa1SBFci-99DRsKClLiETdRrVcJjS5yBx1v_FbCb1d8WhBuea_zmwnYBktyTIzcRhN4b6uNOUur9wPc0gKXmJDoZic0LhNq5V2s0xI'
  }

  try {
    const verifyRes = await axios.post(VERIFY_PURCHASE_URL, payload, {
      headers: withStealthHeaders(headers),
      timeout: 20000
    })
    return {
      ok: true,
      orderId: orderId,
      productId: 'am.full.sub.annual.19q4',
      response: verifyRes.data
    }
  } catch (err) {
    return {
      ok: false,
      orderId: orderId,
      error: parseError(err)
    }
  }
}

/**
 * Refresh Firebase Auth Session
 */
async function refreshAuthToken(refreshToken) {
  try {
    const res = await axios.post(
      `${SECURE_TOKEN_URL}?key=${FIREBASE_API_KEY}`,
      {
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      },
      { timeout: 15000 }
    )
    return {
      ok: true,
      idToken: res.data.id_token,
      refreshToken: res.data.refresh_token
    }
  } catch (err) {
    return { ok: false, error: parseError(err) }
  }
}

module.exports = {
  sendMagicLink,
  verifyMagicLink,
  activatePremium,
  refreshAuthToken,
  extractCode
}
