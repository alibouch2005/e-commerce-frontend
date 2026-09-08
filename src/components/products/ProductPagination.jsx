export default function ProductPagination({ page, lastPage, setPage, meta, perPage, setPerPage, t }) {
  const safeLastPage = Math.max(Number(lastPage || 1), 1);
  const safePage = Math.min(Math.max(Number(page || 1), 1), safeLastPage);

  if (safeLastPage <= 1) return null;

  const pages = Array.from({ length: safeLastPage }, (_, index) => index + 1)
    .filter((item) => item === 1 || item === safeLastPage || Math.abs(item - safePage) <= 2);

  const goToPage = (nextPage) => {
    const resolvedPage = Math.min(Math.max(Number(nextPage || 1), 1), safeLastPage);
    if (resolvedPage === safePage) return;

    setPage(resolvedPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <nav className="flex w-full max-w-5xl flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="text-center text-sm font-bold text-gray-500 sm:text-left">
        {t("productsRange", { from: meta?.from || 0, to: meta?.to || 0, total: meta?.total || 0 })}
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:justify-center sm:overflow-visible sm:pb-0">
        <select
          value={perPage}
          onChange={(event) => {
            setPerPage(Number(event.target.value));
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="h-11 shrink-0 rounded-xl border border-gray-200 bg-white px-3 text-sm font-bold text-gray-600 outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {[12, 24, 48].map((value) => (
            <option key={value} value={value}>{t("perPage", { count: value })}</option>
          ))}
        </select>

        <PaginationButton disabled={safePage === 1} onClick={() => goToPage(1)} label="«" ariaLabel={t("firstPage")} />
        <PaginationButton disabled={safePage === 1} onClick={() => goToPage(safePage - 1)} label={t("previous")} />

        {pages.map((item, index) => {
          const previous = pages[index - 1];
          const showDots = previous && item - previous > 1;

          return (
            <span key={item} className="flex shrink-0 items-center gap-1">
              {showDots && <span className="px-1 text-gray-300">...</span>}
              <button
                type="button"
                onClick={() => goToPage(item)}
                aria-current={safePage === item ? "page" : undefined}
                className={`flex h-11 min-w-[44px] items-center justify-center rounded-xl font-black transition-all ${
                  safePage === item
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100"
                    : "text-gray-500 hover:bg-gray-50 hover:text-indigo-600"
                }`}
              >
                {item}
              </button>
            </span>
          );
        })}

        <PaginationButton disabled={safePage === safeLastPage} onClick={() => goToPage(safePage + 1)} label={t("next")} />
        <PaginationButton disabled={safePage === safeLastPage} onClick={() => goToPage(safeLastPage)} label="»" ariaLabel={t("lastPage")} />
      </div>
    </nav>
  );
}

function PaginationButton({ disabled, onClick, label, ariaLabel }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      className="h-11 shrink-0 rounded-xl px-3 text-sm font-black text-gray-500 transition hover:bg-gray-50 hover:text-indigo-600 disabled:pointer-events-none disabled:opacity-30"
    >
      {label}
    </button>
  );
}
