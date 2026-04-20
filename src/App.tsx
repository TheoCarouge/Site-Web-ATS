import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import Customize from "@/pages/Customize";
import Cart from "@/pages/Cart";
import Catalogue from "@/pages/Catalogue";
import Tarifs from "@/pages/Tarifs";
import Contact from "@/pages/Contact";
import { CartProvider } from "@/context/CartContext";

function ComingSoon({ page }: { page: string }) {
  return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
      <div className="text-center text-white">
        <p className="text-6xl font-black tracking-tighter mb-4">ATS</p>
        <p className="text-zinc-400 text-sm uppercase tracking-widest">{page} — Bientôt disponible</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <CartProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/customize" element={<Customize />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/catalogue" element={<Catalogue />} />
          <Route path="/tarifs" element={<Tarifs />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </Router>
    </CartProvider>
  );
}
