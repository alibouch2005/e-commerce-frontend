import { useEffect, useState } from "react";
import { getCategories } from "../../services/categoryService";

export default function CategoryFilter({ setCategory }) {

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
        className="px-4 py-2 bg-gray-200 rounded-lg"
      >
        Tous
      </button>

      {categories.map(category=>(
        <button
          key={category.id}
          onClick={()=>setCategory(category.id)}
          className="px-4 py-2 bg-gray-200 rounded-lg"
        >
          {category.name}
        </button>
      ))}

    </div>

  );

}