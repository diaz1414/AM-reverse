/**
 * CODAI MAIL INTEGRATION MODULE
 * Powered by https://mail.codai.site (API: https://api-mail.codai.site)
 * Developer: DIAWW.DEV (https://diaww.my.id)
 */

const axios = require('axios')
const crypto = require('crypto')
const { extractCode } = require('./auth')

const API_BASE = 'https://api-mail.codai.site'
const WEB_BASE = 'https://mail.codai.site'

const DEFAULT_DOMAINS = ['codai.site', 'daz.codai.site', 'mkr.codai.site']

/**
 * Cek status kesehatan API CODAI MAIL & daftar domain aktif
 */
async function getHealth() {
  try {
    const res = await axios.get(`${API_BASE}/api/health`, { timeout: 8000 })
    return {
      ok: true,
      status: res.data?.status || 'online',
      domains: res.data?.domains || DEFAULT_DOMAINS,
      ttl: res.data?.ttl_seconds || 600
    }
  } catch (err) {
    return {
      ok: false,
      status: 'offline',
      domains: DEFAULT_DOMAINS,
      error: err.message
    }
  }
}

/**
 * Generate alamat email sementara baru (@codai.site)
 */
function generateEmail(prefix = null, domain = 'codai.site') {
  const cleanPrefix = prefix
    ? String(prefix).replace(/[^a-zA-Z0-9_.-]/g, '').toLowerCase().slice(0, 20)
    : `mv_${crypto.randomBytes(4).toString('hex')}`

  const selectedDomain = DEFAULT_DOMAINS.includes(domain) ? domain : 'codai.site'
  const email = `${cleanPrefix}@${selectedDomain}`

  return {
    email: email,
    username: cleanPrefix,
    domain: selectedDomain,
    inboxWebUrl: `${WEB_BASE}/`,
    apiInboxUrl: `${API_BASE}/api/inbox/${encodeURIComponent(email)}`,
    provider: 'CODAI MAIL (https://mail.codai.site)'
  }
}

/**
 * Ambil daftar pesan masuk (inbox) untuk alamat email tertentu
 */
async function getInbox(address) {
  if (!address || !address.includes('@')) {
    return { ok: false, error: 'Alamat email tidak valid' }
  }

  const cleanAddr = address.trim().toLowerCase()
  try {
    const res = await axios.get(`${API_BASE}/api/inbox/${encodeURIComponent(cleanAddr)}`, {
      timeout: 10000,
      headers: { Accept: 'application/json' }
    })
    return {
      ok: true,
      address: res.data?.address || cleanAddr,
      count: res.data?.count || 0,
      messages: res.data?.messages || []
    }
  } catch (err) {
    return {
      ok: false,
      address: cleanAddr,
      count: 0,
      messages: [],
      error: err.response?.data?.message || err.message
    }
  }
}

/**
 * Ambil detail pesan lengkap berdasarkan ID
 */
async function getMessage(address, messageId) {
  if (!address || !messageId) {
    return { ok: false, error: 'Address dan messageId wajib disediakan' }
  }

  const cleanAddr = address.trim().toLowerCase()
  try {
    const res = await axios.get(
      `${API_BASE}/api/message/${encodeURIComponent(cleanAddr)}/${encodeURIComponent(messageId)}`,
      {
        timeout: 10000,
        headers: { Accept: 'application/json' }
      }
    )
    return {
      ok: true,
      data: res.data
    }
  } catch (err) {
    return {
      ok: false,
      error: err.response?.data?.message || err.message
    }
  }
}

/**
 * Cari tautan verifikasi Alight Motion atau oobCode di dalam pesan
 */
function extractAlightLink(msgData) {
  if (!msgData) return null

  const candidates = [
    msgData.html,
    msgData.text,
    msgData.body,
    typeof msgData === 'string' ? msgData : ''
  ]

  for (const c of candidates) {
    if (!c || typeof c !== 'string') continue

    // Cari url alightcreative.com
    const urlMatch = c.match(/https?:\/\/(?:[a-zA-Z0-9-]+\.)?alightcreative\.com[^\s"'>]+/i)
    if (urlMatch) {
      return urlMatch[0]
    }

    // Cari oobCode
    const oobMatch = c.match(/oobCode=([a-zA-Z0-9_-]+)/i)
    if (oobMatch) {
      return oobMatch[0]
    }
  }

  return null
}

/**
 * Polling otomatis menunggu email dari Alight Motion masuk ke CODAI MAIL
 */
async function pollForMagicLink(address, maxWaitSeconds = 60, intervalSeconds = 3) {
  const startTime = Date.now()
  const maxMs = maxWaitSeconds * 1000
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

  while (Date.now() - startTime < maxMs) {
    const inbox = await getInbox(address)
    if (inbox.ok && inbox.count > 0 && inbox.messages.length > 0) {
      // Periksa pesan terbaru
      for (const msgItem of inbox.messages) {
        const detail = await getMessage(address, msgItem.id)
        if (detail.ok && detail.data) {
          const link = extractAlightLink(detail.data)
          if (link) {
            const oobCode = extractCode(link)
            return {
              ok: true,
              found: true,
              link: link,
              oobCode: oobCode,
              message: detail.data
            }
          }
        }
      }
    }

    await sleep(intervalSeconds * 1000)
  }

  return {
    ok: false,
    found: false,
    error: 'Waktu tunggu habis (timeout). Email otentikasi belum diterima.'
  }
}

module.exports = {
  API_BASE,
  WEB_BASE,
  DEFAULT_DOMAINS,
  getHealth,
  generateEmail,
  getInbox,
  getMessage,
  extractAlightLink,
  pollForMagicLink
}
