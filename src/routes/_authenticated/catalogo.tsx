import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { formatPrice } from "@/lib/products";
import { Plus, Edit, Trash2, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { listProducts, deleteProduct, createProduct, updateProduct, uploadImage } from "@/lib/catalog.functions";
import { useServerFn } from "@tanstack/react-start";
import { useRouter } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/catalogo")({
  loader: () => listProducts(),
  component: CatalogoAdminPage,
});

function CatalogoAdminPage() {
  const router = useRouter();
  const initialProducts = Route.useLoaderData();
  const delProd = useServerFn(deleteProduct);
  const addProd = useServerFn(createProduct);
  const updProd = useServerFn(updateProduct);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("¿Eliminar producto permanentemente?")) {
      await delProd({ data: { id } });
      router.invalidate();
    }
  };

  const handleNew = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleSave = async (formData: FormData) => {
    const data = {
      name: formData.get("name") as string,
      slug: (formData.get("name") as string).toLowerCase().replace(/ /g, '-'),
      category_id: parseInt(formData.get("category_id") as string) || null,
      price: parseInt(formData.get("price") as string) || 0,
      stock: parseInt(formData.get("stock") as string) || 0,
      description: formData.get("description") as string,
    };
    
    if (editingProduct) {
      await updProd({ data: { id: editingProduct.id, ...data } });
    } else {
      await addProd({ data });
    }
    
    setIsModalOpen(false);
    router.invalidate();
  };

  return (
    <div className="p-8 lg:p-12 w-full max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold font-sans">Productos</h1>
        <button 
          onClick={handleNew}
          className="flex items-center gap-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-4 py-2 rounded-md text-sm font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" /> Nuevo Producto
        </button>
      </div>

      <div className="w-full bg-[#111] border border-white/5 rounded-xl overflow-hidden overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-black/40 text-gray-400 text-[10px] uppercase tracking-wider font-bold">
              <th className="p-4 border-b border-white/5">IMG</th>
              <th className="p-4 border-b border-white/5">NOMBRE</th>
              <th className="p-4 border-b border-white/5">CATEGORÍA</th>
              <th className="p-4 border-b border-white/5">PRECIO</th>
              <th className="p-4 border-b border-white/5">STOCK</th>
              <th className="p-4 border-b border-white/5">ACCIONES</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm">
            {initialProducts.map((p: any) => (
              <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="p-4">
                  {p.images && p.images[0] ? (
                    <img src={p.images[0]} alt={p.name} className="w-12 h-12 object-cover rounded-md border border-white/10 bg-[#1a1a1a]" />
                  ) : (
                    <div className="w-12 h-12 rounded-md border border-white/10 bg-[#1a1a1a] flex items-center justify-center text-gray-500">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                  )}
                </td>
                <td className="p-4 font-medium text-white">{p.name}</td>
                <td className="p-4 text-gray-300">{p.category || "Tendencia"}</td>
                <td className="p-4 text-gray-300">{formatPrice(p.price)}</td>
                <td className="p-4 text-gray-300">{p.stock || 0}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleEdit(p)} className="p-2 border border-white/10 rounded-md text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="p-2 border border-white/10 rounded-md text-gray-400 hover:text-red-400 hover:bg-white/5 transition-colors">
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
        <ProductModal product={editingProduct} onClose={() => setIsModalOpen(false)} onSave={handleSave} />
      )}
    </div>
  );
}

