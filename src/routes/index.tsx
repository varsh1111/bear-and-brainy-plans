import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, CheckCircle2, Clock, Trophy, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { usePlanner, progressOf, subjectColor, daysUntil, getAchievements } from "@/lib/planner";
import { AssignmentRow, AddAssignmentForm } from "@/components/AssignmentList";
import { AddSubjectDialog } from "@/components/AddSubjectDialog";
import { StudyStats, GoalsPanel, SessionDialog, DailyChart } from "@/components/StudyWidgets";
import { dateKey, weekSummary, hoursLabel, hours } from "@/lib/study";
import { pageHead } from "@/lib/page-head";

export const Route = createFileRoute("/")({
  head: () => pageHead('Your study universe', 'Your study hours, goals, completed assignments and upcoming deadlines in one calm dashboard.'),
  component: Dashboard,
});

function Dashboard() {
  const planner = usePlanner();
  const { subjects, assignments, sessions, exams } = planner;
  const week = weekSummary(sessions);
  const todayTasks = assignments.filter(a => !a.done && a.due === dateKey());
  const overall = progressOf(assignments);
  const pending = assignments.filter((a) => !a.done).sort((a, b) => a.due.localeCompare(b.due));
  const soon = pending.filter((a) => daysUntil(a.due) <= 2);
  const unlocked = getAchievements(planner).filter((a) => a.unlocked).length;

  const stats = [
    { icon: BookOpen, label: "Subjects", value: subjects.length },
    { icon: CheckCircle2, label: "Completed", value: assignments.filter((a) => a.done).length },
    { icon: Clock, label: "To do", value: pending.length },
    { icon: Trophy, label: "Badges", value: unlocked },
  ];

  return (
    <div className="space-y-8">
      <section className="flex flex-wrap items-center justify-between gap-6 border-b pb-6">
        <div><h1 className="text-3xl font-bold md:text-4xl">Your study universe ✨</h1><p className="mt-2 text-muted-foreground">Small steps count. Let’s see your progress.</p></div>
        <SessionDialog />
      </section>
      <StudyStats />
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="flex flex-row items-center gap-4 p-5 shadow-soft">
            <div className="grid size-11 place-items-center rounded-xl bg-secondary text-secondary-foreground"><s.icon className="size-5" /></div>
            <div><p className="font-display text-2xl font-bold">{s.value}</p><p className="text-sm text-muted-foreground">{s.label}</p></div>
          </Card>
        ))}
      </section>

      <div className="grid gap-10 lg:grid-cols-3">
        <section className="space-y-4 lg:col-span-2"><div className="flex flex-wrap justify-between gap-2"><h2 className="text-xl font-bold">This week’s study rhythm</h2><Link to="/progress" className="text-sm font-semibold text-primary">My Progress →</Link></div><DailyChart sessions={week.current} start={week.start} /><p className="text-sm text-muted-foreground">Today: {hoursLabel(hours(sessions.filter(s => s.date === dateKey())))} · This month: {hoursLabel(hours(sessions.filter(s => s.date.startsWith(dateKey().slice(0, 7)))))}</p></section>
        <GoalsPanel />
      </div>
      <section className="space-y-4"><div className="flex flex-wrap justify-between gap-2"><h2 className="text-xl font-bold">Assignment progress</h2><span className="text-sm font-semibold">{overall}% complete</span></div><Progress value={overall} /><h3 className="font-semibold">Today’s tasks</h3>{todayTasks.length ? todayTasks.map(a => <AssignmentRow key={a.id} a={a} showSubject />) : <p className="text-sm text-muted-foreground">No assignments due today. Room for a little study, or a little rest 🌱</p>}</section>
      <div className="grid gap-8 lg:grid-cols-5">
        <section className="space-y-4 lg:col-span-3">
          <h2 className="text-xl font-bold">Upcoming deadlines</h2>
          <AddAssignmentForm />
          <div className="space-y-2">
            {pending.length === 0 && <p className="rounded-xl border border-dashed p-6 text-center text-muted-foreground">Nothing due. Enjoy your break! 🎉</p>}
            {pending.slice(0, 8).map((a) => <AssignmentRow key={a.id} a={a} showSubject />)}
          </div>
        </section>

        <section className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Subject progress</h2>
            <AddSubjectDialog><Button size="sm" variant="outline"><Plus />Subject</Button></AddSubjectDialog>
          </div>
          <div className="space-y-3">
            {subjects.map((s) => {
              const list = assignments.filter((a) => a.subjectId === s.id);
              const p = progressOf(list);
              return (
                <Link key={s.id} to="/subjects/$id" params={{ id: s.id }} className="block rounded-xl border bg-card p-4 transition hover:shadow-soft">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-lg">{s.emoji}</span>
                    <span className="font-semibold">{s.name}</span>
                    <span className="ml-auto text-sm text-muted-foreground">{list.filter((a) => a.done).length}/{list.length}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full transition-all" style={{ width: `${p}%`, background: subjectColor(s.color) }} />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
      <section className="space-y-3"><div className="flex justify-between gap-2"><h2 className="text-xl font-bold">Upcoming exams</h2><Link to="/exams" className="text-sm font-semibold text-primary">Exam Tracker →</Link></div>{exams.filter(e => e.date >= dateKey()).sort((a,b) => a.date.localeCompare(b.date)).slice(0,3).map(e => <Link key={e.id} to="/exams" className="flex flex-wrap justify-between gap-2 rounded-lg border bg-card p-4"><span className="font-semibold">{e.title}</span><span className="text-sm text-muted-foreground">{daysUntil(e.date) === 0 ? 'Today' : `${daysUntil(e.date)} days to go`}</span></Link>)}{!exams.some(e => e.date >= dateKey()) && <p className="text-sm text-muted-foreground">No upcoming exams added yet.</p>}</section>
    </div>
  );
}
