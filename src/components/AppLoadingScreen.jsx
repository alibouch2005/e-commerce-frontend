export default function AppLoadingScreen({ label = "Chargement de votre espace…" }) {
  return (
    <div role="status" aria-live="polite" className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50 to-sky-50 px-5">
      <div className="w-full max-w-sm rounded-3xl border border-white bg-white/90 p-7 text-center shadow-[0_30px_80px_-35px_rgba(79,70,229,.45)] backdrop-blur">
        <div className="flex items-center justify-center gap-2">
          <img src="/alishop-icon.png" alt="" width="44" height="44" className="h-11 w-11 object-contain" />
          <span className="text-2xl font-black tracking-tight text-slate-950">Ali<span className="text-indigo-600">Shop</span></span>
        </div>
        <div className="mx-auto mt-7 h-2 w-full overflow-hidden rounded-full bg-indigo-100">
          <span className="block h-full w-1/2 animate-pulse rounded-full bg-gradient-to-r from-indigo-600 to-violet-500" />
        </div>
        <p className="mt-4 text-sm font-bold text-slate-600">{label}</p>
        <p className="mt-1 text-xs text-slate-400">Connexion sécurisée à AliShop</p>
      </div>
    </div>
  );
}
