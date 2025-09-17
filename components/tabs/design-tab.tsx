'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { useDesignGeneration } from '@/lib/hooks/use-ai'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Loader2, Wand2, CheckCircle } from 'lucide-react'
import { DesignMockup } from '@/components/tabs/design/design-mockup'
import { ApprovalPanel } from '@/components/tabs/design/approval-panel'
import { DesignHistory } from '@/components/tabs/design/design-history'
import { ExportInfo } from '@/components/tabs/design/export-info'

export function DesignTab() {
  const {
    currentPrompt,
    currentDesign,
    isGeneratingDesign
  } = useAppStore()
  
  const { generateDesign } = useDesignGeneration()
  
  const [localPrompt, setLocalPrompt] = useState(currentPrompt)

  // Sync local prompt with store
  useEffect(() => {
    setLocalPrompt(currentPrompt)
  }, [currentPrompt])

  const handleGenerateDesign = async () => {
    if (!localPrompt.trim()) return
    await generateDesign(localPrompt)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
      {/* Left Column - Prompt Input & History */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5" />
              Describe Your App
            </CardTitle>
            <CardDescription>
              Tell the AI what kind of application you want to build
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Example: Create a modern dashboard for a SaaS analytics platform with dark mode support, data visualization charts, user management, and a clean sidebar navigation..."
              className="min-h-[200px] resize-none"
              value={localPrompt}
              onChange={(e) => setLocalPrompt(e.target.value)}
              disabled={isGeneratingDesign}
            />
            
            <div className="flex gap-2">
              <Button
                onClick={handleGenerateDesign}
                disabled={!localPrompt.trim() || isGeneratingDesign}
                className="flex-1"
              >
                {isGeneratingDesign ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Generate Design
                  </>
                )}
              </Button>
            </div>

            {/* Quick Templates */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Quick Templates:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  'Dashboard App',
                  'Landing Page',
                  'E-commerce',
                  'Blog',
                  'Portfolio'
                ].map((template) => (
                  <Badge
                    key={template}
                    variant="outline"
                    className="cursor-pointer hover:bg-secondary"
                    onClick={() => setLocalPrompt(`Create a modern ${template.toLowerCase()} with clean design and responsive layout`)}
                  >
                    {template}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <DesignHistory />
      </div>

      {/* Middle Column - Visual Mockup */}
      <div className="lg:col-span-1">
        {currentDesign ? (
          <DesignMockup key={currentDesign.id} design={currentDesign} />
        ) : (
          <Card className="h-full flex items-center justify-center">
            <CardContent className="text-center py-12">
              <Wand2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Design Yet</h3>
              <p className="text-muted-foreground">
                Enter your app description and click &quot;Generate Design&quot; to get started
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Right Column - Approval Panel */}
      <div className="space-y-4">
        {currentDesign ? (
          <>
            <ApprovalPanel
              key={currentDesign.id}
              design={currentDesign}
            />
            <ExportInfo />
          </>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Review & Approve
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                Design review panel will appear here once you generate a design
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
