// components/TimelineCard.tsx
"use client";

import type { Step } from "@/lib/types";

function pct(n?: number) {
  if (n == null) return null;
  return `${Math.round(n * 100)}%`;
}

export default function TimelineCard({ step }: { step: Step }) {
  const created = new Date(step.createdAt).toLocaleString();
  const p = step.payload ?? {};

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
      {/* Top row: timestamp • type + tool badge */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
        <div className="font-medium">
          {created} • <span className="capitalize">{step.type}</span>
        </div>
        {typeof p.tool === "string" && p.tool && (
          <span className="inline-block px-2.5 py-1 rounded-full border border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold text-xs">
            {p.tool.toUpperCase()}
          </span>
        )}
      </div>

      {/* Task Title (if present, from workflow) */}
      {typeof p.title === "string" && p.title && (
        <div className="mb-3">
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{p.title}</div>
          {typeof p.description === "string" && p.description && (
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{p.description}</div>
          )}
        </div>
      )}

      {/* Prompt (if present) */}
      {typeof p.prompt === "string" && p.prompt && (
        <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 uppercase tracking-wide">Prompt</div>
          <div className="text-sm text-gray-900 dark:text-gray-100">{p.prompt}</div>
        </div>
      )}

      {/* Confidence meter (if present) */}
      {typeof p.confidence === "number" && (
        <div className="mt-3 mb-3">
          <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
            Confidence: <span className="font-bold text-blue-600 dark:text-blue-400">{pct(p.confidence)}</span>
          </div>
          <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
              style={{ width: `${Math.max(0, Math.min(100, Math.round(p.confidence * 100)))}%` }}
            />
          </div>
        </div>
      )}

      {/* Primary link (if present) */}
      {typeof p.openUrl === "string" && p.openUrl && (
        <a
          className="inline-block text-sm border-2 border-blue-600 dark:border-blue-500 rounded-lg px-4 py-2 mt-3 bg-blue-600 dark:bg-blue-500 text-white font-medium hover:bg-blue-700 dark:hover:bg-blue-600 hover:shadow-md transition-all"
          href={p.openUrl}
          target="_blank"
          rel="noreferrer"
        >
          {typeof p.openLabel === "string" && p.openLabel ? p.openLabel : "Open link"} →
        </a>
      )}


      {/* Passport data hidden for release */}
      {false && p.passport && (
        <details className="mt-4">
          <summary className="text-xs text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 mb-2 font-medium">
            View passport data
          </summary>
          <pre className="mt-2 text-xs bg-gray-50 dark:bg-gray-900 p-3 rounded-lg overflow-x-auto border border-gray-200 dark:border-gray-700">
            {JSON.stringify(p.passport, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}
