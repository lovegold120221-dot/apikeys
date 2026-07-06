import React, { useState, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CodeBlock, cn } from '../components/CodeBlock';
import { CodeArtifact } from '../components/CodeArtifact';
import { useAuth } from '@/src/context/AuthContext';
import { Send, Loader2, Copy, Check, Eye, EyeOff, ShieldCheck, AlertCircle, RefreshCw, Brain, ChevronDown, ChevronUp } from 'lucide-react';

// Hidden universal directive — short and simple so small local models can follow it.
// Forces the model to end its response with a self-contained HTML block for the preview iframe.
const PREVIEW_DIRECTIVE = `You are Eburon AI. Answer the user's request, then ALWAYS end your reply with a single self-contained \`\`\`html block (with <!DOCTYPE html>, inlined CSS/JS, no external CDN). That block renders in a live preview iframe.`;

const VALIDATOR_MODEL = 'eburon-build-validator';
const MAX_REPROMPT_ATTEMPTS = 1;
const GENERATION_TIMEOUT_MS = 120_000;

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

type ValidationStatus = 'idle' | 'validating' | 'passed' | 'failed' | 'reprompting';

export function Playground() {
  const { user, getIdToken } = useAuth();
  const [publicModels, setPublicModels] = useState<string[]>(DEFAULT_MODELS);
  const [model, setModel] = useState(DEFAULT_MODELS[0]);
  const [systemPrompt, setSystemPrompt] = useState("You are Eburon AI, a helpful, highly accurate, and precise local AI assistant running on advanced local hardware.");
  const [userPrompt, setUserPrompt] = useState("");
  const [temperature, setTemperature] = useState(0.7);
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [waitingFirstToken, setWaitingFirstToken] = useState(false);
  const [response, setResponse] = useState("");
  const [rawRequest, setRawRequest] = useState("");
  const [rawResponse, setRawResponse] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [validationStatus, setValidationStatus] = useState<ValidationStatus>('idle');
  const [validationFeedback, setValidationFeedback] = useState("");
  const [attempt, setAttempt] = useState(0);

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

  // --- Core API call helper (streaming by default) ---
  const callModel = async (
    targetModel: string,
    messages: any[],
    temp: number,
    onChunk?: (full: string) => void,
    onFirstToken?: () => void,
    timeoutMs: number = GENERATION_TIMEOUT_MS
  ): Promise<string> => {
    const ctrl = new AbortController();
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      ctrl.abort();
    }, timeoutMs);
    try {
      const res = await fetch("/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({ model: targetModel, messages, temperature: temp, stream: true }),
        signal: ctrl.signal,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `HTTP ${res.status}`);
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let full = "";
      let reasoning = "";
      let firstSeen = false;

      if (!reader) return full;

      let buffer = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6);
          if (payload === "[DONE]") continue;
          try {
            const data = JSON.parse(payload);
            const choice = data.choices?.[0];
            if (!choice) continue;
            const delta = choice.delta?.content || "";
            const reasoningDelta = choice.delta?.reasoning || "";
            // Some models emit reasoning/thinking tokens before content.
            // Capture them so the laser stops and the UI shows progress.
            if (reasoningDelta) {
              if (!firstSeen) {
                firstSeen = true;
                onFirstToken?.();
              }
              reasoning += reasoningDelta;
              // Surface reasoning live as "thinking" prefix so the user sees activity
              onChunk?.(`\n> ${reasoning.split("\n").join("\n> ")}\n\n*(generating…)*\n`);
            }
            if (delta) {
              if (!firstSeen) {
                firstSeen = true;
                onFirstToken?.();
              }
              // First real content — reset the reasoning display, start the real output
              if (!full) {
                full = reasoning ? `\n<details>\n<summary>💭 Reasoning</summary>\n\n${reasoning}\n\n</details>\n\n` : "";
              }
              full += delta;
              onChunk?.(full);
            }
          } catch {
            // partial JSON — ignore, will be completed in a later chunk
          }
        }
      }
      return full;
    } catch (e: any) {
      if (timedOut || e?.name === "AbortError") {
        throw new Error(`Generation timed out after ${timeoutMs / 1000}s. Try a smaller/faster model.`);
      }
      throw e;
    } finally {
      clearTimeout(timer);
    }
  };

  // --- Validator: asks eburon-build-validator to grade the generated output ---
  // Uses a non-streaming internal call (validator output is short).
  const callModelSync = async (targetModel: string, messages: any[], temp: number, timeoutMs: number = 60_000): Promise<string> => {
    const ctrl = new AbortController();
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      ctrl.abort();
    }, timeoutMs);
    try {
      const res = await fetch("/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({ model: targetModel, messages, temperature: temp, stream: false }),
        signal: ctrl.signal,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `HTTP ${res.status}`);
      }
      const data = await res.json();
      return data.choices?.[0]?.message?.content || "";
    } catch (e: any) {
      if (timedOut || e?.name === "AbortError") {
        throw new Error(`Validator timed out after ${timeoutMs / 1000}s.`);
      }
      throw e;
    } finally {
      clearTimeout(timer);
    }
  };

  // --- Validator: deterministic local check first, LLM only for a short note ---
  const runValidator = async (userQuery: string, generatedOutput: string): Promise<{ passed: boolean; feedback: string }> => {
    // 1) Deterministic check: does a ```html block exist and contain a DOCTYPE?
    const hasHtmlBlock = /```html\s*([\s\S]*?)```/i.test(generatedOutput);
    const hasDoctype = /<!doctype\s+html>/i.test(generatedOutput);

    if (hasHtmlBlock && hasDoctype) {
      // Passed locally — ask the LLM validator for a short, optional note (non-blocking)
      let note = "Output validated.";
      try {
        const verdict = await callModelSync(VALIDATOR_MODEL, [
          { role: "system", content: "You are a build validator. Reply in one short sentence." },
          { role: "user", content: `Briefly grade this HTML preview in one sentence. Say PASS or FAIL first.\n\n${generatedOutput.slice(-1500)}` }
        ], 0.2, 15_000);
        const t = verdict.trim();
        if (t) note = t;
      } catch { /* ignore — local check already passed */ }
      return { passed: true, feedback: note };
    }

    // 2) Failed locally — build a precise fix instruction (no LLM round-trip needed)
    const missing = [
      !hasHtmlBlock && "no \`\`\`html block found",
      !hasDoctype && "missing <!DOCTYPE html>",
    ].filter(Boolean).join("; ");
    return {
      passed: false,
      feedback: `Output is missing required elements: ${missing}. Re-do and end with a complete \`\`\`html block including <!DOCTYPE html>.`,
    };
  };

  const handleSend = async () => {
    if (!userPrompt.trim()) return;
    if (!apiKey) {
      setResponse("Error: Sign in to get an API key before sending requests.");
      return;
    }

    setLoading(true);
    setWaitingFirstToken(false);
    setResponse("");
    setRawResponse("");
    setValidationStatus('idle');
    setValidationFeedback("");
    setAttempt(0);

    // Hidden directive always prepended — invisible to the user.
    const systemContent = PREVIEW_DIRECTIVE + (systemPrompt ? "\n\nADDITIONAL CONTEXT FROM USER:\n" + systemPrompt : "");

    const requestLog: any[] = [];

    try {
      let currentOutput = "";
      let attemptNum = 0;

      for (attemptNum = 0; attemptNum <= MAX_REPROMPT_ATTEMPTS; attemptNum++) {
        setAttempt(attemptNum);

        // Build messages for this attempt
        const messages: any[] = [
          { role: "system", content: systemContent },
          { role: "user", content: userPrompt }
        ];

        if (attemptNum > 0 && validationFeedback) {
          // Reprompt with validator feedback attached
          messages.push({
            role: "user",
            content: `Your previous reply was missing: ${validationFeedback}. Re-do your answer and end with a complete \`\`\`html block.`
          });
          setValidationStatus('reprompting');
        }

        // Generate (streaming)
        setValidationStatus(attemptNum === 0 ? 'idle' : 'reprompting');
        setWaitingFirstToken(true);
        setResponse("");
        currentOutput = await callModel(
          model,
          messages,
          temperature,
          (full) => setResponse(full),
          () => setWaitingFirstToken(false)
        );
        setWaitingFirstToken(false);
        setResponse(currentOutput);
        setRawResponse(JSON.stringify({
          model,
          attempt: attemptNum,
          messages: messages.map(m => ({ role: m.role, content: m.content.substring(0, 200) + "..." }))
        }, null, 2));
        requestLog.push({ model, attempt: attemptNum, messages });

        // Validate
        setValidationStatus('validating');
        const verdict = await runValidator(userPrompt, currentOutput);
        setValidationFeedback(verdict.feedback);

        if (verdict.passed) {
          setValidationStatus('passed');
          break;
        } else {
          setValidationStatus('failed');
          if (attemptNum >= MAX_REPROMPT_ATTEMPTS) {
            // Keep last output even if validation failed on final attempt
            break;
          }
          // Loop will reprompt with feedback
        }
      }

      setRawRequest(JSON.stringify({ model, attempts: attemptNum + 1, systemDirective: "[hidden — preview-first]", userPrompt }, null, 2));
    } catch (e: any) {
      setResponse(`Error: ${e.message}`);
      setValidationStatus('idle');
      setWaitingFirstToken(false);
    } finally {
      setLoading(false);
      setWaitingFirstToken(false);
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

          <div className="pt-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-tertiary)]/50 p-3 space-y-1.5">
            <div className="flex items-center gap-2">
              <ShieldCheck size={12} className="text-[var(--accent)]" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent)]">Build Validator</span>
            </div>
            <p className="text-[11px] text-[var(--text-tertiary)] leading-relaxed">
              Every response is auto-checked by <code className="text-[var(--accent)]">{VALIDATOR_MODEL}</code>. If it fails, the model is reprompted with the validator's feedback (up to {MAX_REPROMPT_ATTEMPTS}×).
            </p>
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
          
          {/* Laser loading bar — sweeps left→right while waiting for first stream token */}
          {waitingFirstToken && (
            <div className="h-0.5 w-full bg-[var(--bg-tertiary)] eburon-laser-loader shrink-0" />
          )}
          
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
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] text-[var(--text-tertiary)] uppercase font-bold">{model}</span>
                    {loading && (waitingFirstToken
                      ? <span className="text-[9px] text-blue-400 font-mono bg-blue-400/10 px-1.5 py-0.2 rounded border border-blue-400/20 animate-pulse">Awaiting first token…</span>
                      : <span className="text-[9px] text-[var(--accent)] font-mono bg-[var(--accent)]/10 px-1.5 py-0.2 rounded border border-[var(--accent)]/20 animate-pulse">Streaming…</span>
                    )}
                    {attempt > 0 && (validationStatus === 'reprompting' || validationStatus === 'validating') && (
                      <span className="text-[9px] text-amber-500 font-mono bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20 animate-pulse">
                        <RefreshCw size={9} className="inline mr-1" />Reprompt #{attempt}
                      </span>
                    )}
                    {validationStatus === 'validating' && (
                      <span className="text-[9px] text-blue-400 font-mono bg-blue-400/10 px-1.5 py-0.2 rounded border border-blue-400/20 animate-pulse flex items-center gap-1">
                        <ShieldCheck size={9} />Validating...
                      </span>
                    )}
                    {validationStatus === 'passed' && (
                      <span className="text-[9px] text-emerald-500 font-mono bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20 flex items-center gap-1">
                        <ShieldCheck size={9} />Validator: PASS
                      </span>
                    )}
                    {validationStatus === 'failed' && (
                      <span className="text-[9px] text-red-500 font-mono bg-red-500/10 px-1.5 py-0.2 rounded border border-red-500/20 flex items-center gap-1">
                        <AlertCircle size={9} />Validator: FAIL
                      </span>
                    )}
                  </div>
                  <div className="p-4 rounded-xl bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] text-[var(--text-secondary)] leading-relaxed text-sm shadow-sm backdrop-blur-sm">
                    {loading && (waitingFirstToken || !response) ? (
                      <span className="inline-block w-2 h-4 bg-[var(--accent)] animate-pulse"></span>
                    ) : (
                      <MarkdownResponse text={response} streaming={loading} />
                    )}
                  </div>
                  
                  {validationFeedback && (validationStatus === 'passed' || validationStatus === 'failed') && (
                    <div className={cn(
                      "p-2.5 rounded-lg border text-[11px] font-mono leading-relaxed",
                      validationStatus === 'passed'
                        ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-500"
                        : "bg-red-500/5 border-red-500/20 text-red-500"
                    )}>
                      <span className="font-bold uppercase tracking-wider text-[9px] block mb-1">Build Validator</span>
                      {validationFeedback}
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
                    <CodeBlock language="json" code={rawResponse} />
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
                placeholder="Describe what to build — a dashboard, chart, landing page, calculator, game..."
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

// --- Markdown response renderer ---
// Renders the model's markdown response. HTML code blocks become interactive
// CodeArtifact cards (with Preview/Download/Copy/Collapse). All other code blocks
// get syntax highlighting. A collapsible "Thoughts" panel shows the pre-html text.
function MarkdownResponse({ text, streaming }: { text: string; streaming: boolean }) {
  // Split the response into "thoughts" (everything before the first ```html block)
  // and the html artifact itself.
  const htmlBlockMatch = text.match(/```html\s*([\s\S]*?)```/i);
  const hasHtmlBlock = !!htmlBlockMatch;
  const thoughtsText = hasHtmlBlock ? text.slice(0, htmlBlockMatch!.index) : text;
  const htmlCode = hasHtmlBlock ? htmlBlockMatch![1].trim() : "";
  const afterHtml = hasHtmlBlock ? text.slice((htmlBlockMatch!.index || 0) + htmlBlockMatch![0].length) : "";

  const [thoughtsOpen, setThoughtsOpen] = useState(false);

  return (
    <div className="space-y-3">
      {/* Thoughts panel (collapsible) — shows the model's reasoning before the artifact */}
      {thoughtsText.trim() && (
        <div className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-tertiary)]/40 overflow-hidden">
          <button
            onClick={() => setThoughtsOpen(!thoughtsOpen)}
            className="w-full flex items-center justify-between px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
          >
            <span className="flex items-center gap-2">
              <Brain size={12} className="text-[var(--accent)]" />
              Thoughts
            </span>
            {thoughtsOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {thoughtsOpen && (
            <div className="px-4 pb-4 pt-1 text-[13px] leading-relaxed text-[var(--text-secondary)] prose-sm max-w-none">
              <MarkdownText text={thoughtsText} />
            </div>
          )}
        </div>
      )}

      {/* HTML Artifact card */}
      {hasHtmlBlock && (
        <CodeArtifact code={htmlCode} language="html" />
      )}

      {/* Any text after the html block */}
      {afterHtml.trim() && (
        <div className="text-[13px] leading-relaxed text-[var(--text-secondary)] prose-sm max-w-none">
          <MarkdownText text={afterHtml} />
        </div>
      )}

      {/* Streaming cursor */}
      {streaming && (
        <span className="inline-block w-1.5 h-3.5 bg-[var(--accent)] animate-pulse align-middle" />
      )}
    </div>
  );
}

// Renders markdown text (non-html code blocks get syntax highlighting, rest is markdown)
function MarkdownText({ text }: { text: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ node, className, children, ...props }: any) {
          const match = /language-(\w+)/.exec(className || "");
          const lang = match ? match[1] : "";
          const codeStr = String(children).replace(/\n$/, "");
          // HTML blocks are already handled by CodeArtifact above; skip them here
          if (lang === 'html') return <code className={className} {...props}>{children}</code>;
          if (!match) return <code className="px-1.5 py-0.5 rounded bg-[var(--bg-tertiary)] text-[var(--accent)] font-mono text-xs" {...props}>{children}</code>;
          return (
            <div className="rounded-lg overflow-hidden border border-slate-800 bg-[#161b22] my-3">
              <div className="px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                {lang}
              </div>
              <div className="p-3 overflow-x-auto text-xs">
                <SyntaxHighlighter
                  language={lang}
                  style={vscDarkPlus}
                  customStyle={{ margin: 0, padding: 0, background: 'transparent' }}
                  codeTagProps={{ style: { fontFamily: 'var(--font-mono)' } }}
                >
                  {codeStr}
                </SyntaxHighlighter>
              </div>
            </div>
          );
        },
        p({ children }: any) { return <p className="my-2 leading-relaxed">{children}</p>; },
        ul({ children }: any) { return <ul className="list-disc list-inside my-2 space-y-1">{children}</ul>; },
        ol({ children }: any) { return <ol className="list-decimal list-inside my-2 space-y-1">{children}</ol>; },
        h1({ children }: any) { return <h1 className="text-lg font-bold my-3 text-[var(--text-primary)]">{children}</h1>; },
        h2({ children }: any) { return <h2 className="text-base font-bold my-2 text-[var(--text-primary)]">{children}</h2>; },
        h3({ children }: any) { return <h3 className="text-sm font-bold my-2 text-[var(--text-primary)]">{children}</h3>; },
        a({ href, children }: any) { return <a href={href} className="text-[var(--accent)] underline" target="_blank" rel="noreferrer">{children}</a>; },
        strong({ children }: any) { return <strong className="font-bold text-[var(--text-primary)]">{children}</strong>; },
        blockquote({ children }: any) { return <blockquote className="border-l-2 border-[var(--accent)]/40 pl-3 my-2 italic text-[var(--text-tertiary)]">{children}</blockquote>; },
      }}
    >
      {text}
    </ReactMarkdown>
  );
}
