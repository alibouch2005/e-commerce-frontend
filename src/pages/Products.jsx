import { useEffect, useState } from "react";
import { getProducts } from "../services/productService";

export default function Products(){

const [products,setProducts] = useState([]);

useEffect(()=>{

  getProducts()
    .then(res=>{
    console.log("API RESPONSE :", res.data);
      setProducts(res.data.data);
    });

},[]);

return(

<div>
<h1>Products</h1>
{products.length === 0 && <p>Aucun produit</p>}
{products.map(product=>(
<div key={product.id}>
{product.name} - {product.price}
</div>
))}

</div>

)

}