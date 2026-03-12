import { useEffect, useState } from "react";
import { getProducts } from "../services/productService";
import ProductCard from "../components/product/ProductCard";

export default function Products(){

const [products,setProducts] = useState([]);

useEffect(()=>{

  getProducts()
    .then(res=>{
      setProducts(res.data.data);
    });

},[]);

return(

<div className="max-w-7xl mx-auto p-6">

<h1 className="text-3xl font-bold mb-6">
Products
</h1>

{products.length === 0 && (

<p className="text-gray-500">
Aucun produit
</p>

)}

<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

{products.map(product=>(
<ProductCard key={product.id} product={product} />
))}

</div>

</div>

)

}