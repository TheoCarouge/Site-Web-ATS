import Header from "@/components/Header";
import { useCart } from "@/context/CartContext";
import { Link } from "react-router-dom";
import { Lock, ShieldCheck, CreditCard } from "lucide-react";

export default function Cart() {
  const { items, removeFromCart, total } = useCart();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <h1 className="mb-8 text-3xl font-bold">Mon Panier</h1>

        {items.length === 0 ? (
          <div className="rounded-lg bg-white p-12 text-center shadow-sm">
            <p className="text-lg text-gray-500 mb-4">Votre panier est vide.</p>
            <Link to="/customize" className="inline-block rounded bg-zinc-800 px-6 py-2 font-bold text-white hover:bg-zinc-700">
              Commencer à créer
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-8 lg:flex-row">
            {/* Cart Items */}
            <div className="flex-1 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 rounded-lg bg-white p-4 shadow-sm">
                  <div className="h-24 w-24 overflow-hidden rounded bg-gray-100">
                    <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{item.title}</h3>
                    <p className="text-sm text-gray-500">Couleur: {item.color}</p>
                    <p className="text-sm text-gray-500">Taille: {item.size}</p>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="mt-2 text-sm text-red-500 hover:text-red-700"
                    >
                      Supprimer
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{item.price.toFixed(2)} €</p>
                    <p className="text-sm text-gray-500">x {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Checkout Summary */}
            <div className="w-full lg:w-96">
              <div className="rounded-lg bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-xl font-bold">Récapitulatif</h2>
                
                <div className="mb-4 flex justify-between border-b pb-4">
                  <span className="text-gray-600">Sous-total</span>
                  <span className="font-medium">{total.toFixed(2)} €</span>
                </div>
                
                <div className="mb-6 flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span>{total.toFixed(2)} €</span>
                </div>

                <button className="flex w-full items-center justify-center gap-2 rounded bg-green-600 py-4 font-bold text-white transition hover:bg-green-700">
                  <Lock className="h-5 w-5" />
                  Paiement Sécurisé
                </button>

                {/* Security Trust Badges */}
                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <ShieldCheck className="h-5 w-5 text-green-600" />
                    <span>Paiement crypté SSL 256-bit</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                    <span>Transactions gérées par Stripe</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-4 text-center">
                    Nous ne stockons jamais vos informations bancaires.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
