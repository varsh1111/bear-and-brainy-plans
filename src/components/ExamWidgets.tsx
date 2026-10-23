import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SubjectSelect } from '@/components/StudyWidgets';
import { usePlanner } from '@/lib/planner';
import { calendarDaysUntil, dateKey, goalPercent, topicStatuses, type Exam } from '@/lib/study';

export function ExamDialog({ exam }: { exam?: Exam }) {
  const { subjects, saveExam } = usePlanner();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(exam?.title ?? '');
  const [subjectId, setSubjectId] = useState(exam?.subjectId ?? subjects[0]?.id ?? '');
  const [date, setDate] = useState(exam?.date ?? dateKey());
  const sid = subjects.some(s => s.id === subjectId) ? subjectId : subjects[0]?.id ?? '';
  return <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button variant={exam ? 'ghost' : 'default'} size={exam ? 'icon' : 'default'} aria-label={exam ? 'Edit exam' : undefined} disabled={!subjects.length}>{exam ? <Pencil className="size-4" /> : <><Plus />Add exam</>}</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>{exam ? 'Edit exam' : 'A new exam to prepare for'}</DialogTitle></DialogHeader><form className="space-y-4" onSubmit={e => { e.preventDefault(); if (!title.trim() || !sid || !date) return; saveExam({ title: title.trim(), subjectId: sid, date, topics: exam?.topics ?? [] }, exam?.id); setOpen(false); if (!exam) setTitle(''); }}>
    <div className="space-y-2"><Label htmlFor="exam-title">Exam name</Label><Input id="exam-title" required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Semester final" /></div>
    <div className="space-y-2"><Label htmlFor="exam-subject">Subject</Label><SubjectSelect id="exam-subject" value={sid} onChange={setSubjectId} /></div>
    <div className="space-y-2"><Label htmlFor="exam-date">Exam date</Label><Input id="exam-date" type="date" required value={date} onChange={e => setDate(e.target.value)} /></div><Button type="submit" className="w-full">Save exam</Button>
  </form></DialogContent></Dialog>;
}

export function ExamItem({ exam }: { exam: Exam }) {
  const { subjects, removeExam, addTopic, updateTopic, removeTopic } = usePlanner();
  const [topic, setTopic] = useState('');
  const subject = subjects.find(s => s.id === exam.subjectId);
  const days = calendarDaysUntil(exam.date);
  const confident = exam.topics.filter(t => t.status === 'confident').length;
  return <article className="space-y-5 rounded-lg border bg-card p-5">
    <div className="flex items-start gap-3"><span className="text-2xl">{subject?.emoji}</span><div className="min-w-0 flex-1"><h2 className="break-words text-xl font-bold">{exam.title}</h2><p className="break-words text-sm text-muted-foreground">{subject?.name} · {format(parseISO(exam.date), 'd MMM yyyy')}</p><p className={`mt-1 text-sm font-semibold ${days < 0 ? 'text-muted-foreground' : 'text-primary'}`}>{days < 0 ? 'Exam finished' : days === 0 ? 'Exam today' : `${days} days to go`}</p></div><div className="flex shrink-0"><ExamDialog exam={exam} /><Button variant="ghost" size="icon" aria-label="Delete exam" onClick={() => { if (confirm('Delete this exam and its revision topics?')) removeExam(exam.id); }}><Trash2 className="size-4" /></Button></div></div>
    <div className="space-y-2"><div className="flex justify-between gap-2 text-sm"><span>Revision confidence</span><span>{confident} / {exam.topics.length} topics</span></div><Progress value={goalPercent(confident, exam.topics.length)} /></div>
    <div className="space-y-3">{exam.topics.map(t => <div key={t.id} className="flex flex-wrap items-center gap-2 border-b pb-3"><span className="min-w-0 flex-1 basis-36 break-words text-sm font-medium">{t.title}</span><Select value={t.status} onValueChange={v => { const status = topicStatuses.find(s => s.value === v); if (status) updateTopic(exam.id, t.id, status.value); }}><SelectTrigger className="w-48" aria-label={`Revision status for ${t.title}`}><SelectValue /></SelectTrigger><SelectContent>{topicStatuses.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent></Select><Button variant="ghost" size="icon" aria-label={`Delete topic ${t.title}`} onClick={() => removeTopic(exam.id, t.id)}><Trash2 className="size-4" /></Button></div>)}</div>
    <form className="flex gap-2" onSubmit={e => { e.preventDefault(); if (!topic.trim()) return; addTopic(exam.id, topic.trim()); setTopic(''); }}><Input aria-label={`New revision topic for ${exam.title}`} className="min-w-0" placeholder="Add a revision topic…" value={topic} onChange={e => setTopic(e.target.value)} /><Button type="submit" variant="outline" disabled={!topic.trim()}><Plus />Topic</Button></form>
  </article>;
}