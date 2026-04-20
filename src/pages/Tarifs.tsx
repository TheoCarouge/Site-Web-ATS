import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Scissors, Award, Phone, Mail } from "lucide-react";
import Header from "@/components/Header";

// ─── Data ─────────────────────────────────────────────────────────────────────

const DTF_ROWS = [
  { qty: "1 – 5",   prix: "Sur devis", remise: null,   note: "Petite série" },
  { qty: "6 – 19",  prix: "Tarif de base", remise: "-10%",  note: "" },
  { qty: "20 – 49", prix: "Tarif de base", remise: "-20%",  note: "Populaire" },
  { qty: "50 – 99", prix: "Tarif de base", remise: "-25%",  note: "" },
  { qty: "100+",    prix: "Tarif de base", remise: "-30%",  note: "Meilleur prix" },
];

const BRODERIE_ROWS = [
  { qty: "1 – 5",   prix: "Sur devis", remise: null,   note: "Petite série" },
  { qty: "6 – 19",  prix: "Tarif de base", remise: "-10%",  note: "" },
  { qty: "20 – 49", prix: "Tarif de base", remise: "-15%",  note: "Populaire" },
  { qty: "50 – 99", prix: "Tarif de base", remise: "-20%",  note: "" },
  { qty: "100+",    prix: "Tarif de base", remise: "-25%",  note: "Meilleur prix" },
];

const EXEMPLES_DTF = [
  { label: "Logo poitrine (≤ 10 cm)", prix: "À partir de 4 €" },
  { label: "Dos complet (≤ 30 cm)", prix: "À partir de 8 €" },
  { label: "Manche (≤ 8 cm)", prix: "À partir de 3 €" },
  { label: "Full front (≤ A4)", prix: "À partir de 10 €" },
];

const EXEMPLES_BRODERIE = [
  { label: "Logo poitrine (≤ 8 cm)", prix: "À partir de 6 €" },
  { label: "Dos complet (≤ 20 cm)", prix: "À partir de 18 €" },
  { label: "Casquette (≤ 6 cm)", prix: "À partir de 5 €" },
  { label: "Badge / Écusson", prix: "À partir de 8 €" },
];

