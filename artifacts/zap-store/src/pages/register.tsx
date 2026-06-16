import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useRegister } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Register() {
  const [, setLocation] = useLocation();
  const { refetch } = useAuth();
  const { toast } = useToast();
  
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const registerMutation = useRegister();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !email || !password) {
      toast({
        title: "ERROR",
        description: "ALL_FIELDS_REQUIRED",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "ERROR",
        description: "PASSWORD_TOO_SHORT",
        variant: "destructive",
      });
      return;
    }

    registerMutation.mutate({
      data: { username, email, password }
    }, {
      onSuccess: () => {
        toast({
          title: "SUCCESS",
          description: "REGISTRATION_COMPLETE",
        });
        refetch();
        setLocation("/");
      },
      onError: (err: any) => {
        toast({
          title: "ERROR",
          description: err.message || "REGISTRATION_FAILED",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12">
      <div className="w-full max-w-md terminal-box p-8 space-y-8 bg-black/80">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-accent terminal-glow uppercase tracking-widest">
            INITIALIZE_USER
          </h1>
          <p className="text-muted-foreground text-sm">CREATE_NEW_ACCOUNT</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-accent uppercase tracking-widest flex justify-between">
                <span>USERNAME</span>
                <span className="text-muted-foreground/50">REQ</span>
              </label>
              <Input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-black/50 border-accent/50 text-foreground rounded-none focus-visible:ring-accent font-mono h-12"
                placeholder="new_user"
                autoComplete="username"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-accent uppercase tracking-widest flex justify-between">
                <span>EMAIL</span>
                <span className="text-muted-foreground/50">REQ</span>
              </label>
              <Input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-black/50 border-accent/50 text-foreground rounded-none focus-visible:ring-accent font-mono h-12"
                placeholder="user@system.net"
                autoComplete="email"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-accent uppercase tracking-widest flex justify-between">
                <span>PASSWORD</span>
                <span className="text-muted-foreground/50">MIN_6</span>
              </label>
              <Input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-black/50 border-accent/50 text-foreground rounded-none focus-visible:ring-accent font-mono h-12"
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={registerMutation.isPending}
            className="w-full h-14 bg-accent text-accent-foreground hover:bg-accent/90 uppercase font-bold tracking-widest rounded-none border border-accent hover:shadow-[0_0_15px_rgba(0,255,255,0.5)] transition-all"
          >
            {registerMutation.isPending ? "PROCESSING..." : "REGISTER"}
          </Button>
        </form>

        <div className="text-center pt-4 border-t border-accent/20 text-sm text-muted-foreground">
          EXISTING_USER? <Link href="/login" className="text-accent hover:text-primary hover:underline transition-colors">LOGIN_HERE</Link>
        </div>
      </div>
    </div>
  );
}
