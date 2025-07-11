import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export interface Evaluation {
  id?: number;
  title: string;
  description?: string;
  helpUrl?: string;
  authorId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
}

interface EvaluationFormProps {
  evaluation?: Evaluation;
  teachers: Teacher[];
  onSave: (evaluation: Evaluation) => void;
  onCancel: () => void;
}

export function EvaluationForm({ evaluation, teachers, onSave, onCancel }: EvaluationFormProps) {
  const [title, setTitle] = useState(evaluation?.title || '');
  const [description, setDescription] = useState(evaluation?.description || '');
  const [helpUrl, setHelpUrl] = useState(evaluation?.helpUrl || '');
  const [authorId, setAuthorId] = useState(evaluation?.authorId || (teachers[0]?.id ?? ''));

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        onSave({ ...evaluation, title, description, helpUrl, authorId });
      }}
      className="space-y-4"
    >
      <div>
        <label className="block mb-1 font-medium">Título</label>
        <Input value={title} onChange={e => setTitle(e.target.value)} required />
      </div>
      <div>
        <label className="block mb-1 font-medium">Descripción</label>
        <Textarea value={description} onChange={e => setDescription(e.target.value)} />
      </div>
      <div>
        <label className="block mb-1 font-medium">URL de ayuda</label>
        <Input value={helpUrl} onChange={e => setHelpUrl(e.target.value)} />
      </div>
      <div>
        <label className="block mb-1 font-medium">Docente autor</label>
        <select
          className="w-full border rounded p-2 bg-background text-foreground border-input focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          value={authorId}
          onChange={e => setAuthorId(e.target.value)}
          required
        >
          {teachers.map(teacher => (
            <option key={teacher.id} value={teacher.id}>
              {teacher.name} ({teacher.email})
            </option>
          ))}
        </select>
      </div>
      <div className="flex gap-2">
        <Button type="submit">Guardar</Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
      </div>
    </form>
  );
} 