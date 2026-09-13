import ProductSkeleton from "./ProductSkeleton";

export default function ProductSkeletonGrid() {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 lg:gap-8">
      {[...Array(8)].map((_, index) => (
        <ProductSkeleton key={index} />
      ))}
    </div>
  );
}
