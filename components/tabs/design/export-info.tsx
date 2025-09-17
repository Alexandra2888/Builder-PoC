'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Info, FileText, Image} from 'lucide-react'

export function ExportInfo() {
  return (
    <Card className="mt-4">
      <CardContent className="pt-4">
        <div className="flex items-start gap-3">
          <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">About Export Formats:</p>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Image className="h-3 w-3 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium">SVG Export:</span> Creates a scalable vector file that can be imported into most design tools. This is Figma&apos;s recommended format for sharing designs externally.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <FileText className="h-3 w-3 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium">JSON Export:</span> Exports the structured design specification that could potentially be used with a custom Figma plugin to recreate the design.
                </div>
              </div>
            </div>
            <p className="mt-2 text-xs">
              <strong>Note:</strong> Native .fig files are proprietary to Figma and cannot be generated programmatically without Figma&apos;s internal systems.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
