// app/page.tsx
"use client";

import { useCallback, useState, useMemo } from "react";
import Link from "next/link";
import { useSB } from "@/lib/store";
import type { Tool } from "@/lib/types";
import WorkflowSuggestions from "@/components/WorkflowSuggestions";
import { suggestWorkflows } from "@/lib/workflows";
import {
  trackToolRouting,
  trackProjectCreation,
  trackStepSaved,
  trackRunAndSave,
  trackDeepLinkClick,
  trackWorkflowStepAdded,
} from "@/lib/analytics";
import { CardSkeleton } from "@/components/LoadingSkeleton";
import { Spinner } from "@/components/Spinner";
import ToolComparison from "@/components/ToolComparison";
import InteractiveTooltip from "@/components/InteractiveTooltip";

// 1) Title generator - improved to create better project names
function generateProjectTitle(text: string) {
  const cleaned = text.trim().replace(/\s+/g, " ");
  if (!cleaned) return "Untitled Project";
  
  // Remove common prefixes that don't add value to the title
  let processed = cleaned
    .replace(/^(i want to|i want|i need to|i need|make|create|build|generate|design|write|find)\s+/i, "")
    .trim();
  
  if (!processed) processed = cleaned;
  
  // Take first 8 words for better context
  const words = processed.split(" ").slice(0, 8);
  
  // Capitalize properly (first letter of each word, lowercase the rest)
  const title = words
    .map((w) => {
      // Handle special cases
      if (w.length === 0) return "";
      // Keep common words lowercase if not first word
      const lowerWords = ["a", "an", "the", "of", "on", "in", "at", "for", "to", "and", "or", "but"];
      const isFirstWord = words.indexOf(w) === 0;
      if (!isFirstWord && lowerWords.includes(w.toLowerCase())) {
        return w.toLowerCase();
      }
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    })
    .filter(Boolean)
    .join(" ");
  
  return title || "Untitled Project";
}

type RouteResponse = {
  result: "toolcard";
  tool: Tool;
  confidence: number;
  alternatives: Tool[];
  passport: Record<string, unknown>;
  openUrl?: string;
  openLabel?: string;
};

// Import the buildDeepLink from lib/links instead of duplicating
import { buildDeepLink as buildDeepLinkFromLib } from "@/lib/links";

// Use the imported function for consistency
const buildDeepLink = buildDeepLinkFromLib;


