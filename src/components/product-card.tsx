import { useState } from "react";
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
      <article className="group relative flex h-full flex-col bg-card overflow-hidden">
        <Link to="/producto/$slug" params={{ slug: product.slug }} className="relative block w-full aspect-square bg-black">
          <img src={product.image} alt={product.name} loading="lazy" width={1024} height={1024} className="absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-[1.08]" />
          
          {/* Explicit dark overlay for legibility */}
          <div className="absolute inset-0 bg-black/80 opacity-0 transition-opacity duration-500 group-hover:opacity-100 z-10" />
          
          <span className="absolute left-4 top-4 border border-border bg-background/80 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground backdrop-blur z-30 transition-opacity duration-300 group-hover:opacity-0">
            0{index + 1} / {product.category}
          </span>
          
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center opacity-0 transition-opacity duration-500 group-hover:opacity-100">
            <h3 className="mb-2 translate-y-4 font-display text-2xl font-bold uppercase text-white transition-transform duration-500 group-hover:translate-y-0">
              {product.name}
            </h3>
            
            <p className="mb-4 text-xs leading-relaxed text-gray-300 line-clamp-3 translate-y-4 transition-transform delay-75 duration-500 group-hover:translate-y-0">
              {product.shortDescription}
            </p>
            
            <p className="mb-4 translate-y-4 font-mono text-xl font-bold text-primary transition-transform delay-100 duration-500 group-hover:translate-y-0">
              {formatPrice(product.price)}
            </p>
            
            {product.colors && product.colors.length > 0 && (
              <div className="mb-4 flex flex-wrap justify-center gap-2 translate-y-4 transition-transform delay-150 duration-500 group-hover:translate-y-0">
                {product.colors.map(color => (
                  <span key={color} className="rounded-md border border-white/20 bg-white/10 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-white backdrop-blur-sm">
                    {color}
                  </span>
                ))}
              </div>
            )}
            
            <div className="translate-y-4 transition-transform delay-200 duration-500 group-hover:translate-y-0">
              <Button size="lg" className="gap-2" onClick={(e) => { e.preventDefault(); addItem(product); }}>
                <Plus className="size-4" /> Añadir
              </Button>
            </div>
          </div>
        </Link>
      </article>
    </BorderGlow>
  );
}