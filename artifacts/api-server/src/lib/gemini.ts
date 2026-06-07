import { GoogleGenerativeAI } from "@google/generative-ai";

const OUTPUT_PROMPTS: Record<string, string> = {
  projectPlan: `"projectPlan": A detailed step-by-step hackathon roadmap with phases (Day 1-3), milestones, team roles, and risk mitigation. Use markdown headings and bullet points.`,
  techStack: `"techStack": An object with keys "frontend", "backend", "database", "ai", "devops", "reasoning" — each with specific technology choices and 1-2 sentence justifications for a hackathon MVP.`,
  databaseSchema: `"databaseSchema": A text-based ER diagram with entities, relationships, field types, indexes, and sample Firestore/SQL collection structures.`,
  uiDesign: `"uiDesign": UX/UI suggestions including color palette (hex codes), typography, layout wireframe descriptions, responsive breakpoints, and key screen flows.`,
  codeSnippets: `"codeSnippets": An array of 3 objects with "title", "language", and "code" fields — production-ready snippets (e.g., main component, API route, data model).`,
  readme: `"readme": Complete README.md content with badges, description, features, tech stack, setup instructions, env variables, and license.`,
  deploymentGuide: `"deploymentGuide": Step-by-step deployment instructions for Render (primary) and alternatives, including env setup, build commands, and Firebase domain config.`,
  pptContent: `"pptContent": An array of exactly 10 slide objects. Each slide has "title", "content" (string or bullet array), and "type" (title|problem|solution|features|architecture|techStack|workflow|screenshots|future|thankyou).`,
  projectScores: `"projectScores": An object with "innovation", "feasibility", "scalability", "uiux", "winningProbability" (all integers 0-100).`,
  pitches: `"pitches": An object with "thirtySeconds", "oneMinute", "threeMinutes" pitches.`,
  teamTasks: `"teamTasks": An array of objects with "role" and "tasks" (array of strings) distributed based on the team size provided.`,
  timeline: `"timeline": An array of objects with "time" and "task" based on the duration provided.`,
  validator: `"validator": An object with "strengths" (array), "weaknesses" (array), "risks" (array), "suggestions" (array).`,
};

const GEMINI_MODEL = "gemini-2.0-flash";

function getGenAI(): GoogleGenerativeAI {
  const apiKey = process.env["GEMINI_API_KEY"];
  if (!apiKey) throw new Error("GEMINI_API_KEY environment variable is not set");
  return new GoogleGenerativeAI(apiKey);
}

export async function generateProjectData(
  title: string,
  description: string,
  outputs: string[],
  teamSize: number = 1,
  duration: string = "24h"
): Promise<Record<string, unknown>> {
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    generationConfig: { temperature: 0.7, maxOutputTokens: 8192 },
  });

  const fieldInstructions = outputs
    .filter((k) => OUTPUT_PROMPTS[k])
    .map((k) => OUTPUT_PROMPTS[k])
    .join("\n    ");

  const prompt = `You are an expert hackathon mentor, full-stack architect, and startup pitch coach.

Project Title: "${title}"
Project Description: "${description}"
Team Size: ${teamSize} members
Project Duration: ${duration}

Generate a comprehensive hackathon project package. Return ONLY a valid JSON object with these keys (include ONLY the requested ones):
    ${fieldInstructions}

Rules:
- Be specific to this project idea, not generic
- Use realistic, modern technologies appropriate for a 24-48 hour hackathon
- Code snippets must be complete and copy-paste ready
- PPT content must be compelling for judges
- Project scores should be realistic based on the idea
- Do NOT wrap the response in markdown code blocks
- Return raw JSON only`;

  const generatedResult = await model.generateContent(prompt);
  let text = generatedResult.response.text().trim();
  if (text.startsWith("```")) {
    text = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }

  const parsed = JSON.parse(text) as Record<string, unknown>;
  const result: Record<string, unknown> = {};
  for (const key of outputs) {
    result[key] = parsed[key] ?? `Content for ${key} could not be generated.`;
  }
  return result;
}

export async function askMentor(
  title: string,
  description: string,
  question: string,
  history: { role: "user" | "model"; parts: { text: string }[] }[] = []
): Promise<string> {
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

  const chat = model.startChat({
    history: [
      {
        role: "user",
        parts: [{ text: `You are a hackathon mentor for a project called "${title}". Description: "${description}". Help the user with their technical or strategic questions.` }],
      },
      {
        role: "model",
        parts: [{ text: "I am your hackathon mentor. How can I help you build this project today?" }],
      },
      ...history,
    ],
  });

  const result = await chat.sendMessage(question);
  return result.response.text();
}
