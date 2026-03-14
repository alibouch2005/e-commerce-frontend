export default function ProductDetailsSkeleton(){

  return(

    <div className="max-w-6xl mx-auto p-6">

      <div className="grid md:grid-cols-2 gap-8 animate-pulse">

        <div className="bg-gray-200 h-80 rounded-lg"></div>

        <div>

          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>

          <div className="h-4 bg-gray-200 rounded w-1/3 mb-6"></div>

          <div className="space-y-2 mb-6">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>

          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>

          <div className="h-10 bg-gray-200 rounded w-40"></div>

        </div>

      </div>

    </div>

  )

}