function ProductModal({ product, onClose, onSave }: { product: any, onClose: () => void, onSave: (data: FormData) => void }) {
  const [images, setImages] = useState<string[]>(product?.images || []);
  const [isUploading, setIsUploading] = useState(false);
  const uploadFn = useServerFn(uploadImage);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isCover: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await uploadFn({ data: formData as any });
      
      if (res.url) {
        if (isCover) {
          setImages([res.url, ...images.filter(img => img !== res.url)]);
        } else {
          setImages([...images, res.url]);
        }
      }
    } catch (err) {
      alert("Error subiendo la imagen");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSetCover = (index: number) => {
    const newImages = [...images];
    const [cover] = newImages.splice(index, 1);
    newImages.unshift(cover);
    setImages(newImages);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("images", JSON.stringify(images));
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <form onSubmit={handleSubmit} className="bg-[#050505] border border-white/10 w-full max-w-4xl rounded-xl shadow-2xl flex flex-col my-auto max-h-[95vh] relative" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-white/10 bg-[#050505]/95 backdrop-blur rounded-t-xl">
          <h2 className="text-2xl font-bold font-sans tracking-tight">{product ? "Editar Producto" : "Nuevo Producto"}</h2>
          <button type="button" onClick={onClose} className="p-2 text-gray-400 border border-white/10 rounded-md hover:text-white hover:bg-white/5 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-gray-300 font-medium">Nombre *</label>
              <input required name="name" type="text" defaultValue={product?.name} className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white outline-none focus:border-primary" />
            </div>
            <div className="space-y-2">
              <label className="text-gray-300 font-medium">Categoría *</label>
              <select name="category_id" defaultValue={product?.category_id || 1} className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white outline-none focus:border-primary appearance-none">
                <option value="1">Figuras Gaming</option>
                <option value="2">Anime</option>
                <option value="3">Soportes para Controles</option>
                <option value="4">Decoración</option>
                <option value="5">Personalizados</option>
                <option value="6">Tendencia</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-gray-300 font-medium">Descripción</label>
            <textarea name="description" rows={4} defaultValue={product?.description} className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white outline-none focus:border-primary resize-y" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-gray-300 font-medium">Precio (COP) *</label>
              <input required name="price" type="number" defaultValue={product?.price} className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white outline-none focus:border-primary" />
            </div>
            <div className="space-y-2">
              <label className="text-gray-300 font-medium">Precio Anterior (Tachado)</label>
              <input name="compare_price" type="number" defaultValue={product?.compare_price || ""} className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white outline-none focus:border-primary" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-gray-300 font-medium">Tamaños (JSON Array) ej: ["10cm","15cm"]</label>
              <input type="text" defaultValue={'["Estándar"]'} className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white font-mono text-xs outline-none focus:border-primary" />
            </div>
            <div className="space-y-2">
              <label className="text-gray-300 font-medium">Materiales (JSON Array) ej: ["PLA"]</label>
              <input type="text" defaultValue={'["PLA"]'} className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white font-mono text-xs outline-none focus:border-primary" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-gray-300 font-medium">Precio según el tamaño</label>
            <div className="flex gap-4 items-center bg-[#111] border border-white/10 rounded-lg p-3">
              <span className="flex-1 text-white">Estándar</span>
              <input type="number" placeholder="Precio base" className="flex-1 bg-transparent border border-white/10 rounded p-2 text-white outline-none focus:border-primary" />
            </div>
            <p className="text-xs text-gray-500">Escribe el precio de cada tamaño. Si lo dejas vacío, se usará el precio base.</p>
          </div>

          <div className="bg-[#111] border border-white/10 rounded-lg p-4 flex items-center gap-3">
            <input type="checkbox" id="show3d" defaultChecked className="w-4 h-4 accent-primary" />
            <label htmlFor="show3d" className="text-white font-medium select-none cursor-pointer">Mostrar visor 3D en este producto</label>
          </div>

          <div className="space-y-3">
            <label className="text-gray-300 font-medium">Referencias o variantes</label>
            <div className="flex gap-4 items-center">
              <button className="bg-[#111] border border-white/10 text-white px-4 py-2 rounded-md hover:bg-white/5 transition-colors font-medium">
                Agregar referencia
              </button>
              <span className="text-xs text-gray-500 leading-tight">Cada referencia puede tener nombre, precio, descripción e imagen. Puedes subir una imagen directamente o usar una URL.</span>
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-white/10">
            <label className="text-gray-300 font-medium">Colores</label>
            <div className="flex gap-3">
              <input type="text" defaultValue="#e53935" className="flex-1 bg-[#111] border border-white/10 rounded-lg p-3 text-white font-mono outline-none focus:border-primary" />
              <button className="bg-[#111] border border-white/10 text-white px-4 py-2 rounded-md hover:bg-white/5 transition-colors font-medium">
                Agregar color
              </button>
            </div>
            <div className="flex gap-2 pt-2 flex-wrap">
              {/* Preset colors */}
              {['#000000', '#ffffff', '#f5f5f5', '#6b7280', '#d62828', '#ef4444', '#ff8a00', '#f5c542', '#22c55e', '#3ecf91', '#00b8ff', '#2563eb', '#4f46e5', '#8b5cf6', '#c56eff', '#d9a441', '#8b5e3c', '#1a1a2e'].map((c, i) => (
                <div key={i} className={`w-6 h-6 rounded-full cursor-pointer border ${i===4 ? 'border-primary shadow-[0_0_0_2px_rgba(0,255,136,0.2)]' : 'border-white/20'}`} style={{ backgroundColor: c }} />
              ))}
            </div>
            <p className="text-xs text-gray-500">Elige una paleta o escribe un HEX manualmente.</p>
          </div>

          <div className="space-y-2">
            <label className="text-gray-300 font-medium">Dimensiones del modelo (JSON)</label>
            <input type="text" defaultValue='{}' className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white font-mono text-xs outline-none focus:border-primary" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-gray-300 font-medium">Partes personalizables (JSON)</label>
              <input type="text" defaultValue='[]' className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white font-mono text-xs outline-none focus:border-primary" />
            </div>
            <div className="space-y-2">
              <label className="text-gray-300 font-medium">Partes fijas (JSON)</label>
              <input type="text" defaultValue='[]' className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white font-mono text-xs outline-none focus:border-primary" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-gray-300 font-medium">Días de Producción</label>
              <input name="production_days" type="number" defaultValue={product?.production_days || 4} className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white outline-none focus:border-primary" />
            </div>
            <div className="space-y-2">
              <label className="text-gray-300 font-medium">Stock</label>
              <input name="stock" type="number" defaultValue={product?.stock || 50} className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white outline-none focus:border-primary" />
            </div>
          </div>

          <div className="bg-[#111] border border-white/10 rounded-lg p-4 flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 accent-primary" />
              <span className="text-white font-medium">Destacado en Inicio</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 accent-primary" />
              <span className="text-white font-medium">En Tendencia</span>
            </label>
          </div>

          <div className="space-y-2 pt-4 border-t border-white/10">
            <label className="text-gray-300 font-medium">Portada del producto</label>
            <div className="flex bg-[#111] border border-white/10 rounded-lg overflow-hidden relative">
              <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, true)} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" disabled={isUploading} />
              <button type="button" className="bg-white/5 border-r border-white/10 px-4 py-3 text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Seleccionar archivo'}
              </button>
              <span className="px-4 py-3 text-gray-500">Haz clic para subir la portada</span>
            </div>
            <p className="text-xs text-gray-500">Se usará como imagen principal del producto.</p>
          </div>

          <div className="space-y-2">
            <label className="text-gray-300 font-medium">Más imágenes del producto</label>
            <div className="flex bg-[#111] border border-white/10 rounded-lg overflow-hidden relative">
              <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, false)} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" disabled={isUploading} />
              <button type="button" className="bg-white/5 border-r border-white/10 px-4 py-3 text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Elegir archivos'}
              </button>
              <span className="px-4 py-3 text-gray-500">Haz clic para subir a la galería</span>
            </div>
            <p className="text-xs text-gray-500">Se agregarán a la galería, sin reemplazar la portada.</p>
          </div>

          {images.length > 0 && (
            <div className="space-y-2">
              <label className="text-gray-300 font-medium">Imágenes actuales</label>
              <div className="flex gap-3 flex-wrap">
                {images.map((img: string, i: number) => (
                  <div key={i} className={`relative w-24 h-24 rounded-lg overflow-hidden border-2 ${i === 0 ? 'border-primary' : 'border-white/10'}`}>
                    <img src={img} className="w-full h-full object-cover bg-white" />
                    {i === 0 ? (
                      <span className="absolute top-1 left-1 bg-black/80 text-white text-[10px] px-2 py-0.5 rounded-full">Portada</span>
                    ) : (
                      <button type="button" onClick={() => handleSetCover(i)} className="absolute bottom-1 left-1 right-1 bg-black/80 text-white text-[10px] py-1 rounded hover:bg-black transition-colors">Usar portada</button>
                    )}
                    <button type="button" onClick={() => handleRemoveImage(i)} className="absolute top-1 right-1 bg-red-500 text-white w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold leading-none hover:bg-red-600 transition-colors">×</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3 pt-4 border-t border-white/10">
            <label className="text-gray-300 font-medium">Modelo 3D para web (.glb o .gltf)</label>
            {[1, 2, 3].map(num => (
              <div key={num} className="flex bg-[#111] border border-white/10 rounded-lg overflow-hidden">
                <span className="bg-white/5 border-r border-white/10 px-4 py-3 text-white font-medium w-24">Modelo {num}</span>
                <button className="bg-white/5 border-r border-white/10 px-4 py-3 text-gray-300 hover:text-white transition-colors">Seleccionar archivo</button>
                <span className="px-4 py-3 text-gray-500">Ningún archivo seleccionado</span>
              </div>
            ))}
            <p className="text-xs text-gray-500">Sube hasta 3 modelos en campos separados. El cliente podrá cambiar entre ellos desde el visor. Límite: 250 MB por archivo.</p>
          </div>

        </div>

        {/* Footer */}
        <div className="sticky bottom-0 z-10 flex items-center justify-start gap-4 p-6 border-t border-white/10 bg-[#050505]/95 backdrop-blur rounded-b-xl">
          <button type="button" onClick={onClose} className="px-6 py-2.5 border border-white/10 rounded-lg font-medium text-white hover:bg-white/5 transition-colors">
            Cancelar
          </button>
          <button type="submit" className="px-6 py-2.5 bg-[#7c3aed] hover:bg-[#6d28d9] rounded-lg font-medium text-white transition-colors shadow-lg">
            Guardar Producto
          </button>
        </div>

      </form>
    </div>
  );
}
