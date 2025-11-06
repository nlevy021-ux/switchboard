// app/projects/[id]/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSB } from "@/lib/store";
import ImportedTimelineCard from "@/components/TimelineCard";
import { suggestWorkflows } from "@/lib/workflows";
import { buildDeepLink } from "@/lib/links";
import type { Tool } from "@/lib/types";

import type { TaskStep } from "@/lib/types";

type Tab = "overview" | "steps" | "notes";

export default function ProjectDetail() {
  const { id } = useParams() as { id: string };
  const { projects, steps, addStep, setPlannedSteps, updateProjectNotes } = useSB();
  const project = projects[id];
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  if (!project) {
    return (
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-4 flex items-center gap-3">
          <Link 
            href="/projects" 
            className="text-sm border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
          >
            ← Back
          </Link>
          <Link 
            href="/" 
            className="text-sm border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
          >
            Home
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Project not found</h1>
      </main>
    );
  }

  // Filter timeline to only show completed searches (not planned steps)
  // Only show steps that have been executed (have confidence or were from actual routing)
  const timeline = project.stepIds
    .map((sid) => steps[sid])
    .filter(Boolean)
    .filter((step) => {
      if (step.type === "output") return false;
      const p = step.payload ?? {};
      // Only show steps that have confidence (from routing) or were explicitly saved
      // Don't show workflow placeholder steps
      return typeof p.confidence === "number" || (p.tool && !p.order);
    })
    .sort((a, b) => a.createdAt - b.createdAt);

  const lastUpdated = timeline.length
    ? new Date(Math.max(...timeline.map((s) => s.createdAt))).toLocaleString()
    : "—";

  // Get tool suggestion from first completed search
  const firstSearch = timeline.find((s) => {
    const p = s.payload ?? {};
    return typeof p.confidence === "number" && p.tool;
  });
  const toolSuggestion = firstSearch
    ? {
        tool: firstSearch.payload?.tool as Tool,
        confidence: firstSearch.payload?.confidence as number,
        openUrl: firstSearch.payload?.openUrl as string,
        openLabel: firstSearch.payload?.openLabel as string,
      }
    : null;

  // Get workflows - show thorough path only
  const allWorkflows = suggestWorkflows(project.title);
  const thoroughWorkflow = allWorkflows.find((w) => 
    w.id.includes("thorough") || (w.steps.length > 1 && !w.id.includes("quick"))
  );

  const plannedSteps = project.plannedSteps || [];

  const handleAddPlannedSteps = (workflowSteps: Omit<TaskStep, "id">[]) => {
    const stepsWithIds: TaskStep[] = workflowSteps.map((step, idx) => ({
      ...step,
      id: `${Date.now()}-${idx}`,
    }));
    setPlannedSteps(id, stepsWithIds);
    setActiveTab("steps");
  };

  const handleUpdateStepPrompt = (stepIndex: number, newPrompt: string) => {
    const updated = [...plannedSteps];
    updated[stepIndex] = {
      ...updated[stepIndex],
      prompt: newPrompt,
    };
    setPlannedSteps(id, updated);
  };

  const handleExecuteStep = (step: TaskStep, stepIndex: number) => {
    if (!step.tool || !step.prompt) return;

    // Create a search step for this execution
    const link = buildDeepLink(step.tool, step.prompt);
    addStep(id, {
      projectId: id,
      type: "decision",
      payload: {
        prompt: step.prompt,
        tool: step.tool,
        title: step.title,
        description: step.description,
        openUrl: link.url,
        openLabel: link.label,
      },
    });

    // Remove the executed step from planned steps
    const updated = plannedSteps.filter((_, idx) => idx !== stepIndex);
    setPlannedSteps(id, updated);

    // Open the tool in a new tab
    window.open(link.url, "_blank");
  };

  return (
    <main className="mx-auto max-w-4xl p-6">
      <div className="mb-6 flex items-center gap-3">
        <Link 
          href="/projects" 
          className="text-sm border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
        >
          ← Back
        </Link>
        <Link 
          href="/" 
          className="text-sm border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
        >
          Home
        </Link>
      </div>

      <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
        {project.title}
      </h1>
      <div className="text-sm text-gray-500 dark:text-gray-400 mb-6">Last updated: {lastUpdated}</div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "overview"
                ? "border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("steps")}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "steps"
                ? "border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            Steps {plannedSteps.length > 0 && `(${plannedSteps.length})`}
          </button>
          <button
            onClick={() => setActiveTab("notes")}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "notes"
                ? "border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            Notes
          </button>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Tool Suggestion */}
          {toolSuggestion && (
            <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 bg-white dark:bg-gray-800 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">
                    Tool Suggestion
                  </div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {toolSuggestion.tool.toUpperCase()}
                  </div>
                </div>
                <div className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <div className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                    {Math.round(toolSuggestion.confidence * 100)}% confidence
                  </div>
                </div>
              </div>
              {toolSuggestion.openUrl && (
                <a
                  href={toolSuggestion.openUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block border-2 border-blue-600 dark:border-blue-500 rounded-lg px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-all"
                >
                  {toolSuggestion.openLabel || "Open Tool"} →
                </a>
              )}
            </div>
          )}

          {/* Thorough Path */}
          {thoroughWorkflow && (
            <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 bg-white dark:bg-gray-800 shadow-sm">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {thoroughWorkflow.name}
                  </h3>
                  {thoroughWorkflow.estimatedTime && (
                    <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-400">
                      {thoroughWorkflow.estimatedTime}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{thoroughWorkflow.description}</p>
              </div>

              <div className="space-y-2 mb-4">
                {thoroughWorkflow.steps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3 pl-4 border-l-2 border-blue-200 dark:border-blue-700">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-semibold flex items-center justify-center mt-0.5">
                      {step.order}
                    </span>
                    <div className="flex-1">
                      <div className="font-medium text-sm text-gray-900 dark:text-gray-100">{step.title}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{step.description}</div>
                      {step.tool && (
                        <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                          {step.tool.toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleAddPlannedSteps(thoroughWorkflow.steps)}
                className="border-2 border-blue-600 dark:border-blue-500 rounded-lg px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-all"
              >
                Add All Steps
              </button>
            </div>
          )}

          {/* Completed Searches */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Completed Searches</h3>
            {timeline.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900">
                <div className="text-sm">No completed searches yet</div>
              </div>
            ) : (
              <div className="space-y-4">
                {timeline.map((step) => {
                  if (typeof ImportedTimelineCard === "function") {
                    return <ImportedTimelineCard key={step.id} step={step} />;
                  }
                  // Fallback if component doesn't load
                  return (
                    <div key={step.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        {step.type}: {typeof step.payload?.prompt === "string" ? step.payload.prompt : "Step"}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Steps Tab */}
      {activeTab === "steps" && (
        <div className="space-y-4">
          {plannedSteps.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900">
              <div className="text-lg mb-2">No planned steps</div>
              <div className="text-sm">Go to Overview and click &quot;Add All Steps&quot; to plan your workflow</div>
            </div>
          ) : (
            plannedSteps.map((step, idx) => (
              <div
                key={step.id || idx}
                className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800"
              >
                <div className="flex items-start gap-3 mb-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-sm font-semibold flex items-center justify-center">
                    {step.order}
                  </span>
                  <div className="flex-1 pr-8">
                    <div className="font-semibold text-base text-gray-900 dark:text-gray-100 mb-1">
                      {step.title}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">{step.description}</div>
                    {step.tool && (
                      <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 mb-2">
                        {step.tool.toUpperCase()}
                      </span>
                    )}
                    {step.prompt !== undefined && (
                      <div className="mt-2 w-full">
                        <textarea
                          value={step.prompt}
                          onChange={(e) => handleUpdateStepPrompt(idx, e.target.value)}
                          placeholder="Enter your prompt..."
                          className="w-full p-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none box-border"
                          rows={3}
                        />
                      </div>
                    )}
                    {step.tool && step.prompt && (
                      <div className="mt-4 w-full">
                        <button
                          onClick={() => handleExecuteStep(step, idx)}
                          className="w-full border-2 border-blue-600 dark:border-blue-500 rounded-lg px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-all box-border"
                        >
                      {step.tool === "chatgpt" ? "Run in ChatGPT" : 
                       step.tool === "perplexity" ? "Search in Perplexity" :
                       step.tool === "runway" ? "Open Runway" :
                       step.tool === "dalle" ? "Open DALL·E" :
                       step.tool === "gamma" ? "Open Gamma" :
                       step.tool === "tome" ? "Open Tome" :
                       step.tool === "suno" ? "Open Suno" :
                       step.tool === "canva" ? "Open Canva" :
                       step.tool === "framer_ai" ? "Open Framer AI" :
                       step.tool === "elevenlabs" ? "Open ElevenLabs" :
                       step.tool === "descript" ? "Open Descript" :
                       `Open ${step.tool.charAt(0).toUpperCase() + step.tool.slice(1).replace(/_/g, " ")}`}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Notes Tab */}
      {activeTab === "notes" && (
        <div>
          <textarea
            value={project.notes || ""}
            onChange={(e) => updateProjectNotes(id, e.target.value)}
            placeholder="Add notes about this project..."
            className="w-full min-h-[400px] border-2 border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          />
        </div>
      )}
    </main>
  );
}
