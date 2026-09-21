import { Link } from "@tanstack/react-router";
import { Menu, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { CartProvider, useCart } from "@/components/cart-context";
import { formatPrice } from "@/lib/products";
import GlassSurface from "@/components/GlassSurface";


export function StoreShell({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <div className="min-h-screen bg-background text-foreground">
        <SiteHeader />
        {children}
        <CartDrawer />
      </div>
    </CartProvider>
  );
}

function Brand() {
  return (
    <Link to="/" className="group flex items-center gap-3" aria-label="SNAKELAB, inicio">
            <img src="/imagens/imagem-bb0a56df.webp" alt="SNAKELAB" className="h-10 w-auto object-contain" />
    </Link>
  );
}

function SiteHeader() {
  const { openCart, totalItems } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  return (
        <header className="fixed inset-x-0 top-0 z-40 border-b border-border/70">
      <GlassSurface width="100%" height={72} borderRadius={0} backgroundOpacity={0.16} saturation={1.35} distortionScale={-120} className="site-header-glass">
        <div className="mx-auto flex h-18 w-full max-w-7xl items-center justify-between px-5 lg:px-8">

        <Brand />
        <nav className="hidden items-center gap-8 md:flex" aria-label="Navegación principal">
          <Link to="/" activeOptions={{ exact: true }} className="nav-link">Inicio</Link>
          <Link to="/" hash="productos" className="nav-link">Productos</Link>
          <Link to="/" hash="proceso" className="nav-link">El proceso</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={openCart} aria-label={`Abrir carrito, ${totalItems} productos`} className="relative">
            <ShoppingBag />
            {totalItems > 0 && <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">{totalItems}</span>}
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMenuOpen((open) => !open)} aria-label="Abrir menú">
            {menuOpen ? <X /> : <Menu />}
          </Button>
        </div>
              </div>
      </GlassSurface>
      {menuOpen && (

        <nav className="border-t border-border bg-background px-5 py-5 md:hidden" aria-label="Navegación móvil">
          <div className="flex flex-col gap-4">
            <Link to="/" onClick={() => setMenuOpen(false)} className="nav-link">Inicio</Link>
            <Link to="/" hash="productos" onClick={() => setMenuOpen(false)} className="nav-link">Productos</Link>
            <Link to="/" hash="proceso" onClick={() => setMenuOpen(false)} className="nav-link">El proceso</Link>
          </div>
        </nav>
      )}
    </header>
  );
}

function CartDrawer() {
  const { items, isOpen, closeCart, changeQuantity, removeItem } = useCart();
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  return (
    <>
      <button aria-label="Cerrar carrito" onClick={closeCart} className={`fixed inset-0 z-50 bg-overlay transition-opacity duration-300 ${isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`} />
      <aside aria-label="Carrito de compras" aria-hidden={!isOpen} className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-border bg-card shadow-drawer transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex h-20 items-center justify-between border-b border-border px-6">
          <div>
            <p className="eyebrow">Tu selección</p>
            <h2 className="font-display text-2xl font-bold">Carrito <span className="text-primary">({items.length})</span></h2>
          </div>
          <Button variant="ghost" size="icon" onClick={closeCart} aria-label="Cerrar carrito"><X /></Button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {items.length === 0 ? (
            <div className="grid h-full place-items-center text-center">
              <div>
                <ShoppingBag className="mx-auto mb-5 size-10 text-muted-foreground" strokeWidth={1.2} />
                <p className="font-display text-xl font-semibold">Tu carrito está vacío</p>
                <p className="mt-2 text-sm text-muted-foreground">Explora piezas creadas capa por capa.</p>
                <Button className="mt-6" onClick={closeCart} asChild><Link to="/" hash="productos">Ver productos</Link></Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map(({ product, quantity }) => (
                <div key={product.slug} className="grid grid-cols-[88px_1fr] gap-4 border-b border-border pb-4">
                  <img src={product.image} alt={product.name} className="aspect-square rounded-sm object-cover" width={1024} height={1024} />
                  <div className="min-w-0">
                    <div className="flex justify-between gap-3">
                      <div><p className="font-display font-semibold">{product.name}</p><p className="mt-1 text-sm text-primary">{formatPrice(product.price)}</p></div>
                      <Button variant="ghost" size="icon" onClick={() => removeItem(product.slug)} aria-label={`Eliminar ${product.name}`}><Trash2 /></Button>
                    </div>
                    <div className="mt-3 flex w-fit items-center border border-border">
                      <Button variant="ghost" size="icon" onClick={() => changeQuantity(product.slug, -1)} aria-label="Reducir cantidad"><Minus /></Button>
                      <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
                      <Button variant="ghost" size="icon" onClick={() => changeQuantity(product.slug, 1)} aria-label="Aumentar cantidad"><Plus /></Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {items.length > 0 && (
          <div className="border-t border-border bg-secondary/50 p-6">
            <div className="mb-5 flex items-end justify-between"><span className="text-sm text-muted-foreground">Subtotal</span><strong className="font-display text-2xl">{formatPrice(subtotal)}</strong></div>
            <Button size="lg" className="w-full">Finalizar pedido</Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">Envío calculado al finalizar</p>
          </div>
        )}
      </aside>
    </>
  );
}