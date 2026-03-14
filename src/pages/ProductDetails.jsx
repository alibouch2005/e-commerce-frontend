import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProduct } from "../services/productService";

export default function ProductDetails(){

  const { id } = useParams();

  const [product,setProduct] = useState(null);

  useEffect(()=>{

    getProduct(id).then(res=>{
      setProduct(res.data);
    });

  },[id]);

  if(!product){
    return <p className="text-center mt-10">Chargement...</p>;
  }

  return(

    <div className="max-w-6xl mx-auto p-6">

      <div className="grid md:grid-cols-2 gap-8">

        <div className="bg-gray-100 h-80 rounded-lg flex items-center justify-center">
          {product.image ? (
            <img src={`http://localhost:8000${product.image}`} alt={product.name}/>
          ) : (
            <span>Image produit</span>
          )}
        </div>

        <div>

          <h1 className="text-3xl font-bold mb-4">
            {product.name}
          </h1>

          <p className="text-gray-500 mb-4">
            {product.category?.name}
          </p>

          <p className="text-lg mb-6">
            {product.description}
          </p>

          <p className="text-2xl font-bold text-blue-600 mb-4">
            {product.price} DH
          </p>

          <p className="mb-6">
            Stock : {product.stock}
          </p>

          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
            Ajouter au panier
          </button>

        </div>

      </div>

    </div>

  )

}