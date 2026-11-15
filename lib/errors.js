/**
 * Maps raw Firebase and Cloud Function errors to clear, professional technical messages.
 * Anti-slop: strictly factual, clear, and actionable.
 */
function friendlyFirebaseError(rawError) {
  if (!rawError || typeof rawError !== 'string') {
    return 'Terjadi kendala pada gateway autentikasi. Silakan periksa kembali koneksi Anda.'
  }

  const err = rawError.toUpperCase()

  if (err.includes('INVALID_OOB_CODE')) {
    return 'Token verifikasi (oobCode) tidak valid atau sudah kedaluwarsa. Silakan minta tautan baru.'
  }
  if (err.includes('EXPIRED_OOB_CODE')) {
    return 'Tautan verifikasi telah kedaluwarsa. Silakan lakukan pengiriman ulang.'
  }
  if (err.includes('INVALID_EMAIL')) {
    return 'Format alamat email tidak sesuai dengan standar RFC.'
  }
  if (err.includes('EMAIL_NOT_FOUND')) {
    return 'Alamat email belum terdaftar di sistem otentikasi. Silakan kirim tautan terlebih dahulu.'
  }
  if (err.includes('USER_DISABLED')) {
    return 'Akun pengguna ini telah dinonaktifkan oleh administrator layanan.'
  }
  if (err.includes('TOO_MANY_ATTEMPTS_TRY_LATER') || err.includes('QUOTA_EXCEEDED')) {
    return 'Batas frekuensi permintaan tercapai. Sistem menerapkan cooldown keamanan, coba beberapa saat lagi.'
  }
  if (err.includes('MISSING_OR_INVALID_OOB_CODE')) {
    return 'Format tautan atau parameter oobCode tidak ditemukan. Pastikan menyalin seluruh tautan dari email.'
  }
  if (err.includes('API_KEY_INVALID')) {
    return 'Kredensial API gateway tidak valid.'
  }
  if (err.includes('ECONNABORTED') || err.includes('ETIMEDOUT')) {
    return 'Batas waktu koneksi ke server upstream terlampaui. Coba ulangi beberapa saat lagi.'
  }

  // Fallback to truncated raw message if technical
  return rawError.length > 300 ? rawError.slice(0, 300) + '...' : rawError
}

module.exports = {
  friendlyFirebaseError
}
