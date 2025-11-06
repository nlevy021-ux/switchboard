// components/WorkflowSuggestions.tsx
"use client";

import { useState } from "react";
import type { Workflow } from "@/lib/types";
import { getWorkflowLink } from "@/lib/workflows";
import type { Tool } from "@/lib/types";

type WorkflowSuggestionsProps = {
  workflows: Workflow[];
  prompt: string;
  onAddStep: (tool: Tool, promptText: string, workflowId?: string) => void;
};

export default function WorkflowSuggestions({ workflows, prompt, onAddStep }: WorkflowSuggestionsProps) {
  const [expandedWorkflow, setExpandedWorkflow] = useState<string | null>(null);

  if (workflows.length === 0) {
    return null;
  }

  const handleQuickStart = (workflow: Workflow) => {
    const firstStep = workflow.steps[0];
    if (firstStep?.tool && firstStep.prompt) {
      onAddStep(firstStep.tool, firstStep.prompt, workflow.id);
    }
  };

  const handleAddAllSteps = (workflow: Workflow) => {
    workflow.steps.forEach((step) => {
      if (step.tool && step.prompt) {
        onAddStep(step.tool, step.prompt, workflow.id);
      }
    });
  };

  return (
    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-4">
      <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
        Thorough Path:
      </div>
      {workflows.map((workflow, idx) => {
        const isExpanded = expandedWorkflow === workflow.id;
        const firstStep = workflow.steps[0];
        const firstLink = firstStep ? getWorkflowLink(firstStep) : null;

        return (
          <div
            key={workflow.id}
            className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 transition-all"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                    {workflow.name}
                  </h3>
                  {workflow.estimatedTime && (
                    <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-400">
                      {workflow.estimatedTime}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{workflow.description}</p>
              </div>
            </div>

            {workflow.steps.length > 1 && (
              <button
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium mt-2 flex items-center gap-1"
                onClick={() => setExpandedWorkflow(isExpanded ? null : workflow.id)}
              >
                {isExpanded ? "▼" : "▶"} {workflow.steps.length} steps
              </button>
            )}

            {isExpanded && workflow.steps.length > 1 && (
              <div className="mt-3 space-y-2 pl-4 border-l-2 border-blue-200 dark:border-blue-700">
                {workflow.steps.map((step, stepIdx) => {
                  const stepLink = getWorkflowLink(step);
                  return (
                    <div key={step.id || stepIdx} className="py-2">
                      <div className="flex items-start gap-2">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-semibold flex items-center justify-center">
                          {step.order}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-xs text-gray-900 dark:text-gray-100">
                            {step.title}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                            {step.description}
                          </div>
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
              {workflow.steps.length > 1 && (
                <button
                  className="flex-1 border-2 border-blue-600 dark:border-blue-500 rounded-lg px-3 py-2 text-sm bg-blue-600 dark:bg-blue-500 text-white font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-all"
                  onClick={() => handleAddAllSteps(workflow)}
                >
                  Add All Steps
                </button>
              )}
              {firstLink && (
                <button
                  className="border-2 border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                  onClick={() => handleQuickStart(workflow)}
                >
                  Start Here
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

