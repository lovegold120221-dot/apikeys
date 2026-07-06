import React, { useState } from 'react';
import { SUPPORTED_LANGUAGES } from '../../data/languages';
import { Search, Languages as LanguagesIcon } from 'lucide-react';

export function SupportedLanguages() {
  const [search, setSearch] = useState("");

  const filtered = SUPPORTED_LANGUAGES.filter(lang => 
    lang.name.toLowerCase().includes(search.toLowerCase()) ||
    lang.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-display font-bold tracking-tight text-[var(--text-primary)]">Supported Languages</h1>
        <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
          Eburon Translate supports over 100 languages for text, document, and website translation.
        </p>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-[var(--text-tertiary)]" />
        </div>
        <input
          type="text"
          placeholder="Search languages by name or ISO code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)] transition-all shadow-sm"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((lang) => (
          <div key={lang.code} className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[var(--accent)]/50 transition-all group">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">{lang.name}</span>
              <span className="text-xs font-mono text-[var(--text-tertiary)] bg-[var(--bg-tertiary)] px-2 py-0.5 rounded border border-[var(--border-color)]">{lang.code}</span>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 bg-[var(--bg-secondary)]/50 rounded-2xl border border-dashed border-[var(--border-color)]">
          <LanguagesIcon size={48} className="mx-auto text-[var(--text-tertiary)] opacity-20 mb-4" />
          <p className="text-[var(--text-secondary)]">No languages found matching "{search}"</p>
        </div>
      )}
    </div>
  );
}
