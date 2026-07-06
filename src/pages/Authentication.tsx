import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/src/context/AuthContext';
import { CodeBlock } from '../components/CodeBlock';
import { Eye, EyeOff, Copy, Check, LogIn } from 'lucide-react';
import { cn } from '../components/CodeBlock';

export function Authentication() {
  const apiHost = 'http://localhost:3000';
  const { user, getIdToken } = useAuth();
  const [userData, setUserData] = useState<{ apiKey: string; tokensUsed: number; tokensLimit: number; email: string } | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const token = await getIdToken();
      if (!token) return;
      const res = await fetch('/v1/auth/user', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setUserData(await res.json());
    })();
  }, [user]);

  const copyToClipboard = () => {
    if (userData?.apiKey) {
      navigator.clipboard.writeText(userData.apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-display font-bold tracking-tight">Authentication</h1>
      <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
        The Eburon AI API uses standard Bearer token authentication. All API requests must include your API key in the Authorization HTTP header.
      </p>
      
      <div className="pt-6">
        <h2 className="text-2xl font-semibold mb-4">Your API Key</h2>
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-6">
          {userData ? (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--text-primary)]">{userData.email}</label>
              <div className="relative flex items-center">
                <input 
                  type={showKey ? "text" : "password"} 
                  value={userData.apiKey} 
                  readOnly
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-md pl-3 pr-24 py-2 text-sm font-mono focus:outline-none"
                />
                <div className="absolute right-2 flex items-center gap-1">
                  <button 
                    onClick={() => setShowKey(!showKey)}
                    className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-md transition-colors"
                    title={showKey ? "Hide API Key" : "Show API Key"}
                  >
                    {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <button 
                    onClick={copyToClipboard}
                    className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-md transition-colors"
                    title="Copy API Key"
                  >
                    {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
              <p className="text-xs text-[var(--text-tertiary)]">
                {userData.tokensUsed.toLocaleString()} / {userData.tokensLimit.toLocaleString()} tokens used
              </p>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-[var(--text-secondary)] mb-3">Sign in to get your API key</p>
              <Link to="/login" className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-[var(--accent-fg)] rounded-md text-sm font-medium hover:opacity-90 transition-opacity">
                <LogIn size={16} /> Sign In
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg mt-6 mb-8">
        <p className="font-semibold text-sm mb-2 uppercase tracking-wider text-[var(--text-secondary)]">Security Note</p>
        <p className="text-sm">Never share your API keys or expose them in client-side code like frontend JavaScript. Always route requests through a secure backend server.</p>
      </div>

      <div className="pt-4">
        <h2 className="text-2xl font-semibold mb-4">Passing your API key</h2>
        <p className="text-[var(--text-secondary)] mb-4">Include the key in the Authorization header of your HTTP requests:</p>
        <CodeBlock language="http" code="Authorization: Bearer your-api-key" />
      </div>

      <div className="pt-6">
        <h2 className="text-2xl font-semibold mb-4">Local Development Mode</h2>
        <p className="text-[var(--text-secondary)] mb-4">Store your API key in an environment variable.</p>
        <CodeBlock language="bash" code='export EBURON_API_KEY="your-api-key"' />
        
        <p className="text-[var(--text-secondary)] mt-6 mb-4">Example <code>.env</code> file configuration:</p>
        <CodeBlock language="env" code={`EBURON_API_KEY=your-api-key\nEBURON_BASE_URL=${apiHost}/v1`} />
      </div>
    </div>
  );
}
