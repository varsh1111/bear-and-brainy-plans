import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { SUBJECT_COLORS, subjectColor, usePlanner, type Subject } from '@/lib/planner';

export function EditSubjectDialog({ subject }: { subject: Subject }) {
  const { updateSubject } = usePlanner();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(subject);
  return <Dialog open={open} onOpenChange={v => { setOpen(v); if (v) setDraft(subject); }}>
    <DialogTrigger asChild><Button variant="outline"><Pencil />Edit subject</Button></DialogTrigger>
    <DialogContent><DialogHeader><DialogTitle>Your subject, your goals</DialogTitle></DialogHeader>
      <form className="space-y-4" onSubmit={e => { e.preventDefault(); if (!draft.name.trim()) return; updateSubject(subject.id, { name: draft.name.trim(), emoji: draft.emoji || '📘', color: draft.color, targetHours: draft.targetHours || undefined }); setOpen(false); }}>
        <div className="space-y-2"><Label htmlFor="subject-name">Subject name</Label><Input id="subject-name" required value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} /></div>
        <div className="space-y-2"><Label htmlFor="subject-icon">Icon</Label><Input id="subject-icon" maxLength={8} value={draft.emoji} onChange={e => setDraft({ ...draft, emoji: e.target.value })} /></div>
        <fieldset className="space-y-2"><legend className="text-sm font-medium">Subject color</legend><div className="flex gap-2">{Array.from({ length: SUBJECT_COLORS }, (_, color) => <Button key={color} type="button" size="icon" variant="outline" aria-label={`Subject color ${color + 1}`} aria-pressed={draft.color % SUBJECT_COLORS === color} onClick={() => setDraft({ ...draft, color })} className={draft.color % SUBJECT_COLORS === color ? 'ring-2 ring-primary' : ''}><span className="size-6 rounded-full" style={{ background: subjectColor(color) }} /></Button>)}</div></fieldset>
        <div className="space-y-2"><Label htmlFor="subject-target">Target study hours</Label><Input id="subject-target" type="number" min="0" step="0.5" value={draft.targetHours ?? ''} placeholder="No target yet" onChange={e => setDraft({ ...draft, targetHours: e.target.value ? Number(e.target.value) : undefined })} /></div>
        <Button type="submit" className="w-full">Save subject</Button>
      </form>
    </DialogContent>
  </Dialog>;
}