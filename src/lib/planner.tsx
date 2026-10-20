import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Subject = { id: string; name: string; emoji: string; color: number };
export type Assignment = {
  id: string;
  subjectId: string;
  title: string;
  due: string; // yyyy-mm-dd
  done: boolean;
};
type State = { subjects: Subject[]; assignments: Assignment[] };

export const SUBJECT_COLORS = 6;
export const subjectColor = (c: number) => `var(--chart-${(c % SUBJECT_COLORS) + 1})`;

const uid = () => Math.random().toString(36).slice(2, 10);
const inDays = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

const seed = (): State => ({
  subjects: [
    { id: "math", name: "Mathematics", emoji: "📐", color: 0 },
    { id: "bio", name: "Biology", emoji: "🧬", color: 1 },
    { id: "eng", name: "English", emoji: "📚", color: 2 },
  ],
  assignments: [
    { id: uid(), subjectId: "math", title: "Algebra worksheet", due: inDays(1), done: false },
    { id: uid(), subjectId: "math", title: "Chapter 3 quiz prep", due: inDays(5), done: true },
    { id: uid(), subjectId: "bio", title: "Cell structure lab report", due: inDays(3), done: false },
    { id: uid(), subjectId: "eng", title: "Essay draft", due: inDays(7), done: false },
  ],
});

const KEY = "study-planner-v1";

type Ctx = State & {
  addSubject: (name: string, emoji: string) => Subject;
  removeSubject: (id: string) => void;
  addAssignment: (a: Omit<Assignment, "id" | "done">) => void;
  toggleAssignment: (id: string) => void;
  removeAssignment: (id: string) => void;
};

const PlannerCtx = createContext<Ctx | null>(null);

export function PlannerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(seed);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (loaded) localStorage.setItem(KEY, JSON.stringify(state));
  }, [state, loaded]);

  const ctx: Ctx = {
    ...state,
    addSubject: (name, emoji) => {
      const s: Subject = { id: uid(), name, emoji: emoji || "📘", color: state.subjects.length };
      setState((p) => ({ ...p, subjects: [...p.subjects, s] }));
      return s;
    },
    removeSubject: (id) =>
      setState((p) => ({
        subjects: p.subjects.filter((s) => s.id !== id),
        assignments: p.assignments.filter((a) => a.subjectId !== id),
      })),
    addAssignment: (a) =>
      setState((p) => ({ ...p, assignments: [...p.assignments, { ...a, id: uid(), done: false }] })),
    toggleAssignment: (id) =>
      setState((p) => ({
        ...p,
        assignments: p.assignments.map((a) => (a.id === id ? { ...a, done: !a.done } : a)),
      })),
    removeAssignment: (id) =>
      setState((p) => ({ ...p, assignments: p.assignments.filter((a) => a.id !== id) })),
  };
  return <PlannerCtx.Provider value={ctx}>{children}</PlannerCtx.Provider>;
}

export function usePlanner() {
  const c = useContext(PlannerCtx);
  if (!c) throw new Error("usePlanner outside provider");
  return c;
}

export function progressOf(assignments: Assignment[]) {
  if (!assignments.length) return 0;
  return Math.round((assignments.filter((a) => a.done).length / assignments.length) * 100);
}

export function daysUntil(due: string) {
  const today = new Date(new Date().toISOString().slice(0, 10));
  return Math.round((new Date(due).getTime() - today.getTime()) / 86400000);
}

export function dueLabel(due: string) {
  const d = daysUntil(due);
  if (d < 0) return `${-d} day${d === -1 ? "" : "s"} overdue`;
  if (d === 0) return "Due today";
  if (d === 1) return "Due tomorrow";
  return `Due in ${d} days`;
}

export type Achievement = { id: string; emoji: string; title: string; desc: string; unlocked: boolean; progress: string };

export function getAchievements(s: State): Achievement[] {
  const done = s.assignments.filter((a) => a.done).length;
  const fullSubjects = s.subjects.filter((sub) => {
    const list = s.assignments.filter((a) => a.subjectId === sub.id);
    return list.length > 0 && list.every((a) => a.done);
  }).length;
  const mk = (id: string, emoji: string, title: string, desc: string, cur: number, goal: number) => ({
    id, emoji, title, desc, unlocked: cur >= goal, progress: `${Math.min(cur, goal)}/${goal}`,
  });
  return [
    mk("first", "🌱", "First Step", "Complete your first assignment", done, 1),
    mk("five", "🔥", "On a Roll", "Complete 5 assignments", done, 5),
    mk("ten", "🚀", "Unstoppable", "Complete 10 assignments", done, 10),
    mk("twentyfive", "🏆", "Study Champion", "Complete 25 assignments", done, 25),
    mk("organized", "🗂️", "Organized", "Add 5 subjects", s.subjects.length, 5),
    mk("master", "⭐", "Subject Master", "Finish every task in a subject", fullSubjects, 1),
    mk("allstar", "🌟", "All-Star", "Finish every task in 3 subjects", fullSubjects, 3),
  ];
}
