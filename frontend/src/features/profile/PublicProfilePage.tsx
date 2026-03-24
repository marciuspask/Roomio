import { useParams, Link } from "react-router-dom";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { usePublicProfile } from "@/api/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Briefcase, ArrowLeft } from "lucide-react";

const OCCUPATION_LABEL: Record<string, string> = {
  student: "Student",
  working: "Working professional",
  other: "Other",
};

const PublicProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = usePublicProfile(id ?? "");
  const profile = data?.data;

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <Link
          to="/listings"
          className="mb-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={14} /> Back to listings
        </Link>

        {isLoading && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-40 rounded-lg" />
                <Skeleton className="h-4 w-24 rounded-lg" />
              </div>
            </div>
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        )}

        {isError && (
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <p className="text-sm font-medium text-foreground">Profile not found</p>
            <p className="mt-1 text-xs text-muted-foreground">
              This user may not have set up their profile yet.
            </p>
          </div>
        )}

        {profile && (
          <div className="space-y-6">
            {/* Avatar + name */}
            <div className="flex items-center gap-5">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary/20">
                <span className="text-2xl font-bold text-primary">
                  {profile.display_name?.[0]?.toUpperCase() ?? "?"}
                </span>
              </div>
              <div>
                <h1 className="font-heading text-2xl font-bold text-foreground">
                  {profile.display_name}
                </h1>
                {profile.occupation && (
                  <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                    <Briefcase size={13} />
                    {OCCUPATION_LABEL[profile.occupation] ?? profile.occupation}
                  </p>
                )}
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <div className="rounded-xl border border-border bg-card p-5">
                <h2 className="mb-2 text-sm font-semibold text-foreground">About</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">{profile.bio}</p>
              </div>
            )}

            {/* Verification badges */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="mb-3 text-sm font-semibold text-foreground">Verification</h2>
              <div className="flex flex-wrap gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                  profile.is_email_verified
                    ? "bg-success-bg text-success"
                    : "bg-surface-elevated text-muted-foreground"
                }`}>
                  {profile.is_email_verified ? "✓ Email verified" : "✗ Email not verified"}
                </span>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                  profile.is_phone_verified
                    ? "bg-success-bg text-success"
                    : "bg-surface-elevated text-muted-foreground"
                }`}>
                  {profile.is_phone_verified ? "✓ Phone verified" : "✗ Phone not verified"}
                </span>
              </div>
            </div>

            {/* Member since */}
            <p className="text-xs text-muted-foreground">
              <MapPin size={11} className="mr-1 inline" />
              Member since{" "}
              {new Date(profile.created_at).toLocaleDateString("en-GB", {
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default PublicProfilePage;
