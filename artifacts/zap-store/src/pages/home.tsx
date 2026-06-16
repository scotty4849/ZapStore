import { Link } from "wouter";
import { useGetStats, useListProducts, useListUpdates } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";

function ProductCard({ product }: { product: { id: number; name: string; description: string; category: string; price: string; featured?: boolean | null } }) {
  return (
    <Link href={`/products/${product.id}`} className="block group">
      <div className="zap-card overflow-hidden h-full flex flex-col">
        <div className="product-image-bg h-44 flex items-center justify-center">
          <div className="text-5xl opacity-10 font-black text-primary select-none font-mono">
            {product.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="p-4 flex flex-col flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="tag-badge tag-stable">{product.category}</span>
            {product.featured && <span className="tag-badge tag-featured">Featured</span>}
          </div>
          <h3 className="font-bold text-foreground text-base mb-1 group-hover:text-primary transition-colors">{product.name}</h3>
          <p className="text-muted-foreground text-xs line-clamp-2 mb-4 flex-1">{product.description}</p>
          <button className="zap-btn-primary w-full justify-center">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><path d="M1 6h10M6 1l5 5-5 5"/></svg>
            Open Ticket
          </button>
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useGetStats();
  const { data: products, isLoading: productsLoading } = useListProducts();
  const { data: updates, isLoading: updatesLoading } = useListUpdates();

  const featuredProducts = products?.filter((p) => p.featured).slice(0, 4) || products?.slice(0, 4) || [];
  const latestUpdates = updates?.slice(0, 3) || [];

  return (
    <div>
      <section className="max-w-7xl mx-auto px-4 pt-12 pb-16">
        <div className="mb-6">
          <span className="inline-flex items-center gap-2 border border-primary/40 text-primary text-xs font-mono font-bold px-3 py-1.5 rounded-full">
            <span className="status-dot"></span>
            SYSTEM_ACTIVE // by XSCXRX
          </span>
        </div>

        <div className="max-w-3xl mb-8">
          <h1 className="hero-text text-6xl md:text-8xl text-foreground mb-0">
            DEPLOY
          </h1>
          <h1 className="hero-text text-6xl md:text-8xl text-primary mb-0">
            CODYCHAT
          </h1>
          <h1 className="hero-text text-6xl md:text-8xl text-foreground mb-6">
            ADDONS.
          </h1>
          <p className="text-muted-foreground text-base max-w-lg">
            The definitive exchange for high-performance Codychat expansions. Built by <strong className="text-foreground">XSCXRX</strong>, engineered for the elite.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/products" className="zap-btn-primary text-sm px-6 py-3">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M7 1L1 7.5h5L4.5 13 11 6.5H6L7 1Z"/></svg>
            BROWSE_MODULES →
          </Link>
          <Link href="/news" className="zap-btn-outline text-sm px-6 py-3">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="3" width="12" height="9" rx="1"/><path d="M1 6h12M4 3V2M10 3V2"/></svg>
            VIEW_DOCS
          </Link>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
          {[
            { label: "Total Modules", value: stats?.totalProducts ?? "—", loading: statsLoading },
            { label: "Open Tickets", value: stats?.openTickets ?? "—", loading: statsLoading },
            { label: "Active Users", value: stats?.totalUsers ?? "—", loading: statsLoading },
            { label: "Latest Patch", value: stats?.latestUpdate ?? "—", loading: statsLoading, truncate: true },
          ].map(({ label, value, loading, truncate }) => (
            <div key={label} className="px-4 py-3 first:pl-0 last:pr-0">
              <div className="text-muted-foreground text-xs font-mono uppercase tracking-wider mb-0.5">{label}</div>
              {loading ? (
                <Skeleton className="h-6 w-20 bg-secondary" />
              ) : (
                <div className={`font-bold text-foreground text-sm font-mono ${truncate ? "truncate max-w-[140px]" : ""}`}>
                  {value}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-foreground text-lg">
            Featured Modules
          </h2>
          <Link href="/products" className="text-xs text-muted-foreground hover:text-primary transition-colors font-mono uppercase tracking-wider">
            View All →
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {productsLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="zap-card overflow-hidden">
                <Skeleton className="h-44 w-full bg-secondary" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-4 w-20 bg-secondary" />
                  <Skeleton className="h-5 w-3/4 bg-secondary" />
                  <Skeleton className="h-3 w-full bg-secondary" />
                  <Skeleton className="h-9 w-full bg-secondary mt-2" />
                </div>
              </div>
            ))
          ) : featuredProducts.length > 0 ? (
            featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="col-span-full py-16 text-center text-muted-foreground font-mono text-sm">
              NO_MODULES_FOUND
            </div>
          )}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 pb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-foreground text-lg">System Logs</h2>
          <Link href="/news" className="text-xs text-muted-foreground hover:text-primary transition-colors font-mono uppercase tracking-wider">
            Read All →
          </Link>
        </div>

        <div className="zap-card divide-y divide-border">
          {updatesLoading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-5 w-full bg-secondary" />
              <Skeleton className="h-5 w-3/4 bg-secondary" />
              <Skeleton className="h-5 w-5/6 bg-secondary" />
            </div>
          ) : latestUpdates.length > 0 ? (
            latestUpdates.map((update) => (
              <div key={update.id} className="p-4 flex gap-4">
                <span className="text-primary text-xs font-mono font-bold whitespace-nowrap pt-0.5">
                  [{new Date(update.createdAt).toISOString().slice(0, 10)}]
                </span>
                <div>
                  <div className="text-foreground font-semibold text-sm mb-0.5">{update.title}</div>
                  <p className="text-muted-foreground text-xs line-clamp-2">{update.content}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-muted-foreground font-mono text-sm">NO_RECENT_LOGS</div>
          )}
        </div>
      </section>
    </div>
  );
}
