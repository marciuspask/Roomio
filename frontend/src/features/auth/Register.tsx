import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import StepProgress from "@/components/StepProgress";
import { Mail } from "lucide-react";

const Register = () => {
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [name, setName] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [bio, setBio] = useState("");
  const [occupation, setOccupation] = useState<"student" | "working" | "other">("student");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const steps = ["Account", "Profile", "Verify"];

  const handleStep1 = () => {
    if (password !== confirmPw) { setError("Passwords don't match"); return; }
    if (password.length < 4) { setError("Password too short"); return; }
    setError("");
    setStep(1);
  };

  const handleStep2 = () => {
    if (!name.trim()) { setError("Name is required"); return; }
    setError("");
    setStep(2);
    // Auto-redirect after 2s
    setTimeout(() => {
      navigate("/dashboard");
    }, 2000);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[400px] w-[400px] rounded-full bg-primary/5 blur-3xl" />
      </div>
      <div className="relative w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-sm">
        <div className="mb-4 text-center">
          <h2 className="font-heading text-2xl font-bold text-foreground">
            Roomi<span className="text-primary">o</span>
          </h2>
        </div>

        <StepProgress steps={steps} currentStep={step} />

        {error && <p className="mb-3 rounded-lg bg-destructive/10 p-2 text-center text-xs text-destructive">{error}</p>}

        {step === 0 && (
          <div className="space-y-4">
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary" />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary" />
            <input type="password" placeholder="Confirm password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} required
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary" />
            <button onClick={handleStep1}
              className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-dark transition-colors">
              Continue →
            </button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account? <Link to="/login" className="font-medium text-primary">Log in</Link>
            </p>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <input type="text" placeholder="Full name" value={name} onChange={e => setName(e.target.value)} required
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary" />
            <select value={birthYear} onChange={e => setBirthYear(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary">
              <option value="">Birth year</option>
              {Array.from({ length: 23 }, (_, i) => 2007 - i).map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <div>
              <textarea
                placeholder="Short bio (optional)" value={bio} onChange={e => setBio(e.target.value.slice(0, 200))}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary" rows={3}
              />
              <p className="text-right text-xs text-muted-foreground">{bio.length}/200</p>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-foreground">Occupation</p>
              <div className="flex gap-2">
                {(["student", "working", "other"] as const).map(o => (
                  <button key={o} onClick={() => setOccupation(o)}
                    className={`flex-1 rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                      occupation === o ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground hover:bg-surface-elevated"
                    }`}>
                    {o}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(0)} className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium text-foreground">← Back</button>
              <button onClick={handleStep2} className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground">Continue →</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="py-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-light">
              <Mail size={28} className="text-primary" />
            </div>
            <h3 className="mb-2 font-heading text-lg font-bold text-foreground">Check your inbox</h3>
            <p className="text-sm text-muted-foreground">
              We sent a verification link to <strong>{email || "your email"}</strong>. Click it to activate your account.
            </p>
            <p className="mt-4 text-xs text-muted-foreground">
              After verifying, you'll be asked to add your phone number before messaging anyone.
            </p>
            <p className="mt-4 text-xs text-muted-foreground animate-pulse">Redirecting to dashboard...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;
