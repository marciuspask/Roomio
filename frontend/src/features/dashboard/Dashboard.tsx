import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useUser, useAuth, useClerk } from "@clerk/react";
import {
  useMyListings, useDeleteListing, useProfile, useUpdateProfile,
  useConversations, useConversationMessages, useSendMessage, useMarkAsRead,
  useSavedListings, useListings,
} from "@/api/hooks";
import { useWebSocket } from "@/hooks/useWebSocket";
import type { Conversation } from "@/api/generated/data-contracts";
import ListingCard from "@/features/listings/ListingCard";
import ReportModal from "@/components/ReportModal";
import { Skeleton } from "@/components/ui/skeleton";
import { Occupation } from "@/api/generated/data-contracts";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Home, LayoutList, MessageSquare, User, Plus, Zap, ArrowLeft, Trash2, Heart, MoreVertical, Ban, Flag } from "lucide-react";
import { useLanguage, type T } from "@/lib/i18n";
import { apiClient } from "@/api/client";

const formatMessageTime = (isoString: string, d: T["dashboard"]) => {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return d.justNow;
  if (mins < 60) return d.minutesAgo(mins);
  const hours = Math.floor(mins / 60);
  if (hours < 24) return d.hoursAgo(hours);
  const days = Math.floor(hours / 24);
  if (days < 365) return new Date(isoString).toLocaleDateString("en-GB",
    { day: "numeric", month: "short" });
  return new Date(isoString).toLocaleDateString("en-GB",
    { day: "numeric", month: "short", year: "numeric" });
};

const getParticipantInfo = (conv: Conversation, currentUserId: string | null | undefined) => {
  const otherId = conv.participant_ids.find(id => id !== currentUserId) ?? "";
  const rawName = conv.participant_display_names?.[otherId] ?? `User …${otherId.slice(-6)}`;
  const age = conv.participant_ages?.[otherId] ?? null;
  const displayName = age != null ? `${rawName}, ${age}` : rawName;
  const avatarUrl = conv.participant_image_urls?.[otherId] ?? null;
  return { displayName, avatarUrl };
};

