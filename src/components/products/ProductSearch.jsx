import { useState } from "react";

export default function ProductSearch({ setSearch }) {

  const [value, setValue] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setSearch(value);
  };

  return (

    <form
      onSubmit={handleSubmit}
      className="flex gap-2 mb-6"
    >

      <input
        type="text"
        placeholder="Rechercher un produit..."
        value={value}
        onChange={(e)=>setValue(e.target.value)}
        className="border px-4 py-2 rounded w-full"
      />

      <button
        className="bg-indigo-600 text-white px-4 py-2 rounded"
      >
        Search
      </button>

    </form>

  );

}