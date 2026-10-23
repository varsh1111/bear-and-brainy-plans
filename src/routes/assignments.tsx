import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { AssignmentRow, AddAssignmentForm } from '@/components/AssignmentList';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePlanner } from '@/lib/planner';
import { pageHead } from '@/lib/page-head';

export const Route = createFileRoute('/assignments')({ head: () => pageHead('Assignment Tracker', 'Organize assignments by subject, deadline and priority and track completed tasks.'), component: AssignmentsPage });
function AssignmentsPage() {
  const { subjects, assignments } = usePlanner();
  const [subject, setSubject] = useState('all');
  const [status, setStatus] = useState('pending');
  const [priority, setPriority] = useState('all');
  const list = assignments.filter(a => (subject === 'all' || a.subjectId === subject) && (status === 'all' || a.done === (status === 'completed')) && (priority === 'all' || (a.priority ?? 'medium') === priority)).sort((a,b) => a.due.localeCompare(b.due));
  return <div className="space-y-8"><div><h1 className="text-3xl font-bold">Assignment Tracker</h1><p className="mt-1 text-muted-foreground">A little less on your mind, a little more in order ✨</p></div><AddAssignmentForm /><div className="flex flex-wrap gap-3 border-y py-4"><Select value={subject} onValueChange={setSubject}><SelectTrigger className="w-48" aria-label="Filter assignments by subject"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All subjects</SelectItem>{subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.emoji} {s.name}</SelectItem>)}</SelectContent></Select><Select value={status} onValueChange={setStatus}><SelectTrigger className="w-40" aria-label="Filter assignments by status"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="pending">To do</SelectItem><SelectItem value="completed">Completed</SelectItem><SelectItem value="all">All tasks</SelectItem></SelectContent></Select><Select value={priority} onValueChange={setPriority}><SelectTrigger className="w-40" aria-label="Filter assignments by priority"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All priorities</SelectItem>{['low','medium','high'].map(p => <SelectItem key={p} value={p}>{p[0].toUpperCase() + p.slice(1)} priority</SelectItem>)}</SelectContent></Select><span className="self-center text-sm text-muted-foreground">{list.length} tasks</span></div><div className="space-y-3">{list.map(a => <AssignmentRow key={a.id} a={a} showSubject />)}{!list.length && <p className="py-8 text-center text-muted-foreground">No assignments here. A little breathing room 🌱</p>}</div></div>;
}