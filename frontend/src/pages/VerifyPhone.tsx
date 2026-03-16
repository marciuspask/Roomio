import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Check } from "lucide-react";

const VerifyPhone = () => {
  const [phase, setPhase] = useState<"input" | "code" | "success">("input");
  const [countryCode, setCountryCode] = useState("+370");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { setPhoneVerified } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (resendCooldown > 0) {
      const t = setTimeout(() => setResendCooldown(c => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendCooldown]);

  const handleSendCode = () => {
    setPhase("code");
    setResendCooldown(60);
  };

  const handleCodeChange = (i: number, val: string) => {
    if (val.length > 1) val = val[val.length - 1];
    const newCode = [...code];
    newCode[i] = val;
    setCode(newCode);
    if (val && i < 5) inputRefs.current[i + 1]?.focus();
    if (newCode.every(d => d !== "")) {
      setTimeout(() => {
        setPhase("success");
        setPhoneVerified(true);
        setTimeout(() => navigate("/dashboard"), 1500);
      }, 1000);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-sm">
        {phase === "input" && (
          <>
            <h1 className="mb-1 text-center font-heading text-xl font-bold text-foreground">Add your phone number</h1>
            <p className="mb-6 text-center text-sm text-muted-foreground">Verified users get more replies. Your number is never shared publicly.</p>
            <div className="mb-4 flex gap-2">
              <select value={countryCode} onChange={e => setCountryCode(e.target.value)}
                className="w-28 rounded-lg border border-border bg-background px-2 py-2.5 text-sm">
                <option value="+370">🇱🇹 +370</option>
                <option value="+49">🇩🇪 +49</option>
                <option value="+1">🌍 Other</option>
              </select>
              <input type="tel" placeholder="Phone number" value={phone} onChange={e => setPhone(e.target.value)}
                className="flex-1 rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary" />
            </div>
            <button onClick={handleSendCode}
              className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-dark transition-colors">
              Send code
            </button>
            <button onClick={() => navigate("/dashboard")} className="mt-3 block w-full text-center text-xs text-muted-foreground hover:text-foreground">
              Skip for now
            </button>
          </>
        )}

        {phase === "code" && (
          <>
            <h1 className="mb-1 text-center font-heading text-xl font-bold text-foreground">Enter verification code</h1>
            <p className="mb-6 text-center text-sm text-muted-foreground">Enter the 6-digit code sent to {countryCode} {phone}</p>
            <div className="mb-4 flex justify-center gap-2">
              {code.map((d, i) => (
                <input
                  key={i}
                  ref={el => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={e => handleCodeChange(i, e.target.value)}
                  className="h-12 w-10 rounded-lg border border-border bg-background text-center text-lg font-bold focus:border-primary focus:ring-1 focus:ring-primary"
                />
              ))}
            </div>
            <button disabled={resendCooldown > 0}
              onClick={() => setResendCooldown(60)}
              className="block w-full text-center text-xs text-muted-foreground hover:text-foreground disabled:opacity-50">
              {resendCooldown > 0 ? `Resend code (${resendCooldown}s)` : "Resend code"}
            </button>
          </>
        )}

        {phase === "success" && (
          <div className="py-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success-bg">
              <Check size={28} className="text-success" />
            </div>
            <h3 className="font-heading text-lg font-bold text-foreground">✓ Phone verified!</h3>
            <p className="mt-2 text-xs text-muted-foreground animate-pulse">Redirecting to dashboard...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyPhone;
