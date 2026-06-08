import { Link, useNavigate } from "react-router-dom";
import { useAuth, UserButton } from "@clerk/react";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/lib/i18n";

const Nav = () => {
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { lang, setLang, t } = useLanguage();

  const LangToggle = () => (
    <button
      onClick={() => setLang(lang === "en" ? "lt" : "en")}
      className="flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs font-semibold text-muted-foreground hover:border-foreground hover:text-foreground transition-colors"
      aria-label="Toggle language"
    >
      <span className={lang === "en" ? "text-foreground" : "opacity-40"}>EN</span>
      <span className="select-none text-muted-foreground/40">|</span>
      <span className={lang === "lt" ? "text-foreground" : "opacity-40"}>LT</span>
    </button>
  );

  return (
    <nav className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="font-heading text-xl font-bold text-foreground">
          Roomi<span className="text-primary">o</span>
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-6 md:flex">
          <Link to="/listings" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            {t.nav.browseRooms}
          </Link>
          <Link to="/#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            {t.nav.howItWorks}
          </Link>
        </div>
        <div className="hidden items-center gap-3 md:flex">
          <LangToggle />
          {isSignedIn ? (
            <>
              <Link to="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                {t.nav.dashboard}
              </Link>
              <UserButton userProfileUrl="/dashboard/profile" userProfileMode="navigation" />
              <button
                onClick={() => navigate("/listings/create")}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-dark transition-colors"
              >
                {t.nav.postRoom}
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-lg border border-border bg-transparent px-4 py-2 text-sm font-medium text-foreground hover:bg-surface-elevated transition-colors"
              >
                {t.nav.logIn}
              </Link>
              <Link
                to="/listings/create"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-dark transition-colors"
              >
                {t.nav.postRoom}
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-foreground">
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-background px-4 pb-4 pt-2 md:hidden animate-in fade-in-0 slide-in-from-top-2 duration-200 ease-ui">
          <div className="flex flex-col gap-3">
            <Link to="/listings" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-muted-foreground">{t.nav.browseRooms}</Link>
            {isSignedIn ? (
              <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-muted-foreground">{t.nav.dashboard}</Link>
            ) : (
              <Link to="/login" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-muted-foreground">{t.nav.logIn}</Link>
            )}
            <Link
              to="/listings/create"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg bg-primary px-4 py-2 text-center text-sm font-medium text-primary-foreground"
            >
              {t.nav.postRoomShort}
            </Link>
            <div className="pt-1">
              <LangToggle />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Nav;
