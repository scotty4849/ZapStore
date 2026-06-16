import { Link } from "wouter";
import { useListProducts } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";

const STATUS_BADGES: Record<string, { label: string; className: string }> = {
  active: { label: "Stable", className: "tag-badge tag-stable" },
  coming_soon: { label: "Coming Soon", className: "tag-badge tag-beta" },
  not_for_sale: { label: "Not for Sale", className: "tag-badge" },
};

type Product = {
  id: number;
  name: string;
  description: string;
  category: string;
  price: string;
  status: string;
  featured?: boolean | null;
  imageUrl?: string | null;
};

function ProductCard({ product }: { product: Product }) {
  const { user } = useAuth();
  const badge = STATUS_BADGES[product.status] ?? STATUS_BADGES["active"];
  const canOrder = user && product.status === "active";

  return (
    <div className="zap-card overflow-hidden flex flex-col group">
      <div className="product-image-bg h-48 flex items-center justify-center relative overflow-hidden">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="text-6xl opacity-10 font-black text-primary select-none font-mono">
            {product.name.slice(0, 2).toUpperCase()}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="tag-badge tag-stable">{product.category}</span>
          {product.featured && <span className="tag-badge tag-featured">Featured</span>}
          <span className={badge.className + " ml-auto"}>{badge.label}</span>
        </div>

        <h3 className="font-bold text-foreground text-base mb-1 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <p className="text-muted-foreground text-xs line-clamp-2 mb-4 flex-1">
          {product.description}
        </p>

        <div className="flex items-center justify-between mb-3">
          <span className="font-bold text-primary font-mono text-sm">${product.price}</span>
        </div>

        {product.status === "active" && (
          canOrder ? (
            <Link href={`/products/${product.id}`} className="zap-btn-primary w-full justify-center text-xs">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 1v10M1 6h10"/></svg>
              Open Ticket
            </Link>
          ) : (
            <Link href="/login" className="zap-btn-outline w-full justify-center text-xs">
              Login to Request
            </Link>
          )
        )}
        {product.status === "coming_soon" && (
          <div className="text-center text-xs font-mono text-yellow-400 border border-yellow-400/30 rounded py-2 bg-yellow-400/5">
            Coming Soon
          </div>
        )}
        {product.status === "not_for_sale" && (
          <div className="text-center text-xs font-mono text-muted-foreground border border-border rounded py-2">
            Not Available
          </div>
        )}
      </div>
    </div>
  );
}

export default function Products() {
  const { data: products, isLoading } = useListProducts({ all: "true" });

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="font-black text-3xl text-foreground mb-1">
          Module <span className="text-primary">Catalog</span>
        </h1>
        <p className="text-muted-foreground text-sm">Browse all available Codychat addons and plugins.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="zap-card overflow-hidden">
              <Skeleton className="h-48 w-full bg-secondary" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-4 w-20 bg-secondary" />
                <Skeleton className="h-5 w-3/4 bg-secondary" />
                <Skeleton className="h-3 w-full bg-secondary" />
                <Skeleton className="h-9 w-full bg-secondary mt-2" />
              </div>
            </div>
          ))
        ) : products && products.length > 0 ? (
          products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <div className="col-span-full py-20 text-center font-mono text-muted-foreground text-sm">
            NO_MODULES_FOUND
          </div>
        )}
      </div>
    </div>
  );
}
