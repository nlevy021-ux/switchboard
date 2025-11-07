// lib/workflows.ts
import type { Tool, Workflow, TaskStep } from "./types";
import { buildDeepLink } from "./links";

// Tool pools for different task types
const TOOL_POOLS = {
  research: ["perplexity", "chatgpt"] as Tool[],
  writing: ["chatgpt", "tome"] as Tool[],
  creation: ["chatgpt", "dalle", "runway", "suno", "gamma", "framer_ai"] as Tool[],
  editing: ["chatgpt", "canva", "descript"] as Tool[],
  planning: ["chatgpt", "tome"] as Tool[],
};

/**
 * Calculate step count (2-5) based on prompt complexity
 */
function calculateStepCount(prompt: string): number {
  const length = prompt.length;
  const words = prompt.split(/\s+/).length;
  
  // Complexity indicators
  const complexityKeywords = [
    "research", "analyze", "comprehensive", "detailed", "thorough",
    "multiple", "several", "various", "complex", "advanced"
  ];
  const hasComplexityKeywords = complexityKeywords.some(keyword => 
    prompt.toLowerCase().includes(keyword)
  );
  
  // Count action verbs (indicates multiple steps needed)
  const actionVerbs = ["and", "then", "after", "before", "also", "plus"];
  const actionCount = actionVerbs.filter(verb => 
    prompt.toLowerCase().includes(verb)
  ).length;
  
  // Base calculation
  let stepCount = 2; // Minimum 2 steps
  
  // Increase based on length
  if (length > 100) stepCount += 1;
  if (length > 200) stepCount += 1;
  
  // Increase based on word count
  if (words > 20) stepCount += 1;
  
  // Increase based on complexity indicators
  if (hasComplexityKeywords) stepCount += 1;
  if (actionCount > 2) stepCount += 1;
  
  // Cap at 5
  return Math.min(Math.max(stepCount, 2), 5);
}

/**
 * Ensure no consecutive duplicate tools in steps
 */
function ensureToolDiversity(steps: TaskStep[]): TaskStep[] {
  if (steps.length <= 1) return steps;
  
  const result = [...steps];
  
  // Find alternative tool for a step based on its role
  const getAlternativeTool = (currentTool: Tool | undefined, stepIndex: number, allSteps: TaskStep[]): Tool | undefined => {
    if (!currentTool) return currentTool;
    
    // Determine task type based on step title/description
    const step = allSteps[stepIndex];
    const title = (step.title || "").toLowerCase();
    const desc = (step.description || "").toLowerCase();
    
    let pool: Tool[] = [];
    if (title.includes("research") || desc.includes("research")) {
      pool = TOOL_POOLS.research;
    } else if (title.includes("write") || title.includes("draft") || title.includes("script") || desc.includes("write")) {
      pool = TOOL_POOLS.writing;
    } else if (title.includes("edit") || title.includes("refine") || title.includes("polish") || desc.includes("edit")) {
      pool = TOOL_POOLS.editing;
    } else if (title.includes("plan") || title.includes("outline") || title.includes("organize") || desc.includes("plan")) {
      pool = TOOL_POOLS.planning;
    } else {
      pool = TOOL_POOLS.creation;
    }
    
    // Find alternative from pool
    const alternatives = pool.filter(t => t !== currentTool);
    if (alternatives.length > 0) {
      return alternatives[0];
    }
    
    // Fallback: use any tool that's not the current one
    const allTools: Tool[] = ["chatgpt", "perplexity", "dalle", "canva", "framer_ai", "runway", "suno", "gamma", "tome"];
    const fallback = allTools.find(t => t !== currentTool);
    return fallback || currentTool;
  };
  
  // Fix back-to-back duplicates
  for (let i = 1; i < result.length; i++) {
    const prevTool = result[i - 1].tool;
    const currentTool = result[i].tool;
    
    if (prevTool && currentTool && prevTool === currentTool) {
      // Try to swap with next step if available
      if (i + 1 < result.length && result[i + 1].tool && result[i + 1].tool !== currentTool) {
        const temp = result[i].tool;
        result[i].tool = result[i + 1].tool;
        result[i + 1].tool = temp;
      } else {
        // Get alternative tool
        result[i].tool = getAlternativeTool(currentTool, i, result);
      }
    }
  }
  
  return result;
}

