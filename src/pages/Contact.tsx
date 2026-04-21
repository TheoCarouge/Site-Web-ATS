import { useState } from "react";
import { Phone, Mail, Instagram, MapPin, Clock, Send, CheckCircle2 } from "lucide-react";
import Header from "@/components/Header";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    nom: "",
    email: "",
    telephone: "",
    sujet: "devis",
    quantite: "",
    message: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Compose mailto with form data
    const body = encodeURIComponent(
      `Nom : ${form.nom}\nEmail : ${form.email}\nTéléphone : ${form.telephone}\nSujet : ${form.sujet}\nQuantité : ${form.quantite}\n\n${form.message}`
    );
    const subject = encodeURIComponent(
      form.sujet === "devis"
        ? `Demande de devis — ${form.nom}`
        : form.sujet === "commande"
        ? `Suivi de commande — ${form.nom}`
        : `Contact — ${form.nom}`
    );
    window.location.href = `mailto:arttextilestudio30@gmail.com?subject=${subject}&body=${body}`;
    setSent(true);
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="bg-zinc-900 text-white px-6 py-12 md:px-12">
        <div className="mx-auto max-w-7xl">
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-zinc-500">ATS</p>
          <h1 className="text-4xl font-black uppercase">Contact</h1>
          <p className="mt-2 text-sm text-zinc-400 max-w-md">
            Une question, un devis, une commande ? On vous répond sous 24h.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-14 md:px-12">
        <div className="grid lg:grid-cols-2 gap-14">

          {/* ── Form ──────────────────────────────────────────────────────── */}
          <div>
            <p className="mb-6 text-xs font-semibold uppercase tracking-widest text-zinc-400">Formulaire de contact</p>

            {sent ? (
              <div className="flex flex-col items-center justify-center py-16 text-center border border-zinc-100">
                <CheckCircle2 className="w-10 h-10 text-zinc-900 mb-4" />
                <p className="text-lg font-black uppercase text-zinc-900">Merci !</p>
                <p className="text-sm text-zinc-500 mt-2 max-w-xs">
                  Votre client mail s'est ouvert avec votre message. Envoyez-le pour finaliser votre demande.
                </p>
                <button
                  onClick={() => setSent(false)}
                  className="mt-6 text-xs font-bold uppercase tracking-wide text-zinc-400 hover:text-zinc-900 underline underline-offset-4 transition"
                >
                  Nouveau message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-zinc-500 mb-1.5">
                      Nom / Entreprise <span className="text-zinc-900">*</span>
                    </label>
                    <input
                      required
                      name="nom"
                      value={form.nom}
                      onChange={handleChange}
                      placeholder="Jean Dupont"
                      className="w-full border border-zinc-200 px-4 py-3 text-sm text-zinc-900 outline-none focus:border-zinc-900 transition placeholder:text-zinc-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-zinc-500 mb-1.5">
                      Email <span className="text-zinc-900">*</span>
                    </label>
                    <input
                      required
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="jean@exemple.fr"
                      className="w-full border border-zinc-200 px-4 py-3 text-sm text-zinc-900 outline-none focus:border-zinc-900 transition placeholder:text-zinc-300"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-zinc-500 mb-1.5">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      name="telephone"
                      value={form.telephone}
                      onChange={handleChange}
                      placeholder="06 XX XX XX XX"
                      className="w-full border border-zinc-200 px-4 py-3 text-sm text-zinc-900 outline-none focus:border-zinc-900 transition placeholder:text-zinc-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-zinc-500 mb-1.5">
                      Sujet <span className="text-zinc-900">*</span>
                    </label>
                    <select
                      required
                      name="sujet"
                      value={form.sujet}
                      onChange={handleChange}
                      className="w-full border border-zinc-200 px-4 py-3 text-sm text-zinc-900 outline-none focus:border-zinc-900 transition bg-white appearance-none"
                    >
                      <option value="devis">Demande de devis</option>
                      <option value="commande">Suivi de commande</option>
                      <option value="renseignement">Renseignement</option>
                      <option value="partenariat">Partenariat / Pro</option>
                      <option value="autre">Autre</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-zinc-500 mb-1.5">
                    Quantité estimée
                  </label>
                  <input
                    name="quantite"
                    value={form.quantite}
                    onChange={handleChange}
                    placeholder="Ex : 50 t-shirts"
                    className="w-full border border-zinc-200 px-4 py-3 text-sm text-zinc-900 outline-none focus:border-zinc-900 transition placeholder:text-zinc-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-zinc-500 mb-1.5">
                    Message <span className="text-zinc-900">*</span>
                  </label>
                  <textarea
                    required
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Décrivez votre projet, le type de vêtement, le marquage souhaité…"
                    className="w-full border border-zinc-200 px-4 py-3 text-sm text-zinc-900 outline-none focus:border-zinc-900 transition placeholder:text-zinc-300 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-zinc-900 text-white py-4 text-sm font-bold uppercase tracking-wide hover:bg-zinc-700 transition"
                >
                  <Send className="w-4 h-4" />
                  Envoyer le message
                </button>

                <p className="text-[11px] text-zinc-400 text-center">
                  En cliquant sur "Envoyer", votre client mail s'ouvrira avec le message pré-rempli.
                </p>
              </form>
            )}
          </div>

          {/* ── Infos ─────────────────────────────────────────────────────── */}
          <div className="space-y-10">
            <div>
              <p className="mb-6 text-xs font-semibold uppercase tracking-widest text-zinc-400">Nos coordonnées</p>
              <ul className="space-y-5">
                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-zinc-900 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-zinc-400 mb-0.5">Téléphone</p>
                    <a href="tel:0749192404" className="text-sm font-semibold text-zinc-900 hover:underline">
                      07 49 19 24 04
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-zinc-900 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-zinc-400 mb-0.5">Email</p>
                    <a href="mailto:arttextilestudio30@gmail.com" className="text-sm font-semibold text-zinc-900 hover:underline break-all">
                      arttextilestudio30@gmail.com
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-zinc-900 flex items-center justify-center shrink-0">
                    <Instagram className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-zinc-400 mb-0.5">Instagram</p>
                    <span className="text-sm font-semibold text-zinc-900">@ats3.0</span>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-zinc-900 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-zinc-400 mb-0.5">Adresse</p>
                    <p className="text-sm font-semibold text-zinc-900">Bellegarde, Gard (30)</p>
                    <p className="text-xs text-zinc-500 mt-0.5">Retrait sur place possible sur rendez-vous</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-zinc-900 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-zinc-400 mb-0.5">Horaires</p>
                    <p className="text-sm text-zinc-700">Lun – Ven : 9h – 18h</p>
                    <p className="text-sm text-zinc-700">Sam : sur rendez-vous</p>
                    <p className="text-sm text-zinc-400">Dim : fermé</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Engagements */}
            <div className="bg-zinc-50 border border-zinc-100 p-6">
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-zinc-400">Nos engagements</p>
              <ul className="space-y-2">
                {[
                  "Réponse sous 24h ouvrées",
                  "Devis gratuit et sans engagement",
                  "Aperçu numérique avant production",
                  "Retravail de votre logo inclus si besoin",
                ].map(item => (
                  <li key={item} className="flex items-center gap-2 text-sm text-zinc-700">
                    <CheckCircle2 className="w-4 h-4 text-zinc-900 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
