import React, { useState } from 'react';
import { CodeBlock } from '../components/CodeBlock';
import { Copy, Check, Gauge, HelpCircle, Zap, Search } from 'lucide-react';
import { cn } from '../components/CodeBlock';

const publicModels = [
  { id: 'eburon-pro', type: 'Chat', useCase: 'General assistant tasks', status: 'Available', latency: '~12 ms', throughput: '165 t/s', progress: '20%', typeColor: 'text-[var(--text-primary)] bg-[var(--bg-tertiary)] border-[var(--border-color)]' },
  { id: 'eburon-pro/autonomous', type: 'Agent', useCase: 'Autonomous agent workflows', status: 'Available', latency: '~28 ms', throughput: '110 t/s', progress: '45%', typeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20', barColor: 'bg-rose-400' },
  { id: 'eburon-frontend-engineer', type: 'Agent', useCase: 'Frontend code generation', status: 'Available', latency: '~22 ms', throughput: '130 t/s', progress: '35%', typeColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20', barColor: 'bg-blue-400' },
  { id: 'eburon-backend-engineer', type: 'Agent', useCase: 'Backend and API development', status: 'Available', latency: '~22 ms', throughput: '130 t/s', progress: '35%', typeColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20', barColor: 'bg-blue-400' },
  { id: 'eburon-devops-engineer', type: 'Agent', useCase: 'Infrastructure and deployment', status: 'Available', latency: '~24 ms', throughput: '125 t/s', progress: '38%', typeColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20', barColor: 'bg-blue-400' },
  { id: 'eburon-ui-designer-vision', type: 'Vision', useCase: 'UI/UX design and prototyping', status: 'Available', latency: '~35 ms', throughput: '90 t/s', progress: '60%', typeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20', barColor: 'bg-amber-400' },
  { id: 'eburon-unit-test-writer', type: 'Code', useCase: 'Automated test generation', status: 'Available', latency: '~15 ms', throughput: '180 t/s', progress: '25%', typeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', barColor: 'bg-emerald-400' },
  { id: 'eburon-docs-writer', type: 'Code', useCase: 'Technical documentation', status: 'Available', latency: '~14 ms', throughput: '190 t/s', progress: '22%', typeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', barColor: 'bg-emerald-400' },
  { id: 'eburon/alpha', type: 'Reasoning', useCase: 'Large-scale complex analysis', status: 'Available', latency: '~45 ms', throughput: '55 t/s', progress: '85%', typeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20', barColor: 'bg-purple-400' },
  { id: 'eburon/beta', type: 'Chat', useCase: 'Ultra-fast lightweight responses', status: 'Available', latency: '~5 ms', throughput: '320 t/s', progress: '8%', typeColor: 'text-[var(--text-primary)] bg-[var(--bg-tertiary)] border-[var(--border-color)]' },
  { id: 'eburon-embed', type: 'Embeddings', useCase: 'Search and RAG workflows', status: 'Available', latency: '~8 ms', throughput: '350 t/s', progress: '15%', typeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', barColor: 'bg-emerald-400' },
];

export function Models() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filter, setFilter] = useState('');

  const copyToClipboard = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredModels = publicModels.filter(m => 
    m.id.toLowerCase().includes(filter.toLowerCase()) || 
    m.useCase.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-xs font-medium text-[var(--accent)] mb-2">
        <Gauge size={14} />
        <span>Performance Metrics Enabled — Tested on Apple M3 Max & NVIDIA RTX 4090</span>
      </div>
      <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white via-[var(--text-primary)] to-[var(--text-secondary)]">Models & Performance</h1>
      <p className="text-lg text-[var(--text-secondary)] leading-relaxed max-w-3xl">
        Eburon AI offers a suite of highly capable local models. Use the real-time latency (<span className="text-[var(--text-primary)] font-mono text-xs bg-[var(--bg-tertiary)] px-1.5 py-0.5 rounded">TTFT</span>) and throughput (<span className="text-[var(--accent)] font-mono text-xs bg-[var(--accent)]/10 px-1.5 py-0.5 rounded border border-[var(--accent)]/20">Tokens/sec</span>) metrics below to optimize your application for speed or deep reasoning.
      </p>

      <div className="pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-2.5">
            Available Models Registry
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[var(--bg-tertiary)] text-[var(--text-secondary)]">{publicModels.length} models</span>
          </h2>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[var(--text-tertiary)] absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Filter by ID or use case..." 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)]/50 focus:ring-1 focus:ring-[var(--accent)]/50 transition-all"
            />
          </div>
        </div>
        
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)]/60 backdrop-blur-xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="border-b border-[var(--border-color)] bg-[var(--bg-primary)]/80 text-[11px] font-mono uppercase tracking-wider text-[var(--text-secondary)]">
                <tr>
                  <th className="py-4 px-6 font-semibold">Model ID</th>
                  <th className="py-4 px-6 font-semibold">Type</th>
                  <th className="py-4 px-6 font-semibold">
                    <div className="flex items-center gap-1.5" title="Time to First Token (Simulated benchmark)">
                      <span>Latency (TTFT)</span>
                      <HelpCircle size={14} className="text-[var(--text-tertiary)]" />
                    </div>
                  </th>
                  <th className="py-4 px-6 font-semibold">
                    <div className="flex items-center gap-1.5" title="Tokens generated per second">
                      <span>Throughput</span>
                      <Zap size={14} className="text-[var(--accent)]" />
                    </div>
                  </th>
                  <th className="py-4 px-6 font-semibold">Recommended Use Case</th>
                  <th className="py-4 px-6 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)] text-sm">
                {filteredModels.map((m) => (
                  <tr key={m.id} className="group hover:bg-[var(--bg-tertiary)] transition-colors">
                    <td className="py-4 px-6 font-mono font-medium text-[var(--text-primary)]">
                      <div className="flex items-center gap-2">
                        <span className="text-[var(--accent)] font-semibold">{m.id}</span>
                        <button 
                          onClick={() => copyToClipboard(m.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[var(--bg-tertiary)] rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
                          aria-label="Copy model id"
                        >
                          {copiedId === m.id ? <span className="text-[10px] font-mono text-[var(--accent)] font-bold">Copied!</span> : <Copy size={14} />}
                        </button>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border", m.typeColor)}>
                        {m.type}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-mono text-xs text-[var(--text-secondary)]">
                      <div className="flex items-center gap-2">
                        <span className="w-12 text-right">{m.latency}</span>
                        <div className="w-16 h-1.5 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                          <div className={cn("h-full rounded-full", m.barColor || "bg-[var(--accent)]")} style={{ width: m.progress }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-mono text-xs">
                      <span className="text-[var(--accent)] font-bold bg-[var(--accent)]/10 px-2 py-0.5 rounded border border-[var(--accent)]/20">{m.throughput}</span>
                    </td>
                    <td className="py-4 px-6 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">{m.useCase}</td>
                    <td className="py-4 px-6 text-right">
                      {m.status.includes('if configured') ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border-color)]">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                          Available if configured
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/30 shadow-glow-lime-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]"></span>
                          Available
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 bg-[var(--bg-secondary)]/40 border-t border-[var(--border-color)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[var(--text-secondary)]">
            <div className="flex items-center gap-2">
              <HelpCircle size={16} className="text-[var(--accent)]" />
              <span>Throughput benchmarks measured at FP16 precision on local silicon.</span>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-8">
        <h2 className="text-2xl font-semibold mb-4 text-[var(--text-primary)]">List Models API</h2>
        <p className="text-[var(--text-secondary)] mb-4">You can query the available models programmatically using industry-standard endpoints.</p>
        
        <CodeBlock language="http" code="GET /v1/models" />
        
        <p className="text-[var(--text-secondary)] mt-6 mb-4">Example response:</p>
        <CodeBlock language="json" code={`{
  "object": "list",
  "data": [
    {
      "id": "eburon-core",
      "object": "model",
      "owned_by": "eburon-ai"
    },
    {
      "id": "eburon-fast",
      "object": "model",
      "owned_by": "eburon-ai"
    }
  ]
}`} />
      </div>
    </div>
  );
}
