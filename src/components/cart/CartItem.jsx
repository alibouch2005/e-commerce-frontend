export default function CartItem({ item }){

  const product = item.product;

  return(

    <div className="flex items-center justify-between bg-white shadow rounded-lg p-4">

      <div className="flex items-center gap-4">

        <img
          src={product.image 
            ? `http://localhost:8000${product.image}`
            : "https://dummyimage.com/100x100/e5e7eb/6b7280&text=Produit"}
          className="w-20 h-20 object-cover rounded"
        />

        <div>

          <h3 className="font-semibold">
            {product.name}
          </h3>

          <p className="text-gray-500 text-sm">
            {item.price} DH
          </p>

        </div>

      </div>

      <div className="font-bold">

        {(item.price * item.quantity).toFixed(2)} DH

      </div>

    </div>

  )

}