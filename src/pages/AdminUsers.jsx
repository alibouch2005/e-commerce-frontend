import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Loader2, Plus, Search, ShoppingBag, Trash2, Trophy, UserCog, Users } from "lucide-react";
import api from "../Api/axios";
import { AuthContext } from "../context/AuthContext";
import { showApiError } from "../utils/showApiError";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  address: "",
  password: "",
  role: "livreur",
};

const roleLabels = {
  admin: "Administrateur",
  client: "Client",
  livreur: "Livreur",
};

const roleBadge = {
  admin: "bg-indigo-50 text-indigo-700",
  client: "bg-emerald-50 text-emerald-700",
  livreur: "bg-amber-50 text-amber-700",
};

export default function AdminUsers() {
  const { user: currentUser } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [roleFilter, setRoleFilter] = useState("");
  const [search, setSearch] = useState("");

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/users", { params: roleFilter ? { role: roleFilter } : {} });
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      showApiError(error, "Impossible de charger les utilisateurs");
    } finally {
      setLoading(false);
    }
  }, [roleFilter]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return users;
    return users.filter((item) => [item.name, item.email, item.phone, item.role].filter(Boolean).some((value) => String(value).toLowerCase().includes(term)));
  }, [search, users]);

  const stats = useMemo(() => ({
    total: users.length,
    clients: users.filter((item) => item.role === "client").length,
    livreurs: users.filter((item) => item.role === "livreur").length,
    admins: users.filter((item) => item.role === "admin").length,
  }), [users]);

  const topClients = useMemo(() => users
    .filter((item) => item.role === "client")
    .sort((a, b) => Number(b.total_spent || 0) - Number(a.total_spent || 0) || Number(b.orders_count || 0) - Number(a.orders_count || 0))
    .slice(0, 5), [users]);

  const createUser = async (event) => {
    event.preventDefault();
    setCreating(true);
    try {
      await api.post("/api/admin/users", form);
      toast.success(form.role === "livreur" ? "Livreur ajoute avec succes" : "Utilisateur ajoute avec succes");
      setForm(emptyForm);
      await loadUsers();
    } catch (error) {
      showApiError(error, "Creation utilisateur impossible");
    } finally {
      setCreating(false);
    }
  };

  const updateRole = async (targetUser, role) => {
    if (role === targetUser.role) return;
    setSavingId(targetUser.id);
    try {
      const { data } = await api.put(`/api/admin/users/${targetUser.id}/role`, { role });
      setUsers((current) => current.map((item) => (item.id === targetUser.id ? { ...item, ...data } : item)));
      toast.success("Role mis a jour");
    } catch (error) {
      showApiError(error, "Mise a jour impossible");
    } finally {
      setSavingId(null);
    }
  };

  const deleteUser = async (targetUser) => {
    if (!window.confirm(`Supprimer ${targetUser.name} ? Cette action est definitive.`)) return;
    setDeletingId(targetUser.id);
    try {
      await api.delete(`/api/admin/users/${targetUser.id}`);
      setUsers((current) => current.filter((item) => item.id !== targetUser.id));
      toast.success("Utilisateur supprime");
    } catch (error) {
      showApiError(error, "Suppression impossible");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-black text-gray-950">
            <Users className="text-indigo-600" /> Utilisateurs
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Gere les clients, ajoute les livreurs, protege les admins et garde l'historique commercial propre.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <StatCard label="Total" value={stats.total} />
          <StatCard label="Clients" value={stats.clients} />
          <StatCard label="Livreurs" value={stats.livreurs} />
          <StatCard label="Admins" value={stats.admins} />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[420px_1fr]">
        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2 font-black text-gray-900">
            <UserCog className="text-indigo-600" size={20} /> Ajouter un utilisateur
          </div>
          <form onSubmit={createUser} className="space-y-3">
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-gray-50 p-1">
              {["livreur", "client", "admin"].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setForm((current) => ({ ...current, role }))}
                  className={`rounded-lg px-3 py-2 text-xs font-black ${form.role === role ? "bg-indigo-600 text-white" : "text-gray-500 hover:bg-white"}`}
                >
                  {roleLabels[role]}
                </button>
              ))}
            </div>

            <input required placeholder="Nom complet" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-xl bg-gray-50 p-3 outline-none focus:ring-2 focus:ring-indigo-500" />
            <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-xl bg-gray-50 p-3 outline-none focus:ring-2 focus:ring-indigo-500" />
            <input placeholder="Telephone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full rounded-xl bg-gray-50 p-3 outline-none focus:ring-2 focus:ring-indigo-500" />
            <input placeholder="Adresse (optionnel)" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full rounded-xl bg-gray-50 p-3 outline-none focus:ring-2 focus:ring-indigo-500" />
            <input required type="password" placeholder="Mot de passe initial" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full rounded-xl bg-gray-50 p-3 outline-none focus:ring-2 focus:ring-indigo-500" />

            <button disabled={creating} className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 font-black text-white hover:bg-indigo-700 disabled:bg-gray-300">
              {creating ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
              {form.role === "livreur" ? "Ajouter livreur" : "Ajouter utilisateur"}
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2 font-black text-gray-800">
            <Trophy className="text-amber-500" size={20} /> Clients qui commandent le plus
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {topClients.length ? (
              topClients.map((client, index) => (
                <div key={client.id} className="flex items-center justify-between rounded-xl border border-gray-100 p-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{index + 1}. {client.name}</p>
                    <p className="truncate text-xs text-gray-500">{client.email}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-black text-indigo-600">{Number(client.total_spent || 0).toFixed(2)} DH</p>
                    <p className="text-xs text-gray-400">{client.orders_count || 0} commandes</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400">Aucun client avec commande pour le moment.</p>
            )}
          </div>
        </section>
      </div>

      <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="grid gap-3 border-b border-gray-100 p-4 lg:grid-cols-[1fr_180px]">
          <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-3">
            <Search size={18} className="text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher par nom, email, telephone..." className="min-h-11 w-full bg-transparent text-sm outline-none" />
          </div>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="rounded-xl border border-gray-200 px-3 py-3 text-sm">
            <option value="">Tous les roles</option>
            {Object.entries(roleLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left">
            <thead className="bg-gray-50 text-xs uppercase text-gray-400">
              <tr>
                <th className="p-4">Utilisateur</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Commandes</th>
                <th className="p-4">Total achete</th>
                <th className="p-4">Role</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center">
                    <Loader2 className="mx-auto animate-spin text-indigo-600" />
                  </td>
                </tr>
              ) : filteredUsers.length ? (
                filteredUsers.map((item) => {
                  const isSelf = item.id === currentUser?.id;
                  const hasHistory = Number(item.orders_count || 0) > 0;

                  return (
                    <tr key={item.id} className="hover:bg-gray-50/70">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 font-black text-indigo-600">
                            {item.name?.charAt(0)?.toUpperCase() || "U"}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{item.name}</p>
                            <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${roleBadge[item.role] || "bg-gray-100 text-gray-600"}`}>
                              {roleLabels[item.role] || item.role}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-gray-500">
                        {item.email}
                        <br />
                        <span className="text-xs">{item.phone || "Telephone non renseigne"}</span>
                      </td>
                      <td className="p-4 font-semibold">
                        <span className="inline-flex items-center gap-1"><ShoppingBag size={15} /> {item.orders_count || 0}</span>
                      </td>
                      <td className="p-4 font-bold text-indigo-600">{Number(item.total_spent || 0).toFixed(2)} DH</td>
                      <td className="p-4">
                        <select
                          disabled={savingId === item.id}
                          value={item.role}
                          onChange={(event) => updateRole(item, event.target.value)}
                          className="rounded-lg border bg-white px-3 py-2 disabled:opacity-50"
                        >
                          {Object.entries(roleLabels).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          disabled={isSelf || hasHistory || deletingId === item.id}
                          onClick={() => deleteUser(item)}
                          className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-35"
                          title={isSelf ? "Impossible de supprimer votre propre compte" : hasHistory ? "Historique commande conserve" : "Supprimer"}
                        >
                          {deletingId === item.id ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="p-10 text-center text-gray-400">Aucun utilisateur trouve.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white px-4 py-3 text-center shadow-sm">
      <p className="text-2xl font-black text-gray-950">{value}</p>
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</p>
    </div>
  );
}
