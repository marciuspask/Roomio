import { useState, useEffect } from "react";
import { User } from "lucide-react";
import { useProfile, useUpdateProfile } from "@/api/hooks";
import { useToast } from "@/hooks/use-toast";

export default function ProfilePage() {
  const { data, isLoading, isError } = useProfile();
  const updateProfile = useUpdateProfile();
  const { toast } = useToast();

  console.log('profile hook result:', { data, isLoading, isError });

  const profile = data?.data;

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name);
      setBio(profile.bio ?? "");
    }
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate(
      { display_name: displayName, bio },
      {
        onSuccess: () => toast({ title: "Profile updated ✓" }),
        onError: () =>
          toast({ title: "Failed to update profile", variant: "destructive" }),
      },
    );
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-2">
        <p className="text-sm font-medium text-foreground">
          Could not load your profile
        </p>
        <p className="text-xs text-muted-foreground">
          Check your connection and try again.
        </p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
        <User size={40} className="text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No profile found.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg py-8">
      <h1 className="mb-6 font-heading text-2xl font-bold text-foreground">
        My Profile
      </h1>

      {/* Read-only info */}
      <div className="mb-6 rounded-xl border border-border bg-card p-4">
        <p className="mb-1 text-xs text-muted-foreground">Email</p>
        <p className="text-sm font-medium text-foreground">{profile.email}</p>
      </div>

      {/* Edit form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="display_name"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Display name
          </label>
          <input
            id="display_name"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={100}
            required
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <label
            htmlFor="bio"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Bio
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value.slice(0, 500))}
            rows={4}
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <p className="mt-1 text-right text-xs text-muted-foreground">
            {bio.length}/500
          </p>
        </div>

        <button
          type="submit"
          disabled={updateProfile.isPending}
          className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-dark disabled:opacity-50"
        >
          {updateProfile.isPending ? "Saving..." : "Save changes"}
        </button>
      </form>
    </div>
  );
}
