import { useState, useRef } from "react";
import { Redirect } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import {
  useListProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  getListProductsQueryKey,
  useListTickets,
  useUpdateTicket,
  getListTicketsQueryKey,
  useListUpdates,
  useCreateUpdate,
  useDeleteUpdate,
  getListUpdatesQueryKey,
  useListAdminUsers,
  useUpdateAdminUser,
  useDeleteAdminUser,
  getListAdminUsersQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  active: { label: "Active", color: "text-primary" },
  coming_soon: { label: "Coming Soon", color: "text-yellow-400" },
  not_for_sale: { label: "Not for Sale", color: "text-muted-foreground" },
};

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  user: { label: "User", color: "text-muted-foreground" },
  admin: { label: "Admin", color: "text-primary" },
  owner: { label: "Owner", color: "text-purple-400" },
};

export default function Admin() {
  const { user, isLoading: authLoading } = useAuth();

  if (authLoading) return (
    <div className="max-w-7xl mx-auto px-4 py-10 text-muted-foreground font-mono text-sm">
      AUTHORIZING...
    </div>
  );
  if (!user || (user.role !== "admin" && user.role !== "owner")) return <Redirect to="/" />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="font-black text-2xl text-foreground">
          System <span className="text-primary">Admin</span>
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5 font-mono">RESTRICTED_ACCESS // {user.username}</p>
      </div>

      <Tabs defaultValue="products" className="w-full">
        <TabsList className="bg-secondary border border-border h-10 rounded p-1 w-auto">
          <TabsTrigger value="products" className="rounded data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground font-semibold text-xs uppercase tracking-wider px-4">
            Products
          </TabsTrigger>
          <TabsTrigger value="tickets" className="rounded data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground font-semibold text-xs uppercase tracking-wider px-4">
            Tickets
          </TabsTrigger>
          <TabsTrigger value="news" className="rounded data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground font-semibold text-xs uppercase tracking-wider px-4">
            News
          </TabsTrigger>
          <TabsTrigger value="users" className="rounded data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground font-semibold text-xs uppercase tracking-wider px-4">
            Users
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="products"><ProductsTab /></TabsContent>
          <TabsContent value="tickets"><TicketsTab /></TabsContent>
          <TabsContent value="news"><NewsTab /></TabsContent>
          <TabsContent value="users"><UsersTab /></TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

function ImageUploader({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd, credentials: "include" });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json();
      onChange(url);
      toast({ title: "Image uploaded" });
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Product Image</label>
      <div className="flex gap-2 items-start">
        <div
          className="w-24 h-24 rounded border border-border bg-secondary flex items-center justify-center overflow-hidden shrink-0 cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => fileRef.current?.click()}
        >
          {value ? (
            <img src={value} alt="product" className="w-full h-full object-cover" />
          ) : (
            <span className="text-muted-foreground text-xs text-center px-1">Click to upload</span>
          )}
        </div>
        <div className="flex-1 space-y-2">
          <Input
            placeholder="Or paste image URL..."
            value={value}
            onChange={e => onChange(e.target.value)}
            className="bg-background border-border text-foreground text-sm rounded"
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="zap-btn-outline text-xs px-3 py-1.5"
          >
            {uploading ? "Uploading..." : "Upload File"}
          </button>
        </div>
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}

