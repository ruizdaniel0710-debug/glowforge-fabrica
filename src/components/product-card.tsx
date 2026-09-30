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
        <Link to="/producto/$slug" params={{ slug: product.slug }} className="relative flex flex-col w-full h-full bg-black">
          
          <div className="relative w-full aspect-square overflow-hidden">
            <img src={product.image} alt={product.name} loading="lazy" width={1024} height={1024} className="absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-[1.08]" />
            
            {/* Explicit dark overlay for legibility (Desktop Only) */}
            <div className="hidden md:block absolute inset-0 bg-black/80 opacity-0 transition-opacity duration-500 group-hover:opacity-100 z-10" />
            
            <span className="absolute left-4 top-4 border border-border bg-background/80 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground backdrop-blur z-30 transition-opacity duration-300 md:group-hover:opacity-0">
              0{index + 1} / {product.category}
            </span>
            
            {/* Desktop Hover Info */}
            <div className="hidden md:flex absolute inset-0 z-20 flex-col items-center justify-center p-6 text-center opacity-0 transition-opacity duration-500 group-hover:opacity-100">
              <h3 className="mb-2 translate-y-4 font-display text-2xl font-bold uppercase text-white transition-transform duration-500 group-hover:translate-y-0">
                {product.name}
              </h3>
              
              <p className="mb-4 text-xs leading-relaxed text-gray-300 line-clamp-3 translate-y-4 transition-transform delay-75 duration-500 group-hover:translate-y-0">
                {product.shortDescription}
              </p>
              
              <p className="mb-4 translate-y-4 font-mono text-xl font-bold text-primary transition-transform delay-100 duration-500 group-hover:translate-y-0">
                {formatPrice(product.price)}
              </p>
              
              <div className="translate-y-4 transition-transform delay-200 duration-500 group-hover:translate-y-0">
                <Button size="lg" className="gap-2" onClick={(e) => { e.preventDefault(); addItem(product); }}>
                  <Plus className="size-4" /> Añadir
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile Always-Visible Info */}
          <div className="flex flex-col flex-1 p-4 bg-[#111] md:hidden">
            <h3 className="font-display text-lg font-bold uppercase text-white line-clamp-1 mb-1">
              {product.name}
            </h3>
            
            <p className="mb-3 font-mono text-base font-bold text-primary">
              {formatPrice(product.price)}
            </p>
            
            <div className="mt-auto">

              
              <Button size="sm" className="w-full gap-2" onClick={(e) => { e.preventDefault(); addItem(product); }}>
                <Plus className="size-4" /> Añadir al carrito
              </Button>
            </div>
          </div>

        </Link>
      </article>
    </BorderGlow>
  );
}