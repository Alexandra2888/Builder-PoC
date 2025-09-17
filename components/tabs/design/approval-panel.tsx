'use client'

import { useState } from 'react'
import { DesignSpec } from '@/lib/store'
import { useDesignApproval, useDesignGeneration } from '@/lib/hooks/use-ai'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { CheckCircle, XCircle, MessageSquare, ArrowRight, ChevronDown, Layers, Palette } from 'lucide-react'

interface ApprovalPanelProps {
  design: DesignSpec
  onApprove?: () => void
  onReject?: () => void
  onRequestChanges?: (feedback: string) => void
}

export function ApprovalPanel({ design, onApprove, onReject, onRequestChanges }: ApprovalPanelProps) {
  const [feedback, setFeedback] = useState('')
  const [showFeedback, setShowFeedback] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  
  const { approveDesign, rejectDesign, requestChanges } = useDesignApproval()
  const { generateDesign } = useDesignGeneration()

  const handleApprove = () => {
    if (onApprove) {
      onApprove()
    } else {
      approveDesign()
    }
  }

  const handleReject = () => {
    if (onReject) {
      onReject()
    } else {
      rejectDesign()
    }
  }

  const handleRequestChanges = async () => {
    if (feedback.trim()) {
      if (onRequestChanges) {
        onRequestChanges(feedback)
      } else {
        try {
          // Show that we're processing the changes
          toast.loading('Processing your feedback...', { id: 'request-changes' })
          
          const enhancedPrompt = await requestChanges(feedback)
          if (enhancedPrompt) {
            toast.success('Generating updated design...', { id: 'request-changes' })
            // Generate new design with feedback incorporated
            await generateDesign(enhancedPrompt)
            toast.success('Design updated based on your feedback!', { id: 'request-changes' })
          }
        } catch (error) {
          toast.error('Failed to process changes. Please try again.', { id: 'request-changes' })
          console.error('Request changes error:', error)
        }
      }
      setFeedback('')
      setShowFeedback(false)
    }
  }

  if (design.status === 'approved') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            Design Approved
          </CardTitle>
          <CardDescription>
            Great! Your design has been approved and is ready for code generation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" onClick={() => {/* Switch to code tab */}}>
            <ArrowRight className="mr-2 h-4 w-4" />
            Generate Code
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (design.status === 'rejected') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <XCircle className="h-5 w-5" />
            Design Rejected
          </CardTitle>
          <CardDescription>
            This design was rejected. Please modify your prompt and generate a new design.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          Review Design
        </CardTitle>
        <CardDescription>
          Review the generated design and decide how to proceed
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {design.components?.length || design.frames?.length || 0}
            </div>
            <div className="text-xs text-muted-foreground">Components</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary capitalize">
              {design.layout}
            </div>
            <div className="text-xs text-muted-foreground">Layout</div>
          </div>
        </div>

        {/* Design Details */}
        <Collapsible open={showDetails} onOpenChange={setShowDetails}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-2">
              <span className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Design Details
              </span>
              <ChevronDown className={`h-4 w-4 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3">
            {/* Color Palette */}
            <div className="p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Palette className="h-3 w-3" />
                <span className="text-sm font-medium">Colors</span>
              </div>
              <div className="flex gap-2">
                <div className="flex items-center gap-1">
                  <div 
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: design.styling.colorPalette.primary }}
                  />
                  <span className="text-xs">Primary</span>
                </div>
                <div className="flex items-center gap-1">
                  <div 
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: design.styling.colorPalette.secondary }}
                  />
                  <span className="text-xs">Secondary</span>
                </div>
                <div className="flex items-center gap-1">
                  <div 
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: design.styling.colorPalette.accent }}
                  />
                  <span className="text-xs">Accent</span>
                </div>
              </div>
            </div>

            {/* Components List */}
            <div className="p-3 bg-muted/30 rounded-lg">
              <div className="text-sm font-medium mb-2">Components ({design.components?.length || design.frames?.length || 0})</div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {(design.components || []).map((comp) => (
                  <div key={comp.id} className="flex items-center justify-between text-xs">
                    <span>{comp.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {comp.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Theme & Typography */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="text-sm font-medium">Theme</div>
                <Badge variant="outline" className="text-xs capitalize mt-1">
                  {design.styling.theme}
                </Badge>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="text-sm font-medium">Typography</div>
                <div className="text-xs text-muted-foreground mt-1 capitalize">
                  {design.styling.typography.fontFamily} • {design.styling.typography.scale}
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            onClick={handleApprove} 
            className="w-full bg-green-600 hover:bg-green-700"
            size="lg"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Approve & Generate Code
          </Button>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFeedback(!showFeedback)}
              className="flex-1"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Request Changes
            </Button>
            
            <Button
              variant="destructive"
              onClick={handleReject}
              className="flex-1"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Reject
            </Button>
          </div>
        </div>

        {/* Feedback Section */}
        {showFeedback && (
          <div className="space-y-3 p-4 border rounded-lg bg-background">
            <h4 className="font-medium">What changes would you like?</h4>
            <Textarea
              placeholder="Please describe the changes you'd like to see in the design..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="flex gap-2">
              <Button 
                onClick={handleRequestChanges}
                disabled={!feedback.trim()}
                size="sm"
              >
                Submit Changes
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowFeedback(false)
                  setFeedback('')
                }}
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
          <p className="font-medium mb-1">💡 Tips for better results:</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>Be specific about layout preferences</li>
            <li>Mention color schemes or themes</li>
            <li>Specify key functionality requirements</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
