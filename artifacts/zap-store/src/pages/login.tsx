import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useLogin } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Login() {
  const [, setLocation] = useLocation();
  const { refetch } = useAuth();
  const { toast } = useToast();
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  const loginMutation = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast({
        title: "ERROR",
        description: "CREDENTIALS_REQUIRED",
        variant: "destructive",
      });
      return;
    }

    loginMutation.mutate({
      data: { username, password }
    }, {
      onSuccess: () => {
        toast({
          title: "SUCCESS",
          description: "ACCESS_GRANTED",
        });
        refetch();
        setLocation("/");
      },
      onError: (err: any) => {
        toast({
          title: "ACCESS_DENIED",
          description: err.message || "INVALID_CREDENTIALS",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-md terminal-box p-8 space-y-8 bg-black/80">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-primary terminal-glow uppercase tracking-widest">
            ACCESS_TERMINAL
          </h1>
          <p className="text-muted-foreground text-sm">PLEASE_AUTHENTICATE</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-primary uppercase tracking-widest flex justify-between">
                <span>USERNAME</span>
                <span className="text-muted-foreground/50">REQ</span>
              </label>
              <Input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-black/50 border-primary/50 text-foreground rounded-none focus-visible:ring-primary font-mono h-12"
                placeholder="root"
                autoComplete="username"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-primary uppercase tracking-widest flex justify-between">
                <span>PASSWORD</span>
                <span className="text-muted-foreground/50">REQ</span>
              </label>
              <Input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-black/50 border-primary/50 text-foreground rounded-none focus-visible:ring-primary font-mono h-12"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={loginMutation.isPending}
            className="w-full h-14 bg-primary text-primary-foreground hover:bg-primary/90 uppercase font-bold tracking-widest rounded-none border border-primary hover:shadow-[0_0_15px_rgba(0,255,65,0.5)] transition-all"
          >
            {loginMutation.isPending ? "AUTHENTICATING..." : "LOGIN"}
          </Button>
        </form>

        <div className="text-center pt-4 border-t border-primary/20 text-sm text-muted-foreground">
          NEW_USER? <Link href="/register" className="text-primary hover:text-accent hover:underline transition-colors">REGISTER_HERE</Link>
        </div>
      </div>
    </div>
  );
}
