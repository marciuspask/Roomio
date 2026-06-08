import { Link, useNavigate } from "react-router-dom";
import { Listing } from "@/api/generated/data-contracts";
import { MapPin, Calendar, User, Heart } from "lucide-react";
import { useAuth } from "@clerk/react";
import { useSavedListings, useSaveListing, useUnsaveListing } from "@/api/hooks";
import TypeBadge from "./TypeBadge";
import FeaturedBadge from "./FeaturedBadge";

const SaveButton = ({ listingId }: { listingId: string }) => {
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();
  const { data } = useSavedListings();
  const savedIds = data?.data ?? [];
  const isSaved = savedIds.includes(listingId);
  const { mutate: save, isPending: saving } = useSaveListing();
  const { mutate: unsave, isPending: unsaving } = useUnsaveListing();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isSignedIn) {
      navigate("/login");
      return;
    }
    if (isSaved) {
      unsave(listingId);
    } else {
      save(listingId);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={saving || unsaving}
      aria-label={isSaved ? "Unsave listing" : "Save listing"}
      className="flex h-7 w-7 items-center justify-center rounded-full bg-card/80 backdrop-blur-sm shadow-sm transition-[color,background-color,transform] duration-200 ease-ui hover:bg-card hover:scale-110 disabled:opacity-60"
    >
      <Heart
        size={14}
        className={`transition-transform duration-200 ease-ui ${isSaved ? "fill-primary text-primary scale-110" : "text-foreground"}`}
      />
    </button>
  );
};

const ListingCard = ({ listing }: { listing: Listing }) => {
  const dateStr = new Date(listing.available_from).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });

  return (
    <Link
      to={`/listings/${listing.id}`}
      className="group block overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-[transform,box-shadow,border-color] duration-200 ease-ui hover:border-primary/60 hover:-translate-y-0.5 hover:shadow-md"
    >
      {/* Photo / placeholder */}
      <div className="relative aspect-video overflow-hidden bg-surface-elevated">
        {listing.photos?.[0] ? (
          <img
            src={listing.photos[0]}
            alt={listing.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 transition-transform duration-300 group-hover:scale-105" />
        )}
        <div className="absolute left-3 top-3">
          <TypeBadge type={listing.listing_type} />
        </div>
        <div className="absolute right-3 top-3 flex flex-col items-end gap-1">
          <SaveButton listingId={listing.id} />
          {listing.is_boosted && <FeaturedBadge />}
        </div>
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
            {listing.street_address
              ? `${listing.street_address.replace(/\s+\d+[a-zA-Z]?\s*$/, "").trim()}, ${listing.city}`
              : listing.district
                ? `${listing.district}, ${listing.city}`
                : listing.city}
          </span>
          <span className="flex items-center gap-1"><Calendar size={12} /> {dateStr}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 border-t border-border px-4 py-3">
        <div className="h-6 w-6 shrink-0 overflow-hidden rounded-full bg-primary/20">
          {listing.poster_image_url ? (
            <img src={listing.poster_image_url} alt="" className="h-full w-full object-cover" />
          ) : listing.poster_display_name ? (
            <span className="flex h-full w-full items-center justify-center text-[10px] font-semibold text-primary">
              {listing.poster_display_name[0].toUpperCase()}
            </span>
          ) : (
            <span className="flex h-full w-full items-center justify-center">
              <User size={12} className="text-primary" />
            </span>
          )}
        </div>
        <span className="text-xs text-muted-foreground">
          {listing.poster_display_name ?? (listing.listing_type === "offering" ? "Room owner" : "Room seeker")}
          {listing.poster_age != null ? `, ${listing.poster_age}` : ""}
        </span>
      </div>
    </Link>
  );
};

export default ListingCard;
