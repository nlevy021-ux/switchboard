// lib/router.ts
import type { Tool } from "./types";

export type RouteDecision = {
  tool: Tool;
  confidence: number;
  alternatives: Tool[];
};

const hasAny = (s: string, words: string[]) =>
  words.some((w) => s.toLowerCase().includes(w));

export function ruleRouter(text: string): RouteDecision {
  const t = text.toLowerCase();

  // ===== CODING & PROGRAMMING =====
  // GPT-5 leads in reasoning/agentic tasks, best for coding logic
  const codingKeywords = [
    "code", "coding", "programming", "program", "script", "function", "algorithm",
    "debug", "bug", "fix", "error", "syntax", "api", "framework", "library",
    "javascript", "python", "typescript", "react", "node", "html", "css",
    "database", "sql", "query", "backend", "frontend", "full-stack",
    "component", "module", "package", "npm", "git", "repository", "repo",
    "test", "testing", "unit test", "integration", "deploy", "build"
  ];
  if (hasAny(t, codingKeywords)) {
    // If it's specifically about building a full app/website, consider app builders
    if (hasAny(t, ["app", "website", "web app", "application", "prototype", "ui builder"])) {
      return { tool: "lovable", confidence: 0.85, alternatives: ["chatgpt", "framer_ai"] };
    }
    // Pure coding tasks → ChatGPT (GPT-5 equivalent, best for reasoning/agentic)
    return { tool: "chatgpt", confidence: 0.88, alternatives: ["perplexity", "lovable"] };
  }

  // ===== REASONING & AGENTIC TASKS =====
  // GPT-5 leads in reasoning and agentic tasks
  const reasoningKeywords = [
    "analyze", "analysis", "reasoning", "logic", "think", "solve", "problem",
    "strategy", "plan", "decide", "decision", "recommend", "suggest", "advice",
    "explain", "understand", "concept", "theory", "how does", "why", "what if",
    "complex", "sophisticated", "multi-step", "workflow", "process", "automate",
    "agent", "assistant", "task", "workflow"
  ];
  if (hasAny(t, reasoningKeywords)) {
    return { tool: "chatgpt", confidence: 0.86, alternatives: ["perplexity", "gamma"] };
  }

  // ===== RESEARCH & FACTUAL INFORMATION =====
  // Perplexity excels at web-aware research with citations
  const researchKeywords = [
    "research", "sources", "citations", "cite", "reference", "latest", "recent",
    "news", "article", "data", "statistics", "facts", "accurate", "verify",
    "compare", "comparison", "versus", "vs", "difference", "find", "search",
    "what is", "who is", "when did", "where is", "current", "up-to-date"
  ];
  if (hasAny(t, researchKeywords)) {
    return { tool: "perplexity", confidence: 0.87, alternatives: ["chatgpt", "gamma"] };
  }

  // ===== VISUAL CREATION =====
  const imageKeywords = [
    "image", "picture", "photo", "logo", "poster", "thumbnail", "art", "illustration",
    "graphic", "design", "visual", "drawing", "painting", "icon", "avatar",
    "banner", "header", "cover", "background", "wallpaper", "meme", "cartoon"
  ];
  if (hasAny(t, imageKeywords)) {
    // For detailed/parameterized image generation
    if (hasAny(t, ["detailed", "specific", "parameter", "style", "control", "precise"])) {
      return { tool: "sd_image", confidence: 0.82, alternatives: ["dalle", "canva"] };
    }
    // For logos, brand assets, or quick templates
    if (hasAny(t, ["logo", "brand", "template", "quick", "professional"])) {
      return { tool: "canva", confidence: 0.8, alternatives: ["dalle", "sd_image"] };
    }
    // Default image generation
    return { tool: "dalle", confidence: 0.81, alternatives: ["sd_image", "canva"] };
  }

  // ===== WEBSITES & UI =====
  const websiteKeywords = [
    "website", "landing page", "web page", "site", "portfolio", "homepage",
    "layout", "ui", "user interface", "design system", "component library"
  ];
  if (hasAny(t, websiteKeywords)) {
    return { tool: "framer_ai", confidence: 0.83, alternatives: ["canva", "lovable"] };
  }

  // ===== VIDEO & MOTION =====
  const videoKeywords = [
    "video", "b-roll", "shot list", "motion", "tiktok", "reel", "short",
    "clip", "footage", "animation", "animate", "moving", "dynamic"
  ];
  if (hasAny(t, videoKeywords)) {
    // Cinematic, music-driven visuals
    if (hasAny(t, ["cinematic", "music video", "lyric", "visualizer", "ambient", "atmospheric"])) {
      return { tool: "kaiber", confidence: 0.84, alternatives: ["runway", "pika"] };
    }
    // Fast stylized videos
    if (hasAny(t, ["fast", "quick", "stylized", "style", "artistic"])) {
      return { tool: "pika", confidence: 0.82, alternatives: ["runway", "kaiber"] };
    }
    // General video generation (text-to-video, video-to-video)
    return { tool: "runway", confidence: 0.85, alternatives: ["pika", "kaiber"] };
  }

  // ===== AUDIO, VOICE & MUSIC =====
  const voiceKeywords = [
    "voice", "narration", "voiceover", "tts", "text-to-speech", "speak",
    "say", "audio", "sound", "vocal", "narrate"
  ];
  if (hasAny(t, voiceKeywords)) {
    return { tool: "elevenlabs", confidence: 0.84, alternatives: ["descript", "chatgpt"] };
  }

  const transcriptionKeywords = [
    "transcribe", "transcription", "speech to text", "stt", "convert audio",
    "audio to text", "subtitles", "captions", "dictation"
  ];
  if (hasAny(t, transcriptionKeywords)) {
    return { tool: "whisper", confidence: 0.86, alternatives: ["descript", "chatgpt"] };
  }

  const musicKeywords = [
    "song", "music", "melody", "lyrics", "track", "beat", "instrumental",
    "composition", "musical", "audio track", "background music"
  ];
  if (hasAny(t, musicKeywords)) {
    // Lyrics-aware generation
    if (hasAny(t, ["lyrics", "song with lyrics", "vocal", "singing"])) {
      return { tool: "udio", confidence: 0.83, alternatives: ["suno", "chatgpt"] };
    }
    // General music generation
    return { tool: "suno", confidence: 0.85, alternatives: ["udio", "chatgpt"] };
  }

  // ===== PRESENTATIONS & NARRATIVES =====
  const presentationKeywords = [
    "slides", "deck", "presentation", "pitch", "pitch deck", "slideshow",
    "powerpoint", "ppt", "keynote"
  ];
  if (hasAny(t, presentationKeywords)) {
    return { tool: "gamma", confidence: 0.83, alternatives: ["tome", "canva"] };
  }

  const narrativeKeywords = [
    "script", "narrative", "story", "podcast", "storytelling", "content",
    "video script", "audio script", "text-based", "edit video", "edit audio"
  ];
  if (hasAny(t, narrativeKeywords)) {
    // If it involves editing video/audio
    if (hasAny(t, ["edit", "editing", "video edit", "audio edit"])) {
      return { tool: "descript", confidence: 0.82, alternatives: ["chatgpt", "gamma"] };
    }
    // General narrative/story creation
    if (hasAny(t, ["story", "narrative", "tome", "presentation story"])) {
      return { tool: "tome", confidence: 0.79, alternatives: ["gamma", "chatgpt"] };
    }
    return { tool: "descript", confidence: 0.78, alternatives: ["chatgpt", "gamma"] };
  }

  // ===== WRITING & GENERAL TASKS =====
  const writingKeywords = [
    "write", "writing", "essay", "article", "blog", "content", "copy",
    "draft", "compose", "generate text", "create text"
  ];
  if (hasAny(t, writingKeywords)) {
    // If it needs citations/research
    if (hasAny(t, ["research", "sources", "cite", "facts", "accurate"])) {
      return { tool: "perplexity", confidence: 0.84, alternatives: ["chatgpt", "gamma"] };
    }
    // General writing
    return { tool: "chatgpt", confidence: 0.8, alternatives: ["perplexity", "gamma"] };
  }

  // ===== DEFAULT: ChatGPT (GPT-5 equivalent - best for general reasoning) =====
  return { tool: "chatgpt", confidence: 0.75, alternatives: ["perplexity", "gamma"] };
}
