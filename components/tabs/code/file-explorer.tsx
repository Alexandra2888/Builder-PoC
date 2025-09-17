'use client'

import { useState } from 'react'
import { Project, GeneratedFile, useAppStore } from '@/lib/store'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { 
  ChevronRight, 
  ChevronDown, 
  FileText, 
  Folder, 
  FolderOpen,
  Code,
  Palette,
  Settings,
  Layout
} from 'lucide-react'

interface FileExplorerProps {
  project: Project
}

interface FileNode {
  name: string
  path: string
  type: 'file' | 'folder'
  children?: FileNode[]
  file?: GeneratedFile
}

export function FileExplorer({ project }: FileExplorerProps) {
  const { selectedFile, setSelectedFile } = useAppStore()
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['/', '/app', '/components']))

  // Build file tree from flat file list
  const buildFileTree = (files: GeneratedFile[]): FileNode[] => {
    const root: FileNode = { name: '', path: '/', type: 'folder', children: [] }
    const nodeMap = new Map<string, FileNode>()
    nodeMap.set('/', root)

    // Sort files to ensure consistent ordering
    const sortedFiles = [...files].sort((a, b) => a.path.localeCompare(b.path))

    for (const file of sortedFiles) {
      const pathParts = file.path.split('/').filter(Boolean)
      let currentPath = ''
      let parent = root

      // Create folder nodes for each path part
      for (let i = 0; i < pathParts.length - 1; i++) {
        currentPath += '/' + pathParts[i]
        
        if (!nodeMap.has(currentPath)) {
          const folderNode: FileNode = {
            name: pathParts[i],
            path: currentPath,
            type: 'folder',
            children: []
          }
          nodeMap.set(currentPath, folderNode)
          parent.children!.push(folderNode)
        }
        
        parent = nodeMap.get(currentPath)!
      }

      // Create file node
      const fileName = pathParts[pathParts.length - 1]
      const fileNode: FileNode = {
        name: fileName,
        path: file.path,
        type: 'file',
        file
      }
      parent.children!.push(fileNode)
    }

    return root.children || []
  }

  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith('.tsx') || fileName.endsWith('.jsx')) {
      return <Code className="h-4 w-4 text-blue-500" />
    }
    if (fileName.endsWith('.ts') || fileName.endsWith('.js')) {
      return <Code className="h-4 w-4 text-yellow-500" />
    }
    if (fileName.endsWith('.css') || fileName.includes('tailwind')) {
      return <Palette className="h-4 w-4 text-pink-500" />
    }
    if (fileName.includes('config') || fileName.endsWith('.json')) {
      return <Settings className="h-4 w-4 text-gray-500" />
    }
    if (fileName.includes('layout') || fileName.includes('page')) {
      return <Layout className="h-4 w-4 text-green-500" />
    }
    return <FileText className="h-4 w-4 text-muted-foreground" />
  }

  const getFileTypeColor = (type?: GeneratedFile['type']) => {
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

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(path)) {
      newExpanded.delete(path)
    } else {
      newExpanded.add(path)
    }
    setExpandedFolders(newExpanded)
  }

  const renderFileNode = (node: FileNode, level: number = 0): React.JSX.Element => {
    const isExpanded = expandedFolders.has(node.path)
    const isSelected = selectedFile === node.path
    const paddingLeft = level * 16 + 8

    if (node.type === 'folder') {
      return (
        <div key={node.path}>
          <div
            className="flex items-center gap-2 p-2 hover:bg-muted/50 cursor-pointer rounded-sm"
            style={{ paddingLeft }}
            onClick={() => toggleFolder(node.path)}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            {isExpanded ? (
              <FolderOpen className="h-4 w-4 text-blue-500" />
            ) : (
              <Folder className="h-4 w-4 text-blue-500" />
            )}
            <span className="text-sm font-medium">{node.name}</span>
          </div>
          {isExpanded && node.children && (
            <div>
              {node.children.map((child) => renderFileNode(child, level + 1))}
            </div>
          )}
        </div>
      )
    }

    return (
      <div
        key={node.path}
        className={`flex items-center gap-2 p-2 hover:bg-muted/50 cursor-pointer rounded-sm ${
          isSelected ? 'bg-primary/10 border-r-2 border-primary' : ''
        }`}
        style={{ paddingLeft }}
        onClick={() => setSelectedFile(node.path)}
      >
        {getFileIcon(node.name)}
        <span className="text-sm flex-1 truncate">{node.name}</span>
        {node.file?.type && (
          <Badge 
            variant="secondary" 
            className={`text-xs h-4 px-1 ${getFileTypeColor(node.file.type)}`}
          >
            {node.file.type}
          </Badge>
        )}
      </div>
    )
  }

  const fileTree = buildFileTree(project.files)

  return (
    <ScrollArea className="h-full">
      <div className="space-y-1">
        {/* Project Stats */}
        <div className="p-2 mb-4 bg-muted/30 rounded-sm">
          <div className="text-xs text-muted-foreground mb-1">
            {project.files.length} files
          </div>
          <div className="flex gap-1 flex-wrap">
            {['component', 'page', 'config', 'style'].map(type => {
              const count = project.files.filter(f => f.type === type).length
              if (count === 0) return null
              return (
                <Badge 
                  key={type} 
                  variant="outline" 
                  className="text-xs h-4 px-1 capitalize"
                >
                  {count} {type}
                </Badge>
              )
            })}
          </div>
        </div>

        {/* File Tree */}
        {fileTree.map((node) => renderFileNode(node))}
      </div>
    </ScrollArea>
  )
}