function ProductsTab() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: products, isLoading } = useListProducts({ all: "true" });

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("active");
  const [featured, setFeatured] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !category) { toast({ title: "Missing fields", variant: "destructive" }); return; }

    createProduct.mutate({
      data: { name, description, price, category, status: status as any, featured, imageUrl: imageUrl || null }
    }, {
      onSuccess: () => {
        toast({ title: "Product created" });
        setName(""); setDescription(""); setPrice(""); setCategory("");
        setStatus("active"); setFeatured(false); setImageUrl("");
        queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
      },
      onError: () => toast({ title: "Failed to create product", variant: "destructive" })
    });
  };

  const handleStatusChange = (id: number, newStatus: string) => {
    updateProduct.mutate({ id, data: { status: newStatus as any } }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() }),
    });
  };

  const handleDelete = (id: number) => {
    if (!confirm("Delete this product?")) return;
    deleteProduct.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Product deleted" });
        queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="zap-card p-6 space-y-5">
        <h2 className="font-bold text-foreground">Add New Product</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Name</label>
              <Input placeholder="e.g. AutoMod Pro" value={name} onChange={e => setName(e.target.value)} className="bg-background border-border text-foreground rounded" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Price</label>
              <Input placeholder="e.g. 19.99" value={price} onChange={e => setPrice(e.target.value)} className="bg-background border-border text-foreground rounded" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Category</label>
              <Input placeholder="e.g. Automation" value={category} onChange={e => setCategory(e.target.value)} className="bg-background border-border text-foreground rounded" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Status</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="bg-background border-border text-foreground rounded">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border rounded">
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="coming_soon">Coming Soon</SelectItem>
                  <SelectItem value="not_for_sale">Not for Sale</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Description</label>
            <Textarea placeholder="Describe this addon..." value={description} onChange={e => setDescription(e.target.value)} className="bg-background border-border text-foreground rounded min-h-[80px]" />
          </div>

          <ImageUploader value={imageUrl} onChange={setImageUrl} />

          <div className="flex items-center gap-2">
            <Checkbox checked={featured} onCheckedChange={(c) => setFeatured(!!c)} className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
            <label className="text-sm text-foreground cursor-pointer" onClick={() => setFeatured(f => !f)}>Featured on homepage</label>
          </div>

          <button type="submit" disabled={createProduct.isPending} className="zap-btn-primary px-5 py-2">
            {createProduct.isPending ? "Creating..." : "Create Product"}
          </button>
        </form>
      </div>

      <div className="zap-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-bold text-foreground text-sm">Manage Products</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="py-3 px-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground w-14">IMG</th>
                <th className="py-3 px-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Name</th>
                <th className="py-3 px-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Price</th>
                <th className="py-3 px-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="py-3 px-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={5} className="py-4 px-4"><Skeleton className="h-8 w-full bg-secondary" /></td></tr>
              ) : products?.map(p => (
                <tr key={p.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="py-3 px-4">
                    <div className="w-10 h-10 rounded bg-secondary overflow-hidden border border-border">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs font-mono">
                          {p.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-semibold text-foreground">{p.name}</td>
                  <td className="py-3 px-4 font-mono text-primary">${p.price}</td>
                  <td className="py-3 px-4">
                    <Select value={p.status ?? "active"} onValueChange={(v) => handleStatusChange(p.id, v)}>
                      <SelectTrigger className="h-7 text-xs border-border bg-secondary rounded w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border rounded">
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="coming_soon">Coming Soon</SelectItem>
                        <SelectItem value="not_for_sale">Not for Sale</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="text-xs text-destructive hover:text-destructive/80 border border-destructive/30 hover:border-destructive/60 px-2 py-1 rounded transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function TicketsTab() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: tickets, isLoading } = useListTickets();
  const updateTicket = useUpdateTicket();

  const handleUpdate = (id: number, status: string, adminNotes: string) => {
    updateTicket.mutate({ id, data: { status, adminNotes } }, {
      onSuccess: () => {
        toast({ title: "Ticket updated" });
        queryClient.invalidateQueries({ queryKey: getListTicketsQueryKey() });
      }
    });
  };

  if (isLoading) return <Skeleton className="h-64 w-full bg-secondary" />;

  return (
    <div className="space-y-4">
      {tickets?.map(t => (
        <div key={t.id} className="zap-card p-5 space-y-4">
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="tag-badge tag-stable">#{t.id}</span>
                <span className="text-xs font-semibold text-foreground">{t.username}</span>
                <span className="text-xs text-muted-foreground">→ {t.productName}</span>
              </div>
              <p className="text-sm text-foreground bg-secondary rounded px-3 py-2 mt-2 whitespace-pre-wrap">{t.message}</p>
            </div>
            <span className="text-xs text-muted-foreground font-mono shrink-0">
              {format(new Date(t.createdAt), "yyyy-MM-dd HH:mm")}
            </span>
          </div>

          <form onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            handleUpdate(t.id, fd.get("status") as string, fd.get("adminNotes") as string);
          }} className="flex flex-wrap gap-3 items-end">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground uppercase tracking-wider">Status</label>
              <Select name="status" defaultValue={t.status}>
                <SelectTrigger className="h-9 border-border bg-background text-foreground rounded w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border rounded">
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1 flex-1 min-w-48">
              <label className="text-xs text-muted-foreground uppercase tracking-wider">Admin Notes</label>
              <Input name="adminNotes" defaultValue={t.adminNotes || ""} placeholder="Internal notes..." className="bg-background border-border text-foreground rounded h-9" />
            </div>
            <button type="submit" disabled={updateTicket.isPending} className="zap-btn-primary px-4 py-2 text-xs">
              Update
            </button>
          </form>
        </div>
      ))}
      {(!tickets || tickets.length === 0) && (
        <div className="zap-card p-12 text-center text-muted-foreground font-mono text-sm">NO_TICKETS_FOUND</div>
      )}
    </div>
  );
}

function NewsTab() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: updates, isLoading } = useListUpdates();
  const createUpdate = useCreateUpdate();
  const deleteUpdate = useDeleteUpdate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) { toast({ title: "Missing fields", variant: "destructive" }); return; }
    createUpdate.mutate({ data: { title, content } }, {
      onSuccess: () => {
        toast({ title: "News posted" });
        setTitle(""); setContent("");
        queryClient.invalidateQueries({ queryKey: getListUpdatesQueryKey() });
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="zap-card p-6 space-y-4">
        <h2 className="font-bold text-foreground">Post News</h2>
        <form onSubmit={handleCreate} className="space-y-3">
          <Input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} className="bg-background border-border text-foreground rounded" />
          <Textarea placeholder="Content..." value={content} onChange={e => setContent(e.target.value)} className="bg-background border-border text-foreground rounded min-h-[120px]" />
          <button type="submit" disabled={createUpdate.isPending} className="zap-btn-primary px-5 py-2">
            {createUpdate.isPending ? "Publishing..." : "Publish"}
          </button>
        </form>
      </div>

      <div className="space-y-3">
        {isLoading ? <Skeleton className="h-32 w-full bg-secondary" /> : updates?.map(u => (
          <div key={u.id} className="zap-card px-5 py-4 flex justify-between items-start group">
            <div>
              <h3 className="font-semibold text-foreground text-sm">{u.title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{u.content}</p>
              <span className="text-xs text-muted-foreground/60 font-mono mt-1 block">{format(new Date(u.createdAt), "yyyy-MM-dd HH:mm")}</span>
            </div>
            <button
              onClick={() => { if (confirm("Delete this post?")) deleteUpdate.mutate({ id: u.id }, { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListUpdatesQueryKey() }) }); }}
              className="text-xs text-destructive/60 hover:text-destructive border border-transparent hover:border-destructive/30 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-all"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function UsersTab() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const { data: users, isLoading } = useListAdminUsers();
  const updateUser = useUpdateAdminUser();
  const deleteUser = useDeleteAdminUser();

  const handleRoleChange = (id: number, role: string) => {
    updateUser.mutate({ id, data: { role } }, {
      onSuccess: () => {
        toast({ title: "Role updated" });
        queryClient.invalidateQueries({ queryKey: getListAdminUsersQueryKey() });
      },
      onError: () => toast({ title: "Failed to update role", variant: "destructive" })
    });
  };

  const handleDelete = (id: number, username: string) => {
    if (!confirm(`Delete user "${username}"? This cannot be undone.`)) return;
    deleteUser.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "User deleted" });
        queryClient.invalidateQueries({ queryKey: getListAdminUsersQueryKey() });
      },
      onError: () => toast({ title: "Failed to delete user", variant: "destructive" })
    });
  };

  return (
    <div className="zap-card overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <h2 className="font-bold text-foreground text-sm">User Accounts</h2>
        <p className="text-xs text-muted-foreground mt-0.5">{users?.length ?? "..."} registered users</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="py-3 px-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Username</th>
              <th className="py-3 px-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Email</th>
              <th className="py-3 px-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Joined</th>
              <th className="py-3 px-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Role</th>
              <th className="py-3 px-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr><td colSpan={5} className="py-4 px-4"><Skeleton className="h-8 w-full bg-secondary" /></td></tr>
            ) : users?.map(u => {
              const isSelf = u.id === currentUser?.id;
              const roleInfo = ROLE_LABELS[u.role] ?? { label: u.role, color: "text-muted-foreground" };
              return (
                <tr key={u.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="py-3 px-4 font-semibold text-foreground font-mono">
                    {u.username}
                    {isSelf && <span className="ml-2 text-xs text-primary font-sans">(you)</span>}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">{u.email}</td>
                  <td className="py-3 px-4 text-muted-foreground text-xs font-mono">
                    {format(new Date(u.createdAt), "yyyy-MM-dd")}
                  </td>
                  <td className="py-3 px-4">
                    {isSelf ? (
                      <span className={`text-xs font-bold font-mono ${roleInfo.color}`}>{roleInfo.label}</span>
                    ) : (
                      <Select value={u.role} onValueChange={(v) => handleRoleChange(u.id, v)}>
                        <SelectTrigger className="h-7 text-xs border-border bg-secondary rounded w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border rounded">
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          {currentUser?.role === "owner" && <SelectItem value="owner">Owner</SelectItem>}
                        </SelectContent>
                      </Select>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {!isSelf && (
                      <button
                        onClick={() => handleDelete(u.id, u.username)}
                        className="text-xs text-destructive hover:text-destructive/80 border border-destructive/30 hover:border-destructive/60 px-2 py-1 rounded transition-colors"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
