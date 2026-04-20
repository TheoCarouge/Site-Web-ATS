import { useState, useEffect, useMemo } from "react";
import { Check, Info, Truck, X } from "lucide-react";
import { useCustomizer } from "@/context/CustomizerContext";
import { useCart } from "@/context/CartContext";

const COLOR_HEX: Record<string, string> = {
  "Noir": "#1a1a1a", "Blanc": "#ffffff", "Blanc cassé": "#f5f0e8",
  "Gris": "#808080", "Gris chiné": "#9e9e9e", "Gris clair": "#d1d5db",
  "Rouge": "#dc2626", "Bordeaux": "#7f1d1d", "Rose": "#fbcfe8",
  "Rose poudré": "#f9a8d4", "Bleu marine": "#1e3a8a", "Marine": "#1e3a8a",
  "Bleu royal": "#1d4ed8", "Bleu ciel": "#38bdf8", "Bleu": "#3b82f6",
  "Vert": "#16a34a", "Vert forêt": "#166534", "Vert bouteille": "#14532d",
  "Kaki": "#78716c", "Beige": "#f5f5dc", "Sable": "#d2b48c",
  "Orange": "#ea580c", "Jaune": "#eab308", "Violet": "#7c3aed",
  "Marron": "#92400e", "Chocolat": "#78350f",
  "Black": "#1a1a1a", "White": "#ffffff", "Grey": "#808080", "Gray": "#808080",
  "Red": "#dc2626", "Navy": "#1e3a8a", "Navy Blue": "#1e3a8a",
  "Forest Green": "#166534", "Green": "#16a34a",
  "Pink": "#fbcfe8", "Blue": "#3b82f6", "Royal Blue": "#1d4ed8",
  "Sky Blue": "#38bdf8", "Purple": "#7c3aed", "Orange (en)": "#ea580c",
  "Yellow": "#eab308", "Brown": "#92400e", "Burgundy": "#7f1d1d",
};

const DEFAULT_SIZES = ["S", "M", "L", "XL", "XXL", "3XL", "4XL"];

const LIGHT_COLORS = ["Blanc", "Blanc cassé", "Beige", "Sable", "White", "Gris clair", "Jaune", "Yellow"];

