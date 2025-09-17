'use client'

import { useState } from 'react'
import { Editor } from '@monaco-editor/react'
import { GeneratedFile } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Copy, Check, Download, ExternalLink } from 'lucide-react'

interface CodeEditorProps {
  file: GeneratedFile
}

export function CodeEditor({ file }: CodeEditorProps) {
  const [copied, setCopied] = useState(false)

  const getLanguage = (filePath: string): string => {
    const ext = filePath.split('.').pop()?.toLowerCase()
    
    switch (ext) {
      case 'tsx':
      case 'jsx':
        return 'typescript'
      case 'ts':
        return 'typescript'
      case 'js':
        return 'javascript'
      case 'json':
        return 'json'
      case 'css':
        return 'css'
      case 'md':
        return 'markdown'
      case 'html':
        return 'html'
      case 'yml':
      case 'yaml':
        return 'yaml'
      default:
        return 'plaintext'
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(file.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy code:', err)
    }
  }

  const downloadFile = () => {
    const blob = new Blob([file.content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = file.path.split('/').pop() || 'file.txt'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const getFileTypeColor = (type: GeneratedFile['type']) => {
    switch (type) {
      case 'component':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'page':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'config':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      case 'style':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* File Header */}
      <div className="flex items-center justify-between p-3 border-b bg-muted/30">
        <div className="flex items-center gap-3">
          <h3 className="font-mono text-sm font-medium">{file.path}</h3>
          <Badge 
            variant="secondary" 
            className={`text-xs h-5 px-2 capitalize ${getFileTypeColor(file.type)}`}
          >
            {file.type}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="text-xs text-muted-foreground">
            {file.content.split('\n').length} lines
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={copyToClipboard}
            className="h-7 px-2"
          >
            {copied ? (
              <Check className="h-3 w-3 text-green-600" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={downloadFile}
            className="h-7 px-2"
          >
            <Download className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Code Editor */}
      <div className="flex-1">
        <Editor
          value={file.content}
          language={getLanguage(file.path)}
          theme="vs-dark"
          options={{
            readOnly: true,
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            wordWrap: 'on',
            formatOnType: true,
            formatOnPaste: true,
            folding: true,
            lineDecorationsWidth: 10,
            lineNumbersMinChars: 3,
            glyphMargin: false,
            padding: { top: 16, bottom: 16 }
          }}
          loading={
            <div className="flex items-center justify-center h-full">
              <div className="text-muted-foreground">Loading editor...</div>
            </div>
          }
        />
      </div>

      {/* File Stats */}
      <div className="border-t bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span>{getLanguage(file.path).toUpperCase()}</span>
            <span>{file.content.length} characters</span>
            <span>{file.content.split('\n').length} lines</span>
          </div>
          
          {file.type === 'component' && (
            <div className="flex items-center gap-2">
              <ExternalLink className="h-3 w-3" />
              <span>React Component</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
