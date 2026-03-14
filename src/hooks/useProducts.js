import { useEffect, useState } from "react";
import { getProducts } from "../services/productService";

export default function useProducts(page, search, category) {

  const [products,setProducts] = useState([]);
  const [lastPage,setLastPage] = useState(1);
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState(null);

  useEffect(()=>{

    setLoading(true);
    setError(null);

    getProducts({ page, search ,  category_id: category })
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

  },[page,search,category]);

  return { products, lastPage, loading, error };

}