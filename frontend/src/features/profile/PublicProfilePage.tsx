import { useParams, Link } from "react-router-dom";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { usePublicProfile } from "@/api/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Briefcase, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

const PublicProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = usePublicProfile(id ?? "");
  const profile = data?.data;
  const { t, lang } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <Link
          to="/listings"
          className="mb-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={14} /> {t.publicProfile.backToListings}
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
            <p className="text-sm font-medium text-foreground">{t.publicProfile.notFound}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {t.publicProfile.notSetup}
            </p>
          </div>
        )}

        {profile && (
          <div className="space-y-6">
            {/* Avatar + name */}
            <div className="flex items-center gap-5">
              {profile.image_url ? (
                <img
                  src={profile.image_url}
                  alt={profile.display_name || t.publicProfile.roomioUser}
                  className="h-20 w-20 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary/20">
                  <span className="text-2xl font-bold text-primary">
                    {(profile.display_name || "R")[0].toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <h1 className="font-heading text-2xl font-bold text-foreground">
                  {profile.display_name || t.publicProfile.roomioUser}
                </h1>
                {profile.age != null && (
                  <p className="mt-0.5 text-sm text-muted-foreground">{t.publicProfile.yearsOld(profile.age)}</p>
                )}
                {profile.occupation && (
                  <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                    <Briefcase size={13} />
                    {t.publicProfile.occupations[profile.occupation] ?? profile.occupation}
                  </p>
                )}
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <div className="rounded-xl border border-border bg-card p-5">
                <h2 className="mb-2 text-sm font-semibold text-foreground">{t.publicProfile.about}</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">{profile.bio}</p>
              </div>
            )}

            {/* Verification badges */}
            {(profile.is_email_verified || profile.is_phone_verified) && (
              <div className="rounded-xl border border-border bg-card p-5">
                <h2 className="mb-3 text-sm font-semibold text-foreground">{t.publicProfile.verification}</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.is_email_verified && (
                    <span className="rounded-full bg-success-bg px-3 py-1 text-xs font-medium text-success">
                      {t.publicProfile.emailVerified}
                    </span>
                  )}
                  {profile.is_phone_verified && (
                    <span className="rounded-full bg-success-bg px-3 py-1 text-xs font-medium text-success">
                      {t.publicProfile.phoneVerified}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Member since */}
            <p className="text-xs text-muted-foreground">
              <MapPin size={11} className="mr-1 inline" />
              {t.publicProfile.memberSince}{" "}
              {new Date(profile.created_at).toLocaleDateString(lang === "lt" ? "lt-LT" : "en-GB", {
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
