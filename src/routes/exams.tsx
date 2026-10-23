import { createFileRoute } from '@tanstack/react-router';
import { ExamDialog, ExamItem } from '@/components/ExamWidgets';
import { usePlanner } from '@/lib/planner';
import { pageHead } from '@/lib/page-head';

export const Route = createFileRoute('/exams')({ head: () => pageHead('Exam Tracker', 'Plan exam dates and follow your revision topics from first steps to feeling confident.'), component: ExamsPage });
function ExamsPage() {
  const { exams } = usePlanner();
  return <div className="space-y-8"><div className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-3xl font-bold">Exam Tracker</h1><p className="mt-1 text-muted-foreground">One topic at a time, a little more prepared 🌱</p></div><ExamDialog /></div>{!exams.length && <p className="border-y py-12 text-center text-muted-foreground">Your upcoming exams will find a home here.</p>}<div className="grid items-start gap-6 xl:grid-cols-2">{[...exams].sort((a,b) => a.date.localeCompare(b.date)).map(exam => <ExamItem key={exam.id} exam={exam} />)}</div></div>;
}