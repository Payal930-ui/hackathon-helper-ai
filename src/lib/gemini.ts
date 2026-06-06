import { GoogleGenerativeAI } from "@google/generative-ai";
import type { GeneratedResults, OutputKey } from "./types";

const OUTPUT_PROMPTS: Record<OutputKey, string> = {
  projectPlan: `"projectPlan": A detailed step-by-step hackathon roadmap with phases (Day 1-3), milestones, team roles, and risk mitigation. Use markdown headings and bullet points.`,
  techStack: `"techStack": An object with keys "frontend", "backend", "database", "ai", "devops", "reasoning" — each with specific technology choices and 1-2 sentence justifications for a hackathon MVP.`,
  databaseSchema: `"databaseSchema": A text-based ER diagram with entities, relationships, field types, indexes, and sample Firestore/SQL collection structures.`,
  uiDesign: `"uiDesign": UX/UI suggestions including color palette (hex codes), typography, layout wireframe descriptions, responsive breakpoints, and key screen flows.`,
  codeSnippets: `"codeSnippets": An array of 3 objects with "title", "language", and "code" fields — production-ready snippets (e.g., main component, API route, data model).`,
  readme: `"readme": Complete README.md content with badges, description, features, tech stack, setup instructions, env variables, and license.`,
  deploymentGuide: `"deploymentGuide": Step-by-step deployment instructions for Render (primary) and alternatives, including env setup, build commands, and Firebase domain config.`,
  pptContent: `"pptContent": An array of exactly 10 slide objects. Each slide has "title", "content" (string or bullet array), and "type" (title|problem|solution|features|architecture|techStack|workflow|screenshots|future|thankyou). Slides: Title, Problem Statement, Solution, Features, Architecture, Tech Stack, Workflow, Screenshots Placeholder, Future Scope, Thank You.`,
};

export async function generateProjectData(
  title: string,
  description: string,
  outputs: OutputKey[]
): Promise<GeneratedResults> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 8192,
    },
  });

  const fieldInstructions = outputs
    .map((key) => OUTPUT_PROMPTS[key])
    .join("\n    ");

  const prompt = `You are an expert hackathon mentor, full-stack architect, and startup pitch coach.

Project Title: "${title}"
Project Description: "${description}"

Generate a comprehensive hackathon project package. Return ONLY a valid JSON object with these keys (include ONLY the requested ones):
    ${fieldInstructions}

Rules:
- Be specific to this project idea, not generic
- Use realistic, modern technologies appropriate for a 24-48 hour hackathon
- Code snippets must be complete and copy-paste ready
- PPT content must be compelling for judges
- Do NOT wrap the response in markdown code blocks
- Return raw JSON only`;

  const generatedResult = await model.generateContent(prompt);
  const response = await generatedResult.response;
  let text = response.text().trim();

  if (text.startsWith("```")) {
    text = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }

  const parsed = JSON.parse(text) as Record<string, unknown>;
  const generated: GeneratedResults = {};

  for (const key of outputs) {
    if (key in parsed && parsed[key] !== undefined) {
      (generated as Record<string, unknown>)[key] = parsed[key];
    } else {
      (generated as Record<string, unknown>)[key] =
        `Content for ${key} could not be generated. Please regenerate.`;
    }
  }

  return generated;
}
