'use client'

import { useAppStore } from '@/lib/store'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DesignTab } from './tabs/design-tab'
import { CodeTab } from './tabs/code-tab'
import { Header } from './header'
import { Sparkles, Code2 } from 'lucide-react'

export function MainLayout() {
  const { activeTab, setActiveTab } = useAppStore()

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as 'design' | 'code')}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="design" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Design
            </TabsTrigger>
            <TabsTrigger value="code" className="flex items-center gap-2">
              <Code2 className="h-4 w-4" />
              Code
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="design" className="mt-0">
            <DesignTab />
          </TabsContent>
          
          <TabsContent value="code" className="mt-0">
            <CodeTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
