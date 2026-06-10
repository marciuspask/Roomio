import { Link } from "react-router-dom";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ListingCard from "@/features/listings/ListingCard";
import { useListings } from "@/api/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { Home, Search, MessageSquare, MapPin } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

interface HeroCardData {
  price: number;
  city: string;
  district?: string | null;
  photos?: string[];
}

const HeroCard = ({ card, className }: { card: HeroCardData; className?: string }) => (
  <div className={`overflow-hidden rounded-2xl border border-border/60 bg-white shadow-[0_8px_40px_rgba(0,0,0,0.09)] ${className ?? ""}`}>
    <div className="aspect-[4/3] overflow-hidden bg-gradient-to-br from-primary/12 to-primary/5">
      {card.photos?.[0] && (
        <img src={card.photos[0]} alt="" className="h-full w-full object-cover" />
      )}
    </div>
    <div className="px-4 py-3">
      <div className="font-heading text-lg font-extrabold text-foreground">
        €{card.price}
        <span className="text-xs font-normal text-muted-foreground">/mo</span>
      </div>
      <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
        <MapPin size={10} />
        {card.district ? `${card.district}, ` : ""}{card.city}
      </p>
    </div>
  </div>
);

const FALLBACK: HeroCardData[] = [
  {
    price: 380,
    city: "Vilnius",
    district: "Žirmūnai",
    photos: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=480&h=360&fit=crop&auto=format"],
  },
  {
    price: 450,
    city: "Vilnius",
    district: "Antakalnis",
    photos: ["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=480&h=360&fit=crop&auto=format"],
  },
];

