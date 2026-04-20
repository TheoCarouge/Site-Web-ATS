import { useCustomizer } from "@/context/CustomizerContext";
import { ArrowUp, ArrowDown, Copy, Trash2, Bold, Italic, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { useEffect, useState } from "react";
import * as fabric from "fabric";

const FONTS = ["Arial", "Impact", "Georgia", "Verdana", "Courier New", "Times New Roman", "Trebuchet MS"];

const PRESET_COLORS = [
  "#ffffff", "#1a1a1a", "#dc2626", "#1d4ed8",
  "#16a34a", "#eab308", "#ea580c", "#7c3aed",
  "#f9a8d4", "#78716c",
];

const FONT_SIZES = [12, 16, 20, 24, 32, 40, 48, 64, 80, 96];

const Label = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-1">{children}</p>
);

const ToggleBtn = ({ active, onClick, children, title }: {
  active?: boolean; onClick: () => void; children: React.ReactNode; title?: string;
}) => (
  <button
    onMouseDown={e => { e.preventDefault(); onClick(); }}
    title={title}
    className={`flex items-center justify-center w-8 h-7 border transition text-xs
      ${active ? "bg-zinc-900 text-white border-zinc-900" : "border-zinc-200 text-zinc-500 hover:border-zinc-900 hover:text-zinc-900"}`}
  >
    {children}
  </button>
);

