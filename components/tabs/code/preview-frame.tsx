'use client'

import { useState } from 'react'
import { Project } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  RefreshCw, 
  ExternalLink,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

interface PreviewFrameProps {
  project: Project
}


export function PreviewFrame({ project }: PreviewFrameProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [previewReady, setPreviewReady] = useState(true) // Changed to true for immediate preview
  const [error, setError] = useState<string | null>(null)

  // Generate preview using the same logic as design mockup
  const generatePreviewFromProject = () => {
    const { designSpec } = project
    const { layout, styling } = designSpec

    return (
      <div className="w-full h-full">
        {layout === 'e-commerce' ? (
          <div className="w-full h-full">
            {/* E-commerce preview - matches design mockup exactly */}
            <div className="h-16 bg-white border-b flex items-center px-6">
              <div className="text-xl font-bold" style={{ color: styling.colorPalette.primary }}>
                Your Store
              </div>
              <div className="ml-auto flex gap-4">
                <div className="w-8 h-8 rounded bg-gray-100"></div>
                <div className="w-8 h-8 rounded bg-gray-100"></div>
              </div>
            </div>
            
            <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
              <h1 className="text-3xl font-bold mb-2" style={{ color: styling.colorPalette.primary }}>
                Featured Products
              </h1>
              <p className="text-gray-600 mb-4">Discover amazing products</p>
              <button 
                className="px-6 py-2 rounded text-white font-medium"
                style={{ backgroundColor: styling.colorPalette.primary }}
              >
                Shop Now
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-4">
                    <div className="h-24 bg-gray-200 rounded mb-3"></div>
                    <div className="h-3 bg-gray-300 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : layout === 'landing-page' ? (
          <div className="w-full h-full">
            {/* Landing page preview - matches design mockup exactly */}
            <div className="h-16 bg-white border-b flex items-center px-6">
              <div className="text-xl font-bold" style={{ color: styling.colorPalette.primary }}>
                Brand
              </div>
              <div className="ml-auto flex gap-6 text-sm">
                <span>Home</span>
                <span>About</span>
                <span>Contact</span>
              </div>
            </div>
            
            <div className="flex-1 flex items-center justify-center p-12 bg-gradient-to-br from-blue-50 to-indigo-100">
              <div className="text-center max-w-2xl">
                <h1 className="text-4xl font-bold mb-4" style={{ color: styling.colorPalette.primary }}>
                  Transform Your Experience
                </h1>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Create stunning digital experiences with our powerful platform. Join thousands of successful businesses.
                </p>
                <div className="flex gap-3 justify-center">
                  <button 
                    className="px-8 py-3 rounded-lg text-white font-medium"
                    style={{ backgroundColor: styling.colorPalette.primary }}
                  >
                    Get Started
                  </button>
                  <button className="px-8 py-3 rounded-lg border border-gray-300 bg-white">
                    Learn More
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : layout === 'dashboard' ? (
          <div className="w-full h-full">
            {/* Dashboard preview - matches design mockup exactly */}
            <div className="h-16 bg-white border-b flex items-center px-6">
              <div className="text-xl font-bold" style={{ color: styling.colorPalette.primary }}>
                Dashboard
              </div>
              <div className="ml-auto flex gap-4">
                <div className="w-8 h-8 rounded-full bg-gray-100"></div>
              </div>
            </div>

            <div className="p-6 bg-gray-50">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2" style={{ color: styling.colorPalette.primary }}>
                  Analytics Overview
                </h2>
                <p className="text-gray-600">Track your performance metrics</p>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                {['Users', 'Revenue', 'Growth'].map((metric, i) => (
                  <div key={metric} className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="text-sm text-gray-600 mb-1">{metric}</div>
                    <div className="text-2xl font-bold mb-1" style={{ color: styling.colorPalette.primary }}>
                      {['12.4K', '$89K', '23%'][i]}
                    </div>
                    <div className="text-sm text-gray-500">+{[12, 15, 8][i]}% this month</div>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold mb-4">Performance Chart</h3>
                <div className="h-32 bg-gradient-to-t from-blue-100 to-transparent rounded flex items-end justify-around">
                  {[60, 80, 45, 90, 70, 85].map((height, i) => (
                    <div 
                      key={i}
                      className="w-6 rounded-t"
                      style={{ 
                        height: `${height}%`,
                        backgroundColor: styling.colorPalette.primary 
                      }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Generic layout preview - matches design mockup exactly
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                <div className="text-white text-3xl">✨</div>
              </div>
              <h2 className="text-2xl font-bold mb-3 capitalize" style={{ color: styling.colorPalette.primary }}>
                {layout.replace('-', ' ')} Design
              </h2>
              <p className="text-gray-600 max-w-md">
                {project.description || "Professional design ready for development"}
              </p>
            </div>
          </div>
        )}
      </div>
    )
  }

  const refreshPreview = () => {
    setIsLoading(true)
    setError(null)
    
    // Simulate refresh
    setTimeout(() => {
      setIsLoading(false)
      setPreviewReady(true)
    }, 1000)
  }

  const openInNewWindow = () => {
    // Create a new window with the preview content
    const newWindow = window.open('', '_blank', 'width=1200,height=800')
    if (newWindow) {
      newWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${project.name} - Preview</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            body { margin: 0; padding: 0; font-family: system-ui, sans-serif; }
          </style>
        </head>
        <body>
          <div style="width: 100vw; height: 100vh;">
            ${generatePreviewFromProject()}
          </div>
        </body>
        </html>
      `)
      newWindow.document.close()
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="border-b px-4 py-3 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              Preview
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
              Live Preview
            </Badge>
            
            <Button variant="outline" size="sm" onClick={refreshPreview}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            
            <Button variant="outline" size="sm" onClick={openInNewWindow}>
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 p-4 bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto bg-white dark:bg-black border rounded-lg shadow-lg overflow-hidden h-full w-full">
          {isLoading && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-4">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary" />
                <div>
                  <p className="font-medium">Refreshing Preview...</p>
                  <p className="text-sm text-muted-foreground">
                    Loading your design
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-4 p-6">
                <AlertCircle className="h-12 w-12 mx-auto text-red-500" />
                <div>
                  <p className="font-medium text-red-600">Preview Error</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {error}
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={refreshPreview}
                    className="mt-3"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            </div>
          )}

          {previewReady && !isLoading && !error && (
            <div className="h-full">
              {generatePreviewFromProject()}
            </div>
          )}
        </div>
      </div>

      {/* Preview Info */}
      <div className="px-4 py-2 bg-white border-t">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div>
            Preview: {project.name} • {project.files.length} files
          </div>
          <div>
            Generated from design specification
          </div>
        </div>
      </div>
    </div>
  )
}