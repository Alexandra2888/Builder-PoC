'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { useCodeReview } from '@/lib/hooks/use-ai'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Lightbulb,
  Shield,
  Zap,
  Code,
  Accessibility,
  Settings,
  Eye,
  ChevronDown,
  ChevronRight,
  Star,
  TrendingUp,
  Target,
  FileText,
  Search,
  Loader2
} from 'lucide-react'
import type { CodeReviewItem, CodeReviewResult } from '@/lib/store'

const severityConfig = {
  error: {
    icon: AlertTriangle,
    color: 'text-red-600 bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800',
    badgeColor: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800',
    badgeColor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
  },
  info: {
    icon: Info,
    color: 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800',
    badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
  },
  suggestion: {
    icon: Lightbulb,
    color: 'text-purple-600 bg-purple-50 border-purple-200 dark:bg-purple-950 dark:border-purple-800',
    badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
  }
}

const categoryConfig = {
  security: {
    icon: Shield,
    name: 'Security',
    color: 'text-red-600'
  },
  performance: {
    icon: Zap,
    name: 'Performance',
    color: 'text-orange-600'
  },
  'best-practices': {
    icon: Star,
    name: 'Best Practices',
    color: 'text-blue-600'
  },
  maintainability: {
    icon: Settings,
    name: 'Maintainability',
    color: 'text-green-600'
  },
  accessibility: {
    icon: Accessibility,
    name: 'Accessibility',
    color: 'text-purple-600'
  },
  'type-safety': {
    icon: Code,
    name: 'Type Safety',
    color: 'text-indigo-600'
  }
}

interface ReviewItemCardProps {
  item: CodeReviewItem
  isExpanded: boolean
  onToggle: () => void
}

