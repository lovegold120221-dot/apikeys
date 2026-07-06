import React from 'react';
import { CodeBlock } from '../../components/CodeBlock';
import { Search, ArrowRight, Info, Zap } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export function TranslationDetection() {
  const apiHost = 'http://localhost:3000';

  return (
    <div className="space-y-12 pb-20">
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-[var(--accent)] text-sm font-bold uppercase tracking-widest">
          <Search size={16} />
          <span>Translation API</span>
        </div>
        <h1 className="text-4xl font-display font-bold tracking-tight text-[var(--text-primary)]">Language Detection</h1>
        <p className="text-lg text-[var(--text-secondary)] leading-relaxed max-w-2xl">
          Instantly identify the language of any given text. Eburon's language detection engine supports detection for 150+ languages with high confidence scores.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Endpoint</h2>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] font-mono text-sm">
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold">POST</span>
              <span className="text-[var(--text-primary)]">/v1/translation/detect-language</span>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Request Body</h2>
            <div className="space-y-4 border rounded-xl border-[var(--border-color)] overflow-hidden bg-[var(--bg-secondary)]">
              <div className="grid grid-cols-3 p-3 bg-[var(--bg-tertiary)] border-b border-[var(--border-color)] text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">
                <span>Parameter</span>
                <span>Type</span>
                <span>Description</span>
              </div>
              <div className="divide-y divide-[var(--border-color)]">
                <div className="grid grid-cols-3 p-4 text-sm">
                  <span className="font-mono font-bold text-[var(--accent)]">text</span>
                  <span className="text-[var(--text-tertiary)]">string</span>
                  <span className="text-[var(--text-secondary)]">The text to analyze. Minimum 5 characters recommended.</span>
                </div>
              </div>
            </div>
          </section>

          <div className="flex items-start gap-4 p-4 rounded-xl bg-[var(--accent)]/5 border border-[var(--accent)]/20 text-[var(--accent)]">
            <Zap size={20} className="shrink-0 mt-0.5" />
            <div className="text-sm space-y-1">
              <p className="font-bold">Real-time Performance</p>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                Detection responses typically return in under <code className="bg-[var(--accent)]/10 px-1 rounded">50ms</code>, making it suitable for real-time routing logic.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-8 sticky top-24 h-fit">
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--text-tertiary)]">Example Request</h3>
            <CodeBlock 
              language="bash"
              code={`curl ${apiHost}/v1/translation/detect-language \\
  -H "Authorization: Bearer $EBURON_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "text": "Hola, ¿cómo estás?"
  }'`}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--text-tertiary)]">Example Response</h3>
            <CodeBlock 
              language="json"
              code={`{
  "object": "language_detection",
  "input": "Hola, ¿cómo estás?",
  "detected_language": "Spanish",
  "confidence": 0.99,
  "provider": "eburon-translate"
}`}
            />
          </div>

          <NavLink 
            to="/playground/translation"
            className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-[var(--accent)] text-[var(--accent-fg)] font-bold shadow-glow-lime hover:scale-[1.02] transition-all"
          >
            Try in Playground <ArrowRight size={18} />
          </NavLink>
        </div>
      </div>
    </div>
  );
}
