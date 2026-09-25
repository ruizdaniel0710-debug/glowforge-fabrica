import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2, Edit, X, ImageIcon } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/categorias")({
  head: () => ({ meta: [{ title: "Categorías — SNAKELAB" }] }),
  component: CategoriasPage,
});

function CategoriasPage() {
  const [categories, setCategories] = useState([
    { id: 1, name: "Figuras Gaming", slug: "figuras-gaming", order: 1, icon: "" },
    { id: 2, name: "Anime", slug: "anime", order: 2, icon: "" },
    { id: 3, name: "Soportes para Controles", slug: "soportes-controles", order: 3, icon: "" },
    { id: 4, name: "Decoración", slug: "decoracion", order: 4, icon: "" },
    { id: 5, name: "Personalizados", slug: "personalizados", order: 5, icon: "" },
    { id: 6, name: "Tendencia", slug: "tendencia", order: 6, icon: "" },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleNew = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("¿Seguro que deseas eliminar esta categoría?")) {
      setCategories(categories.filter(c => c.id !== id));
    }
  };

  return (
    <div className="p-8 lg:p-12 w-full max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold font-sans">Categorías</h1>
        <button onClick={handleNew} className="flex items-center gap-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-4 py-2 rounded-md text-sm font-semibold transition-colors">
          <Plus className="w-4 h-4" /> Nueva Categoría
        </button>
      </div>

      <div className="w-full bg-[#111] border border-white/5 rounded-xl overflow-hidden overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-black/40 text-gray-400 text-[10px] uppercase tracking-wider font-bold">
              <th className="p-4 border-b border-white/5 w-24">ICONO</th>
              <th className="p-4 border-b border-white/5">NOMBRE</th>
              <th className="p-4 border-b border-white/5">SLUG</th>
              <th className="p-4 border-b border-white/5 w-24">ORDEN</th>
              <th className="p-4 border-b border-white/5 text-right w-28">ACCIONES</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm">
            {categories.map((c) => (
              <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="p-4">
                  {c.icon ? (
                    <img src={c.icon} className="w-8 h-8 rounded object-cover bg-white/5" />
                  ) : (
                    <div className="w-8 h-8 rounded border border-white/10 bg-[#1a1a1a] flex items-center justify-center text-gray-500">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                  )}
                </td>
                <td className="p-4 font-medium text-white">{c.name}</td>
                <td className="p-4 text-gray-400">{c.slug}</td>
                <td className="p-4 text-gray-300">{c.order}</td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => handleEdit(c)} className="p-2 border border-white/10 rounded-md text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(c.id)} className="p-2 border border-white/10 rounded-md text-gray-400 hover:text-red-400 hover:bg-white/5 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <CategoryModal category={editingCategory} onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
}

function CategoryModal({ category, onClose }: { category: any, onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#050505] border border-white/10 w-full max-w-lg rounded-xl shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold font-sans tracking-tight">{category ? "Editar Categoría" : "Nueva Categoría"}</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-md hover:bg-white/5 transition-colors border border-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          <div className="space-y-2">
            <label className="text-gray-300 font-medium">Nombre de la Categoría *</label>
            <input type="text" defaultValue={category?.name} className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white outline-none focus:border-[#7c3aed]" />
          </div>
          
          <div className="space-y-2">
            <label className="text-gray-300 font-medium">Slug (URL)</label>
            <input type="text" defaultValue={category?.slug} className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white outline-none focus:border-[#7c3aed]" />
            <p className="text-xs text-gray-500">Identificador único para la URL. Por defecto se autogenera si se deja vacío.</p>
          </div>

          <div className="space-y-2">
            <label className="text-gray-300 font-medium">Orden de aparición</label>
            <input type="number" defaultValue={category?.order || 1} className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white outline-none focus:border-[#7c3aed]" />
          </div>

          <div className="space-y-2">
            <label className="text-gray-300 font-medium">Icono / Portada</label>
            <div className="flex bg-[#111] border border-white/10 rounded-lg overflow-hidden">
              <button className="bg-white/5 border-r border-white/10 px-4 py-3 text-gray-300 hover:text-white transition-colors">Seleccionar archivo</button>
              <span className="px-4 py-3 text-gray-500 truncate">{category?.icon ? category.icon : "Ningún archivo seleccionado"}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 p-6 border-t border-white/10">
          <button onClick={onClose} className="px-6 py-2.5 border border-white/10 rounded-lg font-medium text-white hover:bg-white/5 transition-colors">
            Cancelar
          </button>
          <button onClick={onClose} className="px-6 py-2.5 bg-[#7c3aed] hover:bg-[#6d28d9] rounded-lg font-medium text-white transition-colors">
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
