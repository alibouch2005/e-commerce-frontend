import ProductCard from "./ProductCard";

export default function ProductGrid({ products }) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-dashed border-gray-200">
        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">
          Aucun produit disponible dans ce rayon
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}