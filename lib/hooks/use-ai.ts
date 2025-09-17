import { useState, useCallback } from 'react'
import { useAppStore } from '../store'
import { 
  generateDesignWithRetry, 
  generateCodeWithRetry,
  reviewCodeWithRetry,
  getErrorMessage,
  isAPIError 
} from '../api'
import { toast } from 'sonner'

// Hook for design generation
export function useDesignGeneration() {
  const {
    setCurrentDesign,
    setIsGeneratingDesign,
    addToDesignHistory,
    setCurrentPrompt
  } = useAppStore()
  
  const [error, setError] = useState<string | null>(null)

  const generateDesign = useCallback(async (prompt: string) => {
    if (!prompt.trim()) {
      toast.error('Please enter a description for your app')
      return
    }

    setError(null)
    setIsGeneratingDesign(true)
    setCurrentPrompt(prompt)

    try {
      toast.loading('Generating design...', { id: 'design-generation' })
      
      const designSpec = await generateDesignWithRetry(prompt)
      
      // Update store
      setCurrentDesign(designSpec)
      addToDesignHistory(designSpec)
      
      toast.success('Design generated successfully!', { id: 'design-generation' })
      
      return designSpec
    } catch (error) {
      const errorMessage = getErrorMessage(error)
      setError(errorMessage)
      
      // Show specific error messages
      if (isAPIError(error)) {
        if (error.status === 401) {
          toast.error('API authentication failed. Please check your configuration.', 
            { id: 'design-generation' })
        } else if (error.status === 429) {
          toast.error('Rate limit exceeded. Please wait a moment and try again.', 
            { id: 'design-generation' })
        } else {
          toast.error(errorMessage, { id: 'design-generation' })
        }
      } else {
        toast.error('Failed to generate design. Please try again.', 
          { id: 'design-generation' })
      }
      
      console.error('Design generation failed:', error)
    } finally {
      setIsGeneratingDesign(false)
    }
  }, [setCurrentDesign, setIsGeneratingDesign, addToDesignHistory, setCurrentPrompt])

  return {
    generateDesign,
    error,
    clearError: () => setError(null)
  }
}

// Hook for code generation
export function useCodeGeneration() {
  const {
    currentDesign,
    setCurrentProject,
    setIsGeneratingCode,
    addProject,
    setActiveTab
  } = useAppStore()
  
  const [error, setError] = useState<string | null>(null)

  const generateCode = useCallback(async () => {
    if (!currentDesign) {
      toast.error('No design available for code generation')
      return
    }

    if (currentDesign.status !== 'approved') {
      toast.error('Please approve the design before generating code')
      return
    }

    setError(null)
    setIsGeneratingCode(true)

    try {
      toast.loading('Generating Next.js project...', { id: 'code-generation' })
      
      const project = await generateCodeWithRetry(currentDesign)
      
      // Update store
      setCurrentProject(project)
      addProject(project)
      
      // Switch to code tab
      setActiveTab('code')
      
      toast.success('Code generated successfully!', { id: 'code-generation' })
      
      return project
    } catch (error) {
      const errorMessage = getErrorMessage(error)
      setError(errorMessage)
      
      // Show specific error messages
      if (isAPIError(error)) {
        if (error.status === 401) {
          toast.error('API authentication failed. Please check your configuration.', 
            { id: 'code-generation' })
        } else if (error.status === 429) {
          toast.error('Rate limit exceeded. Please wait a moment and try again.', 
            { id: 'code-generation' })
        } else if (error.status === 400 && errorMessage.includes('too complex')) {
          toast.error('Design is too complex. Please try a simpler design.', 
            { id: 'code-generation' })
        } else {
          toast.error(errorMessage, { id: 'code-generation' })
        }
      } else {
        toast.error('Failed to generate code. Please try again.', 
          { id: 'code-generation' })
      }
      
      console.error('Code generation failed:', error)
    } finally {
      setIsGeneratingCode(false)
    }
  }, [
    currentDesign, 
    setCurrentProject, 
    setIsGeneratingCode, 
    addProject, 
    setActiveTab
  ])

  return {
    generateCode,
    error,
    clearError: () => setError(null)
  }
}

