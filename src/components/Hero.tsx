import { Link } from "react-router-dom";
import { ArrowRight, Scissors, Truck, Award } from "lucide-react";

export default function Hero() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="relative min-h-[580px] bg-zinc-900 flex items-center overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)", backgroundSize: "20px 20px" }} />

        <div className="relative z-10 mx-auto max-w-7xl px-6 py-20 md:px-12 grid md:grid-cols-2 gap-12 items-center">
          {/* Left: text */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-zinc-400">
              Flocage DTF &amp; Broderie — Fait en France
            </p>
            <h1 className="mb-6 text-5xl font-black uppercase leading-tight text-white md:text-6xl">
              Personnalisez<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">
                vos vêtements
              </span>
            </h1>
            <p className="mb-8 max-w-md text-base text-zinc-400 leading-relaxed">
              Pour professionnels, associations et particuliers. Polos, t-shirts, chemises, pulls à capuche, doudounes — en petite ou grande série.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/customize"
                className="inline-flex items-center gap-2 rounded-none bg-white px-8 py-3.5 text-sm font-bold uppercase tracking-wide text-zinc-900 transition hover:bg-zinc-100"
              >
                Je personnalise <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#produits"
                className="inline-flex items-center gap-2 rounded-none border border-zinc-600 px-8 py-3.5 text-sm font-bold uppercase tracking-wide text-white transition hover:border-white"
              >
                Découvrir
              </a>
            </div>
          </div>

          {/* Right: logo + badge */}
          <div className="flex flex-col items-center gap-6">
            <div className="flex flex-col items-center">
              <span className="text-8xl md:text-9xl font-black text-white leading-none tracking-tighter select-none">ATS</span>
              <span className="mt-1 text-xs font-semibold uppercase tracking-[0.4em] text-zinc-500">Art &amp; Textile Studio</span>
            </div>
            <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
              {["T-shirts", "Polos", "Chemises", "Pulls", "Doudounes", "Sur mesure"].map(tag => (
                <span key={tag} className="text-center rounded border border-zinc-700 py-2 text-xs font-medium text-zinc-400">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Value strip ── */}
      <section className="bg-zinc-800 border-y border-zinc-700">
        <div className="mx-auto max-w-7xl px-6 py-5 grid grid-cols-1 sm:grid-cols-3 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-zinc-700">
          <div className="flex items-center gap-4 px-6 py-4 sm:py-0">
            <Scissors className="w-6 h-6 text-white shrink-0" />
            <div>
              <p className="text-sm font-bold text-white">Flocage DTF</p>
              <p className="text-xs text-zinc-400">Haute résistance — 100 lavages min.</p>
            </div>
          </div>
          <div className="flex items-center gap-4 px-6 py-4 sm:py-0">
            <Award className="w-6 h-6 text-white shrink-0" />
            <div>
              <p className="text-sm font-bold text-white">Broderie &amp; Création logo</p>
              <p className="text-xs text-zinc-400">Petite &amp; grande série, sur devis</p>
            </div>
          </div>
          <div className="flex items-center gap-4 px-6 py-4 sm:py-0">
            <Truck className="w-6 h-6 text-white shrink-0" />
            <div>
              <p className="text-sm font-bold text-white">Livraison rapide</p>
              <p className="text-xs text-zinc-400">06–10 jours ouvrés — Bellegarde, Gard</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
