export type Theme = "light" | "dark";

export type OutputKey =
  | "projectPlan"
  | "techStack"
  | "databaseSchema"
  | "uiDesign"
  | "codeSnippets"
  | "pptContent"
  | "readme"
  | "deploymentGuide";

export interface UserData {
  uid: string;
  name: string;
  email: string;
  theme: Theme;
  createdAt: string;
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

export interface GeneratedResults {
  projectPlan?: string;
  techStack?: string | Record<string, string>;
  databaseSchema?: string;
  uiDesign?: string;
  codeSnippets?: string | { title: string; language: string; code: string }[];
  readme?: string;
  deploymentGuide?: string;
  pptContent?: PPTSlide[];
}

export interface Project {
  id?: string;
  projectId?: string;
  userId: string;
  title: string;
  description: string;
  selectedOutputs: OutputKey[];
  generatedResults: GeneratedResults;
  createdAt: string;
  updatedAt?: string;
}

export const OUTPUT_OPTIONS: {
  id: OutputKey;
  label: string;
  description: string;
}[] = [
  { id: "projectPlan", label: "Project Plan", description: "Step-by-step development roadmap" },
  { id: "techStack", label: "Tech Stack", description: "Recommended technologies with rationale" },
  { id: "databaseSchema", label: "Database Schema", description: "ER diagrams and data models" },
  { id: "uiDesign", label: "UI Design", description: "UX suggestions, colors, and layouts" },
  { id: "codeSnippets", label: "Code Snippets", description: "Production-ready starter code" },
  { id: "pptContent", label: "PPT Slides", description: "Hackathon pitch presentation" },
  { id: "readme", label: "README", description: "Professional documentation" },
  { id: "deploymentGuide", label: "Deployment Guide", description: "Deploy on Render and more" },
];

export const TAB_LABELS: Record<OutputKey, string> = {
  projectPlan: "Project Plan",
  techStack: "Tech Stack",
  databaseSchema: "DB Schema",
  uiDesign: "UI Design",
  codeSnippets: "Code Snippets",
  pptContent: "PPT Slides",
  readme: "README",
  deploymentGuide: "Deployment",
};
