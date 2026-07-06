import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/src/context/AuthContext";
import { LogIn, Mail, Lock, Chrome } from "lucide-react";

export default function Login() {
  const { login, signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (isSignup) {
        await signup(email, password);
      } else {
        await login(email, password);
      }
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    }
  };

  const handleGoogle = async () => {
    setError("");
    try {
      await loginWithGoogle();
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Google sign-in failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img src="https://eburon.ai/icon-eburon.svg" alt="Eburon AI" className="h-12 w-12" />
          </div>
          <h1 className="text-3xl font-bold text-white">Eburon AI</h1>
          <p className="text-zinc-400 mt-2">
            {isSignup ? "Create your account" : "Sign in to your account"}
          </p>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 space-y-4">
          <button
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-700/50 transition-colors"
          >
            <Chrome className="w-5 h-5" />
            Continue with Google
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-zinc-900/50 px-2 text-zinc-500">or</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 pl-10 pr-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[var(--accent)]"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 pl-10 pr-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[var(--accent)]"
                  placeholder="••••••••"
                  minLength={6}
                  required
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-400/10 rounded-lg px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-[var(--accent)] text-[var(--accent-fg)] px-4 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <LogIn className="w-4 h-4" />
              {isSignup ? "Create Account" : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-zinc-500">
            {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              onClick={() => setIsSignup(!isSignup)}
              className="text-[var(--accent)] hover:opacity-80"
            >
              {isSignup ? "Sign in" : "Sign up"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
