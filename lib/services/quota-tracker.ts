// Simple in-memory quota tracker for Gemini API
// Limits: 15 RPM, 1000 RPD, 250k TPM

interface QuotaInfo {
  requestsPerMinute: number
  requestsPerDay: number
  minuteResetAt: number
  dayResetAt: number
}

const LIMITS = {
  RPM: 10, // requests per minute
  RPD: 250, // requests per day
  TPM: 250000, // tokens per minute (not tracked yet)
}

let quota: QuotaInfo = {
  requestsPerMinute: 0,
  requestsPerDay: 0,
  minuteResetAt: Date.now() + 60000,
  dayResetAt: getNextDayReset(),
}

function getNextDayReset(): number {
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setHours(24, 0, 0, 0)
  return tomorrow.getTime()
}

export function trackRequest() {
  const now = Date.now()

  // Reset minute counter if needed
  if (now >= quota.minuteResetAt) {
    quota.requestsPerMinute = 0
    quota.minuteResetAt = now + 60000
  }

  // Reset day counter if needed
  if (now >= quota.dayResetAt) {
    quota.requestsPerDay = 0
    quota.dayResetAt = getNextDayReset()
  }

  // Increment counters
  quota.requestsPerMinute++
  quota.requestsPerDay++

  return getQuotaStatus()
}

export function getQuotaStatus() {
  const now = Date.now()

  return {
    rpm: {
      used: quota.requestsPerMinute,
      limit: LIMITS.RPM,
      remaining: LIMITS.RPM - quota.requestsPerMinute,
      resetIn: Math.max(0, Math.ceil((quota.minuteResetAt - now) / 1000)),
    },
    rpd: {
      used: quota.requestsPerDay,
      limit: LIMITS.RPD,
      remaining: LIMITS.RPD - quota.requestsPerDay,
      resetIn: Math.max(0, Math.ceil((quota.dayResetAt - now) / 1000)),
    },
  }
}

export function isRateLimited(): { limited: boolean; resetIn: number; reason?: string } {
  const status = getQuotaStatus()

  if (status.rpm.remaining <= 0) {
    return { limited: true, resetIn: status.rpm.resetIn, reason: 'RPM limit reached' }
  }

  if (status.rpd.remaining <= 0) {
    return { limited: true, resetIn: status.rpd.resetIn, reason: 'Daily limit reached' }
  }

  return { limited: false, resetIn: 0 }
}
