import { useContext } from "react";
import { CartContext } from "../context/CartContext";

export default function Cart(){

  const { cart, loading } = useContext(CartContext);

  if(loading){
    return <p className="text-center mt-10">Chargement panier...</p>;
  }

  if(!cart || !cart.items || cart.items.length === 0){
    return (
      <div className="text-center mt-20">
        <h2 className="text-2xl font-semibold">
          Votre panier est vide
        </h2>
      </div>
    );
  }

  return(

    <div className="max-w-6xl mx-auto p-6">

      <h1 className="text-2xl font-bold mb-6">
        Votre panier
      </h1>

      <div className="space-y-4">

        {cart.items.map(item => (

          <div
            key={item.id}
            className="flex items-center justify-between bg-white shadow p-4 rounded-lg"
          >

            <div>

              <h3 className="font-semibold">
                {item.product.name}
              </h3>

              <p className="text-gray-500">
                {item.price_at_addition} DH
              </p>

            </div>

            <div>

              Quantité : {item.quantity}

            </div>

            <div className="font-bold">

              {item.quantity * item.price_at_addition} DH

            </div>

          </div>

        ))}

      </div>

    </div>

  );

}