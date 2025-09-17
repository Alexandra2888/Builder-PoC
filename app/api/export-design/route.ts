import { NextRequest, NextResponse } from 'next/server'

// Type definitions for Figma-style design
interface FigmaElement {
  id: string
  type: 'text' | 'rectangle' | 'button' | 'image'
  content?: string
  x: number
  y: number
  width: number
  height: number
  fontSize?: number
  fontWeight?: string
  color?: string
  backgroundColor?: string
  borderRadius?: number
  border?: {
    width: number
    color: string
  }
  textColor?: string
  fontFamily?: string
  lineHeight?: number
}

interface FigmaFrame {
  id: string
  name: string
  x: number
  y: number
  width: number
  height: number
  backgroundColor: string
  elements: FigmaElement[]
}

interface FigmaDesignSpec {
  frames: FigmaFrame[]
  artboardSize: {
    width: number
    height: number
    name: string
  }
  styling: {
    colorPalette: {
      primary: string
      secondary: string
      accent: string
      background: string
      surface: string
      text: string
      textSecondary: string
    }
  }
}

// Generate SVG content from Figma design specification
function generateSVG(designSpec: FigmaDesignSpec): string {
  const { artboardSize, frames, styling } = designSpec
  const { width, height } = artboardSize

  // Start SVG with proper namespace and dimensions
  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" 
     xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <!-- Generated Figma-style Design -->
  <defs>
    <style type="text/css">
      .figma-text { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
      .heading1 { font-size: 48px; font-weight: 700; }
      .heading2 { font-size: 36px; font-weight: 600; }
      .heading3 { font-size: 24px; font-weight: 600; }
      .body { font-size: 16px; font-weight: 400; }
      .caption { font-size: 14px; font-weight: 400; }
    </style>
  </defs>
  
  <!-- Background -->
  <rect width="100%" height="100%" fill="${styling.colorPalette.background || '#FFFFFF'}"/>
`

  // Generate frames and elements
  frames.forEach(frame => {
    // Frame background
    if (frame.backgroundColor) {
      svg += `  <!-- Frame: ${frame.name} -->
  <rect x="${frame.x}" y="${frame.y}" width="${frame.width}" height="${frame.height}" 
        fill="${frame.backgroundColor}" rx="0"/>
`
    }

    // Frame elements
    frame.elements.forEach(element => {
      switch (element.type) {
        case 'rectangle':
          svg += `  <rect x="${element.x}" y="${element.y}" width="${element.width}" height="${element.height}" 
                    fill="${element.backgroundColor || '#F3F4F6'}" 
                    ${element.borderRadius ? `rx="${element.borderRadius}"` : ''}
                    ${element.border ? `stroke="${element.border.color}" stroke-width="${element.border.width}"` : ''}/>
`
          break

        case 'text':
          const fontSize = element.fontSize || 16
          const fontWeight = element.fontWeight || '400'
          const color = element.color || '#1F2937'
          const fontFamily = element.fontFamily || 'Inter'
          
          svg += `  <text x="${element.x}" y="${element.y + fontSize}" 
                    font-family="${fontFamily}" font-size="${fontSize}" font-weight="${fontWeight}" 
                    fill="${color}" class="figma-text">
    ${escapeXml(element.content || 'Sample Text')}
  </text>
`
          break

        case 'button':
          const buttonBg = element.backgroundColor || styling.colorPalette.primary
          const buttonText = element.textColor || '#FFFFFF'
          const buttonFontSize = element.fontSize || 14
          const buttonRadius = element.borderRadius || 6

          // Button background
          svg += `  <rect x="${element.x}" y="${element.y}" width="${element.width}" height="${element.height}" 
                    fill="${buttonBg}" rx="${buttonRadius}"/>
`
          // Button text (centered)
          const textY = element.y + (element.height / 2) + (buttonFontSize / 3)
          const textX = element.x + (element.width / 2)
          
          svg += `  <text x="${textX}" y="${textY}" 
                    font-family="Inter" font-size="${buttonFontSize}" font-weight="500" 
                    fill="${buttonText}" text-anchor="middle" class="figma-text">
    ${escapeXml(element.content || 'Button')}
  </text>
`
          break

        case 'image':
          // Placeholder image rectangle
          svg += `  <rect x="${element.x}" y="${element.y}" width="${element.width}" height="${element.height}" 
                    fill="#E5E7EB" stroke="#D1D5DB" stroke-width="1" 
                    ${element.borderRadius ? `rx="${element.borderRadius}"` : ''}/>
  <text x="${element.x + element.width/2}" y="${element.y + element.height/2}" 
        font-family="Inter" font-size="12" fill="#6B7280" text-anchor="middle" class="figma-text">
    Image Placeholder
  </text>
`
          break
      }
    })
  })

  svg += '</svg>'
  return svg
}

// Helper function to escape XML characters
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function POST(request: NextRequest) {
  try {
    const { designSpec, format = 'svg' } = await request.json()

    if (!designSpec) {
      return NextResponse.json(
        { error: 'Design specification is required' },
        { status: 400 }
      )
    }

    if (format === 'svg') {
      // Generate SVG content
      const svgContent = generateSVG(designSpec)
      
      return new NextResponse(svgContent, {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Content-Disposition': `attachment; filename="design-export-${Date.now()}.svg"`
        }
      })
    }

    if (format === 'json') {
      // Export as structured JSON that could be used with a Figma plugin
      const jsonContent = JSON.stringify(designSpec, null, 2)
      
      return new NextResponse(jsonContent, {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="figma-spec-${Date.now()}.json"`
        }
      })
    }

    return NextResponse.json(
      { error: 'Supported formats: svg, json' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Export failed:', error)
    return NextResponse.json(
      { error: 'Failed to export design' },
      { status: 500 }
    )
  }
}
