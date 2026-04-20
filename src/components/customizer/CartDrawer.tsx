import { X, Trash2, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useCustomizer } from "@/context/CustomizerContext";
import { createCheckout, addItemToCheckout } from "@/lib/shopify";
import { uploadAllViewsToImgBB } from "@/lib/imgbb";
import { useState } from "react";

export default function CartDrawer() {
  const { items, removeFromCart, updateQuantity, total } = useCart();
  const { isCartOpen, setIsCartOpen } = useCustomizer();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setIsCheckingOut(true);
    try {
      const shopifyItems = items.filter(i => i.variantId);
      if (shopifyItems.length > 0) {
        const checkout = await createCheckout();
        if (!checkout) throw new Error();

        // Upload composite images (vêtement + design) for each view, then attach URLs to line items
        const lineItems = await Promise.all(shopifyItems.map(async item => {
          const customAttributes: { key: string; value: string }[] = [
            { key: "Couleur", value: item.color },
            { key: "Taille", value: item.size },
          ];
          if (item.viewCanvasStates && item.viewProductImages) {
            const { attributes } = await uploadAllViewsToImgBB(item.viewCanvasStates, item.viewProductImages);
            customAttributes.push(...attributes);
          }
          return { variantId: item.variantId!, quantity: item.quantity, customAttributes };
        }));

        const updated = await addItemToCheckout(checkout.id, lineItems);
        if (updated?.webUrl) { window.location.href = updated.webUrl; return; }
      }
      alert(`Commande de ${items.length} article(s) — ${(total + 7.49).toFixed(2)} €`);
    } catch {
      alert("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex justify-end">
      <div className="absolute inset-0 bg-black/60" onClick={() => setIsCartOpen(false)} />

      <div className="relative flex h-full w-full max-w-sm flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4 bg-zinc-900">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-white" />
            <h2 className="text-sm font-black uppercase tracking-wide text-white">Panier ({items.length})</h2>
          </div>
          <button onClick={() => setIsCartOpen(false)} className="text-zinc-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Promo banner */}
        <div className="bg-zinc-800 px-5 py-2 text-center">
          <p className="text-[11px] font-semibold text-zinc-300">
            Dès 6 articles : <span className="text-white font-black">−10 %</span> · Dès 20 : <span className="text-white font-black">−20 %</span>
          </p>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ShoppingCart className="w-10 h-10 text-zinc-200 mb-3" />
              <p className="text-sm text-zinc-400">Votre panier est vide.</p>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className="flex gap-3 border border-zinc-100 p-3">
                <div className="w-20 h-20 shrink-0 bg-zinc-100 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    onError={e => { (e.target as HTMLImageElement).src = "https://placehold.co/80x80/f4f4f5/a1a1aa?text=ATS"; }}
                  />
                </div>
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <p className="text-xs font-bold text-zinc-900 truncate">{item.title}</p>
                    <p className="text-[11px] text-zinc-400">{item.color}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-[10px] text-zinc-400 uppercase tracking-wide">Taille</p>
                      <p className="text-xs font-semibold text-zinc-900">{item.size}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-400 uppercase tracking-wide">Qté</p>
                      <div className="flex items-center border border-zinc-200">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-6 h-6 flex items-center justify-center text-zinc-500 hover:bg-zinc-50 text-sm">−</button>
                        <span className="w-6 text-center text-xs font-semibold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-6 h-6 flex items-center justify-center text-zinc-500 hover:bg-zinc-50 text-sm">+</button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col justify-between items-end">
                  <button onClick={() => removeFromCart(item.id)} className="text-zinc-300 hover:text-red-400 transition">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <p className="text-sm font-black text-zinc-900">{(item.price * item.quantity).toFixed(2)} €</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-zinc-200 px-5 py-4 bg-zinc-50">
          <div className="space-y-1 mb-4">
            <div className="flex justify-between text-sm text-zinc-600">
              <span>Sous-total</span><span className="font-semibold">{total.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-sm text-zinc-600">
              <span>Livraison</span><span className="font-semibold">7,49 €</span>
            </div>
            <div className="flex justify-between text-base font-black text-zinc-900 pt-2 border-t border-zinc-200">
              <span>Total</span><span>{(total + 7.49).toFixed(2).replace(".", ",")} €</span>
            </div>
            <p className="text-[10px] text-zinc-400 text-right">TTC · frais de port inclus</p>
          </div>

          <button
            onClick={handleCheckout}
            disabled={items.length === 0 || isCheckingOut}
            className={`w-full py-3 text-sm font-bold uppercase tracking-wide transition
              ${items.length > 0 && !isCheckingOut ? "bg-zinc-900 text-white hover:bg-zinc-700" : "bg-zinc-200 text-zinc-400 cursor-not-allowed"}`}
          >
            {isCheckingOut ? "Envoi du design…" : "Commander"}
          </button>
        </div>
      </div>
    </div>
  );
}
