import { useEffect, useState } from "react";
import api from "../Api/axios";
import toast from "react-hot-toast";


export default function AdminOrders() {

  const [orders, setOrders] = useState([]);
  const [livreurs, setLivreurs] = useState([]);

  useEffect(() => {
    fetchOrders();
    fetchLivreurs();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/api/admin/orders");
      setOrders(res.data.data || []);
      console.log(res.data);
    } catch {
      toast.error("Erreur chargement commandes");
    }
  };

  const fetchLivreurs = async () => {
    try {
      const res = await api.get("/api/users?role=livreur");
      setLivreurs(res.data);
    } catch {
      toast.error("Erreur chargement livreurs");
    }
  };

  const assignDelivery = async (orderId, livreurId) => {
    try {
      await api.post("/api/deliveries/assign", {
        order_id: orderId,
        livreur_id: livreurId
      });

      toast.success("Livreur assigné 🚚");
    } catch {
      toast.error("Erreur assignation");
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6">

      <h1 className="text-2xl font-bold mb-6">
        🧑‍💼 Gestion commandes
      </h1>

      <div className="space-y-4">
        {orders.map(order => (
          <div key={order.id} className="bg-white p-4 rounded-xl shadow">

            <div className="flex justify-between items-center">

              <div>
                <p>Commande #{order.id}</p>
                <p className="text-gray-500">{order.total} DH</p>
              </div>

              <div className="flex gap-2">

                <select
                  onChange={(e) =>
                    assignDelivery(order.id, e.target.value)
                  }
                  className="border p-2 rounded"
                >
                  <option>Choisir livreur</option>

                  {livreurs.map(l => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>

              </div>

            </div>
          </div>
        ))}
      </div>

    </div>
  );
}