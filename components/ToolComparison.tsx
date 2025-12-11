// components/ToolComparison.tsx
"use client";

import { useState } from "react";
import type { Tool } from "@/lib/types";
import Modal from "./Modal";

type ToolInfo = {
  name: string;
  description: string;
  bestFor: string[];
  icon: string;
};

const toolInfoMap: Record<Tool, ToolInfo> = {
  chatgpt: {
    name: "ChatGPT",
    description: "Advanced conversational AI for complex reasoning, coding, and creative tasks",
    bestFor: ["Complex questions", "Code generation", "Creative writing", "Problem solving"],
    icon: "💬",
  },
  perplexity: {
    name: "Perplexity",
    description: "AI-powered search engine with real-time web access and citations",
    bestFor: ["Research", "Current events", "Fact-checking", "Web search"],
    icon: "🔍",
  },
  dalle: {
    name: "DALL·E",
    description: "AI image generation from text descriptions",
    bestFor: ["Image creation", "Art generation", "Visual concepts", "Design mockups"],
    icon: "🎨",
  },
  runway: {
    name: "Runway",
    description: "AI video generation and editing tools",
    bestFor: ["Video creation", "Video editing", "Motion graphics", "Visual effects"],
    icon: "🎬",
  },
  gamma: {
    name: "Gamma",
    description: "AI-powered presentation and document creation",
    bestFor: ["Presentations", "Documents", "Reports", "Pitches"],
    icon: "📊",
  },
  tome: {
    name: "Tome",
    description: "AI storytelling and presentation platform",
    bestFor: ["Storytelling", "Narratives", "Interactive presentations"],
    icon: "📖",
  },
  suno: {
    name: "Suno",
    description: "AI music generation from text prompts",
    bestFor: ["Music creation", "Songwriting", "Audio generation"],
    icon: "🎵",
  },
  canva: {
    name: "Canva",
    description: "Design platform with AI-powered tools",
    bestFor: ["Graphic design", "Social media", "Marketing materials"],
    icon: "✏️",
  },
  framer_ai: {
    name: "Framer AI",
    description: "AI-powered website and prototype builder",
    bestFor: ["Web design", "Prototyping", "UI/UX design"],
    icon: "🌐",
  },
  elevenlabs: {
    name: "ElevenLabs",
    description: "AI voice synthesis and text-to-speech",
    bestFor: ["Voiceovers", "Narration", "Audio content"],
    icon: "🎤",
  },
  descript: {
    name: "Descript",
    description: "AI-powered video and audio editing",
    bestFor: ["Video editing", "Podcast editing", "Transcription"],
    icon: "✂️",
  },
  sd_image: {
    name: "Stable Diffusion",
    description: "Open-source image generation model",
    bestFor: ["Image generation", "Art creation", "Concept art"],
    icon: "🖼️",
  },
  pika: {
    name: "Pika Labs",
    description: "AI video generation platform",
    bestFor: ["Video creation", "Animation", "Motion graphics"],
    icon: "🎥",
  },
  kaiber: {
    name: "Kaiber",
    description: "AI-powered video creation and animation",
    bestFor: ["Video creation", "Music videos", "Animations"],
    icon: "🎭",
  },
  lovable: {
    name: "Lovable",
    description: "AI-powered web app builder",
    bestFor: ["Web apps", "Prototyping", "Rapid development"],
    icon: "💻",
  },
  whisper: {
    name: "Whisper",
    description: "AI speech recognition and transcription",
    bestFor: ["Transcription", "Subtitles", "Voice notes"],
    icon: "📝",
  },
  udio: {
    name: "Udio",
    description: "AI music generation and audio creation",
    bestFor: ["Music creation", "Audio generation", "Soundtracks"],
    icon: "🎼",
  },
};

type ToolComparisonProps = {
  tools: Tool[];
  onClose: () => void;
};

export default function ToolComparison({ tools, onClose }: ToolComparisonProps) {
  const [hoveredTool, setHoveredTool] = useState<Tool | null>(null);

  return (
    <Modal isOpen={true} onClose={onClose} title="Compare AI Tools" size="lg">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool) => {
          const info = toolInfoMap[tool] || {
            name: tool,
            description: "AI tool for various tasks",
            bestFor: [],
            icon: "🤖",
          };
          const isHovered = hoveredTool === tool;

          return (
            <div
              key={tool}
              className={`border-2 rounded-xl p-5 transition-all duration-300 cursor-pointer ${
                isHovered
                  ? "border-blue-500 dark:border-blue-400 shadow-lg scale-105 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600"
              } bg-white dark:bg-gray-800 card-hover`}
              onMouseEnter={() => setHoveredTool(tool)}
              onMouseLeave={() => setHoveredTool(null)}
            >
              <div className="flex items-start gap-3 mb-3">
                <span className="text-3xl">{info.icon}</span>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-1">
                    {info.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{info.description}</p>
                </div>
              </div>
              {info.bestFor.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                    Best For:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {info.bestFor.map((use, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full"
                      >
                        {use}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Modal>
  );
}

