import { Link } from "react-router-dom";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ListingCard from "@/components/ListingCard";
import { mockListings } from "@/data/mockData";
import { Home, Search, MessageSquare } from "lucide-react";

const Landing = () => {
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
            Find your flatmate<br />in Vilnius.
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-lg text-muted-foreground">
            Verified listings. Real people. No scams.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/listings"
              className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-dark transition-colors"
            >
              Browse rooms →
            </Link>
            <Link
              to="/listings/create"
              className="rounded-lg border border-border bg-transparent px-6 py-3 text-sm font-semibold text-foreground hover:bg-surface-elevated transition-colors"
            >
              Post a room
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
            <span>🏠 143 active listings</span>
            <span>·</span>
            <span>✓ 89% verified users</span>
            <span>·</span>
            <span>🇱🇹 Made for Lithuania</span>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-border px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-12 text-center font-heading text-2xl font-bold text-foreground">How it works</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { icon: <Home size={28} />, title: "Create your profile", desc: "Sign up in 2 minutes. Add a photo and a short bio." },
              { icon: <Search size={28} />, title: "Browse verified listings", desc: "Filter by district, price, and availability." },
              { icon: <MessageSquare size={28} />, title: "Message and meet", desc: "Verify your phone, then contact anyone directly." },
            ].map((step, i) => (
              <div key={i} className="relative rounded-xl border border-border bg-card p-6 text-center shadow-sm">
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
          <h2 className="mb-8 text-center font-heading text-2xl font-bold text-foreground">Latest rooms in Vilnius</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {mockListings.slice(0, 6).map(listing => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              to="/listings"
              className="inline-block rounded-lg bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-dark transition-colors"
            >
              See all 143 listings →
            </Link>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-t border-border px-4 py-10 sm:px-6">
        <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-center gap-4">
          {["✓ Phone-verified users", "🛡️ Zero deposit scams", "🇱🇹 Built for Lithuania"].map(t => (
            <span key={t} className="rounded-full border border-[#F0E8DF] bg-white px-4 py-2 text-xs font-medium text-muted-foreground shadow-sm">
              {t}
            </span>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