/**
 * Build thorough workflow steps with dynamic count
 */
function buildThoroughSteps(
  projectTitle: string,
  stepTemplates: Array<{ title: string; description: string; tool: Tool; prompt: string }>,
  stepCount: number
): TaskStep[] {
  const templates = [...stepTemplates];
  let selectedTemplates: typeof stepTemplates = [];
  
  if (stepCount <= templates.length) {
    // Select templates: always include first and last, distribute middle ones
    selectedTemplates.push(templates[0]); // First step
    
    if (stepCount === 2) {
      // Just first and last
      selectedTemplates.push(templates[templates.length - 1]);
    } else if (stepCount > 2) {
      // Include middle steps, evenly distributed
      const middleCount = stepCount - 2; // Excluding first and last
      const middleTemplates = templates.slice(1, -1); // All middle templates
      
      if (middleTemplates.length > 0) {
        // Distribute middle templates
        for (let i = 0; i < middleCount; i++) {
          const idx = Math.floor((i * middleTemplates.length) / middleCount);
          selectedTemplates.push(middleTemplates[idx]);
        }
      }
      
      selectedTemplates.push(templates[templates.length - 1]); // Last step
    }
  } else {
    // Use all templates and add variations for extra steps
    selectedTemplates = [...templates];
    while (selectedTemplates.length < stepCount) {
      // Add intermediate steps by duplicating and modifying middle templates
      const middleIdx = Math.max(1, Math.floor(selectedTemplates.length / 2));
      const template = selectedTemplates[middleIdx];
      selectedTemplates.splice(middleIdx, 0, {
        ...template,
        title: `${template.title} (Continued)`,
        description: `Continue ${template.description.toLowerCase()}`,
      });
    }
  }
  
  // Build steps with proper ordering
  return selectedTemplates.slice(0, stepCount).map((template, idx) => ({
    id: String(idx + 1),
    title: template.title,
    description: template.description,
    tool: template.tool,
    prompt: template.prompt,
    order: idx + 1,
  }));
}

