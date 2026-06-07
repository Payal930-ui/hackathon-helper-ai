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
  "projectScores",
  "pitches",
  "teamTasks",
  "timeline",
  "validator",
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, selectedOutputs, teamSize, duration } = body;

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
      outputs,
      teamSize || 1,
      duration || "24h"
    );

    console.log("Generation successful for:", title);
    return NextResponse.json({ generatedResults: result });
  } catch (error) {
    console.error("API Route Generation Error:", error);
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
