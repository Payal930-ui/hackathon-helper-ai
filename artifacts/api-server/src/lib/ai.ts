import OpenAI from "openai";

const MODEL = "deepseek/deepseek-chat-v3-0324";
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY_MS = 1000;

function getClient(): OpenAI {
  const apiKey = process.env["OPENROUTER_API_KEY"];
  if (!apiKey) throw new Error("OPENROUTER_API_KEY environment variable is not set");
  return new OpenAI({
    apiKey,
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
      "HTTP-Referer": "https://hackathon-helper.replit.app",
      "X-Title": "Hackathon Helper AI",
    },
    maxRetries: 0,
    timeout: 90_000,
  });
}

async function withRetry<T>(fn: () => Promise<T>, label: string): Promise<T> {
  let lastError: unknown;
  let delay = INITIAL_RETRY_DELAY_MS;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const start = Date.now();
    try {
      const result = await fn();
      console.log(`[AI] ${label} succeeded in ${Date.now() - start}ms (attempt ${attempt + 1})`);
      return result;
    } catch (err) {
      lastError = err;
      const elapsed = Date.now() - start;

      if (err instanceof OpenAI.APIError) {
        const isRateLimit = err.status === 429;
        const isServerError = err.status >= 500;

        console.warn(`[AI] ${label} failed (attempt ${attempt + 1}, ${elapsed}ms): HTTP ${err.status} — ${err.message}`);

        if ((isRateLimit || isServerError) && attempt < MAX_RETRIES) {
          const retryAfterHeader = err.headers?.["retry-after"];
          const waitMs = retryAfterHeader != null ? Number(retryAfterHeader) * 1000 : delay;
          console.log(`[AI] Retrying in ${waitMs}ms...`);
          await new Promise((resolve) => setTimeout(resolve, waitMs));
          delay *= 2;
          continue;
        }

        if (isRateLimit) {
          throw new Error("AI service is rate-limited. Please wait a moment and try again.");
        }
        if (err.status === 402) {
          throw new Error("AI service quota exceeded. Please check your OpenRouter balance.");
        }
      } else {
        console.error(`[AI] ${label} failed (attempt ${attempt + 1}, ${elapsed}ms):`, err);
      }

      throw err;
    }
  }

  throw lastError;
}

function extractJSON(text: string): Record<string, unknown> {
  let cleaned = text.trim();
  // Strip markdown code fences
  cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  // Find first { and last }
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    cleaned = cleaned.slice(start, end + 1);
  }
  return JSON.parse(cleaned) as Record<string, unknown>;
}

