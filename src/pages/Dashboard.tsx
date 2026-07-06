import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/src/context/AuthContext";
import { Key, LogOut, Copy, Check, Database, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface UserData {
  apiKey: string;
  tokensUsed: number;
  tokensLimit: number;
  email: string;
}

export default function Dashboard() {
  const { user, logout, getIdToken } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchUserData();
  }, [user]);

  const fetchUserData = async () => {
    const token = await getIdToken();
    if (!token) return;
    try {
      const res = await fetch("/v1/auth/user", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const d = await res.json();
        setData(d);
      }
    } catch (e) {
      console.error("Failed to fetch user data");
    } finally {
      setLoading(false);
    }
  };

  const copyKey = () => {
    if (!data?.apiKey) return;
    navigator.clipboard.writeText(data.apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const pct = data ? Math.round((data.tokensUsed / data.tokensLimit) * 100) : 0;
  const remaining = data ? data.tokensLimit - data.tokensUsed : 0;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link to="/overview" className="text-zinc-500 hover:text-zinc-300 text-sm flex items-center gap-1 mb-2">
              <ArrowLeft className="w-3 h-3" /> Back to docs
            </Link>
            <h1 className="text-2xl font-bold">Your Dashboard</h1>
            <p className="text-zinc-400 text-sm">{data?.email || user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Key className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-semibold">API Key</h2>
            </div>
            <div className="flex items-center gap-2 bg-black rounded-lg border border-zinc-800 p-3">
              <code className="flex-1 text-sm text-zinc-300 font-mono truncate">
                {data?.apiKey || "—"}
              </code>
              <button
                onClick={copyKey}
                className="flex items-center gap-1.5 rounded-md bg-zinc-800 px-3 py-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Database className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-semibold">Token Usage</h2>
            </div>
            <div className="flex items-baseline gap-1 mb-3">
              <span className="text-3xl font-bold">{data ? data.tokensUsed.toLocaleString() : "0"}</span>
              <span className="text-zinc-500">/ {data ? data.tokensLimit.toLocaleString() : "1,000,000"} tokens used</span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-2.5 mb-2">
              <div
                className={`h-2.5 rounded-full transition-all ${
                  pct > 90 ? "bg-red-500" : pct > 70 ? "bg-yellow-500" : "bg-emerald-500"
                }`}
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>
            <p className="text-sm text-zinc-500">
              {remaining > 0
                ? `${remaining.toLocaleString()} tokens remaining`
                : "You've reached your token limit"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
