import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Scissors, Award, Truck, Phone, Mail, Instagram, CheckCircle2, ChevronRight } from "lucide-react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import { fetchAllProducts } from "@/lib/shopify";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  availableForSale: boolean;
  images: { src: string }[];
  variants: { price: { amount: string } | string }[];
  productType?: string;
  vendor?: string;
}

// ─── Degressive pricing data ──────────────────────────────────────────────────

const PRICING_ROWS = [
  { qty: "1 – 5", dtf: "Sur devis", broderie: "Sur devis", note: "Petite série" },
  { qty: "6 – 19", dtf: "-10%", broderie: "-10%", note: "" },
  { qty: "20 – 49", dtf: "-20%", broderie: "-15%", note: "Populaire" },
  { qty: "50 – 99", dtf: "-25%", broderie: "-20%", note: "" },
  { qty: "100+", dtf: "-30%", broderie: "-25%", note: "Meilleur prix" },
];

const TECHNIQUES = [
  {
    icon: <Scissors className="w-7 h-7" />,
    title: "Flocage DTF",
    subtitle: "Direct To Film",
    points: [
      "Couleurs illimitées, dégradés inclus",
      "Résistance : 100+ lavages",
      "Idéal petites & grandes séries",
      "Rendu mat ou brillant",
    ],
  },
  {
    icon: <Award className="w-7 h-7" />,
    title: "Broderie",
    subtitle: "Haute couture",
    points: [
      "Relief et noblesse garantis",
      "Parfait pour logos & écussons",
      "Durabilité maximale",
      "Création de votre logo incluse",
    ],
  },
];

const WHY_ATS = [
  { label: "Fait en France", detail: "Atelier basé à Bellegarde, Gard (30)" },
  { label: "Délai 6–10 jours", detail: "Ouvrés après validation de la maquette" },
  { label: "Petites & grandes séries", detail: "À partir d'une seule pièce" },
  { label: "Devis gratuit", detail: "Réponse sous 24h" },
  { label: "Fichiers fournis", detail: "Nous retravaillons votre logo si besoin" },
  { label: "Livraison ou retrait", detail: "Expédition ou récupération sur place" },
];

