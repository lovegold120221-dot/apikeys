import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink, useLocation, Navigate } from 'react-router-dom';
import { Moon, Sun, Menu, X, Terminal, Book, Box, Code2, Zap, Server, Languages, Search, FileText, Image as ImageIcon, User } from 'lucide-react';
import { cn } from './components/CodeBlock';
import { useAuth } from './context/AuthContext';
import { Overview } from './pages/Overview';
import { Authentication } from './pages/Authentication';
import { Models } from './pages/Models';
import { ChatCompletions } from './pages/ChatCompletions';
import { Streaming } from './pages/Streaming';
import { Embeddings } from './pages/Embeddings';
import { Playground } from './pages/Playground';
import { CodeExamples } from './pages/CodeExamples';
import { Errors } from './pages/Errors';
import { Deployment } from './pages/Deployment';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { Thinking } from './pages/capabilities/Thinking';
import { StructuredOutputs } from './pages/capabilities/StructuredOutputs';
import { Vision } from './pages/capabilities/Vision';
import { ToolCalling } from './pages/capabilities/ToolCalling';
import { WebSearch } from './pages/capabilities/WebSearch';

// Translation Pages
import { TranslationOverview } from './pages/translation/TranslationOverview';
import { TranslationText } from './pages/translation/TranslationText';
import { TranslationImages } from './pages/translation/TranslationImages';
import { TranslationDetection } from './pages/translation/TranslationDetection';
import { SupportedLanguages } from './pages/translation/SupportedLanguages';
import { TranslationPlayground } from './pages/translation/TranslationPlayground';

const documentationItems = [
  { path: '/overview', label: 'Overview', icon: Book },
  { path: '/dashboard', label: 'Dashboard', icon: User },
  { path: '/models', label: 'Models', icon: Box },
  { path: '/examples', label: 'Code Examples', icon: Code2 },
  { path: '/errors', label: 'Errors', icon: Server },
  { path: '/deployment', label: 'Local Deployment', icon: Server },
];

const apiReferenceItems = [
  { path: '/chat', label: 'Chat Completions', icon: Terminal },
  { path: '/embeddings', label: 'Embeddings', icon: Box },
];

const translationItems = [
  { path: '/docs/translation/overview', label: 'Overview', icon: Languages },
  { path: '/docs/translation/text', label: 'Text Translation', icon: FileText },
  { path: '/docs/translation/images', label: 'Image Translation', icon: ImageIcon },
  { path: '/docs/translation/language-detection', label: 'Language Detection', icon: Search },
  { path: '/docs/translation/supported-languages', label: 'Supported Languages', icon: Languages },
];

const capabilitiesItems = [
  { path: '/streaming', label: 'Streaming', icon: Zap },
  { path: '/thinking', label: 'Thinking', icon: Zap },
  { path: '/structured-outputs', label: 'Structured Outputs', icon: Code2 },
  { path: '/vision', label: 'Vision', icon: Box },
  { path: '/tool-calling', label: 'Tool Calling', icon: Code2 },
  { path: '/web-search', label: 'Web Search', icon: Book },
];

const playgroundItems = [
  { path: '/playground', label: 'Chat Playground', icon: Code2 },
  { path: '/playground/translation', label: 'Translate Playground', icon: Languages },
];