export default function ProductDetails() {
  const { selectedColor, setSelectedColor, selectedProduct, isDesignValid, setIsCartOpen, canvas, getCanvasStates, viewProductImages, saveCurrentViewState } = useCustomizer();
  const { addToCart } = useCart();
  const [mode, setMode] = useState<"overview" | "selection">("overview");
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  useEffect(() => {
    if (selectedProduct?.id) { setMode("overview"); setQuantities({}); }
  }, [selectedProduct?.id]);

  const { productColors, productSizes, isColorAvailable, isSizeAvailable, getVariantId } = useMemo(() => {
    const variants: any[] = selectedProduct?.variants || [];
    const colorOptionName: string = selectedProduct?.colorOptionName || "";
    const sizeOptionName: string = selectedProduct?.sizeOptionName || "";

    const getOption = (v: any, name: string) =>
      v.selectedOptions?.find((o: any) => name ? o.name === name : /couleur|color/i.test(o.name))?.value;
    const getSizeOpt = (v: any) =>
      v.selectedOptions?.find((o: any) => sizeOptionName ? o.name === sizeOptionName : /taille|size/i.test(o.name))?.value;

    const colorSet = new Map<string, boolean>();
    variants.forEach((v) => {
      const color = getOption(v, colorOptionName);
      if (color) { if (!colorSet.has(color)) colorSet.set(color, false); if (v.availableForSale) colorSet.set(color, true); }
    });

    const productColors =
      colorSet.size > 0
        ? Array.from(colorSet.entries()).map(([name, available]) => ({ name, hex: COLOR_HEX[name] ?? "#808080", available }))
        : [
            { name: "Noir", hex: "#1a1a1a", available: true }, { name: "Blanc", hex: "#ffffff", available: true },
            { name: "Gris", hex: "#808080", available: true }, { name: "Rouge", hex: "#dc2626", available: true },
            { name: "Bleu marine", hex: "#1e3a8a", available: true }, { name: "Vert forêt", hex: "#166534", available: true },
            { name: "Beige", hex: "#f5f5dc", available: true }, { name: "Rose", hex: "#fbcfe8", available: true },
          ];

    const sizeSet = new Map<string, boolean>();
    if (variants.length > 0) {
      variants.forEach((v) => {
        const color = getOption(v, colorOptionName);
        const size = getSizeOpt(v);
        if (!color || color === selectedColor || colorSet.size === 0) {
          if (size) { if (!sizeSet.has(size)) sizeSet.set(size, false); if (v.availableForSale) sizeSet.set(size, true); }
        }
      });
    }

    const productSizes =
      sizeSet.size > 0
        ? Array.from(sizeSet.entries()).map(([name, available]) => ({ name, available }))
        : DEFAULT_SIZES.map((name) => ({ name, available: true }));

    return {
      productColors,
      productSizes,
      isColorAvailable: (c: string) => productColors.find(x => x.name === c)?.available ?? true,
      isSizeAvailable: (s: string) => productSizes.find(x => x.name === s)?.available ?? true,
      getVariantId: (color: string, size: string) => {
        if (!variants.length) return selectedProduct?.variantId;
        return variants.find(v => getOption(v, colorOptionName) === color && getSizeOpt(v) === size)?.id || selectedProduct?.variantId;
      },
    };
  }, [selectedProduct, selectedColor]);

  useEffect(() => {
    setQuantities(productSizes.reduce((acc, s) => ({ ...acc, [s.name]: 0 }), {} as Record<string, number>));
  }, [selectedProduct?.id, selectedColor]);

  if (!selectedProduct) return null;

  const updateQuantity = (size: string, delta: number) => {
    if (!isSizeAvailable(size)) return;
    setQuantities(prev => ({ ...prev, [size]: Math.max(0, (prev[size] || 0) + delta) }));
  };

  const totalItems = Object.values(quantities).reduce((a, b) => a + b, 0);
  const basePrice = parseFloat((selectedProduct.price || "0").replace(",", ".").replace(/[^0-9.]/g, "")) || 0;
  const totalPrice = totalItems * basePrice;

  const handleAddToCart = () => {
    if (totalItems === 0) return;
    saveCurrentViewState();
    const image =
      canvas && canvas.getObjects().length > 0
        ? (canvas as any).toDataURL({ format: "png", multiplier: 0.5 })
        : selectedProduct.baseImage || "https://placehold.co/200x200/1a1a1a/ffffff?text=ATS";
    const viewCanvasStates = getCanvasStates();
    productSizes.forEach(({ name: size }) => {
      const qty = quantities[size] || 0;
      if (qty > 0) addToCart({ title: selectedProduct.title, color: selectedColor, size, price: basePrice, quantity: qty, image, variantId: getVariantId(selectedColor, size), viewCanvasStates, viewProductImages });
    });
    setQuantities(productSizes.reduce((acc, s) => ({ ...acc, [s.name]: 0 }), {}));
    setMode("overview");
    setIsCartOpen(true);
  };

  // ── Overview ──────────────────────────────────────────────────────────────

  if (mode === "overview") {
    return (
      <div className="w-80 bg-white border-l border-zinc-200 flex flex-col h-full overflow-y-auto">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-100">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-1">Produit sélectionné</p>
          <h2 className="text-sm font-bold text-zinc-900 leading-snug">{selectedProduct.title}</h2>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-zinc-400">
            <Truck className="w-3.5 h-3.5 shrink-0" />
            <span>Livraison 6 – 10 jours ouvrés</span>
          </div>
        </div>

        {/* Color selector */}
        <div className="px-5 py-4 border-b border-zinc-100">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-3">
            Couleur — <span className="text-zinc-900 normal-case tracking-normal">{selectedColor}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {productColors.map((color) => (
              <button
                key={color.name}
                onClick={() => color.available && setSelectedColor(color.name)}
                title={color.available ? color.name : `${color.name} (indisponible)`}
                disabled={!color.available}
                className={`relative w-8 h-8 border-2 flex items-center justify-center transition-all
                  ${!color.available ? "opacity-30 cursor-not-allowed border-zinc-200"
                    : selectedColor === color.name ? "border-zinc-900 ring-1 ring-zinc-900 ring-offset-1"
                    : "border-zinc-300 hover:border-zinc-600"}`}
                style={{ backgroundColor: color.hex }}
              >
                {selectedColor === color.name && color.available && (
                  <Check className={`w-3.5 h-3.5 ${LIGHT_COLORS.includes(color.name) ? "text-zinc-900" : "text-white"}`} />
                )}
                {!color.available && (
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 32 32">
                    <line x1="4" y1="4" x2="28" y2="28" stroke="#666" strokeWidth="2" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="px-5 py-4 mt-auto">
          <button
            onClick={() => setMode("selection")}
            disabled={!isDesignValid}
            className={`w-full py-3 text-sm font-bold uppercase tracking-wide transition
              ${isDesignValid ? "bg-zinc-900 text-white hover:bg-zinc-700" : "bg-zinc-100 text-zinc-400 cursor-not-allowed"}`}
          >
            Choisir taille &amp; quantité
          </button>
          {!isDesignValid && (
            <p className="text-[11px] text-red-500 mt-2 text-center">Design hors zone d'impression.</p>
          )}
        </div>
      </div>
    );
  }

  // ── Selection ─────────────────────────────────────────────────────────────

  return (
    <div className="w-80 bg-white border-l border-zinc-200 flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-4 border-b border-zinc-100 flex items-start justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-1">Taille &amp; quantité</p>
          <h2 className="text-sm font-bold text-zinc-900 leading-snug pr-4">{selectedProduct.title}</h2>
          <p className="text-[11px] text-zinc-400 mt-0.5">{selectedColor}</p>
        </div>
        <button onClick={() => setMode("overview")} className="text-zinc-400 hover:text-zinc-900 transition mt-0.5">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Sizes */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="space-y-2 mb-4">
          {productSizes.map(({ name: size, available }) => (
            <div key={size} className={`flex items-center justify-between py-2 border-b border-zinc-50 ${!available ? "opacity-40" : ""}`}>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-semibold w-12 text-zinc-900 ${!available ? "line-through" : ""}`}>{size}</span>
                {!available && <span className="text-[10px] font-bold text-red-400 uppercase">Épuisé</span>}
              </div>
              <div className="flex items-center border border-zinc-200">
                <button onClick={() => updateQuantity(size, -1)} disabled={!available} className="w-8 h-8 flex items-center justify-center text-zinc-500 hover:bg-zinc-50 disabled:cursor-not-allowed text-lg leading-none">−</button>
                <span className="w-10 text-center text-sm font-semibold text-zinc-900">{quantities[size] || 0}</span>
                <button onClick={() => updateQuantity(size, 1)} disabled={!available} className="w-8 h-8 flex items-center justify-center text-zinc-500 hover:bg-zinc-50 disabled:cursor-not-allowed text-lg leading-none">+</button>
              </div>
            </div>
          ))}
        </div>

        <button className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-400 hover:text-zinc-900 transition mb-6">
          <Info className="w-3.5 h-3.5" /> Tableau des tailles
        </button>

        {/* Pricing */}
        <div className="border-t border-zinc-100 pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">Prix unitaire</span>
            <span className="font-semibold text-zinc-900">{basePrice.toFixed(2).replace(".", ",")} €</span>
          </div>
          <p className="text-[11px] text-zinc-400">Dès 6 articles : −10 %</p>
          <div className="flex justify-between items-baseline pt-2 border-t border-zinc-100">
            <span className="text-xs text-zinc-500">{totalItems} article{totalItems > 1 ? "s" : ""}</span>
            <span className="text-lg font-black text-zinc-900">{totalPrice.toFixed(2).replace(".", ",")} €</span>
          </div>
          <p className="text-[10px] text-zinc-400">TTC · hors frais de port</p>
        </div>
      </div>

      {/* CTA */}
      <div className="px-5 py-4 border-t border-zinc-100">
        <button
          onClick={handleAddToCart}
          disabled={totalItems === 0}
          className={`w-full py-3 text-sm font-bold uppercase tracking-wide transition
            ${totalItems > 0 ? "bg-zinc-900 text-white hover:bg-zinc-700" : "bg-zinc-100 text-zinc-400 cursor-not-allowed"}`}
        >
          Ajouter au panier
        </button>
      </div>
    </div>
  );
}
