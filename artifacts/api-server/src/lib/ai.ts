import OpenAI from "openai";

const MODEL = "grok-3-fast";
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY_MS = 1000;

function getClient(): OpenAI {
  const apiKey = process.env["XAI_API_KEY"];
  if (!apiKey) throw new Error("XAI_API_KEY environment variable is not set");
  return new OpenAI({
    apiKey,
    baseURL: "https://api.x.ai/v1",
    maxRetries: 0,
    timeout: 60_000,
  });
}

async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  let lastError: unknown;
  let delay = INITIAL_RETRY_DELAY_MS;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;

      if (err instanceof OpenAI.APIError) {
        const isRateLimit = err.status === 429;
        const isServerError = err.status >= 500;

        if ((isRateLimit || isServerError) && attempt < MAX_RETRIES) {
          const retryAfterHeader = err.headers?.["retry-after"];
          const waitMs =
            retryAfterHeader != null
              ? Number(retryAfterHeader) * 1000
              : delay;
          await new Promise((resolve) => setTimeout(resolve, waitMs));
          delay *= 2;
          continue;
        }

        if (isRateLimit) {
          throw new Error(
            "The AI service is currently rate-limited. Please wait a moment and try again."
          );
        }
      }

      throw err;
    }
  }

  throw lastError;
}

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

export async function generateProjectData(
  title: string,
  description: string,
  outputs: string[],
  teamSize: number = 1,
  duration: string = "24h"
): Promise<Record<string, unknown>> {
  const client = getClient();

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

  const completion = await withRetry(() =>
    client.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 8192,
      response_format: { type: "json_object" },
    })
  );

  const text = completion.choices[0]?.message?.content?.trim() ?? "";

  let parsed: Record<string, unknown>;
  try {
    const cleaned = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    parsed = JSON.parse(cleaned) as Record<string, unknown>;
  } catch {
    throw new Error("AI returned invalid JSON. Please try again.");
  }

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
  const client = getClient();

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: `You are an expert hackathon mentor for a project called "${title}". Project description: "${description}". Help the user with technical and strategic questions. Be concise, practical, and encouraging.`,
    },
    ...history.map(
      (msg): OpenAI.Chat.ChatCompletionMessageParam => ({
        role: msg.role === "model" ? "assistant" : "user",
        content: msg.parts.map((p) => p.text).join("\n"),
      })
    ),
    { role: "user", content: question },
  ];

  const completion = await withRetry(() =>
    client.chat.completions.create({
      model: MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 1024,
    })
  );

  return (
    completion.choices[0]?.message?.content?.trim() ??
    "I could not generate a response. Please try again."
  );
}
