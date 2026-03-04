"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { useCodeReview } from "@/lib/hooks/use-ai";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  AlertTriangle,
  CheckCircle2,
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
  FileText,
  Search,
  Loader2,
  Sparkles,
  RefreshCw,
  ArrowUpRight,
  CircleDot,
} from "lucide-react";
import type { CodeReviewItem, CodeReviewResult } from "@/lib/store";

const severityConfig = {
  error: {
    icon: AlertTriangle,
    label: "Error",
    dot: "bg-red-500",
    bg: "bg-red-50 dark:bg-red-950/40",
    border: "border-red-200 dark:border-red-800/50",
    text: "text-red-700 dark:text-red-400",
    badge: "bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-300",
  },
  warning: {
    icon: AlertTriangle,
    label: "Warning",
    dot: "bg-amber-500",
    bg: "bg-amber-50 dark:bg-amber-950/40",
    border: "border-amber-200 dark:border-amber-800/50",
    text: "text-amber-700 dark:text-amber-400",
    badge:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300",
  },
  info: {
    icon: Info,
    label: "Info",
    dot: "bg-blue-500",
    bg: "bg-blue-50 dark:bg-blue-950/40",
    border: "border-blue-200 dark:border-blue-800/50",
    text: "text-blue-700 dark:text-blue-400",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300",
  },
  suggestion: {
    icon: Lightbulb,
    label: "Suggestion",
    dot: "bg-violet-500",
    bg: "bg-violet-50 dark:bg-violet-950/40",
    border: "border-violet-200 dark:border-violet-800/50",
    text: "text-violet-700 dark:text-violet-400",
    badge:
      "bg-violet-100 text-violet-700 dark:bg-violet-900/60 dark:text-violet-300",
  },
};

const categoryConfig = {
  security: {
    icon: Shield,
    name: "Security",
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-100 dark:bg-red-900/40",
  },
  performance: {
    icon: Zap,
    name: "Performance",
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-100 dark:bg-orange-900/40",
  },
  "best-practices": {
    icon: Star,
    name: "Best Practices",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-100 dark:bg-blue-900/40",
  },
  maintainability: {
    icon: Settings,
    name: "Maintainability",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-100 dark:bg-emerald-900/40",
  },
  accessibility: {
    icon: Accessibility,
    name: "Accessibility",
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-100 dark:bg-purple-900/40",
  },
  "type-safety": {
    icon: Code,
    name: "Type Safety",
    color: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-100 dark:bg-indigo-900/40",
  },
};

function ScoreRing({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 80) return { stroke: "#10b981", glow: "#10b98133" };
    if (s >= 60) return { stroke: "#f59e0b", glow: "#f59e0b33" };
    return { stroke: "#ef4444", glow: "#ef444433" };
  };

  const { stroke, glow } = getColor(score);

  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-muted/20"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={stroke}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            filter: `drop-shadow(0 0 6px ${glow})`,
            transition: "stroke-dashoffset 1s ease",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-3xl font-bold tracking-tight"
          style={{ color: stroke }}
        >
          {score}
        </span>
        <span className="text-xs text-muted-foreground font-medium">/ 100</span>
      </div>
    </div>
  );
}

function SeverityPill({
  severity,
  count,
  active,
  onClick,
}: {
  severity: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  const config = severityConfig[severity as keyof typeof severityConfig];
  if (!config) return null;
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
        active
          ? `${config.bg} ${config.text} ${config.border} border ring-1 ring-current/10`
          : "bg-muted/50 text-muted-foreground hover:bg-muted border border-transparent"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
      <span className="opacity-70">{count}</span>
    </button>
  );
}