const OUTPUT_PROMPTS: Record<string, string> = {
  projectPlan: `"projectPlan": A detailed step-by-step hackathon roadmap with phases (Day 1-3), milestones, team roles, and risk mitigation. Use markdown headings (##) and bullet points (-).`,
  techStack: `"techStack": An object with keys "frontend", "backend", "database", "ai", "devops", "reasoning" — each with specific technology choices and 1-2 sentence justifications for a hackathon MVP.`,
  databaseSchema: `"databaseSchema": A text-based ER diagram with entities, relationships, field types, indexes, and sample Firestore/SQL collection structures. Use markdown formatting.`,
  uiDesign: `"uiDesign": UX/UI suggestions including color palette with actual hex codes (e.g. #2563eb), typography choices, layout wireframe descriptions, key screen flows, and component suggestions.`,
  codeSnippets: `"codeSnippets": An array of 3 objects with "title", "language", and "code" fields — production-ready snippets (e.g., main component, API route, data model).`,
  readme: `"readme": Complete README.md content with badges, description, features list, tech stack table, setup instructions, env variables table, and MIT license.`,
  deploymentGuide: `"deploymentGuide": Step-by-step numbered deployment instructions for Render/Vercel, including env setup, build commands, domain config, and troubleshooting.`,
  pptContent: `"pptContent": An array of exactly 10 slide objects. Each slide has "title", "content" (string or string array of bullets), and "type" (one of: title, problem, solution, features, architecture, techStack, workflow, screenshots, future, thankyou).`,
  projectScores: `"projectScores": An object with integer 0-100 values for: "innovation", "feasibility", "scalability", "uiux", "winningProbability", "marketPotential", "complexity".`,
  pitches: `"pitches": An object with "thirtySeconds", "oneMinute", "threeMinutes" — compelling pitch scripts for judges.`,
  teamTasks: `"teamTasks": An array of objects with "role" and "tasks" (string array) distributed by team size. Include estimated hours per task.`,
  timeline: `"timeline": An array of objects with "time" (e.g. "Hour 1-2") and "task" (specific deliverable) based on duration. Be granular.`,
  validator: `"validator": An object with "strengths" (array), "weaknesses" (array), "risks" (array), "suggestions" (array), "score" (0-100 integer), and "verdict" (string summary).`,
  architectureDiagram: `"architectureDiagram": An array of exactly 4 diagram objects, each with "title" (string) and "diagram" (string — valid Mermaid.js syntax). Include these 4 diagrams in order:
    1. title: "System Architecture" — use \`graph TD\` showing all major components (frontend, backend, API, DB, external services) with labeled arrows.
    2. title: "User Flow" — use \`flowchart TD\` showing the full user journey from landing page through auth, core feature, to completion.
    3. title: "API Flow" — use \`sequenceDiagram\` showing how Client, API Server, Database, and AI Service interact for the main use case.
    4. title: "Data Model" — use \`erDiagram\` showing the main entities, their fields (with types), and relationships.
    CRITICAL: Each "diagram" value must be syntactically valid Mermaid. Use simple node IDs (no spaces, no special chars). Escape quotes inside strings. Do NOT use \`\`\` fences inside the diagram strings.`,
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
Team Size: ${teamSize} member${teamSize > 1 ? "s" : ""}
Project Duration: ${duration}

Generate a comprehensive hackathon project package. Return ONLY a valid JSON object with these exact keys (include ONLY the ones listed):
    ${fieldInstructions}

Critical rules:
- Be highly specific to THIS project, not generic
- Use realistic, modern technologies for a hackathon MVP
- Code snippets must be complete and copy-paste ready
- PPT content must be compelling for judges
- Project scores must be realistic and varied
- Return ONLY raw JSON — no markdown code fences, no explanation text`;

  console.log(`[AI] generateProjectData: outputs=[${outputs.join(",")}]`);

  const completion = await withRetry(
    () =>
      client.chat.completions.create({
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 8192,
        response_format: { type: "json_object" },
      }),
    `generate[${outputs.join(",")}]`
  );

  const text = completion.choices[0]?.message?.content?.trim() ?? "";

  let parsed: Record<string, unknown>;
  try {
    parsed = extractJSON(text);
  } catch {
    console.error("[AI] Failed to parse JSON response:", text.slice(0, 200));
    throw new Error("AI returned invalid JSON. Please try again.");
  }

  const result: Record<string, unknown> = {};
  for (const key of outputs) {
    result[key] = parsed[key] ?? null;
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
      content: `You are an expert hackathon mentor for a project called "${title}". Description: "${description}". Give concise, practical, and actionable advice. Use bullet points and concrete examples when helpful.`,
    },
    ...history.map(
      (msg): OpenAI.Chat.ChatCompletionMessageParam => ({
        role: msg.role === "model" ? "assistant" : "user",
        content: msg.parts.map((p) => p.text).join("\n"),
      })
    ),
    { role: "user", content: question },
  ];

  console.log(`[AI] askMentor: question="${question.slice(0, 60)}..."`);

  const completion = await withRetry(
    () =>
      client.chat.completions.create({
        model: MODEL,
        messages,
        temperature: 0.7,
        max_tokens: 1024,
      }),
    "mentor"
  );

  return (
    completion.choices[0]?.message?.content?.trim() ??
    "I couldn't generate a response. Please try again."
  );
}
