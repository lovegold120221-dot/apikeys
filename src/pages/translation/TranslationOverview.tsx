import React from 'react';
import { CodeBlock } from '../../components/CodeBlock';
import { NavLink } from 'react-router-dom';
import { Languages, FileText, ImageIcon, Search, ArrowRight } from 'lucide-react';

const capabilities = [
  { 
    title: 'Text Translation', 
    desc: 'Neural machine translation with support for 100+ languages.', 
    icon: FileText, 
    path: '/docs/translation/text' 
  },
  { 
    title: 'Image Translation', 
    desc: 'Extract and translate text directly from images and screenshots.', 
    icon: ImageIcon, 
    path: '/docs/translation/images' 
  },
];

export function TranslationOverview() {
  const apiHost = 'http://localhost:3000';

  return (
    <div className="space-y-12 pb-20">
      <div className="space-y-4">
        <h1 className="text-4xl font-display font-bold tracking-tight text-[var(--text-primary)]">Translation API</h1>
        <p className="text-lg text-[var(--text-secondary)] leading-relaxed max-w-2xl">
          Integrate powerful, neural machine translation into your applications with Eburon Translate. Support 100+ languages with industry-leading accuracy.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {capabilities.map((cap) => (
          <NavLink 
            key={cap.path} 
            to={cap.path}
            className="p-6 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[var(--accent)]/50 transition-all group flex flex-col justify-between h-48"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
                <cap.icon size={20} />
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">{cap.title}</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{cap.desc}</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--accent)] opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
              Explore API <ArrowRight size={14} />
            </div>
          </NavLink>
        ))}
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Quick Start</h2>
        <div className="space-y-4">
          <p className="text-[var(--text-secondary)] leading-relaxed">
            Send a POST request to the translation endpoint with your API key to get started immediately.
          </p>
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
      </div>

      <div className="p-8 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] space-y-4">
        <h3 className="text-xl font-bold text-[var(--text-primary)]">Production Grade Localization</h3>
        <p className="text-[var(--text-secondary)] leading-relaxed">
          Eburon Translate is built for scale. Unlike basic consumer-grade translation tools, Eburon provides enterprise-level security, neural-dynamic context matching, and structural integrity for professional workflows.
        </p>
        <div className="flex flex-wrap gap-4 pt-2">
          <span className="px-3 py-1 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[var(--accent)] text-[10px] font-bold uppercase tracking-wider">Zero-Data Retention</span>
          <span className="px-3 py-1 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[var(--accent)] text-[10px] font-bold uppercase tracking-wider">Neural Context API</span>
          <span className="px-3 py-1 rounded-full bg-[var(--accent)]/10 border border(--accent)]/20 text-[var(--accent)] text-[10px] font-bold uppercase tracking-wider">Semantic Preservation</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--text-tertiary)]">Consumer Tools</h4>
          <ul className="space-y-3">
            <li className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500/50" />
              Public data training models
            </li>
            <li className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500/50" />
              Inconsistent structural parsing
            </li>
            <li className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500/50" />
              Limited API rate limits
            </li>
          </ul>
        </div>
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--accent)]">Eburon Enterprise</h4>
          <ul className="space-y-3">
            <li className="flex items-center gap-3 text-sm text-[var(--text-primary)]">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
              Private, secure neural instances
            </li>
            <li className="flex items-center gap-3 text-sm text-[var(--text-primary)]">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
              Full DOM & document preservation
            </li>
            <li className="flex items-center gap-3 text-sm text-[var(--text-primary)]">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
              Elastic scale for million-token loads
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
