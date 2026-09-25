import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/clientes")({
  head: () => ({ meta: [{ title: "Clientes — SNAKELAB" }] }),
  component: ClientesPage,
});

function ClientesPage() {
  const clientes = [
    { id: 1, name: "Usuario Prueba Mercado Pago", email: "test_mp_20260908@example.com", phone: "3001234567", city: "Bogota", date: "8/9/2026" },
    { id: 2, name: "Christian", email: "darinru0710@gmail.com", phone: "3214403628", city: "bogota", date: "8/9/2026" },
    { id: 3, name: "Cliente Prueba Mercado Pago", email: "mp-test-snakelab@example.com", phone: "3009998877", city: "Bogota", date: "8/9/2026" },
  ];

  return (
    <div className="p-8 lg:p-12 w-full max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 font-sans">Clientes</h1>

      <div className="w-full bg-[#111] border border-white/5 rounded-xl overflow-hidden overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-black/40 text-gray-400 text-[10px] uppercase tracking-wider font-bold">
              <th className="p-4 border-b border-white/5">NOMBRE</th>
              <th className="p-4 border-b border-white/5">EMAIL</th>
              <th className="p-4 border-b border-white/5">TELÉFONO</th>
              <th className="p-4 border-b border-white/5">CIUDAD</th>
              <th className="p-4 border-b border-white/5">FECHA REG.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm">
            {clientes.map((c) => (
              <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="p-4 font-medium text-white">{c.name}</td>
                <td className="p-4 text-gray-400">{c.email}</td>
                <td className="p-4 text-gray-300">{c.phone}</td>
                <td className="p-4 text-gray-400">{c.city}</td>
                <td className="p-4 text-gray-400">{c.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
