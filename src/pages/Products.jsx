import { useEffect, useState } from "react";
import { getProducts } from "../services/productService";
import ProductGrid from "../components/products/ProductGrid";
import ProductPagination from "../components/products/ProductPagination";
import ProductSearch from "../components/products/ProductSearch";

export default function Products(){

  const [products,setProducts] = useState([]);
  const [page,setPage] = useState(1);
  const [lastPage,setLastPage] = useState(1);
  const [search,setSearch] = useState("");
  const [loading,setLoading] = useState(false);

  useEffect(()=>{

    setLoading(true);

    getProducts({ page, search })
      .then(res=>{
        setProducts(res.data.data);
        setLastPage(res.data.last_page);
      })
      .catch(err=>{
        console.error("Erreur produits :", err);
      })
      .finally(()=>{
        setLoading(false);
      });

  },[page,search]);

  useEffect(()=>{
    setPage(1);
  },[search]);

  return(

    <div className="max-w-7xl mx-auto p-6">

      <h1 className="text-2xl font-bold mb-6">
        Nos Produits
      </h1>

      <ProductSearch setSearch={setSearch} />

      {loading ? (
        <p className="text-center">Chargement...</p>
      ) : (
        <ProductGrid products={products} />
      )}

      <ProductPagination
        page={page}
        lastPage={lastPage}
        setPage={setPage}
      />

    </div>

  )

}