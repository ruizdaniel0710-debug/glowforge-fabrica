import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Plus } from "lucide-react";
import BorderGlow from "@/components/BorderGlow";
import { useCart } from "@/components/cart-context";
import { Button } from "@/components/ui/button";
import { formatPrice, type Product } from "@/lib/products";

export function ProductCard({ product, index }: { product: Product; index: number }) {
  const { addItem } = useCart();
  return (
    <BorderGlow className="h-full">
      <article className="group flex h-full flex-col bg-card">
        <Link to="/producto/$slug" params={{ slug: product.slug }} className="relative block overflow-hidden">
          <img src={product.image} alt={product.name} loading="lazy" width={1024} height={1024} className="aspect-square w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
          <span className="absolute left-4 top-4 border border-border bg-background/80 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground backdrop-blur">0{index + 1} / {product.category}</span>
        </Link>
        <div className="flex flex-1 flex-col p-5">
          <Link to="/producto/$slug" params={{ slug: product.slug }} className="flex items-start justify-between gap-4">
            <div><h3 className="font-display text-xl font-semibold">{product.name}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{product.shortDescription}</p></div>
            <ArrowUpRight className="mt-1 size-5 shrink-0 text-primary transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
          </Link>
          <div className="mt-auto flex items-center justify-between pt-5">
            <strong className="font-display text-lg">{formatPrice(product.price)}</strong>
            <Button size="icon" onClick={() => addItem(product)} aria-label={`Añadir ${product.name} al carrito`}><Plus /></Button>
          </div>
        </div>
      </article>
    </BorderGlow>
  );
}