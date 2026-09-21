import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Check, Minus, Plus, ShoppingBag } from "lucide-react";
import { useState } from "react";
import AccordionGallery from "@/components/AccordionGallery";
import { useCart } from "@/components/cart-context";
import { Button } from "@/components/ui/button";
import { formatPrice, getProduct, products } from "@/lib/products";

export const Route = createFileRoute("/producto/$slug")({
  loader: ({ params }) => {
    const product = getProduct(params.slug);
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
    ] };
  },
  component: ProductPage,
});

function ProductPage() {
  const product = Route.useLoaderData();
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const galleryItems = [
    { image: product.image, label: product.name },
    ...products
      .filter((p) => p.slug !== product.slug)
      .map((p) => ({ image: p.image, label: p.name, link: `/producto/${p.slug}` })),
  ];
  return (
    <main className="min-h-screen pt-18">
      <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        <Button variant="ghost" asChild><Link to="/" hash="productos"><ArrowLeft /> Volver al catálogo</Link></Button>
        <div className="mt-6 grid overflow-hidden border border-border bg-card lg:grid-cols-2">
          <div className="relative min-h-[420px] overflow-hidden border-b border-border lg:min-h-[720px] lg:border-b-0 lg:border-r">
            <img src={product.image} alt={product.name} width={1024} height={1024} className="absolute inset-0 h-full w-full object-cover" />
            <span className="absolute left-5 top-5 border border-border bg-background/80 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] backdrop-blur">{product.category}</span>
          </div>
          <div className="flex flex-col p-6 sm:p-10 lg:p-14">
            <p className="eyebrow">Objeto / {product.slug}</p>
            <h1 className="mt-5 font-display text-5xl font-bold uppercase leading-none sm:text-7xl">{product.name}</h1>
            <p className="mt-6 text-2xl font-semibold text-primary">{formatPrice(product.price)}</p>
            <p className="mt-8 max-w-xl text-base leading-7 text-muted-foreground">{product.description}</p>
            <dl className="mt-10 grid grid-cols-2 border-y border-border py-6">
              <div><dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Material</dt><dd className="mt-2 text-sm font-semibold">{product.material}</dd></div>
              <div><dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Dimensiones</dt><dd className="mt-2 text-sm font-semibold">{product.dimensions}</dd></div>
            </dl>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <div className="flex h-12 items-center border border-border">
                <Button variant="ghost" size="icon" onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Reducir cantidad"><Minus /></Button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <Button variant="ghost" size="icon" onClick={() => setQuantity((q) => q + 1)} aria-label="Aumentar cantidad"><Plus /></Button>
              </div>
              <Button size="lg" className="h-12 flex-1" onClick={() => addItem(product, quantity)}><ShoppingBag /> Añadir al carrito</Button>
            </div>
            <div className="mt-auto grid gap-3 pt-10 text-sm text-muted-foreground"><p className="flex items-center gap-3"><Check className="size-4 text-primary" /> Fabricación bajo estándares SNAKELAB</p><p className="flex items-center gap-3"><Check className="size-4 text-primary" /> Despacho estimado entre 3 y 5 días hábiles</p></div>
          </div>
        </div>
      </div>
    </main>
  );
}