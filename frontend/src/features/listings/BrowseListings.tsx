import { useState, useMemo } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ListingCard from "@/features/listings/ListingCard";
import { useListings } from "@/api/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { SlidersHorizontal, X } from "lucide-react";

const BrowseListings = () => {
  const { data, isLoading, isError } = useListings();
  const allListings = data?.data ?? [];

  const [typeFilter, setTypeFilter] = useState<"all" | "offering" | "seeking">("all");
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([100, 800]);
  const [sortBy, setSortBy] = useState("newest");
  const [mobileFilters, setMobileFilters] = useState(false);

  const cities = useMemo(
    () => Array.from(new Set(allListings.map(l => l.city))).sort(),
    [allListings],
  );

  const filtered = useMemo(() => {
    let results = [...allListings];
    if (typeFilter !== "all") results = results.filter(l => l.listing_type === typeFilter);
    if (selectedCities.length > 0) results = results.filter(l => selectedCities.includes(l.city));
    results = results.filter(l => l.price >= priceRange[0] && l.price <= priceRange[1]);

    switch (sortBy) {
      case "price-asc": results.sort((a, b) => a.price - b.price); break;
      case "price-desc": results.sort((a, b) => b.price - a.price); break;
      case "featured": results.sort((a, b) => (b.is_boosted ? 1 : 0) - (a.is_boosted ? 1 : 0)); break;
      default: results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return results;
  }, [allListings, typeFilter, selectedCities, priceRange, sortBy]);

  const toggleCity = (c: string) => {
    setSelectedCities(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  };

  const resetFilters = () => {
    setTypeFilter("all");
    setSelectedCities([]);
    setPriceRange([100, 800]);
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
        <h4 className="mb-2 text-sm font-semibold text-foreground">City</h4>
        <div className="max-h-48 space-y-1.5 overflow-y-auto">
          {cities.map(c => (
            <label key={c} className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <input
                type="checkbox"
                checked={selectedCities.includes(c)}
                onChange={() => toggleCity(c)}
                className="rounded border-border text-primary focus:ring-primary"
              />
              {c}
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

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      );
    }
    if (isError) {
      return (
        <div className="py-20 text-center text-sm text-muted-foreground">
          Could not load listings. Please try again later.
        </div>
      );
    }
    if (filtered.length === 0) {
      return (
        <div className="py-20 text-center text-muted-foreground">
          {allListings.length === 0 ? "No listings yet." : "No listings match your filters."}
        </div>
      );
    }
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map(l => <ListingCard key={l.id} listing={l} />)}
      </div>
    );
  };

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
            {renderContent()}
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BrowseListings;
