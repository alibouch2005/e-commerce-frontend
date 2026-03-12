import Card  from "../ui/Card";
import Button from "../ui/Button";

export default function ProductCard({ product }) {

  return (

    <Card className="p-4 flex flex-col gap-3 hover:shadow-lg transition">

      <img
        src={product.image || "https://via.placeholder.com/300"}
        alt={product.name}
        className="w-full h-48 object-cover rounded-lg"
      />

      <h3 className="text-lg font-semibold">
        {product.name}
      </h3>

      <p className="text-gray-500 text-sm">
        {product.category?.name}
      </p>

      <div className="flex items-center justify-between mt-auto">

        <span className="text-xl font-bold text-green-600">
          {product.price} DH
        </span>

        <Button variant="primary" size="sm">
          Ajouter
        </Button>

      </div>

    </Card>

  );

}