import { X, Trash2, FolderOpen, Plus, Pencil, Check } from "lucide-react";
import { useCustomizer } from "@/context/CustomizerContext";
import { useState, useRef } from "react";
import { SavedDesign } from "@/hooks/useDesigns";

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (d > 0) return `il y a ${d} jour${d > 1 ? "s" : ""}`;
  if (h > 0) return `il y a ${h}h`;
  if (m > 0) return `il y a ${m} min`;
  return "à l'instant";
}

function DesignCard({
  design,
  isActive,
  onLoad,
  onDelete,
  onRename,
  isRenaming,
  renameValue,
  setRenameValue,
  renameInputRef,
  onStartRename,
  onConfirmRename,
}: {
  design: SavedDesign;
  isActive: boolean;
  onLoad: () => void;
  onDelete: (e: React.MouseEvent) => void;
  onRename: (id: string, name: string) => void;
  isRenaming: boolean;
  renameValue: string;
  setRenameValue: (v: string) => void;
  renameInputRef: React.RefObject<HTMLInputElement | null>;
  onStartRename: (e: React.MouseEvent) => void;
  onConfirmRename: () => void;
}) {
  const designThumbnail = design.viewThumbnails?.['front'] || design.thumbnail;

  return (
    <div
      onClick={() => !isActive && !isRenaming && onLoad()}
      className={`group border p-3 transition
        ${isActive ? "border-zinc-900 bg-zinc-50 cursor-default" : "border-zinc-100 hover:border-zinc-300 cursor-pointer"}`}
    >
      <div className="flex items-start gap-3">
        {/* Thumbnail composite: mockup + design */}
        <div className={`w-16 h-16 shrink-0 relative overflow-hidden border bg-white ${isActive ? "border-zinc-900" : "border-zinc-200"}`}>
          {design.productImageUrl
            ? <img src={design.productImageUrl} alt="" className="absolute inset-0 w-full h-full object-contain" />
            : <div className="absolute inset-0 bg-zinc-100" />}
          {designThumbnail && (
            <img src={designThumbnail} alt={design.name} className="absolute inset-0 w-full h-full object-contain mix-blend-multiply" />
          )}
          {!design.productImageUrl && !designThumbnail && (
            <span className="absolute inset-0 flex items-center justify-center text-sm font-black text-zinc-300">ATS</span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          {isRenaming ? (
            <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
              <input
                ref={renameInputRef}
                value={renameValue}
                onChange={e => setRenameValue(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter") onConfirmRename();
                  if (e.key === "Escape") onConfirmRename();
                }}
                className="flex-1 min-w-0 border border-zinc-900 px-2 py-1 text-xs font-bold text-zinc-900 outline-none"
              />
              <button
                onClick={e => { e.stopPropagation(); onConfirmRename(); }}
                className="p-1 bg-zinc-900 text-white hover:bg-zinc-700 transition"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-bold text-zinc-900 truncate">{design.name}</p>
              {isActive && <span className="shrink-0 text-[9px] font-black uppercase tracking-wide bg-zinc-900 text-white px-1.5 py-0.5">Actif</span>}
              <button
                onClick={onStartRename}
                className="opacity-0 group-hover:opacity-100 transition text-zinc-400 hover:text-zinc-900 shrink-0"
                title="Renommer"
              >
                <Pencil className="w-3 h-3" />
              </button>
            </div>
          )}
          <p className="text-[11px] text-zinc-400 truncate mt-0.5">{design.productTitle}</p>
          <div className="flex items-center gap-2 mt-1">
            {design.color && <span className="text-[10px] font-semibold text-zinc-500 bg-zinc-100 px-1.5 py-0.5">{design.color}</span>}
            <span className="text-[10px] text-zinc-400">{timeAgo(design.updatedAt)}</span>
          </div>
        </div>

        {/* Delete */}
        {!isActive && !isRenaming && (
          <button
            onClick={onDelete}
            className="opacity-0 group-hover:opacity-100 transition text-zinc-300 hover:text-red-400 p-1 shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

    </div>
  );
}

export default function MyDesignsDrawer() {
  const {
    setShowMyDesigns,
    savedDesigns,
    deleteSavedDesign,
    loadSavedDesign,
    setShowSaveModal,
    saveDesign,
    renameDesign,
    currentDesignId,
    isDirty,
    newDesign,
  } = useCustomizer();

  const currentDesign = savedDesigns.find(d => d.id === currentDesignId);

  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const renameInputRef = useRef<HTMLInputElement>(null);

  const startRename = (id: string, currentName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRenamingId(id);
    setRenameValue(currentName);
    setTimeout(() => renameInputRef.current?.focus(), 50);
  };

  const confirmRename = (design: SavedDesign) => {
    const v = renameValue.trim() || design.name;
    if (design.id === currentDesignId) saveDesign(v, false);
    else renameDesign(design.id, v);
    setRenamingId(null);
  };

  return (
    <div className="fixed inset-0 z-[200] flex justify-end">
      <div className="absolute inset-0 bg-black/60" onClick={() => setShowMyDesigns(false)} />

      <div className="relative flex flex-col h-full w-full max-w-sm bg-white shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-zinc-900 shrink-0">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-white" />
            <h2 className="text-sm font-black uppercase tracking-wide text-white">Mes designs</h2>
          </div>
          <button onClick={() => setShowMyDesigns(false)} className="text-zinc-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Design actif */}
        {currentDesign && (
          <div className="shrink-0 border-b border-zinc-200 bg-zinc-50 px-5 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-2">En cours de modification</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-zinc-200 shrink-0 overflow-hidden flex items-center justify-center border-2 border-zinc-900">
                {currentDesign.thumbnail
                  ? <img src={currentDesign.thumbnail} alt={currentDesign.name} className="w-full h-full object-cover" />
                  : <span className="text-xs font-black text-zinc-400">ATS</span>}
              </div>
              <div className="flex-1 min-w-0">
                {renamingId === currentDesign.id ? (
                  <div className="flex items-center gap-1">
                    <input
                      ref={renameInputRef}
                      value={renameValue}
                      onChange={e => setRenameValue(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter") { saveDesign(renameValue.trim() || currentDesign.name, false); setRenamingId(null); }
                        if (e.key === "Escape") setRenamingId(null);
                      }}
                      className="flex-1 min-w-0 border border-zinc-900 px-2 py-1 text-xs font-bold text-zinc-900 outline-none"
                    />
                    <button onClick={() => { saveDesign(renameValue.trim() || currentDesign.name, false); setRenamingId(null); }} className="p-1 bg-zinc-900 text-white hover:bg-zinc-700 transition">
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-black text-zinc-900 truncate">{currentDesign.name}</p>
                    <button onClick={e => startRename(currentDesign.id, currentDesign.name, e)} className="text-zinc-400 hover:text-zinc-900 transition shrink-0">
                      <Pencil className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <p className="text-[11px] text-zinc-400 mt-0.5">{currentDesign.color} · {timeAgo(currentDesign.updatedAt)}</p>
              </div>
              {renamingId !== currentDesign.id && isDirty && (
                <button
                  onClick={() => { setShowMyDesigns(false); setShowSaveModal(true); }}
                  className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-white bg-zinc-900 hover:bg-zinc-700 transition px-2 py-1 shrink-0"
                >
                  <Pencil className="w-3 h-3" /> Sauver
                </button>
              )}
            </div>
          </div>
        )}

        {/* Liste */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {savedDesigns.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FolderOpen className="w-10 h-10 text-zinc-200 mb-3" />
              <p className="text-sm font-semibold text-zinc-400">Aucun design sauvegardé</p>
              <p className="text-xs text-zinc-400 mt-1 max-w-xs">Personnalisez un vêtement puis cliquez sur "Sauver".</p>
            </div>
          ) : (
            <div className="space-y-2">
              {savedDesigns.map(design => {
                const isActive = design.id === currentDesignId;
                const isRenaming = renamingId === design.id;
                return (
                  <DesignCard
                    key={design.id}
                    design={design}
                    isActive={isActive}
                    onLoad={() => loadSavedDesign(design)}
                    onDelete={e => { e.stopPropagation(); deleteSavedDesign(design.id); }}
                    onRename={renameDesign}
                    isRenaming={isRenaming}
                    renameValue={renameValue}
                    setRenameValue={setRenameValue}
                    renameInputRef={renameInputRef}
                    onStartRename={e => startRename(design.id, design.name, e)}
                    onConfirmRename={() => confirmRename(design)}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 px-5 py-4 border-t border-zinc-100 space-y-2">
          <button
            onClick={newDesign}
            className="w-full flex items-center justify-center gap-2 bg-zinc-900 text-white py-3 text-xs font-bold uppercase tracking-wide hover:bg-zinc-700 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            {currentDesignId ? "Sauver et créer un nouveau design" : "Nouveau design vierge"}
          </button>
          {!currentDesignId && savedDesigns.length > 0 && (
            <button
              onClick={() => { setShowMyDesigns(false); setShowSaveModal(true); }}
              className="w-full flex items-center justify-center gap-2 border border-zinc-200 py-2.5 text-xs font-bold uppercase tracking-wide text-zinc-600 hover:border-zinc-900 hover:text-zinc-900 transition"
            >
              <Plus className="w-3 h-3" /> Sauvegarder le design actuel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
