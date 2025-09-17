'use client'

import { useAppStore } from '@/lib/store'
import { useCodeGeneration } from '@/lib/hooks/use-ai'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Code2, FolderTree, Download, Play, Search, Monitor, MessageSquare } from 'lucide-react'
import { FileExplorer } from './code/file-explorer'
import { CodeEditor } from './code/code-editor'
import { PreviewFrame } from './code/preview-frame'
import { CodeReviewPanel } from './code/code-review-panel'
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { useState } from 'react'

export function CodeTab() {
  const { 
    currentProject, 
    isGeneratingCode, 
    currentDesign,
    selectedFile,
    setActiveTab,
    currentReview,
    isReviewingCode
  } = useAppStore()

  const { generateCode } = useCodeGeneration()
  const [rightPanelTab, setRightPanelTab] = useState<'preview' | 'review'>('preview')

  const handleGenerateCode = async () => {
    if (!currentDesign) return
    await generateCode()
  }

  const handleDownloadProject = async () => {
    if (!currentProject) return
    
    try {
      toast.loading('Preparing project download...', { id: 'project-download' })
      
      const response = await fetch('/api/export-project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project: currentProject
        })
      })

      if (!response.ok) {
        throw new Error('Failed to export project')
      }

      // Create download link
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${currentProject.name.toLowerCase().replace(/\s+/g, '-')}-project.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast.success('Project downloaded successfully!', { id: 'project-download' })
    } catch (error) {
      console.error('Download failed:', error)
      toast.error('Failed to download project. Please try again.', { id: 'project-download' })
    }
  }

  // If no design is approved yet
  if (!currentDesign || currentDesign.status !== 'approved') {
    return (
      <Card className="h-[calc(100vh-200px)] flex items-center justify-center">
        <CardContent className="text-center py-12">
          <Code2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Approved Design</h3>
          <p className="text-muted-foreground mb-4">
            Please create and approve a design first before generating code
          </p>
          <Button variant="outline" onClick={() => setActiveTab('design')}>
            Go to Design Tab
          </Button>
        </CardContent>
      </Card>
    )
  }

  // If design is approved but no project exists yet
  if (!currentProject) {
    return (
      <Card className="h-[calc(100vh-200px)] flex items-center justify-center">
        <CardContent className="text-center py-12 space-y-4">
          <div className="space-y-2">
            <Code2 className="h-12 w-12 text-primary mx-auto" />
            <h3 className="text-lg font-semibold">Ready to Generate Code</h3>
            <p className="text-muted-foreground">
              Your design is approved! Click below to generate the Next.js project.
            </p>
          </div>
          
          {/* Design Summary */}
          <div className="bg-muted/50 p-4 rounded-lg text-left max-w-md mx-auto">
            <h4 className="font-semibold mb-2">What will be generated:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Next.js 15 project structure</li>
              <li>• TypeScript configuration</li>
              <li>• Tailwind CSS styling</li>
              <li>• shadcn/ui components</li>
              <li>• {currentDesign.components?.length || currentDesign.frames?.length || 0} custom components</li>
              <li>• {currentDesign.layout} layout structure</li>
            </ul>
          </div>

          <Button 
            onClick={handleGenerateCode}
            disabled={isGeneratingCode}
            size="lg"
            className="w-full max-w-xs"
          >
            {isGeneratingCode ? (
              <>
                <Play className="mr-2 h-4 w-4 animate-pulse" />
                Generating Code...
              </>
            ) : (
              <>
                <Code2 className="mr-2 h-4 w-4" />
                Generate Code
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Main code view with project
  return (
    <div className="h-[calc(100vh-200px)]">
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold">{currentProject.name}</h2>
          <p className="text-sm text-muted-foreground">{currentProject.description}</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Review Status Indicator */}
          {currentReview && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mr-2">
              <MessageSquare className="h-4 w-4" />
              <span>Score: {currentReview.overall.score}/100</span>
              {currentReview.issues.length > 0 && (
                <span className="text-orange-600">
                  • {currentReview.issues.length} issues
                </span>
              )}
            </div>
          )}
          
          <Button variant="default" size="sm" onClick={handleDownloadProject}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>
      </div>

      {/* Resizable Panels */}
      <PanelGroup direction="horizontal" className="h-full border rounded-lg">
        {/* File Explorer */}
        <Panel defaultSize={25} minSize={20}>
          <div className="h-full p-4 border-r">
            <div className="flex items-center gap-2 mb-4">
              <FolderTree className="h-4 w-4" />
              <span className="font-medium">Project Files</span>
            </div>
            <FileExplorer project={currentProject} />
          </div>
        </Panel>

        <PanelResizeHandle />

        {/* Code Editor */}
        <Panel defaultSize={45} minSize={30}>
          <div className="h-full">
            {selectedFile ? (
              <CodeEditor 
                file={currentProject.files.find(f => f.path === selectedFile)!}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Code2 className="h-8 w-8 mx-auto mb-2" />
                  <p>Select a file to view its contents</p>
                </div>
              </div>
            )}
          </div>
        </Panel>

        <PanelResizeHandle />

        {/* Right Panel - Preview & Review */}
        <Panel defaultSize={30} minSize={25}>
          <div className="h-full flex flex-col">
            <Tabs 
              value={rightPanelTab} 
              onValueChange={(value) => setRightPanelTab(value as 'preview' | 'review')}
              className="h-full flex flex-col"
            >
              <div className="px-4 pt-4 border-b">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="preview" className="flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    Preview
                  </TabsTrigger>
                  <TabsTrigger value="review" className="flex items-center gap-2 relative">
                    <Search className="h-4 w-4" />
                    Review
                    {isReviewingCode && (
                      <div className="absolute -top-1 -right-1 h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
                    )}
                    {currentReview && currentReview.issues.length > 0 && (
                      <div className="absolute -top-1 -right-1 h-2 w-2 bg-orange-500 rounded-full" />
                    )}
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="preview" className="flex-1 p-4 m-0">
                <PreviewFrame project={currentProject} />
              </TabsContent>
              
              <TabsContent value="review" className="flex-1 m-0">
                <CodeReviewPanel />
              </TabsContent>
            </Tabs>
          </div>
        </Panel>
      </PanelGroup>
    </div>
  )
}
