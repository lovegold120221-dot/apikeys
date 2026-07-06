import React from 'react';
import { CodeBlock } from '../../components/CodeBlock';
import { Globe, ArrowRight, Info, ShieldCheck } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export function TranslationWebsites() {
  const apiHost = 'http://localhost:3000';

  return (
    <div className="space-y-12 pb-20">
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-[var(--accent)] text-sm font-bold uppercase tracking-widest">
          <Globe size={16} />
          <span>Translation API</span>
        </div>
        <h1 className="text-4xl font-display font-bold tracking-tight text-[var(--text-primary)]">Website Translation</h1>
        <p className="text-lg text-[var(--text-secondary)] leading-relaxed max-w-2xl">
          Deliver localized web experiences instantly. Eburon Website Translation dynamically translates web content while preserving original structure and CSS.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Endpoint</h2>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] font-mono text-sm">
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold">POST</span>
              <span className="text-[var(--text-primary)]">/v1/translation/websites</span>
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
                  <span className="font-mono font-bold text-[var(--accent)]">url</span>
                  <span className="text-[var(--text-tertiary)]">string</span>
                  <span className="text-[var(--text-secondary)]">The URL of the website to translate.</span>
                </div>
                <div className="grid grid-cols-3 p-4 text-sm">
                  <span className="font-mono font-bold text-[var(--accent)]">target_language</span>
                  <span className="text-[var(--text-tertiary)]">string</span>
                  <span className="text-[var(--text-secondary)]">ISO language code for the localized page.</span>
                </div>
              </div>
            </div>
          </section>

          <div className="p-6 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] space-y-4">
            <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
              <ShieldCheck size={18} className="text-[var(--accent)]" />
              Secure Proxying
            </h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              All website translations are routed through Eburon's secure, low-latency edge network, ensuring the target website never sees the end-user's IP address.
            </p>
          </div>
        </div>

        <div className="space-y-8 sticky top-24 h-fit">
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--text-tertiary)]">Example Request</h3>
            <CodeBlock 
              language="bash"
              code={`curl ${apiHost}/v1/translation/websites \\
  -H "Authorization: Bearer $EBURON_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://docs.eburon.ai",
    "target_language": "ko"
  }'`}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--text-tertiary)]">Example Response</h3>
            <CodeBlock 
              language="json"
              code={`{
  "object": "website_translation",
  "url": "https://docs.eburon.ai",
  "target_language": "Korean",
  "translated_url": "https://eburon.ai/translate?url=https%3A%2F%2Fdocs.eburon.ai&tl=ko",
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