export default function DesignProperties() {
  const { canvas, activeObject, deleteSelected, isDesignValid, setIsCartOpen, saveCurrentViewState, duplicate, moveLayer, markModified } = useCustomizer();

  const [textValue, setTextValue] = useState("");
  const [fontSize, setFontSize] = useState(40);
  const [fontFamily, setFontFamily] = useState("Arial");
  const [color, setColor] = useState("#ffffff");
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [align, setAlign] = useState<"left" | "center" | "right">("center");

  useEffect(() => {
    if (activeObject instanceof fabric.IText) {
      setTextValue(activeObject.text || "");
      setFontSize(activeObject.fontSize || 40);
      setFontFamily(activeObject.fontFamily || "Arial");
      setColor(typeof activeObject.fill === "string" ? activeObject.fill : "#ffffff");
      setBold(activeObject.fontWeight === "bold");
      setItalic(activeObject.fontStyle === "italic");
      setAlign((activeObject.textAlign as any) || "center");
    }
  }, [activeObject]);

  if (!activeObject) return null;
  const isText = activeObject instanceof fabric.IText;

  const apply = (props: Record<string, any>) => {
    if (!activeObject) return;
    activeObject.set(props as any);
    canvas?.requestRenderAll();
    saveCurrentViewState();
    markModified();
  };

  const setTextVal = (v: string) => { setTextValue(v); if (activeObject instanceof fabric.IText) apply({ text: v }); };
  const setSize = (v: number) => { const s = Math.max(1, v); setFontSize(s); apply({ fontSize: s }); };
  const setFont = (v: string) => { setFontFamily(v); apply({ fontFamily: v }); };
  const setColor_ = (v: string) => { setColor(v); apply({ fill: v }); };
  const toggleBold = () => { const n = !bold; setBold(n); apply({ fontWeight: n ? "bold" : "normal" }); };
  const toggleItalic = () => { const n = !italic; setItalic(n); apply({ fontStyle: n ? "italic" : "normal" }); };
  const setAlign_ = (v: "left" | "center" | "right") => { setAlign(v); apply({ textAlign: v }); };

  return (
    <div className="w-80 bg-white border-l border-zinc-200 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-zinc-100 bg-zinc-50 shrink-0">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
          {isText ? "Éditer le texte" : "Éditer l'image"}
        </p>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">

        {isText && (
          <>
            {/* Text + style */}
            <div className="px-4 py-3 border-b border-zinc-100 space-y-3">
              <div>
                <Label>Texte</Label>
                <input
                  type="text"
                  value={textValue}
                  onChange={e => setTextVal(e.target.value)}
                  className="w-full border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-900 transition"
                />
              </div>

              <div className="flex items-center gap-3">
                {/* Bold / Italic */}
                <div className="flex gap-1">
                  <ToggleBtn active={bold} onClick={toggleBold} title="Gras"><Bold className="w-3 h-3" /></ToggleBtn>
                  <ToggleBtn active={italic} onClick={toggleItalic} title="Italique"><Italic className="w-3 h-3" /></ToggleBtn>
                </div>
                <div className="w-px h-5 bg-zinc-200" />
                {/* Align */}
                <div className="flex gap-1">
                  <ToggleBtn active={align === "left"} onClick={() => setAlign_("left")}><AlignLeft className="w-3 h-3" /></ToggleBtn>
                  <ToggleBtn active={align === "center"} onClick={() => setAlign_("center")}><AlignCenter className="w-3 h-3" /></ToggleBtn>
                  <ToggleBtn active={align === "right"} onClick={() => setAlign_("right")}><AlignRight className="w-3 h-3" /></ToggleBtn>
                </div>
              </div>
            </div>

            {/* Font */}
            <div className="px-4 py-3 border-b border-zinc-100">
              <Label>Police</Label>
              <select
                value={fontFamily}
                onChange={e => setFont(e.target.value)}
                className="w-full border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-900 transition bg-white appearance-none cursor-pointer"
                style={{ fontFamily }}
              >
                {FONTS.map(f => (
                  <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>
                ))}
              </select>
            </div>

            {/* Size */}
            <div className="px-4 py-3 border-b border-zinc-100">
              <Label>Taille — {fontSize}px</Label>
              <input
                type="range"
                min={8}
                max={200}
                step={1}
                value={fontSize}
                onChange={e => setSize(parseInt(e.target.value))}
                className="w-full accent-zinc-900 cursor-pointer mb-2"
              />
              <div className="flex flex-wrap gap-1">
                {FONT_SIZES.map(s => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`px-2 py-0.5 text-[11px] font-bold border transition
                      ${fontSize === s ? "bg-zinc-900 text-white border-zinc-900" : "border-zinc-200 text-zinc-500 hover:border-zinc-900"}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Color */}
        <div className="px-4 py-3 border-b border-zinc-100">
          <Label>Couleur</Label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {PRESET_COLORS.map(c => (
              <button
                key={c}
                onMouseDown={e => { e.preventDefault(); setColor_(c); }}
                title={c}
                className={`w-6 h-6 border-2 transition ${color === c ? "border-zinc-900 scale-110" : "border-zinc-200 hover:border-zinc-500"}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <label
            className="flex items-center gap-2 border border-zinc-200 px-3 py-2 cursor-pointer hover:border-zinc-400 transition"
            onMouseDown={e => { if (e.target !== e.currentTarget.querySelector("input")) e.preventDefault(); }}
          >
            <div className="w-4 h-4 border border-zinc-300 shrink-0" style={{ backgroundColor: color }} />
            <span className="text-xs text-zinc-600 font-mono flex-1">{color.toUpperCase()}</span>
            <span className="text-[10px] text-zinc-400">Perso.</span>
            <input type="color" value={color} onChange={e => setColor_(e.target.value)} className="sr-only" onMouseDown={e => e.stopPropagation()} />
          </label>
        </div>

        {/* Layer actions */}
        <div className="px-4 py-3">
          <Label>Calques &amp; actions</Label>
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { icon: <ArrowUp className="w-3.5 h-3.5" />, label: "Avant", fn: () => moveLayer("up") },
              { icon: <ArrowDown className="w-3.5 h-3.5" />, label: "Arrière", fn: () => moveLayer("down") },
              { icon: <Copy className="w-3.5 h-3.5" />, label: "Copier", fn: duplicate },
              { icon: <Trash2 className="w-3.5 h-3.5" />, label: "Suppr.", fn: (e?: React.MouseEvent) => { e?.preventDefault(); deleteSelected(); }, danger: true },
            ].map(({ icon, label, fn, danger }) => (
              <button
                key={label}
                onMouseDown={e => { if (label === "Suppr.") e.preventDefault(); fn(e as any); }}
                className={`flex flex-col items-center gap-1 py-2.5 border text-[9px] font-bold uppercase tracking-wide transition
                  ${(danger as any)
                    ? "border-zinc-200 text-red-400 hover:border-red-400 hover:bg-red-50"
                    : "border-zinc-200 text-zinc-500 hover:border-zinc-900 hover:text-zinc-900"}`}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="px-4 py-3 border-t border-zinc-100 shrink-0">
        <button
          disabled={!isDesignValid}
          onClick={() => setIsCartOpen(true)}
          className={`w-full py-2.5 text-sm font-bold uppercase tracking-wide transition
            ${isDesignValid ? "bg-zinc-900 text-white hover:bg-zinc-700" : "bg-zinc-100 text-zinc-400 cursor-not-allowed"}`}
        >
          Choisir taille &amp; quantité
        </button>
        {!isDesignValid && (
          <p className="text-[11px] text-red-500 mt-1.5 text-center">Design hors zone d'impression.</p>
        )}
      </div>
    </div>
  );
}
