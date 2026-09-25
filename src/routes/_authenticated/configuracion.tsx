import { createFileRoute } from "@tanstack/react-router";
import { Save } from "lucide-react";

export const Route = createFileRoute("/_authenticated/configuracion")({
  head: () => ({ meta: [{ title: "Configuración — SNAKELAB" }] }),
  component: ConfiguracionPage,
});

function ConfiguracionPage() {
  return (
    <div className="p-8 lg:p-12 w-full max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold font-sans">Configuración</h1>
        <button className="flex items-center gap-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-5 py-2.5 rounded-md text-sm font-semibold transition-colors">
          <Save className="w-4 h-4" /> Guardar Cambios
        </button>
      </div>

      <div className="bg-[#050505] border border-white/10 rounded-xl p-6 sm:p-8 max-w-3xl">
        <div className="space-y-6 text-sm">
          
          <div className="space-y-2">
            <label className="text-gray-300 font-medium">Número de WhatsApp (con código de país ej: 573001234567)</label>
            <input type="text" defaultValue="573214403628" className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white outline-none focus:border-[#7c3aed] transition-colors" />
          </div>

          <div className="space-y-2">
            <label className="text-gray-300 font-medium">Título Hero (Inicio)</label>
            <input type="text" defaultValue="IDEAS QUE TOMAN FORMA" className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white outline-none focus:border-[#7c3aed] transition-colors" />
          </div>

          <div className="space-y-2">
            <label className="text-gray-300 font-medium">Subtítulo Hero (Inicio)</label>
            <textarea rows={4} defaultValue="Objetos con carácter, fabricados capa por capa. Diseñamos lo imposible y lo convertimos en algo que puedes tocar." className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white outline-none focus:border-[#7c3aed] transition-colors resize-y" />
          </div>

          <div className="space-y-2">
            <label className="text-gray-300 font-medium">Instagram Link</label>
            <input type="text" defaultValue="https://www.instagram.com/snakelab.site/" className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white outline-none focus:border-[#7c3aed] transition-colors" />
          </div>

          <div className="space-y-2">
            <label className="text-gray-300 font-medium">Contraseña Admin</label>
            <input type="password" placeholder="Dejar en blanco para no cambiar" className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white outline-none focus:border-[#7c3aed] transition-colors" />
          </div>

        </div>
      </div>
    </div>
  );
}
