import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProfile, useUpdateProfile } from "@/api/hooks";

const OnboardingPage = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();

  const [dob, setDob] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Already has date of birth → skip to listings
  if (!isLoading && data?.data?.date_of_birth) {
    navigate("/listings", { replace: true });
    return null;
  }

  // Max date: must be at least 18 years old
  const today = new Date();
  const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate())
    .toISOString()
    .split("T")[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dob) return;

    const dobDate = new Date(dob);
    const age =
      today.getFullYear() -
      dobDate.getFullYear() -
      (today.getMonth() < dobDate.getMonth() ||
      (today.getMonth() === dobDate.getMonth() && today.getDate() < dobDate.getDate())
        ? 1
        : 0);

    if (age < 18) {
      setError("You must be 18 or older to use Roomio");
      return;
    }

    setError(null);
    updateProfile.mutate(
      { date_of_birth: dob },
      {
        onSuccess: () => navigate("/listings", { replace: true }),
        onError: () => setError("Something went wrong. Please try again."),
      },
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-sm">
        <h1 className="mb-2 font-heading text-2xl font-bold text-foreground">One last thing</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          We need your date of birth to continue
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="dob"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              Date of birth
            </label>
            <input
              id="dob"
              type="date"
              value={dob}
              max={maxDate}
              onChange={(e) => {
                setDob(e.target.value);
                setError(null);
              }}
              required
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {error && (
            <p className="text-sm font-medium text-destructive">{error}</p>
          )}

          <button
            type="submit"
            disabled={updateProfile.isPending || !dob}
            className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-dark disabled:opacity-50"
          >
            {updateProfile.isPending ? "Saving..." : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OnboardingPage;
