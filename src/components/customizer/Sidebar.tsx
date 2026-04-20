import { Shirt, Type, Upload, FolderOpen, Save } from "lucide-react";
import { useCustomizer } from "@/context/CustomizerContext";
import { useDropzone } from "react-dropzone";
import { useCallback } from "react";

const SideBtn = ({
  onClick,
  icon,
  label,
  variant = "default",
  disabled = false,
}: {
  onClick: (e?: React.MouseEvent) => void;
  icon: React.ReactNode;
  label: string;
  variant?: "default" | "danger";
  disabled?: boolean;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`flex flex-col items-center justify-center w-full py-4 gap-1.5 transition-colors
      ${disabled
        ? "text-zinc-700 cursor-not-allowed"
        : variant === "danger"
        ? "text-red-400 hover:text-red-300 hover:bg-zinc-800"
        : "text-zinc-400 hover:text-white hover:bg-zinc-800"
      }`}
  >
    <span className="w-5 h-5">{icon}</span>
    <span className="text-[10px] font-semibold uppercase tracking-wide">{label}</span>
  </button>
);

export default function Sidebar() {
  const { addText, addImage, setActiveModal, setShowSaveModal, setShowMyDesigns, savedDesigns } = useCustomizer();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => { if (acceptedFiles.length > 0) addImage(acceptedFiles[0]); },
    [addImage]
  );

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".svg"] },
    noClick: true,
    noKeyboard: true,
    maxSize: 10 * 1024 * 1024,
  });

  return (
    <div
      {...getRootProps()}
      className="w-20 bg-zinc-900 border-r border-zinc-800 flex flex-col items-center py-2 h-full z-30"
    >
      <input {...getInputProps()} />

      <SideBtn onClick={() => setActiveModal("products")} icon={<Shirt className="w-5 h-5" />} label="Produit" />
<SideBtn onClick={addText} icon={<Type className="w-5 h-5" />} label="Texte" />
      <SideBtn onClick={open} icon={<Upload className="w-5 h-5" />} label="Import" />

      <div className="w-10 h-px bg-zinc-800 my-1" />

      {/* Save */}
      <SideBtn onClick={() => setShowSaveModal(true)} icon={<Save className="w-5 h-5" />} label="Sauver" />

      {/* My designs */}
      <button
        onClick={() => setShowMyDesigns(true)}
        className="relative flex flex-col items-center justify-center w-full py-4 gap-1.5 transition-colors text-zinc-400 hover:text-white hover:bg-zinc-800"
      >
        <FolderOpen className="w-5 h-5" />
        <span className="text-[10px] font-semibold uppercase tracking-wide">Designs</span>
        {savedDesigns.length > 0 && (
          <span className="absolute top-2 right-3 w-4 h-4 bg-white text-zinc-900 text-[9px] font-black rounded-full flex items-center justify-center">
            {savedDesigns.length}
          </span>
        )}
      </button>
    </div>
  );
}
