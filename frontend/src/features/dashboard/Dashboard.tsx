import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useUser, useAuth, useClerk } from "@clerk/react";
import {
  useMyListings, useDeleteListing, useProfile, useUpdateProfile,
  useConversations, useConversationMessages, useSendMessage, usePublicProfile, useMarkAsRead,
  useSavedListings, useListings,
} from "@/api/hooks";
import ListingCard from "@/features/listings/ListingCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Occupation } from "@/api/generated/data-contracts";
import { useToast } from "@/hooks/use-toast";
import { Home, LayoutList, MessageSquare, User, Plus, Zap, ArrowLeft, Trash2, Heart } from "lucide-react";

const formatMessageTime = (isoString: string) => {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 365) return new Date(isoString).toLocaleDateString("en-GB",
    { day: "numeric", month: "short" });
  return new Date(isoString).toLocaleDateString("en-GB",
    { day: "numeric", month: "short", year: "numeric" });
};

const ParticipantInfo = ({
  participantIds,
  currentUserId,
  children,
}: {
  participantIds: string[];
  currentUserId: string | null | undefined;
  children: (info: { displayName: string; avatarUrl: string | null }) => React.ReactNode;
}) => {
  const otherId = participantIds.find(id => id !== currentUserId) ?? "";
  const { data } = usePublicProfile(otherId);
  const displayName = data?.data.display_name ?? `User …${otherId.slice(-6)}`;
  const avatarUrl = data?.data.image_url ?? null;
  return <>{children({ displayName, avatarUrl })}</>;
};