const Dashboard = () => {
  const { t } = useLanguage();
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
  const conversations = (conversationsData?.data ?? []).filter(c => !hiddenConvIds.has(c.id));

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
  const manuallyDeselected = useRef(false);
  const [hiddenConvIds, setHiddenConvIds] = useState<Set<string>>(new Set());
  const [reportTarget, setReportTarget] = useState<{ userId: string; convId: string } | null>(null);

  // Auto-open newest conversation when entering the messages tab
  useEffect(() => {
    if (activeTab !== "messages") {
      manuallyDeselected.current = false;
      return;
    }
    if (!selectedConvo && conversations.length > 0 && !manuallyDeselected.current) {
      setSelectedConvo(conversations[0].id);
    }
  }, [activeTab, conversations, selectedConvo]);

  const { data: messagesData, isLoading: messagesLoading } = useConversationMessages(selectedConvo ?? "");
  const messages = messagesData?.data ?? [];
  const { mutate: sendMessage, isPending: sending } = useSendMessage();
  const { isConnected: wsConnected, sendMessage: wsSendMessage } = useWebSocket(
    activeTab === "messages" ? selectedConvo : null,
  );
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
    { id: "overview", label: t.dashboard.overview, icon: Home, path: "/dashboard" },
    { id: "listings", label: t.dashboard.myListings, icon: LayoutList, path: "/dashboard/listings" },
    { id: "saved", label: t.dashboard.saved, icon: Heart, path: "/dashboard/saved" },
    { id: "messages", label: t.dashboard.messages, icon: MessageSquare, path: "/dashboard/messages", badge: totalUnread || undefined },
    { id: "profile", label: t.dashboard.myProfile, icon: User, path: "/dashboard/profile" },
  ];

  const handleSendMessage = (convoId: string) => {
    if (!newMsg.trim()) return;
    const sentViaWs = wsSendMessage(newMsg);
    if (sentViaWs) {
      setNewMsg("");
    } else {
      sendMessage(
        { conversationId: convoId, body: newMsg },
        { onSuccess: () => setNewMsg("") },
      );
    }
  };

  const handleBlockUser = async (userId: string, convId: string) => {
    try {
      await apiClient.instance.post(`/api/v1/moderation/block/${userId}`);
      setHiddenConvIds(prev => new Set([...prev, convId]));
      if (selectedConvo === convId) setSelectedConvo(null);
      toast({ title: "User blocked." });
    } catch {
      toast({ title: "Failed to block user", variant: "destructive" });
    }
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
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 border-r border-border bg-card md:flex md:flex-col">
        <div className="p-5">
          <Link to="/" className="font-heading text-lg font-bold text-foreground">
            Roomi<span className="text-primary">o</span>
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto px-3">
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
        <div className="flex flex-col gap-3 p-4">
          <Link to="/listings/create"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-dark transition-colors">
            <Plus size={16} /> {t.dashboard.postRoom}
          </Link>
          <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
            <Link to="/about" className="hover:text-foreground transition-colors">{t.dashboard.about}</Link>
            <Link to="/privacy-policy" className="hover:text-foreground transition-colors">{t.dashboard.privacy}</Link>
            <Link to="/terms-of-service" className="hover:text-foreground transition-colors">{t.dashboard.terms}</Link>
            <Link to="/cookie-policy" className="hover:text-foreground transition-colors">{t.dashboard.cookies}</Link>
          </div>
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
      <main className="flex-1 overflow-y-auto pb-24 md:pb-8">
        <div className="mx-auto max-w-4xl p-4 sm:p-6 md:p-8">

          {/* OVERVIEW */}
          {activeTab === "overview" && (
            <>
              <h1 className="mb-6 font-heading text-2xl font-bold text-foreground">{t.dashboard.greeting(user?.firstName ?? "")}</h1>

              {profile && (profile.is_email_verified && profile.is_phone_verified ? (
                <div className="mb-6 rounded-xl border border-success/30 bg-success-bg p-4 flex items-center gap-3">
                  <span className="text-xl">✓</span>
                  <div>
                    <h3 className="text-sm font-semibold text-success">{t.dashboard.fullyVerified}</h3>
                    <p className="text-xs text-success/80">{t.dashboard.fullyVerifiedSub}</p>
                  </div>
                </div>
              ) : (
                <div className="mb-6 rounded-xl border border-warning/30 bg-warning-bg p-4">
                  <h3 className="mb-2 text-sm font-semibold text-warning">{t.dashboard.completeProfile}</h3>
                  <div className="mb-2 space-y-1">
                    <p className="text-xs text-warning">
                      {profile.is_email_verified ? "✓" : "○"} {t.dashboard.emailVerified}
                    </p>
                    <p className="text-xs text-warning">
                      {profile.is_phone_verified ? "✓" : "○"} {t.dashboard.phoneVerified}
                    </p>
                  </div>
                  {!profile.is_phone_verified && (
                    <Link to="/verify-phone" className="text-xs font-medium text-primary">{t.dashboard.verifyPhone}</Link>
                  )}
                </div>
              ))}

              <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-2">
                {[
                  { label: t.dashboard.activeListings, value: listingsLoading ? "—" : myListings.length },
                  { label: t.dashboard.conversations, value: convsLoading ? "—" : conversations.length },
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
                  <h2 className="font-heading text-lg font-bold text-foreground">{t.dashboard.myListingsSection}</h2>
                  <Link to="/dashboard/listings" className="text-xs font-medium text-primary">{t.dashboard.viewAll}</Link>
                </div>
                {listingsLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <Skeleton key={i} className="h-20 rounded-xl" />
                    ))}
                  </div>
                ) : myListings.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t.dashboard.noListings}</p>
                ) : (
                  myListings.slice(0, 3).map(l => (
                    <div key={l.id} className="mb-2 flex items-center gap-4 rounded-xl border border-border bg-card p-3 shadow-sm">
                      <div className="h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-primary/10 to-primary/5">
                        {l.photos?.[0] && <img src={l.photos[0]} alt={l.title} className="h-full w-full object-cover" />}
                      </div>
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
                  <h2 className="font-heading text-lg font-bold text-foreground">{t.dashboard.recentMessages}</h2>
                  <Link to="/dashboard/messages" className="text-xs font-medium text-primary">{t.dashboard.viewAll}</Link>
                </div>
                {convsLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
                  </div>
                ) : conversations.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t.dashboard.noMessages}</p>
                ) : (
                  <div className="space-y-2">
                    {conversations.slice(0, 3).map(c => {
                      const { displayName, avatarUrl } = getParticipantInfo(c, clerkUserId);
                      return (
                        <Link key={c.id} to="/dashboard/messages"
                          className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-sm hover:border-primary transition-colors">
                          <div className="h-10 w-10 shrink-0 rounded-full overflow-hidden bg-primary/20 flex items-center justify-center">
                            {avatarUrl
                              ? <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
                              : <User size={16} className="text-primary" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">{displayName}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {c.last_message?.body
                                ? c.last_message.body.length > 45
                                  ? c.last_message.body.slice(0, 45) + "…"
                                  : c.last_message.body
                                : c.listing_title
                                  ? `Re: ${c.listing_title}`
                                  : "No messages yet"}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}

          {/* MY LISTINGS */}
          {activeTab === "listings" && (
            <>
              <h1 className="mb-6 font-heading text-2xl font-bold text-foreground">{t.dashboard.myListings}</h1>
              {listingsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-24 rounded-xl" />
                  ))}
                </div>
              ) : listingsError ? (
                <p className="py-8 text-center text-sm text-muted-foreground">{t.dashboard.couldNotLoad}</p>
              ) : myListings.length === 0 ? (
                <div className="py-16 text-center">
                  <Home size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <h3 className="mb-2 font-heading text-lg font-bold">{t.dashboard.noListingsYet}</h3>
                  <Link to="/listings/create" className="inline-block rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground">
                    {t.dashboard.postFirstRoom}
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {myListings.map(l => (
                    <div key={l.id} className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm">
                      <div className="h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-primary/10 to-primary/5">
                        {l.photos?.[0] && <img src={l.photos[0]} alt={l.title} className="h-full w-full object-cover" />}
                      </div>
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
                        {t.dashboard.edit}
                      </button>
                      {boostedIds.includes(l.id) || l.is_boosted ? (
                        <span className="rounded-full bg-primary-light px-2 py-0.5 text-xs font-medium text-primary-dark">{t.dashboard.featured}</span>
                      ) : (
                        <button onClick={() => setBoostModal(l.id)}
                          className="rounded-lg border border-primary/30 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary-light">
                          <Zap size={12} className="mr-1 inline" />{t.dashboard.boost}
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (window.confirm(t.dashboard.deleteConfirm)) {
                            deleteListing(l.id, {
                              onSuccess: () => toast({ title: "Listing deleted." }),
                              onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
                            });
                          }
                        }}
                        disabled={deleting}
                        className="rounded-lg border border-destructive/30 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/5 disabled:opacity-50"
                      >
                        <Trash2 size={12} className="mr-1 inline" />{t.dashboard.delete}
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
              <h1 className="mb-6 font-heading text-2xl font-bold text-foreground">{t.dashboard.savedListings}</h1>
              {savedLoading ? (
                <div className="grid gap-6 sm:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-64 rounded-xl" />
                  ))}
                </div>
              ) : savedListings.length === 0 ? (
                <div className="py-16 text-center">
                  <Heart size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <h3 className="mb-2 font-heading text-lg font-bold">{t.dashboard.noSavedListings}</h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    {t.dashboard.savedListingsSub}
                  </p>
                  <Link
                    to="/listings"
                    className="inline-block rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground"
                  >
                    {t.dashboard.browseListings}
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
                <h1 className="mb-4 font-heading text-2xl font-bold text-foreground">{t.dashboard.messages}</h1>
                {convsLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
                  </div>
                ) : conversations.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">{t.dashboard.noConversations}</p>
                ) : (
                  conversations.map(c => {
                    const { displayName, avatarUrl } = getParticipantInfo(c, clerkUserId);
                    return (
                      <button key={c.id} onClick={() => setSelectedConvo(c.id)}
                        className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors ${
                          selectedConvo === c.id
                            ? "border-l-2 border-primary bg-primary-light"
                            : c.unread_count > 0
                              ? "bg-primary/5 hover:bg-primary/10"
                              : "hover:bg-surface-elevated"
                        }`}>
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
                          <p className={`truncate text-xs text-muted-foreground ${c.unread_count > 0 ? "font-medium" : ""}`}>
                            {c.last_message?.body
                                ? c.last_message.body.length > 45
                                  ? c.last_message.body.slice(0, 45) + "…"
                                  : c.last_message.body
                                : c.listing_title
                                  ? `Re: ${c.listing_title}`
                                  : "No messages yet"}
                          </p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Message thread */}
              {selectedConversation ? (
                <div className={`${selectedConvo ? "flex" : "hidden md:flex"} flex-1 flex-col rounded-xl border border-border bg-card`}>
                  <div className="flex items-center gap-3 border-b border-border p-4">
                    <button onClick={() => { manuallyDeselected.current = true; setSelectedConvo(null); }} className="md:hidden"><ArrowLeft size={18} /></button>
                    {(() => {
                      const { displayName, avatarUrl } = getParticipantInfo(selectedConversation, clerkUserId);
                      return (
                        <>
                          <div className="h-8 w-8 shrink-0 rounded-full overflow-hidden bg-primary/20 flex items-center justify-center">
                            {avatarUrl
                              ? <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
                              : <User size={14} className="text-primary" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium text-foreground">{displayName}</span>
                            <p className="text-xs text-muted-foreground">
                              <Link to={`/listings/${selectedConversation.listing_id}`} className="hover:text-primary">
                                {selectedConversation.listing_title
                                  ? `View listing → ${selectedConversation.listing_title}`
                                  : "View listing →"}
                              </Link>
                            </p>
                          </div>
                          {wsConnected && (
                            <span className="flex items-center gap-1 text-[10px] font-medium text-success">
                              <span className="h-1.5 w-1.5 rounded-full bg-success" />
                              {t.dashboard.live}
                            </span>
                          )}
                          {(() => {
                            const otherId = selectedConversation.participant_ids.find(id => id !== clerkUserId) ?? "";
                            return (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-surface-elevated hover:text-foreground transition-colors" aria-label="Conversation options">
                                    <MoreVertical size={15} />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => setReportTarget({ userId: otherId, convId: selectedConversation.id })}
                                    className="gap-2 text-muted-foreground"
                                  >
                                    <Flag size={14} /> Report user
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleBlockUser(otherId, selectedConversation.id)}
                                    className="gap-2 text-destructive focus:text-destructive"
                                  >
                                    <Ban size={14} /> Block user
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            );
                          })()}
                        </>
                      );
                    })()}
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
                            {formatMessageTime(m.created_at, t.dashboard)}
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
                      placeholder={t.dashboard.typeMessage}
                      className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                    <button
                      onClick={() => handleSendMessage(selectedConversation.id)}
                      disabled={sending}
                      className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
                    >
                      {sending && !wsConnected ? "…" : t.dashboard.send}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="hidden flex-1 items-center justify-center rounded-xl border border-border bg-card md:flex">
                  <p className="text-sm text-muted-foreground">{t.dashboard.selectConversation}</p>
                </div>
              )}
            </div>
          )}

          {/* PROFILE */}
          {activeTab === "profile" && (
            <>
              <h1 className="mb-6 font-heading text-2xl font-bold text-foreground">{t.dashboard.myProfile}</h1>
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
                      {uploadingPhoto ? t.dashboard.uploading : t.dashboard.changePhoto}
                    </button>
                  </div>

                  {/* Full name */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">{t.dashboard.fullName}</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder={t.dashboard.fullNamePlaceholder}
                      className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">{t.dashboard.bio}</label>
                    <textarea
                      value={profileBio}
                      onChange={e => setProfileBio(e.target.value.slice(0, 500))}
                      placeholder={t.dashboard.bioPlaceholder}
                      className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                      rows={3}
                    />
                    <p className="text-right text-xs text-muted-foreground">{profileBio.length}/500</p>
                  </div>

                  {/* Occupation */}
                  <div>
                    <p className="mb-2 text-sm font-medium text-foreground">{t.dashboard.occupation}</p>
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
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-foreground">{t.dashboard.verification}</h3>
                      {profile?.is_email_verified && profile?.is_phone_verified && (
                        <span className="rounded-full bg-success-bg px-2 py-0.5 text-xs font-medium text-success">{t.dashboard.fullyVerifiedBadge}</span>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium ${profile?.is_email_verified ? "text-success" : "text-muted-foreground"}`}>
                          {profile?.is_email_verified ? "✓" : "○"} {t.dashboard.email}
                        </span>
                        {profile?.is_email_verified && <span className="text-xs text-success">{t.dashboard.verifiedLabel}</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium ${profile?.is_phone_verified ? "text-success" : "text-warning"}`}>
                          {profile?.is_phone_verified ? "✓" : "⚠"} {t.dashboard.phone}
                        </span>
                        {profile?.is_phone_verified
                          ? <span className="text-xs text-success">{t.dashboard.verifiedLabel}</span>
                          : <Link to="/verify-phone" className="text-xs font-medium text-primary">{t.dashboard.verifyNow}</Link>
                        }
                      </div>
                    </div>
                  </div>

                  {/* Save */}
                  <button
                    onClick={handleSaveProfile}
                    disabled={savingProfile}
                    className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-dark transition-colors disabled:opacity-50"
                  >
                    {savingProfile ? t.dashboard.saving : t.dashboard.saveChanges}
                  </button>

                  {/* Security link */}
                  <button
                    onClick={() => openUserProfile()}
                    className="block text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {t.dashboard.passwordSecurity}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {reportTarget && (
        <ReportModal
          open={!!reportTarget}
          onOpenChange={(v) => { if (!v) setReportTarget(null); }}
          targetType="user"
          targetId={reportTarget.userId}
        />
      )}

      {/* Boost modal */}
      {boostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 animate-in fade-in-0 duration-200" onClick={() => setBoostModal(null)}>
          <div className="mx-4 w-full max-w-sm rounded-xl bg-card p-6 shadow-lg animate-in zoom-in-95 fade-in-0 duration-200 ease-ui" onClick={e => e.stopPropagation()}>
            <h3 className="mb-2 font-heading text-lg font-bold text-foreground">{t.dashboard.boostTitle}</h3>
            <p className="mb-1 text-sm text-muted-foreground">{t.dashboard.boostDesc}</p>
            <p className="mb-4 text-lg font-bold text-foreground">€3.00 <span className="text-sm font-normal text-muted-foreground">{t.dashboard.boostPriceSub}</span></p>
            <button onClick={() => handleBoost(boostModal)} disabled={boostLoading}
              className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">
              {boostLoading ? t.dashboard.boosting : t.dashboard.boostNow}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
