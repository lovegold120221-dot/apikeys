import React, { useState, useEffect } from 'react';
import { SUPPORTED_LANGUAGES } from '../../data/languages';
import { CodeBlock, cn } from '../../components/CodeBlock';
import { useAuth } from '@/src/context/AuthContext';
import { translateVisualImage } from '@/src/lib/translateFile';
import { 
  Languages, FileText, ImageIcon, Search, 
  Send, Loader2, Copy, Check, Eye, EyeOff, 
  Upload, RefreshCw, X, ArrowRight,
  AlertTriangle,
  Download
} from 'lucide-react';

type Tab = 'text' | 'image' | 'detect';

export function TranslationPlayground() {
  const { user, getIdToken } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('text');
  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState('en');
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [progressText, setProgressText] = useState("");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setResponse(null);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // For the generated request display
  const [rawRequest, setRawRequest] = useState("");

  const handleTranslate = async () => {
    if ((activeTab === 'text' || activeTab === 'detect') && !inputText) return;
    if (activeTab === 'image' && !selectedFile) return;

    setLoading(true);
    setResponse(null);
    setProgressText("");

    let endpoint = "";
    let body: any = {};

    try {
      switch (activeTab) {
        case 'text':
          endpoint = "/v1/translation/text";
          body = { text: inputText, target_language: targetLang, source_language: sourceLang };
          break;
        case 'detect':
          endpoint = "/v1/translation/detect-language";
          body = { text: inputText };
          break;
        case 'image': {
          const result = await translateVisualImage(selectedFile!, targetLang, (stage) => setProgressText(stage));
          body = { file: selectedFile!.name, target_language: targetLang };
          setResponse({
            object: "image_translation",
            target_language: targetLang,
            detected_language: result.detectedLanguage,
            extracted_text: result.extractedText,
            translated_text: result.translatedText,
            image_data_url: result.imageDataUrl,
          });
          break;
        }
      }

      setRawRequest(JSON.stringify({ ...body, image_data: body.image_data ? "[BASE64_DATA]" : undefined }, null, 2));

      if (endpoint) {
        const token = await getIdToken();
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": token ? `Bearer ${token}` : ""
          },
          body: JSON.stringify(body)
        });

        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await res.json();
          setResponse(data);
        } else {
          const text = await res.text();
          setResponse({ error: "Server returned non-JSON response", details: text.substring(0, 100) });
        }
      }
    } catch (err: any) {
      const msg = err?.message || String(err);
      const isNetwork = msg === "Failed to fetch";
      setResponse({
        error: isNetwork ? "Network request failed" : "Translation failed",
        details: isNetwork
          ? activeTab === 'image'
            ? "The request to the translation endpoint was blocked or dropped. This is usually an ad-blocker or network policy blocking translate.googleapis.com, or the API server is unreachable. Ensure the server is running (npm run dev) and that browser extensions aren't blocking the request."
            : "The API server is not running or a browser extension blocked the request. Start it with: npm run dev"
          : msg,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!response) return;
    const text = response.translation || response.detected_language || response.translated_text || response.translated_url || "";
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-[calc(100vh-6rem)] min-h-0 flex flex-col playground-panel">
      {/* Tab Navigation */}
      <div className="flex border-b border-[var(--border-color)] mb-6 overflow-x-auto no-scrollbar">
        {[
          { id: 'text', label: 'Text', icon: FileText },
          { id: 'image', label: 'Image', icon: ImageIcon },
          { id: 'detect', label: 'Detect', icon: Search },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id as Tab); setResponse(null); }}
            className={cn(
              "px-6 py-4 flex items-center gap-2 text-sm font-semibold transition-all border-b-2 whitespace-nowrap",
              activeTab === tab.id 
                ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent)]/5" 
                : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
            )}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full min-h-0">
        {/* Left Panel: Input & Controls */}
        <div className="lg:col-span-5 flex flex-col gap-6 p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)]/80 backdrop-blur-md shadow-xl overflow-y-auto custom-scrollbar">
          
          {/* Language Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">Source Language</label>
              <select 
                value={sourceLang}
                onChange={(e) => setSourceLang(e.target.value)}
                disabled={activeTab === 'detect'}
                className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-all shadow-sm disabled:opacity-50"
              >
                <option value="auto">Auto Detect</option>
                {SUPPORTED_LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">Target Language</label>
              <select 
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                disabled={activeTab === 'detect'}
                className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-all shadow-sm disabled:opacity-50"
              >
                {SUPPORTED_LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Dynamic Input based on Tab */}
          <div className="flex-1 flex flex-col gap-4">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">
              {activeTab === 'image' ? 'Upload Image' : 'Input Text'}
            </label>
            
            {activeTab === 'text' || activeTab === 'detect' ? (
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={activeTab === 'text' ? "Enter text to translate..." : "Enter text to detect language..."}
                className="w-full flex-1 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] p-4 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)] leading-relaxed transition-all resize-none shadow-inner"
              />
            ) : (
              <div 
                onClick={handleUploadClick}
                className={cn(
                  "flex-1 border-2 border-dashed border-[var(--border-color)] rounded-2xl flex flex-col items-center justify-center p-8 text-center space-y-4 hover:border-[var(--accent)]/50 transition-colors group cursor-pointer overflow-hidden relative",
                  previewUrl ? "bg-transparent" : "bg-[var(--bg-tertiary)]/30"
                )}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*"
                  className="hidden"
                />
                
                {previewUrl && activeTab === 'image' ? (
                  <div className="absolute inset-0 w-full h-full">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-contain opacity-50 group-hover:opacity-70 transition-opacity" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                       <RefreshCw className="text-white mb-2" />
                       <p className="text-white text-xs font-bold uppercase tracking-widest">Change Image</p>
                    </div>
                  </div>
                ) : selectedFile ? (
                  <div className="space-y-4">
                    <div className="w-16 h-16 rounded-full bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
                      <FileText size={32} />
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold text-[var(--text-primary)]">{selectedFile.name}</p>
                      <p className="text-xs text-[var(--text-tertiary)]">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button className="px-4 py-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all">Change File</button>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] group-hover:scale-110 transition-transform">
                      <Upload size={32} />
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold text-[var(--text-primary)]">Click to upload or drag and drop</p>
                      <p className="text-xs text-[var(--text-tertiary)]">
                        {activeTab === 'image' ? 'JPEG, PNG, WEBP up to 10MB' : 'PDF, DOCX, TXT up to 30MB'}
                      </p>
                    </div>
                    <button className="px-4 py-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all">Select File</button>
                  </>
                )}
              </div>
            )}
          </div>

          <button 
            onClick={handleTranslate}
            disabled={loading}
            className="w-full py-4 rounded-xl bg-[var(--accent)] text-[var(--accent-fg)] font-bold shadow-glow-lime hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
            <span>{activeTab === 'detect' ? 'Detect Language' : 'Translate Content'}</span>
          </button>


        </div>

        {/* Right Panel: Output & JSON */}
        <div className="lg:col-span-7 flex flex-col rounded-2xl border border-[var(--border-color)] bg-[var(--bg-tertiary)]/80 backdrop-blur-md overflow-hidden shadow-2xl">
          <div className="px-6 py-4 bg-[var(--bg-secondary)]/80 border-b border-[var(--border-color)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)] animate-pulse"></span>
              <span className="text-xs font-mono font-semibold text-[var(--text-primary)] uppercase tracking-widest">Eburon Translate Output</span>
            </div>
            <div className="flex items-center gap-2">
              {response && (
                <button 
                  onClick={handleCopy}
                  className="p-1.5 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
                  title="Copy result"
                >
                  {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
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
            </div>
          </div>

          <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
            {!response && !loading && (
              <div className="h-full flex flex-col items-center justify-center text-[var(--text-tertiary)] space-y-6 opacity-30">
                <Languages size={80} strokeWidth={1} />
                <p className="text-sm font-medium">Ready to translate your content</p>
              </div>
            )}

            {loading && (
              <div className="h-full flex flex-col items-center justify-center space-y-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-[var(--accent)]/10 border-t-[var(--accent)] animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-[var(--accent)]">
                    <RefreshCw size={24} className="animate-spin-slow" />
                  </div>
                </div>
                <p className="text-sm font-mono text-[var(--accent)] animate-pulse uppercase tracking-widest">{progressText || "Analyzing content..."}</p>
              </div>
            )}

            {response && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {response.error ? (
                  /* Visual Error Card */
                  <div className="p-8 rounded-2xl bg-red-500/5 border border-red-500/20 shadow-sm backdrop-blur-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-red-500">
                      <AlertTriangle size={64} />
                    </div>
                    <div className="relative z-10 space-y-6">
                      <div className="flex items-center gap-3 text-red-500">
                        <AlertTriangle size={24} />
                        <span className="text-sm font-bold uppercase tracking-widest">{typeof response.error === 'string' ? response.error : response.error?.message || 'API Error'}</span>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Error Details</p>
                        <p className="text-sm text-[var(--text-secondary)] font-mono leading-relaxed bg-[var(--bg-secondary)]/50 p-4 rounded-xl border border-[var(--border-color)] overflow-x-auto">
                          {response.details || "An unexpected API error occurred."}
                        </p>
                      </div>

                      {response.isQuotaError && (
                        <div className="p-5 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-3">
                          <p className="text-xs font-bold text-amber-500 uppercase tracking-wider flex items-center gap-2">
                            <span>Tip</span>
                          </p>
                          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                            The translation API quota has been exceeded. Wait a moment and try again.
                          </p>
                          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                            Try again later or use a different text.
                          </p>
                        </div>
                      )}

                      <div className="pt-6 border-t border-[var(--border-color)]">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                          <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Translation Halted</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Visual Result Card */
                  <div className="p-8 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-sm backdrop-blur-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Languages size={64} />
                    </div>
                    <div className="relative z-10 space-y-6">
                      <div className="flex items-center gap-4">
                         <div className="px-3 py-1 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[var(--accent)] text-[10px] font-bold uppercase tracking-wider">
                           {response.detected_language || response.source_language || 'Auto'}
                         </div>
                         <ArrowRight size={16} className="text-[var(--text-tertiary)]" />
                         <div className="px-3 py-1 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[var(--accent)] text-[10px] font-bold uppercase tracking-wider">
                           {response.target_language || targetLang}
                         </div>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Result</p>
                        {response.image_data_url ? (
                          <div className="space-y-4">
                            <img src={response.image_data_url} alt="Translated" className="w-full max-h-[24rem] object-contain rounded-xl border border-[var(--border-color)] bg-[var(--bg-tertiary)]" />
                            <a href={response.image_data_url} download={`Translated_${selectedFile?.name?.replace(/\.[^.]+$/, "") || "image"}.jpg`} className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] text-[var(--accent-fg)] px-4 py-2 text-sm font-bold hover:opacity-90 transition-opacity">
                              <Download size={16} /> Download Image
                            </a>
                          </div>
                        ) : (
                          <div className="text-xl font-medium text-[var(--text-primary)] leading-relaxed max-h-96 overflow-y-auto custom-scrollbar">
                            {response.translation || response.detected_language || response.translated_text || ""}
                          </div>
                        )}
                      </div>

                      <div className="pt-6 border-t border-[var(--border-color)] flex items-center justify-between">
                         <div className="flex items-center gap-2">
                           <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                           <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">Translation Complete</span>
                         </div>
                         <span className="text-[10px] font-mono text-[var(--text-tertiary)]">ID: {response.id || 'eburon-tra-8x2'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {showCode && (
                  <div className="space-y-6 animate-in zoom-in-95 duration-300">
                    <div className="space-y-2">
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">API Request Payload</h3>
                      <CodeBlock language="json" code={rawRequest} />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">API Response Object</h3>
                      <CodeBlock language="json" code={JSON.stringify(response, null, 2)} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="p-6 bg-[var(--bg-secondary)] border-t border-[var(--border-color)] text-center">
            <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-[0.2em] font-bold">Powered by Eburon Neural Engine v4.2</p>
          </div>
        </div>
      </div>
    </div>
  );
}