// Hook for design approval workflow
export function useDesignApproval() {
  const { 
    currentDesign, 
    setCurrentDesign, 
    addToDesignHistory,
    setActiveTab
  } = useAppStore()
  
  const approveDesign = useCallback(() => {
    if (!currentDesign) return

    const approvedDesign = {
      ...currentDesign,
      status: 'approved' as const,
      updatedAt: new Date()
    }

    setCurrentDesign(approvedDesign)
    addToDesignHistory(approvedDesign)
    
    toast.success('Design approved! Ready for code generation.')
    
    // Automatically switch to code tab
    setTimeout(() => {
      setActiveTab('code')
    }, 1000)
  }, [currentDesign, setCurrentDesign, addToDesignHistory, setActiveTab])

  const rejectDesign = useCallback(() => {
    if (!currentDesign) return

    const rejectedDesign = {
      ...currentDesign,
      status: 'rejected' as const,
      updatedAt: new Date()
    }

    setCurrentDesign(rejectedDesign)
    addToDesignHistory(rejectedDesign)
    
    toast.error('Design rejected. Please modify your prompt and try again.')
  }, [currentDesign, setCurrentDesign, addToDesignHistory])

  const requestChanges = useCallback(async (feedback: string) => {
    if (!currentDesign || !feedback.trim()) return

    // Create a more detailed prompt incorporating the feedback
    const enhancedPrompt = `${currentDesign.prompt}

IMPORTANT DESIGN CHANGES REQUESTED:
${feedback}

Please update the design specification to incorporate these changes, especially focusing on:
- Colors and color palette if mentioned
- Layout modifications if requested
- Component changes if specified
- Styling adjustments as needed

Make sure the updated design reflects all the requested changes while maintaining consistency with the original concept.`
    
    return enhancedPrompt
  }, [currentDesign])

  return {
    approveDesign,
    rejectDesign,
    requestChanges
  }
}

// Hook for code review
export function useCodeReview() {
  const {
    currentProject,
    setCurrentReview,
    setIsReviewingCode,
    addToReviewHistory
  } = useAppStore()
  
  const [error, setError] = useState<string | null>(null)

  const reviewCode = useCallback(async () => {
    if (!currentProject) {
      toast.error('No project available for code review')
      return
    }

    if (!currentProject.files || currentProject.files.length === 0) {
      toast.error('No files found in project for review')
      return
    }

    setError(null)
    setIsReviewingCode(true)

    try {
      toast.loading('Analyzing code with AI...', { id: 'code-review' })
      
      const reviewResult = await reviewCodeWithRetry(currentProject)
      
      // Update store
      setCurrentReview(reviewResult)
      addToReviewHistory(reviewResult)
      
      // Show success toast with score
      const score = reviewResult.overall.score
      
      toast.success(
        `Code review completed! Score: ${score}/100`, 
        { id: 'code-review' }
      )
      
      return reviewResult
    } catch (error) {
      const errorMessage = getErrorMessage(error)
      setError(errorMessage)
      
      // Show specific error messages
      if (isAPIError(error)) {
        if (error.status === 401) {
          toast.error('OpenAI authentication failed. Please check your API configuration.', 
            { id: 'code-review' })
        } else if (error.status === 429) {
          toast.error('Rate limit exceeded. Please wait a moment and try again.', 
            { id: 'code-review' })
        } else if (error.status === 400 && errorMessage.includes('too large')) {
          toast.error('Project too large for review. Please try with fewer files.', 
            { id: 'code-review' })
        } else {
          toast.error(errorMessage, { id: 'code-review' })
        }
      } else {
        toast.error('Failed to review code. Please try again.', 
          { id: 'code-review' })
      }
      
      console.error('Code review failed:', error)
    } finally {
      setIsReviewingCode(false)
    }
  }, [currentProject, setCurrentReview, setIsReviewingCode, addToReviewHistory])

  return {
    reviewCode,
    error,
    clearError: () => setError(null)
  }
}

// Combined hook for convenience
export function useAI() {
  const designGeneration = useDesignGeneration()
  const codeGeneration = useCodeGeneration()
  const designApproval = useDesignApproval()
  const codeReview = useCodeReview()

  return {
    ...designGeneration,
    ...codeGeneration,
    ...designApproval,
    ...codeReview,
    // Add a combined error state
    hasError: !!(designGeneration.error || codeGeneration.error || codeReview.error),
    clearAllErrors: () => {
      designGeneration.clearError()
      codeGeneration.clearError()
      codeReview.clearError()
    }
  }
}
