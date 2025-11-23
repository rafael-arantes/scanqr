'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Loader2, MessageSquare } from 'lucide-react';
import { useState } from 'react';

const categories = [
  { value: 'bug', label: 'Bug / Erro' },
  { value: 'suggestion', label: 'Sugestão' },
  { value: 'praise', label: 'Elogio' },
  { value: 'other', label: 'Outro' },
];

export function FeedbackDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [category, setCategory] = useState('suggestion');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (message.trim().length < 10) {
      setError('Mensagem deve ter pelo menos 10 caracteres');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category, message }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erro ao enviar feedback');
        return;
      }

      // Success - reset form and close dialog
      setMessage('');
      setCategory('suggestion');
      setIsOpen(false);

      // Show success message (you could use a toast notification here)
      alert('Feedback enviado com sucesso! Obrigado pela sua contribuição.');
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError('Erro ao enviar feedback. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          <MessageSquare className="mr-2 h-4 w-4" />
          Enviar Feedback
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Enviar Feedback</DialogTitle>
          <DialogDescription>Sua opinião é muito importante! Compartilhe bugs, sugestões ou elogios.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-background cursor-pointer"
              disabled={isSubmitting}
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Mensagem</Label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Descreva seu feedback aqui..."
              className="w-full min-h-[150px] px-3 py-2 border rounded-md bg-background resize-none"
              maxLength={1000}
              disabled={isSubmitting}
              required
            />
            <p className="text-xs text-muted-foreground text-right">{message.length}/1000 caracteres</p>
          </div>

          {error && <div className="bg-red-50 text-red-600 px-4 py-2 rounded-md text-sm">{error}</div>}

          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar Feedback'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
