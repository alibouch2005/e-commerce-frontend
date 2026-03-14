import { useEffect, useState } from "react";
import { getProducts } from "../services/productService";

export default function useProducts(page, search){

  const [products,setProducts] = useState([]);
  const [lastPage,setLastPage] = useState(1);
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState(null);

  useEffect(()=>{

    setLoading(true);
    setError(null);

    getProducts({ page, search })
      .then(res=>{
        setProducts(res.data.data);
        setLastPage(res.data.last_page);
      })
      .catch(err=>{
        console.error(err);
        setError(err);
      })
      .finally(()=>{
        setLoading(false);
      });

  },[page,search]);

  return { products, lastPage, loading, error };

}