const Landing = () => {
  const { t } = useLanguage();
  const { data, isLoading, isError } = useListings();
  const listings = data?.data ?? [];

  const heroCards: HeroCardData[] = listings.length >= 2
    ? listings.slice(0, 2).map(l => ({ price: l.price, city: l.city, district: l.district, photos: l.photos }))
    : listings.length === 1
      ? [{ price: listings[0].price, city: listings[0].city, district: listings[0].district, photos: listings[0].photos }, FALLBACK[1]]
      : FALLBACK;

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
    <div className="relative min-h-screen overflow-x-hidden bg-background">

      {/* Page-wide barely-visible ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div
          className="absolute -top-48 left-[10%] h-[600px] w-[600px] rounded-full bg-primary/[0.055] blur-[100px] animate-ambient-drift"
          style={{ animationDuration: "26s" }}
        />
        <div
          className="absolute top-[5%] right-[5%] h-[500px] w-[500px] rounded-full bg-primary/[0.04] blur-[90px] animate-ambient-drift-slow"
          style={{ animationDuration: "34s", animationDelay: "4s" }}
        />
        <div
          className="absolute top-[45%] left-[2%] h-[400px] w-[400px] rounded-full bg-primary/[0.03] blur-[80px] animate-ambient-drift"
          style={{ animationDuration: "21s", animationDelay: "9s" }}
        />
        <div
          className="absolute top-[55%] right-[8%] h-[350px] w-[350px] rounded-full bg-primary/[0.035] blur-[80px] animate-ambient-drift-slow"
          style={{ animationDuration: "29s", animationDelay: "2s" }}
        />
      </div>

      <Nav />

      {/* Hero */}
      <section className="relative overflow-hidden px-4 pb-20 pt-24 sm:px-6 md:pt-28">
        <div className="relative mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">

            {/* Left: text */}
            <div>
              <h1
                className="animate-fade-in-up font-heading text-5xl font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-6xl md:text-7xl"
                style={{ animationDelay: "0ms" }}
              >
                {t.landing.heroLine1}<br />{t.landing.heroLine2}
              </h1>
              <p
                className="animate-fade-in-up mt-5 max-w-md text-lg text-muted-foreground leading-relaxed"
                style={{ animationDelay: "90ms" }}
              >
                {t.landing.heroSub}
              </p>
              <div
                className="animate-fade-in-up mt-8 flex flex-col items-start gap-3 sm:flex-row"
                style={{ animationDelay: "170ms" }}
              >
                <Link
                  to="/listings"
                  className="btn-press rounded-lg bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary-dark transition-[background-color] duration-150 ease-ui"
                >
                  {t.landing.browseRooms}
                </Link>
                <Link
                  to="/listings/create"
                  className="btn-press rounded-lg border border-border bg-transparent px-7 py-3.5 text-sm font-medium text-muted-foreground hover:border-foreground/30 hover:text-foreground transition-[color,border-color] duration-150 ease-ui"
                >
                  {t.landing.postRoom}
                </Link>
              </div>
              <div
                className="animate-fade-in-up mt-8 flex flex-wrap items-center gap-5 text-xs text-muted-foreground"
                style={{ animationDelay: "240ms" }}
              >
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--success))]" />
                  {t.landing.activeListings(listings.length)}
                </span>
                <span>{t.landing.verifiedUsers}</span>
                <span>{t.landing.madeForLithuania}</span>
              </div>
            </div>

            {/* Right: floating listing cards + animated ambient orbs */}
            <div className="hidden lg:flex relative min-h-[420px] items-center justify-center">
              {/* Hero-local orbs — stronger, closer to the cards */}
              <div className="pointer-events-none absolute inset-0">
                <div
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-primary/20 blur-[80px] animate-ambient-drift"
                  style={{ animationDuration: "14s" }}
                />
                <div
                  className="absolute right-1/4 top-1/4 h-56 w-56 rounded-full bg-primary/12 blur-[60px] animate-ambient-drift-slow"
                  style={{ animationDuration: "19s", animationDelay: "2s" }}
                />
              </div>

              {/* Back card — upper right, rotated */}
              <div
                className="absolute right-0 top-6 w-52 rotate-[5deg] animate-float-slow"
                style={{ animationDelay: "1.8s" }}
              >
                <HeroCard card={heroCards[1]} />
              </div>

              {/* Front card — lower left, slight counter-rotation */}
              <div
                className="absolute bottom-4 left-0 z-10 w-60 -rotate-[2deg] animate-float"
                style={{ animationDelay: "0s" }}
              >
                <HeroCard card={heroCards[0]} />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-border px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-14 font-heading text-2xl font-bold text-foreground">{t.landing.howItWorks}</h2>
          <div>
            {[
              { icon: <Home size={20} />, ...t.landing.steps[0] },
              { icon: <Search size={20} />, ...t.landing.steps[1] },
              { icon: <MessageSquare size={20} />, ...t.landing.steps[2] },
            ].map((step, i) => (
              <div
                key={i}
                className="flex items-start gap-8 border-t border-border py-8 animate-fade-in-up"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <span className="shrink-0 font-heading text-6xl font-extrabold leading-none select-none tabular-nums text-border">
                  0{i + 1}
                </span>
                <div className="flex-1 pt-2">
                  <h3 className="mb-1.5 font-heading text-lg font-bold text-foreground">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground max-w-sm">{step.desc}</p>
                </div>
                <div className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary mt-2">
                  {step.icon}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Listings preview */}
      <section className="border-t border-border px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-baseline justify-between">
            <h2 className="font-heading text-2xl font-bold text-foreground">{t.landing.latestRooms}</h2>
            {listings.length > 0 && (
              <Link
                to="/listings"
                className="text-sm font-medium text-primary hover:text-primary-dark transition-colors duration-150 ease-ui"
              >
                {t.landing.seeAll(listings.length)}
              </Link>
            )}
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {renderListings()}
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-t border-border px-4 py-10 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-8 gap-y-2">
          {[t.landing.trustPhoneVerified, t.landing.trustNoScams, t.landing.trustBuiltForLT].map(badge => (
            <span key={badge} className="text-xs font-medium text-muted-foreground">
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
