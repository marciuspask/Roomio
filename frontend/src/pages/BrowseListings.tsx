import { useState, useMemo } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ListingCard from "@/components/ListingCard";
import { mockListings, vilniusDistricts } from "@/data/mockData";
import { SlidersHorizontal, X } from "lucide-react";

const BrowseListings = () => {
  const [typeFilter, setTypeFilter] = useState<"all" | "offering" | "seeking">("all");
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([100, 800]);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [mobileFilters, setMobileFilters] = useState(false);

  const filtered = useMemo(() => {
    let results = [...mockListings];
    if (typeFilter !== "all") results = results.filter(l => l.type === typeFilter);
    if (selectedDistricts.length > 0) results = results.filter(l => selectedDistricts.includes(l.district));
    results = results.filter(l => l.price >= priceRange[0] && l.price <= priceRange[1]);
    if (verifiedOnly) results = results.filter(l => l.isVerified);

    switch (sortBy) {
      case "price-asc": results.sort((a, b) => a.price - b.price); break;
      case "price-desc": results.sort((a, b) => b.price - a.price); break;
      case "featured": results.sort((a, b) => (b.isBoosted ? 1 : 0) - (a.isBoosted ? 1 : 0)); break;
      default: results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return results;
  }, [typeFilter, selectedDistricts, priceRange, verifiedOnly, sortBy]);

  const toggleDistrict = (d: string) => {
    setSelectedDistricts(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  };

  const resetFilters = () => {
    setTypeFilter("all");
    setSelectedDistricts([]);
    setPriceRange([100, 800]);
    setVerifiedOnly(false);
  };

  const FilterPanel = () => (
    <div className="space-y-6">
      <div>
        <h4 className="mb-2 text-sm font-semibold text-foreground">Type</h4>
        <div className="flex flex-wrap gap-2">
          {(["all", "offering", "seeking"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                typeFilter === t ? "bg-primary text-primary-foreground" : "border border-border bg-card text-muted-foreground hover:bg-surface-elevated"
              }`}
            >
              {t === "all" ? "All" : t === "offering" ? "Room offered" : "Looking for room"}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="mb-2 text-sm font-semibold text-foreground">District</h4>
        <div className="space-y-1.5 max-h-48 overflow-y-auto">
          {vilniusDistricts.map(d => (
            <label key={d} className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-foreground">
              <input
                type="checkbox"
                checked={selectedDistricts.includes(d)}
                onChange={() => toggleDistrict(d)}
                className="rounded border-border text-primary focus:ring-primary"
              />
              {d}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="mb-2 text-sm font-semibold text-foreground">Price range</h4>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={priceRange[0]}
            onChange={e => setPriceRange([+e.target.value, priceRange[1]])}
            className="w-20 rounded-lg border border-border bg-card px-2 py-1.5 text-sm"
            min={100}
          />
          <span className="text-muted-foreground">–</span>
          <input
            type="number"
            value={priceRange[1]}
            onChange={e => setPriceRange([priceRange[0], +e.target.value])}
            className="w-20 rounded-lg border border-border bg-card px-2 py-1.5 text-sm"
            max={800}
          />
        </div>
        <p className="mt-1 text-xs text-muted-foreground">€{priceRange[0]} – €{priceRange[1]}</p>
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={verifiedOnly}
            onChange={() => setVerifiedOnly(!verifiedOnly)}
            className="rounded border-border text-primary focus:ring-primary"
          />
          Verified only
        </label>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setMobileFilters(false)} className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          Apply
        </button>
        <button onClick={resetFilters} className="text-sm text-muted-foreground hover:text-foreground">
          Reset all
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* Mobile filter toggle */}
        <div className="mb-4 flex items-center justify-between md:hidden">
          <span className="text-sm font-medium text-foreground">{filtered.length} listings found</span>
          <button
            onClick={() => setMobileFilters(true)}
            className="flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground"
          >
            <SlidersHorizontal size={14} /> Filters
          </button>
        </div>

        {/* Mobile filter drawer */}
        {mobileFilters && (
          <div className="fixed inset-0 z-50 flex flex-col md:hidden">
            <div className="absolute inset-0 bg-foreground/30" onClick={() => setMobileFilters(false)} />
            <div className="relative mt-auto max-h-[80vh] overflow-y-auto rounded-t-2xl bg-background p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-heading text-lg font-bold">Filters</h3>
                <button onClick={() => setMobileFilters(false)}><X size={20} /></button>
              </div>
              <FilterPanel />
            </div>
          </div>
        )}

        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden w-[280px] shrink-0 md:block">
            <div className="sticky top-20 rounded-xl border border-border bg-card p-5 shadow-sm">
              <h3 className="mb-4 font-heading text-base font-bold text-foreground">Filters</h3>
              <FilterPanel />
            </div>
          </aside>

          {/* Main */}
          <main className="flex-1">
            <div className="mb-4 hidden items-center justify-between md:flex">
              <span className="text-sm font-medium text-foreground">{filtered.length} listings found</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground"
              >
                <option value="newest">Newest</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
                <option value="featured">Featured first</option>
              </select>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map(l => <ListingCard key={l.id} listing={l} />)}
            </div>
            {filtered.length === 0 && (
              <div className="py-20 text-center text-muted-foreground">No listings match your filters.</div>
            )}
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BrowseListings;
