import { NextRequest, NextResponse } from "next/server";
import { ChatAnthropic } from "@langchain/anthropic";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";

// Initialize Anthropic model
const model = new ChatAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  model: "claude-sonnet-4-6",
  temperature: 0.7,
  maxTokens: 8000,
  streaming: true,
});

// Design generation prompt template for Figma-like designs
const designPrompt = PromptTemplate.fromTemplate(`
You are an expert UI/UX designer. Analyze the user's description and create a Figma-style design specification as JSON.

User's App Description:
{prompt}

If the user requests changes to a previous design, ensure those changes are reflected.

CRITICAL: Keep your response COMPACT. Use high-level components (e.g. "navbar", "card", "sidebar") instead of individual rectangles for every sub-element. Aim for 15-30 elements total, NOT hundreds. Group related UI into single component elements.

Respond with ONLY valid JSON in this exact structure:
{{
  "description": "Brief design concept (1-2 sentences)",
  "layout": "dashboard | landing-page | blog | e-commerce | portfolio | admin-panel | app",
  "artboardSize": {{ "width": 1440, "height": 1024, "name": "Desktop" }},
  "styling": {{
    "theme": "light | dark",
    "colorPalette": {{
      "primary": "#hex", "secondary": "#hex", "accent": "#hex",
      "background": "#hex", "surface": "#hex", "text": "#hex", "textSecondary": "#hex"
    }},
    "typography": {{
      "fontFamily": "Inter, system-ui, sans-serif",
      "scale": "sm | md | lg",
      "headingSize": "32px", "bodySize": "16px", "captionSize": "12px"
    }}
  }},
  "frames": [
    {{
      "id": "frame-1",
      "name": "Main Frame",
      "x": 0, "y": 0, "width": 1440, "height": 1024,
      "backgroundColor": "#FFFFFF",
      "elements": [
        {{
          "id": "el-1", "type": "text | rectangle | button | image | component",
          "content": "Placeholder text",
          "x": 0, "y": 0, "width": 200, "height": 40,
          "fontSize": 16, "fontWeight": "400", "color": "#hex",
          "backgroundColor": "#hex", "borderRadius": 8
        }}
      ]
    }}
  ],
  "textStyles": {{
    "heading1": {{ "fontSize": 48, "fontWeight": "700", "lineHeight": 1.2 }},
    "heading2": {{ "fontSize": 32, "fontWeight": "600", "lineHeight": 1.3 }},
    "body": {{ "fontSize": 16, "fontWeight": "400", "lineHeight": 1.6 }},
    "caption": {{ "fontSize": 12, "fontWeight": "400", "lineHeight": 1.5 }}
  }}
}}

Only include relevant properties per element type. No extra text outside the JSON.
`);

// Create the design generation chain
const designChain = RunnableSequence.from([
  designPrompt,
  model,
  new StringOutputParser(),
]);

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: "Valid prompt is required" },
        { status: 400 },
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "Anthropic API key is not configured" },
        { status: 500 },
      );
    }

    // Generate design specification
    const result = await designChain.invoke({ prompt: prompt.trim() });

    // Parse the JSON response
    let designSpec;
    try {
      let cleanedResult = result.replace(/```json\n?|\n?```/g, "").trim();

      // If truncated, try to repair by closing open structures
      try {
        designSpec = JSON.parse(cleanedResult);
      } catch {
        // Attempt repair: strip trailing incomplete value, close brackets
        cleanedResult = cleanedResult.replace(/,\s*$/, "");
        const openBraces =
          (cleanedResult.match(/{/g) || []).length -
          (cleanedResult.match(/}/g) || []).length;
        const openBrackets =
          (cleanedResult.match(/\[/g) || []).length -
          (cleanedResult.match(/]/g) || []).length;
        // Remove any trailing partial key-value (e.g. `"key":` or `"key": "val`)
        cleanedResult = cleanedResult.replace(
          /,?\s*"[^"]*"\s*:\s*("(?:[^"\\]|\\.)*)?$/,
          "",
        );
        cleanedResult += "]".repeat(Math.max(0, openBrackets));
        cleanedResult += "}".repeat(Math.max(0, openBraces));
        designSpec = JSON.parse(cleanedResult);
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      console.error("AI Response (last 500 chars):", result.slice(-500));
      return NextResponse.json(
        { error: "Failed to parse AI response. Please try again." },
        { status: 500 },
      );
    }

    // Validate required fields for Figma-style design
    const requiredFields = ["description", "layout", "styling"];
    const missingFields = requiredFields.filter((field) => !designSpec[field]);

    if (missingFields.length > 0) {
      console.error("Missing required fields:", missingFields);
      return NextResponse.json(
        {
          error: `AI response missing required fields: ${missingFields.join(", ")}`,
        },
        { status: 500 },
      );
    }

    // Validate Figma-style structure
    if (!designSpec.frames && !designSpec.components) {
      console.error("Design spec must have either frames or components");
      return NextResponse.json(
        {
          error:
            "Design specification must include either frames or components",
        },
        { status: 500 },
      );
    }

    // Add metadata and ensure proper date format
    const enhancedDesignSpec = {
      id: `design-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${Math.floor(Math.random() * 1000)}`,
      prompt,
      ...designSpec,
      createdAt: new Date(),
      status: "completed" as const,
    };

    return NextResponse.json({ designSpec: enhancedDesignSpec });
  } catch (error) {
    console.error("Design generation error:", error);

    // Handle specific error types
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
          "An unexpected error occurred while generating the design. Please try again.",
        details:
          process.env.NODE_ENV === "development"
            ? error?.toString()
            : undefined,
      },
      { status: 500 },
    );
  }
}
