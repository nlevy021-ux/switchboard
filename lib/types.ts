// lib/types.ts
export type Tool =
  | "chatgpt"
  | "perplexity"
  | "dalle"
  | "sd_image"
  | "canva"
  | "framer_ai"
  | "lovable"
  | "runway"
  | "pika"
  | "kaiber"
  | "elevenlabs"
  | "whisper"
  | "suno"
  | "udio"
  | "descript"
  | "gamma"
  | "tome";

export type StepType = "prompt" | "decision" | "output" | "link" | "note";

export type Step = {
  id: string;
  projectId: string;
  type: StepType;
  createdAt: number;
  payload: Record<string, unknown>;
};

export type Project = {
  id: string;
  title: string;
  createdAt: number;
  stepIds: string[];
  plannedSteps?: TaskStep[];
  notes?: string;
};

export type TaskStep = {
  id: string;
  title: string;
  description: string;
  tool?: Tool;
  prompt?: string;
  order: number;
};

export type Workflow = {
  id: string;
  name: string;
  description: string;
  steps: TaskStep[];
  estimatedTime?: string;
};