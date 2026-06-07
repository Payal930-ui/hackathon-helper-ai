import { Router, type IRouter } from "express";
import { z } from "zod";
import { generateProjectData, askMentor } from "../lib/ai";

const router: IRouter = Router();

const VALID_OUTPUTS = [
  "projectPlan", "techStack", "databaseSchema", "uiDesign", "codeSnippets",
  "readme", "deploymentGuide", "pptContent", "projectScores", "pitches",
  "teamTasks", "timeline", "validator",
] as const;

const GenerateInput = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  outputs: z.array(z.enum(VALID_OUTPUTS)).min(1).max(13),
  teamSize: z.number().int().min(1).max(10).optional().default(1),
  duration: z.enum(["8h", "24h", "3d", "1w"]).optional().default("24h"),
});

const MentorInput = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  question: z.string().min(1).max(2000),
  history: z.array(z.object({
    role: z.enum(["user", "model"]),
    parts: z.array(z.object({ text: z.string() })),
  })).optional().default([]),
});

router.post("/generate", async (req, res) => {
  const parsed = GenerateInput.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
    return;
  }

  const { title, description, outputs, teamSize, duration } = parsed.data;

  try {
    const results = await generateProjectData(title, description, outputs, teamSize, duration);
    res.json({ results });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed";
    res.status(500).json({ error: message });
  }
});

router.post("/mentor", async (req, res) => {
  const parsed = MentorInput.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
    return;
  }

  const { title, description, question, history } = parsed.data;

  try {
    const answer = await askMentor(title, description, question, history);
    res.json({ answer });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Mentor call failed";
    res.status(500).json({ error: message });
  }
});

export default router;
