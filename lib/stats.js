const fs = require('fs')
const path = require('path')

const dataDir = path.join(__dirname, '..', 'data')
const statsFile = path.join(dataDir, 'stats.json')

// Ensure data folder exists
if (!fs.existsSync(dataDir)) {
  try {
    fs.mkdirSync(dataDir, { recursive: true })
  } catch (err) {
    console.error('[STATS] Gagal inisialisasi direktori data:', err.message)
  }
}

function getTodayString() {
  const d = new Date()
  return d.toISOString().split('T')[0]
}

const defaultStats = {
  totalPremium: 3840, // Base realistic counter baseline
  todayPremium: 42,
  lastDate: getTodayString()
}

function loadStats() {
  try {
    if (fs.existsSync(statsFile)) {
      const raw = fs.readFileSync(statsFile, 'utf8')
      const parsed = JSON.parse(raw)
      const today = getTodayString()
      if (parsed.lastDate !== today) {
        parsed.todayPremium = 0
        parsed.lastDate = today
        saveStats(parsed)
      }
      return parsed
    }
  } catch (err) {
    console.warn('[STATS] Reset ke default karena kendala pembacaan file:', err.message)
  }

  saveStats(defaultStats)
  return { ...defaultStats }
}

function saveStats(statsObj) {
  try {
    fs.writeFileSync(statsFile, JSON.stringify(statsObj, null, 2), 'utf8')
  } catch (err) {
    console.error('[STATS] Gagal menyimpan data stats:', err.message)
  }
}

function getStats() {
  const current = loadStats()
  return {
    total: current.totalPremium || 0,
    today: current.todayPremium || 0,
    serverUptime: Math.floor(process.uptime()),
    status: 'ONLINE'
  }
}

function incrementStats() {
  const current = loadStats()
  current.totalPremium = (current.totalPremium || 0) + 1
  current.todayPremium = (current.todayPremium || 0) + 1
  current.lastDate = getTodayString()
  saveStats(current)
  return {
    total: current.totalPremium,
    today: current.todayPremium,
    serverUptime: Math.floor(process.uptime()),
    status: 'ONLINE'
  }
}

module.exports = {
  getStats,
  incrementStats
}
