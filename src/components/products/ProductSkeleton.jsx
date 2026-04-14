export default function ProductSkeleton() {
  return (
    <div className="bg-white rounded-[2.5rem] border border-gray-100 p-6 animate-pulse h-[500px] flex flex-col">
      <div className="w-full h-[280px] bg-gray-50 rounded-3xl mb-6"></div>
      <div className="h-2 bg-gray-50 rounded w-1/4 mb-4"></div>
      <div className="h-6 bg-gray-50 rounded w-3/4 mb-auto"></div>
      <div className="flex justify-between items-center pt-4 border-t border-gray-50">
        <div className="h-8 bg-gray-50 rounded w-1/3"></div>
        <div className="h-12 w-12 bg-gray-50 rounded-2xl"></div>
      </div>
    </div>
  );
}