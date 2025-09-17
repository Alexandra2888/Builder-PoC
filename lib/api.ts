import { DesignSpec, Project } from './store'
import type { CodeReviewResult } from '../app/api/review-code/route'

// API configuration
const API_BASE_URL = '/api'

// Error handling utility
class APIError extends Error {
  constructor(message: string, public status: number, public code?: string) {
    super(message)
    this.name = 'APIError'
  }
}

// Type guards for API responses
function isErrorResponse(data: unknown): data is { error?: string; code?: string } {
  return typeof data === 'object' && data !== null
}

function isValidApiResponse<T>(data: unknown, validator?: (data: unknown) => data is T): data is T {
  if (validator) {
    return validator(data)
  }
  // Basic validation - ensure it's an object
  return typeof data === 'object' && data !== null
}

// Generic API request handler
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  validator?: (data: unknown) => data is T
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    // Handle different response types
    const contentType = response.headers.get('content-type')
    let data: unknown
    
    if (contentType?.includes('application/json')) {
      data = await response.json()
    } else {
      data = { text: await response.text() }
    }

    if (!response.ok) {
      if (isErrorResponse(data)) {
        const errorMessage = data.error || `HTTP ${response.status}`
        const errorCode = data.code
        throw new APIError(errorMessage, response.status, errorCode)
      }
      throw new APIError(`HTTP ${response.status}`, response.status)
    }

    if (!isValidApiResponse(data, validator)) {
      throw new APIError('Invalid response format from server', response.status)
    }

    return data
  } catch (error) {
    if (error instanceof APIError) {
      throw error
    }
    
    // Network or other errors
    console.error('API request failed:', error)
    throw new APIError(
      'Network error. Please check your connection and try again.',
      0
    )
  }
}

// Type validators for API responses
function isDesignResponse(data: unknown): data is { designSpec: DesignSpec } {
  if (typeof data !== 'object' || data === null) {
    return false
  }
  
  const obj = data as Record<string, unknown>
  return (
    'designSpec' in obj &&
    typeof obj.designSpec === 'object' &&
    obj.designSpec !== null
  )
}

function isProjectResponse(data: unknown): data is { project: Project } {
  if (typeof data !== 'object' || data === null) {
    return false
  }
  
  const obj = data as Record<string, unknown>
  return (
    'project' in obj &&
    typeof obj.project === 'object' &&
    obj.project !== null
  )
}

function isReviewResponse(data: unknown): data is { review: CodeReviewResult } {
  if (typeof data !== 'object' || data === null) {
    return false
  }
  
  const obj = data as Record<string, unknown>
  return (
    'review' in obj &&
    typeof obj.review === 'object' &&
    obj.review !== null
  )
}

// Design generation API
export async function generateDesign(prompt: string): Promise<DesignSpec> {
  const response = await apiRequest<{ designSpec: DesignSpec }>(
    '/generate-design',
    {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    },
    isDesignResponse
  )
  
  return response.designSpec
}

// Code generation API
export async function generateCode(designSpec: DesignSpec): Promise<Project> {
  const response = await apiRequest<{ project: Project }>(
    '/generate-code',
    {
      method: 'POST',
      body: JSON.stringify({ designSpec }),
    },
    isProjectResponse
  )
  
  return response.project
}

// Code review API
export async function reviewCode(project: Project): Promise<CodeReviewResult> {
  const response = await apiRequest<{ review: CodeReviewResult }>(
    '/review-code',
    {
      method: 'POST',
      body: JSON.stringify({ project }),
    },
    isReviewResponse
  )
  
  return response.review
}

// Utility functions
export function getErrorMessage(error: unknown): string {
  if (error instanceof APIError) {
    return error.message
  }
  
  if (error instanceof Error) {
    return error.message
  }
  
  return 'An unexpected error occurred'
}

export function isAPIError(error: unknown): error is APIError {
  return error instanceof APIError
}

// Rate limiting and retry logic
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: unknown
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      
      // Don't retry on client errors (4xx) except for rate limiting (429)
      if (isAPIError(error) && error.status >= 400 && error.status < 500 && error.status !== 429) {
        throw error
      }
      
      // Wait before retrying (exponential backoff)
      if (attempt < maxAttempts) {
        const delay = delayMs * Math.pow(2, attempt - 1)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }
  
  throw lastError
}

// Enhanced API functions with retry logic
export async function generateDesignWithRetry(prompt: string): Promise<DesignSpec> {
  return withRetry(() => generateDesign(prompt))
}

export async function generateCodeWithRetry(designSpec: DesignSpec): Promise<Project> {
  return withRetry(() => generateCode(designSpec))
}

export async function reviewCodeWithRetry(project: Project): Promise<CodeReviewResult> {
  return withRetry(() => reviewCode(project))
}

// Health check
export async function checkAPIHealth(): Promise<{ status: 'ok' | 'error', timestamp: string }> {
  try {
    // Simple health check - we could add a dedicated health endpoint
    const response = await fetch('/api/health', { method: 'GET' })
    return {
      status: response.ok ? 'ok' : 'error',
      timestamp: new Date().toISOString()
    }
  } catch {
    return {
      status: 'error',
      timestamp: new Date().toISOString()
    }
  }
}

// Export types for consumers
export type { APIError }
