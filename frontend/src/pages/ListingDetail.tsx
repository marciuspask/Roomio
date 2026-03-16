import { useParams } from "react-router-dom";
import { useState } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import TypeBadge from "@/components/TypeBadge";
import FeaturedBadge from "@/components/FeaturedBadge";
import VerifiedBadge from "@/components/VerifiedBadge";
import { mockListings } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { MapPin, Calendar, DollarSign, Home, User, Flag, Lightbulb } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ListingDetail = () => {
  const { id } = useParams();
  const listing = mockListings.find(l => l.id === id);
  const { isLoggedIn, currentUser } = useAuth();
  const { toast } = useToast();
  const [mainPhoto, setMainPhoto] = useState(0);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [messageState, setMessageState] = useState<"idle" | "composing" | "sent">("idle");
  const [messageText, setMessageText] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  if (!listing) return <div className="flex min-h-screen items-center justify-center">Listing not found.</div>;

  const dateStr = new Date(listing.availableFrom).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  const handleContact = () => {
    if (!isLoggedIn) { setShowAuthModal(true); return; }
    if (!currentUser.isPhoneVerified) { setShowVerifyModal(true); return; }
    setMessageState("composing");
  };

  const handleSend = () => {
    if (!messageText.trim()) return;
    setTimeout(() => setMessageState("sent"), 800);
  };

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Left content */}
          <div className="flex-1">
            {/* Photo gallery */}
            <div className="mb-6">
              <div className="overflow-hidden rounded-xl">
                <img src={listing.photos[mainPhoto]} alt={listing.title} className="aspect-video w-full object-cover" />
              </div>
              {listing.photos.length > 1 && (
                <div className="mt-2 flex gap-2">
                  {listing.photos.map((p, i) => (
                    <button key={i} onClick={() => setMainPhoto(i)}
                      className={`overflow-hidden rounded-lg border-2 transition-colors ${i === mainPhoto ? "border-primary" : "border-transparent"}`}>
                      <img src={p} alt="" className="h-16 w-20 object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Header */}
            <div className="mb-6">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <TypeBadge type={listing.type} />
                {listing.isBoosted && <FeaturedBadge />}
                {listing.isVerified && <VerifiedBadge />}
              </div>
              <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">{listing.title}</h1>
              <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin size={14} /> {listing.district}, {listing.city}</span>
                <span className="flex items-center gap-1"><Calendar size={14} /> Available from {dateStr}</span>
              </div>
            </div>

            {/* Key info */}
            <div className="mb-6 grid grid-cols-2 gap-3">
              {[
                { icon: <DollarSign size={18} />, label: `€${listing.price}/month`, sub: listing.utilitiesIncluded ? "utilities included" : "utilities extra" },
                { icon: <Home size={18} />, label: listing.type === "offering" ? "Room offered" : "Looking for room", sub: "" },
                { icon: <Calendar size={18} />, label: dateStr, sub: "" },
                { icon: <User size={18} />, label: listing.genderPref === "any" ? "Any gender welcome" : `${listing.genderPref} only`, sub: "" },
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
                {showFullDesc || listing.description.length <= 300 ? listing.description : listing.description.slice(0, 300) + "..."}
              </p>
              {listing.description.length > 300 && (
                <button onClick={() => setShowFullDesc(!showFullDesc)} className="mt-1 text-sm font-medium text-primary">
                  {showFullDesc ? "Show less" : "Read more"}
                </button>
              )}
            </div>

            {/* House rules */}
            <div className="mb-6">
              <h2 className="mb-2 font-heading text-lg font-bold text-foreground">House rules</h2>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-foreground">
                  {listing.allowsSmoking ? "✓ Smoking ok" : "❌ No smoking"}
                </span>
                <span className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-foreground">
                  {listing.allowsPets ? "✓ Pets welcome" : "❌ No pets"}
                </span>
                <span className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-foreground">
                  {listing.genderPref === "any" ? "Any gender" : `${listing.genderPref} preferred`}
                </span>
              </div>
            </div>

            {/* About poster */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <h2 className="mb-3 font-heading text-lg font-bold text-foreground">About the poster</h2>
              <div className="flex items-start gap-4">
                <img src={listing.poster.avatar} alt={listing.poster.name} className="h-14 w-14 rounded-full object-cover" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">{listing.poster.name}</span>
                    <span className="text-sm text-muted-foreground">{listing.poster.age}</span>
                    <span className="rounded-full bg-surface-elevated px-2 py-0.5 text-xs font-medium text-muted-foreground capitalize">
                      {listing.poster.occupation}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {listing.poster.isEmailVerified && <span className="text-xs text-success">✓ Email verified</span>}
                    {listing.poster.isPhoneVerified ? (
                      <span className="text-xs text-success">✓ Phone verified</span>
                    ) : (
                      <span className="text-xs text-warning">⚠ Phone not verified</span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{listing.poster.bio}</p>
                  <p className="mt-1 text-xs text-text-muted">Member since {new Date(listing.poster.memberSince).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right sidebar — contact card */}
          <div className="lg:w-[340px]">
            <div className="sticky top-20 rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <img src={listing.poster.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
                <span className="font-medium text-foreground">{listing.poster.name}</span>
              </div>
              <div className="mb-4">
                <span className="font-heading text-2xl font-bold text-foreground">€{listing.price}</span>
                <span className="text-sm text-muted-foreground"> / month</span>
              </div>

              {messageState === "idle" && (
                <button onClick={handleContact}
                  className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-dark transition-colors">
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
                  <button onClick={handleSend}
                    className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-dark transition-colors">
                    Send
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30" onClick={() => setShowAuthModal(false)}>
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

      {/* Verify phone modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30" onClick={() => setShowVerifyModal(false)}>
          <div className="mx-4 w-full max-w-sm rounded-xl bg-card p-6 shadow-lg" onClick={e => e.stopPropagation()}>
            <h3 className="mb-2 font-heading text-lg font-bold">Verify your phone</h3>
            <p className="mb-4 text-sm text-muted-foreground">You need a verified phone number to message people.</p>
            <a href="/verify-phone" className="block w-full rounded-lg bg-primary py-2 text-center text-sm font-medium text-primary-foreground">
              Verify phone →
            </a>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ListingDetail;
