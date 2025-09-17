'use client'

import { DesignSpec } from '@/lib/store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Palette, Layout, Layers } from 'lucide-react'

interface DesignDisplayProps {
  design: DesignSpec
}

export function DesignDisplay({ design }: DesignDisplayProps) {
  const getStatusColor = (status: DesignSpec['status']) => {
    switch (status) {
      case 'generating':
        return 'bg-blue-500'
      case 'completed':
        return 'bg-green-500'
      case 'approved':
        return 'bg-emerald-500'
      case 'rejected':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Layout className="h-5 w-5" />
            Design Specification
          </CardTitle>
          <Badge variant="outline" className="capitalize">
            <div className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(design.status)}`} />
            {design.status}
          </Badge>
        </div>
        <CardDescription>
          Generated design based on your requirements
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-6">
            {/* Original Prompt */}
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                Original Prompt
              </h4>
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                {design.prompt}
              </p>
            </div>

            {/* Design Description */}
            <div>
              <h4 className="font-semibold mb-2">Description</h4>
              <p className="text-sm text-muted-foreground">
                {design.description}
              </p>
            </div>

            {/* Layout */}
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Layout className="h-4 w-4" />
                Layout Type
              </h4>
              <Badge variant="secondary" className="capitalize">
                {design.layout}
              </Badge>
            </div>

            {/* Styling */}
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Style Guide
              </h4>
              <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Theme</p>
                  <Badge variant="outline" className="capitalize">
                    {design.styling.theme}
                  </Badge>
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-2">Color Palette</p>
                  <div className="flex gap-2">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: design.styling.colorPalette.primary }}
                      />
                      <span className="text-xs">Primary</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: design.styling.colorPalette.secondary }}
                      />
                      <span className="text-xs">Secondary</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: design.styling.colorPalette.accent }}
                      />
                      <span className="text-xs">Accent</span>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium">Typography</p>
                  <div className="flex gap-2 text-xs">
                    <Badge variant="outline">{design.styling.typography.fontFamily}</Badge>
                    <Badge variant="outline" className="capitalize">{design.styling.typography.scale}</Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Components */}
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Components ({design.components.length})
              </h4>
              <div className="space-y-2">
                {design.components.map((component) => (
                  <div key={component.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{component.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {component.type}
                      </Badge>
                    </div>
                    {Object.keys(component.props).length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        Props: {Object.keys(component.props).join(', ')}
                      </div>
                    )}
                    {component.children && component.children.length > 0 && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Children: {component.children.length}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
