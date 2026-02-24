import { MODEL_POOL, getAvailableModelConfig, trackModelRequest, getTotalQuotaStatus } from '@/lib/services/model-pool'

describe('Model Pool', () => {
  beforeEach(() => {
    // Reset all quotas
    MODEL_POOL.forEach(config => {
      config.quota.requestsPerMinute = 0
      config.quota.requestsPerDay = 0
      config.quota.minuteResetAt = Date.now() + 60000
      config.quota.dayResetAt = Date.now() + 86400000
    })
  })

  it('should initialize with correct number of configs', () => {
    // 3 API keys × 3 models = 9 configs (if all keys are available)
    expect(MODEL_POOL.length).toBeGreaterThan(0)
    expect(MODEL_POOL.length).toBeLessThanOrEqual(9)
  })

  it('should have correct model names', () => {
    const modelNames = MODEL_POOL.map(c => c.modelName)
    const validModels = ['gemini-2.5-flash-lite', 'gemini-2.5-flash', 'gemini-2.5-pro']

    modelNames.forEach(name => {
      expect(validModels).toContain(name)
    })
  })

  it('should have correct limits for each model', () => {
    const flashLite = MODEL_POOL.find(c => c.modelName === 'gemini-2.5-flash-lite')
    const flash = MODEL_POOL.find(c => c.modelName === 'gemini-2.5-flash')
    const pro = MODEL_POOL.find(c => c.modelName === 'gemini-2.5-pro')

    if (flashLite) {
      expect(flashLite.limits.RPM).toBe(15)
      expect(flashLite.limits.RPD).toBe(1000)
    }

    if (flash) {
      expect(flash.limits.RPM).toBe(10)
      expect(flash.limits.RPD).toBe(250)
    }

    if (pro) {
      expect(pro.limits.RPM).toBe(5)
      expect(pro.limits.RPD).toBe(100)
    }
  })

  it('should get an available model config', () => {
    const config = getAvailableModelConfig()
    expect(config).not.toBeNull()

    if (config) {
      expect(config.apiKey).toBeTruthy()
      expect(config.modelName).toBeTruthy()
      expect(config.limits).toBeTruthy()
    }
  })

  it('should track requests correctly', () => {
    const config = getAvailableModelConfig()
    if (!config) return

    const status1 = trackModelRequest(config.id)
    expect(status1).not.toBeNull()

    if (status1) {
      expect(status1.rpm.used).toBe(1)
      expect(status1.rpd.used).toBe(1)
      expect(status1.configId).toBe(config.id)
      expect(status1.modelName).toBe(config.modelName)
    }

    const status2 = trackModelRequest(config.id)
    if (status2) {
      expect(status2.rpm.used).toBe(2)
      expect(status2.rpd.used).toBe(2)
    }
  })

  it('should rotate to next config when current is exhausted', () => {
    const config1 = getAvailableModelConfig()
    if (!config1) return

    // Exhaust first config RPM
    for (let i = 0; i < config1.limits.RPM; i++) {
      trackModelRequest(config1.id)
    }

    const config2 = getAvailableModelConfig()
    expect(config2).not.toBeNull()

    if (config2) {
      // Should get a different config
      expect(config2.id).not.toBe(config1.id)
    }
  })

  it('should get total quota status', () => {
    const status = getTotalQuotaStatus()

    expect(status.rpm).toBeDefined()
    expect(status.rpd).toBeDefined()
    expect(status.rpm.limit).toBeGreaterThan(0)
    expect(status.rpd.limit).toBeGreaterThan(0)
    expect(status.activeConfigs).toBeGreaterThan(0)
    expect(status.totalConfigs).toBe(MODEL_POOL.length)
  })

  it('should return null when all configs exhausted', () => {
    // Exhaust all configs
    MODEL_POOL.forEach(config => {
      config.quota.requestsPerMinute = config.limits.RPM
      config.quota.requestsPerDay = config.limits.RPD
    })

    const config = getAvailableModelConfig()
    expect(config).toBeNull()
  })
})