export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  if (location.pathname === "/login") {
    return <Login />;
  }

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row transition-colors duration-200">
      {/* Ambient Glow Effects */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[300px] bg-[var(--accent)]/10 blur-[140px] pointer-events-none rounded-full -z-10"></div>
      <div className="fixed top-1/3 right-10 w-[400px] h-[400px] bg-[var(--bg-tertiary)] blur-[120px] pointer-events-none rounded-full -z-10"></div>

      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-[var(--border-color)] bg-[var(--bg-primary)] sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center p-1 shadow-glow-lime">
            <img src="https://eburon.ai/icon-eburon.svg" alt="Eburon AI Logo" className="w-full h-full object-contain" onError={(e) => { e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling!.classList.remove('hidden'); }} />
            <span className="hidden font-black text-[var(--accent)] text-lg">E</span>
          </div>
          <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[var(--text-primary)] via-[var(--text-primary)] to-[var(--text-secondary)]">Eburon AI</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-md hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-md hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside className={cn(
        "fixed md:sticky top-0 left-0 z-10 h-screen w-64 border-r border-[var(--border-color)] bg-[var(--bg-secondary)]/50 backdrop-blur-sm transition-transform duration-300 ease-in-out flex flex-col flex-shrink-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="hidden md:flex items-center gap-3 p-6 border-b border-[var(--border-color)] font-display font-bold text-xl tracking-tight">
          <div className="w-9 h-9 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center p-1.5 shadow-glow-lime group-hover:scale-105 transition-transform">
            <img src="https://eburon.ai/icon-eburon.svg" alt="Eburon AI Logo" className="w-full h-full object-contain" onError={(e) => { e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling!.classList.remove('hidden'); }} />
            <span className="hidden font-black text-[var(--accent)] text-lg">E</span>
          </div>
          <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[var(--text-primary)] via-[var(--text-primary)] to-[var(--text-secondary)]">Eburon AI</span>
        </div>
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          <div>
            <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-3 px-3">Documentation</p>
            <ul className="space-y-1">
              {documentationItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) => cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
                      isActive 
                        ? "bg-gradient-to-r from-[var(--accent)] to-[var(--color-lime-500)] text-[var(--accent-fg)] font-semibold shadow-glow-lime" 
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] border border-transparent font-medium"
                    )}
                  >
                    <item.icon size={16} />
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-3 px-3">API Reference</p>
            <ul className="space-y-1">
              {apiReferenceItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) => cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
                      isActive 
                        ? "bg-gradient-to-r from-[var(--accent)] to-[var(--color-lime-500)] text-[var(--accent-fg)] font-semibold shadow-glow-lime" 
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] border border-transparent font-medium"
                    )}
                  >
                    <item.icon size={16} />
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-3 px-3">Eburon Translate</p>
            <ul className="space-y-1">
              {translationItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) => cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
                      isActive 
                        ? "bg-gradient-to-r from-[var(--accent)] to-[var(--color-lime-500)] text-[var(--accent-fg)] font-semibold shadow-glow-lime" 
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] border border-transparent font-medium"
                    )}
                  >
                    <item.icon size={16} />
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-3 px-3">Capabilities</p>
            <ul className="space-y-1">
              {capabilitiesItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) => cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
                      isActive 
                        ? "bg-gradient-to-r from-[var(--accent)] to-[var(--color-lime-500)] text-[var(--accent-fg)] font-semibold shadow-glow-lime" 
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] border border-transparent font-medium"
                    )}
                  >
                    <item.icon size={16} />
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-3 px-3">Interactive</p>
            <ul className="space-y-1">
              {playgroundItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) => cn(
                      "flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all",
                      isActive 
                        ? "bg-gradient-to-r from-[var(--accent)] to-[var(--color-lime-500)] text-[var(--accent-fg)] font-semibold shadow-glow-lime" 
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] border border-transparent font-medium"
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <item.icon size={16} />
                      {item.label}
                    </span>
                    <span className={cn(
                      "text-[10px] font-mono px-1.5 py-0.5 rounded",
                      "bg-[var(--bg-tertiary)] text-[var(--accent)]"
                    )}>Interactive</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="p-4 border-t border-[var(--border-color)] space-y-3 bg-[var(--bg-primary)]/40">
          <div className="p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--accent)]"></span>
              </span>
              <span className="text-xs font-semibold text-[var(--text-primary)]">Local Runtime</span>
            </div>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">Active</span>
          </div>
           <button 
             onClick={() => setDarkMode(!darkMode)} 
             className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] border border-transparent hover:border-[var(--border-color)] transition-all"
           >
             <span className="flex items-center gap-2.5">
               {darkMode ? <Sun size={16} className="text-[var(--text-secondary)]" /> : <Moon size={16} className="text-[var(--text-secondary)]" />}
               {darkMode ? 'Light Mode' : 'Dark Mode'}
             </span>
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-transparent overflow-hidden h-screen">
        <header className="h-14 border-b border-[var(--border-color)] flex items-center justify-between px-8 bg-[var(--bg-primary)]/40 backdrop-blur-md sticky top-0 z-10 hidden md:flex">
          <div className="flex items-center gap-4 text-xs font-mono text-[var(--text-secondary)]">
             <span className="hover:text-[var(--text-primary)] transition-colors cursor-pointer">API</span>
             <span className="text-[var(--text-tertiary)]">/</span>
             <span className="text-[var(--accent)] bg-[var(--accent)]/10 px-2 py-0.5 rounded border border-[var(--accent)]/20">v1/chat/completions</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex p-1 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs font-medium">
              <button className="px-3 py-1 rounded-md bg-[var(--bg-tertiary)] text-[var(--text-primary)] shadow-sm font-semibold transition-all">Docs</button>
              <button className="px-3 py-1 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all flex items-center gap-1.5">
                <span>Playground</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse"></span>
              </button>
            </div>
          </div>
        </header>

        <div className={cn(
          "flex-1 overflow-y-auto scroll-smooth custom-scrollbar",
          location.pathname === '/playground' && "overflow-hidden flex flex-col"
        )}>
          <div className={cn(
            "mx-auto px-6 py-8 md:px-10 lg:py-12",
            location.pathname === '/playground' ? "max-w-none w-full flex-1 p-6" : "max-w-4xl"
          )}>
            <Routes>
              <Route path="/" element={<Navigate to="/overview" replace />} />
              <Route path="/overview" element={<Overview />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/authentication" element={<Authentication />} />
              <Route path="/models" element={<Models />} />
              <Route path="/chat" element={<ChatCompletions />} />
              <Route path="/streaming" element={<Streaming />} />
              <Route path="/embeddings" element={<Embeddings />} />
              <Route path="/playground" element={<Playground />} />
              <Route path="/examples" element={<CodeExamples />} />
              <Route path="/errors" element={<Errors />} />
              <Route path="/deployment" element={<Deployment />} />
              <Route path="/thinking" element={<Thinking />} />
              <Route path="/structured-outputs" element={<StructuredOutputs />} />
              <Route path="/vision" element={<Vision />} />
              <Route path="/tool-calling" element={<ToolCalling />} />
              <Route path="/web-search" element={<WebSearch />} />

              {/* Translation Routes */}
              <Route path="/docs/translation/overview" element={<TranslationOverview />} />
              <Route path="/docs/translation/text" element={<TranslationText />} />
              <Route path="/docs/translation/images" element={<TranslationImages />} />
              <Route path="/docs/translation/language-detection" element={<TranslationDetection />} />
              <Route path="/docs/translation/supported-languages" element={<SupportedLanguages />} />
              <Route path="/playground/translation" element={<TranslationPlayground />} />
            </Routes>
          </div>
        </div>
      </main>
    </div>
  );
}
