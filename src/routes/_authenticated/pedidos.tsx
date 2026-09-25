import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { listOrders, updateOrderStatus, deleteOrder } from "@/lib/orders.functions";
import { formatPrice } from "@/lib/products";
import { X, Eye, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/pedidos")({
  head: () => ({
    meta: [
      { title: "Pedidos — SNAKELAB" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PedidosPage,
});

function PedidosPage() {
  const listFn = useServerFn(listOrders);
  const updateFn = useServerFn(updateOrderStatus);
  const deleteFn = useServerFn(deleteOrder);
  const qc = useQueryClient();
  
  const list = useQuery({ queryKey: ["store-orders"], queryFn: () => listFn() });
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const orders = list.data || [];

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      await updateFn({ data: { id, status: newStatus } });
      qc.invalidateQueries({ queryKey: ["store-orders"] });
    } catch (e) {
      alert("Error actualizando pedido");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("¿Estás seguro de que deseas eliminar este pedido permanentemente?")) {
      try {
        await deleteFn({ data: { id } });
        qc.invalidateQueries({ queryKey: ["store-orders"] });
        if (selectedOrder?.id === id) setSelectedOrder(null);
      } catch (e) {
        alert("Error eliminando pedido");
      }
    }
  };

  return (
    <div className="p-8 lg:p-12 w-full max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 font-sans">Pedidos</h1>
      
      <div className="w-full bg-[#111] border border-white/5 rounded-xl overflow-hidden overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-black/40 text-gray-400 text-[10px] uppercase tracking-wider font-bold">
              <th className="p-4 border-b border-white/5">ID</th>
              <th className="p-4 border-b border-white/5">CLIENTE</th>
              <th className="p-4 border-b border-white/5">TOTAL</th>
              <th className="p-4 border-b border-white/5">MÉTODO</th>
              <th className="p-4 border-b border-white/5">ESTADO</th>
              <th className="p-4 border-b border-white/5">FECHA</th>
              <th className="p-4 border-b border-white/5 text-right">ACCIONES</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-500">
                  {list.isLoading ? "Cargando..." : "No hay pedidos todavía."}
                </td>
              </tr>
            ) : (
              orders.map(o => {
                const customer = JSON.parse(o.customer_snapshot || '{}');
                return (
                  <tr key={o.id} className="hover:bg-white/[0.02] transition-colors group cursor-pointer" onClick={() => setSelectedOrder(o)}>
                    <td className="p-4 font-mono text-[#e53935] group-hover:underline">{o.idempotency_key || o.id}</td>
                    <td className="p-4 text-white font-medium">{customer.name || 'Desconocido'}</td>
                    <td className="p-4 text-gray-300">
                      {o.total ? formatPrice(o.total) : "—"}
                    </td>
                    <td className="p-4 text-gray-400 capitalize">{o.payment_method || o.payment_provider || 'N/A'}</td>
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <select 
                        className="bg-transparent border border-white/10 rounded px-2 py-1 text-xs outline-none focus:border-[#e53935] text-gray-300"
                        value={o.status}
                        onChange={(e) => handleUpdateStatus(o.id, e.target.value)}
                      >
                        {["pendiente", "en revisión", "imprimiendo", "enviado", "cancelado"].map(s => <option key={s} value={s} className="bg-[#111]">{s}</option>)}
                      </select>
                    </td>
                    <td className="p-4 text-gray-400">
                      {new Date(o.created_at).toLocaleDateString("es-CO")}
                    </td>
                    <td className="p-4 text-right flex items-center justify-end gap-2">
                      <button className="p-2 border border-white/10 rounded-md text-gray-400 hover:text-white hover:bg-white/5 transition-colors" title="Ver Detalles">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        className="p-2 border border-white/10 rounded-md text-red-400 hover:text-red-500 hover:bg-red-500/10 transition-colors" 
                        title="Eliminar Pedido"
                        onClick={(e) => { e.stopPropagation(); handleDelete(o.id); }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
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

// ... OrderModal
function OrderModal({ order, onClose }: { order: any, onClose: () => void }) {
  const customer = JSON.parse(order.customer_snapshot || '{}');
  const shipping = JSON.parse(order.shipping_snapshot || '{}');
  const items = JSON.parse(order.items || '[]');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in" onClick={onClose}>
      <div className="bg-[#050505] border border-white/10 w-full max-w-2xl rounded-xl shadow-2xl flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold font-sans">Pedido {order.idempotency_key}</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-md hover:bg-white/5 transition-colors border border-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Cliente</h3>
              <p className="text-white font-medium">{customer.name}</p>
              <p className="text-gray-400 text-sm">{customer.email}</p>
              <p className="text-gray-400 text-sm">{customer.phone}</p>
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Envío</h3>
              <p className="text-white text-sm">{shipping.address}</p>
              <p className="text-gray-400 text-sm">{shipping.city}, {shipping.department}</p>
              <p className="text-gray-400 text-sm flex items-center gap-2 mt-2"><strong>Estado:</strong> <span className="uppercase text-[10px] font-bold text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-full">{order.status}</span></p>
            </div>
          </div>
          
          <h3 className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Productos</h3>
          <div className="bg-[#111] border border-white/10 rounded-lg p-4 mb-8">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/10 text-gray-500">
                <tr>
                  <th className="pb-2 font-medium">Producto</th>
                  <th className="pb-2 font-medium text-center">Cant.</th>
                  <th className="pb-2 font-medium text-right">Precio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {items.map((item: any, i: number) => (
                  <tr key={i}>
                    <td className="py-3 text-gray-300">{item.name}</td>
                    <td className="py-3 text-gray-400 text-center">{item.quantity}</td>
                    <td className="py-3 text-gray-300 text-right">{formatPrice(item.price * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center text-lg font-bold border-t border-white/10 pt-6">
            <span className="flex flex-col">
              Total pagado <span className="text-xs text-gray-500 uppercase tracking-wider font-normal">Vía {order.payment_method}</span>
            </span>
            <span className="text-[#e53935] text-2xl">{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
