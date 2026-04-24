import { useEffect, useState, useMemo } from "react";
import { ShoppingCart, X, Plus, Minus, Flame } from "lucide-react";
import Header from "@/components/Header";
import { fetchCollectionProducts } from "@/lib/shopify";
import { useCart } from "@/context/CartContext";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Variant {
  id: string;
  title: string;
  availableForSale: boolean;
  price: { amount: string } | string;
  selectedOptions: { name: string; value: string }[];
}

interface Product {
  id: string;
  title: string;
  handle: string;
  availableForSale: boolean;
  productType?: string;
  images: { src: string }[];
  variants: Variant[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getVariantPrice(v: Variant): number {
  const raw = typeof v.price === "object" ? (v.price as { amount: string }).amount : String(v.price ?? "0");
  return parseFloat(raw) || 0;
}

function formatAmount(amount: number): string {
  return `${amount.toFixed(2).replace(".", ",")} €`;
}

function getBasePrice(p: Product): number {
  const prices = p.variants.map(getVariantPrice).filter(n => n > 0);
  return prices.length ? Math.min(...prices) : 0;
}

// ─── Quick-add Modal ──────────────────────────────────────────────────────────

interface QuickAddProps {
  product: Product;
  onClose: () => void;
}

function QuickAddModal({ product, onClose }: QuickAddProps) {
  const { addToCart } = useCart();
  const [selectedVariantId, setSelectedVariantId] = useState<string>(() => {
    const first = product.variants.find(v => v.availableForSale);
    return first?.id ?? product.variants[0]?.id ?? "";
  });
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const selectedVariant = product.variants.find(v => v.id === selectedVariantId) ?? product.variants[0];
  const img = product.images?.[0]?.src || "";
  const price = selectedVariant ? getVariantPrice(selectedVariant) : 0;

  // Detect option name (Taille, Couleur, etc.)
  const optionName = product.variants[0]?.selectedOptions?.[0]?.name || "Taille";
  const isOnlyOneVariant = product.variants.length === 1 && product.variants[0].title === "Unique";

  function handleAdd() {
    if (!selectedVariant || !selectedVariant.availableForSale) return;
    addToCart({
      title: product.title,
      color: selectedVariant.selectedOptions.find(o => /couleur|color/i.test(o.name))?.value || "",
      size: selectedVariant.selectedOptions.find(o => /taille|size/i.test(o.name))?.value || selectedVariant.title,
      price,
      quantity,
      image: img,
      variantId: selectedVariant.id,
    });
    setAdded(true);
    setTimeout(() => { setAdded(false); onClose(); }, 900);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-white w-full max-w-md rounded-none shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-zinc-400 hover:text-zinc-900 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex gap-0">
          {/* Image */}
          <div className="w-36 shrink-0 bg-zinc-100 flex items-center justify-center aspect-square">
            {img ? (
              <img src={img} alt={product.title} className="h-full w-full object-cover" />
            ) : (
              <span className="text-3xl font-black text-zinc-200">ATS</span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 p-5">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-orange-600 mb-2">
              <Flame className="w-3 h-3" /> Série Limitée
            </span>
            <p className="text-sm font-bold text-zinc-900 leading-snug mb-1">{product.title}</p>
            <p className="text-sm font-bold text-zinc-900 mb-4">{formatAmount(price)}</p>

            {/* Variant selector */}
            {!isOnlyOneVariant && (
              <div className="mb-4">
                <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-400 mb-2">{optionName}</p>
                <div className="flex flex-wrap gap-1.5">
                  {product.variants.map(v => {
                    const val = v.selectedOptions?.[0]?.value ?? v.title;
                    const available = v.availableForSale;
                    const selected = v.id === selectedVariantId;
                    return (
                      <button
                        key={v.id}
                        disabled={!available}
                        onClick={() => setSelectedVariantId(v.id)}
                        className={`relative px-3 py-1.5 text-xs font-bold border transition
                          ${selected ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 text-zinc-700 hover:border-zinc-900"}
                          ${!available ? "opacity-30 cursor-not-allowed line-through" : ""}
                        `}
                      >
                        {val}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-7 h-7 border border-zinc-200 flex items-center justify-center hover:border-zinc-900 transition"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="text-sm font-bold w-5 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(q => q + 1)}
                className="w-7 h-7 border border-zinc-200 flex items-center justify-center hover:border-zinc-900 transition"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="px-5 pb-5 pt-0">
          <button
            onClick={handleAdd}
            disabled={!selectedVariant?.availableForSale || added}
            className={`w-full flex items-center justify-center gap-2 py-3.5 text-sm font-bold uppercase tracking-wide transition
              ${added
                ? "bg-green-600 text-white"
                : selectedVariant?.availableForSale
                  ? "bg-zinc-900 text-white hover:bg-zinc-700"
                  : "bg-zinc-200 text-zinc-400 cursor-not-allowed"
              }
            `}
          >
            <ShoppingCart className="w-4 h-4" />
            {added ? "Ajouté ✓" : "Ajouter au panier"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EditionLimitee() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Tous");
  const [quickAdd, setQuickAdd] = useState<Product | null>(null);

  const load = () => {
    setLoading(true);
    setError(false);
    fetchCollectionProducts("serie-limitee")
      .then((data: Product[]) => {
        if (!data?.length) setError(true);
        else setProducts(data);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const categories = useMemo(() => {
    const types = products.map(p => p.productType?.trim()).filter(Boolean) as string[];
    return ["Tous", ...Array.from(new Set(types))];
  }, [products]);

  const filtered = useMemo(() => {
    if (activeCategory === "Tous") return products;
    return products.filter(p => p.productType?.trim() === activeCategory);
  }, [products, activeCategory]);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="bg-zinc-900 text-white px-6 py-12 md:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <p className="text-xs font-semibold uppercase tracking-widest text-orange-500">Série Limitée</p>
          </div>
          <h1 className="text-4xl font-black uppercase">Édition Limitée</h1>
          <p className="mt-2 text-sm text-zinc-400 max-w-md">
            Pièces exclusives disponibles en quantités limitées — flocage et broderie déjà intégrés, prêts à porter.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-10 md:px-12">

        {/* ── Category pills ───────────────────────────────────────────────── */}
        {!loading && categories.length > 1 && (
          <div className="mb-8 flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wide transition border ${
                  activeCategory === cat
                    ? "bg-zinc-900 text-white border-zinc-900"
                    : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-900 hover:text-zinc-900"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* ── Count ────────────────────────────────────────────────────────── */}
        {!loading && (
          <p className="mb-6 text-xs text-zinc-400">
            {filtered.length} pièce{filtered.length !== 1 ? "s" : ""}
            {activeCategory !== "Tous" ? ` dans "${activeCategory}"` : " en édition limitée"}
          </p>
        )}

        {/* ── Grid ─────────────────────────────────────────────────────────── */}
        {error ? (
          <div className="py-24 text-center">
            <p className="text-zinc-900 font-bold text-sm mb-2">Impossible de charger les produits.</p>
            <p className="text-zinc-400 text-xs max-w-sm mx-auto">
              Une erreur s'est produite lors de la connexion à Shopify. Vérifiez les variables d'environnement et redeployez.
            </p>
            <button onClick={load} className="mt-6 text-xs font-bold uppercase tracking-wide text-zinc-900 underline underline-offset-4">
              Réessayer
            </button>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i}>
                <div className="aspect-[3/4] bg-zinc-100 animate-pulse mb-3" />
                <div className="h-3 w-3/4 bg-zinc-100 animate-pulse mb-2" />
                <div className="h-3 w-1/2 bg-zinc-100 animate-pulse" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-zinc-400 text-sm">Aucune pièce dans cette catégorie.</p>
            <button onClick={() => setActiveCategory("Tous")} className="mt-4 text-xs font-bold uppercase tracking-wide text-zinc-900 underline">
              Voir tout
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map(p => {
              const img = p.images?.[0]?.src || "";
              const unavailable = !p.availableForSale;
              const basePrice = getBasePrice(p);
              const availableVariants = p.variants.filter(v => v.availableForSale).length;

              return (
                <div key={p.id} className={`group ${unavailable ? "opacity-60" : ""}`}>
                  {/* Image */}
                  <div className="relative mb-3 overflow-hidden bg-zinc-100 aspect-[3/4]">
                    {img ? (
                      <img src={img} alt={p.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <span className="text-5xl font-black text-zinc-200 group-hover:scale-110 transition">ATS</span>
                      </div>
                    )}

                    {/* Série Limitée badge */}
                    <div className="absolute top-2 left-2 flex items-center gap-1 bg-orange-600 text-white text-[10px] font-bold uppercase tracking-wide px-2 py-0.5">
                      <Flame className="w-2.5 h-2.5" />
                      Limité
                    </div>

                    {unavailable ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <span className="bg-white text-zinc-700 text-[10px] font-bold uppercase tracking-wide px-2 py-1">Épuisé</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => setQuickAdd(p)}
                        className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-200 bg-zinc-900 py-2 text-center text-[11px] font-bold uppercase tracking-wide text-white flex items-center justify-center gap-1.5"
                      >
                        <ShoppingCart className="w-3 h-3" />
                        Ajouter au panier
                      </button>
                    )}
                  </div>

                  {/* Info */}
                  <h3 className="text-sm font-semibold text-zinc-900 line-clamp-1">{p.title}</h3>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-900">
                      {basePrice > 0 ? formatAmount(basePrice) : "Sur devis"}
                    </span>
                    {!unavailable && availableVariants > 0 && (
                      <span className="text-[10px] text-zinc-400">
                        {availableVariants} taille{availableVariants > 1 ? "s" : ""} dispo
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Info strip ────────────────────────────────────────────────────── */}
      <div className="bg-zinc-50 border-t border-zinc-100 py-10 px-6 mt-8">
        <div className="mx-auto max-w-7xl grid sm:grid-cols-3 gap-6 text-center text-xs text-zinc-500">
          <div>
            <p className="text-zinc-900 font-bold uppercase tracking-wide text-[11px] mb-1">Quantités limitées</p>
            <p>Chaque pièce est produite en série restreinte — une fois épuisé, c'est terminé.</p>
          </div>
          <div>
            <p className="text-zinc-900 font-bold uppercase tracking-wide text-[11px] mb-1">Marquage inclus</p>
            <p>Flocage DTF ou broderie déjà appliqués — aucune personnalisation possible.</p>
          </div>
          <div>
            <p className="text-zinc-900 font-bold uppercase tracking-wide text-[11px] mb-1">Expédition rapide</p>
            <p>Commande préparée sous 48h, livraison en France métropolitaine.</p>
          </div>
        </div>
      </div>

      {/* ── Quick Add Modal ───────────────────────────────────────────────── */}
      {quickAdd && <QuickAddModal product={quickAdd} onClose={() => setQuickAdd(null)} />}
    </div>
  );
}
