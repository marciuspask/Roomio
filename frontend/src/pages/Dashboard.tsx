import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { mockListings, mockConversations, mockCurrentUser } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";
import { Home, LayoutList, MessageSquare, User, Settings, Plus, Eye, Zap, MoreVertical, ArrowLeft } from "lucide-react";

const Dashboard = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const path = location.pathname;
  const activeTab = path.includes("/messages") ? "messages" : path.includes("/listings") ? "listings" : path.includes("/profile") ? "profile" : "overview";

  const myListings = mockListings.filter(l => mockCurrentUser.myListings.includes(l.id));
  const totalViews = myListings.reduce((s, l) => s + l.views, 0);
  const totalUnread = mockConversations.reduce((s, c) => s + c.unread, 0);

  // Messages state
  const [selectedConvo, setSelectedConvo] = useState<string | null>(null);
  const [newMsg, setNewMsg] = useState("");
  const [extraMessages, setExtraMessages] = useState<Record<string, { senderId: string; text: string; time: string }[]>>({});

  // Profile state
  const [profileName, setProfileName] = useState(currentUser.name);
  const [profileBio, setProfileBio] = useState(currentUser.bio);
  const [profileOccupation, setProfileOccupation] = useState<"student" | "working" | "other">(currentUser.occupation);
  const [savingProfile, setSavingProfile] = useState(false);

  // Boost modal
  const [boostModal, setBoostModal] = useState<string | null>(null);
  const [boostLoading, setBoostLoading] = useState(false);
  const [boostedIds, setBoostedIds] = useState<string[]>([]);

  const navItems = [
    { id: "overview", label: "Overview", icon: Home, path: "/dashboard" },
    { id: "listings", label: "My Listings", icon: LayoutList, path: "/dashboard/listings" },
    { id: "messages", label: "Messages", icon: MessageSquare, path: "/dashboard/messages", badge: totalUnread },
    { id: "profile", label: "My Profile", icon: User, path: "/dashboard/profile" },
  ];

  const handleSendMessage = (convoId: string) => {
    if (!newMsg.trim()) return;
    setExtraMessages(prev => ({
      ...prev,
      [convoId]: [...(prev[convoId] || []), { senderId: "current", text: newMsg, time: new Date().toISOString() }]
    }));
    setNewMsg("");
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

  const handleSaveProfile = () => {
    setSavingProfile(true);
    setTimeout(() => {
      setSavingProfile(false);
      toast({ title: "Profile updated ✓" });
    }, 1000);
  };

  const selectedConversation = mockConversations.find(c => c.id === selectedConvo);

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
              className={`mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                activeTab === item.id
                  ? "border-l-2 border-primary bg-primary-light text-primary"
                  : "text-muted-foreground hover:bg-surface-elevated hover:text-foreground"
              }`}>
              <item.icon size={18} />
              {item.label}
              {item.badge ? <span className="ml-auto rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">{item.badge}</span> : null}
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
            <item.icon size={18} />
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
              <h1 className="mb-6 font-heading text-2xl font-bold text-foreground">Good morning, {currentUser.name.split(" ")[0]} 👋</h1>

              {!currentUser.isPhoneVerified && (
                <div className="mb-6 rounded-xl border border-warning/30 bg-warning-bg p-4">
                  <h3 className="mb-1 text-sm font-semibold text-warning">Your profile is incomplete</h3>
                  <div className="mb-2 h-2 w-full rounded-full bg-warning/20">
                    <div className="h-2 w-[65%] rounded-full bg-warning" />
                  </div>
                  <p className="mb-2 text-xs text-warning">✓ Email verified · ⚠ Phone not verified</p>
                  <Link to="/verify-phone" className="text-xs font-medium text-primary">Verify phone →</Link>
                </div>
              )}

              <div className="mb-6 grid grid-cols-3 gap-4">
                {[
                  { label: "Active listings", value: myListings.length },
                  { label: "Unread messages", value: totalUnread },
                  { label: "Listing views", value: totalViews },
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
                {myListings.map(l => (
                  <div key={l.id} className="flex items-center gap-4 rounded-xl border border-border bg-card p-3 shadow-sm">
                    <img src={l.photos[0]} alt="" className="h-16 w-20 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <h4 className="truncate text-sm font-medium text-foreground">{l.title}</h4>
                      <p className="text-xs text-muted-foreground">{l.district} · €{l.price}/mo</p>
                    </div>
                    <span className="rounded-full bg-success-bg px-2 py-0.5 text-xs font-medium text-success">Active</span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground"><Eye size={12} /> {l.views}</span>
                  </div>
                ))}
              </div>

              {/* Recent messages */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="font-heading text-lg font-bold text-foreground">Recent messages</h2>
                  <Link to="/dashboard/messages" className="text-xs font-medium text-primary">View all →</Link>
                </div>
                <div className="space-y-2">
                  {mockConversations.map(c => (
                    <Link key={c.id} to="/dashboard/messages"
                      className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-sm hover:border-primary transition-colors">
                      <img src={c.withUser.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">{c.withUser.name}</span>
                          <span className="truncate text-xs text-muted-foreground">{c.listingTitle}</span>
                        </div>
                        <p className="truncate text-xs text-muted-foreground">{c.lastMessage}</p>
                      </div>
                      {c.unread > 0 && <div className="h-2 w-2 rounded-full bg-primary" />}
                    </Link>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* MY LISTINGS */}
          {activeTab === "listings" && (
            <>
              <h1 className="mb-6 font-heading text-2xl font-bold text-foreground">My Listings</h1>
              {myListings.length === 0 ? (
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
                      <img src={l.photos[0]} alt="" className="h-20 w-28 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-foreground">{l.title}</h4>
                        <p className="text-xs text-muted-foreground">{l.district} · €{l.price}/mo</p>
                      </div>
                      <span className="rounded-full bg-success-bg px-2 py-0.5 text-xs font-medium text-success">Active</span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground"><Eye size={12} /> {l.views} views</span>
                      <button className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface-elevated">Edit</button>
                      {boostedIds.includes(l.id) ? (
                        <span className="rounded-full bg-primary-light px-2 py-0.5 text-xs font-medium text-primary-dark">⚡ Featured</span>
                      ) : (
                        <button onClick={() => setBoostModal(l.id)}
                          className="rounded-lg border border-primary/30 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary-light">
                          <Zap size={12} className="mr-1 inline" />Boost
                        </button>
                      )}
                    </div>
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
                {mockConversations.map(c => (
                  <button key={c.id} onClick={() => setSelectedConvo(c.id)}
                    className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors ${
                      selectedConvo === c.id ? "border-l-2 border-primary bg-primary-light" : "hover:bg-surface-elevated"
                    }`}>
                    <img src={c.withUser.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">{c.withUser.name}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(c.lastMessageTime).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                        </span>
                      </div>
                      <p className="truncate text-xs text-muted-foreground">{c.listingTitle}</p>
                      <p className="truncate text-xs text-muted-foreground">{c.lastMessage}</p>
                    </div>
                    {c.unread > 0 && <div className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
                  </button>
                ))}
              </div>

              {/* Message thread */}
              {selectedConversation ? (
                <div className={`${selectedConvo ? "flex" : "hidden md:flex"} flex-1 flex-col rounded-xl border border-border bg-card`}>
                  <div className="flex items-center gap-3 border-b border-border p-4">
                    <button onClick={() => setSelectedConvo(null)} className="md:hidden"><ArrowLeft size={18} /></button>
                    <img src={selectedConversation.withUser.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
                    <div>
                      <span className="text-sm font-medium text-foreground">{selectedConversation.withUser.name}</span>
                      <p className="text-xs text-muted-foreground">{selectedConversation.listingTitle}</p>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {[...selectedConversation.messages, ...(extraMessages[selectedConversation.id] || [])].map((m, i) => (
                      <div key={i} className={`flex ${m.senderId === "current" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[70%] rounded-xl px-3 py-2 text-sm ${
                          m.senderId === "current"
                            ? "bg-primary text-primary-foreground"
                            : "bg-surface-elevated text-foreground"
                        }`}>
                          {m.text}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 border-t border-border p-3">
                    <input
                      value={newMsg}
                      onChange={e => setNewMsg(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleSendMessage(selectedConversation.id)}
                      placeholder="Type a message..."
                      className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                    <button onClick={() => handleSendMessage(selectedConversation.id)}
                      className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                      Send
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
              <div className="max-w-lg space-y-4">
                <div className="flex items-center gap-4">
                  <img src={currentUser.avatar} alt="" className="h-16 w-16 rounded-full object-cover" />
                  <button className="text-sm font-medium text-primary">Change photo</button>
                </div>
                <input type="text" value={profileName} onChange={e => setProfileName(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary" />
                <div>
                  <textarea value={profileBio} onChange={e => setProfileBio(e.target.value.slice(0, 200))}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary" rows={3} />
                  <p className="text-right text-xs text-muted-foreground">{profileBio.length}/200</p>
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium text-foreground">Occupation</p>
                  <div className="flex gap-2">
                    {(["student", "working", "other"] as const).map(o => (
                      <button key={o} onClick={() => setProfileOccupation(o)}
                        className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                          profileOccupation === o ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground"
                        }`}>
                        {o}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-card p-4">
                  <h3 className="mb-2 text-sm font-semibold text-foreground">Verification</h3>
                  <p className="text-xs text-success">✓ Email verified</p>
                  {currentUser.isPhoneVerified ? (
                    <p className="text-xs text-success">✓ Phone verified</p>
                  ) : (
                    <p className="text-xs text-warning">
                      ⚠ Phone not verified · <Link to="/verify-phone" className="font-medium text-primary">Verify now →</Link>
                    </p>
                  )}
                </div>
                <button onClick={handleSaveProfile} disabled={savingProfile}
                  className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-dark transition-colors disabled:opacity-50">
                  {savingProfile ? "Saving..." : "Save changes"}
                </button>
              </div>
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