export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [card, setCard] = useState<RouteResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // “Run & Save” UI state
  const [running, setRunning] = useState(false);
  const [runErr, setRunErr] = useState<string | null>(null);

  // save-feedback banner
  const [justSaved, setJustSaved] = useState<null | { projectId: string; title: string }>(null);

  // Modal state
  const [showToolComparison, setShowToolComparison] = useState(false);

  // Weather/time data for contextual suggestions
  const [timeSuggestion] = useState<string | null>(null);

  // store
  const {
    projects,
    activeProjectId,
    setActiveProject,
    createProject,
    addStep,
    renameProject, // must exist in your store
  } = useSB();

  const createAndSelect = () => {
    const title = window.prompt("New project name?", "Untitled Project") ?? "Untitled Project";
    const id = createProject(title);
    setActiveProject(id);
    trackProjectCreation(id, title);
  };

  // Create or get project - if no project selected, create new one from prompt
  const ensureProject = useCallback(() => {
    const smartTitle = generateProjectTitle(prompt);

    // If no project is selected, always create a new one
    if (!activeProjectId) {
      const id = createProject(smartTitle);
      setActiveProject(id);
      return id;
    }

    // If project is selected, use it
    const id = activeProjectId as string;
    const p = projects[id];
    if (
      p &&
      p.stepIds.length === 0 &&
      (p.title === "My First Project" || p.title === "Untitled Project")
    ) {
      // If it's an empty default project, rename it with the smart title
      if (typeof renameProject === "function") {
        renameProject(id, smartTitle);
      }
    }
    return id;
  }, [activeProjectId, projects, prompt, createProject, setActiveProject, renameProject]);

  const onRoute = useCallback(async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setErr(null);
    setRunErr(null);
    setCard(null);

    // Automatically create a new project if none is selected
    // This happens before the search so the project is ready
    if (!activeProjectId) {
      const smartTitle = generateProjectTitle(prompt);
      const newProjectId = createProject(smartTitle);
      setActiveProject(newProjectId);
      trackProjectCreation(newProjectId, smartTitle);
    }

    try {
      const res = await fetch("/api/route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as RouteResponse;

      if (!data.openUrl || !data.openLabel) {
        const l = buildDeepLink(data.tool, prompt);
        data.openUrl = l.url;
        data.openLabel = l.label;
      }
      setCard(data);
      
      // Track tool routing event
      trackToolRouting(data.tool, data.confidence, prompt);
    } catch (e: unknown) {
      const error = e instanceof Error ? e : new Error("Something went wrong");
      setErr(error.message);
    } finally {
      setLoading(false);
    }
  }, [prompt, activeProjectId, createProject, setActiveProject]);

  const onSave = () => {
    if (!card) return;
    const pid = ensureProject();
    addStep(pid, {
      projectId: pid,
      type: "decision",
      payload: {
        prompt,
        tool: card.tool,
        confidence: card.confidence,
        openUrl: card.openUrl,
        openLabel: card.openLabel,
        passport: card.passport,
      },
    });

    const title = projects[pid]?.title ?? "Project";
    setJustSaved({ projectId: pid, title });
    setTimeout(() => setJustSaved(null), 3000);
    
    // Track step save event
    trackStepSaved(pid, "decision", card.tool);
  };

  const handleAddWorkflowStep = (tool: Tool, promptText: string, workflowId?: string) => {
    const pid = ensureProject();
    const link = buildDeepLink(tool, promptText);
    addStep(pid, {
      projectId: pid,
      type: "decision",
      payload: {
        prompt: promptText,
        tool: tool,
        openUrl: link.url,
        openLabel: link.label,
      },
    });

    const title = projects[pid]?.title ?? "Project";
    setJustSaved({ projectId: pid, title });
    setTimeout(() => setJustSaved(null), 3000);
    
    // Track workflow step addition
    if (workflowId) {
      trackWorkflowStepAdded(tool, workflowId);
    }
    trackStepSaved(pid, "decision", tool);
  };

  // Show workflow suggestions only after routing (when card exists)
  // Only show the thorough path (longer workflow), not the quick path
  const workflows = useMemo(() => {
    if (!card || !prompt.trim()) return [];
    const allWorkflows = suggestWorkflows(prompt);
    // Filter to only show "thorough" paths (longer workflows)
    return allWorkflows.filter((w) => 
      w.id.includes("thorough") || 
      (w.steps.length > 1 && !w.id.includes("quick"))
    );
  }, [card, prompt]);

  // Call /api/run and save OUTPUT
  const onRunAndSave = async () => {
    if (!prompt.trim()) return;
    setRunning(true);
    setRunErr(null);

    // Automatically create a new project if none is selected
    if (!activeProjectId) {
      const smartTitle = generateProjectTitle(prompt);
      const newProjectId = createProject(smartTitle);
      setActiveProject(newProjectId);
      trackProjectCreation(newProjectId, smartTitle);
    }

    try {
      const res = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Run failed (HTTP ${res.status}) ${text}`);
      }

      const data = (await res.json()) as { output: string; model?: string };

      const pid = ensureProject();
      addStep(pid, {
        projectId: pid,
        type: "output",
        payload: {
          prompt,
          tool: "chatgpt",
          model: data.model ?? "openai/gpt-4o-mini",
          output: data.output,
        },
      });

      const title = projects[pid]?.title ?? "Project";
      setJustSaved({ projectId: pid, title });
      setTimeout(() => setJustSaved(null), 3000);
      
      // Track run & save event
      trackRunAndSave(pid, prompt.length);
      trackStepSaved(pid, "output", "chatgpt");
    } catch (e: unknown) {
      const error = e instanceof Error ? e : new Error("Run failed");
      setRunErr(error.message);
    } finally {
      setRunning(false);
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="mb-8 animate-in fade-in">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 text-white">
          Welcome to Switchboard
        </h1>
        <p className="text-blue-100 text-sm sm:text-base md:text-lg mb-2">
          Find the perfect AI tool for your task
        </p>
        {timeSuggestion && (
          <InteractiveTooltip
            content={
              <div>
                <div className="font-semibold mb-1">Time-Based Suggestion</div>
                <div className="text-xs text-gray-300">
                  We&apos;ve personalized this suggestion based on the time of day
                </div>
              </div>
            }
          >
            <p className="text-blue-200 text-xs sm:text-sm italic animate-in fade-in stagger-1">
              💡 {timeSuggestion}
            </p>
          </InteractiveTooltip>
        )}
      </div>

      <div className="mb-6 p-4 sm:p-5 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <span className="text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
            Active Project:
          </span>
          <div className="flex items-center gap-3 flex-1">
        <select
              className="flex-1 min-w-0 border-2 border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm sm:text-base bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 hover:border-blue-400 dark:hover:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          value={activeProjectId ?? ""}
          onChange={(e) => setActiveProject(e.target.value || null)}
        >
          <option value="">New Project</option>
          {Object.values(projects).map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
            <button 
              className="border-2 border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm sm:text-base bg-white dark:bg-gray-900 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-400 dark:hover:border-blue-500 font-medium transition-all whitespace-nowrap" 
              onClick={createAndSelect}
            >
          New
        </button>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow backdrop-blur-sm bg-white/95 dark:bg-gray-800/95">
        <div className="flex flex-col sm:flex-row gap-3">
        <input
            className="flex-1 border-2 border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 sm:py-4 text-base sm:text-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !loading && onRoute()}
          placeholder="Describe what you need…"
          disabled={loading}
          aria-label="Describe what you need"
          aria-describedby="prompt-description"
        />
          <button 
            className="border-2 border-blue-600 dark:border-blue-500 rounded-lg px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 dark:bg-blue-500 text-white font-semibold text-base sm:text-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-blue-600 shadow-md hover:shadow-lg transition-all whitespace-nowrap flex items-center justify-center gap-2" 
            onClick={onRoute} 
            disabled={loading || !prompt.trim()}
            aria-label="Route to AI tool"
          >
          {loading ? (
            <>
              <Spinner size="sm" />
              <span>Routing…</span>
            </>
          ) : (
            "Route"
          )}
        </button>
        </div>
      </div>

      {loading && <CardSkeleton />}

      {err && (
        <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400">
          {err}
        </div>
      )}
      {runErr && (
        <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400">
          {runErr}
        </div>
      )}

      {justSaved && (
        <div
          role="status"
          className="mt-4 flex items-center justify-between rounded-lg border border-green-500/60 bg-green-50 dark:bg-green-900/30 px-4 py-3 text-green-700 dark:text-green-300 shadow-md"
        >
          <span className="font-medium">
            ✓ Saved to <b>{justSaved.title}</b>
          </span>
          <div className="flex items-center gap-3">
            <Link 
              href={`/projects/${justSaved.projectId}`} 
              className="text-sm font-medium underline hover:text-green-800 dark:hover:text-green-200"
            >
              View project
            </Link>
            <button 
              className="text-sm hover:bg-green-200 dark:hover:bg-green-800 rounded-full w-6 h-6 flex items-center justify-center font-bold" 
              onClick={() => setJustSaved(null)} 
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {card && (
        <div className="mt-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 sm:p-8 bg-white dark:bg-gray-800 shadow-lg backdrop-blur-sm bg-white/95 dark:bg-gray-800/95 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between mb-4">
            <div>
              <InteractiveTooltip
                content={
                  <div>
                    <div className="font-semibold mb-1">Tool Suggestion</div>
                    <div className="text-xs text-gray-300">
                      Based on your prompt, we recommend using {card.tool.toUpperCase()}
                    </div>
                    <div className="text-xs text-gray-300 mt-1">
                      Confidence: {Math.round(card.confidence * 100)}%
                    </div>
                  </div>
                }
              >
                <div>
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">
                    Tool Suggestion
                  </div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {card.tool.toUpperCase()}
                  </div>
                </div>
              </InteractiveTooltip>
            </div>
            <InteractiveTooltip
              content={
                <div>
                  <div className="font-semibold mb-1">Confidence Score</div>
                  <div className="text-xs text-gray-300">
                    This indicates how well {card.tool.toUpperCase()} matches your request
                  </div>
                </div>
              }
            >
              <div className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-full cursor-help">
                <div className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                  {Math.round(card.confidence * 100)}% confidence
                </div>
              </div>
            </InteractiveTooltip>
          </div>

          {card.openUrl && card.openLabel && (
            <a
              href={card.openUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackDeepLinkClick(card.tool, card.openUrl!)}
              className="inline-block mt-4 border-2 border-blue-600 dark:border-blue-500 rounded-lg px-4 py-2.5 bg-blue-600 dark:bg-blue-500 text-white font-medium hover:bg-blue-700 dark:hover:bg-blue-600 hover:shadow-md transition-all"
            >
              {card.openLabel} →
            </a>
          )}

          {card.alternatives?.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Try an alternative:
                </div>
                <button
                  onClick={() => setShowToolComparison(true)}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium underline"
                >
                  Compare all tools
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {card.alternatives.map((alt) => {
                  const link = buildDeepLink(alt, prompt);
                  return (
                    <InteractiveTooltip
                      key={alt}
                      content={
                        <div>
                          <div className="font-semibold mb-1">{alt.toUpperCase()}</div>
                          <div className="text-xs text-gray-300">
                            Click to open this tool with your prompt
                          </div>
                        </div>
                      }
                    >
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => trackDeepLinkClick(alt, link.url)}
                        className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-blue-400 dark:hover:border-blue-500 font-medium transition-all"
                      >
                        {link.label}
                      </a>
                    </InteractiveTooltip>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-6 flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button 
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 font-medium" 
              onClick={onSave}
              aria-label="Save tool suggestion to project"
            >
              Save to Project
            </button>
            <button
              className="border border-purple-600 dark:border-purple-500 rounded-lg px-4 py-2 text-sm bg-purple-600 dark:bg-purple-500 text-white font-medium hover:bg-purple-700 dark:hover:bg-purple-600 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-purple-600 flex items-center justify-center gap-2"
              onClick={onRunAndSave}
              disabled={running}
              aria-label="Run prompt with OpenRouter and save output"
            >
              {running ? (
                <>
                  <Spinner size="sm" />
                  <span>Running…</span>
                </>
              ) : (
                "Run & Save (OpenRouter)"
              )}
            </button>
          </div>

          {/* Show thorough path workflow below tool suggestion */}
          {workflows.length > 0 && (
            <WorkflowSuggestions 
              workflows={workflows} 
              onAddStep={handleAddWorkflowStep}
            />
          )}

          {/* Passport data hidden for release */}
          {false && card && (
            <details className="mt-4">
              <summary className="text-xs text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 mb-2">
                View passport data
              </summary>
              <pre className="mt-2 text-xs bg-gray-50 dark:bg-gray-900 p-3 rounded-lg overflow-x-auto border border-gray-200 dark:border-gray-700">
                {JSON.stringify(card?.passport, null, 2)}
          </pre>
            </details>
          )}
        </div>
      )}

      {showToolComparison && card && (
        <ToolComparison
          tools={[card.tool, ...(card.alternatives || [])]}
          onClose={() => setShowToolComparison(false)}
        />
      )}
    </main>
  );
}
