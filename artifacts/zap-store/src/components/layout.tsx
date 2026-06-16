import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useLogout } from "@workspace/api-client-react";

function ZapLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M11.5 2L4 11.5H10L8.5 18L16 8.5H10L11.5 2Z" fill="currentColor"/>
    </svg>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  const { user, refetch } = useAuth();
  const logout = useLogout();
  const [location, setLocation] = useLocation();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        refetch();
        setLocation("/");
      }
    });
  };

  const isAdmin = user && (user.role === "admin" || user.role === "owner");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-1.5 text-primary shrink-0">
            <ZapLogo />
            <span className="font-black text-base tracking-tight">
              <span className="text-foreground">ZAP</span><span className="text-foreground">STORE</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 mx-auto">
            <Link href="/" className={location === "/" ? "nav-tab-active" : "nav-tab"}>
              Terminal
            </Link>
            <Link href="/products" className={location === "/products" || location.startsWith("/products/") ? "nav-tab-active" : "nav-tab"}>
              Modules
            </Link>
            <Link href="/news" className={location === "/news" ? "nav-tab-active" : "nav-tab"}>
              News
            </Link>
          </nav>

          <div className="flex items-center gap-2 ml-auto shrink-0">
            {user ? (
              <>
                <Link
                  href="/tickets"
                  className="hidden sm:flex items-center gap-1.5 border border-primary/40 text-primary text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded hover:bg-primary/10 transition-colors"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5" fill="none"/><circle cx="6" cy="6" r="2" fill="currentColor"/></svg>
                  Support
                </Link>

                {isAdmin && (
                  <Link
                    href="/admin"
                    className="hidden sm:flex items-center gap-1.5 border border-purple-500/50 text-purple-400 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded hover:bg-purple-500/10 transition-colors"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5" fill="none"/><path d="M4 6h4M6 4v4" stroke="currentColor" strokeWidth="1.5"/></svg>
                    Admin
                  </Link>
                )}

                <div className="hidden sm:flex items-center gap-1.5 bg-secondary border border-border text-xs font-mono font-bold uppercase tracking-wider px-3 py-1.5 rounded text-foreground">
                  <span className="status-dot"></span>
                  {user.username}
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center w-8 h-8 rounded border border-border hover:border-destructive/50 hover:text-destructive text-muted-foreground transition-colors"
                  title="Logout"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M5 2H2v10h3M9 10l3-3-3-3M12 7H5"/>
                  </svg>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 border border-border text-muted-foreground text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded hover:border-primary/40 hover:text-foreground transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded hover:opacity-90 transition-opacity"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground font-mono">
        <p>SYSTEM.ZAPSTORE // V.1.0 // {new Date().getFullYear()} // XSCXRX</p>
      </footer>
    </div>
  );
}
