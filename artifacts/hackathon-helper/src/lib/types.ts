export type Theme = "light" | "dark";

export type OutputKey =
  | "projectPlan"
  | "techStack"
  | "databaseSchema"
  | "uiDesign"
  | "codeSnippets"
  | "pptContent"
  | "readme"
  | "deploymentGuide"
  | "projectScores"
  | "pitches"
  | "teamTasks"
  | "timeline"
  | "validator";

export const CORE_OUTPUTS: OutputKey[] = [
  "projectScores",
  "projectPlan",
  "techStack",
  "timeline",
];

export const ALL_OUTPUTS: OutputKey[] = [
  "projectScores",
  "projectPlan",
  "techStack",
  "timeline",
  "databaseSchema",
  "uiDesign",
  "codeSnippets",
  "readme",
  "deploymentGuide",
  "pptContent",
  "pitches",
  "teamTasks",
  "validator",
];

export interface UserData {
  uid: string;
  name: string;
  email: string;
  theme: Theme;
  photoURL?: string;
  createdAt: string;
  badges?: string[];
}

export interface PPTSlide {
  title: string;
  content: string | string[];
  type?:
    | "title"
    | "problem"
    | "solution"
    | "features"
    | "architecture"
    | "techStack"
    | "workflow"
    | "screenshots"
    | "future"
    | "thankyou";
}

export interface ProjectScores {
  innovation: number;
  feasibility: number;
  scalability: number;
  uiux: number;
  winningProbability: number;
  marketPotential?: number;
  complexity?: number;
}

export interface Pitches {
  thirtySeconds: string;
  oneMinute: string;
  threeMinutes: string;
}

export interface TeamTask {
  role: string;
  tasks: string[];
}

export interface TimelineMilestone {
  time: string;
  task: string;
}

export interface ValidatorResult {
  strengths: string[];
  weaknesses: string[];
  risks: string[];
  suggestions: string[];
  score?: number;
  verdict?: string;
}

export interface GeneratedResults {
  projectPlan?: string;
  // @ts-ignore
  techStack?: any;
  databaseSchema?: string;
  uiDesign?: string;
  // @ts-ignore
  codeSnippets?: any;
  readme?: string;
  deploymentGuide?: string;
  pptContent?: PPTSlide[];
  projectScores?: ProjectScores;
  pitches?: Pitches;
  teamTasks?: TeamTask[];
  timeline?: TimelineMilestone[];
  validator?: ValidatorResult;
}

export interface Project {
  id?: string;
  projectId?: string;
  userId: string;
  title: string;
  description: string;
  selectedOutputs: OutputKey[];
  generatedResults: GeneratedResults;
  teamSize?: number;
  duration?: "8h" | "24h" | "3d" | "1w";
  createdAt: string;
  updatedAt?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first_project", name: "First Project", description: "Generated your first AI project plan", icon: "🚀" },
  { id: "five_projects", name: "Innovator", description: "Generated 5 projects", icon: "💡" },
  { id: "ten_projects", name: "Visionary", description: "Generated 10 projects", icon: "🌟" },
  { id: "readme_master", name: "README Master", description: "Generated professional documentation", icon: "📚" },
  { id: "ppt_creator", name: "Pitch Perfect", description: "Created a winning presentation", icon: "🎤" },
];

export const TAB_LABELS: Record<OutputKey, string> = {
  projectPlan: "Plan",
  techStack: "Tech Stack",
  databaseSchema: "Database",
  uiDesign: "UI/UX",
  codeSnippets: "Code",
  pptContent: "Slides",
  readme: "README",
  deploymentGuide: "Deploy",
  projectScores: "Score",
  pitches: "Pitches",
  teamTasks: "Tasks",
  timeline: "Timeline",
  validator: "Validator",
};

export const TAB_DESCRIPTIONS: Record<OutputKey, string> = {
  projectPlan: "Step-by-step roadmap with phases and milestones",
  techStack: "Recommended technologies with justifications",
  databaseSchema: "Database structure and relationships",
  uiDesign: "Color palette, typography, and UI wireframes",
  codeSnippets: "Ready-to-use code for core features",
  pptContent: "10-slide presentation for judges",
  readme: "Professional README for GitHub",
  deploymentGuide: "Step-by-step deployment instructions",
  projectScores: "AI scoring on key dimensions",
  pitches: "30s, 1min, and 3min elevator pitches",
  teamTasks: "Task distribution based on team size",
  timeline: "Hour-by-hour timeline based on duration",
  validator: "SWOT-style project validation",
};
