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

// Design generation prompt template for Figma-like designs
const designPrompt = PromptTemplate.fromTemplate(`
You are an expert UI/UX designer creating Figma-style design specifications. Your task is to analyze a user's app description and create a comprehensive design with proper placeholder text, frames, and components as would appear in Figma.

User's App Description:
{prompt}

IMPORTANT: If the user requests changes to a previous design (indicated by phrases like "change the color", "make it more blue", "different layout", etc.), pay special attention to those specific change requests and ensure they are fully implemented in the new design.

Create a detailed Figma-style design specification in the following JSON format:
{{
  "description": "A comprehensive description of the design concept and approach",
  "layout": "Choose from: dashboard, landing-page, blog, e-commerce, portfolio, admin-panel, or app",
  "artboardSize": {{
    "width": 1440,
    "height": 1024,
    "name": "Desktop"
  }},
  "styling": {{
    "theme": "Choose from: light, dark, or system",
    "colorPalette": {{
      "primary": "hex color code (main brand color)",
      "secondary": "hex color code (complementary color)", 
      "accent": "hex color code (highlight/action color)",
      "background": "hex color code (background color)",
      "surface": "hex color code (card/surface color)",
      "text": "hex color code (primary text color)",
      "textSecondary": "hex color code (secondary text color)"
    }},
    "typography": {{
      "fontFamily": "Inter, system-ui, sans-serif",
      "scale": "Choose from: sm, md, lg",
      "headingSize": "text size for headings",
      "bodySize": "text size for body text",
      "captionSize": "text size for captions"
    }}
  }},
  "frames": [
    {{
      "id": "frame-1",
      "name": "Main Frame",
      "x": 0,
      "y": 0,
      "width": 1440,
      "height": 1024,
      "backgroundColor": "#FFFFFF",
      "elements": [
        {{
          "id": "element-1",
          "type": "text",
          "content": "Actual placeholder text like 'Welcome to Dashboard' or 'Product Title'",
          "x": 100,
          "y": 50,
          "width": 300,
          "height": 40,
          "fontSize": 32,
          "fontWeight": "600",
          "color": "#1F2937",
          "fontFamily": "Inter"
        }},
        {{
          "id": "element-2",
          "type": "rectangle",
          "x": 100,
          "y": 120,
          "width": 400,
          "height": 200,
          "backgroundColor": "#F3F4F6",
          "borderRadius": 8,
          "border": {{
            "width": 1,
            "color": "#E5E7EB"
          }}
        }},
        {{
          "id": "element-3",
          "type": "text",
          "content": "Realistic placeholder like 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor.'",
          "x": 120,
          "y": 200,
          "width": 360,
          "height": 60,
          "fontSize": 16,
          "fontWeight": "400",
          "color": "#6B7280",
          "fontFamily": "Inter",
          "lineHeight": 1.5
        }},
        {{
          "id": "element-4",
          "type": "button",
          "content": "Get Started",
          "x": 120,
          "y": 280,
          "width": 140,
          "height": 40,
          "backgroundColor": "#3B82F6",
          "textColor": "#FFFFFF",
          "borderRadius": 6,
          "fontSize": 14,
          "fontWeight": "500"
        }}
      ]
    }}
  ],
  "textStyles": {{
    "heading1": {{ "fontSize": 48, "fontWeight": "700", "lineHeight": 1.2 }},
    "heading2": {{ "fontSize": 36, "fontWeight": "600", "lineHeight": 1.3 }},
    "heading3": {{ "fontSize": 24, "fontWeight": "600", "lineHeight": 1.4 }},
    "body": {{ "fontSize": 16, "fontWeight": "400", "lineHeight": 1.6 }},
    "caption": {{ "fontSize": 14, "fontWeight": "400", "lineHeight": 1.5 }}
  }},
  "placeholderTexts": {{
    "headings": ["Welcome to Our Platform", "Create Something Amazing", "Your Journey Starts Here"],
    "descriptions": [
      "Transform your ideas into reality with our powerful tools and intuitive interface.",
      "Join thousands of users who trust our platform for their creative projects.",
      "Experience the perfect blend of functionality and beautiful design."
    ],
    "buttons": ["Get Started", "Learn More", "Sign Up", "Try Now", "Explore"],
    "navigation": ["Home", "About", "Services", "Contact", "Dashboard", "Profile"],
    "content": [
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."
    ]
  }}
}}

Design Guidelines for Figma-style Output:
- Use realistic placeholder text that matches the design purpose
- Include actual measurements (x, y, width, height) for precise positioning
- Specify exact colors in hex format
- Use proper typography hierarchy with specific font sizes and weights
- Create frame-based layouts as Figma does
- Include text styles for consistency
- Add realistic button labels and navigation items
- Use proper spacing and alignment
- Include background colors and surface styles
- Make elements look like real Figma components with proper styling

Focus on creating a design that:
1. Has realistic placeholder content
2. Uses proper Figma-style measurements and positioning
3. Includes comprehensive text styles and color schemes
4. Has frame-based organization
5. Contains actionable and meaningful placeholder text

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

    // Validate required fields for Figma-style design
    const requiredFields = ['description', 'layout', 'styling']
    const missingFields = requiredFields.filter(field => !designSpec[field])
    
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields)
      return NextResponse.json(
        { error: `AI response missing required fields: ${missingFields.join(', ')}` },
        { status: 500 }
      )
    }

    // Validate Figma-style structure
    if (!designSpec.frames && !designSpec.components) {
      console.error('Design spec must have either frames or components')
      return NextResponse.json(
        { error: 'Design specification must include either frames or components' },
        { status: 500 }
      )
    }

    // Add metadata and ensure proper date format
    const enhancedDesignSpec = {
      id: `design-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${Math.floor(Math.random() * 1000)}`,
      prompt,
      ...designSpec,
      createdAt: new Date(),
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
