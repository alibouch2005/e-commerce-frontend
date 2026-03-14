import { useEffect, useState } from "react";
import { CartContext } from "./CartContext";
import { getCart, addToCart } from "../services/cartService";

export default function CartProvider({ children }){

  const [cart,setCart] = useState(null);
  const [loading,setLoading] = useState(true);

  useEffect(()=>{

    loadCart();

  },[]);

  const loadCart = async ()=>{

    try{

      const res = await getCart();
      setCart(res.data);

    }catch(err){

      console.error(err);

    }finally{

      setLoading(false);

    }

  };

  const addItem = async (product_id, quantity = 1)=>{

    try{

      const res = await addToCart(product_id, quantity);
      setCart(res.data);

    }catch(err){

      console.error(err);

    }

  };

  return(

    <CartContext.Provider
      value={{
        cart,
        addItem,
        loading
      }}
    >

      {children}

    </CartContext.Provider>

  );

}