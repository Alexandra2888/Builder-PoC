'use client'

import { DesignSpec } from '@/lib/store'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Layout, Palette, Smartphone, Monitor, Tablet } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

interface DesignMockupProps {
  design: DesignSpec
}

type ViewportSize = 'desktop' | 'tablet' | 'mobile'

const viewportSizes = {
  desktop: { 
    width: '100%', 
    height: '400px', 
    icon: Monitor
  },
  tablet: { 
    width: '100%', 
    height: '400px', 
    icon: Tablet
  },
  mobile: { 
    width: '100%', 
    height: '400px', 
    icon: Smartphone
  }
}

export function DesignMockup({ design }: DesignMockupProps) {
  const [viewport, setViewport] = useState<ViewportSize>('desktop')

  // Force re-render when design changes by resetting viewport
  useEffect(() => {
    setViewport('desktop')
  }, [design.id])

  const generateMockupContent = () => {
    const { layout, components, styling } = design

    // Generate different layouts based on design spec
    switch (layout) {
      case 'dashboard':
        return (
          <div className="h-full bg-gray-100 dark:bg-gray-900">
            {viewport === 'mobile' ? (
              // Mobile Layout
              <div className="h-full flex flex-col">
                {/* Mobile Header with hamburger */}
                <div 
                  className="h-14 flex items-center px-4 text-white"
                  style={{ backgroundColor: styling.colorPalette.primary }}
                >
                  <div className="w-6 h-6 bg-white/20 rounded mr-3"></div>
                  <div className="text-sm font-semibold">Dashboard</div>
                  <div className="ml-auto">
                    <div className="w-6 h-6 rounded-full bg-white/20"></div>
                  </div>
                </div>
                
                {/* Mobile Content - Stacked */}
                <div className="flex-1 p-3 space-y-3 overflow-auto">
                  {/* Stats Cards - Single Column */}
                  {components.slice(0, 2).map((comp) => (
                    <Card key={comp.id} className="p-3">
                      <div className="h-16 bg-gradient-to-br from-blue-50 to-indigo-100 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded mb-1"></div>
                      <div className="h-2 bg-gray-100 rounded w-2/3"></div>
                    </Card>
                  ))}
                  
                  {/* Mobile Chart */}
                  <Card className="h-40 p-3">
                    <div className="h-full bg-gradient-to-t from-blue-100 to-transparent rounded flex items-end justify-around">
                      {[60, 80, 45, 90].map((height, i) => (
                        <div 
                          key={i}
                          className="w-6 bg-blue-500 rounded-t"
                          style={{ height: `${height}%` }}
                        ></div>
                      ))}
                    </div>
                  </Card>
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
              <div className="h-full flex flex-col">
                <div 
                  className="h-16 flex items-center px-6 text-white"
                  style={{ backgroundColor: styling.colorPalette.primary }}
                >
                  <div className="w-8 h-8 rounded bg-white/20 mr-3"></div>
                  <div className="font-semibold">Dashboard</div>
                  <div className="ml-auto">
                    <div className="w-8 h-8 rounded-full bg-white/20"></div>
                  </div>
                </div>

                <div className="flex flex-1">
                  {/* Collapsible Sidebar */}
                  <div className="w-48 bg-white dark:bg-gray-800 border-r p-4">
                    <div className="space-y-2">
                      {['Analytics', 'Users', 'Settings', 'Reports'].map((item, i) => (
                        <div key={item} className={`p-2 rounded text-sm ${
                          i === 0 ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                        }`}>
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tablet Content - 2 Column Grid */}
                  <div className="flex-1 p-4">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      {components.slice(0, 4).map((comp) => (
                        <Card key={comp.id} className="p-4">
                          <div className="h-16 bg-gradient-to-br from-blue-50 to-indigo-100 rounded mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded mb-1"></div>
                          <div className="h-2 bg-gray-100 rounded w-2/3"></div>
                        </Card>
                      ))}
                    </div>
                    
                    <Card className="h-44 p-4">
                      <div className="h-full bg-gradient-to-t from-blue-100 to-transparent rounded flex items-end justify-around">
                        {[60, 80, 45, 90, 70].map((height, i) => (
                          <div 
                            key={i}
                            className="w-8 bg-blue-500 rounded-t"
                            style={{ height: `${height}%` }}
                          ></div>
                        ))}
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            ) : (
              // Desktop Layout
              <div className="h-full">
                <div 
                  className="h-16 flex items-center px-6 text-white"
                  style={{ backgroundColor: styling.colorPalette.primary }}
                >
                  <div className="w-8 h-8 rounded bg-white/20 mr-3"></div>
                  <div className="text-white font-semibold">Dashboard</div>
                  <div className="ml-auto flex gap-2">
                    <div className="w-8 h-8 rounded-full bg-white/20"></div>
                  </div>
                </div>

                <div className="flex h-[calc(100%-64px)]">
                  <div className="w-64 bg-white dark:bg-gray-800 border-r p-4">
                    <div className="space-y-2">
                      {['Analytics', 'Users', 'Settings', 'Reports'].map((item, i) => (
                        <div key={item} className={`p-2 rounded text-sm ${
                          i === 0 ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                        }`}>
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex-1 p-6">
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      {components.slice(0, 3).map((comp) => (
                        <Card key={comp.id} className="p-4">
                          <div className="h-20 bg-gradient-to-br from-blue-50 to-indigo-100 rounded mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded mb-1"></div>
                          <div className="h-3 bg-gray-100 rounded w-2/3"></div>
                        </Card>
                      ))}
                    </div>
                    
                    <Card className="h-48 p-4">
                      <div className="h-full bg-gradient-to-t from-blue-100 to-transparent rounded flex items-end justify-around">
                        {[60, 80, 45, 90, 70].map((height, i) => (
                          <div 
                            key={i}
                            className="w-8 bg-blue-500 rounded-t"
                            style={{ height: `${height}%` }}
                          ></div>
                        ))}
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            )}
          </div>
        )

      case 'landing-page':
        return (
          <div className="h-full bg-white dark:bg-gray-900">
            {viewport === 'mobile' ? (
              // Mobile Landing Page
              <div className="h-full flex flex-col">
                {/* Mobile Hero */}
                <div 
                  className="h-1/2 flex items-center justify-center text-white px-4"
                  style={{ 
                    background: `linear-gradient(135deg, ${styling.colorPalette.primary}, ${styling.colorPalette.secondary})` 
                  }}
                >
                  <div className="text-center">
                    <div className="w-32 h-6 bg-white/20 rounded mx-auto mb-4"></div>
                    <div className="w-28 h-4 bg-white/15 rounded mx-auto mb-4"></div>
                    <div className="w-20 h-8 bg-white/30 rounded mx-auto"></div>
                  </div>
                </div>

                {/* Mobile Features - Stacked */}
                <div className="h-1/2 p-4 space-y-4">
                  {components.slice(0, 2).map((comp) => (
                    <div key={comp.id} className="text-center">
                      <div 
                        className="w-12 h-12 rounded-full mx-auto mb-3"
                        style={{ backgroundColor: styling.colorPalette.accent }}
                      ></div>
                      <div className="h-3 bg-gray-200 rounded mb-2"></div>
                      <div className="h-2 bg-gray-100 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : viewport === 'tablet' ? (
              // Tablet Landing Page
              <div className="h-full flex flex-col">
                <div 
                  className="h-1/2 flex items-center justify-center text-white px-6"
                  style={{ 
                    background: `linear-gradient(135deg, ${styling.colorPalette.primary}, ${styling.colorPalette.secondary})` 
                  }}
                >
                  <div className="text-center">
                    <div className="w-40 h-7 bg-white/20 rounded mx-auto mb-4"></div>
                    <div className="w-32 h-5 bg-white/15 rounded mx-auto mb-4"></div>
                    <div className="w-24 h-9 bg-white/30 rounded mx-auto"></div>
                  </div>
                </div>

                <div className="h-1/2 p-6">
                  <div className="grid grid-cols-2 gap-6 h-full">
                    {components.slice(0, 2).map((comp) => (
                      <div key={comp.id} className="text-center">
                        <div 
                          className="w-14 h-14 rounded-full mx-auto mb-4"
                          style={{ backgroundColor: styling.colorPalette.accent }}
                        ></div>
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-100 rounded"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              // Desktop Landing Page
              <div className="h-full">
                <div 
                  className="h-1/2 flex items-center justify-center text-white"
                  style={{ 
                    background: `linear-gradient(135deg, ${styling.colorPalette.primary}, ${styling.colorPalette.secondary})` 
                  }}
                >
                  <div className="text-center">
                    <div className="w-48 h-8 bg-white/20 rounded mx-auto mb-4"></div>
                    <div className="w-32 h-6 bg-white/15 rounded mx-auto mb-4"></div>
                    <div className="w-24 h-10 bg-white/30 rounded mx-auto"></div>
                  </div>
                </div>

                <div className="h-1/2 p-8">
                  <div className="grid grid-cols-3 gap-4 h-full">
                    {components.slice(0, 3).map((comp) => (
                      <div key={comp.id} className="text-center">
                        <div 
                          className="w-16 h-16 rounded-full mx-auto mb-4"
                          style={{ backgroundColor: styling.colorPalette.accent }}
                        ></div>
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-100 rounded"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )

      case 'e-commerce':
        return (
          <div className="h-full bg-gray-50 dark:bg-gray-900">
            {viewport === 'mobile' ? (
              // Mobile E-commerce
              <div className="h-full flex flex-col">
                <div className="h-14 flex items-center px-4 bg-white dark:bg-gray-800 border-b">
                  <div className="w-20 h-6 bg-gray-200 rounded mr-3"></div>
                  <div className="ml-auto flex gap-2 items-center">
                    <div className="w-6 h-6 bg-gray-200 rounded"></div>
                    <div className="w-6 h-6 bg-gray-200 rounded"></div>
                  </div>
                </div>

                {/* Mobile Product List - Vertical Stack */}
                <div className="flex-1 p-3 space-y-3 overflow-auto">
                  {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="p-3 flex gap-3">
                      <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded flex-shrink-0"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-gray-200 rounded"></div>
                        <div className="h-2 bg-gray-100 rounded w-3/4"></div>
                        <div className="h-4 bg-blue-100 rounded w-1/3"></div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ) : viewport === 'tablet' ? (
              // Tablet E-commerce
              <div className="h-full flex flex-col">
                <div className="h-16 bg-white dark:bg-gray-800 border-b flex items-center px-4">
                  <div className="w-24 h-8 bg-gray-200 rounded mr-4"></div>
                  <div className="flex-1 max-w-sm">
                    <div className="h-8 bg-gray-100 rounded"></div>
                  </div>
                  <div className="ml-4 flex gap-2">
                    <div className="w-8 h-8 bg-gray-200 rounded"></div>
                    <div className="w-8 h-8 bg-gray-200 rounded"></div>
                  </div>
                </div>

                <div className="flex-1 p-4 overflow-auto">
                  <div className="grid grid-cols-2 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <Card key={i} className="p-4">
                        <div className="h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded mb-3"></div>
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              // Desktop E-commerce
              <div className="h-full flex flex-col">
                <div className="h-16 bg-white dark:bg-gray-800 border-b flex items-center px-4">
                  <div className="w-24 h-8 bg-gray-200 rounded mr-4"></div>
                  <div className="flex-1 max-w-md">
                    <div className="h-8 bg-gray-100 rounded"></div>
                  </div>
                  <div className="ml-4 flex gap-2">
                    <div className="w-8 h-8 bg-gray-200 rounded"></div>
                    <div className="w-8 h-8 bg-gray-200 rounded"></div>
                  </div>
                </div>

                <div className="flex-1 p-6 overflow-auto">
                  <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <Card key={i} className="p-4">
                        <div className="h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded mb-1"></div>
                        <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )

      default:
        return (
          <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-800">
            <div className="text-center">
              <Layout className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                {layout.charAt(0).toUpperCase() + layout.slice(1)} Layout Preview
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {components.length} components • {styling.theme} theme
              </p>
            </div>
          </div>
        )
    }
  }

  return (
    <Card className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Layout className="h-4 w-4" />
            <span className="font-medium">Design Preview</span>
            <Badge variant="outline" className="capitalize">
              {design.layout}
            </Badge>
          </div>
          
          {/* Viewport Switcher */}
          <div className="flex gap-1">
            {(Object.keys(viewportSizes) as ViewportSize[]).map((size) => {
              const IconComponent = viewportSizes[size].icon
              return (
                <Button
                  key={size}
                  variant={viewport === size ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewport(size)}
                  className="h-8 w-8 p-0"
                >
                  <IconComponent className="h-3 w-3" />
                </Button>
              )
            })}
          </div>
        </div>

        {/* Color Palette */}
        <div className="flex items-center gap-2">
          <Palette className="h-3 w-3 text-gray-500" />
          <div className="flex gap-1">
            <div 
              className="w-4 h-4 rounded-full border border-gray-200"
              style={{ backgroundColor: design.styling.colorPalette.primary }}
              title="Primary"
            />
            <div 
              className="w-4 h-4 rounded-full border border-gray-200"
              style={{ backgroundColor: design.styling.colorPalette.secondary }}
              title="Secondary"
            />
            <div 
              className="w-4 h-4 rounded-full border border-gray-200"
              style={{ backgroundColor: design.styling.colorPalette.accent }}
              title="Accent"
            />
          </div>
          <span className="text-xs text-gray-500 capitalize ml-2">
            {design.styling.theme} theme
          </span>
        </div>
      </div>

      <div className="flex-1 p-4 bg-gray-50 dark:bg-gray-900">
        <div 
          className={`mx-auto bg-white dark:bg-black border rounded-lg shadow-sm overflow-hidden transition-all duration-300 ${
            viewport === 'mobile' ? 'max-w-sm' : viewport === 'tablet' ? 'max-w-2xl' : 'w-full'
          }`}
          style={{
            height: viewportSizes[viewport].height
          }}
        >
          {generateMockupContent()}
        </div>
      </div>
    </Card>
  )
}
