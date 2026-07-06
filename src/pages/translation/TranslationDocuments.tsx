import React from 'react';
import { CodeBlock } from '../../components/CodeBlock';
import { FileText, ArrowRight, Info, Upload, Globe } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export function TranslationDocuments() {
  const apiHost = 'http://localhost:3000';

  return (
    <div className="space-y-12 pb-20">
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-[var(--accent)] text-sm font-bold uppercase tracking-widest">
          <FileText size={16} />
          <span>Translation API</span>
        </div>
        <h1 className="text-4xl font-display font-bold tracking-tight text-[var(--text-primary)]">Document Translation</h1>
        <p className="text-lg text-[var(--text-secondary)] leading-relaxed max-w-2xl">
          Translate entire documents while maintaining original formatting, styles, and layouts. Ideal for legal contracts, technical manuals, and marketing collateral.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Endpoint</h2>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] font-mono text-sm">
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold">POST</span>
              <span className="text-[var(--text-primary)]">/v1/translation/documents</span>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Multi-part Form Data</h2>
            <div className="space-y-4 border rounded-xl border-[var(--border-color)] overflow-hidden bg-[var(--bg-secondary)]">
              <div className="grid grid-cols-3 p-3 bg-[var(--bg-tertiary)] border-b border-[var(--border-color)] text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">
                <span>Field</span>
                <span>Type</span>
                <span>Description</span>
              </div>
              <div className="divide-y divide-[var(--border-color)]">
                <div className="grid grid-cols-3 p-4 text-sm">
                  <span className="font-mono font-bold text-[var(--accent)]">file</span>
                  <span className="text-[var(--text-tertiary)]">file</span>
                  <span className="text-[var(--text-secondary)]">The document file to translate.</span>
                </div>
                <div className="grid grid-cols-3 p-4 text-sm">
                  <span className="font-mono font-bold text-[var(--accent)]">target_language</span>
                  <span className="text-[var(--text-tertiary)]">string</span>
                  <span className="text-[var(--text-secondary)]">ISO language code for translation.</span>
                </div>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-center">
              <p className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-1">Max File Size</p>
              <p className="text-xl font-bold text-[var(--text-primary)]">30MB</p>
            </div>
            <div className="p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-center">
              <p className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-1">Formats</p>
              <p className="text-xl font-bold text-[var(--text-primary)]">PDF, DOCX, TXT</p>
            </div>
          </div>
        </div>

        <div className="space-y-8 sticky top-24 h-fit">
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--text-tertiary)]">cURL Example</h3>
            <CodeBlock 
              language="bash"
              code={`curl ${apiHost}/v1/translation/documents \\
  -H "Authorization: Bearer $EBURON_API_KEY" \\
  -F "file=@/path/to/contract.pdf" \\
  -F "target_language=ja"`}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--text-tertiary)]">Polling Status</h3>
            <CodeBlock 
              language="json"
              code={`{
  "object": "document_translation",
  "id": "doc_8f2k9l3",
  "status": "processing",
  "progress": 45,
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
