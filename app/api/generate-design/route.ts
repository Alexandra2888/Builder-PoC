import { NextRequest, NextResponse } from 'next/server'
import { ChatAnthropic } from '@langchain/anthropic'
import { PromptTemplate } from '@langchain/core/prompts'
import { StringOutputParser } from '@langchain/core/output_parsers'
import { RunnableSequence } from '@langchain/core/runnables'

// Initialize Anthropic model
const model = new ChatAnthropic({
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  modelName: 'claude-3-5-sonnet-20241022',
  temperature: 0.7,
  maxTokens: 4000,
})

// Design generation prompt template
const designPrompt = PromptTemplate.fromTemplate(`
You are an expert UI/UX designer and React developer. Your task is to analyze a user's app description and create a comprehensive design specification.

User's App Description:
{prompt}

IMPORTANT: If the user requests changes to a previous design (indicated by phrases like "change the color", "make it more blue", "different layout", etc.), pay special attention to those specific change requests and ensure they are fully implemented in the new design.

Please create a detailed design specification in the following JSON format:
{{
  "description": "A comprehensive description of the design concept and approach",
  "layout": "Choose from: dashboard, landing-page, blog, e-commerce, portfolio, admin-panel, or app",
  "styling": {{
    "theme": "Choose from: light, dark, or system",
    "colorPalette": {{
      "primary": "hex color code (main brand color)",
      "secondary": "hex color code (complementary color)", 
      "accent": "hex color code (highlight/action color)"
    }},
    "typography": {{
      "fontFamily": "font name",
      "scale": "Choose from: sm, md, lg"
    }}
  }},
  "components": [
    {{
      "id": "unique-id",
      "type": "component-type",
      "name": "ComponentName",
      "props": {{
        "key": "value"
      }},
      "children": []
    }}
  ]
}}

Design Guidelines:
- Create modern, clean, and responsive designs
- Use semantic HTML and accessible components
- Follow React best practices
- Choose appropriate shadcn/ui components
- Ensure the design matches the user's requirements
- Create a logical component hierarchy
- Include proper color schemes and typography
- Make it production-ready

Focus on creating a design that is:
1. User-friendly and intuitive
2. Visually appealing and modern
3. Technically feasible with Next.js + Tailwind + shadcn/ui
4. Responsive across devices
5. Accessible and semantic

Please respond with ONLY the JSON specification, no additional text or explanation.
`)

// Create the design generation chain
const designChain = RunnableSequence.from([
  designPrompt,
  model,
  new StringOutputParser()
])

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: 'Valid prompt is required' },
        { status: 400 }
      )
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Anthropic API key is not configured' },
        { status: 500 }
      )
    }

    // Generate design specification
    const result = await designChain.invoke({ prompt: prompt.trim() })
    
    // Parse the JSON response
    let designSpec
    try {
      // Clean the response (remove any markdown formatting)
      const cleanedResult = result.replace(/```json\n?|\n?```/g, '').trim()
      designSpec = JSON.parse(cleanedResult)
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError)
      console.error('AI Response:', result)
      return NextResponse.json(
        { error: 'Failed to parse AI response. Please try again.' },
        { status: 500 }
      )
    }

    // Validate required fields
    const requiredFields = ['description', 'layout', 'styling', 'components']
    const missingFields = requiredFields.filter(field => !designSpec[field])
    
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields)
      return NextResponse.json(
        { error: `AI response missing required fields: ${missingFields.join(', ')}` },
        { status: 500 }
      )
    }

    // Add metadata
    const enhancedDesignSpec = {
      id: `design-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${Math.floor(Math.random() * 1000)}`,
      prompt,
      ...designSpec,
      createdAt: new Date().toISOString(),
      status: 'completed' as const
    }

    return NextResponse.json({ designSpec: enhancedDesignSpec })

  } catch (error) {
    console.error('Design generation error:', error)
    
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

    return NextResponse.json(
      { 
        error: 'An unexpected error occurred while generating the design. Please try again.',
        details: process.env.NODE_ENV === 'development' ? error?.toString() : undefined
      },
      { status: 500 }
    )
  }
}