const Dashboard = () => {
  const { user } = useUser();
  const { userId: clerkUserId } = useAuth();
  const { openUserProfile } = useClerk();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const path = location.pathname;
  const activeTab = path.includes("/messages") ? "messages" : path.includes("/saved") ? "saved" : path.includes("/listings") ? "listings" : path.includes("/profile") ? "profile" : "overview";

  const { data: myListingsData, isLoading: listingsLoading, isError: listingsError } = useMyListings();
  const myListings = myListingsData?.data ?? [];
  const { mutate: deleteListing, isPending: deleting } = useDeleteListing();

  const { data: profileData, isLoading: profileLoading } = useProfile();
  const profile = profileData?.data;
  const { mutate: saveProfile, isPending: savingProfile } = useUpdateProfile();

  const { data: conversationsData, isLoading: convsLoading } = useConversations();
  const { data: savedData, isLoading: savedLoading } = useSavedListings();
  const savedIds = savedData?.data ?? [];
  const { data: allListingsData } = useListings();
  const savedListings = (allListingsData?.data ?? []).filter(l => savedIds.includes(l.id));
  const conversations = conversationsData?.data ?? [];

  const [fullName, setFullName] = useState("");
  const [profileBio, setProfileBio] = useState("");
  const [profileOccupation, setProfileOccupation] = useState<Occupation | null>(null);
  const hasInitialized = useRef(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    if (profile && !hasInitialized.current) {
      hasInitialized.current = true;
      setFullName(user?.fullName ?? profile.display_name ?? "");
      setProfileBio(profile.bio ?? "");
      setProfileOccupation(profile.occupation ?? null);
    }
  }, [profile, user]);

  // Messages state
  const [selectedConvo, setSelectedConvo] = useState<string | null>(null);
  const [newMsg, setNewMsg] = useState("");

  const { data: messagesData, isLoading: messagesLoading } = useConversationMessages(selectedConvo ?? "");
  const messages = messagesData?.data ?? [];
  const { mutate: sendMessage, isPending: sending } = useSendMessage();
  const { mutate: markAsRead } = useMarkAsRead();

  useEffect(() => {
    if (activeTab === "messages" && selectedConvo) {
      markAsRead(selectedConvo);
    }
  }, [activeTab, selectedConvo]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Boost modal
  const [boostModal, setBoostModal] = useState<string | null>(null);
  const [boostLoading, setBoostLoading] = useState(false);
  const [boostedIds, setBoostedIds] = useState<string[]>([]);

  const totalUnread = conversations.reduce((s, c) => s + c.unread_count, 0);

  const navItems = [
    { id: "overview", label: "Overview", icon: Home, path: "/dashboard" },
    { id: "listings", label: "My Listings", icon: LayoutList, path: "/dashboard/listings" },
    { id: "saved", label: "Saved", icon: Heart, path: "/dashboard/saved" },
    { id: "messages", label: "Messages", icon: MessageSquare, path: "/dashboard/messages", badge: totalUnread || undefined },
    { id: "profile", label: "My Profile", icon: User, path: "/dashboard/profile" },
  ];

  const handleSendMessage = (convoId: string) => {
    if (!newMsg.trim()) return;
    sendMessage(
      { conversationId: convoId, body: newMsg },
      { onSuccess: () => setNewMsg("") },
    );
  };

  const handleBoost = (id: string) => {
    setBoostLoading(true);
    setTimeout(() => {
      setBoostedIds(p => [...p, id]);
      setBoostLoading(false);
      setBoostModal(null);
      toast({ title: "🚀 Your listing is now featured!" });
    }, 1500);
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploadingPhoto(true);
    try {
      await user.setProfileImage({ file });
      await user.reload();
      saveProfile({ image_url: user.imageUrl });
      toast({ title: "Photo updated!" });
    } catch {
      toast({ title: "Failed to update photo", variant: "destructive" });
    } finally {
      setUploadingPhoto(false);
      e.target.value = "";
    }
  };

  const handleSaveProfile = async () => {
    const nameParts = fullName.trim().split(/\s+/);
    const firstName = nameParts[0] ?? "";
    const lastName = nameParts.slice(1).join(" ");
    try {
      await user?.update({ firstName, lastName });
      saveProfile(
        { display_name: fullName.trim(), bio: profileBio, occupation: profileOccupation },
        {
          onSuccess: () => toast({ title: "Profile updated ✓" }),
          onError: () => toast({ title: "Failed to save profile", variant: "destructive" }),
        },
      );
    } catch {
      toast({ title: "Failed to update name", variant: "destructive" });
    }
  };

  const selectedConversation = conversations.find(c => c.id === selectedConvo) ?? null;

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 border-r border-border bg-card md:flex md:flex-col">
        <div className="p-5">
          <Link to="/" className="font-heading text-lg font-bold text-foreground">
            Roomi<span className="text-primary">o</span>
          </Link>
        </div>
        <nav className="flex-1 px-3">
          {navItems.map(item => (
            <Link key={item.id} to={item.path}
              className={`mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                activeTab === item.id
                  ? "border-l-2 border-primary bg-primary-light text-primary"
                  : "text-muted-foreground hover:bg-surface-elevated hover:text-foreground"
              }`}>
              <item.icon size={18} />
              {item.label}
              {item.badge ? (
                <span className="ml-auto rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          ))}
        </nav>
        <div className="p-4">
          <Link to="/listings/create"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-dark transition-colors">
            <Plus size={16} /> Post a room
          </Link>
        </div>
      </aside>

      {/* Mobile bottom tabs */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-border bg-card md:hidden">
        {navItems.map(item => (
          <Link key={item.id} to={item.path}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium ${
              activeTab === item.id ? "text-primary" : "text-muted-foreground"
            }`}>
            <span className="relative">
              <item.icon size={18} />
              {item.badge ? (
                <span className="absolute -right-2 -top-1 rounded-full bg-primary px-1 text-[8px] font-bold text-primary-foreground">
                  {item.badge}
                </span>
              ) : null}
            </span>
            {item.label}
          </Link>
        ))}
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <div className="mx-auto max-w-4xl p-4 sm:p-6 md:p-8">

          {/* OVERVIEW */}
          {activeTab === "overview" && (
            <>
              <h1 className="mb-6 font-heading text-2xl font-bold text-foreground">Good morning, {user?.firstName ?? "there"} 👋</h1>

              {profile?.is_phone_verified === false && (
                <div className="mb-6 rounded-xl border border-warning/30 bg-warning-bg p-4">
                  <h3 className="mb-1 text-sm font-semibold text-warning">Your profile is incomplete</h3>
                  <div className="mb-2 h-2 w-full rounded-full bg-warning/20">
                    <div className="h-2 w-[65%] rounded-full bg-warning" />
                  </div>
                  <p className="mb-2 text-xs text-warning">✓ Email verified · ⚠ Phone not verified</p>
                  <Link to="/verify-phone" className="text-xs font-medium text-primary">Verify phone →</Link>
                </div>
              )}

              <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-2">
                {[
                  { label: "Active listings", value: listingsLoading ? "—" : myListings.length },
                  { label: "Conversations", value: convsLoading ? "—" : conversations.length },
                ].map(s => (
                  <div key={s.label} className="rounded-xl border border-border bg-card p-4 shadow-sm">
                    <div className="font-heading text-2xl font-bold text-foreground">{s.value}</div>
                    <div className="text-xs text-muted-foreground">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* My listings preview */}
              <div className="mb-6">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="font-heading text-lg font-bold text-foreground">My listings</h2>
                  <Link to="/dashboard/listings" className="text-xs font-medium text-primary">View all →</Link>
                </div>
                {listingsLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <Skeleton key={i} className="h-20 rounded-xl" />
                    ))}
                  </div>
                ) : myListings.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No listings yet.</p>
                ) : (
                  myListings.slice(0, 3).map(l => (
                    <div key={l.id} className="mb-2 flex items-center gap-4 rounded-xl border border-border bg-card p-3 shadow-sm">
                      <div className="h-16 w-20 shrink-0 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5" />
                      <div className="flex-1 min-w-0">
                        <h4 className="truncate text-sm font-medium text-foreground">{l.title}</h4>
                        <p className="text-xs text-muted-foreground">{l.district ? `${l.district} · ` : ""}{l.city} · €{l.price}/mo</p>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        l.status === "active" ? "bg-success-bg text-success" : "bg-surface-elevated text-muted-foreground"
                      }`}>{l.status}</span>
                    </div>
                  ))
                )}
              </div>

              {/* Recent conversations */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="font-heading text-lg font-bold text-foreground">Recent messages</h2>
                  <Link to="/dashboard/messages" className="text-xs font-medium text-primary">View all →</Link>
                </div>
                {convsLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
                  </div>
                ) : conversations.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No messages yet.</p>
                ) : (
                  <div className="space-y-2">
                    {conversations.slice(0, 3).map(c => (
                      <Link key={c.id} to="/dashboard/messages"
                        className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-sm hover:border-primary transition-colors">
                        <ParticipantInfo participantIds={c.participant_ids} currentUserId={clerkUserId}>
                          {({ displayName, avatarUrl }) => (
                            <>
                              <div className="h-10 w-10 shrink-0 rounded-full overflow-hidden bg-primary/20 flex items-center justify-center">
                                {avatarUrl
                                  ? <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
                                  : <User size={16} className="text-primary" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground">{displayName}</p>
                                <p className="truncate text-xs text-muted-foreground">{c.last_message?.body ?? "No messages yet"}</p>
                              </div>
                            </>
                          )}
                        </ParticipantInfo>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* MY LISTINGS */}
          {activeTab === "listings" && (
            <>
              <h1 className="mb-6 font-heading text-2xl font-bold text-foreground">My Listings</h1>
              {listingsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-24 rounded-xl" />
                  ))}
                </div>
              ) : listingsError ? (
                <p className="py-8 text-center text-sm text-muted-foreground">Could not load listings. Please try again.</p>
              ) : myListings.length === 0 ? (
                <div className="py-16 text-center">
                  <Home size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <h3 className="mb-2 font-heading text-lg font-bold">No listings yet</h3>
                  <Link to="/listings/create" className="inline-block rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground">
                    Post your first room →
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {myListings.map(l => (
                    <div key={l.id} className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm">
                      <div className="h-20 w-28 shrink-0 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-foreground">{l.title}</h4>
                        <p className="text-xs text-muted-foreground">
                          {l.district ? `${l.district} · ` : ""}{l.city} · €{l.price}/mo
                        </p>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        l.status === "active" ? "bg-success-bg text-success" : "bg-surface-elevated text-muted-foreground"
                      }`}>{l.status}</span>
                      <button
                        onClick={() => navigate(`/listings/${l.id}/edit`)}
                        className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface-elevated"
                      >
                        Edit
                      </button>
                      {boostedIds.includes(l.id) || l.is_boosted ? (
                        <span className="rounded-full bg-primary-light px-2 py-0.5 text-xs font-medium text-primary-dark">⚡ Featured</span>
                      ) : (
                        <button onClick={() => setBoostModal(l.id)}
                          className="rounded-lg border border-primary/30 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary-light">
                          <Zap size={12} className="mr-1 inline" />Boost
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (window.confirm("Delete this listing? This cannot be undone.")) {
                            deleteListing(l.id, {
                              onSuccess: () => toast({ title: "Listing deleted." }),
                              onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
                            });
                          }
                        }}
                        disabled={deleting}
                        className="rounded-lg border border-destructive/30 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/5 disabled:opacity-50"
                      >
                        <Trash2 size={12} className="mr-1 inline" />Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* SAVED LISTINGS */}
          {activeTab === "saved" && (
            <>
              <h1 className="mb-6 font-heading text-2xl font-bold text-foreground">Saved Listings</h1>
              {savedLoading ? (
                <div className="grid gap-6 sm:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-64 rounded-xl" />
                  ))}
                </div>
              ) : savedListings.length === 0 ? (
                <div className="py-16 text-center">
                  <Heart size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <h3 className="mb-2 font-heading text-lg font-bold">No saved listings yet</h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Tap the heart on any listing to save it here.
                  </p>
                  <Link
                    to="/listings"
                    className="inline-block rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground"
                  >
                    Browse listings →
                  </Link>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2">
                  {savedListings.map(l => (
                    <ListingCard key={l.id} listing={l} />
                  ))}
                </div>
              )}
            </>
          )}

          {/* MESSAGES */}
          {activeTab === "messages" && (
            <div className="flex h-[calc(100vh-120px)] gap-0 md:gap-4">
              {/* Conversation list */}
              <div className={`${selectedConvo ? "hidden md:block" : "block"} w-full md:w-80 shrink-0 space-y-1 overflow-y-auto`}>
                <h1 className="mb-4 font-heading text-2xl font-bold text-foreground">Messages</h1>
                {convsLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
                  </div>
                ) : conversations.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">No conversations yet.</p>
                ) : (
                  conversations.map(c => (
                    <button key={c.id} onClick={() => setSelectedConvo(c.id)}
                      className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors ${
                        selectedConvo === c.id
                          ? "border-l-2 border-primary bg-primary-light"
                          : c.unread_count > 0
                            ? "bg-primary/5 hover:bg-primary/10"
                            : "hover:bg-surface-elevated"
                      }`}>
                      <ParticipantInfo participantIds={c.participant_ids} currentUserId={clerkUserId}>
                        {({ displayName, avatarUrl }) => (
                          <>
                            <div className="h-10 w-10 shrink-0 rounded-full overflow-hidden bg-primary/20 flex items-center justify-center">
                              {avatarUrl
                                ? <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
                                : <User size={16} className="text-primary" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className={`text-sm text-foreground ${c.unread_count > 0 ? "font-semibold" : "font-medium"}`}>
                                  {displayName}
                                </span>
                                <span className="text-[10px] text-muted-foreground">
                                  {new Date(c.updated_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                                </span>
                              </div>
                              <p className={`truncate text-xs text-muted-foreground ${c.unread_count > 0 ? "font-semibold" : ""}`}>
                                {c.last_message?.body ?? "No messages yet"}
                              </p>
                            </div>
                          </>
                        )}
                      </ParticipantInfo>
                    </button>
                  ))
                )}
              </div>

              {/* Message thread */}
              {selectedConversation ? (
                <div className={`${selectedConvo ? "flex" : "hidden md:flex"} flex-1 flex-col rounded-xl border border-border bg-card`}>
                  <div className="flex items-center gap-3 border-b border-border p-4">
                    <button onClick={() => setSelectedConvo(null)} className="md:hidden"><ArrowLeft size={18} /></button>
                    <ParticipantInfo participantIds={selectedConversation.participant_ids} currentUserId={clerkUserId}>
                      {({ displayName, avatarUrl }) => (
                        <>
                          <div className="h-8 w-8 shrink-0 rounded-full overflow-hidden bg-primary/20 flex items-center justify-center">
                            {avatarUrl
                              ? <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
                              : <User size={14} className="text-primary" />}
                          </div>
                          <div>
                            <span className="text-sm font-medium text-foreground">{displayName}</span>
                            <p className="text-xs text-muted-foreground">
                              <Link to={`/listings/${selectedConversation.listing_id}`} className="hover:text-primary">View listing →</Link>
                            </p>
                          </div>
                        </>
                      )}
                    </ParticipantInfo>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messagesLoading ? (
                      <div className="space-y-2">
                        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-8 rounded-xl" />)}
                      </div>
                    ) : messages.map(m => (
                      <div key={m.id} className={`flex ${m.sender_id === clerkUserId ? "justify-end" : "justify-start"}`}>
                        <div className={`flex flex-col max-w-[70%] ${m.sender_id === clerkUserId ? "items-end" : "items-start"}`}>
                          <div className={`rounded-xl px-3 py-2 text-sm ${
                            m.sender_id === clerkUserId
                              ? "bg-primary text-primary-foreground"
                              : "bg-surface-elevated text-foreground"
                          }`}>
                            {m.body}
                          </div>
                          <span className="mt-0.5 text-[10px] text-muted-foreground">
                            {formatMessageTime(m.created_at)}
                          </span>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                  <div className="flex gap-2 border-t border-border p-3">
                    <input
                      value={newMsg}
                      onChange={e => setNewMsg(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && !sending && handleSendMessage(selectedConversation.id)}
                      placeholder="Type a message..."
                      className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                    <button
                      onClick={() => handleSendMessage(selectedConversation.id)}
                      disabled={sending}
                      className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
                    >
                      {sending ? "…" : "Send"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="hidden flex-1 items-center justify-center rounded-xl border border-border bg-card md:flex">
                  <p className="text-sm text-muted-foreground">Select a conversation</p>
                </div>
              )}
            </div>
          )}

          {/* PROFILE */}
          {activeTab === "profile" && (
            <>
              <h1 className="mb-6 font-heading text-2xl font-bold text-foreground">My Profile</h1>
              {profileLoading ? (
                <div className="max-w-lg space-y-4">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                  <Skeleton className="h-24 w-full rounded-lg" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
              ) : (
                <div className="max-w-lg space-y-5">
                  {/* Avatar */}
                  <div className="flex items-center gap-4">
                    {user?.imageUrl ? (
                      <img src={user.imageUrl} alt="" className="h-16 w-16 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
                        <span className="text-xl font-bold text-primary">
                          {(fullName || "?")[0].toUpperCase()}
                        </span>
                      </div>
                    )}
                    <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                    <button
                      onClick={() => photoInputRef.current?.click()}
                      disabled={uploadingPhoto}
                      className="text-sm font-medium text-primary disabled:opacity-50"
                    >
                      {uploadingPhoto ? "Uploading..." : "Change photo"}
                    </button>
                  </div>

                  {/* Full name */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">Full name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">Bio</label>
                    <textarea
                      value={profileBio}
                      onChange={e => setProfileBio(e.target.value.slice(0, 500))}
                      placeholder="Short bio..."
                      className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                      rows={3}
                    />
                    <p className="text-right text-xs text-muted-foreground">{profileBio.length}/500</p>
                  </div>

                  {/* Occupation */}
                  <div>
                    <p className="mb-2 text-sm font-medium text-foreground">Occupation</p>
                    <div className="flex gap-2">
                      {([Occupation.Student, Occupation.Working, Occupation.Other] as const).map(o => (
                        <button
                          key={o}
                          onClick={() => setProfileOccupation(o)}
                          className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                            profileOccupation === o
                              ? "bg-primary text-primary-foreground"
                              : "border border-border text-muted-foreground"
                          }`}
                        >
                          {o}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Verification */}
                  <div className="rounded-xl border border-border bg-card p-4">
                    <h3 className="mb-2 text-sm font-semibold text-foreground">Verification</h3>
                    {profile?.is_email_verified ? (
                      <p className="text-xs text-success">✓ Email verified</p>
                    ) : (
                      <p className="text-xs text-muted-foreground">✗ Email not verified</p>
                    )}
                    {profile?.is_phone_verified ? (
                      <p className="text-xs text-success">✓ Phone verified</p>
                    ) : (
                      <p className="text-xs text-warning">
                        ⚠ Phone not verified · <Link to="/verify-phone" className="font-medium text-primary">Verify now →</Link>
                      </p>
                    )}
                  </div>

                  {/* Save */}
                  <button
                    onClick={handleSaveProfile}
                    disabled={savingProfile}
                    className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-dark transition-colors disabled:opacity-50"
                  >
                    {savingProfile ? "Saving..." : "Save changes"}
                  </button>

                  {/* Security link */}
                  <button
                    onClick={() => openUserProfile()}
                    className="block text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Password &amp; security →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Boost modal */}
      {boostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30" onClick={() => setBoostModal(null)}>
          <div className="mx-4 w-full max-w-sm rounded-xl bg-card p-6 shadow-lg" onClick={e => e.stopPropagation()}>
            <h3 className="mb-2 font-heading text-lg font-bold text-foreground">Boost this listing</h3>
            <p className="mb-1 text-sm text-muted-foreground">Your listing will appear at the top of search results for 7 days.</p>
            <p className="mb-4 text-lg font-bold text-foreground">€3.00 <span className="text-sm font-normal text-muted-foreground">one-time</span></p>
            <button onClick={() => handleBoost(boostModal)} disabled={boostLoading}
              className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">
              {boostLoading ? "Boosting..." : "Boost now →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
