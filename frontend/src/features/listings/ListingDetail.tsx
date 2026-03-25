import { useParams, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import TypeBadge from "@/features/listings/TypeBadge";
import FeaturedBadge from "@/features/listings/FeaturedBadge";
import { useListing, usePublicProfile, useStartConversation } from "@/api/hooks";
import { useAuth } from "@clerk/react";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Calendar, DollarSign, Home, User, Flag, Lightbulb } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useListing(id!);
  const listing = data?.data;
  const { data: posterData } = usePublicProfile(listing?.tenant_id ?? "");
  const poster = posterData?.data;
  const { isSignedIn: isLoggedIn } = useAuth();
  const { toast } = useToast();
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [messageState, setMessageState] = useState<"idle" | "composing" | "sent">("idle");
  const [messageText, setMessageText] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { mutate: startConversation, isPending: startingConversation } = useStartConversation();

  const handleContact = () => {
    if (!isLoggedIn) { setShowAuthModal(true); return; }
    setMessageState("composing");
  };

  const handleSend = () => {
    if (!messageText.trim() || !id) return;
    startConversation(
      { listingId: id, body: messageText },
      {
        onSuccess: () => navigate("/dashboard/messages"),
        onError: () => toast({ title: "Failed to send message", variant: "destructive" }),
      },
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Nav />
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="flex flex-col gap-8 lg:flex-row">
            <div className="flex-1 space-y-4">
              <Skeleton className="aspect-video w-full rounded-xl" />
              <Skeleton className="h-8 w-2/3 rounded-lg" />
              <Skeleton className="h-4 w-1/2 rounded-lg" />
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
              </div>
            </div>
            <div className="lg:w-[340px]">
              <Skeleton className="h-64 rounded-xl" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-background">
        <Nav />
        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="text-sm text-muted-foreground">Could not load listing. Please try again later.</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-background">
        <Nav />
        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="text-sm text-muted-foreground">Listing not found.</p>
        </div>
        <Footer />
      </div>
    );
  }

  const dateStr = new Date(listing.available_from).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Left content */}
          <div className="flex-1">
            {/* Photo placeholder */}
            <div className="mb-6">
              <div className="aspect-video w-full overflow-hidden rounded-xl bg-surface-elevated">
                <div className="h-full w-full bg-gradient-to-br from-primary/10 to-primary/5" />
              </div>
            </div>

            {/* Header */}
            <div className="mb-6">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <TypeBadge type={listing.listing_type} />
                {listing.is_boosted && <FeaturedBadge />}
              </div>
              <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">{listing.title}</h1>
              <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin size={14} />
                  {listing.district ? `${listing.district}, ` : ""}{listing.city}
                </span>
                <span className="flex items-center gap-1"><Calendar size={14} /> Available from {dateStr}</span>
              </div>
            </div>

            {/* Key info */}
            <div className="mb-6 grid grid-cols-2 gap-3">
              {[
                {
                  icon: <DollarSign size={18} />,
                  label: `€${listing.price}/month`,
                  sub: listing.utilities_incl ? "utilities included" : "utilities extra",
                },
                {
                  icon: <Home size={18} />,
                  label: listing.listing_type === "offering" ? "Room offered" : "Looking for room",
                  sub: "",
                },
                { icon: <Calendar size={18} />, label: dateStr, sub: "" },
                {
                  icon: <User size={18} />,
                  label: listing.gender_pref === "any" ? "Any gender welcome" : `${listing.gender_pref} only`,
                  sub: "",
                },
              ].map((item, i) => (
                <div key={i} className="rounded-xl border border-border bg-card p-4 shadow-sm">
                  <div className="mb-1 text-primary">{item.icon}</div>
                  <div className="text-sm font-semibold text-foreground">{item.label}</div>
                  {item.sub && <div className="text-xs text-muted-foreground">{item.sub}</div>}
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="mb-6">
              <h2 className="mb-2 font-heading text-lg font-bold text-foreground">Description</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {showFullDesc || listing.description.length <= 300
                  ? listing.description
                  : listing.description.slice(0, 300) + "..."}
              </p>
              {listing.description.length > 300 && (
                <button
                  onClick={() => setShowFullDesc(!showFullDesc)}
                  className="mt-1 text-sm font-medium text-primary"
                >
                  {showFullDesc ? "Show less" : "Read more"}
                </button>
              )}
            </div>

            {/* House rules */}
            <div className="mb-6">
              <h2 className="mb-2 font-heading text-lg font-bold text-foreground">House rules</h2>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-foreground">
                  {listing.allows_smoking ? "✓ Smoking ok" : "❌ No smoking"}
                </span>
                <span className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-foreground">
                  {listing.allows_pets ? "✓ Pets welcome" : "❌ No pets"}
                </span>
                <span className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-foreground">
                  {listing.gender_pref === "any" ? "Any gender" : `${listing.gender_pref} preferred`}
                </span>
              </div>
            </div>

            {/* About the poster */}
            <Link
              to={`/users/${listing.tenant_id}`}
              className="block rounded-xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-primary/60"
            >
              <h2 className="mb-3 font-heading text-lg font-bold text-foreground">About the poster</h2>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/20">
                  <span className="text-lg font-bold text-primary">
                    {(poster?.display_name ?? listing.city)[0].toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">
                    {poster?.display_name ?? (listing.listing_type === "offering" ? "Room owner" : "Room seeker")}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {poster?.is_phone_verified ? "✓ Phone verified · " : ""}{listing.city}
                  </div>
                </div>
                <span className="ml-auto text-xs text-primary">View profile →</span>
              </div>
            </Link>
          </div>

          {/* Right sidebar — contact card */}
          <div className="lg:w-[340px]">
            <div className="sticky top-20 rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="mb-4">
                <span className="font-heading text-2xl font-bold text-foreground">€{listing.price}</span>
                <span className="text-sm text-muted-foreground"> / month</span>
              </div>

              {messageState === "idle" && (
                <button
                  onClick={handleContact}
                  className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-dark transition-colors"
                >
                  Send message
                </button>
              )}
              {messageState === "composing" && (
                <div className="space-y-3">
                  <textarea
                    value={messageText}
                    onChange={e => setMessageText(e.target.value)}
                    placeholder="Write your message..."
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                    rows={3}
                  />
                  <button
                    onClick={handleSend}
                    disabled={startingConversation}
                    className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-dark transition-colors disabled:opacity-50"
                  >
                    {startingConversation ? "Sending…" : "Send"}
                  </button>
                </div>
              )}
              {messageState === "sent" && (
                <div className="rounded-lg bg-success-bg p-3 text-center text-sm font-medium text-success">
                  Message sent! ✓
                </div>
              )}

              <div className="my-4 border-t border-border" />

              <button
                onClick={() => toast({ title: "Thanks for reporting", description: "We'll review this listing." })}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Flag size={12} /> Report listing
              </button>

              <div className="mt-4 rounded-lg border border-warning/30 bg-warning-bg p-3">
                <div className="flex items-start gap-2">
                  <Lightbulb size={14} className="mt-0.5 text-warning" />
                  <p className="text-xs text-warning">Never pay a deposit before viewing the room in person.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Auth modal */}
      {showAuthModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30"
          onClick={() => setShowAuthModal(false)}
        >
          <div className="mx-4 w-full max-w-sm rounded-xl bg-card p-6 shadow-lg" onClick={e => e.stopPropagation()}>
            <h3 className="mb-2 font-heading text-lg font-bold">Sign in to message</h3>
            <p className="mb-4 text-sm text-muted-foreground">You need an account to contact people.</p>
            <div className="flex gap-3">
              <a href="/login" className="flex-1 rounded-lg bg-primary py-2 text-center text-sm font-medium text-primary-foreground">Log in</a>
              <a href="/register" className="flex-1 rounded-lg border border-border py-2 text-center text-sm font-medium text-foreground">Register</a>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ListingDetail;
