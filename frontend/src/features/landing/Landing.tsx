import { Link } from "react-router-dom";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ListingCard from "@/features/listings/ListingCard";
import { useListings } from "@/api/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { Home, Search, MessageSquare } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

const Landing = () => {
  const { t } = useLanguage();
  const { data, isLoading, isError } = useListings();
  const listings = data?.data ?? [];

  const renderListings = () => {
    if (isLoading) {
      return Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-64 rounded-xl" />
      ));
    }
    if (isError) {
      return (
        <p className="col-span-3 py-10 text-center text-sm text-muted-foreground">
          {t.landing.loadError}
        </p>
      );
    }
    if (listings.length === 0) {
      return (
        <p className="col-span-3 py-10 text-center text-sm text-muted-foreground">
          {t.landing.noListings}
        </p>
      );
    }
    return listings.slice(0, 6).map(listing => (
      <ListingCard key={listing.id} listing={listing} />
    ));
  };

  return (
    <div className="min-h-screen bg-background">
      <Nav />

      {/* Hero */}
      <section className="relative overflow-hidden px-4 pb-16 pt-20 sm:px-6 md:pt-28">
        <div className="pointer-events-none absolute inset-0 flex items-start justify-center">
          <div className="h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-3xl text-center">
          <h1 className="font-heading text-4xl font-extrabold leading-tight text-foreground sm:text-5xl md:text-6xl">
            {t.landing.heroLine1}<br />{t.landing.heroLine2}
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-lg text-muted-foreground">
            {t.landing.heroSub}
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/listings"
              className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-dark transition-colors"
            >
              {t.landing.browseRooms}
            </Link>
            <Link
              to="/listings/create"
              className="rounded-lg border border-border bg-transparent px-6 py-3 text-sm font-semibold text-foreground hover:bg-surface-elevated transition-colors"
            >
              {t.landing.postRoom}
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
            <span>{t.landing.activeListings(listings.length)}</span>
            <span>·</span>
            <span>{t.landing.verifiedUsers}</span>
            <span>·</span>
            <span>{t.landing.madeForLithuania}</span>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-border px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-12 text-center font-heading text-2xl font-bold text-foreground">{t.landing.howItWorks}</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { icon: <Home size={28} />, ...t.landing.steps[0] },
              { icon: <Search size={28} />, ...t.landing.steps[1] },
              { icon: <MessageSquare size={28} />, ...t.landing.steps[2] },
            ].map((step, i) => (
              <div
                key={i}
                className="relative rounded-xl border border-border bg-card p-6 text-center shadow-sm animate-fade-in-up"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#FFF3EE] text-primary">
                  {step.icon}
                </div>
                <h3 className="mb-2 font-heading text-base font-bold text-foreground">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Listings preview */}
      <section className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-8 text-center font-heading text-2xl font-bold text-foreground">{t.landing.latestRooms}</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {renderListings()}
          </div>
          {listings.length > 0 && (
            <div className="mt-10 text-center">
              <Link
                to="/listings"
                className="inline-block rounded-lg bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-dark transition-colors"
              >
                {t.landing.seeAll(listings.length)}
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-t border-border px-4 py-10 sm:px-6">
        <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-center gap-4">
          {[t.landing.trustPhoneVerified, t.landing.trustNoScams, t.landing.trustBuiltForLT].map(badge => (
            <span key={badge} className="rounded-full border border-[#F0E8DF] bg-white px-4 py-2 text-xs font-medium text-muted-foreground shadow-sm">
              {badge}
            </span>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
