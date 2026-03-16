export default function CartSummary({ cart }){

  const total = cart.items.reduce(
    (sum,item)=> sum + item.price * item.quantity,
    0
  );

  return(

    <div className="bg-white shadow rounded-lg p-6 h-fit">

      <h2 className="text-xl font-bold mb-4">
        Résumé
      </h2>

      <div className="flex justify-between mb-2">
        <span>Total</span>
        <span className="font-bold">
          {total.toFixed(2)} DH
        </span>
      </div>

      <button className="w-full mt-4 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700">
        Passer la commande
      </button>

    </div>

  )

}