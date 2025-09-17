import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface CodeReviewItem {
  file: string
  line?: number
  severity: 'error' | 'warning' | 'info' | 'suggestion'
  category: 'security' | 'performance' | 'best-practices' | 'maintainability' | 'accessibility' | 'type-safety'
  title: string
  description: string
  suggestion?: string
  codeSnippet?: string
}

export interface CodeReviewResult {
  reviewId: string
  overall: {
    score: number // 0-100
    summary: string
    recommendations: string[]
  }
  issues: CodeReviewItem[]
  strengths: string[]
  createdAt: string
}

// Code review prompt template
const createReviewPrompt = (files: Array<{ path: string; content: string; type: string }>) => `
You are an expert code reviewer specializing in React, Next.js, TypeScript, and modern web development best practices.

Please perform a comprehensive code review of this Next.js project. Analyze the code for:

1. **Security Issues**: XSS vulnerabilities, unsafe data handling, authentication flaws
2. **Performance**: Bundle size, rendering optimization, async operations
3. **Best Practices**: React patterns, TypeScript usage, code organization
4. **Maintainability**: Code readability, reusability, documentation
5. **Accessibility**: ARIA labels, keyboard navigation, semantic HTML
6. **Type Safety**: Proper TypeScript usage, type definitions

Files to review:
${files.map(file => `
**${file.path}** (${file.type}):
\`\`\`${getLanguageFromPath(file.path)}
${file.content}
\`\`\`
`).join('\n')}

Please provide your review in the following JSON format:

{
  "overall": {
    "score": 85,
    "summary": "Overall assessment of the code quality",
    "recommendations": ["Key recommendations for improvement"]
  },
  "issues": [
    {
      "file": "path/to/file.tsx",
      "line": 42,
      "severity": "warning",
      "category": "performance",
      "title": "Issue title",
      "description": "Detailed explanation of the issue",
      "suggestion": "How to fix this issue",
      "codeSnippet": "relevant code snippet if applicable"
    }
  ],
  "strengths": [
    "List of things done well in the codebase"
  ]
}

Focus on:
- Critical security vulnerabilities (mark as 'error')
- Performance bottlenecks (mark as 'warning' or 'error')
- TypeScript best practices
- React hooks usage
- Component architecture
- Bundle optimization opportunities
- Accessibility improvements
- Code maintainability

Be constructive and provide actionable feedback with specific suggestions for improvement.
`

function getLanguageFromPath(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'tsx':
    case 'jsx':
      return 'typescript'
    case 'ts':
      return 'typescript'
    case 'js':
      return 'javascript'
    case 'json':
      return 'json'
    case 'css':
      return 'css'
    case 'md':
      return 'markdown'
    default:
      return 'text'
  }
}

export async function POST(request: NextRequest) {
  try {
    const { project } = await request.json()

    if (!project || !project.files || !Array.isArray(project.files)) {
      return NextResponse.json(
        { error: 'Valid project with files array is required' },
        { status: 400 }
      )
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      )
    }

    // Filter files to review (exclude large files and certain file types)
    const filesToReview = project.files.filter((file: { path: string; content: string; type: string }) => {
      const isCodeFile = file.path.match(/\.(tsx?|jsx?|css|json)$/i)
      const isNotTooLarge = file.content.length < 10000 // Skip very large files
      const isNotNodeModules = !file.path.includes('node_modules')
      
      return isCodeFile && isNotTooLarge && isNotNodeModules
    }).slice(0, 10) // Limit to first 10 files to avoid token limits

    if (filesToReview.length === 0) {
      return NextResponse.json(
        { error: 'No reviewable code files found in the project' },
        { status: 400 }
      )
    }

    // Create the review prompt
    const prompt = createReviewPrompt(filesToReview)

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert code reviewer. Provide detailed, constructive feedback in the exact JSON format requested. Be thorough but practical in your suggestions.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.1, // Low temperature for consistent, focused reviews
      max_tokens: 4000,
      response_format: { type: 'json_object' }
    })

    const reviewContent = response.choices[0]?.message?.content
    if (!reviewContent) {
      throw new Error('No review content received from OpenAI')
    }

    // Parse the JSON response
    let reviewData
    try {
      reviewData = JSON.parse(reviewContent)
    } catch (parseError) {
      console.error('Failed to parse OpenAI review response:', parseError)
      console.error('OpenAI Response:', reviewContent)
      return NextResponse.json(
        { error: 'Failed to parse review response. Please try again.' },
        { status: 500 }
      )
    }

    // Validate required fields
    if (!reviewData.overall || !reviewData.issues || !reviewData.strengths) {
      return NextResponse.json(
        { error: 'Invalid review response format' },
        { status: 500 }
      )
    }

    // Create the final review result
    const reviewResult: CodeReviewResult = {
      reviewId: `review-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      overall: {
        score: Math.min(100, Math.max(0, reviewData.overall.score || 70)),
        summary: reviewData.overall.summary || 'Code review completed',
        recommendations: Array.isArray(reviewData.overall.recommendations) 
          ? reviewData.overall.recommendations 
          : []
      },
      issues: Array.isArray(reviewData.issues) ? reviewData.issues.map((issue: {
        file?: string;
        line?: number;
        severity?: string;
        category?: string;
        title?: string;
        description?: string;
        suggestion?: string;
        codeSnippet?: string;
      }) => ({
        file: issue.file || 'unknown',
        line: issue.line,
        severity: (issue.severity && ['error', 'warning', 'info', 'suggestion'].includes(issue.severity)) 
          ? issue.severity as 'error' | 'warning' | 'info' | 'suggestion'
          : 'info',
        category: (issue.category && ['security', 'performance', 'best-practices', 'maintainability', 'accessibility', 'type-safety'].includes(issue.category))
          ? issue.category as 'security' | 'performance' | 'best-practices' | 'maintainability' | 'accessibility' | 'type-safety'
          : 'best-practices',
        title: issue.title || 'Issue detected',
        description: issue.description || 'No description provided',
        suggestion: issue.suggestion,
        codeSnippet: issue.codeSnippet
      })) : [],
      strengths: Array.isArray(reviewData.strengths) ? reviewData.strengths : [],
      createdAt: new Date().toISOString()
    }

    return NextResponse.json({ review: reviewResult })

  } catch (error) {
    console.error('Code review error:', error)
    
    // Handle specific error types
    if (error instanceof Error && error.message.includes('API key')) {
      return NextResponse.json(
        { error: 'OpenAI authentication failed. Please check your API configuration.' },
        { status: 401 }
      )
    }
    
    if (error instanceof Error && error.message.includes('rate limit')) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      )
    }

    if (error instanceof Error && error.message.includes('context_length')) {
      return NextResponse.json(
        { error: 'Project too large for review. Please try with fewer files.' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: 'An unexpected error occurred during code review. Please try again.',
        details: process.env.NODE_ENV === 'development' ? error?.toString() : undefined
      },
      { status: 500 }
    )
  }
}
