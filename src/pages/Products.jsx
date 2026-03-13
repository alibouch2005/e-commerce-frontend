import { useEffect, useState } from "react";
import { getProducts } from "../services/productService";
import ProductGrid from "../components/products/ProductGrid";

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

      <h1 className="text-2xl font-bold mb-6">
        Nos Produits
      </h1>

      <ProductGrid products={products} />

    </div>

  )

}