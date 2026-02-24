// Multi-key, multi-model rotation system for maximizing Gemini API quota
// 3 API keys × 3 models = 9 combinations with automatic fallback

interface QuotaInfo {
  requestsPerMinute: number
  requestsPerDay: number
  minuteResetAt: number
  dayResetAt: number
}

export interface ModelConfig {
  id: string
  apiKey: string
  modelName: 'gemini-2.5-flash-lite' | 'gemini-2.5-flash' | 'gemini-2.5-pro'
  limits: { RPM: number; RPD: number }
  quota: QuotaInfo
}

// Initialize the pool with 3 keys × 3 models
const API_KEYS = [
  process.env.GEMINI_API_KEY || '',
  process.env.GEMINI_API_KEY_2 || '',
  process.env.GEMINI_API_KEY_3 || '',
].filter(Boolean)

const MODELS = [
  { name: 'gemini-2.5-flash-lite' as const, RPM: 15, RPD: 1000 },
  { name: 'gemini-2.5-flash' as const, RPM: 10, RPD: 250 },
  { name: 'gemini-2.5-pro' as const, RPM: 5, RPD: 100 },
]

function getNextDayReset(): number {
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setHours(24, 0, 0, 0)
  return tomorrow.getTime()
}

// Create pool of all combinations
export const MODEL_POOL: ModelConfig[] = []

API_KEYS.forEach((apiKey, keyIndex) => {
  MODELS.forEach(model => {
    MODEL_POOL.push({
      id: `key${keyIndex + 1}-${model.name}`,
      apiKey,
      modelName: model.name,
      limits: { RPM: model.RPM, RPD: model.RPD },
      quota: {
        requestsPerMinute: 0,
        requestsPerDay: 0,
        minuteResetAt: Date.now() + 60000,
        dayResetAt: getNextDayReset(),
      },
    })
  })
})

// Track which config was last used (round-robin)
let lastUsedIndex = -1

// Reset quota if time has passed
function resetQuotaIfNeeded(config: ModelConfig) {
  const now = Date.now()

  if (now >= config.quota.minuteResetAt) {
    config.quota.requestsPerMinute = 0
    config.quota.minuteResetAt = now + 60000
  }

  if (now >= config.quota.dayResetAt) {
    config.quota.requestsPerDay = 0
    config.quota.dayResetAt = getNextDayReset()
  }
}

// Check if a config has quota available
function hasQuotaAvailable(config: ModelConfig): boolean {
  resetQuotaIfNeeded(config)

  const rpmAvailable = config.quota.requestsPerMinute < config.limits.RPM
  const rpdAvailable = config.quota.requestsPerDay < config.limits.RPD

  return rpmAvailable && rpdAvailable
}

// Get the next available model config (round-robin with fallback)
export function getAvailableModelConfig(): ModelConfig | null {
  // Try all configs starting from the next one after last used
  for (let i = 0; i < MODEL_POOL.length; i++) {
    const index = (lastUsedIndex + 1 + i) % MODEL_POOL.length
    const config = MODEL_POOL[index]

    if (hasQuotaAvailable(config)) {
      lastUsedIndex = index
      return config
    }
  }

  // All configs exhausted
  return null
}

// Track a request for a specific config
export function trackModelRequest(configId: string) {
  const config = MODEL_POOL.find(c => c.id === configId)
  if (!config) return null

  resetQuotaIfNeeded(config)
  config.quota.requestsPerMinute++
  config.quota.requestsPerDay++

  const now = Date.now()
  return {
    configId: config.id,
    modelName: config.modelName,
    rpm: {
      used: config.quota.requestsPerMinute,
      limit: config.limits.RPM,
      remaining: config.limits.RPM - config.quota.requestsPerMinute,
      resetIn: Math.max(0, Math.ceil((config.quota.minuteResetAt - now) / 1000)),
    },
    rpd: {
      used: config.quota.requestsPerDay,
      limit: config.limits.RPD,
      remaining: config.limits.RPD - config.quota.requestsPerDay,
      resetIn: Math.max(0, Math.ceil((config.quota.dayResetAt - now) / 1000)),
    },
  }
}

// Get total quota status across all configs
export function getTotalQuotaStatus() {
  const totalLimits = {
    RPM: MODEL_POOL.reduce((sum, c) => sum + c.limits.RPM, 0),
    RPD: MODEL_POOL.reduce((sum, c) => sum + c.limits.RPD, 0),
  }

  MODEL_POOL.forEach(resetQuotaIfNeeded)

  const totalUsed = {
    RPM: MODEL_POOL.reduce((sum, c) => sum + c.quota.requestsPerMinute, 0),
    RPD: MODEL_POOL.reduce((sum, c) => sum + c.quota.requestsPerDay, 0),
  }

  return {
    rpm: {
      used: totalUsed.RPM,
      limit: totalLimits.RPM,
      remaining: totalLimits.RPM - totalUsed.RPM,
    },
    rpd: {
      used: totalUsed.RPD,
      limit: totalLimits.RPD,
      remaining: totalLimits.RPD - totalUsed.RPD,
    },
    activeConfigs: MODEL_POOL.filter(hasQuotaAvailable).length,
    totalConfigs: MODEL_POOL.length,
  }
}
