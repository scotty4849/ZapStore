import { Redirect, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useListTickets } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function Tickets() {
  const { user, isLoading: authLoading } = useAuth();
  const { data: tickets, isLoading: ticketsLoading } = useListTickets({
    query: {
      enabled: !!user,
    } as any
  });

  if (authLoading) {
    return <div className="p-8 text-center text-primary">AUTHENTICATING...</div>;
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open': return 'text-primary border-primary bg-primary/10';
      case 'pending': return 'text-yellow-400 border-yellow-400 bg-yellow-400/10';
      case 'resolved': return 'text-accent border-accent bg-accent/10';
      case 'closed': return 'text-muted-foreground border-muted-foreground bg-muted/10';
      default: return 'text-primary border-primary bg-primary/10';
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="border-b border-primary/30 pb-4">
        <h1 className="text-3xl font-bold text-primary terminal-glow uppercase">
          &gt; MY_TICKETS
        </h1>
        <p className="text-muted-foreground mt-2">ACTIVE_REQUESTS_AND_SUPPORT_LOGS</p>
      </div>

      <div className="space-y-6">
        {ticketsLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="terminal-box p-6 space-y-4">
              <div className="flex justify-between">
                <Skeleton className="h-6 w-1/4 bg-primary/20" />
                <Skeleton className="h-6 w-24 bg-primary/20" />
              </div>
              <Skeleton className="h-4 w-full bg-primary/20" />
              <Skeleton className="h-4 w-3/4 bg-primary/20" />
            </div>
          ))
        ) : tickets && tickets.length > 0 ? (
          tickets.map((ticket) => (
            <div key={ticket.id} className="terminal-box p-6 flex flex-col md:flex-row gap-6">
              <div className="flex-1 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-primary/20 pb-4">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">
                      TICKET_ID: #{ticket.id.toString().padStart(6, '0')}
                    </div>
                    <Link href={`/products/${ticket.productId}`} className="text-xl font-bold text-primary hover:underline hover:text-accent transition-colors">
                      {ticket.productName}
                    </Link>
                  </div>
                  <div className={`px-3 py-1 text-xs font-bold uppercase tracking-widest border ${getStatusColor(ticket.status)}`}>
                    {ticket.status}
                  </div>
                </div>
                
                <div>
                  <div className="text-xs text-primary mb-2 uppercase font-bold tracking-widest">&gt; USER_MESSAGE</div>
                  <p className="text-sm text-foreground bg-black/40 p-4 border-l-2 border-primary/50 whitespace-pre-wrap">
                    {ticket.message}
                  </p>
                </div>

                {ticket.adminNotes && (
                  <div>
                    <div className="text-xs text-accent mb-2 uppercase font-bold tracking-widest">&gt; ADMIN_RESPONSE</div>
                    <p className="text-sm text-accent bg-accent/5 p-4 border-l-2 border-accent/50 whitespace-pre-wrap">
                      {ticket.adminNotes}
                    </p>
                  </div>
                )}
                
                <div className="text-xs text-muted-foreground pt-2">
                  CREATED: {format(new Date(ticket.createdAt), "yyyy-MM-dd HH:mm:ss")}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="terminal-box p-12 text-center">
            <div className="text-muted-foreground mb-4">NO_ACTIVE_TICKETS_FOUND</div>
            <Link href="/products" className="text-primary hover:text-accent transition-colors underline underline-offset-4">
              BROWSE_CATALOG
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
