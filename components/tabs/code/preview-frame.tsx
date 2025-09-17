'use client'

import { useState, useEffect } from 'react'
import { Project } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  RefreshCw, 
  Monitor, 
  Smartphone, 
  Tablet, 
  ExternalLink,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

interface PreviewFrameProps {
  project: Project
}

type ViewportSize = 'desktop' | 'tablet' | 'mobile'

interface ViewportConfig {
  width: string
  height: string
  icon: React.ReactNode
  label: string
}

const viewportConfigs: Record<ViewportSize, ViewportConfig> = {
  desktop: {
    width: '100%',
    height: '100%',
    icon: <Monitor className="h-4 w-4" />,
    label: 'Desktop'
  },
  tablet: {
    width: '100%',
    height: '100%',
    icon: <Tablet className="h-4 w-4" />,
    label: 'Tablet'
  },
  mobile: {
    width: '100%',
    height: '100%',
    icon: <Smartphone className="h-4 w-4" />,
    label: 'Mobile'
  }
}

export function PreviewFrame({ project }: PreviewFrameProps) {
  const [viewport, setViewport] = useState<ViewportSize>('desktop')
  const [isLoading, setIsLoading] = useState(false)
  const [previewReady, setPreviewReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Generate preview from actual project files
  const generatePreviewFromProject = () => {
    const { designSpec } = project
    const { layout, styling } = designSpec

    // Generate preview based on the actual design and layout
    switch (layout) {
      case 'dashboard':
        return (
          <div className="h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            {/* Dynamic Header with actual colors */}
            <div 
              className="h-16 flex items-center px-4 border-b"
              style={{ backgroundColor: styling.colorPalette.primary }}
            >
              <div className="w-8 h-8 rounded bg-white/20 mr-3"></div>
              <div className="text-white font-semibold">{project.name}</div>
              <div className="ml-auto flex gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20"></div>
              </div>
            </div>

            {viewport === 'mobile' ? (
              // Mobile Layout
              <div className="flex flex-col h-[calc(100%-64px)]">
                {/* Mobile Content - Stacked */}
                <div className="flex-1 p-3 space-y-3 overflow-auto">
                  {/* Stats Cards - Single Column */}
                  {(designSpec.components || []).slice(0, 2).map((comp) => (
                    <div key={comp.id} className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border">
                      <div className="h-16 bg-gradient-to-br from-blue-50 to-indigo-100 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded mb-1"></div>
                      <div className="text-xs text-gray-500 truncate">{comp.name}</div>
                    </div>
                  ))}
                  
                  {/* Mobile Chart */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3 h-40 border">
                    <div className="h-full bg-gradient-to-t from-blue-100 to-transparent rounded flex items-end justify-around">
                      {[60, 80, 45, 90].map((height, i) => (
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
                
                {/* Bottom Navigation */}
                <div className="h-16 bg-white dark:bg-gray-800 border-t flex justify-around items-center px-4">
                  {['Analytics', 'Users', 'Settings'].map((item, i) => (
                    <div key={item} className={`text-xs text-center ${
                      i === 0 ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      <div className="w-6 h-6 bg-gray-200 rounded mx-auto mb-1"></div>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ) : viewport === 'tablet' ? (
              // Tablet Layout
              <div className="flex h-[calc(100%-64px)]">
                {/* Collapsible Sidebar */}
                <div className="w-48 bg-white dark:bg-gray-800 border-r p-4">
                  <div className="space-y-2">
                    {(designSpec.components || []).slice(0, 4).map((comp, i) => (
                      <div 
                        key={comp.id} 
                        className={`p-2 rounded text-sm ${
                          i === 0 ? 'text-white' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                        style={i === 0 ? { backgroundColor: styling.colorPalette.accent } : {}}
                      >
                        {comp.name}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tablet Content - 2 Column Grid */}
                <div className="flex-1 p-4">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {(designSpec.components || []).slice(0, 4).map((comp) => (
                      <div key={comp.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border">
                        <div className="h-16 bg-gradient-to-br from-blue-50 to-indigo-100 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded mb-1"></div>
                        <div className="text-xs text-gray-500 truncate">{comp.name}</div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 h-44 border">
                    <div className="h-full bg-gradient-to-t from-blue-100 to-transparent rounded flex items-end justify-around">
                      {[60, 80, 45, 90, 70].map((height, i) => (
                        <div 
                          key={i}
                          className="w-8 rounded-t"
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
              // Desktop Layout
              <div className="flex h-[calc(100%-64px)]">
                <div className="w-64 bg-white dark:bg-gray-800 border-r p-4">
                  <div className="space-y-2">
                    {(designSpec.components || []).slice(0, 4).map((comp, i) => (
                      <div 
                        key={comp.id} 
                        className={`p-2 rounded text-sm ${
                          i === 0 ? 'text-white' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                        style={i === 0 ? { backgroundColor: styling.colorPalette.accent } : {}}
                      >
                        {comp.name}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex-1 p-6">
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {(designSpec.components || []).slice(0, 3).map((comp) => (
                      <div key={comp.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border">
                        <div 
                          className="h-20 rounded mb-2"
                          style={{ 
                            background: `linear-gradient(135deg, ${styling.colorPalette.primary}20, ${styling.colorPalette.secondary}20)` 
                          }}
                        ></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded mb-1"></div>
                        <div className="text-xs text-gray-500 truncate">{comp.name}</div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 h-48 border">
                    <div className="h-full bg-gradient-to-t from-blue-100 to-transparent rounded flex items-end justify-around">
                      {[60, 80, 45, 90, 70].map((height, i) => (
                        <div 
                          key={i}
                          className="w-8 rounded-t"
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
            )}
          </div>
        )

      case 'landing-page':
        return (
          <div className="h-full bg-white dark:bg-gray-900">
            {/* Hero with actual colors */}
            <div 
              className="h-1/2 flex items-center justify-center text-white"
              style={{ 
                background: `linear-gradient(135deg, ${styling.colorPalette.primary}, ${styling.colorPalette.secondary})` 
              }}
            >
              <div className="text-center">
                <div className="text-2xl font-bold mb-2">{project.name}</div>
                <div className="text-lg opacity-90 mb-4">{project.description}</div>
                <div 
                  className="px-6 py-2 rounded-lg font-medium"
                  style={{ backgroundColor: styling.colorPalette.accent }}
                >
                  Get Started
                </div>
              </div>
            </div>

            {/* Features with components */}
            <div className="h-1/2 p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">Features</h2>
                <p className="text-gray-600">Built with {designSpec.components?.length || designSpec.frames?.length || 0} components</p>
              </div>
              <div className="grid grid-cols-3 gap-4 h-full">
                {(designSpec.components || []).slice(0, 3).map((comp) => (
                  <div key={comp.id} className="text-center">
                    <div 
                      className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                      style={{ backgroundColor: styling.colorPalette.accent }}
                    >
                      <span className="text-white font-bold">{comp.name.charAt(0)}</span>
                    </div>
                    <h3 className="font-semibold mb-2">{comp.name}</h3>
                    <p className="text-sm text-gray-600">{comp.type} component</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 'e-commerce':
        return (
          <div className="h-full bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="h-16 bg-white dark:bg-gray-800 border-b flex items-center px-4">
              <div 
                className="px-3 py-1 rounded text-white font-semibold"
                style={{ backgroundColor: styling.colorPalette.primary }}
              >
                {project.name}
              </div>
              <div className="flex-1 max-w-md mx-4">
                <div className="h-8 bg-gray-100 dark:bg-gray-700 rounded flex items-center px-3 text-gray-500 text-sm">
                  Search products...
                </div>
              </div>
              <div className="flex gap-2">
                <div 
                  className="w-8 h-8 rounded flex items-center justify-center text-white"
                  style={{ backgroundColor: styling.colorPalette.accent }}
                >
                  🛒
                </div>
              </div>
            </div>

            {/* Product grid */}
            <div className="p-6">
              <div className="grid grid-cols-3 gap-4">
                {(designSpec.components || []).slice(0, 6).map((comp, i) => (
                  <div key={comp.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                    <div 
                      className="h-32 rounded mb-2"
                      style={{ 
                        background: `linear-gradient(135deg, ${styling.colorPalette.primary}30, ${styling.colorPalette.secondary}30)` 
                      }}
                    ></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded mb-1"></div>
                    <div className="text-xs font-medium">{comp.name}</div>
                    <div 
                      className="text-sm font-bold mt-1"
                      style={{ color: styling.colorPalette.primary }}
                    >
                      ${(i + 1) * 29}.99
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      default:
        return (
          <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-800">
            <div className="text-center">
              <div 
                className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{ backgroundColor: styling.colorPalette.primary }}
              >
                <span className="text-white font-bold text-xl">
                  {project.name.charAt(0)}
                </span>
              </div>
              <h3 className="font-semibold mb-2">{project.name}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-1">
                {layout.charAt(0).toUpperCase() + layout.slice(1)} Layout
              </p>
              <p className="text-sm text-gray-500">
                {designSpec.components?.length || designSpec.frames?.length || 0} components • {styling.theme} theme
              </p>
              <div className="flex items-center justify-center gap-2 mt-4">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">Generated successfully</span>
              </div>
            </div>
          </div>
        )
    }
  }

  // Simulate preview generation
  useEffect(() => {
    setIsLoading(true)
    setError(null)
    
    const timer = setTimeout(() => {
      setIsLoading(false)
      setPreviewReady(true)
    }, 2000)

    return () => clearTimeout(timer)
  }, [project.id])

  const refreshPreview = () => {
    setIsLoading(true)
    setPreviewReady(false)
    setError(null)
    
    setTimeout(() => {
      setIsLoading(false)
      setPreviewReady(true)
    }, 1500)
  }

  const openInNewTab = () => {
    // TODO: Generate preview URL and open in new tab
    console.log('Opening preview in new tab')
  }

  return (
    <div className="h-full flex flex-col">
      {/* Preview Controls */}
      <div className="flex items-center justify-between p-3 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          {Object.entries(viewportConfigs).map(([key, config]) => (
            <Button
              key={key}
              variant={viewport === key ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewport(key as ViewportSize)}
              className="h-7 px-2 gap-1"
            >
              {config.icon}
              <span className="hidden sm:inline">{config.label}</span>
            </Button>
          ))}
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {previewReady ? (
              <>
                <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                Ready
              </>
            ) : (
              <>
                <AlertCircle className="h-3 w-3 mr-1 text-yellow-500" />
                Building
              </>
            )}
          </Badge>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={refreshPreview}
            disabled={isLoading}
            className="h-7 px-2"
          >
            <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={openInNewTab}
            disabled={!previewReady}
            className="h-7 px-2"
          >
            <ExternalLink className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 p-4 bg-gray-50 dark:bg-gray-900">
        <div 
          className={`mx-auto bg-white dark:bg-black border rounded-lg shadow-lg overflow-hidden h-full transition-all duration-300 ${
            viewport === 'mobile' ? 'max-w-sm' : viewport === 'tablet' ? 'max-w-2xl' : 'w-full'
          }`}
        >
          {isLoading && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-4">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary" />
                <div>
                  <p className="font-medium">Building Preview...</p>
                  <p className="text-sm text-muted-foreground">
                    Compiling your Next.js project
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
      <div className="border-t bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span>Viewport: {viewportConfigs[viewport].width}</span>
            <span>{project.files.length} files</span>
            <span>Next.js {project.designSpec.styling.theme} theme</span>
          </div>
          <div>
            Last updated: {new Date(project.updatedAt).toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  )
}
