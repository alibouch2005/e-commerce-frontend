export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-10">

      <div className="max-w-7xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-8">

        {/* LOGO */}
        <div>
          <h2 className="text-xl font-bold text-white mb-2">
            🛒 AliShop
          </h2>
          <p className="text-sm">
            Votre boutique en ligne moderne au Maroc 🇲🇦
          </p>
        </div>

        {/* LINKS */}
        <div>
          <h3 className="font-semibold text-white mb-2">Navigation</h3>
          <ul className="space-y-1 text-sm">
            <li>Produits</li>
            <li>Panier</li>
            <li>Commandes</li>
          </ul>
        </div>

        {/* CONTACT */}
        <div>
          <h3 className="font-semibold text-white mb-2">Contact</h3>
          <p className="text-sm">Email : contact@alishop.ma</p>
          <p className="text-sm">Tel : +212 6 00 00 00 00</p>
        </div>

      </div>

      <div className="text-center text-xs py-4 border-t border-gray-700">
        © {new Date().getFullYear()} AliShop — Tous droits réservés
      </div>

    </footer>
  );
}