'use client'

import { DesignSpec } from '@/lib/store'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Layout, Palette, Download, Eye } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

interface DesignMockupProps {
  design: DesignSpec
}

export function DesignMockup({ design }: DesignMockupProps) {
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleExport = async (format: 'svg' | 'json') => {
    try {
      const formatLabels = { svg: 'SVG', json: 'JSON specification' }
      toast.loading(`Exporting design as ${formatLabels[format]}...`, { id: 'design-export' })
      
      const response = await fetch('/api/export-design', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          designSpec: design,
          format
        })
      })

      if (!response.ok) {
        throw new Error('Failed to export design')
      }

      // Create download link
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      const extension = format === 'svg' ? 'svg' : 'json'
      link.download = `design-export-${design.id}.${extension}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success(`Design exported as ${formatLabels[format]} successfully!`, { id: 'design-export' })
    } catch (error) {
      console.error('Export failed:', error)
      toast.error('Failed to export design. Please try again.', { id: 'design-export' })
    }
  }

  const generateFullDesignContent = () => {
    const { layout, components = [], styling, frames = [] } = design

    // If we have Figma-style frames, create a clean visual preview
    if (frames && frames.length > 0) {
      return (
        <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 p-8">
          <div className="w-full h-full bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
            
            {/* Preview Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-200">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  {design.layout.replace('-', ' ').split(' ').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')} Design Preview
                </h3>
                <p className="text-gray-600">
                  {frames.length} frame{frames.length !== 1 ? 's' : ''} • 
                  Ready for export to Figma
                </p>
                
                {/* Color palette preview */}
                <div className="flex justify-center gap-2 mt-4">
                  <div 
                    className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: styling.colorPalette.primary }}
                    title="Primary Color"
                  />
                  <div 
                    className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: styling.colorPalette.secondary }}
                    title="Secondary Color"
                  />
                  <div 
                    className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: styling.colorPalette.accent }}
                    title="Accent Color"
                  />
                </div>
              </div>
            </div>

            {/* Stylized Design Preview */}
            <div className="flex-1 p-8 flex items-center justify-center">
              <div className="relative w-full max-w-4xl">
                
                {/* Browser-like preview frame */}
                <div className="bg-gray-800 rounded-t-lg p-3">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                </div>

                {/* Design preview content */}
                <div className="bg-white border-x border-b border-gray-300 rounded-b-lg aspect-video overflow-hidden">
                  {layout === 'e-commerce' ? (
                    <div className="w-full h-full">
                      {/* E-commerce preview */}
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
                      {/* Landing page preview */}
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
                  ) : (
                    // Generic layout preview
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                      <div className="text-center">
                        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                          <Layout className="h-12 w-12 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold mb-3 capitalize" style={{ color: styling.colorPalette.primary }}>
                          {layout.replace('-', ' ')} Design
                        </h2>
                        <p className="text-gray-600 max-w-md">
                          {design.description || "Professional design ready for development"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick stats */}
                <div className="mt-6 grid grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
                    <div className="text-2xl font-bold text-gray-800">{frames.length}</div>
                    <div className="text-sm text-gray-600">Frames</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
                    <div className="text-2xl font-bold text-gray-800">
                      {frames.reduce((total, frame) => total + frame.elements.length, 0)}
                    </div>
                    <div className="text-sm text-gray-600">Elements</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
                    <div className="text-2xl font-bold" style={{ color: styling.colorPalette.primary }}>
                      Ready
                    </div>
                    <div className="text-sm text-gray-600">Export</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer with export info */}
            <div className="bg-gray-50 p-4 border-t border-gray-200">
              <p className="text-center text-sm text-gray-600">
                💡 <strong>Tip:</strong> Use the SVG or JSON export buttons above to import this design into Figma
              </p>
            </div>
          </div>
        </div>
      )
    }

    // Generate layout preview - full width design
    return (
      <div className="w-full bg-white dark:bg-gray-900 min-h-screen">
        <div className="w-full flex justify-center p-8">
          <div className="w-full max-w-6xl bg-white shadow-2xl rounded-lg overflow-hidden">
            {/* Mock Design Content */}
            <div className="relative w-full min-h-[80vh]">
              {layout === 'e-commerce' ? (
                // E-commerce layout preview
                <div className="w-full h-full">
                  {/* Header */}
                  <div className="h-16 bg-white border-b flex items-center px-6">
                    <div className="text-xl font-bold" style={{ color: styling.colorPalette.primary }}>
                      SHOPIFY
                    </div>
                    <div className="ml-auto flex gap-4">
                      <div className="w-8 h-8 rounded bg-gray-100"></div>
                      <div className="w-8 h-8 rounded bg-gray-100"></div>
                    </div>
                  </div>
                  
                  {/* Hero Section */}
                  <div className="h-64 flex items-center justify-center text-center px-8" style={{ backgroundColor: styling.colorPalette.background || '#f8f9fa' }}>
                    <div>
                      <h1 className="text-4xl font-bold mb-4" style={{ color: styling.colorPalette.primary }}>
                        Featured Products
                      </h1>
                      <h2 className="text-3xl font-bold mb-4 text-gray-800">Summer Collection</h2>
                      <p className="text-lg text-gray-600 mb-6">Discover our latest collection of premium summer essentials. Crafted for comfort and style.</p>
                      <button 
                        className="px-8 py-3 rounded-lg text-white font-semibold text-lg"
                        style={{ backgroundColor: styling.colorPalette.primary }}
                      >
                        Shop Now
                      </button>
                    </div>
                  </div>
                  
                  {/* Product Grid */}
                  <div className="p-8">
                    <div className="grid grid-cols-3 gap-6">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white border rounded-lg overflow-hidden shadow-sm">
                          <div className="h-32 bg-gray-100"></div>
                          <div className="p-4">
                            <div className="h-4 bg-gray-200 rounded mb-2"></div>
                            <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                // Generic layout preview  
                <div className="w-full min-h-[80vh] flex items-center justify-center bg-gray-50 py-12">
                  <div className="text-center max-w-4xl p-12">
                    <Layout className="h-32 w-32 text-gray-400 mx-auto mb-8" />
                    <h2 className="text-6xl font-bold mb-6 capitalize text-gray-800">
                      {layout.replace('-', ' ')} Design
                    </h2>
                    <p className="text-2xl text-gray-600 leading-relaxed mb-10">
                      {design.description}
                    </p>
                    
                    <div className="bg-white p-8 rounded-2xl shadow-lg">
                      <h3 className="text-2xl font-semibold mb-6 text-gray-800">Design System</h3>
                      <div className="flex items-center justify-center gap-12">
                        <div className="text-center">
                          <div className="flex gap-3 justify-center mb-4">
                            <div 
                              className="w-12 h-12 rounded-full border-4 border-white shadow-lg"
                              style={{ backgroundColor: styling.colorPalette.primary }}
                            />
                            <div 
                              className="w-12 h-12 rounded-full border-4 border-white shadow-lg"
                              style={{ backgroundColor: styling.colorPalette.secondary }}
                            />
                            <div 
                              className="w-12 h-12 rounded-full border-4 border-white shadow-lg"
                              style={{ backgroundColor: styling.colorPalette.accent }}
                            />
                          </div>
                          <span className="text-lg text-gray-600">Color Palette</span>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-4xl font-bold text-gray-800 mb-2">
                            {components?.length || frames?.length || 0}
                          </div>
                          <span className="text-lg text-gray-600">Components</span>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-2xl font-semibold text-gray-800 mb-2 capitalize">
                            {styling.theme}
                          </div>
                          <span className="text-lg text-gray-600">Theme</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
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
          
          <div className="flex items-center gap-2">
            {/* Export Buttons */}
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('svg')}
                className="h-8 px-2"
                title="Export as SVG (Figma's recommended format for external use)"
              >
                <Download className="h-3 w-3 mr-1" />
                SVG
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleExport('json')}
                className="h-8 px-2"
                title="Export design specification as JSON (for potential Figma plugin use)"
              >
                JSON
              </Button>
            </div>
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

      {/* Simple Design Card that opens dialog */}
      <div className="flex-1 p-6 flex items-start justify-center pt-12">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Card className="w-80 cursor-pointer hover:shadow-lg transition-shadow bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-950 border-2 border-dashed border-blue-200 dark:border-blue-700">
              <div className="p-8 text-center">
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <Layout className="h-16 w-16 text-blue-500 dark:text-blue-400" />
                    <Eye className="h-6 w-6 text-blue-600 dark:text-blue-300 absolute -bottom-1 -right-1 bg-white dark:bg-gray-900 rounded-full p-1" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-blue-900 dark:text-blue-100">
                  {design.layout.replace('-', ' ').split(' ').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')} Design
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
                  Click to view full design
                </p>
                <div className="flex justify-center gap-1 mb-2">
                  <div 
                    className="w-3 h-3 rounded-full border"
                    style={{ backgroundColor: design.styling.colorPalette.primary }}
                  />
                  <div 
                    className="w-3 h-3 rounded-full border"
                    style={{ backgroundColor: design.styling.colorPalette.secondary }}
                  />
                  <div 
                    className="w-3 h-3 rounded-full border"
                    style={{ backgroundColor: design.styling.colorPalette.accent }}
                  />
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  {(design.components?.length || design.frames?.length || 0)} components
                </p>
              </div>
            </Card>
          </DialogTrigger>
          
          <DialogContent className="w-[99vw] h-[99vh] max-w-[99vw] max-h-[99vh] p-0 flex flex-col">
            <DialogHeader className="p-6 pb-4 border-b flex-shrink-0">
              <DialogTitle className="flex items-center gap-2">
                <Layout className="h-5 w-5" />
                {design.layout.replace('-', ' ').split(' ').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')} Design
                <Badge variant="outline" className="ml-2">
                  {design.styling.theme} theme
                </Badge>
              </DialogTitle>
            </DialogHeader>
            
            <div className="flex-1 overflow-auto">
              <div className="w-full h-full">
                {generateFullDesignContent()}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Card>
  )
}
