import { useState, useEffect } from "react";

export default function ProductSearch({ setSearch }) {

  const [value, setValue] = useState("");

  useEffect(() => {

    const timer = setTimeout(() => {
      setSearch(value);
    }, 500); // debounce 500ms

    return () => clearTimeout(timer);

  }, [value, setSearch]);

  return (

    <div className="mb-6">

     <input
    type="text"
    placeholder="🔍 Rechercher un produit..."
    value={value}
    onChange={(e)=>setValue(e.target.value)}
    className="border px-4 py-2 rounded w-full"
  />

    </div>

  );

}