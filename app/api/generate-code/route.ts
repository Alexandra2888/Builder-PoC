import { NextRequest, NextResponse } from 'next/server'
import { ChatAnthropic } from '@langchain/anthropic'
import { PromptTemplate } from '@langchain/core/prompts'
import { StringOutputParser } from '@langchain/core/output_parsers'
import { RunnableSequence } from '@langchain/core/runnables'

// Initialize Anthropic model
const model = new ChatAnthropic({
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  modelName: 'claude-3-5-sonnet-20241022',
  temperature: 0.3, // Lower temperature for more consistent code generation
  maxTokens: 8000,
})

// Code generation prompt template
const codePrompt = PromptTemplate.fromTemplate(`
You are an expert Next.js developer. Your task is to generate a complete Next.js project based on the approved design specification.

Design Specification:
{designSpec}

Generate a complete Next.js 15 project with TypeScript, Tailwind CSS, and shadcn/ui components. 

Requirements:
- Use App Router (Next.js 15)
- TypeScript with strict types
- Tailwind CSS for styling
- shadcn/ui components where appropriate
- Responsive design
- Clean, production-ready code
- Follow React best practices and SOLID principles
- Include proper imports and exports
- Use functional components with hooks

Please generate the project files in the following JSON format:
{{
  "projectName": "project-name",
  "description": "Brief project description",
  "files": [
    {{
      "path": "app/layout.tsx",
      "type": "page",
      "content": "file content here"
    }},
    {{
      "path": "components/ui/button.tsx",
      "type": "component", 
      "content": "file content here"
    }}
  ]
}}

File types: "component", "page", "config", "style"

Required files to generate:
1. app/layout.tsx - Root layout
2. app/page.tsx - Main page
3. app/globals.css - Global styles
4. components/ - All custom components from the design
5. lib/utils.ts - Utility functions
6. tailwind.config.js - Tailwind configuration
7. package.json - Dependencies
8. tsconfig.json - TypeScript config
9. next.config.js - Next.js config

Make sure to:
- Import all necessary dependencies
- Use proper TypeScript types
- Include responsive design classes
- Implement the exact components specified in the design
- Use semantic HTML
- Include proper accessibility attributes
- Follow the color scheme and typography from the design
- Make it pixel-perfect to the design specification

Respond with ONLY the JSON format, no additional text or explanation.
`)

// Create the code generation chain
const codeChain = RunnableSequence.from([
  codePrompt,
  model,
  new StringOutputParser()
])

export async function POST(request: NextRequest) {
  try {
    const { designSpec } = await request.json()

    if (!designSpec || typeof designSpec !== 'object') {
      return NextResponse.json(
        { error: 'Valid design specification is required' },
        { status: 400 }
      )
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Anthropic API key is not configured' },
        { status: 500 }
      )
    }

    // Generate code
    const result = await codeChain.invoke({ 
      designSpec: JSON.stringify(designSpec, null, 2) 
    })
    
    // Parse the JSON response
    let projectData
    try {
      // Clean the response (remove any markdown formatting)
      const cleanedResult = result.replace(/```json\n?|\n?```/g, '').trim()
      projectData = JSON.parse(cleanedResult)
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError)
      console.error('AI Response:', result)
      return NextResponse.json(
        { error: 'Failed to parse AI response. Please try again.' },
        { status: 500 }
      )
    }

    // Validate required fields
    if (!projectData.files || !Array.isArray(projectData.files)) {
      return NextResponse.json(
        { error: 'AI response missing required files array' },
        { status: 500 }
      )
    }

    // Validate file structure
    const requiredFiles = ['app/layout.tsx', 'app/page.tsx', 'package.json']
    const generatedPaths = projectData.files.map((f: { path: string }) => f.path)
    const missingFiles = requiredFiles.filter(path => !generatedPaths.includes(path))
    
    if (missingFiles.length > 0) {
      console.warn('Missing some required files:', missingFiles)
    }

    // Enhance the project data
    const project = {
      id: `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: projectData.projectName || 'Generated App',
      description: projectData.description || 'AI-generated Next.js application',
      files: projectData.files.map((file: { path: string; content: string; type?: string }) => ({
        path: file.path,
        content: file.content,
        type: file.type || 'component'
      })),
      designSpec,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json({ project })

  } catch (error) {
    console.error('Code generation error:', error)
    
    // Handle specific error types
    if (error instanceof Error && error.message.includes('API key')) {
      return NextResponse.json(
        { error: 'Authentication failed. Please check your API configuration.' },
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
        { error: 'Design specification too complex. Please try a simpler design.' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: 'An unexpected error occurred while generating code. Please try again.',
        details: process.env.NODE_ENV === 'development' ? error?.toString() : undefined
      },
      { status: 500 }
    )
  }
}