// ─── Home ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    fetchAllProducts()
      .then((data: ShopifyProduct[]) => setProducts(data ?? []))
      .finally(() => setLoadingProducts(false));
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />

      {/* ── Products section ─────────────────────────────────────────────── */}
      <section id="produits" className="mx-auto max-w-7xl px-6 py-20 md:px-12">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-zinc-400">Catalogue</p>
            <h2 className="text-3xl font-black uppercase text-zinc-900">Nos produits</h2>
          </div>
          <Link to="/catalogue" className="hidden sm:flex items-center gap-1 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition">
            Voir tout <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loadingProducts ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-zinc-900 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : products.length === 0 ? (
          /* Fallback static grid when Shopify is not connected */
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {FALLBACK_PRODUCTS.map(p => (
              <StaticProductCard key={p.title} {...p} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {products.slice(0, 8).map(p => {
              const rawPrice = typeof p.variants?.[0]?.price === "object"
                ? (p.variants[0].price as { amount: string }).amount
                : String(p.variants?.[0]?.price ?? "0");
              const price = `${parseFloat(rawPrice).toFixed(2).replace(".", ",")} €`;
              const img = p.images?.[0]?.src || "https://placehold.co/400x500/1a1a1a/ffffff?text=ATS";
              const unavailable = p.availableForSale === false;
              return (
                <Link
                  key={p.id}
                  to={`/customize?product=${p.handle}`}
                  className={`group ${unavailable ? "pointer-events-none opacity-40" : ""}`}
                >
                  <div className="relative mb-3 overflow-hidden bg-zinc-100 aspect-[3/4]">
                    <img src={img} alt={p.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                    {unavailable && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <span className="bg-white text-zinc-700 text-xs font-bold px-3 py-1">Épuisé</span>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform bg-zinc-900 py-2 text-center text-xs font-bold uppercase tracking-wide text-white">
                      Personnaliser <ArrowRight className="inline w-3 h-3 ml-1" />
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold text-zinc-900 line-clamp-1">{p.title}</h3>
                  <p className="mt-0.5 text-xs text-zinc-500">À partir de <span className="font-bold text-zinc-900">{price}</span></p>
                </Link>
              );
            })}
          </div>
        )}

        <div className="mt-10 text-center">
          <Link
            to="/catalogue"
            className="inline-flex items-center gap-2 border border-zinc-900 px-8 py-3 text-sm font-bold uppercase tracking-wide text-zinc-900 hover:bg-zinc-900 hover:text-white transition"
          >
            Voir tout le catalogue <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── Techniques ───────────────────────────────────────────────────── */}
      <section className="bg-zinc-900 text-white py-20 px-6 md:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-zinc-500">Savoir-faire</p>
            <h2 className="text-3xl font-black uppercase">Nos techniques</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {TECHNIQUES.map(t => (
              <div key={t.title} className="border border-zinc-700 p-8 hover:border-zinc-400 transition">
                <div className="mb-4 flex items-center gap-3">
                  <div className="text-white">{t.icon}</div>
                  <div>
                    <h3 className="text-xl font-black uppercase">{t.title}</h3>
                    <p className="text-xs text-zinc-500 uppercase tracking-widest">{t.subtitle}</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {t.points.map(p => (
                    <li key={p} className="flex items-start gap-2 text-sm text-zinc-300">
                      <CheckCircle2 className="w-4 h-4 text-white shrink-0 mt-0.5" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing table ─────────────────────────────────────────────────── */}
      <section id="tarifs" className="mx-auto max-w-7xl px-6 py-20 md:px-12">
        <div className="mb-10 text-center">
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-zinc-400">Transparence</p>
          <h2 className="text-3xl font-black uppercase text-zinc-900">Tarifs dégressifs</h2>
          <p className="mt-3 text-sm text-zinc-500 max-w-md mx-auto">
            Plus vous commandez, moins vous payez par pièce. Les tarifs s'appliquent hors coût du support.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-zinc-900 text-white">
                <th className="text-left px-6 py-4 font-bold uppercase tracking-wide">Quantité</th>
                <th className="text-center px-6 py-4 font-bold uppercase tracking-wide">Flocage DTF</th>
                <th className="text-center px-6 py-4 font-bold uppercase tracking-wide">Broderie</th>
                <th className="text-center px-6 py-4 font-bold uppercase tracking-wide"></th>
              </tr>
            </thead>
            <tbody>
              {PRICING_ROWS.map((row, i) => (
                <tr key={row.qty} className={`border-b border-zinc-100 ${i % 2 === 0 ? "bg-white" : "bg-zinc-50"}`}>
                  <td className="px-6 py-4 font-semibold text-zinc-900">{row.qty} pièces</td>
                  <td className="px-6 py-4 text-center font-bold text-zinc-900">{row.dtf}</td>
                  <td className="px-6 py-4 text-center font-bold text-zinc-900">{row.broderie}</td>
                  <td className="px-6 py-4 text-center">
                    {row.note && (
                      <span className="inline-block bg-zinc-900 text-white text-[10px] font-bold uppercase tracking-wide px-2 py-1">
                        {row.note}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-xs text-zinc-400 text-center">
          * Tarifs indicatifs. Devis gratuit sous 24h. Hors coût du vêtement.
        </p>

        <div className="mt-8 text-center">
          <a
            href="mailto:arttextilestudio30@gmail.com"
            className="inline-flex items-center gap-2 bg-zinc-900 text-white px-8 py-3 text-sm font-bold uppercase tracking-wide hover:bg-zinc-700 transition"
          >
            Demander un devis gratuit <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* ── Why ATS ───────────────────────────────────────────────────────── */}
      <section className="bg-zinc-50 border-t border-zinc-100 py-20 px-6 md:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center">
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-zinc-400">Pourquoi nous</p>
            <h2 className="text-3xl font-black uppercase text-zinc-900">ATS, c'est…</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {WHY_ATS.map(({ label, detail }) => (
              <div key={label} className="bg-white border border-zinc-100 p-6 flex gap-4 items-start">
                <CheckCircle2 className="w-5 h-5 text-zinc-900 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-zinc-900 text-sm">{label}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA banner ────────────────────────────────────────────────────── */}
      <section className="bg-zinc-900 text-white py-16 px-6 text-center">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-500">Prêt à vous lancer ?</p>
        <h2 className="text-3xl font-black uppercase mb-4">Personnalisez vos vêtements</h2>
        <p className="text-zinc-400 text-sm mb-8 max-w-sm mx-auto">
          Créez votre design en ligne ou envoyez-nous votre fichier. Devis gratuit, réponse rapide.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            to="/customize"
            className="inline-flex items-center gap-2 bg-white text-zinc-900 px-8 py-3.5 text-sm font-bold uppercase tracking-wide hover:bg-zinc-100 transition"
          >
            Je commence <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="mailto:arttextilestudio30@gmail.com"
            className="inline-flex items-center gap-2 border border-zinc-600 px-8 py-3.5 text-sm font-bold uppercase tracking-wide text-white hover:border-white transition"
          >
            Demander un devis
          </a>
        </div>
      </section>

      {/* ── Footer contact strip ──────────────────────────────────────────── */}
      <footer className="bg-zinc-950 text-zinc-400 py-10 px-6">
        <div className="mx-auto max-w-7xl grid sm:grid-cols-2 lg:grid-cols-4 gap-8 text-sm">
          <div>
            <p className="text-white font-black text-xl tracking-tighter mb-1">ATS</p>
            <p className="text-[11px] uppercase tracking-widest text-zinc-600 mb-3">Art &amp; Textile Studio</p>
            <p className="text-xs leading-relaxed">Flocage DTF &amp; Broderie.<br />Fait en France — Bellegarde, Gard.</p>
          </div>
          <div>
            <p className="text-white font-semibold text-xs uppercase tracking-wide mb-3">Navigation</p>
            <ul className="space-y-2 text-xs">
              {NAV_LABELS.map(({ label, to }) => (
                <li key={to}><Link to={to} className="hover:text-white transition">{label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-white font-semibold text-xs uppercase tracking-wide mb-3">Contact</p>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 shrink-0" /><a href="tel:0749192404" className="hover:text-white transition">07 49 19 24 04</a></li>
              <li className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 shrink-0" /><a href="mailto:arttextilestudio30@gmail.com" className="hover:text-white transition">arttextilestudio30@gmail.com</a></li>
              <li className="flex items-center gap-2"><Instagram className="w-3.5 h-3.5 shrink-0" /><span>@ats3.0</span></li>
            </ul>
          </div>
          <div>
            <p className="text-white font-semibold text-xs uppercase tracking-wide mb-3">Horaires</p>
            <p className="text-xs leading-relaxed text-zinc-500">Lun – Ven : 9h – 18h<br />Sam : sur rendez-vous<br />Dim : fermé</p>
          </div>
        </div>
        <div className="mx-auto max-w-7xl mt-8 pt-6 border-t border-zinc-800 text-[11px] text-zinc-600 flex flex-wrap justify-between gap-2">
          <span>© {new Date().getFullYear()} Art &amp; Textile Studio — Tous droits réservés · Développé par Théo Carouge</span>
          <span>Fait avec ♥ en France</span>
        </div>
      </footer>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const NAV_LABELS = [
  { label: "Catalogue", to: "/catalogue" },
  { label: "Tarifs", to: "/tarifs" },
  { label: "Personnaliser", to: "/customize" },
  { label: "Contact", to: "/contact" },
];

const FALLBACK_PRODUCTS = [
  { title: "T-shirt manches courtes", price: "À partir de 12,00 €", tag: "DTF" },
  { title: "Polo personnalisable", price: "À partir de 18,00 €", tag: "DTF + Broderie" },
  { title: "Chemise personnalisable", price: "À partir de 22,00 €", tag: "DTF + Broderie" },
  { title: "Sweat à capuche", price: "À partir de 28,00 €", tag: "DTF" },
  { title: "Doudoune sans manches", price: "À partir de 35,00 €", tag: "Broderie" },
  { title: "Veste softshell", price: "À partir de 42,00 €", tag: "DTF" },
  { title: "T-shirt bio oversize", price: "À partir de 15,00 €", tag: "DTF" },
  { title: "Pull molletonné", price: "À partir de 30,00 €", tag: "DTF + Broderie" },
];

function StaticProductCard({ title, price, tag }: { title: string; price: string; tag: string }) {
  return (
    <Link to="/customize" className="group">
      <div className="relative mb-3 bg-zinc-100 aspect-[3/4] flex items-center justify-center overflow-hidden">
        <span className="text-4xl font-black text-zinc-300 group-hover:scale-110 transition">ATS</span>
        <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform bg-zinc-900 py-2 text-center text-xs font-bold uppercase tracking-wide text-white">
          Personnaliser <ArrowRight className="inline w-3 h-3 ml-1" />
        </div>
      </div>
      <h3 className="text-sm font-semibold text-zinc-900 line-clamp-1">{title}</h3>
      <div className="flex items-center justify-between mt-0.5">
        <p className="text-xs text-zinc-500">{price}</p>
        <span className="text-[10px] font-bold uppercase tracking-wide text-zinc-400 bg-zinc-100 px-1.5 py-0.5">{tag}</span>
      </div>
    </Link>
  );
}
