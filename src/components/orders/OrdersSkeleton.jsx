export default function OrdersSkeleton() {
  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 space-y-4">
      {[1,2,3].map(i => (
        <div key={i} className="bg-white p-4 rounded-xl shadow animate-pulse">
          <div className="h-4 bg-gray-200 w-1/3 mb-2 rounded"></div>
          <div className="h-3 bg-gray-200 w-1/2 mb-2 rounded"></div>
          <div className="h-3 bg-gray-200 w-1/4 rounded"></div>
        </div>
      ))}
    </div>
  );
}