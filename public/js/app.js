/**
 * MOTION V CONTROLLER (MOTION V DESIGN LANGUAGE & SMOOTH ANIMATIONS)
 * Developed by DIAWW.DEV (https://diaww.my.id)
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. DYNAMIC NAVBAR ON SCROLL
  const mainHeader = document.getElementById('main-header')
  if (mainHeader) {
    let lastScrollY = window.scrollY

    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY

      if (currentScrollY > 40) {
        mainHeader.classList.add('nav-scrolled')
      } else {
        mainHeader.classList.remove('nav-scrolled')
      }

      lastScrollY = currentScrollY
    }, { passive: true })

    // Initial check
    if (window.scrollY > 40) mainHeader.classList.add('nav-scrolled')
  }

  // 2. SMOOTH ENTRANCE & SCROLL REVEAL ANIMATIONS
  const revealElements = document.querySelectorAll('.np-reveal, .np-reveal-scale, .np-reveal-left, .np-reveal-right')
  
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('np-visible')
          observer.unobserve(entry.target)
        }
      })
    }, {
      root: null,
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    })

    revealElements.forEach(el => revealObserver.observe(el))
  } else {
    revealElements.forEach(el => el.classList.add('np-visible'))
  }

  // Trigger initial hero elements immediately with nice staggered entrance
  setTimeout(() => {
    document.querySelectorAll('.hero-entrance').forEach(el => el.classList.add('np-visible'))
  }, 100)

  // 3. CINEMATIC HERO BACKGROUND SWITCHER (GTA VI / NOPIXEL V / GTA V)
  const heroBgImage = document.getElementById('hero-bg-img')
  const bgSwitchBtns = document.querySelectorAll('.bg-switch-btn')
  const bgSlideNum = document.getElementById('bg-slide-num')

  const backgrounds = [
    {
      id: 'motionv',
      name: 'MOTION V',
      num: '01',
      src: '/images/nopixel_hero_keyart.webp',
      caption: 'Unveiling Motion V: The next evolution of GTA RP and Alight Motion reverse engineering'
    },
    {
      id: 'gta6',
      name: 'GTA VI',
      num: '02',
      src: '/images/gta6_hero_lucia_jason.jpg',
      caption: 'Vice City Next-Gen: Lucia & Jason Vice City Leonida Cinematic Engine'
    },
    {
      id: 'gta5',
      name: 'GTA V',
      num: '03',
      src: '/images/gta5_los_santos_city.jpg',
      caption: 'Los Santos Legacy: Iconic Downtown Skyline & City Center'
    },
    {
      id: 'night',
      name: 'LS NIGHT',
      num: '04',
      src: '/images/gta_downtown_night.webp',
      caption: 'Downtown Los Santos at Midnight: Dark Tactical Roleplay Atmosphere'
    }
  ]

  let currentBgIndex = 0

  function switchBackground(index) {
    if (!heroBgImage || index < 0 || index >= backgrounds.length) return
    currentBgIndex = index
    const bg = backgrounds[index]

    // Fade out slightly, switch src, fade in
    heroBgImage.style.opacity = '0'
    setTimeout(() => {
      heroBgImage.src = bg.src
      heroBgImage.style.opacity = '1'
    }, 250)

    if (bgSlideNum) bgSlideNum.textContent = bg.num

    bgSwitchBtns.forEach((btn, idx) => {
      if (idx === index) {
        btn.classList.add('bg-paper', 'text-ink')
        btn.classList.remove('bg-paper/20', 'text-paper')
      } else {
        btn.classList.remove('bg-paper', 'text-ink')
        btn.classList.add('bg-paper/20', 'text-paper')
      }
    })
  }

  bgSwitchBtns.forEach((btn, idx) => {
    btn.addEventListener('click', () => {
      playTactileFeedback('click')
      switchBackground(idx)
    })
  })

  // Optional subtle auto slide every 14 seconds
  setInterval(() => {
    const nextIdx = (currentBgIndex + 1) % backgrounds.length
    switchBackground(nextIdx)
  }, 14000)

  // 4. TERMINAL ACTIVATOR LOGIC
  const stepIndicators = {
    1: document.getElementById('step-indicator-1'),
    2: document.getElementById('step-indicator-2'),
    3: document.getElementById('step-indicator-3')
  }

  const panels = {
    1: document.getElementById('panel-step-1'),
    2: document.getElementById('panel-step-2'),
    3: document.getElementById('panel-step-3')
  }

  const emailInput = document.getElementById('input-email')
  const btnSendLink = document.getElementById('btn-send-link')
  const sendAlert = document.getElementById('alert-step-1')

  const targetEmailBadge = document.getElementById('target-email-badge')
  const magicLinkInput = document.getElementById('input-magic-link')
  const btnBackStep1 = document.getElementById('btn-back-step-1')
  const btnVerifyLink = document.getElementById('btn-verify-link')
  const verifyAlert = document.getElementById('alert-step-2')

  const resEmail = document.getElementById('res-email')
  const resUid = document.getElementById('res-uid')
  const resOrderId = document.getElementById('res-order-id')
  const resValidUntil = document.getElementById('res-valid-until')
  const resIdToken = document.getElementById('res-id-token')
  const btnCopyToken = document.getElementById('btn-copy-token')
  const btnReset = document.getElementById('btn-reset-flow')

  const statTotal = document.getElementById('stat-total')
  const statToday = document.getElementById('stat-today')
  const statGateway = document.getElementById('stat-gateway')

  const mobileMenuBtn = document.getElementById('mobile-menu-btn')
  const mobileMenu = document.getElementById('mobile-menu')

  let currentEmail = ''

  // Audio feedback synthesis
  function playTactileFeedback(type = 'click') {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)

      const now = ctx.currentTime
      if (type === 'success') {
        osc.type = 'sine'
        osc.frequency.setValueAtTime(587.33, now)
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.12)
        gain.gain.setValueAtTime(0.08, now)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14)
        osc.start(now)
        osc.stop(now + 0.15)
      } else if (type === 'error') {
        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(220, now)
        osc.frequency.setValueAtTime(160, now + 0.08)
        gain.gain.setValueAtTime(0.06, now)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18)
        osc.start(now)
        osc.stop(now + 0.2)
      } else {
        osc.type = 'sine'
        osc.frequency.setValueAtTime(1200, now)
        gain.gain.setValueAtTime(0.03, now)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04)
        osc.start(now)
        osc.stop(now + 0.05)
      }
    } catch {}
  }

  // Toast Notification
  function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container')
    if (!container) {
      container = document.createElement('div')
      container.id = 'toast-container'
      document.body.appendChild(container)
    }

    const toast = document.createElement('div')
    toast.className = `np-toast ${type}`

    const icon = type === 'success' 
      ? '<span style="color:#00f8b9;font-weight:bold;">[OK]</span>'
      : type === 'error'
      ? '<span style="color:#ff4757;font-weight:bold;">[ERR]</span>'
      : '<span style="color:#40e5ff;font-weight:bold;">[SYS]</span>'

    toast.innerHTML = `
      <div style="font-size:1.1rem;line-height:1;">${icon}</div>
      <div style="flex:1;">
        <div style="font-family:var(--font-mono);font-size:0.75rem;color:#888;text-transform:uppercase;">SYSTEM // LOG</div>
        <div style="margin-top:2px;">${message}</div>
      </div>
    `

    container.appendChild(toast)
    setTimeout(() => {
      toast.style.opacity = '0'
      toast.style.transform = 'translateY(10px) scale(0.95)'
      setTimeout(() => toast.remove(), 250)
    }, 4500)
  }

  // Step Switcher
  function goToStep(step) {
    playTactileFeedback('click')

    for (let i = 1; i <= 3; i++) {
      if (panels[i]) {
        if (i === step) {
          panels[i].classList.remove('hidden')
          panels[i].classList.add('block')
        } else {
          panels[i].classList.add('hidden')
          panels[i].classList.remove('block')
        }
      }

      if (stepIndicators[i]) {
        if (i === step) {
          stepIndicators[i].className = 'px-[10px] py-[5px] text-[12.5px] leading-[17.5px] tracking-[0.02em] transition-colors duration-300 lg:px-5 lg:py-2.5 lg:text-[1.25rem] lg:leading-[1.75rem] bg-paper text-ink font-bold uppercase'
        } else {
          stepIndicators[i].className = 'px-[10px] py-[5px] text-[12.5px] leading-[17.5px] tracking-[0.02em] transition-colors duration-300 lg:px-5 lg:py-2.5 lg:text-[1.25rem] lg:leading-[1.75rem] text-paper/60 hover:text-brand-2 font-semibold uppercase'
        }
      }
    }
  }

  // Live Stats Poller
  async function fetchTelemetry() {
    try {
      const res = await fetch('/api/stats')
      const json = await res.json()
      if (json.success && json.data) {
        if (statTotal) statTotal.textContent = Number(json.data.total).toLocaleString('id-ID')
        if (statToday) statToday.textContent = Number(json.data.today).toLocaleString('id-ID')
        if (statGateway) statGateway.textContent = 'ONLINE (200 OK)'
      }
    } catch {
      if (statGateway) statGateway.textContent = 'STANDBY'
    }
  }

  fetchTelemetry()
  setInterval(fetchTelemetry, 15000)

  // Step 1: Send Magic Link
  if (btnSendLink && emailInput) {
    btnSendLink.addEventListener('click', async () => {
      const email = emailInput.value.trim().toLowerCase()
      if (!email || !email.includes('@') || !email.includes('.')) {
        playTactileFeedback('error')
        if (sendAlert) {
          sendAlert.className = 'mt-4 p-4 text-xs font-mono bg-red-950/80 border border-red-500 text-red-200 block'
          sendAlert.textContent = 'Harap masukkan format alamat email yang valid.'
        }
        showToast('Format alamat email tidak valid.', 'error')
        emailInput.focus()
        return
      }

      currentEmail = email
      btnSendLink.disabled = true
      const originalText = btnSendLink.innerHTML
      btnSendLink.innerHTML = `
        <svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-ink inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>MENGIRIMKAN TAUTAN...</span>
      `

      if (sendAlert) {
        sendAlert.className = 'mt-4 p-4 text-xs font-mono bg-shade-900 border border-brand text-brand block'
        sendAlert.textContent = 'Menghubungkan ke gateway Firebase Identity Toolkit...'
      }

      try {
        const response = await fetch('/api/send-link', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        })
        const data = await response.json()

        if (data.success) {
          playTactileFeedback('success')
          showToast(`Tautan otentikasi dikirim ke ${email}`, 'success')
          if (targetEmailBadge) targetEmailBadge.textContent = email
          goToStep(2)

          if (magicLinkInput) {
            magicLinkInput.value = ''
            setTimeout(() => magicLinkInput.focus(), 200)
          }
        } else {
          playTactileFeedback('error')
          if (sendAlert) {
            sendAlert.className = 'mt-4 p-4 text-xs font-mono bg-red-950/80 border border-red-500 text-red-200 block'
            sendAlert.textContent = data.message || 'Gagal mengirim tautan otentikasi.'
          }
          showToast(data.message || 'Pengiriman gagal', 'error')
        }
      } catch (err) {
        playTactileFeedback('error')
        if (sendAlert) {
          sendAlert.className = 'mt-4 p-4 text-xs font-mono bg-red-950/80 border border-red-500 text-red-200 block'
          sendAlert.textContent = 'Gagal berkomunikasi dengan server backend.'
        }
        showToast('Koneksi terputus ke server lokal.', 'error')
      } finally {
        btnSendLink.disabled = false
        btnSendLink.innerHTML = originalText
      }
    })

    emailInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        btnSendLink.click()
      }
    })
  }

  // Step 2: Back to Step 1
  if (btnBackStep1) {
    btnBackStep1.addEventListener('click', () => {
      goToStep(1)
    })
  }

  // Step 2: Verify Link & Activate
  if (btnVerifyLink && magicLinkInput) {
    btnVerifyLink.addEventListener('click', async () => {
      const linkValue = magicLinkInput.value.trim()
      if (!linkValue) {
        playTactileFeedback('error')
        if (verifyAlert) {
          verifyAlert.className = 'mt-4 p-4 text-xs font-mono bg-red-950/80 border border-red-500 text-red-200 block'
          verifyAlert.textContent = 'Harap tempelkan tautan dari email atau kode oobCode.'
        }
        showToast('Tautan verifikasi kosong.', 'error')
        magicLinkInput.focus()
        return
      }

      btnVerifyLink.disabled = true
      const originalText = btnVerifyLink.innerHTML
      btnVerifyLink.innerHTML = `
        <svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-ink inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>MEMPROSES LISENSI UPSTREAM...</span>
      `

      if (verifyAlert) {
        verifyAlert.className = 'mt-4 p-4 text-xs font-mono bg-shade-900 border border-brand-2 text-brand-2 block'
        verifyAlert.textContent = 'Melakukan dekode oobCode & handshake ke verifyPurchase Cloud Function...'
      }

      try {
        const response = await fetch('/api/verify-link', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: currentEmail,
            magicLink: linkValue
          })
        })
        const data = await response.json()

        if (data.success && data.data) {
          playTactileFeedback('success')
          showToast('Lisensi Alight Motion VIP Annual Aktif!', 'success')

          const details = data.data
          if (resEmail) resEmail.textContent = details.email || currentEmail
          if (resUid) resUid.textContent = details.uid || '-'
          if (resOrderId) resOrderId.textContent = details.orderId || '-'
          if (resValidUntil) resValidUntil.textContent = details.validUntil || '1 Tahun (Aktif)'
          if (resIdToken) resIdToken.textContent = details.idToken || '-'

          fetchTelemetry()
          goToStep(3)
        } else {
          playTactileFeedback('error')
          if (verifyAlert) {
            verifyAlert.className = 'mt-4 p-4 text-xs font-mono bg-red-950/80 border border-red-500 text-red-200 block'
            verifyAlert.textContent = data.message || 'Verifikasi gagal. Periksa kembali tautan Anda.'
          }
          showToast(data.message || 'Aktivasi lisensi gagal.', 'error')
        }
      } catch (err) {
        playTactileFeedback('error')
        if (verifyAlert) {
          verifyAlert.className = 'mt-4 p-4 text-xs font-mono bg-red-950/80 border border-red-500 text-red-200 block'
          verifyAlert.textContent = 'Gagal menghubungi server lokal saat proses verifikasi.'
        }
        showToast('Gagal menghubungi server.', 'error')
      } finally {
        btnVerifyLink.disabled = false
        btnVerifyLink.innerHTML = originalText
      }
    })

    magicLinkInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        btnVerifyLink.click()
      }
    })
  }

  // Copy ID Token
  if (btnCopyToken && resIdToken) {
    btnCopyToken.addEventListener('click', async () => {
      const token = resIdToken.textContent
      if (!token || token === '-') return

      try {
        await navigator.clipboard.writeText(token)
        playTactileFeedback('click')
        showToast('ID Token berhasil disalin ke clipboard.', 'info')
        const prevText = btnCopyToken.innerHTML
        btnCopyToken.innerHTML = `<span>DISALIN!</span>`
        setTimeout(() => {
          btnCopyToken.innerHTML = prevText
        }, 2000)
      } catch {
        showToast('Gagal menyalin token secara otomatis.', 'error')
      }
    })
  }

  // Reset Flow
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      currentEmail = ''
      if (emailInput) emailInput.value = ''
      if (magicLinkInput) magicLinkInput.value = ''
      if (sendAlert) sendAlert.className = 'hidden'
      if (verifyAlert) verifyAlert.className = 'hidden'
      goToStep(1)
    })
  }

  // Mobile menu toggle
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      playTactileFeedback('click')
      mobileMenu.classList.toggle('hidden')
    })
  }
})
