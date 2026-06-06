import { NextRequest, NextResponse } from "next/server";
import { generateProjectData } from "@/lib/gemini";
import type { OutputKey } from "@/lib/types";

const VALID_OUTPUTS: OutputKey[] = [
  "projectPlan",
  "techStack",
  "databaseSchema",
  "uiDesign",
  "codeSnippets",
  "pptContent",
  "readme",
  "deploymentGuide",
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, selectedOutputs } = body;

    if (!title?.trim() || !description?.trim()) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(selectedOutputs) || selectedOutputs.length === 0) {
      return NextResponse.json(
        { error: "At least one output must be selected" },
        { status: 400 }
      );
    }

    const outputs = selectedOutputs.filter((o: string) =>
      VALID_OUTPUTS.includes(o as OutputKey)
    ) as OutputKey[];

    if (outputs.length === 0) {
      return NextResponse.json(
        { error: "Invalid output selection" },
        { status: 400 }
      );
    }

    const result = await generateProjectData(
      title.trim(),
      description.trim(),
      outputs
    );

    return NextResponse.json({ generatedResults: result });
  } catch (error) {
    console.error("Generate API error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to generate project";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