function ReviewItemCard({ item, isExpanded, onToggle }: ReviewItemCardProps) {
  const severityInfo = severityConfig[item.severity]
  const categoryInfo = categoryConfig[item.category]
  const SeverityIcon = severityInfo.icon
  const CategoryIcon = categoryInfo.icon

  return (
    <Card className={`border transition-colors ${severityInfo.color}`}>
      <Collapsible open={isExpanded} onOpenChange={onToggle}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <SeverityIcon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <CardTitle className="text-sm font-medium truncate">
                      {item.title}
                    </CardTitle>
                    <Badge variant="secondary" className={`text-xs h-5 px-2 ${severityInfo.badgeColor}`}>
                      {item.severity}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CategoryIcon className={`h-3 w-3 ${categoryInfo.color}`} />
                    <span>{categoryInfo.name}</span>
                    <span>•</span>
                    <span className="font-mono">{item.file}</span>
                    {item.line && (
                      <>
                        <span>•</span>
                        <span>Line {item.line}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0 ml-2">
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {item.description}
              </p>
              
              {item.suggestion && (
                <div className="p-3 bg-muted/30 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium">Suggestion</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {item.suggestion}
                  </p>
                </div>
              )}
              
              {item.codeSnippet && (
                <div className="p-3 bg-muted/30 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <Code className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Code Snippet</span>
                  </div>
                  <pre className="text-xs font-mono bg-background p-2 rounded border overflow-x-auto">
                    <code>{item.codeSnippet}</code>
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}

interface ReviewOverviewProps {
  review: CodeReviewResult
}

function ReviewOverview({ review }: ReviewOverviewProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBackground = (score: number) => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-950'
    if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-950'
    return 'bg-red-100 dark:bg-red-950'
  }

  const issuesByCategory = review.issues.reduce((acc, issue) => {
    acc[issue.category] = (acc[issue.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const issuesBySeverity = review.issues.reduce((acc, issue) => {
    acc[issue.severity] = (acc[issue.severity] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Overall Score */}
      <Card className={`${getScoreBackground(review.overall.score)} border-2`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className={`h-5 w-5 ${getScoreColor(review.overall.score)}`} />
            Overall Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className={`text-4xl font-bold ${getScoreColor(review.overall.score)}`}>
              {review.overall.score}
              <span className="text-xl text-muted-foreground">/100</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {review.overall.summary}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Issue Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Issue Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Issues</span>
              <span className="font-medium">{review.issues.length}</span>
            </div>
            
            {Object.entries(issuesBySeverity).map(([severity, count]) => (
              <div key={severity} className="flex justify-between text-sm">
                <span className="capitalize text-muted-foreground">{severity}s</span>
                <Badge variant="secondary" className={severityConfig[severity as keyof typeof severityConfig].badgeColor}>
                  {count}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Categories */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Areas for Improvement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-3">
            {Object.entries(issuesByCategory)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 6)
              .map(([category, count]) => {
                const categoryInfo = categoryConfig[category as keyof typeof categoryConfig]
                const CategoryIcon = categoryInfo.icon
                return (
                  <div key={category} className="flex items-center gap-2 p-2 rounded-lg border bg-muted/30">
                    <CategoryIcon className={`h-4 w-4 ${categoryInfo.color}`} />
                    <span className="text-sm font-medium flex-1">{categoryInfo.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {count}
                    </Badge>
                  </div>
                )
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function CodeReviewPanel() {
  const { currentProject, currentReview, isReviewingCode } = useAppStore()
  const { reviewCode } = useCodeReview()
  const [filter, setFilter] = useState<'all' | 'error' | 'warning' | 'info' | 'suggestion'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const toggleExpanded = (itemIndex: number) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(itemIndex.toString())) {
      newExpanded.delete(itemIndex.toString())
    } else {
      newExpanded.add(itemIndex.toString())
    }
    setExpandedItems(newExpanded)
  }

  const handleStartReview = async () => {
    await reviewCode()
  }

  if (!currentProject) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <FileText className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Project Selected</h3>
        <p className="text-muted-foreground">
          Generate code first to get AI-powered code review
        </p>
      </div>
    )
  }

  if (!currentReview && !isReviewingCode) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <Search className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">AI Code Review</h3>
        <p className="text-muted-foreground mb-6">
          Get expert feedback on your generated code with security, performance, 
          and best practices analysis powered by OpenAI.
        </p>
        <Button onClick={handleStartReview} size="lg" className="gap-2">
          <Search className="h-4 w-4" />
          Start Code Review
        </Button>
      </div>
    )
  }

  if (isReviewingCode) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
        <h3 className="text-lg font-semibold mb-2">Analyzing Code...</h3>
        <p className="text-muted-foreground">
          Our AI is reviewing your code for security, performance, and best practices
        </p>
      </div>
    )
  }

  if (!currentReview) return null

  const filteredIssues = currentReview.issues.filter(issue => {
    const severityMatch = filter === 'all' || issue.severity === filter
    const categoryMatch = categoryFilter === 'all' || issue.category === categoryFilter
    return severityMatch && categoryMatch
  })

  const uniqueCategories = Array.from(new Set(currentReview.issues.map(issue => issue.category)))

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h2 className="text-lg font-semibold">Code Review Results</h2>
          <p className="text-sm text-muted-foreground">
            Powered by OpenAI • {new Date(currentReview.createdAt).toLocaleDateString()}
          </p>
        </div>
        <Button onClick={handleStartReview} variant="outline" size="sm" className="gap-2">
          <Search className="h-4 w-4" />
          Run New Review
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Overview */}
          <ReviewOverview review={currentReview} />

          {/* Strengths */}
          {currentReview.strengths.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  Code Strengths
                </CardTitle>
                <CardDescription>
                  Things your code does well
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {currentReview.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          {currentReview.overall.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-600" />
                  Key Recommendations
                </CardTitle>
                <CardDescription>
                  High-level suggestions for improvement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {currentReview.overall.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Filters */}
          {currentReview.issues.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Issues & Suggestions</CardTitle>
                <CardDescription>
                  Filter and explore detailed feedback
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  <div className="flex gap-1">
                    {(['all', 'error', 'warning', 'info', 'suggestion'] as const).map(severity => (
                      <Button
                        key={severity}
                        variant={filter === severity ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilter(severity)}
                        className="capitalize"
                      >
                        {severity === 'all' ? 'All' : severity}
                      </Button>
                    ))}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant={categoryFilter === 'all' ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCategoryFilter('all')}
                    >
                      All Categories
                    </Button>
                    {uniqueCategories.map(category => (
                      <Button
                        key={category}
                        variant={categoryFilter === category ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCategoryFilter(category)}
                      >
                        {categoryConfig[category as keyof typeof categoryConfig]?.name || category}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  {filteredIssues.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="h-12 w-12 mx-auto mb-2" />
                      <p>No issues found for the selected filters</p>
                    </div>
                  ) : (
                    filteredIssues.map((issue, index) => (
                      <ReviewItemCard
                        key={`${issue.file}-${issue.line}-${index}`}
                        item={issue}
                        isExpanded={expandedItems.has(index.toString())}
                        onToggle={() => toggleExpanded(index)}
                      />
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
