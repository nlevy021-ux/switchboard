// components/TaskPlanner.tsx
"use client";

import { useState } from "react";
import type { Workflow, TaskStep } from "@/lib/types";
import { getWorkflowLink } from "@/lib/workflows";

type TaskPlannerProps = {
  workflows: Workflow[];
  onAddSteps: (steps: Omit<TaskStep, "id">[]) => void;
  projectId: string;
};

export default function TaskPlanner({ workflows, onAddSteps, projectId }: TaskPlannerProps) {
  // projectId is kept in props for future use but not currently used
  void projectId;
  const [expandedWorkflow, setExpandedWorkflow] = useState<string | null>(null);

  const handleAddWorkflow = (workflow: Workflow) => {
    const stepsToAdd = workflow.steps.map((step) => ({
      title: step.title,
      description: step.description,
      tool: step.tool,
      prompt: step.prompt,
      order: step.order,
    }));
    onAddSteps(stepsToAdd);
    setExpandedWorkflow(null);
  };

  if (workflows.length === 0) {
    return null;
  }

  return (
    <div className="mb-8 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 bg-white dark:bg-gray-800 shadow-sm">
      <div className="mb-4">
        <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1">
          Suggested Paths
        </h2>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Choose a path to add steps to your project
        </p>
      </div>

      <div className="space-y-3">
        {workflows.map((workflow, idx) => {
          const isExpanded = expandedWorkflow === workflow.id;
          const link = workflow.steps[0] ? getWorkflowLink(workflow.steps[0]) : null;

          return (
            <div
              key={workflow.id}
              className={`border-2 rounded-lg p-3 transition-all ${
                idx === 0
                  ? "border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : isExpanded
                  ? "border-blue-300 dark:border-blue-600 bg-blue-50/50 dark:bg-blue-900/10"
                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-600"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{workflow.name}</h3>
                    {workflow.estimatedTime && (
                      <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-400">
                        {workflow.estimatedTime}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{workflow.description}</p>
                </div>
              </div>

              {workflow.steps.length > 1 && (
                <button
                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium mb-2 flex items-center gap-1"
                  onClick={() => setExpandedWorkflow(isExpanded ? null : workflow.id)}
                >
                  {isExpanded ? "▼" : "▶"} {workflow.steps.length} steps
                </button>
              )}

              {isExpanded && workflow.steps.length > 1 && (
                <div className="mt-2 mb-3 space-y-1.5 pl-3 border-l-2 border-blue-200 dark:border-blue-700">
                  {workflow.steps.map((step, stepIdx) => {
                    return (
                      <div key={step.id || stepIdx} className="py-1.5">
                        <div className="flex items-start gap-2">
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-semibold flex items-center justify-center">
                            {step.order}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-xs text-gray-900 dark:text-gray-100">
                              {step.title}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{step.description}</div>
                            {step.tool && (
                              <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-xs font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                                {step.tool.toUpperCase()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex gap-2 mt-3">
                <button
                  className={`flex-1 border-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                    idx === 0
                      ? "border-blue-600 dark:border-blue-500 bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600"
                      : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                  onClick={() => handleAddWorkflow(workflow)}
                >
                  {idx === 0 ? "Add Quick Path" : "Add All Steps"}
                </button>
                {link && (
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border-2 border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all whitespace-nowrap"
                  >
                    Quick Start
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

