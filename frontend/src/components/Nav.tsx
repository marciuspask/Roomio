import { Link, useNavigate } from "react-router-dom";
import { useAuth, UserButton } from "@clerk/react";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const Nav = () => {
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="font-heading text-xl font-bold text-foreground">
          Roomi<span className="text-primary">o</span>
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-6 md:flex">
          <Link to="/listings" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Browse rooms
          </Link>
          <Link to="/#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            How it works
          </Link>
        </div>
        <div className="hidden items-center gap-3 md:flex">
          {isSignedIn ? (
            <>
              <Link to="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Dashboard
              </Link>
              <UserButton />
              <button
                onClick={() => navigate("/listings/create")}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-dark transition-colors"
              >
                Post a room →
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-lg border border-border bg-transparent px-4 py-2 text-sm font-medium text-foreground hover:bg-surface-elevated transition-colors"
              >
                Log in
              </Link>
              <Link
                to="/listings/create"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-dark transition-colors"
              >
                Post a room →
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
        <div className="border-t border-border bg-background px-4 pb-4 pt-2 md:hidden">
          <div className="flex flex-col gap-3">
            <Link to="/listings" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-muted-foreground">Browse rooms</Link>
            {isSignedIn ? (
              <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-muted-foreground">Dashboard</Link>
            ) : (
              <Link to="/login" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-muted-foreground">Log in</Link>
            )}
            <Link
              to="/listings/create"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg bg-primary px-4 py-2 text-center text-sm font-medium text-primary-foreground"
            >
              Post a room →
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Nav;
