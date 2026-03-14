import { useEffect, useState } from "react";
import { getCategories } from "../../services/categoryService";

export default function CategoryFilter({ category, setCategory }) {

  const [categories,setCategories] = useState([]);

  useEffect(()=>{

    getCategories().then(res=>{
      setCategories(res.data);
    });

  },[]);

  return (

    <div className="flex gap-3 mb-6 flex-wrap">

      <button
        onClick={()=>setCategory(null)}
        className={`px-4 py-2 rounded-lg transition
        ${category === null 
          ? "bg-blue-600 text-white"
          : "bg-gray-200 hover:bg-gray-300"}`}
      >
        Tous
      </button>

      {categories.map(cat=>(
        <button
          key={cat.id}
          onClick={()=>setCategory(cat.id)}
          className={`px-4 py-2 rounded-lg transition
          ${category === cat.id
            ? "bg-blue-600 text-white"
            : "bg-gray-200 hover:bg-gray-300"}`}
        >
          {cat.name}
        </button>
      ))}

    </div>

  );

}