const FAQ = [
  {
    q: "Le prix du vêtement est-il inclus ?",
    a: "Non, les tarifs indiqués correspondent uniquement à la personnalisation (marquage). Le coût du support (t-shirt, polo, sweat…) s'ajoute selon le produit choisi.",
  },
  {
    q: "Comment obtenir un devis précis ?",
    a: "Envoyez-nous votre logo ou fichier par email ou via le formulaire de contact. Nous vous répondons sous 24h avec un devis détaillé.",
  },
  {
    q: "Quels formats de fichiers acceptez-vous ?",
    a: "PNG, JPG, SVG, AI, PDF. Pour la broderie, un vectoriel (SVG ou AI) est préférable. Nous pouvons retravailler votre logo gratuitement si nécessaire.",
  },
  {
    q: "Quel est le délai de livraison ?",
    a: "6 à 10 jours ouvrés après validation de la maquette. Un aperçu numérique vous est soumis avant production.",
  },
  {
    q: "Y a-t-il un minimum de commande ?",
    a: "Non, nous acceptons à partir d'une seule pièce. Les remises dégressives s'appliquent à partir de 6 pièces.",
  },
  {
    q: "Livrez-vous partout en France ?",
    a: "Oui, via Colissimo. Il est également possible de récupérer votre commande directement à l'atelier à Bellegarde (30).",
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Tarifs() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="bg-zinc-900 text-white px-6 py-12 md:px-12">
        <div className="mx-auto max-w-7xl">
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-zinc-500">ATS</p>
          <h1 className="text-4xl font-black uppercase">Tarifs</h1>
          <p className="mt-2 text-sm text-zinc-400 max-w-md">
            Tarifs dégressifs transparents. Plus votre quantité augmente, moins vous payez par pièce.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-14 md:px-12 space-y-20">

        {/* ── DTF ────────────────────────────────────────────────────────── */}
        <section>
          <div className="mb-6 flex items-center gap-3">
            <Scissors className="w-6 h-6 text-zinc-900" />
            <div>
              <h2 className="text-2xl font-black uppercase text-zinc-900">Flocage DTF</h2>
              <p className="text-xs text-zinc-500 uppercase tracking-widest">Direct To Film</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Tarifs dégressifs */}
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">Remises selon la quantité</p>
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-zinc-900 text-white">
                    <th className="text-left px-4 py-3 font-bold uppercase tracking-wide text-xs">Qté</th>
                    <th className="text-center px-4 py-3 font-bold uppercase tracking-wide text-xs">Remise</th>
                    <th className="text-center px-4 py-3 font-bold uppercase tracking-wide text-xs"></th>
                  </tr>
                </thead>
                <tbody>
                  {DTF_ROWS.map((row, i) => (
                    <tr key={row.qty} className={`border-b border-zinc-100 ${i % 2 === 0 ? "bg-white" : "bg-zinc-50"}`}>
                      <td className="px-4 py-3 font-semibold text-zinc-900">{row.qty} pièces</td>
                      <td className="px-4 py-3 text-center font-bold text-zinc-900">
                        {row.remise ?? <span className="text-zinc-400 font-normal">{row.prix}</span>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {row.note && (
                          <span className="inline-block bg-zinc-900 text-white text-[10px] font-bold uppercase tracking-wide px-2 py-0.5">
                            {row.note}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Exemples de prix */}
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">Exemples de marquage (hors support)</p>
              <div className="space-y-3">
                {EXEMPLES_DTF.map(ex => (
                  <div key={ex.label} className="flex items-center justify-between border border-zinc-100 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-zinc-400 shrink-0" />
                      <span className="text-sm text-zinc-700">{ex.label}</span>
                    </div>
                    <span className="text-sm font-bold text-zinc-900 shrink-0 ml-4">{ex.prix}</span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[11px] text-zinc-400">* Par emplacement, pour 20 pièces. Prix unitaire en série.</p>
            </div>
          </div>
        </section>

        {/* Divider */}
        <hr className="border-zinc-100" />

        {/* ── Broderie ────────────────────────────────────────────────────── */}
        <section>
          <div className="mb-6 flex items-center gap-3">
            <Award className="w-6 h-6 text-zinc-900" />
            <div>
              <h2 className="text-2xl font-black uppercase text-zinc-900">Broderie</h2>
              <p className="text-xs text-zinc-500 uppercase tracking-widest">Haute couture</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">Remises selon la quantité</p>
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-zinc-900 text-white">
                    <th className="text-left px-4 py-3 font-bold uppercase tracking-wide text-xs">Qté</th>
                    <th className="text-center px-4 py-3 font-bold uppercase tracking-wide text-xs">Remise</th>
                    <th className="text-center px-4 py-3 font-bold uppercase tracking-wide text-xs"></th>
                  </tr>
                </thead>
                <tbody>
                  {BRODERIE_ROWS.map((row, i) => (
                    <tr key={row.qty} className={`border-b border-zinc-100 ${i % 2 === 0 ? "bg-white" : "bg-zinc-50"}`}>
                      <td className="px-4 py-3 font-semibold text-zinc-900">{row.qty} pièces</td>
                      <td className="px-4 py-3 text-center font-bold text-zinc-900">
                        {row.remise ?? <span className="text-zinc-400 font-normal">{row.prix}</span>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {row.note && (
                          <span className="inline-block bg-zinc-900 text-white text-[10px] font-bold uppercase tracking-wide px-2 py-0.5">
                            {row.note}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">Exemples de marquage (hors support)</p>
              <div className="space-y-3">
                {EXEMPLES_BRODERIE.map(ex => (
                  <div key={ex.label} className="flex items-center justify-between border border-zinc-100 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-zinc-400 shrink-0" />
                      <span className="text-sm text-zinc-700">{ex.label}</span>
                    </div>
                    <span className="text-sm font-bold text-zinc-900 shrink-0 ml-4">{ex.prix}</span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[11px] text-zinc-400">* Par emplacement, pour 20 pièces. Numérisation logo offerte.</p>
            </div>
          </div>
        </section>

        {/* ── FAQ ─────────────────────────────────────────────────────────── */}
        <section>
          <div className="mb-8 text-center">
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-zinc-400">Questions fréquentes</p>
            <h2 className="text-3xl font-black uppercase text-zinc-900">FAQ</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {FAQ.map(({ q, a }) => (
              <div key={q} className="border border-zinc-100 p-6">
                <p className="text-sm font-bold text-zinc-900 mb-2">{q}</p>
                <p className="text-sm text-zinc-500 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="bg-zinc-900 text-white py-16 px-6 text-center">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-500">Devis gratuit</p>
        <h2 className="text-3xl font-black uppercase mb-4">Parlons de votre projet</h2>
        <p className="text-zinc-400 text-sm mb-8 max-w-sm mx-auto">
          Envoyez-nous votre logo et les quantités souhaitées. Réponse sous 24h.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="mailto:arttextilestudio.30@gmail.com"
            className="inline-flex items-center gap-2 bg-white text-zinc-900 px-8 py-3.5 text-sm font-bold uppercase tracking-wide hover:bg-zinc-100 transition"
          >
            <Mail className="w-4 h-4" />
            arttextilestudio.30@gmail.com
          </a>
          <a
            href="tel:0749192404"
            className="inline-flex items-center gap-2 border border-zinc-600 px-8 py-3.5 text-sm font-bold uppercase tracking-wide hover:border-white transition"
          >
            <Phone className="w-4 h-4" />
            07 49 19 24 04
          </a>
        </div>
        <div className="mt-8">
          <Link to="/catalogue" className="text-xs text-zinc-500 hover:text-white transition underline underline-offset-4">
            Voir le catalogue <ArrowRight className="inline w-3 h-3" />
          </Link>
        </div>
      </section>
    </div>
  );
}
