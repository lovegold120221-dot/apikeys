import React, { useState, useEffect } from 'react';
import { CodeBlock, cn } from '../components/CodeBlock';
import { useAuth } from '@/src/context/AuthContext';
import { Send, Loader2, Copy, Check, Eye, EyeOff, Layout, Maximize2, X as CloseIcon } from 'lucide-react';

const CEO_GRADE_DIRECTIVE = "\n\nCRITICAL: You are an elite, top-tier AI assistant. Every output MUST be 'CEO-grade': professional, high-impact, polished, and functionally flawless. If writing code, ensure it is production-ready, highly optimized, and includes necessary comments for clarity. If designing UI, focus on modern aesthetics, accessibility, and exceptional user experience.";

const DEFAULT_MODELS = [
  'eburon-core',
  'eburon-fast',
  'eburon-code',
  'eburon-reasoning',
  'eburon-vision',
  'eburon-embed',
  'eburon-agent',
  'eburon-local'
];

export function Playground() {
  const { user, getIdToken } = useAuth();
  const [publicModels, setPublicModels] = useState<string[]>(DEFAULT_MODELS);
  const [model, setModel] = useState(DEFAULT_MODELS[0]);
  const [systemPrompt, setSystemPrompt] = useState("You are Eburon AI, a helpful, highly accurate, and precise local AI assistant running on advanced local hardware.");
  const [userPrompt, setUserPrompt] = useState("");
  const [temperature, setTemperature] = useState(0.7);
  const [stream, setStream] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");
  const [rawRequest, setRawRequest] = useState("");
  const [rawResponse, setRawResponse] = useState("");
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    if (!user) return;
    (async () => {
      const token = await getIdToken();
      if (token) setApiKey(token);
    })();
  }, [user, getIdToken]);

  useEffect(() => {
    if (!apiKey) return;
    // Attempt to auto-detect available models
    const fetchModels = async () => {
      try {
        const res = await fetch("/v1/models", {
          headers: {
            "Authorization": `Bearer ${apiKey}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.data && Array.isArray(data.data) && data.data.length > 0) {
            const models = data.data.map((m: any) => m.id);
            setPublicModels(models);
            setModel(models[0]);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch models, using defaults.", err);
      }
    };
    fetchModels();
  }, [apiKey]);

  const handleSend = async () => {
    if (!userPrompt.trim()) return;
    if (!apiKey) {
      setResponse("Error: Sign in to get an API key before sending requests.");
      return;
    }
    
    setLoading(true);
    setResponse("");
    setRawResponse("");
    
    const requestBody = {
      model,
      messages: [
        { role: "system", content: systemPrompt + CEO_GRADE_DIRECTIVE },
        { role: "user", content: userPrompt }
      ],
      temperature,
      stream
    };
    
    setRawRequest(JSON.stringify(requestBody, null, 2));

    try {
      const res = await fetch("/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!res.ok) {
        const errorData = await res.json();
        setRawResponse(JSON.stringify(errorData, null, 2));
        setResponse(`Error: ${errorData.error?.message || res.statusText}`);
        setLoading(false);
        return;
      }

      if (stream) {
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let fullContent = "";
        let rawContent = "";
        
        while (reader) {
          const { value, done } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          rawContent += chunk;
          setRawResponse(rawContent);

          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ') && line !== 'data: [DONE]') {
              try {
                const data = JSON.parse(line.substring(6));
                if (data.choices && data.choices[0].delta && data.choices[0].delta.content) {
                  fullContent += data.choices[0].delta.content;
                  setResponse(fullContent);
                }
              } catch (e) {
                // ignore parse errors for partial chunks
              }
            }
          }
        }
      } else {
        const data = await res.json();
        setRawResponse(JSON.stringify(data, null, 2));
        if (data.choices && data.choices.length > 0) {
          setResponse(data.choices[0].message.content);
        }
      }
    } catch (e: any) {
      setResponse(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!response) return;
    navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-[calc(100vh-6rem)] min-h-0 flex flex-col playground-panel">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full min-h-0">
        {/* Settings Column */}
        <div className="space-y-6 lg:col-span-4 p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)]/80 backdrop-blur-md shadow-xl overflow-y-auto custom-scrollbar">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2 flex items-center gap-2">Target Model</label>
            <select 
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl px-4 py-2 text-sm font-mono text-[var(--accent)] focus:outline-none focus:border-[var(--accent)] shadow-sm"
            >
              {publicModels.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-2">
                System Prompt Presets
              </label>
              <span className="text-[10px] font-mono text-[var(--accent)] bg-[var(--accent)]/10 px-2 py-0.5 rounded border border-[var(--accent)]/20">Instant Inject</span>
            </div>
            
            <div className="relative mb-4">
              <select 
                onChange={(e) => {
                  const preset = {
                    coding: "You are an expert principal software engineer and debugging specialist. Write clean, modular, production-ready code with concise explanations and focus on optimal algorithmic performance, memory efficiency, and edge cases.",
                    writer: "You are a master storyteller and creative copywriter. Use rich imagery, compelling narratives, articulate vocabulary, and an engaging tone tailored to captivate the reader.",
                    analyst: "You are a meticulous senior data analyst and statistician. Analyze datasets systematically, identify key statistical trends, anomalies, and correlations, and present actionable insights using clear tabular structures.",
                    default: "You are Eburon AI, a helpful, highly accurate, and precise local AI assistant running on advanced local hardware."
                  }[e.target.value];
                  if (preset) setSystemPrompt(preset);
                }}
                className="w-full bg-[var(--bg-primary)] border border-[var(--accent)]/40 rounded-xl px-4 py-3 text-sm font-semibold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 appearance-none cursor-pointer hover:border-[var(--accent)] transition-all shadow-glow-lime-sm"
                defaultValue="default"
              >
                <option value="" disabled>⚡ Choose a System Prompt Preset...</option>
                <option value="coding">💻 Coding Assistant (Optimized for syntax & debugging)</option>
                <option value="writer">✍️ Creative Writer (Rich narrative & storytelling)</option>
                <option value="analyst">📊 Data Analyst (Statistical breakdowns & tabular insights)</option>
                <option value="default">🤖 General Assistant (Concise Eburon default)</option>
              </select>
            </div>

            <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] mb-1.5 mt-2">
              <span>Injected Prompt Buffer:</span>
              <button onClick={() => setSystemPrompt("You are Eburon AI, a helpful, highly accurate, and precise local AI assistant running on advanced local hardware.")} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] text-[11px] underline">Reset to Default</button>
            </div>
            <textarea 
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="w-full rounded-xl bg-[var(--bg-primary)]/90 border border-[var(--border-color)] p-3.5 text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]/60 leading-relaxed transition-all h-32 resize-none shadow-inner"
            />
          </div>

          <div className="pt-4 border-t border-[var(--border-color)] space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[var(--text-secondary)]">Temperature</span>
                <span className="text-[var(--accent)] font-bold">{temperature}</span>
              </div>
              <input 
                type="range" 
                min="0" max="2" step="0.1" 
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-[var(--accent)] bg-[var(--bg-primary)] h-1.5 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="text-xs font-bold text-[var(--text-secondary)]">Stream Response</label>
            <button 
              onClick={() => setStream(!stream)}
              className={cn(
                "relative inline-flex h-5 w-9 items-center rounded-full transition-colors shadow-sm",
                stream ? "bg-[var(--accent)]" : "bg-gray-400 dark:bg-gray-600"
              )}
            >
              <span className={cn(
                "inline-block h-3 w-3 transform rounded-full bg-white transition-transform shadow-sm",
                stream ? "translate-x-5" : "translate-x-1"
              )} />
            </button>
          </div>
        </div>

        {/* Chat Column */}
        <div className="lg:col-span-8 flex flex-col rounded-2xl border border-[var(--border-color)] bg-[var(--bg-tertiary)]/80 backdrop-blur-md overflow-hidden shadow-2xl">
          <div className="px-6 py-3.5 bg-[var(--bg-secondary)]/80 border-b border-[var(--border-color)] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)] animate-pulse"></span>
              <span className="text-xs font-mono font-semibold text-[var(--text-primary)]">Live Inference Sandbox</span>
            </div>
            <div className="flex items-center gap-2">
              {response && (
                <button 
                  onClick={() => setShowPreview(!showPreview)}
                  className={cn(
                    "p-1.5 rounded-lg border border-[var(--border-color)] transition-all flex items-center gap-1.5",
                    showPreview ? "bg-[var(--accent)]/10 text-[var(--accent)]" : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  )}
                  title={showPreview ? "Hide Preview" : "Live Preview"}
                >
                  <Layout size={14} />
                  <span className="text-[10px] font-bold uppercase hidden sm:inline">Preview</span>
                </button>
              )}
              {response && (
                <button 
                  onClick={handleCopy}
                  className="p-1.5 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--accent)] transition-all flex items-center gap-1.5"
                  title="Copy response"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
              )}
              <button 
                onClick={() => setShowCode(!showCode)}
                className={cn(
                  "p-1.5 rounded-lg border border-[var(--border-color)] transition-all flex items-center gap-1.5",
                  showCode ? "bg-[var(--accent)]/10 text-[var(--accent)]" : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                )}
                title={showCode ? "Hide raw JSON" : "Show raw JSON"}
              >
                {showCode ? <EyeOff size={14} /> : <Eye size={14} />}
                <span className="text-[10px] font-bold uppercase hidden sm:inline">JSON</span>
              </button>
              {response && (
                <div className="text-[11px] font-mono text-[var(--text-secondary)] bg-[var(--bg-tertiary)] px-2.5 py-1 rounded border border-[var(--border-color)]">
                  Output: <span className="text-[var(--accent)] font-bold">{response.length} chars</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex-1 p-6 overflow-y-auto space-y-8 font-mono text-sm custom-scrollbar">
            {!response && !loading && !rawRequest && (
              <div className="h-full flex flex-col items-center justify-center text-[var(--text-secondary)] text-sm space-y-4 opacity-50">
                <div className="w-12 h-12 rounded-xl bg-[var(--bg-tertiary)] flex items-center justify-center border border-[var(--border-color)]">
                  <span className="font-black text-[var(--text-secondary)] text-2xl">E</span>
                </div>
                <p>System initialized. Awaiting prompt...</p>
              </div>
            )}
            
            {userPrompt && (response || loading) && (
              <div className="flex gap-3 justify-end">
                <div className="p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs max-w-[80%] font-mono">
                  {userPrompt}
                </div>
              </div>
            )}

            {(response || loading) && (
              <div className="flex gap-4 items-start">
                <div className="w-7 h-7 rounded-lg bg-[var(--accent)] text-[var(--accent-fg)] font-extrabold flex items-center justify-center text-xs shrink-0 mt-0.5 shadow-glow-lime">
                  E
                </div>
                <div className="space-y-4 w-full max-w-[85%]">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[var(--text-tertiary)] uppercase font-bold">{model}</span>
                    {loading && <span className="text-[9px] text-[var(--accent)] font-mono bg-[var(--accent)]/10 px-1.5 py-0.2 rounded border border-[var(--accent)]/20 animate-pulse">Running inference...</span>}
                  </div>
                  <div className="p-3.5 rounded-xl bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] text-[var(--text-secondary)] leading-relaxed text-xs shadow-sm backdrop-blur-sm">
                    {loading && !response ? (
                      <span className="inline-block w-2 h-4 bg-[var(--accent)] animate-pulse"></span>
                    ) : (
                      <div className="whitespace-pre-wrap">{response}</div>
                    )}
                  </div>
                  
                  {showPreview && response && (
                    <div className="rounded-xl border border-[var(--border-color)] overflow-hidden bg-white shadow-2xl h-[400px] flex flex-col">
                      <div className="px-4 py-2 bg-zinc-100 border-b flex items-center justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                        <span>Live Sandbox Output</span>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-red-400"></span>
                          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        </div>
                      </div>
                      <iframe 
                        className="w-full flex-1 border-none bg-white"
                        title="Preview"
                        srcDoc={`
                          <!DOCTYPE html>
                          <html>
                            <head>
                              <style>
                                ${response.match(/<style[^>]*>([\s\S]*?)<\/style>/i)?.[1] || 
                                  response.match(/```css([\s\S]*?)```/i)?.[1] || ""}
                                body { font-family: sans-serif; padding: 20px; }
                              </style>
                            </head>
                            <body>
                              ${response.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] || 
                                response.match(/```html([\s\S]*?)```/i)?.[1] || 
                                (response.includes('```html') ? "" : response.replace(/```[\s\S]*?```/g, ""))}
                              <script>
                                ${response.match(/<script[^>]*>([\s\S]*?)<\/script>/i)?.[1] || 
                                  response.match(/```javascript([\s\S]*?)```/i)?.[1] || 
                                  response.match(/```js([\s\S]*?)```/i)?.[1] || ""}
                              </script>
                            </body>
                          </html>
                        `}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {showCode && (rawRequest || rawResponse) && (
              <div className="space-y-6 pt-4 border-t border-[var(--border-color)]">
                {rawRequest && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">JSON Request</h3>
                    </div>
                    <CodeBlock language="json" code={rawRequest} />
                  </div>
                )}
                {rawResponse && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">Response Payload</h3>
                    </div>
                    <CodeBlock language={stream ? "text" : "json"} code={rawResponse} />
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="p-4 bg-[var(--bg-secondary)] border-t border-[var(--border-color)] shrink-0">
            <div className="relative">
              <input 
                type="text"
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                placeholder="Type a prompt to test simulated response..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                disabled={loading}
                className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl pl-4 pr-24 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)] transition-all font-mono shadow-inner disabled:opacity-50"
              />
              <button 
                onClick={handleSend}
                disabled={loading || !userPrompt.trim()}
                className="absolute right-1.5 top-1.5 bottom-1.5 px-4 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-black font-extrabold text-xs transition-all flex items-center gap-2 shadow-glow-lime disabled:opacity-50 disabled:shadow-none"
              >
                <span>Send</span>
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
