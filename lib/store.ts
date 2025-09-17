import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

// Types for our application state
export interface DesignSpec {
  id: string
  prompt: string
  description: string
  components: ComponentSpec[]
  styling: StyleSpec
  layout: string
  createdAt: Date
  status: 'generating' | 'completed' | 'approved' | 'rejected'
}

export interface ComponentSpec {
  id: string
  type: string
  name: string
  props: Record<string, unknown>
  children?: ComponentSpec[]
}

export interface StyleSpec {
  theme: 'light' | 'dark' | 'system'
  colorPalette: {
    primary: string
    secondary: string
    accent: string
  }
  typography: {
    fontFamily: string
    scale: 'sm' | 'md' | 'lg'
  }
}

export interface GeneratedFile {
  path: string
  content: string
  type: 'component' | 'page' | 'config' | 'style'
}

export interface Project {
  id: string
  name: string
  description: string
  files: GeneratedFile[]
  designSpec: DesignSpec
  createdAt: Date
  updatedAt: Date
}

interface AppState {
  // Current tab
  activeTab: 'design' | 'code'
  setActiveTab: (tab: 'design' | 'code') => void
  
  // Design state
  currentPrompt: string
  setCurrentPrompt: (prompt: string) => void
  
  currentDesign: DesignSpec | null
  setCurrentDesign: (design: DesignSpec | null) => void
  
  isGeneratingDesign: boolean
  setIsGeneratingDesign: (loading: boolean) => void
  
  // Code state
  currentProject: Project | null
  setCurrentProject: (project: Project | null) => void
  
  isGeneratingCode: boolean
  setIsGeneratingCode: (loading: boolean) => void
  
  selectedFile: string | null
  setSelectedFile: (file: string | null) => void
  
  // History
  designHistory: DesignSpec[]
  addToDesignHistory: (design: DesignSpec) => void
  
  projects: Project[]
  addProject: (project: Project) => void
  updateProject: (projectId: string, updates: Partial<Project>) => void
  
  // UI state
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
}

export const useAppStore = create<AppState>()(
  devtools(
    (set) => ({
      // Initial state
      activeTab: 'design',
      currentPrompt: '',
      currentDesign: null,
      isGeneratingDesign: false,
      currentProject: null,
      isGeneratingCode: false,
      selectedFile: null,
      designHistory: [],
      projects: [],
      sidebarCollapsed: false,
      
      // Actions
      setActiveTab: (tab) => set({ activeTab: tab }),
      
      setCurrentPrompt: (prompt) => set({ currentPrompt: prompt }),
      
      setCurrentDesign: (design) => set({ currentDesign: design }),
      
      setIsGeneratingDesign: (loading) => set({ isGeneratingDesign: loading }),
      
      setCurrentProject: (project) => set({ currentProject: project }),
      
      setIsGeneratingCode: (loading) => set({ isGeneratingCode: loading }),
      
      setSelectedFile: (file) => set({ selectedFile: file }),
      
      addToDesignHistory: (design) =>
        set((state) => {
          const filteredHistory = state.designHistory.filter(d => d.id !== design.id)
          return {
            designHistory: [design, ...filteredHistory].slice(0, 10) // Keep last 10
          }
        }),
      
      addProject: (project) =>
        set((state) => {
          const filteredProjects = state.projects.filter(p => p.id !== project.id)
          return {
            projects: [project, ...filteredProjects]
          }
        }),
      
      updateProject: (projectId, updates) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId ? { ...p, ...updates, updatedAt: new Date() } : p
          )
        })),
      
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
    }),
    {
      name: 'ai-builder-store',
    }
  )
)
