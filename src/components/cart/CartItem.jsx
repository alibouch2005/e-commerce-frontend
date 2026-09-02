export default function CartItem({ item }){

  const product = item.product;
  const fallbackImage = "/product-placeholder.svg";

  return(

    <div className="flex items-center justify-between bg-white shadow rounded-lg p-4">

      <div className="flex items-center gap-4">

        <img
          src={product.image || fallbackImage}
          className="w-20 h-20 object-cover rounded"
          alt={product.name}
          loading="lazy"
          decoding="async"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = fallbackImage;
          }}
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
