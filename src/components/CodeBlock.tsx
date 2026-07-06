import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Check, Copy } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CodeBlockProps {
  language: string;
  code: string;
  className?: string;
}

export function CodeBlock({ language, code, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("relative group rounded-lg overflow-hidden border border-slate-800 dark:border-slate-800 bg-[#161b22] my-4", className)}>
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-[10px] font-bold uppercase tracking-widest text-slate-500">
        <span>{language}</span>
        <button 
          onClick={handleCopy}
          className="hover:text-[var(--text-primary)] transition-colors flex items-center gap-1 opacity-0 group-hover:opacity-100 focus:opacity-100"
          aria-label="Copy code"
        >
          {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div className="p-4 overflow-x-auto text-sm">
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          customStyle={{ margin: 0, padding: 0, background: 'transparent' }}
          codeTagProps={{ style: { fontFamily: 'var(--font-mono)' } }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
