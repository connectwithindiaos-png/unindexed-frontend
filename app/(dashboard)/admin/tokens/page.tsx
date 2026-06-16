"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useTokens, useCreateToken, useToggleToken, useDeleteToken } from "@/hooks/useAdmin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { FiPlus, FiCopy, FiCheck, FiTrash2, FiKey, FiDownload, FiTerminal, FiEye, FiX, FiImage, FiTrash } from "react-icons/fi";
import { cn } from "@/lib/utils";
import { BuildLogs } from "@/components/shared/build-logs";
import { tokenApi } from "@/services/api";

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
  const [showCreate, setShowCreate] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showLogsId, setShowLogsId] = useState<string | null>(null);
  const [apkNameInput, setApkNameInput] = useState("");
  const [showNameInputForId, setShowNameInputForId] = useState<string | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [iconUploading, setIconUploading] = useState(false);
  const iconInputRef = useRef<HTMLInputElement>(null);

  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  const handleIconSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !showNameInputForId) return;

    const base64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });

    setIconPreview(base64);
    setIconUploading(true);
    try {
      await tokenApi.uploadIcon(showNameInputForId, base64);
    } catch {
      // silent
    } finally {
      setIconUploading(false);
    }
  };

  const handleRemoveIcon = async () => {
    if (!showNameInputForId) return;
    setIconPreview(null);
    try {
      await tokenApi.deleteIcon(showNameInputForId);
    } catch {}
    if (iconInputRef.current) iconInputRef.current.value = "";
  };

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
      onSuccess: () => { setName(""); setShowCreate(false); },
    });
  };

  const handleCopy = (token: string, id: string) => {
    navigator.clipboard.writeText(token);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const tokens = data?.tokens ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-600/60 tracking-widest mb-1">
            <FiTerminal className="h-3 w-3" /> ADMIN / TOKEN_MANAGEMENT
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-mono text-emerald-400">
            Token Management
          </h1>
          <p className="text-xs font-mono text-emerald-700 mt-1">
            Create and manage access tokens for device deployment
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="font-mono text-xs border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:shadow-[0_0_20px_rgba(52,211,153,0.15)]">
          <FiPlus className="h-4 w-4 mr-2" /> generate_token
        </Button>
      </div>

      {/* Create Token Inline Form */}
      {showCreate && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-5 animate-slide-up box-glow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FiKey className="h-4 w-4 text-emerald-400" />
              <span className="text-sm font-mono text-emerald-300">// New Token Configuration</span>
            </div>
            <button onClick={() => setShowCreate(false)} className="text-emerald-700 hover:text-emerald-400">
              <FiX className="h-4 w-4" />
            </button>
          </div>
          <div className="grid sm:grid-cols-[1fr_auto] gap-3 items-end">
            <div>
              <label className="text-[10px] font-mono text-emerald-600/80 mb-1.5 block tracking-wider">TOKEN_NAME</label>
              <Input
                placeholder="e.g. client-alpha-deployment"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-black/50 border-emerald-900/40 text-emerald-300 placeholder:text-emerald-800 h-10 text-sm font-mono focus-visible:ring-emerald-500/30"
                autoFocus
                onKeyDown={(e) => { if (e.key === "Enter" && name.trim()) handleCreate(e); }}
              />
              <p className="text-[10px] font-mono text-emerald-800 mt-1">This name identifies the token in your dashboard</p>
            </div>
            <Button
              onClick={handleCreate}
              disabled={createToken.isPending || !name.trim()}
              className="font-mono text-xs h-10 border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
            >
              {createToken.isPending ? "generating..." : "$ generate"}
            </Button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : tokens.length === 0 ? (
        /* Empty State */
        <div className="rounded-xl border border-emerald-900/30 bg-black/60 p-16 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-lg border border-emerald-900/30 bg-emerald-950/20 mb-4">
            <FiKey className="h-8 w-8 text-emerald-600" />
          </div>
          <h3 className="text-base font-mono text-emerald-400 mb-2">No tokens deployed</h3>
          <p className="text-xs font-mono text-emerald-700 max-w-md mx-auto mb-6">
            Tokens are used to authenticate device deployments. Create one to get started.
          </p>
          <Button onClick={() => setShowCreate(true)} className="font-mono text-xs border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20">
            <FiPlus className="h-4 w-4 mr-2" /> create_first_token
          </Button>
        </div>
      ) : (
        /* Token List */
        <div className="rounded-xl border border-emerald-900/30 bg-black/60 overflow-hidden box-glow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-emerald-900/20 bg-emerald-950/20">
                  <th className="px-4 py-3 text-left text-[10px] font-mono text-emerald-600 uppercase tracking-widest">Name</th>
                  <th className="px-4 py-3 text-left text-[10px] font-mono text-emerald-600 uppercase tracking-widest hidden sm:table-cell">Token</th>
                  <th className="px-4 py-3 text-left text-[10px] font-mono text-emerald-600 uppercase tracking-widest">Status</th>
                  <th className="px-4 py-3 text-left text-[10px] font-mono text-emerald-600 uppercase tracking-widest hidden md:table-cell">Devices</th>
                  <th className="px-4 py-3 text-left text-[10px] font-mono text-emerald-600 uppercase tracking-widest hidden lg:table-cell">Created</th>
                  <th className="px-4 py-3 text-right text-[10px] font-mono text-emerald-600 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-900/10">
                {tokens.map((tok) => (
                  <tr key={tok.id} className="group hover:bg-emerald-950/20 transition-colors duration-150">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-950/30 group-hover:bg-emerald-900/30 transition-colors shrink-0">
                          <FiKey className="h-4 w-4 text-emerald-400" />
                        </div>
                        <span className="text-sm font-mono text-emerald-300">{tok.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <div className="flex items-center gap-2">
                        <code className="text-xs font-mono text-emerald-500/80 bg-emerald-950/40 px-2 py-1 rounded border border-emerald-900/30 truncate max-w-[200px] block">
                          {tok.token}
                        </code>
                        <button onClick={() => handleCopy(tok.token, tok.id)} className="shrink-0 text-emerald-700 hover:text-emerald-400 transition-colors">
                          {copiedId === tok.id ? <FiCheck className="h-3.5 w-3.5 text-emerald-400" /> : <FiCopy className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className={cn("inline-flex items-center gap-1.5 px-2 py-1 rounded border text-[10px] font-mono",
                        tok.is_active
                          ? "border-emerald-500/30 bg-emerald-950/30 text-emerald-400"
                          : "border-red-900/40 bg-red-950/20 text-red-500/60"
                      )}>
                        <span className={cn("h-1.5 w-1.5 rounded-full", tok.is_active ? "bg-emerald-500 animate-pulse" : "bg-red-800")} />
                        {tok.is_active ? "ACTIVE" : "INACTIVE"}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs font-mono text-emerald-500">{tok.device_count ?? 0}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-xs font-mono text-emerald-600">
                        {new Date(tok.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* APK Download */}
                        <button
                          onClick={() => { setApkNameInput(""); setShowNameInputForId(tok.id); }}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[10px] font-mono border border-emerald-900/30 text-emerald-500 hover:text-emerald-400 hover:bg-emerald-950/30 hover:border-emerald-700/50 transition-all"
                          title="Build and download APK with embedded token"
                        >
                          <FiDownload className="h-3 w-3" /> APK
                        </button>

                        {/* Toggle Active */}
                        <button
                          onClick={() => toggleToken.mutate(tok.id)}
                          disabled={toggleToken.isPending}
                          className={cn("px-2.5 py-1.5 rounded text-[10px] font-mono border transition-all",
                            tok.is_active
                              ? "border-amber-900/30 text-amber-600 hover:text-amber-400 hover:bg-amber-950/30"
                              : "border-emerald-900/30 text-emerald-600 hover:text-emerald-400 hover:bg-emerald-950/30"
                          )}
                        >
                          {tok.is_active ? "deactivate" : "activate"}
                        </button>

                        {/* Delete */}
                        {deleteConfirm === tok.id ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => { deleteToken.mutate(tok.id); setDeleteConfirm(null); }}
                              className="px-2.5 py-1.5 rounded text-[10px] font-mono border border-red-900/40 text-red-500 hover:bg-red-950/30 transition-all"
                            >
                              confirm
                            </button>
                            <button onClick={() => setDeleteConfirm(null)}
                              className="px-2.5 py-1.5 rounded text-[10px] font-mono border border-emerald-900/30 text-emerald-600 hover:text-emerald-400 transition-all"
                            >
                              cancel
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => setDeleteConfirm(tok.id)}
                            className="px-2.5 py-1.5 rounded text-[10px] font-mono border border-transparent text-red-700/50 hover:text-red-400 hover:border-red-900/30 transition-all"
                          >
                            <FiTrash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* APK Name Input Panel */}
      {showNameInputForId && !showLogsId && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-5 animate-slide-up box-glow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FiKey className="h-4 w-4 text-emerald-400" />
              <span className="text-sm font-mono text-emerald-300">// APK Configuration</span>
            </div>
            <button onClick={() => { setShowNameInputForId(null); setIconPreview(null); }} className="text-emerald-700 hover:text-emerald-400">
              <FiX className="h-4 w-4" />
            </button>
          </div>

          {/* App Name */}
          <div className="mb-4">
            <label className="text-[10px] font-mono text-emerald-600/80 mb-1.5 block tracking-wider">APPLICATION_NAME</label>
            <Input
              placeholder="e.g. My Device Manager"
              value={apkNameInput}
              onChange={(e) => setApkNameInput(e.target.value)}
              className="bg-black/50 border-emerald-900/40 text-emerald-300 placeholder:text-emerald-800 h-10 text-sm font-mono focus-visible:ring-emerald-500/30"
              autoFocus
            />
            <p className="text-[10px] font-mono text-emerald-800 mt-1">This name will appear on the device after APK installation</p>
          </div>

          {/* Icon Upload */}
          <div className="mb-4">
            <label className="text-[10px] font-mono text-emerald-600/80 mb-1.5 block tracking-wider">LAUNCHER_ICON</label>
            <div className="flex items-center gap-4">
              {/* Preview */}
              <div className="h-14 w-14 rounded-xl border border-emerald-900/30 bg-black/60 flex items-center justify-center overflow-hidden shrink-0">
                {iconPreview ? (
                  <img src={iconPreview} alt="icon" className="h-full w-full object-cover" />
                ) : (
                  <FiImage className="h-5 w-5 text-emerald-700" />
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <input
                  ref={iconInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleIconSelect}
                  className="hidden"
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => iconInputRef.current?.click()}
                    disabled={iconUploading}
                    className="text-[10px] font-mono border border-emerald-900/30 text-emerald-500 hover:text-emerald-400 hover:bg-emerald-950/30 px-2.5 py-1.5 rounded transition-all disabled:opacity-50"
                  >
                    {iconUploading ? "uploading..." : "choose_icon"}
                  </button>
                  {iconPreview && (
                    <button
                      onClick={handleRemoveIcon}
                      className="text-[10px] font-mono border border-red-900/30 text-red-500 hover:text-red-400 hover:bg-red-950/30 px-2.5 py-1.5 rounded transition-all"
                    >
                      <FiTrash className="h-3 w-3" />
                    </button>
                  )}
                </div>
                <p className="text-[10px] font-mono text-emerald-800">PNG/JPEG recommended, 512x512+</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={() => { setShowLogsId(showNameInputForId); setShowNameInputForId(null); }}
              disabled={!apkNameInput.trim()}
              className="font-mono text-xs h-10 border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
            >
              $ generate_apk
            </Button>
          </div>
        </div>
      )}

      {/* Build Logs Panel */}
      {showLogsId && (
        <BuildLogs
          sseUrl={`${apiBase}/admin/tokens/${showLogsId}/apk/logs?name=${encodeURIComponent(apkNameInput)}`}
          downloadUrl={`${apiBase}/admin/tokens/${showLogsId}/apk?name=${encodeURIComponent(apkNameInput)}`}
          filename={`device-manager-${apkNameInput.replace(/\s+/g, '-').toLowerCase()}.apk`}
          onClose={() => { setShowLogsId(null); setApkNameInput(""); }}
        />
      )}
    </div>
  );
}