export function suggestWorkflows(projectTitle: string): Workflow[] {
  const title = projectTitle.toLowerCase();
  const workflows: Workflow[] = [];

  // Video-related workflows - improved detection
  // Matches: "video", "make a video", "create video", "video on X", "make video on X", etc.
  const isVideoProject = 
    title.includes("video") || 
    title.includes("film") || 
    title.includes("movie") || 
    (title.includes("make") && (title.includes("video") || title.includes("film") || title.includes("movie"))) ||
    (title.includes("create") && (title.includes("video") || title.includes("film") || title.includes("movie"))) ||
    (title.includes("make") && title.match(/\b(video|film|movie)\b/i));
  
  if (isVideoProject) {
    // Quick path: Best video platform
    workflows.push({
      id: "quick-video",
      name: "Quick Path",
      description: "Jump straight to the best video platform",
      estimatedTime: "5-10 min",
      steps: [
        {
          id: "1",
          title: "Create Video",
          description: "Generate your video using AI video tools",
          tool: "runway",
          prompt: projectTitle,
          order: 1,
        },
      ],
    });

    // Thorough path: Research → Script → Video
    const stepCount = calculateStepCount(projectTitle);
    const videoSteps = buildThoroughSteps(projectTitle, [
      {
        title: "Research",
        description: "Gather information and facts about your topic",
        tool: "perplexity",
        prompt: `Research information about: ${projectTitle}`,
      },
      {
        title: "Write Script",
        description: "Create a script or outline for your video",
        tool: "chatgpt",
        prompt: `Write a script for a video about: ${projectTitle}. Include engaging content, clear structure, and key points.`,
      },
      {
        title: "Create Video",
        description: "Generate your video using the script",
        tool: "runway",
        prompt: `Create a video about: ${projectTitle}`,
      },
    ], stepCount);
    
    workflows.push({
      id: "thorough-video",
      name: "Thorough Path",
      description: "Research first, then script, then create video",
      estimatedTime: "30-60 min",
      steps: ensureToolDiversity(videoSteps),
    });
  }

  // Image/Design workflows
  if (title.includes("image") || title.includes("design") || title.includes("graphic") || title.includes("logo")) {
    workflows.push({
      id: "quick-image",
      name: "Quick Path",
      description: "Generate image directly",
      estimatedTime: "2-5 min",
      steps: [
        {
          id: "1",
          title: "Generate Image",
          description: "Create your image using AI",
          tool: "dalle",
          prompt: projectTitle,
          order: 1,
        },
      ],
    });

    const imageStepCount = calculateStepCount(projectTitle);
    const imageSteps = buildThoroughSteps(projectTitle, [
      {
        title: "Research Styles",
        description: "Find inspiration and style references",
        tool: "perplexity",
        prompt: `Find design inspiration and styles for: ${projectTitle}`,
      },
      {
        title: "Generate Image",
        description: "Create your image with refined prompts",
        tool: "dalle",
        prompt: projectTitle,
      },
      {
        title: "Edit in Canva",
        description: "Polish and edit your design",
        tool: "canva",
        prompt: projectTitle,
      },
    ], imageStepCount);
    
    workflows.push({
      id: "thorough-image",
      name: "Thorough Path",
      description: "Research and refine before creating",
      estimatedTime: "15-30 min",
      steps: ensureToolDiversity(imageSteps),
    });
  }

  // Audio/Music workflows
  if (title.includes("audio") || title.includes("music") || title.includes("song") || title.includes("podcast")) {
    workflows.push({
      id: "quick-audio",
      name: "Quick Path",
      description: "Generate audio directly",
      estimatedTime: "3-5 min",
      steps: [
        {
          id: "1",
          title: "Generate Audio",
          description: "Create your audio content",
          tool: "suno",
          prompt: projectTitle,
          order: 1,
        },
      ],
    });

    const audioStepCount = calculateStepCount(projectTitle);
    const audioSteps = buildThoroughSteps(projectTitle, [
      {
        title: "Research",
        description: "Research your topic",
        tool: "perplexity",
        prompt: `Research information about: ${projectTitle}`,
      },
      {
        title: "Write Script",
        description: "Create script or lyrics",
        tool: "chatgpt",
        prompt: `Write a script or lyrics for: ${projectTitle}`,
      },
      {
        title: "Generate Audio",
        description: "Produce your audio content",
        tool: "suno",
        prompt: projectTitle,
      },
    ], audioStepCount);
    
    workflows.push({
      id: "thorough-audio",
      name: "Thorough Path",
      description: "Plan and produce polished audio",
      estimatedTime: "20-40 min",
      steps: ensureToolDiversity(audioSteps),
    });
  }

  // Presentation workflows
  if (title.includes("presentation") || title.includes("slide") || title.includes("deck")) {
    workflows.push({
      id: "quick-presentation",
      name: "Quick Path",
      description: "Generate presentation directly",
      estimatedTime: "5-10 min",
      steps: [
        {
          id: "1",
          title: "Create Presentation",
          description: "Generate your presentation",
          tool: "gamma",
          prompt: projectTitle,
          order: 1,
        },
      ],
    });

    const presentationStepCount = calculateStepCount(projectTitle);
    const presentationSteps = buildThoroughSteps(projectTitle, [
      {
        title: "Research",
        description: "Gather information for your presentation",
        tool: "perplexity",
        prompt: `Research information about: ${projectTitle}`,
      },
      {
        title: "Outline Content",
        description: "Structure your presentation content",
        tool: "chatgpt",
        prompt: `Create an outline for a presentation about: ${projectTitle}`,
      },
      {
        title: "Create Presentation",
        description: "Generate your polished presentation",
        tool: "gamma",
        prompt: projectTitle,
      },
    ], presentationStepCount);
    
    workflows.push({
      id: "thorough-presentation",
      name: "Thorough Path",
      description: "Research and structure before creating",
      estimatedTime: "30-45 min",
      steps: ensureToolDiversity(presentationSteps),
    });
  }

  // Web/App workflows
  if (title.includes("website") || title.includes("web") || title.includes("app") || title.includes("page")) {
    workflows.push({
      id: "quick-web",
      name: "Quick Path",
      description: "Generate website directly",
      estimatedTime: "5-10 min",
      steps: [
        {
          id: "1",
          title: "Create Website",
          description: "Generate your website",
          tool: "framer_ai",
          prompt: projectTitle,
          order: 1,
        },
      ],
    });

    const webStepCount = calculateStepCount(projectTitle);
    const webSteps = buildThoroughSteps(projectTitle, [
      {
        title: "Research & Plan",
        description: "Research similar websites and plan features",
        tool: "perplexity",
        prompt: `Research best practices and features for: ${projectTitle}`,
      },
      {
        title: "Design Mockup",
        description: "Create design concepts",
        tool: "canva",
        prompt: `Design mockup for: ${projectTitle}`,
      },
      {
        title: "Build Website",
        description: "Generate your website",
        tool: "framer_ai",
        prompt: projectTitle,
      },
    ], webStepCount);
    
    workflows.push({
      id: "thorough-web",
      name: "Thorough Path",
      description: "Plan and design before building",
      estimatedTime: "45-90 min",
      steps: ensureToolDiversity(webSteps),
    });
  }

  // Writing/Content workflows
  if (title.includes("write") || title.includes("article") || title.includes("blog") || title.includes("content")) {
    workflows.push({
      id: "quick-writing",
      name: "Quick Path",
      description: "Generate content directly",
      estimatedTime: "3-5 min",
      steps: [
        {
          id: "1",
          title: "Write Content",
          description: "Generate your content",
          tool: "chatgpt",
          prompt: projectTitle,
          order: 1,
        },
      ],
    });

    const writingStepCount = calculateStepCount(projectTitle);
    const writingSteps = buildThoroughSteps(projectTitle, [
      {
        title: "Research",
        description: "Gather information and facts",
        tool: "perplexity",
        prompt: `Research information about: ${projectTitle}`,
      },
      {
        title: "Draft Content",
        description: "Write your first draft",
        tool: "chatgpt",
        prompt: `Write content about: ${projectTitle}`,
      },
      {
        title: "Refine & Edit",
        description: "Improve and polish your content",
        tool: "tome",
        prompt: `Improve and refine this content: ${projectTitle}`,
      },
    ], writingStepCount);
    
    workflows.push({
      id: "thorough-writing",
      name: "Thorough Path",
      description: "Research and refine your content",
      estimatedTime: "20-30 min",
      steps: ensureToolDiversity(writingSteps),
    });
  }

  // Default workflow if nothing matches
  if (workflows.length === 0) {
    workflows.push({
      id: "quick-default",
      name: "Quick Path",
      description: "Get started immediately",
      estimatedTime: "5-10 min",
      steps: [
        {
          id: "1",
          title: "Start Task",
          description: "Begin working on your project",
          tool: "chatgpt",
          prompt: projectTitle,
          order: 1,
        },
      ],
    });

    const defaultStepCount = calculateStepCount(projectTitle);
    const defaultSteps = buildThoroughSteps(projectTitle, [
      {
        title: "Research",
        description: "Research your topic",
        tool: "perplexity",
        prompt: `Research information about: ${projectTitle}`,
      },
      {
        title: "Plan & Organize",
        description: "Create a plan for your project",
        tool: "chatgpt",
        prompt: `Create a detailed plan for: ${projectTitle}`,
      },
      {
        title: "Execute",
        description: "Work on your project",
        tool: "tome",
        prompt: projectTitle,
      },
    ], defaultStepCount);
    
    workflows.push({
      id: "thorough-default",
      name: "Thorough Path",
      description: "Plan and execute systematically",
      estimatedTime: "30-60 min",
      steps: ensureToolDiversity(defaultSteps),
    });
  }

  return workflows;
}

export function getWorkflowLink(step: { tool?: Tool; prompt?: string }): { url: string; label: string } | null {
  if (!step.tool || !step.prompt) return null;
  return buildDeepLink(step.tool, step.prompt);
}

