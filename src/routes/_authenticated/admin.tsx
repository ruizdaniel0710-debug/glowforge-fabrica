import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { listCustomRequests, updateCustomRequest, deleteCustomRequest, REQUEST_STATUSES } from "@/lib/requests.functions";
import { formatPrice } from "@/lib/products";
import { X, Eye, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Dashboard — SNAKELAB" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const listFn = useServerFn(listCustomRequests);
  const updateFn = useServerFn(updateCustomRequest);
  const deleteFn = useServerFn(deleteCustomRequest);
  const qc = useQueryClient();
  
  const list = useQuery({ queryKey: ["custom-requests"], queryFn: () => listFn() });
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const orders = list.data || [];
  const totalOrders = orders.length;
  const uniqueClients = new Set(orders.map(o => o.email)).size;
  const totalSales = orders.reduce((sum, o) => sum + (o.quote_amount || 0), 0);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    await updateFn({ data: { id, status: newStatus as any } });
    qc.invalidateQueries({ queryKey: ["custom-requests"] });
  };

  const handleDeleteOrder = async (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta solicitud? Esta acción no se puede deshacer.")) {
      await deleteFn({ data: { id } });
      qc.invalidateQueries({ queryKey: ["custom-requests"] });
    }
  };

  return (
    <div className="p-8 lg:p-12 w-full max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 font-sans">Dashboard</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard title="Ventas Totales" value={formatPrice(totalSales)} />
        <StatCard title="Pedidos" value={totalOrders.toString()} />
        <StatCard title="Productos" value="0" />
        <StatCard title="Clientes" value={uniqueClients.toString()} />
      </div>

      <h2 className="text-xl font-bold mb-4">Últimos Pedidos</h2>
      
      <div className="w-full bg-[#111] border border-white/5 rounded-xl overflow-hidden overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-black/40 text-gray-500 text-xs uppercase tracking-wider">
              <th className="p-4 font-semibold border-b border-white/5">ID</th>
              <th className="p-4 font-semibold border-b border-white/5">Cliente</th>
              <th className="p-4 font-semibold border-b border-white/5">Total</th>
              <th className="p-4 font-semibold border-b border-white/5">Estado</th>
              <th className="p-4 font-semibold border-b border-white/5">Fecha</th>
              <th className="p-4 font-semibold border-b border-white/5 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">
                  {list.isLoading ? "Cargando..." : "No hay pedidos todavía."}
                </td>
              </tr>
            ) : (
              orders.map(o => (
                <tr key={o.id} className="hover:bg-white/[0.02] transition-colors group cursor-pointer" onClick={() => setSelectedOrder(o)}>
                  <td className="p-4 text-sm font-mono text-primary group-hover:underline">{o.code}</td>
                  <td className="p-4">
                    <p className="text-sm font-medium text-white">{o.customer_name}</p>
                    <p className="text-xs text-gray-500">{o.email}</p>
                  </td>
                  <td className="p-4 text-sm font-mono text-gray-300">
                    {o.quote_amount ? formatPrice(o.quote_amount) : "—"}
                  </td>
                  <td className="p-4" onClick={(e) => e.stopPropagation()}>
                    <select 
                      className="bg-transparent border border-white/10 rounded px-2 py-1 text-xs outline-none focus:border-primary"
                      value={o.status}
                      onChange={(e) => handleUpdateStatus(o.id, e.target.value)}
                    >
                      {REQUEST_STATUSES.map(s => <option key={s} value={s} className="bg-[#111]">{s}</option>)}
                    </select>
                  </td>
                  <td className="p-4 text-sm text-gray-400">
                    {new Date(o.created_at).toLocaleDateString("es-CO")}
                  </td>
                  <td className="p-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => setSelectedOrder(o)}
                        className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteOrder(o.id)}
                        className="text-gray-400 hover:text-red-400 transition-colors p-2 hover:bg-white/5 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <OrderModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </div>
  );
}

function OrderModal({ order, onClose }: { order: any, onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in" onClick={onClose}>
      <div className="bg-[#111] border border-white/10 w-full max-w-2xl rounded-xl shadow-2xl flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold font-sans">Pedido {order.code}</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/5 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-sm font-bold text-primary mb-3 uppercase tracking-wider">Cliente</h3>
              <p className="text-white">{order.customer_name}</p>
              <p className="text-gray-400 text-sm">{order.email}</p>
              {order.shipping_info && (
                <div className="mt-4">
                  <h4 className="text-xs font-bold text-gray-500 uppercase">Envío y Contacto</h4>
                  <p className="text-gray-300 text-sm mt-1">{JSON.parse(order.shipping_info).phone}</p>
                  <p className="text-gray-300 text-sm">{JSON.parse(order.shipping_info).address}</p>
                  <p className="text-gray-300 text-sm">{JSON.parse(order.shipping_info).city}, {JSON.parse(order.shipping_info).department}</p>
                  <p className="text-gray-300 text-sm mt-1 uppercase font-semibold">Pago: {JSON.parse(order.shipping_info).paymentMethod}</p>
                </div>
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold text-primary mb-3 uppercase tracking-wider">Detalles</h3>
              <p className="text-gray-400 text-sm"><strong>Fecha:</strong> {new Date(order.created_at).toLocaleString()}</p>
              <p className="text-gray-400 text-sm"><strong>Estado:</strong> <StatusBadge status={order.status} /></p>
            </div>
          </div>
          
          <h3 className="text-sm font-bold text-primary mb-3 uppercase tracking-wider">Archivos Adjuntos</h3>
          {order.files && order.files.length > 0 ? (
            <ul className="space-y-2 mb-8">
              {order.files.map((f: any, i: number) => (
                <li key={i} className="text-sm text-gray-300">
                  {f.path || f.url ? <a href={f.path || f.url} target="_blank" rel="noreferrer" className="text-primary hover:underline">{f.name}</a> : f.name}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 mb-8">No hay archivos adjuntos.</p>
          )}

          {order.notes && (
            <div className="bg-white/5 p-4 rounded-lg border border-white/10 mb-8">
              <h3 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Notas del cliente</h3>
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{order.notes}</p>
            </div>
          )}

          <div className="flex justify-between items-center text-lg font-bold border-t border-white/10 pt-6">
            <span>Cotización Total:</span>
            <span className="text-primary">{order.quote_amount ? formatPrice(order.quote_amount) : "No cotizado"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string, value: string }) {
  return (
    <div className="bg-[#111] border border-white/5 rounded-xl p-6 flex flex-col gap-2">
      <span className="text-sm text-gray-400 font-medium">{title}</span>
      <span className="text-3xl font-bold text-primary tracking-tight">{value}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { bg: string, text: string }> = {
    "recibida": { bg: "bg-amber-500/20", text: "text-amber-500" },
    "en revisión": { bg: "bg-blue-500/20", text: "text-blue-400" },
    "cotizada": { bg: "bg-purple-500/20", text: "text-purple-400" },
    "aprobada": { bg: "bg-emerald-500/20", text: "text-emerald-400" },
    "en impresión": { bg: "bg-violet-500/20", text: "text-violet-400" },
    "enviada": { bg: "bg-sky-500/20", text: "text-sky-400" },
    "cancelada": { bg: "bg-red-500/20", text: "text-red-500" },
  };
  const config = statusConfig[status] || { bg: "bg-gray-500/20", text: "text-gray-400" };
  return (
    <span className={`px-2.5 py-1 text-xs font-bold uppercase rounded-full tracking-wider ${config.bg} ${config.text}`}>
      {status}
    </span>
  );
}
