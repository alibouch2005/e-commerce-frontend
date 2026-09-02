import { Component } from "react";
import { AlertTriangle, Home } from "lucide-react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error("Application error", error);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f7fb] px-4 dark:bg-gray-950">
        <div className="max-w-md rounded-2xl border border-red-100 bg-white p-6 text-center shadow-sm dark:border-red-900/40 dark:bg-gray-900">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950/60">
            <AlertTriangle size={28} />
          </div>
          <h1 className="mt-5 text-2xl font-black text-gray-950 dark:text-white">Une erreur est survenue</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-300">Rechargez la page ou retournez a l'accueil.</p>
          <a href="/" className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white hover:bg-indigo-700">
            <Home size={18} /> Retour accueil
          </a>
        </div>
      </div>
    );
  }
}
