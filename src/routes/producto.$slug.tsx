import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Check, ChevronLeft, ChevronRight, Minus, Plus, ShoppingBag, Truck, Shield, Clock, X, UploadCloud, FileUp, Trash2 } from "lucide-react";
import { useState, useRef } from "react";
import AccordionGallery from "@/components/AccordionGallery";
import { useCart } from "@/components/cart-context";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/products";
import { getProduct } from "@/lib/catalog.functions";
import { useServerFn } from "@tanstack/react-start";
import { uploadRequestFile } from "@/lib/requests.functions";

export const Route = createFileRoute("/producto/$slug")({
  loader: async ({ params }) => {
    const product = await getProduct({ data: { slug: params.slug } });
    if (!product) throw notFound();
    return product;
  },
  head: ({ loaderData }) => {
    const title = loaderData ? `${loaderData.name} — SNAKELAB` : "Producto no encontrado — SNAKELAB";
    const description = loaderData?.description ?? "Este producto no está disponible.";
    return { meta: [
      { title }, { name: "description", content: description },
      { property: "og:title", content: title }, { property: "og:description", content: description },
      { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
      ...(loaderData?.image ? [{ property: "og:image", content: loaderData.image }, { name: "twitter:image", content: loaderData.image }] : []),
    ] };
  },
  component: ProductPage,
});

function ProductPage() {
  const product = Route.useLoaderData();
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string | null>(product.colors?.[0] || null);
  const [selectedSize, setSelectedSize] = useState<string | null>(product.sizes?.[0] || null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const { addItem } = useCart();
  
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadFn = useServerFn(uploadRequestFile);
  const [externalLink, setExternalLink] = useState("");

  const [activeVariant, setActiveVariant] = useState<any>(null);

  const mergeFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const list = Array.from(incoming);
    const tooBig = list.find((file) => file.size > 25 * 1024 * 1024);
    if (tooBig) {
      setError(`"${tooBig.name}" supera los 25 MB.`);
      return;
    }
    setError(null);
    setFiles((current) => {
      const next = [...current];
      for (const file of list) {
        if (next.length >= 3) break;
        if (!next.some((item) => item.name === file.name && item.size === file.size)) next.push(file);
      }
      return next;
    });
  };

  const handleAddToCart = async () => {
    setIsUploading(true);
    setError(null);
    try {
      const uploaded = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await uploadFn({ data: formData as any });
        uploaded.push({ name: file.name, path: res.path, size: file.size });
      }
      
      addItem(product, quantity, {
        color: selectedColor,
        size: selectedSize,
        files: uploaded.length > 0 ? uploaded : undefined,
        externalLink: externalLink.trim() !== "" ? externalLink.trim() : undefined
      });
      setFiles([]);
    } catch (e) {
      console.error(e);
      setError("Error al subir los archivos. Inténtalo de nuevo.");
    } finally {
      setIsUploading(false);
    }
  };

  const images = product.images || [product.image];
  const allImages = [...images];
  if (product.variants && product.variants.length > 0) {
    for (const v of product.variants) {
      if (v.image && !allImages.includes(v.image)) {
        allImages.push(v.image);
      }
    }
  }

  const galleryItems = allImages.map((img, i) => {
    // Find if this image belongs to a variant
    const variant = product.variants?.find((v: any) => v.image === img);
    return {
      image: img,
      label: variant ? variant.name : (i === 0 ? product.name : `Vista ${i + 1}`),
    };
  });

  const handleHoverGallery = (index: number) => {
    const img = allImages[index];
    const variant = product.variants?.find((v: any) => v.image === img);
    if (variant) {
      setActiveVariant(variant);
    } else {
      setActiveVariant(null); // default
    }
  };

  const handleLeaveGallery = () => {
    setActiveVariant(null);
  };

  const discount = product.comparePrice 
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100) 
    : 0;

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const nextImage = () => setLightboxIndex((i) => (i + 1) % images.length);
  const prevImage = () => setLightboxIndex((i) => (i - 1 + images.length) % images.length);

  return (
    <main className="min-h-screen pt-18">
      <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        <Button variant="ghost" asChild><Link to="/" hash="productos"><ArrowLeft /> Volver al catálogo</Link></Button>
        
        <div className="mt-6 grid overflow-hidden rounded-lg border border-border bg-card lg:grid-cols-2">
          
          {/* ======== LEFT: Accordion Gallery ======== */}
          <div className="relative flex flex-col gap-4 overflow-hidden border-b border-border p-5 sm:p-8 lg:border-b-0 lg:border-r">
            {/* Category + Discount Badge */}
            <div className="flex items-center gap-2">
              <span className="border border-border bg-background/80 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] backdrop-blur">{product.category}</span>
              {discount > 0 && (
                <span className="bg-primary/10 text-primary px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider">-{discount}%</span>
              )}
            </div>

            {/* Accordion Gallery - only this product's images */}
            <div className="relative cursor-zoom-in overflow-hidden rounded-xl bg-card/50">
              <AccordionGallery
                items={galleryItems}
                defaultIndex={0}
                accentColor="#ef2b32"
                overlayColor="#0a0713"
                height={560}
                radius={6}
                trigger="hover"
                className="flex-1"
                onItemClick={openLightbox}
                onItemHover={handleHoverGallery}
                onItemLeave={handleLeaveGallery}
              />
            </div>

            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Pasa el cursor para explorar las vistas — clic para ampliar
            </p>
          </div>

          {/* ======== RIGHT: Product Info ======== */}
          <div className="flex flex-col p-6 sm:p-10 lg:p-14">
            <p className="eyebrow">Objeto / {product.slug}</p>
            <h1 className="mt-4 font-display text-4xl font-bold uppercase leading-none sm:text-5xl lg:text-6xl">
              {activeVariant ? activeVariant.name : product.name}
            </h1>
            
            {/* Price */}
            <div className="mt-5 flex items-baseline gap-3 flex-wrap">
              <span className="text-3xl font-bold text-primary">
                {formatPrice(activeVariant && activeVariant.price > 0 ? activeVariant.price : product.price)}
              </span>
              {(product.comparePrice || 0) > 0 && !activeVariant && (
                <span className="text-lg text-muted-foreground line-through">{formatPrice(product.comparePrice!)}</span>
              )}
              {discount > 0 && !activeVariant && (
                <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">Ahorras {formatPrice(product.comparePrice! - product.price)}</span>
              )}
            </div>
            
            <p className="mt-6 max-w-xl text-sm leading-7 text-muted-foreground">
              {activeVariant && activeVariant.description ? activeVariant.description : product.description}
            </p>

            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
              <div className="mt-8">
                <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Color</p>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`size-8 rounded-full border-2 transition-all ${
                        selectedColor === color 
                          ? "border-primary scale-110 shadow-[0_0_0_2px_rgba(239,43,50,0.3)]" 
                          : "border-transparent hover:scale-105"
                      }`}
                      style={{ backgroundColor: color, boxShadow: color === '#ffffff' ? 'inset 0 0 0 1px rgba(255,255,255,0.3)' : undefined }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mt-6">
                <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Tamaño</p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`rounded-lg border px-4 py-2 text-xs font-medium transition-all ${
                        selectedSize === size 
                          ? "border-primary bg-primary/10 text-primary" 
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Specs */}
            <dl className="mt-8 grid grid-cols-2 gap-4 border-y border-border py-6">
              <div><dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Material</dt><dd className="mt-2 text-sm font-semibold">{product.material || 'PLA'}</dd></div>
              <div><dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Dimensiones</dt><dd className="mt-2 text-sm font-semibold">{product.dimensions || (product.sizes?.length ? product.sizes.join(' / ') : 'Estándar')}</dd></div>
              {product.productionDays && (
                <div><dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Producción</dt><dd className="mt-2 text-sm font-semibold">{product.productionDays} días hábiles</dd></div>
              )}
            </dl>

            {/* MakerWorld Callout */}
            <div className="mt-8 mb-4 p-4 rounded-lg bg-primary/10 border border-primary/20">
              <h4 className="text-sm font-bold text-primary mb-2 flex items-center gap-2">
                💡 ¿Buscas más diseños?
              </h4>
              <p className="text-xs leading-relaxed text-gray-300">
                Puedes explorar miles de diseños 3D gratuitos en <a href="https://makerworld.com/es" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold">MakerWorld</a>. 
                Toma una captura del que te guste, descarga el archivo STL, o simplemente copia y pega el enlace del diseño aquí abajo.
              </p>
            </div>

            {/* Custom File/Link Upload */}
            <div className="mt-4">
              <div className="mb-4">
                <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Enlace del diseño (Opcional)</p>
                <input 
                  type="url" 
                  value={externalLink}
                  onChange={(e) => setExternalLink(e.target.value)}
                  placeholder="https://makerworld.com/es/models/..." 
                  className="w-full bg-background border border-border rounded-lg p-3 text-sm text-white outline-none focus:border-primary transition-colors" 
                />
              </div>

              <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Adjuntar archivos (Opcional)</p>
              <div
                className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${
                  files.length > 0 ? "border-primary/50 bg-primary/5" : "border-border hover:border-primary/50"
                }`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); mergeFiles(e.dataTransfer.files); }}
              >
                <input
                  type="file"
                  ref={inputRef}
                  onChange={(e) => { mergeFiles(e.target.files); e.target.value = ""; }}
                  multiple
                  className="hidden"
                  accept=".stl,.obj,.3mf,.step,.stp,.zip,image/*"
                />
                
                {files.length === 0 ? (
                  <div className="text-center">
                    <UploadCloud className="mx-auto mb-3 size-8 text-muted-foreground" />
                    <p className="text-sm font-medium">Arrastra tus fotos o archivos STL aquí</p>
                    <p className="mt-1 text-xs text-muted-foreground">STL - OBJ - 3MF - STEP - JPG - PNG</p>
                    <Button variant="outline" size="sm" className="mt-4" onClick={() => inputRef.current?.click()}>
                      <FileUp className="mr-2 size-4" /> Seleccionar archivos
                    </Button>
                  </div>
                ) : (
                  <div className="w-full space-y-3">
                    {files.map((f, i) => (
                      <div key={i} className="flex items-center justify-between rounded-md bg-background px-3 py-2 text-sm border border-border">
                        <span className="truncate max-w-[200px] sm:max-w-[250px]">{f.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground">{(f.size / 1024 / 1024).toFixed(1)} MB</span>
                          <button onClick={() => setFiles(curr => curr.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-red-500 transition-colors">
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {files.length < 3 && (
                      <Button variant="outline" size="sm" className="w-full border-dashed" onClick={() => inputRef.current?.click()}>
                        <Plus className="mr-2 size-4" /> Añadir otro archivo
                      </Button>
                    )}
                  </div>
                )}
              </div>
              {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
            </div>

            {/* Add to Cart */}
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <div className="flex h-12 items-center border border-border rounded-lg">
                <Button variant="ghost" size="icon" onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Reducir cantidad"><Minus /></Button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <Button variant="ghost" size="icon" onClick={() => setQuantity((q) => q + 1)} aria-label="Aumentar cantidad"><Plus /></Button>
              </div>
              <Button size="lg" className="h-12 flex-1 rounded-lg" onClick={handleAddToCart} disabled={isUploading}>
                {isUploading ? "Procesando archivos..." : <><ShoppingBag className="mr-2" /> Añadir al carrito</>}
              </Button>
            </div>

            {/* Trust badges */}
            <div className="mt-auto grid gap-3 pt-8 text-sm text-muted-foreground">
              <p className="flex items-center gap-3"><Truck className="size-4 text-primary" /> Envío a toda Colombia</p>
              <p className="flex items-center gap-3"><Shield className="size-4 text-primary" /> Fabricación bajo estándares SNAKELAB</p>
              <p className="flex items-center gap-3"><Clock className="size-4 text-primary" /> Despacho estimado entre 3 y 5 días hábiles</p>
            </div>
          </div>
        </div>
      </div>

      {/* ======== LIGHTBOX ======== */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/95 backdrop-blur-sm" onClick={() => setLightboxOpen(false)}>
          <button onClick={() => setLightboxOpen(false)} className="absolute top-4 right-4 z-10 flex size-11 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white hover:bg-black/80 transition-colors">
            <X className="size-5" />
          </button>
          
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex size-11 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white hover:bg-black/80 transition-colors"
            >
              <ChevronLeft className="size-6" />
            </button>
          )}
          
          <img 
            src={images[lightboxIndex]} 
            alt={`${product.name} - vista ${lightboxIndex + 1}`}
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex size-11 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white hover:bg-black/80 transition-colors"
            >
              <ChevronRight className="size-6" />
            </button>
          )}

          <span className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-sm tracking-wider">
            {lightboxIndex + 1} / {images.length}
          </span>
        </div>
      )}
    </main>
  );
}