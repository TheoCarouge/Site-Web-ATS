import { X, Search, ChevronRight } from "lucide-react";
import { useCustomizer } from "@/context/CustomizerContext";
import { useState, useEffect, useMemo } from "react";
import { fetchAllProducts } from "@/lib/shopify";

// ─── Fallback products ────────────────────────────────────────────────────────

const FALLBACK = [
  { id: "f1", title: "T-shirt manches courtes", handle: "t-shirt-a-manches-courtes-personnalise-femme", price: "12,00 €", img: "", type: "T-shirts", availableForSale: true },
  { id: "f2", title: "T-shirt bio oversize", handle: "tshirt-bio", price: "15,00 €", img: "", type: "T-shirts", availableForSale: true },
  { id: "f3", title: "Polo personnalisable", handle: "polo", price: "18,00 €", img: "", type: "Polos", availableForSale: true },
  { id: "f4", title: "Chemise personnalisable", handle: "chemise-personnalisable", price: "22,00 €", img: "", type: "Chemises", availableForSale: true },
  { id: "f5", title: "Sweat à capuche", handle: "sweat-a-capuche-personnalise", price: "28,00 €", img: "", type: "Sweats", availableForSale: true },
  { id: "f6", title: "Pull molletonné", handle: "pull", price: "30,00 €", img: "", type: "Sweats", availableForSale: true },
  { id: "f7", title: "Veste softshell", handle: "veste", price: "42,00 €", img: "", type: "Vestes", availableForSale: true },
  { id: "f8", title: "Doudoune sans manches", handle: "doudoune", price: "35,00 €", img: "", type: "Vestes", availableForSale: false },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProductSelectorModal() {
  const { setActiveModal, loadShopifyProduct } = useCustomizer();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeType, setActiveType] = useState("Tous");

  useEffect(() => {
    fetchAllProducts()
      .then((data: any[]) => {
        if (!data?.length) { setProducts(FALLBACK); return; }
        setProducts(data.map((p: any) => {
          const rawPrice = p.variants?.[0]?.price?.amount ?? p.variants?.[0]?.price ?? "0";
          return {
            id: p.id,
            title: p.title,
            handle: p.handle,
            price: `${parseFloat(String(rawPrice)).toFixed(2).replace(".", ",")} €`,
            img: p.images?.[0]?.src || "",
            type: p.productType || "Vêtements",
            availableForSale: p.availableForSale !== false,
          };
        }));
      })
      .catch(() => setProducts(FALLBACK))
      .finally(() => setLoading(false));
  }, []);

  const types = useMemo(() => ["Tous", ...Array.from(new Set(products.map(p => p.type).filter(Boolean)))], [products]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return products.filter(p =>
      (activeType === "Tous" || p.type === activeType) &&
      (!q || p.title.toLowerCase().includes(q))
    );
  }, [products, activeType, search]);

  const select = (product: any) => {
    if (!product.availableForSale) return;
    loadShopifyProduct(product.handle);
    setActiveModal(null);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/70 p-0 sm:p-4">
      <div className="relative flex flex-col w-full sm:max-w-3xl bg-white shadow-2xl sm:rounded-none overflow-hidden"
           style={{ maxHeight: "90vh" }}>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4 shrink-0">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Étape 1</p>
            <h2 className="text-lg font-black uppercase text-zinc-900">Choisir un produit</h2>
          </div>
          <button onClick={() => setActiveModal(null)} className="text-zinc-400 hover:text-zinc-900 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-3 border-b border-zinc-100 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un produit…"
              className="w-full border border-zinc-200 pl-9 pr-4 py-2.5 text-sm text-zinc-900 outline-none focus:border-zinc-900 transition"
            />
          </div>
        </div>

        {/* Category pills */}
        <div className="flex gap-2 px-6 py-3 overflow-x-auto shrink-0 border-b border-zinc-100 scrollbar-none">
          {types.map(type => (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={`shrink-0 px-4 py-1.5 text-xs font-bold uppercase tracking-wide border transition
                ${activeType === type
                  ? "bg-zinc-900 text-white border-zinc-900"
                  : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-900 hover:text-zinc-900"}`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-7 h-7 border-4 border-zinc-900 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-zinc-400 text-sm">Aucun produit trouvé.</p>
              <button onClick={() => { setSearch(""); setActiveType("Tous"); }} className="mt-3 text-xs font-bold underline text-zinc-500 hover:text-zinc-900">
                Réinitialiser
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map(p => {
                const unavailable = !p.availableForSale;
                return (
                  <button
                    key={p.id}
                    onClick={() => select(p)}
                    disabled={unavailable}
                    className={`group text-left transition ${unavailable ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    {/* Image */}
                    <div className="relative aspect-[3/4] bg-zinc-100 mb-2.5 overflow-hidden">
                      {p.img ? (
                        <img src={p.img} alt={p.title} className="w-full h-full object-cover transition duration-300 group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-4xl font-black text-zinc-200 group-hover:scale-110 transition">ATS</span>
                        </div>
                      )}
                      {/* Hover overlay */}
                      {!unavailable && (
                        <div className="absolute inset-0 bg-zinc-900/0 group-hover:bg-zinc-900/40 transition-all flex items-center justify-center">
                          <span className="opacity-0 group-hover:opacity-100 transition bg-white text-zinc-900 text-xs font-bold uppercase tracking-wide px-4 py-2 flex items-center gap-1.5">
                            Sélectionner <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      )}
                      {unavailable && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <span className="bg-white text-zinc-600 text-[10px] font-bold uppercase px-2 py-1">Épuisé</span>
                        </div>
                      )}
                      {/* Type badge */}
                      <span className="absolute top-2 left-2 bg-white/90 text-zinc-700 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5">
                        {p.type}
                      </span>
                    </div>
                    {/* Info */}
                    <p className="text-xs font-bold text-zinc-900 line-clamp-2 leading-snug">{p.title}</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      À partir de <span className="font-bold text-zinc-700">{p.price}</span>
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-100 bg-zinc-50 shrink-0">
          <p className="text-[11px] text-zinc-400 text-center">
            {filtered.length} produit{filtered.length !== 1 ? "s" : ""} disponible{filtered.length !== 1 ? "s" : ""}
            {activeType !== "Tous" ? ` dans "${activeType}"` : ""}
          </p>
        </div>
      </div>
    </div>
  );
}
