// lib/analytics.ts
// Analytics utility for tracking user interactions

declare global {
  interface Window {
    gtag?: (
      command: string,
      targetId: string,
      config?: Record<string, unknown>
    ) => void;
  }
}

/**
 * Track a custom event in Google Analytics
 */
export function trackEvent(
  eventName: string,
  parameters?: Record<string, string | number | boolean>
): void {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, parameters);
  }
}

/**
 * Track tool routing event
 */
export function trackToolRouting(tool: string, confidence: number, prompt: string): void {
  trackEvent("tool_routing", {
    tool_name: tool,
    confidence: Math.round(confidence * 100),
    prompt_length: prompt.length,
  });
}

/**
 * Track project creation
 */
export function trackProjectCreation(projectId: string, title: string): void {
  trackEvent("project_created", {
    project_id: projectId,
    project_title: title,
  });
}

/**
 * Track step save to project
 */
export function trackStepSaved(projectId: string, stepType: string, tool?: string): void {
  trackEvent("step_saved", {
    project_id: projectId,
    step_type: stepType,
    tool: tool || "unknown",
  });
}

/**
 * Track "Run & Save" action
 */
export function trackRunAndSave(projectId: string, promptLength: number): void {
  trackEvent("run_and_save", {
    project_id: projectId,
    prompt_length: promptLength,
  });
}

/**
 * Track deep link click to external tool
 */
export function trackDeepLinkClick(tool: string, url: string): void {
  trackEvent("deep_link_click", {
    tool_name: tool,
    destination_url: url,
  });
}

/**
 * Track workflow step addition
 */
export function trackWorkflowStepAdded(tool: string, workflowId: string): void {
  trackEvent("workflow_step_added", {
    tool_name: tool,
    workflow_id: workflowId,
  });
}

