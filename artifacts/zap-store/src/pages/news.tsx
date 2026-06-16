import { useListUpdates } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function News() {
  const { data: updates, isLoading } = useListUpdates();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="border-b border-primary/30 pb-4">
        <h1 className="text-3xl font-bold text-primary terminal-glow uppercase">
          &gt; SYSTEM_NEWS
        </h1>
        <p className="text-muted-foreground mt-2">PATCH_NOTES_AND_UPDATES</p>
      </div>

      <div className="terminal-box p-4 sm:p-8 space-y-8 bg-black/40">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-3 pb-6 border-b border-primary/20">
              <Skeleton className="h-6 w-1/3 bg-primary/20" />
              <Skeleton className="h-4 w-full bg-primary/20" />
              <Skeleton className="h-4 w-5/6 bg-primary/20" />
            </div>
          ))
        ) : updates && updates.length > 0 ? (
          updates.map((update) => {
            // Determine prefix style based on title
            let prefixClass = "text-primary";
            const titleUpper = update.title.toUpperCase();
            if (titleUpper.includes("[UPDATE]")) prefixClass = "text-accent";
            else if (titleUpper.includes("[PATCH]")) prefixClass = "text-yellow-400";
            else if (titleUpper.includes("[ALERT]") || titleUpper.includes("[CRITICAL]")) prefixClass = "text-destructive";

            return (
              <div key={update.id} className="border-b border-primary/20 last:border-0 pb-8 last:pb-0 relative group">
                <div className="absolute -left-3 top-2 opacity-0 group-hover:opacity-100 text-primary transition-opacity">
                  &gt;
                </div>
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-4">
                  <h2 className={`text-xl font-bold ${prefixClass} tracking-wide`}>
                    {update.title}
                  </h2>
                  <div className="text-xs text-muted-foreground font-mono bg-black/60 px-2 py-1 border border-primary/20 whitespace-nowrap">
                    LOG_DATE: {format(new Date(update.createdAt), "yyyy-MM-dd")}
                  </div>
                </div>
                
                <div className="prose prose-invert prose-p:text-muted-foreground prose-p:leading-relaxed max-w-none font-mono text-sm">
                  <p className="whitespace-pre-wrap pl-4 border-l border-primary/30">{update.content}</p>
                </div>
                
                <div className="mt-4 text-xs text-primary/60 flex items-center gap-2">
                  <span>// AUTHORIZED_BY:</span>
                  <span className="text-primary">{update.authorUsername || 'SYSTEM'}</span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center text-muted-foreground py-12">
            NO_LOG_ENTRIES_FOUND
          </div>
        )}
      </div>
    </div>
  );
}
