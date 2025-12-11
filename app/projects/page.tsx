// app/projects/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useSB } from "@/lib/store";

export default function ProjectsPage() {
  const {
    projects,
    steps,
    createProject,
    renameProject,
    deleteProject,
  } = useSB();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  const onNew = () => {
    const title = prompt("Project name?", "Untitled Project") ?? "Untitled Project";
    createProject(title);
  };

  const beginEdit = (id: string, current: string) => {
    setEditingId(id);
    setDraft(current);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft("");
  };

  const saveEdit = (id: string) => {
    const title = draft.trim();
    if (!title) return cancelEdit();
    renameProject(id, title);   // now properly typed and defined
    cancelEdit();
  };

  const onDelete = (id: string) => {
    if (confirm("Delete this project and all its steps?")) deleteProject(id); // now on the store type
  };

  const items = Object.values(projects).sort((a, b) => b.createdAt - a.createdAt);

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Projects
        </h1>
        <div className="flex gap-3">
          <Link 
            href="/" 
            className="border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-sm bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 font-medium"
          >
            Home
          </Link>
          <button 
            className="border border-blue-600 dark:border-blue-500 rounded-lg px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white font-medium hover:bg-blue-700 dark:hover:bg-blue-600 shadow-md hover:shadow-lg" 
            onClick={onNew}
          >
            New Project
          </button>
        </div>
      </div>

      <ul className="mt-4 space-y-3">
        {items.map((p) => {
          const count = p.stepIds.length;
          const last = count
            ? new Date(Math.max(...p.stepIds.map((id) => steps[id]?.createdAt ?? 0))).toLocaleString()
            : "—";

          const isEditing = editingId === p.id;

          return (
            <li key={p.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all card-hover backdrop-blur-sm bg-white/95 dark:bg-gray-800/95 animate-in fade-in">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <input
                        className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm w-64 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEdit(p.id);
                          if (e.key === "Escape") cancelEdit();
                        }}
                        autoFocus
                      />
                      <button 
                        className="text-sm border border-green-600 dark:border-green-500 rounded-lg px-3 py-2 bg-green-600 dark:bg-green-500 text-white font-medium hover:bg-green-700 dark:hover:bg-green-600" 
                        onClick={() => saveEdit(p.id)}
                      >
                        Save
                      </button>
                      <button 
                        className="text-sm border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium" 
                        onClick={cancelEdit}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="font-semibold text-lg text-gray-900 dark:text-gray-100 truncate mb-1">{p.title}</div>
                  )}

                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {count} step{count === 1 ? "" : "s"} • Last updated: {last}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!isEditing && (
                    <button
                      className="text-sm border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 font-medium"
                      onClick={() => beginEdit(p.id, p.title)}
                    >
                      Rename
                    </button>
                  )}
                  <button 
                    className="text-sm border border-red-300 dark:border-red-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-400 dark:hover:border-red-500 text-red-600 dark:text-red-400 font-medium" 
                    onClick={() => onDelete(p.id)}
                  >
                    Delete
                  </button>
                  <Link 
                    className="text-sm border border-blue-600 dark:border-blue-500 rounded-lg px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white font-medium hover:bg-blue-700 dark:hover:bg-blue-600 shadow-md hover:shadow-lg" 
                    href={`/projects/${p.id}`}
                  >
                    Open
                  </Link>
                </div>
              </div>
            </li>
          );
        })}
        {items.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <div className="text-lg mb-2">No projects yet.</div>
            <div className="text-sm">Create your first project to get started!</div>
          </div>
        )}
      </ul>
    </main>
  );
}
