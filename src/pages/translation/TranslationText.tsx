import React from 'react';
import { CodeBlock } from '../../components/CodeBlock';
import { FileText, ArrowRight, Check, Info, Globe } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export function TranslationText() {
  const apiHost = 'http://localhost:3000';

  return (
    <div className="space-y-12 pb-20">
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-[var(--accent)] text-sm font-bold uppercase tracking-widest">
          <FileText size={16} />
          <span>Translation API</span>
        </div>
        <h1 className="text-4xl font-display font-bold tracking-tight text-[var(--text-primary)]">Text Translation</h1>
        <p className="text-lg text-[var(--text-secondary)] leading-relaxed max-w-2xl">
          Integrate Eburon's Neural Machine Translation (NMT) into your workflows. Our API provides context-aware, linguistically accurate translations that far exceed basic consumer-grade tools.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div className="p-6 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] space-y-4">
             <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
                 <Check size={18} />
               </div>
               <h3 className="font-bold text-[var(--text-primary)]">Enterprise Privacy</h3>
             </div>
             <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
               Data sent to Eburon Translate is never used for model training. We provide a zero-retention guarantee for all professional-tier API calls.
             </p>
          </div>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Endpoint</h2>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] font-mono text-sm">
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold">POST</span>
              <span className="text-[var(--text-primary)]">/v1/translation/text</span>
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
                  <span className="text-[var(--text-secondary)]">The text to translate. Max 5000 characters.</span>
                </div>
                <div className="grid grid-cols-3 p-4 text-sm">
                  <span className="font-mono font-bold text-[var(--accent)]">target_language</span>
                  <span className="text-[var(--text-tertiary)]">string</span>
                  <span className="text-[var(--text-secondary)]">ISO language code (e.g., 'en', 'es').</span>
                </div>
                <div className="grid grid-cols-3 p-4 text-sm">
                  <span className="font-mono font-bold text-[var(--text-secondary)]">source_language</span>
                  <span className="text-[var(--text-tertiary)]">string</span>
                  <span className="text-[var(--text-secondary)]">Optional. Source ISO code. Defaults to 'auto'.</span>
                </div>
              </div>
            </div>
          </section>

          <div className="flex items-start gap-4 p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 text-blue-500">
            <Info size={20} className="shrink-0 mt-0.5" />
            <div className="text-sm space-y-1">
              <p className="font-bold">Pro Tip</p>
              <p className="text-blue-500/80 leading-relaxed">
                Use "auto" for <code className="bg-blue-500/10 px-1 rounded">source_language</code> to leverage Eburon's high-precision language detection engine.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-8 sticky top-24 h-fit">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--text-tertiary)]">Example Request</h3>
              <div className="flex gap-2">
                <span className="px-2 py-0.5 rounded-md bg-[var(--bg-tertiary)] text-[var(--text-secondary)] text-[10px] font-bold">cURL</span>
              </div>
            </div>
            <CodeBlock 
              language="bash"
              code={`curl ${apiHost}/v1/translation/text \\
  -H "Authorization: Bearer $EBURON_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "source_language": "auto",
    "target_language": "en",
    "text": "Kumusta ka?"
  }'`}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--text-tertiary)]">Example Response</h3>
            <CodeBlock 
              language="json"
              code={`{
  "object": "translation",
  "source_language": "auto",
  "detected_language": "Filipino",
  "target_language": "English",
  "input": "Kumusta ka?",
  "translation": "How are you?",
  "provider": "eburon-translate"
}`}
            />
          </div>

          <div className="flex flex-col gap-3">
            <NavLink 
              to="/playground/translation"
              className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-[var(--accent)] text-[var(--accent-fg)] font-bold shadow-glow-lime hover:scale-[1.02] transition-all"
            >
              Try in Playground <ArrowRight size={18} />
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
}
