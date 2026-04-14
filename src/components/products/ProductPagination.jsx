export default function ProductPagination({ page, lastPage, setPage }) {
  if (lastPage <= 1) return null;

  const pages = Array.from({ length: lastPage }, (_, i) => i + 1);

  return (
    <nav className="flex items-center gap-1 bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100">
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => {
            setPage(p);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`min-w-[44px] h-11 flex items-center justify-center rounded-xl font-bold transition-all
            ${page === p 
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" 
              : "text-gray-500 hover:bg-gray-50 hover:text-indigo-600"
            }`}
        >
          {p}
        </button>
      ))}
    </nav>
  );
}