import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, SlidersHorizontal, X } from "lucide-react";
import Header from "@/components/Header";
import { fetchCollectionProducts } from "@/lib/shopify";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Product {
  id: string;
  title: string;
  handle: string;
  availableForSale: boolean;
  productType?: string;
  vendor?: string;
  images: { src: string }[];
  variants: {
    id: string;
    title: string;
    availableForSale: boolean;
    price: { amount: string } | string;
    selectedOptions: { name: string; value: string }[];
  }[];
  options?: { name: string; values: string[] }[];
}

const SORT_OPTIONS = [
  { label: "Défaut", value: "default" },
  { label: "Prix croissant", value: "price_asc" },
  { label: "Prix décroissant", value: "price_desc" },
  { label: "Nom A–Z", value: "name_asc" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getPrice(p: Product): number {
  const raw = typeof p.variants?.[0]?.price === "object"
    ? (p.variants[0].price as { amount: string }).amount
    : String(p.variants?.[0]?.price ?? "0");
  return parseFloat(raw) || 0;
}

function formatPrice(p: Product): string {
  const n = getPrice(p);
  return n > 0 ? `${n.toFixed(2).replace(".", ",")} €` : "Sur devis";
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Catalogue() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Tous");
  const [sort, setSort] = useState("default");
  const [showUnavailable, setShowUnavailable] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    fetchCollectionProducts("creation-flocage-personnaliser")
      .then((data: Product[]) => {
        if (!data?.length) setError(true);
        else setProducts(data);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  // Build category list from productType
  const categories = useMemo(() => {
    const types = products.map(p => p.productType?.trim()).filter(Boolean) as string[];
    return ["Tous", ...Array.from(new Set(types))];
  }, [products]);

  const filtered = useMemo(() => {
    let list = [...products];
    if (activeCategory !== "Tous") list = list.filter(p => p.productType?.trim() === activeCategory);
    if (!showUnavailable) list = list.filter(p => p.availableForSale);
    if (sort === "price_asc") list.sort((a, b) => getPrice(a) - getPrice(b));
    if (sort === "price_desc") list.sort((a, b) => getPrice(b) - getPrice(a));
    if (sort === "name_asc") list.sort((a, b) => a.title.localeCompare(b.title));
    return list;
  }, [products, activeCategory, sort, showUnavailable]);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="bg-zinc-900 text-white px-6 py-12 md:px-12">
        <div className="mx-auto max-w-7xl">
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-zinc-500">ATS</p>
          <h1 className="text-4xl font-black uppercase">Catalogue</h1>
          <p className="mt-2 text-sm text-zinc-400 max-w-md">
            Tous nos vêtements et accessoires personnalisables par flocage DTF ou broderie.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-10 md:px-12">

        {/* ── Toolbar ─────────────────────────────────────────────────────── */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          {/* Category pills */}
          <div className="flex flex-wrap gap-2">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-8 w-20 bg-zinc-100 animate-pulse rounded-sm" />
                ))
              : categories.map(cat => (
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

          {/* Right controls */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-zinc-500 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showUnavailable}
                onChange={e => setShowUnavailable(e.target.checked)}
                className="accent-zinc-900"
              />
              Afficher épuisés
            </label>
            <button
              onClick={() => setFiltersOpen(p => !p)}
              className="flex items-center gap-1.5 border border-zinc-200 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-zinc-600 hover:border-zinc-900 hover:text-zinc-900 transition"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Trier
            </button>
          </div>
        </div>

        {/* Sort dropdown panel */}
        {filtersOpen && (
          <div className="mb-6 flex items-center gap-2 flex-wrap border border-zinc-200 p-4">
            <span className="text-xs font-bold uppercase tracking-wide text-zinc-500 mr-2">Tri :</span>
            {SORT_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => { setSort(opt.value); setFiltersOpen(false); }}
                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wide border transition ${
                  sort === opt.value
                    ? "bg-zinc-900 text-white border-zinc-900"
                    : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-900"
                }`}
              >
                {opt.label}
              </button>
            ))}
            <button onClick={() => setFiltersOpen(false)} className="ml-auto text-zinc-400 hover:text-zinc-900">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── Count ────────────────────────────────────────────────────────── */}
        {!loading && (
          <p className="mb-6 text-xs text-zinc-400">
            {filtered.length} produit{filtered.length !== 1 ? "s" : ""}
            {activeCategory !== "Tous" ? ` dans "${activeCategory}"` : ""}
          </p>
        )}

        {/* ── Grid ─────────────────────────────────────────────────────────── */}
        {error ? (
          <div className="py-24 text-center">
            <p className="text-zinc-900 font-bold text-sm mb-2">Impossible de charger les produits.</p>
            <p className="text-zinc-400 text-xs max-w-sm mx-auto">
              Une erreur s'est produite lors de la connexion à Shopify. Vérifiez les variables d'environnement et redeployez.
            </p>
            <button onClick={() => { setError(false); setLoading(true); fetchCollectionProducts("creation-flocage-personnaliser").then(d => { if (!d?.length) setError(true); else setProducts(d); }).catch(() => setError(true)).finally(() => setLoading(false)); }} className="mt-6 text-xs font-bold uppercase tracking-wide text-zinc-900 underline underline-offset-4">
              Réessayer
            </button>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i}>
                <div className="aspect-[3/4] bg-zinc-100 animate-pulse mb-3" />
                <div className="h-3 w-3/4 bg-zinc-100 animate-pulse mb-2" />
                <div className="h-3 w-1/2 bg-zinc-100 animate-pulse" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-zinc-400 text-sm">Aucun produit dans cette catégorie.</p>
            <button onClick={() => setActiveCategory("Tous")} className="mt-4 text-xs font-bold uppercase tracking-wide text-zinc-900 underline">
              Voir tout
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map(p => {
              const img = p.images?.[0]?.src || "";
              const unavailable = !p.availableForSale;
              return (
                <Link
                  key={p.id}
                  to={`/customize?product=${p.handle}`}
                  className={`group ${unavailable ? "opacity-50 pointer-events-none" : ""}`}
                >
                  {/* Image */}
                  <div className="relative mb-3 overflow-hidden bg-zinc-100 aspect-[3/4]">
                    {img ? (
                      <img src={img} alt={p.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <span className="text-5xl font-black text-zinc-200 group-hover:scale-110 transition">ATS</span>
                      </div>
                    )}

                    {unavailable ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <span className="bg-white text-zinc-700 text-[10px] font-bold uppercase tracking-wide px-2 py-1">Épuisé</span>
                      </div>
                    ) : (
                      <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-200 bg-zinc-900 py-2 text-center text-[11px] font-bold uppercase tracking-wide text-white">
                        Personnaliser <ArrowRight className="inline w-3 h-3 ml-0.5" />
                      </div>
                    )}

                    {p.productType && (
                      <span className="absolute top-2 left-2 bg-white text-zinc-700 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5">
                        {p.productType}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <h3 className="text-sm font-semibold text-zinc-900 line-clamp-1">{p.title}</h3>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    À partir de <span className="font-bold text-zinc-900">{formatPrice(p)}</span>
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* ── CTA strip ─────────────────────────────────────────────────────── */}
      <div className="bg-zinc-900 text-white py-12 px-6 text-center mt-8">
        <p className="text-sm text-zinc-400 mb-4">
          Vous ne trouvez pas ce que vous cherchez ? Contactez-nous.
        </p>
        <a
          href="mailto:arttextilestudio30@gmail.com"
          className="inline-flex items-center gap-2 border border-zinc-600 px-8 py-3 text-xs font-bold uppercase tracking-wide hover:border-white transition"
        >
          Demander un produit <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
