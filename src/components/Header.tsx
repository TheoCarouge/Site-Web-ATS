import { ShoppingCart, Menu, X, Phone } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useState } from "react";

const NAV_LINKS = [
  { label: "Catalogue", to: "/catalogue" },
  { label: "Tarifs", to: "/tarifs" },
  { label: "Personnaliser", to: "/customize" },
  { label: "Contact", to: "/contact" },
];

export default function Header() {
  const { items } = useCart();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <header className="w-full bg-zinc-900 text-white relative z-40">
      {/* Top micro-bar */}
      <div className="hidden md:flex items-center justify-center gap-8 bg-zinc-950 px-6 py-1.5 text-[11px] text-zinc-400">
        <span>📍 Bellegarde, Gard (30)</span>
        <span>📞 07 49 19 24 04</span>
        <span>✉️ arttextilestudio.30@gmail.com</span>
        <span>📸 @ats3.0</span>
      </div>

      {/* Main bar */}
      <div className="mx-auto max-w-7xl flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link to="/" className="flex flex-col leading-none select-none">
          <span className="text-2xl font-black tracking-tighter text-white">ATS</span>
          <span className="text-[8px] font-semibold uppercase tracking-[0.3em] text-zinc-500">Art &amp; Textile Studio</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map(({ label, to }) => {
            const active = pathname === to || (to !== "/" && pathname.startsWith(to));
            return (
              <Link
                key={to}
                to={to}
                className={`relative text-sm font-medium uppercase tracking-wide transition
                  ${active ? "text-white" : "text-zinc-300 hover:text-white"}`}
              >
                {label}
                {active && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-white rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-4">
          <Link
            to="/customize"
            className="hidden md:inline-flex items-center gap-2 bg-white text-zinc-900 px-5 py-2 text-xs font-bold uppercase tracking-wide hover:bg-zinc-100 transition"
          >
            Je personnalise
          </Link>
          <Link to="/cart" className="relative text-zinc-300 hover:text-white transition">
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] font-bold text-zinc-900">
                {cartCount}
              </span>
            )}
          </Link>
          <a href="tel:0749192404" className="hidden md:block text-zinc-400 hover:text-white transition">
            <Phone className="h-5 w-5" />
          </a>
          <button className="lg:hidden text-zinc-300" onClick={() => setOpen(p => !p)} aria-label="Menu">
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden bg-zinc-800 border-t border-zinc-700">
          <nav className="flex flex-col px-6 py-4 gap-1">
            {NAV_LINKS.map(({ label, to }) => (
              <Link
                key={to}
                to={to}
                className="py-3 text-sm font-medium uppercase tracking-wide text-zinc-300 hover:text-white border-b border-zinc-700 last:border-0"
                onClick={() => setOpen(false)}
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="px-6 py-4 border-t border-zinc-700 space-y-1 text-xs text-zinc-400">
            <p>📞 07 49 19 24 04</p>
            <p>✉️ arttextilestudio.30@gmail.com</p>
          </div>
        </div>
      )}
    </header>
  );
}
