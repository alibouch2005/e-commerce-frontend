import ProductSkeleton from "./ProductSkeleton";

export default function ProductSkeletonGrid(){

  return(

    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

      {[...Array(8)].map((_,index)=>(
        <ProductSkeleton key={index}/>
      ))}

    </div>

  )

}