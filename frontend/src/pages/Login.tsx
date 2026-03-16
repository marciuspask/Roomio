import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toggleLogin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      toggleLogin();
      navigate("/dashboard");
    }, 1000);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[400px] w-[400px] rounded-full bg-primary/5 blur-3xl" />
      </div>
      <div className="relative w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h2 className="font-heading text-2xl font-bold text-foreground">
            Roomi<span className="text-primary">o</span>
          </h2>
        </div>
        <h1 className="mb-1 text-center font-heading text-xl font-bold text-foreground">Welcome back</h1>
        <p className="mb-6 text-center text-sm text-muted-foreground">Log in to your Roomio account</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
          />
          <div className="relative">
            <input
              type={showPw ? "text" : "password"} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 pr-10 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-2.5 text-muted-foreground">
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <button type="submit" disabled={loading}
            className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-dark transition-colors disabled:opacity-50">
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <div className="my-4 flex items-center gap-3">
          <div className="flex-1 border-t border-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="flex-1 border-t border-border" />
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Don't have an account? <Link to="/register" className="font-medium text-primary">Sign up</Link>
        </p>
        <button
          onClick={() => toast({ title: "Reset link sent", description: "Check your email for a reset link." })}
          className="mt-2 block w-full text-center text-xs text-muted-foreground hover:text-foreground"
        >
          Forgot password?
        </button>
      </div>
    </div>
  );
};

export default Login;
