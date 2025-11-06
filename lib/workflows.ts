// lib/workflows.ts
import type { Tool, Workflow } from "./types";
import { buildDeepLink } from "./links";

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
    workflows.push({
      id: "thorough-video",
      name: "Thorough Path",
      description: "Research first, then script, then create video",
      estimatedTime: "30-60 min",
      steps: [
        {
          id: "1",
          title: "Research",
          description: "Gather information and facts about your topic",
          tool: "perplexity",
          prompt: `Research information about: ${projectTitle}`,
          order: 1,
        },
        {
          id: "2",
          title: "Write Script",
          description: "Create a script or outline for your video",
          tool: "chatgpt",
          prompt: `Write a script for a video about: ${projectTitle}. Include engaging content, clear structure, and key points.`,
          order: 2,
        },
        {
          id: "3",
          title: "Create Video",
          description: "Generate your video using the script",
          tool: "runway",
          prompt: `Create a video about: ${projectTitle}`,
          order: 3,
        },
      ],
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

    workflows.push({
      id: "thorough-image",
      name: "Thorough Path",
      description: "Research and refine before creating",
      estimatedTime: "15-30 min",
      steps: [
        {
          id: "1",
          title: "Research Styles",
          description: "Find inspiration and style references",
          tool: "perplexity",
          prompt: `Find design inspiration and styles for: ${projectTitle}`,
          order: 1,
        },
        {
          id: "2",
          title: "Generate Image",
          description: "Create your image with refined prompts",
          tool: "dalle",
          prompt: projectTitle,
          order: 2,
        },
        {
          id: "3",
          title: "Edit in Canva",
          description: "Polish and edit your design",
          tool: "canva",
          prompt: projectTitle,
          order: 3,
        },
      ],
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

    workflows.push({
      id: "thorough-audio",
      name: "Thorough Path",
      description: "Plan and produce polished audio",
      estimatedTime: "20-40 min",
      steps: [
        {
          id: "1",
          title: "Research",
          description: "Research your topic",
          tool: "perplexity",
          prompt: `Research information about: ${projectTitle}`,
          order: 1,
        },
        {
          id: "2",
          title: "Write Script",
          description: "Create script or lyrics",
          tool: "chatgpt",
          prompt: `Write a script or lyrics for: ${projectTitle}`,
          order: 2,
        },
        {
          id: "3",
          title: "Generate Audio",
          description: "Produce your audio content",
          tool: "suno",
          prompt: projectTitle,
          order: 3,
        },
      ],
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

    workflows.push({
      id: "thorough-presentation",
      name: "Thorough Path",
      description: "Research and structure before creating",
      estimatedTime: "30-45 min",
      steps: [
        {
          id: "1",
          title: "Research",
          description: "Gather information for your presentation",
          tool: "perplexity",
          prompt: `Research information about: ${projectTitle}`,
          order: 1,
        },
        {
          id: "2",
          title: "Outline Content",
          description: "Structure your presentation content",
          tool: "chatgpt",
          prompt: `Create an outline for a presentation about: ${projectTitle}`,
          order: 2,
        },
        {
          id: "3",
          title: "Create Presentation",
          description: "Generate your polished presentation",
          tool: "gamma",
          prompt: projectTitle,
          order: 3,
        },
      ],
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

    workflows.push({
      id: "thorough-web",
      name: "Thorough Path",
      description: "Plan and design before building",
      estimatedTime: "45-90 min",
      steps: [
        {
          id: "1",
          title: "Research & Plan",
          description: "Research similar websites and plan features",
          tool: "perplexity",
          prompt: `Research best practices and features for: ${projectTitle}`,
          order: 1,
        },
        {
          id: "2",
          title: "Design Mockup",
          description: "Create design concepts",
          tool: "canva",
          prompt: `Design mockup for: ${projectTitle}`,
          order: 2,
        },
        {
          id: "3",
          title: "Build Website",
          description: "Generate your website",
          tool: "framer_ai",
          prompt: projectTitle,
          order: 3,
        },
      ],
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

    workflows.push({
      id: "thorough-writing",
      name: "Thorough Path",
      description: "Research and refine your content",
      estimatedTime: "20-30 min",
      steps: [
        {
          id: "1",
          title: "Research",
          description: "Gather information and facts",
          tool: "perplexity",
          prompt: `Research information about: ${projectTitle}`,
          order: 1,
        },
        {
          id: "2",
          title: "Draft Content",
          description: "Write your first draft",
          tool: "chatgpt",
          prompt: `Write content about: ${projectTitle}`,
          order: 2,
        },
        {
          id: "3",
          title: "Refine & Edit",
          description: "Improve and polish your content",
          tool: "chatgpt",
          prompt: `Improve and refine this content: ${projectTitle}`,
          order: 3,
        },
      ],
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

    workflows.push({
      id: "thorough-default",
      name: "Thorough Path",
      description: "Plan and execute systematically",
      estimatedTime: "30-60 min",
      steps: [
        {
          id: "1",
          title: "Research",
          description: "Research your topic",
          tool: "perplexity",
          prompt: `Research information about: ${projectTitle}`,
          order: 1,
        },
        {
          id: "2",
          title: "Plan & Organize",
          description: "Create a plan for your project",
          tool: "chatgpt",
          prompt: `Create a detailed plan for: ${projectTitle}`,
          order: 2,
        },
        {
          id: "3",
          title: "Execute",
          description: "Work on your project",
          tool: "chatgpt",
          prompt: projectTitle,
          order: 3,
        },
      ],
    });
  }

  return workflows;
}

export function getWorkflowLink(step: { tool?: Tool; prompt?: string }): { url: string; label: string } | null {
  if (!step.tool || !step.prompt) return null;
  return buildDeepLink(step.tool, step.prompt);
}

