import { Link } from "react-router-dom";
import { Listing } from "@/api/generated/data-contracts";
import { MapPin, Calendar } from "lucide-react";
import TypeBadge from "./TypeBadge";
import FeaturedBadge from "./FeaturedBadge";

const ListingCard = ({ listing }: { listing: Listing }) => {
  const dateStr = new Date(listing.available_from).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });

  return (
    <Link
      to={`/listings/${listing.id}`}
      className="group block overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-200 hover:border-primary/60 hover:-translate-y-0.5 hover:shadow-md"
    >
      {/* Photo placeholder — no photos in API yet */}
      <div className="relative aspect-video overflow-hidden bg-surface-elevated">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 transition-transform duration-300 group-hover:scale-105" />
        <div className="absolute left-3 top-3">
          <TypeBadge type={listing.listing_type} />
        </div>
        {listing.is_boosted && (
          <div className="absolute right-3 top-3">
            <FeaturedBadge />
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="mb-1 font-heading text-lg font-bold text-foreground">
          €{listing.price}<span className="text-sm font-normal text-muted-foreground">/mo</span>
        </div>
        <h3 className="mb-2 truncate text-sm font-medium text-foreground">{listing.title}</h3>
        <div className="flex flex-col gap-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin size={12} />
            {listing.district ? `${listing.district}, ` : ""}{listing.city}
          </span>
          <span className="flex items-center gap-1"><Calendar size={12} /> {dateStr}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 border-t border-border px-4 py-3">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20">
          <span className="text-xs font-bold text-primary">{listing.city[0]}</span>
        </div>
        <span className="text-xs font-medium text-foreground">{listing.city}</span>
      </div>
    </Link>
  );
};

export default ListingCard;
