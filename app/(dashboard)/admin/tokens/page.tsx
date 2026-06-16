"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useTokens, useCreateToken, useToggleToken, useDeleteToken } from "@/hooks/useAdmin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { FiPlus, FiCopy, FiCheck, FiTrash2, FiToggleLeft, FiToggleRight, FiKey, FiDownload } from "react-icons/fi";

export default function TokensPage() {
  const router = useRouter();
  const role = useAuthStore((s) => s.role);

  useEffect(() => {
    if (role === "user") router.push("/dashboard");
  }, [role, router]);

  const { data, isLoading } = useTokens();
  const createToken = useCreateToken();
  const toggleToken = useToggleToken();
  const deleteToken = useDeleteToken();
  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  if (role === "user" || role === null) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createToken.mutate(name.trim(), {
      onSuccess: () => {
        setName("");
        setOpen(false);
      },
    });
  };

  const handleCopy = (token: string, id: string) => {
    navigator.clipboard.writeText(token);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const tokens = data?.tokens ?? [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Token Management</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage access tokens for users
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <FiPlus className="h-4 w-4" />
              Create Token
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Token</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="tokenName">Token Name</Label>
                <Input
                  id="tokenName"
                  placeholder="e.g. Client Alpha"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <Button type="submit" className="w-full" disabled={createToken.isPending || !name.trim()}>
                {createToken.isPending ? <LoadingSpinner size="sm" /> : "Generate Token"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : tokens.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FiKey className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <p className="text-lg font-medium mb-1">No tokens yet</p>
            <p className="text-sm text-muted-foreground mb-4">Create your first token to get started</p>
            <Button onClick={() => setOpen(true)} className="gap-2">
              <FiPlus className="h-4 w-4" />
              Create Token
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {tokens.map((tok) => (
            <Card key={tok.id} className="group hover:border-primary/20 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{tok.name}</h3>
                      <Badge variant={tok.is_active ? "success" : "secondary"}>
                        {tok.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-sm text-muted-foreground bg-muted/50 rounded-md px-3 py-2">
                      <code className="truncate">{tok.token}</code>
                      <button
                        onClick={() => handleCopy(tok.token, tok.id)}
                        className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {copiedId === tok.id ? (
                          <FiCheck className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <FiCopy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                      <span>{tok.device_count ?? 0} device(s)</span>
                      <span>Created {new Date(tok.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/admin/tokens/${tok.id}/apk`}
                      className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors"
                    >
                      <FiDownload className="h-4 w-4" />
                      APK
                    </a>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleToken.mutate(tok.id)}
                      disabled={toggleToken.isPending}
                      className="gap-2"
                    >
                      {tok.is_active ? (
                        <FiToggleRight className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <FiToggleLeft className="h-4 w-4 text-muted-foreground" />
                      )}
                      {tok.is_active ? "Deactivate" : "Activate"}
                    </Button>
                    {deleteConfirm === tok.id ? (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            deleteToken.mutate(tok.id);
                            setDeleteConfirm(null);
                          }}
                        >
                          Confirm
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(null)}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteConfirm(tok.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
