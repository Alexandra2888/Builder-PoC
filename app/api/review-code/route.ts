import { NextRequest, NextResponse } from "next/server";
import { ChatAnthropic } from "@langchain/anthropic";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";

const model = new ChatAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  model: "claude-sonnet-4-6",
  temperature: 0.1,
  maxTokens: 8000,
  streaming: true,
});

export interface CodeReviewItem {
  file: string;
  line?: number;
  severity: "error" | "warning" | "info" | "suggestion";
  category:
    | "security"
    | "performance"
    | "best-practices"
    | "maintainability"
    | "accessibility"
    | "type-safety";
  title: string;
  description: string;
  suggestion?: string;
  codeSnippet?: string;
}

export interface CodeReviewResult {
  reviewId: string;
  overall: {
    score: number;
    summary: string;
    recommendations: string[];
  };
  issues: CodeReviewItem[];
  strengths: string[];
  createdAt: string;
}

function getLanguageFromPath(filePath: string): string {
  const ext = filePath.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "tsx":
    case "jsx":
    case "ts":
      return "typescript";
    case "js":
      return "javascript";
    case "json":
      return "json";
    case "css":
      return "css";
    default:
      return "text";
  }
}

const reviewPrompt = PromptTemplate.fromTemplate(`
You are an expert code reviewer for React/Next.js/TypeScript projects.

Review the following files for security, performance, best practices, maintainability, accessibility, and type safety.

Files:
{files}

Respond with ONLY valid JSON (no markdown fences):
{{
  "overall": {{
    "score": 85,
    "summary": "Brief overall assessment",
    "recommendations": ["Top recommendations"]
  }},
  "issues": [
    {{
      "file": "path/to/file.tsx",
      "line": 42,
      "severity": "error | warning | info | suggestion",
      "category": "security | performance | best-practices | maintainability | accessibility | type-safety",
      "title": "Issue title",
      "description": "Explanation",
      "suggestion": "How to fix"
    }}
  ],
  "strengths": ["Things done well"]
}}

Keep issues concise. Focus on the most impactful findings (max 15 issues).
`);

const reviewChain = RunnableSequence.from([
  reviewPrompt,
  model,
  new StringOutputParser(),
]);

export async function POST(request: NextRequest) {
  try {
    const { project } = await request.json();

    if (!project || !project.files || !Array.isArray(project.files)) {
      return NextResponse.json(
        { error: "Valid project with files array is required" },
        { status: 400 },
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "Anthropic API key is not configured" },
        { status: 500 },
      );
    }

    const filesToReview = project.files
      .filter(
        (file: { path: string; content: string; type: string }) =>
          file.path.match(/\.(tsx?|jsx?|css|json)$/i) &&
          file.content.length < 10000 &&
          !file.path.includes("node_modules"),
      )
      .slice(0, 10);

    if (filesToReview.length === 0) {
      return NextResponse.json(
        { error: "No reviewable code files found in the project" },
        { status: 400 },
      );
    }

    const filesText = filesToReview
      .map(
        (file: { path: string; content: string; type: string }) =>
          `**${file.path}** (${file.type}):\n\`\`\`${getLanguageFromPath(file.path)}\n${file.content}\n\`\`\``,
      )
      .join("\n\n");

    const result = await reviewChain.invoke({ files: filesText });

    let reviewData;
    try {
      let cleaned = result.replace(/```json\n?|\n?```/g, "").trim();
      try {
        reviewData = JSON.parse(cleaned);
      } catch {
        cleaned = cleaned.replace(/,\s*$/, "");
        const openBraces =
          (cleaned.match(/{/g) || []).length -
          (cleaned.match(/}/g) || []).length;
        const openBrackets =
          (cleaned.match(/\[/g) || []).length -
          (cleaned.match(/]/g) || []).length;
        cleaned = cleaned.replace(
          /,?\s*"[^"]*"\s*:\s*("(?:[^"\\]|\\.)*)?$/,
          "",
        );
        cleaned += "]".repeat(Math.max(0, openBrackets));
        cleaned += "}".repeat(Math.max(0, openBraces));
        reviewData = JSON.parse(cleaned);
      }
    } catch (parseError) {
      console.error("Failed to parse review response:", parseError);
      console.error("Response (last 500 chars):", result.slice(-500));
      return NextResponse.json(
        { error: "Failed to parse review response. Please try again." },
        { status: 500 },
      );
    }

    if (!reviewData.overall || !reviewData.issues || !reviewData.strengths) {
      return NextResponse.json(
        { error: "Invalid review response format" },
        { status: 500 },
      );
    }

    const validSeverities = ["error", "warning", "info", "suggestion"];
    const validCategories = [
      "security",
      "performance",
      "best-practices",
      "maintainability",
      "accessibility",
      "type-safety",
    ];

    const reviewResult: CodeReviewResult = {
      reviewId: `review-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      overall: {
        score: Math.min(100, Math.max(0, reviewData.overall.score || 70)),
        summary: reviewData.overall.summary || "Code review completed",
        recommendations: Array.isArray(reviewData.overall.recommendations)
          ? reviewData.overall.recommendations
          : [],
      },
      issues: Array.isArray(reviewData.issues)
        ? reviewData.issues.map(
            (issue: {
              file?: string;
              line?: number;
              severity?: string;
              category?: string;
              title?: string;
              description?: string;
              suggestion?: string;
              codeSnippet?: string;
            }) => ({
              file: issue.file || "unknown",
              line: issue.line,
              severity: validSeverities.includes(issue.severity || "")
                ? issue.severity
                : "info",
              category: validCategories.includes(issue.category || "")
                ? issue.category
                : "best-practices",
              title: issue.title || "Issue detected",
              description: issue.description || "No description provided",
              suggestion: issue.suggestion,
              codeSnippet: issue.codeSnippet,
            }),
          )
        : [],
      strengths: Array.isArray(reviewData.strengths)
        ? reviewData.strengths
        : [],
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({ review: reviewResult });
  } catch (error) {
    console.error("Code review error:", error);

    if (error instanceof Error && error.message.includes("API key")) {
      return NextResponse.json(
        {
          error: "Authentication failed. Please check your API configuration.",
        },
        { status: 401 },
      );
    }

    if (error instanceof Error && error.message.includes("rate limit")) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 },
      );
    }

    return NextResponse.json(
      {
        error:
          "An unexpected error occurred during code review. Please try again.",
        details:
          process.env.NODE_ENV === "development"
            ? error?.toString()
            : undefined,
      },
      { status: 500 },
    );
  }
}
