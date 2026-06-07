import type { GeneratedResults, OutputKey } from "./types";

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`/api${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((data as { error?: string }).error || `API error ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export async function generateProjectData(
  title: string,
  description: string,
  outputs: OutputKey[],
  teamSize: number = 1,
  duration: string = "24h"
): Promise<GeneratedResults> {
  const data = await post<{ results: GeneratedResults }>("/generate", {
    title,
    description,
    outputs,
    teamSize,
    duration,
  });
  return data.results;
}

export async function askMentor(
  title: string,
  description: string,
  question: string,
  history: { role: "user" | "model"; parts: { text: string }[] }[] = []
): Promise<string> {
  const data = await post<{ answer: string }>("/mentor", {
    title,
    description,
    question,
    history,
  });
  return data.answer;
}
