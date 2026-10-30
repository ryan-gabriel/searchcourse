'use client';

import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { buttonClass } from '@/components/button';

type FeedbackKind = 'REVIEW' | 'SUGGESTION';

const TYPES: { value: FeedbackKind; label: string; hint: string }[] = [
  { value: 'SUGGESTION', label: 'Suggestion', hint: 'An idea, bug, or improvement' },
  { value: 'REVIEW', label: 'Review', hint: 'How the site or deals worked for you' },
];

export function FeedbackForm() {
  const [type, setType] = useState<FeedbackKind>('SUGGESTION');
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setStatus('sending');

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          message,
          name: name || null,
          email: email || null,
          pageUrl: window.location.pathname,
          website,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(
          data?.message === 'Validation error'
            ? 'Please check the message length and email address.'
            : data?.message || 'Could not send feedback. Please try again.'
        );
        setStatus('idle');
        return;
      }

      setStatus('sent');
    } catch {
      setError('Could not send feedback. Please check your connection and try again.');
      setStatus('idle');
    }
  }

  function sendAnother() {
    setMessage('');
    setType('SUGGESTION');
    setError(null);
    setStatus('idle');
  }

  if (status === 'sent') {
    return (
      <div
        role="status"
        className="rounded-lg border border-accent/30 bg-accent/5 px-6 py-12 text-center"
      >
        <CheckCircle2 className="mx-auto h-8 w-8 text-accent" aria-hidden="true" />
        <h2 className="mt-3 text-lg font-semibold">Thanks — message received.</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          We read every review and suggestion. If you left an email, we may follow up.
        </p>
        <button type="button" onClick={sendAnother} className={buttonClass('secondary', 'mt-6')}>
          Send another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <fieldset>
        <legend className="mb-2 block text-sm font-medium">What would you like to send?</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {TYPES.map((option) => {
            const selected = type === option.value;
            return (
              <label
                key={option.value}
                className={`focus-within:ring-2 focus-within:ring-accent/40 cursor-pointer rounded-md border px-4 py-3 transition-colors ${
                  selected
                    ? 'border-accent bg-accent/5'
                    : 'border-border bg-card hover:bg-muted'
                }`}
              >
                <input
                  type="radio"
                  name="type"
                  value={option.value}
                  checked={selected}
                  onChange={() => setType(option.value)}
                  className="sr-only"
                />
                <span className="block text-sm font-semibold">{option.label}</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">{option.hint}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div>
        <label htmlFor="feedback-message" className="mb-1 block text-sm font-medium">
          Message
        </label>
        <textarea
          id="feedback-message"
          required
          minLength={3}
          maxLength={2000}
          rows={6}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Tell us what is working, what is broken, or which deals you want to see more of…"
          className="focus-ring w-full resize-y rounded-md border border-border bg-card px-4 py-2 text-sm"
        />
        <p className="mt-1 text-right text-xs text-muted-foreground">{message.length}/2000</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="feedback-name" className="mb-1 block text-sm font-medium">
            Name <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <input
            id="feedback-name"
            type="text"
            maxLength={100}
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="focus-ring w-full rounded-md border border-border bg-card px-4 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="feedback-email" className="mb-1 block text-sm font-medium">
            Email <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <input
            id="feedback-email"
            type="email"
            maxLength={254}
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="focus-ring w-full rounded-md border border-border bg-card px-4 py-2 text-sm"
          />
        </div>
      </div>

      {/* Honeypot — hidden from people, attractive to bots. */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="feedback-website">Website</label>
        <input
          id="feedback-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
        />
      </div>

      {error ? (
        <p
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === 'sending'}
        className={buttonClass('primary', 'w-full disabled:cursor-not-allowed disabled:opacity-60')}
      >
        {status === 'sending' ? 'Sending…' : 'Send feedback'}
      </button>
    </form>
  );
}
