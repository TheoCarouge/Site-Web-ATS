import { useState } from "react";
import { X, Save, Plus } from "lucide-react";
import { useCustomizer } from "@/context/CustomizerContext";

export default function SaveModal() {
  const { setShowSaveModal, saveDesign, selectedProduct, selectedColor, currentDesignId, savedDesigns } = useCustomizer();

  const existingDesign = currentDesignId ? savedDesigns.find(d => d.id === currentDesignId) : null;
  const [name, setName] = useState(
    existingDesign?.name ?? (selectedProduct ? `${selectedProduct.title} — ${selectedColor}` : "Mon design")
  );

  const handleUpdate = () => {
    if (!name.trim()) return;
    saveDesign(name.trim(), false); // update existing
  };

  const handleSaveNew = () => {
    if (!name.trim()) return;
    saveDesign(name.trim(), true); // force new
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Studio ATS</p>
            <h2 className="text-lg font-black uppercase text-zinc-900">
              {existingDesign ? "Mettre à jour le design" : "Sauvegarder le design"}
            </h2>
          </div>
          <button onClick={() => setShowSaveModal(false)} className="text-zinc-400 hover:text-zinc-900 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-1.5">
              Nom du design
            </label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && (existingDesign ? handleUpdate() : handleSaveNew())}
              placeholder="Ex : Logo entreprise - T-shirt noir"
              className="w-full border border-zinc-200 px-4 py-3 text-sm text-zinc-900 outline-none focus:border-zinc-900 transition"
            />
          </div>

          <div className="bg-zinc-50 border border-zinc-100 px-4 py-3 text-xs text-zinc-500 space-y-1">
            <p><span className="font-semibold text-zinc-700">Produit :</span> {selectedProduct?.title}</p>
            <p><span className="font-semibold text-zinc-700">Couleur :</span> {selectedColor}</p>
          </div>

          {existingDesign && (
            <div className="bg-zinc-900 text-white px-4 py-3 text-xs">
              <p className="font-bold mb-0.5">Design existant détecté</p>
              <p className="text-zinc-400">
                Cliquez sur "Mettre à jour" pour écraser "{existingDesign.name}", ou "Nouveau" pour créer une copie séparée.
              </p>
            </div>
          )}

          <p className="text-[11px] text-zinc-400">
            Sauvegardé localement dans votre navigateur. Accessible depuis "Mes designs" dans la sidebar.
          </p>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={() => setShowSaveModal(false)}
            className="py-3 px-4 border border-zinc-200 text-sm font-bold uppercase tracking-wide text-zinc-500 hover:border-zinc-900 hover:text-zinc-900 transition"
          >
            Annuler
          </button>

          {existingDesign ? (
            <>
              {/* Save as new copy */}
              <button
                onClick={handleSaveNew}
                disabled={!name.trim()}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold uppercase tracking-wide border transition
                  ${name.trim() ? "border-zinc-300 text-zinc-600 hover:border-zinc-900 hover:text-zinc-900" : "border-zinc-100 text-zinc-300 cursor-not-allowed"}`}
              >
                <Plus className="w-4 h-4" /> Nouveau
              </button>
              {/* Update existing */}
              <button
                onClick={handleUpdate}
                disabled={!name.trim()}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold uppercase tracking-wide transition
                  ${name.trim() ? "bg-zinc-900 text-white hover:bg-zinc-700" : "bg-zinc-100 text-zinc-400 cursor-not-allowed"}`}
              >
                <Save className="w-4 h-4" /> Mettre à jour
              </button>
            </>
          ) : (
            <button
              onClick={handleSaveNew}
              disabled={!name.trim()}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold uppercase tracking-wide transition
                ${name.trim() ? "bg-zinc-900 text-white hover:bg-zinc-700" : "bg-zinc-100 text-zinc-400 cursor-not-allowed"}`}
            >
              <Save className="w-4 h-4" /> Sauvegarder
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
