export default function ProductPagination({ page, lastPage, setPage }){

  const pages = [];

  for(let i=1;i<=lastPage;i++){
    pages.push(i);
  }

  return(

    <div className="flex justify-center gap-2 mt-8">

      {pages.map(p => (

        <button
          key={p}
          onClick={()=>setPage(p)}
          className={`px-4 py-2 rounded ${
            page === p
              ? "bg-indigo-600 text-white"
              : "bg-gray-200"
          }`}
        >
          {p}
        </button>

      ))}

    </div>

  )

}