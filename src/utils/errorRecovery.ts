// src/utils/errorRecovery.ts
export const retryWithBackoff = async <T>(
    fn: () => Promise<T>,
    maxRetries = 3
  ): Promise<T> => {
    let attempt = 0
    
    while (attempt <= maxRetries) {
      try {
        return await fn()
      } catch (error) {
        if (attempt === maxRetries) throw error
        
        const delay = Math.pow(2, attempt) * 1000
        await new Promise(resolve => setTimeout(resolve, delay))
        attempt++
      }
    }
    
    throw new Error('Max retries exceeded')
}  