function ReviewItemCard({
  item,
  isExpanded,
  onToggle,
}: {
  item: CodeReviewItem;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const sev = severityConfig[item.severity];
  const cat = categoryConfig[item.category];
  const SevIcon = sev.icon;
  const CatIcon = cat.icon;

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <CollapsibleTrigger asChild>
        <button
          className={`w-full text-left rounded-xl border p-3.5 transition-all hover:shadow-sm ${sev.border} ${isExpanded ? sev.bg : "bg-card hover:bg-muted/30"}`}
        >
          <div className="flex items-start gap-3">
            <div className={`mt-0.5 rounded-lg p-1.5 ${sev.bg}`}>
              <SevIcon className={`h-3.5 w-3.5 ${sev.text}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium truncate">
                  {item.title}
                </span>
                <Badge
                  className={`text-[10px] px-1.5 py-0 h-4 border-0 ${sev.badge}`}
                >
                  {item.severity}
                </Badge>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <CatIcon className={`h-3 w-3 ${cat.color}`} />
                <span>{cat.name}</span>
                <span className="opacity-40">·</span>
                <span className="font-mono">{item.file}</span>
                {item.line && (
                  <>
                    <span className="opacity-40">·</span>
                    <span>L{item.line}</span>
                  </>
                )}
              </div>
            </div>
            <div className="mt-1">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div
          className={`mx-3 mb-1 rounded-b-xl border border-t-0 p-4 space-y-3 ${sev.border} bg-card`}
        >
          <p className="text-sm text-muted-foreground leading-relaxed">
            {item.description}
          </p>
          {item.suggestion && (
            <div className="flex gap-2.5 p-3 rounded-lg bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/30">
              <Lightbulb className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-amber-900 dark:text-amber-200">
                {item.suggestion}
              </p>
            </div>
          )}
          {item.codeSnippet && (
            <pre className="text-xs font-mono bg-muted/50 p-3 rounded-lg border overflow-x-auto leading-relaxed">
              <code>{item.codeSnippet}</code>
            </pre>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function ReviewOverview({ review }: { review: CodeReviewResult }) {
  const issuesByCategory = review.issues.reduce(
    (acc, issue) => {
      acc[issue.category] = (acc[issue.category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const issuesBySeverity = review.issues.reduce(
    (acc, issue) => {
      acc[issue.severity] = (acc[issue.severity] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <div className="space-y-4">
      {/* Score + Summary Row */}
      <div className="rounded-2xl border bg-card p-5">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <ScoreRing score={review.overall.score} />
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-sm font-semibold text-foreground mb-1">
              Quality Score
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {review.overall.summary}
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              {Object.entries(issuesBySeverity).map(([severity, count]) => {
                const config =
                  severityConfig[severity as keyof typeof severityConfig];
                return (
                  <span
                    key={severity}
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${config.badge}`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${config.dot}`}
                    />
                    {count} {config.label}
                    {count !== 1 ? "s" : ""}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      {Object.keys(issuesByCategory).length > 0 && (
        <div className="rounded-2xl border bg-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Eye className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Areas for Improvement</h3>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(issuesByCategory)
              .sort(([, a], [, b]) => b - a)
              .map(([category, count]) => {
                const info =
                  categoryConfig[category as keyof typeof categoryConfig];
                const Icon = info.icon;
                return (
                  <div
                    key={category}
                    className="flex items-center gap-2.5 rounded-xl border p-3 bg-muted/20 hover:bg-muted/40 transition-colors"
                  >
                    <div className={`rounded-lg p-1.5 ${info.bg}`}>
                      <Icon className={`h-3.5 w-3.5 ${info.color}`} />
                    </div>
                    <span className="text-sm font-medium flex-1">
                      {info.name}
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground bg-muted rounded-full w-6 h-6 flex items-center justify-center">
                      {count}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}

export function CodeReviewPanel() {
  const { currentProject, currentReview, isReviewingCode } = useAppStore();
  const { reviewCode } = useCodeReview();
  const [filter, setFilter] = useState<
    "all" | "error" | "warning" | "info" | "suggestion"
  >("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (itemIndex: number) => {
    const next = new Set(expandedItems);
    const key = itemIndex.toString();
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setExpandedItems(next);
  };

  const handleStartReview = async () => {
    await reviewCode();
  };

  // --- Empty States ---
  if (!currentProject) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-10">
        <div className="rounded-2xl bg-muted/40 p-5 mb-5">
          <FileText className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-base font-semibold mb-1.5">No Project Yet</h3>
        <p className="text-sm text-muted-foreground max-w-[260px]">
          Generate code first to run an AI-powered code review.
        </p>
      </div>
    );
  }

  if (!currentReview && !isReviewingCode) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-10">
        <div className="rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-900/30 dark:to-indigo-900/30 p-5 mb-5">
          <Sparkles className="h-10 w-10 text-violet-600 dark:text-violet-400" />
        </div>
        <h3 className="text-base font-semibold mb-1.5">AI Code Review</h3>
        <p className="text-sm text-muted-foreground max-w-[280px] mb-6">
          Get expert feedback on security, performance, and best practices —
          powered by Claude.
        </p>
        <Button
          onClick={handleStartReview}
          size="lg"
          className="gap-2 rounded-xl"
        >
          <Search className="h-4 w-4" />
          Start Review
        </Button>
      </div>
    );
  }

  if (isReviewingCode) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-10">
        <div className="relative mb-5">
          <div className="absolute inset-0 rounded-2xl bg-primary/10 animate-ping" />
          <div className="relative rounded-2xl bg-primary/10 p-5">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
          </div>
        </div>
        <h3 className="text-base font-semibold mb-1.5">Analyzing Code…</h3>
        <p className="text-sm text-muted-foreground max-w-[280px]">
          Reviewing for security, performance, and best practices. This may take
          a moment.
        </p>
      </div>
    );
  }

  if (!currentReview) return null;

  // --- Filters ---
  const filteredIssues = currentReview.issues.filter((issue) => {
    const sevMatch = filter === "all" || issue.severity === filter;
    const catMatch =
      categoryFilter === "all" || issue.category === categoryFilter;
    return sevMatch && catMatch;
  });

  const issuesBySeverity = currentReview.issues.reduce(
    (acc, issue) => {
      acc[issue.severity] = (acc[issue.severity] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const uniqueCategories = Array.from(
    new Set(currentReview.issues.map((i) => i.category)),
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b bg-card">
        <div>
          <h2 className="text-sm font-semibold">Code Review</h2>
          <p className="text-[11px] text-muted-foreground">
            Powered by Claude ·{" "}
            {new Date(currentReview.createdAt).toLocaleDateString()}
          </p>
        </div>
        <Button
          onClick={handleStartReview}
          variant="outline"
          size="sm"
          className="gap-1.5 rounded-lg text-xs h-8"
        >
          <RefreshCw className="h-3 w-3" />
          Re-run
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          <ReviewOverview review={currentReview} />

          {/* Strengths */}
          {currentReview.strengths.length > 0 && (
            <div className="rounded-2xl border bg-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <h3 className="text-sm font-semibold">Strengths</h3>
              </div>
              <div className="space-y-2">
                {currentReview.strengths.map((s, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-sm">
                    <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground leading-relaxed">
                      {s}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {currentReview.overall.recommendations.length > 0 && (
            <div className="rounded-2xl border bg-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-amber-600" />
                <h3 className="text-sm font-semibold">Recommendations</h3>
              </div>
              <div className="space-y-2">
                {currentReview.overall.recommendations.map((r, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-sm">
                    <CircleDot className="h-3.5 w-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground leading-relaxed">
                      {r}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Issues */}
          {currentReview.issues.length > 0 && (
            <div className="rounded-2xl border bg-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Issues & Suggestions</h3>
                <span className="text-xs text-muted-foreground ml-auto">
                  {filteredIssues.length} shown
                </span>
              </div>

              {/* Severity filter pills */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                <button
                  onClick={() => setFilter("all")}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all border ${
                    filter === "all"
                      ? "bg-foreground text-background border-foreground"
                      : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted"
                  }`}
                >
                  All {currentReview.issues.length}
                </button>
                {Object.entries(issuesBySeverity).map(([sev, count]) => (
                  <SeverityPill
                    key={sev}
                    severity={sev}
                    count={count}
                    active={filter === sev}
                    onClick={() => setFilter(sev as typeof filter)}
                  />
                ))}
              </div>

              {/* Category filter pills */}
              {uniqueCategories.length > 1 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  <button
                    onClick={() => setCategoryFilter("all")}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-all border ${
                      categoryFilter === "all"
                        ? "bg-muted text-foreground border-border"
                        : "text-muted-foreground border-transparent hover:bg-muted/50"
                    }`}
                  >
                    All Categories
                  </button>
                  {uniqueCategories.map((cat) => {
                    const info =
                      categoryConfig[cat as keyof typeof categoryConfig];
                    return (
                      <button
                        key={cat}
                        onClick={() => setCategoryFilter(cat)}
                        className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-all border ${
                          categoryFilter === cat
                            ? "bg-muted text-foreground border-border"
                            : "text-muted-foreground border-transparent hover:bg-muted/50"
                        }`}
                      >
                        {info?.name || cat}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Issue list */}
              <div className="space-y-2">
                {filteredIssues.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No issues match your filters</p>
                  </div>
                ) : (
                  filteredIssues.map((issue, i) => (
                    <ReviewItemCard
                      key={`${issue.file}-${issue.line}-${i}`}
                      item={issue}
                      isExpanded={expandedItems.has(i.toString())}
                      onToggle={() => toggleExpanded(i)}
                    />
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
