import { X, Shirt, Type, Upload, ArrowRight } from "lucide-react";
import { useCustomizer } from "@/context/CustomizerContext";
import { useDropzone } from "react-dropzone";
import { useCallback } from "react";

interface InitialModalProps {
  onClose: () => void;
}

const STEPS = [
  {
    step: "01",
    icon: <Shirt className="w-6 h-6" />,
    title: "Choisir un produit",
    desc: "T-shirt, polo, sweat, veste…",
    action: "products" as const,
  },
  {
    step: "02",
    icon: <Type className="w-6 h-6" />,
    title: "Ajouter votre design",
    desc: "Texte, logo, illustration",
    action: "text" as const,
  },
  {
    step: "03",
    icon: <Upload className="w-6 h-6" />,
    title: "Importer un fichier",
    desc: "PNG, JPG, SVG — max 10 Mo",
    action: "upload" as const,
  },
];

export default function InitialModal({ onClose }: InitialModalProps) {
  const { addText, addImage, setActiveModal } = useCustomizer();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) { addImage(acceptedFiles[0]); onClose(); }
    },
    [addImage, onClose]
  );

  const { getInputProps, open } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".svg"] },
    noClick: true,
    noKeyboard: true,
  });

  const handle = (action: "products" | "text" | "upload") => {
    if (action === "products") { setActiveModal("products"); onClose(); }
    else if (action === "text") { addText(); onClose(); }
    else { open(); }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4">
      <input {...getInputProps()} />

      <div className="relative w-full max-w-2xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-zinc-900 px-8 py-6 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Art &amp; Textile Studio</p>
            <h2 className="text-2xl font-black uppercase text-white">Studio de personnalisation</h2>
            <p className="text-sm text-zinc-400 mt-1">3 étapes pour créer votre vêtement unique</p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition mb-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps */}
        <div className="divide-y divide-zinc-100">
          {STEPS.map(({ step, icon, title, desc, action }) => (
            <button
              key={step}
              onClick={() => handle(action)}
              className="w-full flex items-center gap-6 px-8 py-5 hover:bg-zinc-50 transition group text-left"
            >
              {/* Step number */}
              <span className="text-3xl font-black text-zinc-100 group-hover:text-zinc-200 transition w-10 shrink-0 select-none">
                {step}
              </span>
              {/* Icon */}
              <div className="w-10 h-10 bg-zinc-900 flex items-center justify-center shrink-0 text-white group-hover:bg-zinc-700 transition">
                {icon}
              </div>
              {/* Text */}
              <div className="flex-1">
                <p className="text-sm font-bold text-zinc-900">{title}</p>
                <p className="text-xs text-zinc-400 mt-0.5">{desc}</p>
              </div>
              {/* Arrow */}
              <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-900 group-hover:translate-x-1 transition-all" />
            </button>
          ))}
        </div>

        {/* Footer hint */}
        <div className="px-8 py-4 bg-zinc-50 border-t border-zinc-100">
          <p className="text-[11px] text-zinc-400 text-center">
            Un produit est déjà sélectionné par défaut. Vous pouvez commencer directement en ajoutant un texte ou un design.
          </p>
        </div>
      </div>
    </div>
  );
}
