import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/customizer/Sidebar";
import ProductPreview from "@/components/customizer/ProductPreview";
import ProductDetails from "@/components/customizer/ProductDetails";
import InitialModal from "@/components/customizer/InitialModal";
import ProductSelectorModal from "@/components/customizer/ProductSelectorModal";
import CartDrawer from "@/components/customizer/CartDrawer";
import DesignProperties from "@/components/customizer/DesignProperties";
import SaveModal from "@/components/customizer/SaveModal";
import MyDesignsDrawer from "@/components/customizer/MyDesignsDrawer";
import { Phone, Save } from "lucide-react";
import { CustomizerProvider, useCustomizer } from "@/context/CustomizerContext";

function CustomizerContent() {
  const { activeModal, activeObject, loadShopifyProduct, showSaveModal, showMyDesigns, setShowSaveModal, isDirty, canvas } = useCustomizer();
  const [showInitialModal, setShowInitialModal] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("ats_designs") || "[]");
      return !Array.isArray(saved) || saved.length === 0;
    } catch { return true; }
  });

  useEffect(() => {
    loadShopifyProduct("t-shirt-a-manches-courtes-personnalise-femme");
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col bg-zinc-100 font-sans"
      onMouseDown={(e) => {
        if (!canvas || !activeObject) return;
        const target = e.target as HTMLElement;
        if (!target.closest("canvas")) {
          canvas.discardActiveObject();
          canvas.requestRenderAll();
        }
      }}
    >
      <Header />

      {/* Workspace toolbar */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-6 py-2 flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">Personnalisation</p>
        <div className="flex items-center gap-6">
          <a href="tel:0749192404" className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-400 hover:text-white transition">
            <Phone className="w-3.5 h-3.5" /> Assistance
          </a>
          <button
            onClick={() => isDirty && setShowSaveModal(true)}
            disabled={!isDirty}
            className={`flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide transition
              ${isDirty ? "text-white hover:text-zinc-300 cursor-pointer" : "text-zinc-600 cursor-not-allowed"}`}
          >
            <Save className="w-3.5 h-3.5" />
            {isDirty ? "Enregistrer *" : "Enregistré"}
          </button>
        </div>
      </div>

      {/* Main editor */}
      <main className="flex-1 flex overflow-hidden" style={{ height: "calc(100vh - 110px)" }}>
        <Sidebar />
        <ProductPreview />
        {activeObject ? <DesignProperties /> : <ProductDetails />}
      </main>

      {showInitialModal && <InitialModal onClose={() => setShowInitialModal(false)} />}
      {activeModal === "products" && <ProductSelectorModal />}
      {showSaveModal && <SaveModal />}
      {showMyDesigns && <MyDesignsDrawer />}
      <CartDrawer />
    </div>
  );
}

export default function Customize() {
  return (
    <CustomizerProvider>
      <CustomizerContent />
    </CustomizerProvider>
  );
}
