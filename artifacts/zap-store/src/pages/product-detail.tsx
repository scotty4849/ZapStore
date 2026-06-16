import { useState } from "react";
import { useRoute, Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { 
  useGetProduct, 
  getGetProductQueryKey, 
  useCreateTicket,
  getListTicketsQueryKey
} from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function ProductDetail() {
  const [, params] = useRoute("/products/:id");
  const productId = params?.id ? parseInt(params.id, 10) : 0;
  
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [message, setMessage] = useState("");

  const { data: product, isLoading, isError } = useGetProduct(productId, {
    query: {
      enabled: !!productId,
      queryKey: getGetProductQueryKey(productId),
    }
  });

  const createTicket = useCreateTicket();

  const handleRequest = async () => {
    if (!message.trim()) {
      toast({
        title: "ERROR",
        description: "MESSAGE_CANNOT_BE_EMPTY",
        variant: "destructive",
      });
      return;
    }

    createTicket.mutate({
      data: {
        productId,
        message,
      }
    }, {
      onSuccess: () => {
        toast({
          title: "SUCCESS",
          description: "TICKET_CREATED_SUCCESSFULLY",
        });
        setIsDialogOpen(false);
        setMessage("");
        queryClient.invalidateQueries({ queryKey: getListTicketsQueryKey() });
      },
      onError: (err: any) => {
        toast({
          title: "ERROR",
          description: err.message || "FAILED_TO_CREATE_TICKET",
          variant: "destructive",
        });
      }
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-10 w-1/3 bg-primary/20" />
        <div className="terminal-box p-8 space-y-6">
          <Skeleton className="h-8 w-1/4 bg-primary/20" />
          <Skeleton className="h-32 w-full bg-primary/20" />
          <div className="flex gap-4">
            <Skeleton className="h-12 w-32 bg-primary/20" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="terminal-box p-12 text-center text-destructive border-destructive">
          <h1 className="text-3xl font-bold mb-4">ERR_MODULE_NOT_FOUND</h1>
          <p className="text-muted-foreground mb-8">The requested addon could not be located in the database.</p>
          <Link href="/products" className="text-primary hover:underline">
            &lt;&lt; RETURN_TO_CATALOG
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/products" className="hover:text-primary transition-colors">CATALOG</Link>
        <span>/</span>
        <span className="text-primary">{product.category.toUpperCase()}</span>
        <span>/</span>
        <span className="text-accent">{product.name.toUpperCase()}</span>
      </div>

      <div className="terminal-box p-8 relative overflow-hidden">
        {/* Decorative corner accents */}
        <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-accent/50 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-accent/50 pointer-events-none" />

        <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs text-accent px-2 py-1 bg-accent/10 border border-accent/30 uppercase tracking-wider">
                {product.category}
              </span>
              {product.featured && (
                <span className="text-xs text-yellow-400 px-2 py-1 bg-yellow-400/10 border border-yellow-400/30 uppercase tracking-wider">
                  FEATURED
                </span>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-primary terminal-glow uppercase tracking-tighter">
              {product.name}
            </h1>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground uppercase tracking-widest mb-1">LICENSE_COST</div>
            <div className="text-4xl font-bold text-accent">${product.price}</div>
          </div>
        </div>

        <div className="border-t border-b border-primary/20 py-8 mb-8">
          <h3 className="text-sm text-primary mb-4 uppercase tracking-widest font-bold">&gt; MODULE_DESCRIPTION</h3>
          <div className="prose prose-invert prose-p:text-muted-foreground prose-p:leading-relaxed max-w-none font-mono">
            <p className="whitespace-pre-wrap">{product.description}</p>
          </div>
        </div>

        <div className="flex items-center justify-between bg-primary/5 p-6 border border-primary/20">
          <div className="text-sm text-muted-foreground">
            <div>STATUS: <span className={product.active ? "text-primary" : "text-destructive"}>{product.active ? "ONLINE" : "OFFLINE"}</span></div>
            <div>MODULE_ID: {product.id.toString().padStart(6, '0')}</div>
          </div>
          
          {user ? (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  disabled={!product.active}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-none h-12 px-8 uppercase font-bold tracking-widest border border-primary hover:shadow-[0_0_15px_rgba(0,255,65,0.5)] transition-all"
                >
                  {product.active ? "REQUEST_ADDON" : "UNAVAILABLE"}
                </Button>
              </DialogTrigger>
              <DialogContent className="terminal-box bg-background sm:max-w-[500px] border-primary rounded-none">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-primary uppercase terminal-glow">
                    &gt; INITIATE_REQUEST
                  </DialogTitle>
                  <DialogDescription className="text-muted-foreground font-mono">
                    Submit your requirements or questions for {product.name}.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm text-primary font-bold uppercase tracking-widest">
                      MESSAGE_PAYLOAD
                    </label>
                    <Textarea 
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Enter your request details..."
                      className="min-h-[150px] bg-black/50 border-primary/50 text-foreground rounded-none focus-visible:ring-primary font-mono placeholder:text-muted-foreground/50"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                    className="rounded-none border-primary/50 hover:bg-primary/20 text-primary uppercase tracking-widest"
                  >
                    CANCEL
                  </Button>
                  <Button 
                    onClick={handleRequest}
                    disabled={createTicket.isPending}
                    className="rounded-none bg-primary text-primary-foreground hover:bg-primary/90 uppercase tracking-widest"
                  >
                    {createTicket.isPending ? "TRANSMITTING..." : "SUBMIT_REQUEST"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          ) : (
            <Link href="/login">
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-none h-12 px-8 uppercase font-bold tracking-widest border border-accent hover:shadow-[0_0_15px_rgba(0,255,255,0.5)] transition-all">
                LOGIN_TO_ORDER
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
