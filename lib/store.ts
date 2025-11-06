// lib/store.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Project, Step, TaskStep } from "./types";

type SwitchboardState = {
  projects: Record<string, Project>;
  steps: Record<string, Step>;
  activeProjectId: string | null;

  // project ops
  createProject: (title: string) => string;
  renameProject: (id: string, title: string) => void;
  deleteProject: (id: string) => void;
  setActiveProject: (id: string | null) => void;

  // step ops
  addStep: (projectId: string, step: Omit<Step, "id" | "createdAt">) => string;
  deleteStep: (projectId: string, stepId: string) => void;
  reorderStep: (projectId: string, stepId: string, dir: "up" | "down") => void;

  // planned steps ops
  setPlannedSteps: (projectId: string, steps: TaskStep[]) => void;
  updateProjectNotes: (projectId: string, notes: string) => void;

  clearAll?: () => void;
};

const uid = () => Math.random().toString(36).slice(2, 10);

export const useSB = create<SwitchboardState>()(
  persist(
    (set) => ({
      projects: {},
      steps: {},
      activeProjectId: null,

      createProject: (title) => {
        const id = uid();
        const project: Project = { id, title, createdAt: Date.now(), stepIds: [], plannedSteps: [], notes: "" };
        set((s) => ({
          projects: { ...s.projects, [id]: project },
          activeProjectId: id,
        }));
        return id;
      },

      renameProject: (id, title) =>
        set((s) => {
          const p = s.projects[id];
          if (!p) return s;
          // Ensure plannedSteps and notes exist for existing projects
          const updated = {
            ...p,
            title,
            plannedSteps: p.plannedSteps ?? [],
            notes: p.notes ?? "",
          };
          return { projects: { ...s.projects, [id]: updated } };
        }),

      deleteProject: (id) =>
        set((s) => {
          const p = s.projects[id];
          if (!p) return s;
          const steps = { ...s.steps };
          for (const sid of p.stepIds) delete steps[sid];
          const projects = { ...s.projects };
          delete projects[id];
          const activeProjectId = s.activeProjectId === id ? null : s.activeProjectId;
          return { projects, steps, activeProjectId };
        }),

      setActiveProject: (id) => set({ activeProjectId: id }),

      addStep: (projectId, step) => {
        const id = uid();
        const full: Step = { ...step, id, projectId, createdAt: Date.now() };
        set((s) => {
          const proj = s.projects[projectId];
          if (!proj) return s;
          return {
            steps: { ...s.steps, [id]: full },
            projects: {
              ...s.projects,
              [projectId]: { ...proj, stepIds: [...proj.stepIds, id] },
            },
          };
        });
        return id;
      },

      deleteStep: (projectId, stepId) =>
        set((s) => {
          const proj = s.projects[projectId];
          if (!proj || !s.steps[stepId]) return s;
          const steps = { ...s.steps };
          delete steps[stepId];
          const stepIds = proj.stepIds.filter((i) => i !== stepId);
          return {
            steps,
            projects: { ...s.projects, [projectId]: { ...proj, stepIds } },
          };
        }),

      reorderStep: (projectId, stepId, dir) =>
        set((s) => {
          const proj = s.projects[projectId];
          if (!proj) return s;
          const idx = proj.stepIds.indexOf(stepId);
          if (idx === -1) return s;
          const target = dir === "up" ? idx - 1 : idx + 1;
          if (target < 0 || target >= proj.stepIds.length) return s;
          const stepIds = [...proj.stepIds];
          const [moved] = stepIds.splice(idx, 1);
          stepIds.splice(target, 0, moved);
          return { projects: { ...s.projects, [projectId]: { ...proj, stepIds } } };
        }),

      setPlannedSteps: (projectId, steps) =>
        set((s) => {
          const proj = s.projects[projectId];
          if (!proj) return s;
          // Ensure notes exist
          const updated = {
            ...proj,
            plannedSteps: steps,
            notes: proj.notes ?? "",
          };
          return {
            projects: {
              ...s.projects,
              [projectId]: updated,
            },
          };
        }),

      updateProjectNotes: (projectId, notes) =>
        set((s) => {
          const proj = s.projects[projectId];
          if (!proj) return s;
          // Ensure plannedSteps exist
          const updated = {
            ...proj,
            notes,
            plannedSteps: proj.plannedSteps ?? [],
          };
          return {
            projects: {
              ...s.projects,
              [projectId]: updated,
            },
          };
        }),

      clearAll: () => set({ projects: {}, steps: {}, activeProjectId: null }),
    }),
    { name: "switchboard-store", storage: createJSONStorage(() => localStorage) }
  )
);
