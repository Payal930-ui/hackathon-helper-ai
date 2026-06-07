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
}

export interface GeneratedResults {
  projectPlan?: string;
  techStack?: any;
  databaseSchema?: string;
  uiDesign?: string;
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
  techStack: "Tech",
  databaseSchema: "Schema",
  uiDesign: "UI/UX",
  codeSnippets: "Code",
  pptContent: "PPT",
  readme: "README",
  deploymentGuide: "Deploy",
  projectScores: "Score",
  pitches: "Pitches",
  teamTasks: "Tasks",
  timeline: "Timeline",
  validator: "Validator",
};
