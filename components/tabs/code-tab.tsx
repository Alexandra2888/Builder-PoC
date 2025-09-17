'use client'

import { useAppStore } from '@/lib/store'
import { useCodeGeneration } from '@/lib/hooks/use-ai'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Code2, FolderTree, Eye, Download, Play } from 'lucide-react'
import { FileExplorer } from './code/file-explorer'
import { CodeEditor } from './code/code-editor'
import { PreviewFrame } from './code/preview-frame'
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels'

export function CodeTab() {
  const { 
    currentProject, 
    isGeneratingCode, 
    currentDesign,
    selectedFile,
    setActiveTab
  } = useAppStore()

  const { generateCode } = useCodeGeneration()

  const handleGenerateCode = async () => {
    if (!currentDesign) return
    await generateCode()
  }

  const handleDownloadProject = () => {
    if (!currentProject) return
    
    // TODO: Implement project download
    console.log('Downloading project:', currentProject.id)
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
          <Button variant="outline" size="sm" onClick={handleDownloadProject}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button size="sm">
            <Eye className="mr-2 h-4 w-4" />
            Deploy
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

        {/* Preview */}
        <Panel defaultSize={30} minSize={20}>
          <div className="h-full p-4">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="h-4 w-4" />
              <span className="font-medium">Live Preview</span>
            </div>
            <PreviewFrame project={currentProject} />
          </div>
        </Panel>
      </PanelGroup>
    </div>
  )
}
