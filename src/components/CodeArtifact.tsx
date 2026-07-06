import React, { useState, useMemo } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Check, Copy, Download, Play, Code2, ShieldAlert, X, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from './CodeBlock';

interface CodeArtifactProps {
  code: string;
  language?: string;
  className?: string;
}

export function CodeArtifact({ code, language = 'html', className }: CodeArtifactProps) {
  const [mode, setMode] = useState<'code' | 'confirm' | 'preview'>('code');
  const [copied, setCopied] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext = language === 'html' ? 'html' : language === 'css' ? 'css' : language === 'javascript' || language === 'js' ? 'js' : 'txt';
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eburon-artifact.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const previewSrc = useMemo(() => {
    if (language !== 'html') return '';
    if (/<!doctype html>/i.test(code) || /<html[\s>]/i.test(code)) return code;
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:sans-serif;padding:20px;margin:0}</style></head><body>${code}</body></html>`;
  }, [code, language]);

  return (
    <div className={cn("rounded-xl overflow-hidden border border-slate-700/60 bg-[#0d1117] my-4 shadow-2xl", className)}>
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/80 border-b border-slate-700/60">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400/80" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{language}</span>
        </div>
        <div className="flex items-center gap-1">
          {/* Preview toggle */}
          {language === 'html' && (
            <button
              onClick={() => setMode(mode === 'preview' ? 'code' : 'confirm')}
              className={cn(
                "p-1.5 rounded-md transition-all flex items-center gap-1.5 text-[11px] font-semibold",
                mode === 'preview'
                  ? "bg-emerald-500/15 text-emerald-400"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              )}
              title={mode === 'preview' ? 'Back to code' : 'Preview'}
            >
              {mode === 'preview' ? <Code2 size={14} /> : <Play size={14} />}
              <span className="hidden sm:inline">{mode === 'preview' ? 'Code' : 'Preview'}</span>
            </button>
          )}
          {/* Download */}
          <button
            onClick={handleDownload}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all"
            title="Download"
          >
            <Download size={14} />
          </button>
          {/* Copy */}
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all flex items-center gap-1"
            title="Copy"
          >
            {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
            {copied && <span className="text-[11px] text-green-400 hidden sm:inline">Copied</span>}
          </button>
          {/* Collapse */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all"
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
        </div>
      </div>

      {/* Body */}
      {!collapsed && (
        <>
          {/* Code view */}
          {mode === 'code' && (
            <div className="p-4 overflow-x-auto text-sm max-h-[60vh] overflow-y-auto">
              <SyntaxHighlighter
                language={language}
                style={vscDarkPlus}
                customStyle={{ margin: 0, padding: 0, background: 'transparent' }}
                codeTagProps={{ style: { fontFamily: 'var(--font-mono)' } }}
              >
                {code}
              </SyntaxHighlighter>
            </div>
          )}

          {/* Security confirmation overlay */}
          {mode === 'confirm' && (
            <div className="p-6 bg-slate-900/95">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center shrink-0">
                  <ShieldAlert size={18} className="text-amber-400" />
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm text-slate-200 font-semibold leading-relaxed">
                    Previewing generated HTML or SVG could leak the contents of this chat via outbound network requests.
                  </p>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Only proceed if you trust the generated content. The preview runs in a sandboxed iframe.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 justify-end">
                <button
                  onClick={() => setMode('code')}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setMode('preview')}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-colors"
                >
                  Show preview
                </button>
              </div>
            </div>
          )}

          {/* Live preview */}
          {mode === 'preview' && language === 'html' && previewSrc && (
            <div className="bg-white h-[60vh] flex flex-col">
              <div className="px-3 py-1.5 bg-slate-100 border-b border-slate-200 flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live Preview</span>
              </div>
              <iframe
                className="w-full flex-1 border-none bg-white"
                title="Preview"
                sandbox="allow-scripts"
                srcDoc={previewSrc}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}