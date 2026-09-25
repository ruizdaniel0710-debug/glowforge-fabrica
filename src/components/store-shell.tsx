import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Menu, Minus, Plus, Search, ShoppingBag, Trash2, X, Building2, Smartphone, CreditCard, CheckCircle } from "lucide-react";
import { useState, useRef, useEffect, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { CartProvider, useCart } from "@/components/cart-context";
import { formatPrice, products } from "@/lib/products";
import { createOrder } from "@/lib/orders.functions";
import { COLOMBIA_DATA } from "@/lib/colombia";
import GlassSurface from "@/components/GlassSurface";

export function StoreShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  
  const adminRoutes = ["/admin", "/catalogo", "/pedidos", "/categorias", "/clientes", "/configuracion"];
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));

  return (
    <CartProvider>
      <div className="min-h-screen bg-background text-foreground">
        {!isAdminRoute && <SiteHeader />}
        {children}
        {!isAdminRoute && <SiteFooter />}
        {!isAdminRoute && <CartDrawer />}
        {!isAdminRoute && <CheckoutModal />}
      </div>
    </CartProvider>
  );
}

function Brand() {
  return (
    <Link to="/" className="group flex items-center gap-2.5" aria-label="SNAKELAB, inicio">
      <img
        src="/imagens/snakelab-icon.png"
        alt=""
        aria-hidden="true"
        className="h-9 w-auto object-contain"
      />
      <span className="font-display text-xl font-bold tracking-[0.12em] text-foreground">SNAKELAB</span>
    </Link>
  );
}

function SiteHeader() {
  const { openCart, totalItems } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const filteredProducts = searchQuery.trim()
    ? products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-border/70">
      <GlassSurface width="100%" height={72} borderRadius={0} backgroundOpacity={0.16} saturation={1.35} distortionScale={-120} className="site-header-glass">
        <div className="mx-auto flex h-18 w-full max-w-7xl items-center justify-between px-5 lg:px-8">
          <Brand />
          <nav className="hidden items-center gap-8 md:flex" aria-label="Navegación principal">
            <Link to="/" activeOptions={{ exact: true }} className="nav-link">Inicio</Link>
            <Link to="/" hash="productos" className="nav-link">Productos</Link>
            <Link to="/" hash="personalizado" className="nav-link">Personalizado</Link>
            <Link to="/" hash="proceso" className="nav-link">El proceso</Link>
            <Link to="/seguimiento" className="nav-link">Seguimiento</Link>
          </nav>
          <div className="flex items-center gap-2">
            {/* Search Toggle */}
            <Button variant="ghost" size="icon" onClick={() => setSearchOpen(!searchOpen)} aria-label="Buscar">
              <Search className="size-5" />
            </Button>
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

      {/* Search Dropdown */}
      {searchOpen && (
        <div className="border-t border-border bg-background/95 backdrop-blur-lg px-5 py-4">
          <div className="mx-auto max-w-7xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar productos..."
                className="w-full bg-card border border-border rounded-lg pl-10 pr-4 py-3 text-sm outline-none focus:border-primary transition-colors"
              />
              {searchQuery && (
                <button onClick={() => { setSearchQuery(""); setSearchOpen(false); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="size-4" />
                </button>
              )}
            </div>
            {filteredProducts.length > 0 && (
              <div className="mt-3 max-h-[50vh] overflow-y-auto space-y-1">
                {filteredProducts.map(p => (
                  <Link
                    key={p.slug}
                    to="/producto/$slug"
                    params={{ slug: p.slug }}
                    onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-card transition-colors group"
                  >
                    <img src={p.image} alt={p.name} className="w-12 h-12 rounded object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm group-hover:text-primary transition-colors truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.category}</p>
                    </div>
                    <span className="text-sm font-semibold text-primary">{formatPrice(p.price)}</span>
                  </Link>
                ))}
              </div>
            )}
            {searchQuery && filteredProducts.length === 0 && (
              <p className="mt-3 text-sm text-muted-foreground text-center py-4">No se encontraron productos para "{searchQuery}"</p>
            )}
          </div>
        </div>
      )}

      {menuOpen && (
        <nav className="border-t border-border bg-background px-5 py-5 md:hidden" aria-label="Navegación móvil">
          <div className="flex flex-col gap-4">
            <Link to="/" onClick={() => setMenuOpen(false)} className="nav-link">Inicio</Link>
            <Link to="/" hash="productos" onClick={() => setMenuOpen(false)} className="nav-link">Productos</Link>
            <Link to="/" hash="personalizado" onClick={() => setMenuOpen(false)} className="nav-link">Personalizado</Link>
            <Link to="/" hash="proceso" onClick={() => setMenuOpen(false)} className="nav-link">El proceso</Link>
            <Link to="/seguimiento" onClick={() => setMenuOpen(false)} className="nav-link">Seguimiento</Link>
          </div>
        </nav>
      )}
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card/50 mt-auto">
      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <img src="/imagens/snakelab-icon.png" alt="" className="h-8 w-auto object-contain" />
              <span className="font-display text-lg font-bold tracking-[0.12em]">SNAKELAB</span>
            </Link>
            <p className="text-sm leading-6 text-muted-foreground">
              Laboratorio de impresión 3D en Bogotá. Diseñamos y fabricamos objetos únicos capa por capa.
            </p>
            <div className="flex gap-3 mt-6">
              <a href="https://www.instagram.com/snakelab.site/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center size-9 rounded-full border border-border hover:border-primary hover:text-primary transition-colors">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
              <a href="https://wa.me/573214403628" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center size-9 rounded-full border border-border hover:border-[#25D366] hover:text-[#25D366] transition-colors">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-display font-bold text-sm uppercase tracking-wider mb-4">Navegación</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-primary transition-colors">Inicio</Link></li>
              <li><Link to="/" hash="productos" className="hover:text-primary transition-colors">Productos</Link></li>
              <li><Link to="/" hash="personalizado" className="hover:text-primary transition-colors">Personalizado</Link></li>
              <li><Link to="/seguimiento" className="hover:text-primary transition-colors">Seguimiento</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-display font-bold text-sm uppercase tracking-wider mb-4">Información</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><span className="hover:text-primary transition-colors cursor-pointer">Política de Envíos</span></li>
              <li><span className="hover:text-primary transition-colors cursor-pointer">Preguntas Frecuentes</span></li>
              <li><span className="hover:text-primary transition-colors cursor-pointer">Términos y Condiciones</span></li>
              <li><span className="hover:text-primary transition-colors cursor-pointer">Privacidad</span></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display font-bold text-sm uppercase tracking-wider mb-4">Contacto</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>📍 Bogotá, Colombia</li>
              <li>📱 +57 321 440 3628</li>
              <li>✉️ darinru0710@gmail.com</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} SNAKELAB. Todos los derechos reservados.</p>
          <p className="text-xs text-muted-foreground">Hecho con 🐍 en Colombia</p>
        </div>
      </div>
    </footer>
  );
}

function CartDrawer() {
  const { items, isOpen, closeCart, changeQuantity, removeItem } = useCart();
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const handleCheckout = () => {
    closeCart();
    // Trigger checkout modal via custom event
    window.dispatchEvent(new CustomEvent('open-checkout'));
  };

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
            <Button size="lg" className="w-full" onClick={handleCheckout}>Finalizar pedido</Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">Envío calculado al finalizar</p>
          </div>
        )}
      </aside>
    </>
  );
}

/* ============================================================
   CHECKOUT MODAL — Colombian payment methods
   ============================================================ */
function CheckoutModal() {
  const { items, closeCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState("transferencia");
  const [step, setStep] = useState<"form" | "success">("form");
  const [orderCode, setOrderCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDept, setSelectedDept] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const submitOrderFn = useServerFn(createOrder);

  useEffect(() => {
    const handler = () => setIsOpen(true);
    window.addEventListener('open-checkout', handler);
    return () => window.removeEventListener('open-checkout', handler);
  }, []);

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!termsAccepted) {
      alert("Debes aceptar los términos y la política de privacidad para continuar.");
      return;
    }
    
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      const response = await submitOrderFn({
        data: {
          customer: {
            name: formData.get("name") as string,
            email: formData.get("email") as string,
            phone: formData.get("phone") as string,
          },
          shipping: {
            address: formData.get("address") as string,
            city: formData.get("city") as string,
            department: (formData.get("department") as string) || "",
          },
          paymentMethod: selectedPayment,
          items: items.map(i => ({
            id: i.product.id,
            name: i.product.name,
            price: i.product.price,
            quantity: i.quantity
          })),
          subtotal
        }
      });
      
      setOrderCode(response.orderCode);
      setStep("success");
    } catch (err) {
      console.error(err);
      alert("Hubo un error guardando el pedido. Intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setStep("form");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-card border border-border w-full max-w-2xl rounded-xl shadow-2xl flex flex-col max-h-[95vh] my-auto" onClick={(e) => e.stopPropagation()}>
        
        {step === "form" ? (
          <>
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="font-display text-2xl font-bold flex items-center gap-3">
                <CreditCard className="size-6 text-primary" />
                Finalizar Compra
              </h2>
              <Button variant="ghost" size="icon" onClick={handleClose}><X /></Button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
              {/* Customer Info */}
              <div className="space-y-1">
                <label className="text-sm font-medium">Nombre completo *</label>
                <input required name="name" type="text" pattern="^[a-zA-ZÁÉÍÓÚáéíóúÑñ ]{5,}$" title="Debe contener al menos 5 caracteres y solo letras" placeholder="Ej. Juan Pérez" className="w-full bg-background border border-border rounded-lg p-3 text-sm outline-none focus:border-primary transition-colors" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Email *</label>
                  <input required name="email" type="email" placeholder="correo@ejemplo.com" className="w-full bg-background border border-border rounded-lg p-3 text-sm outline-none focus:border-primary transition-colors" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Teléfono *</label>
                  <input required name="phone" type="tel" pattern="^3[0-9]{9}$" title="El teléfono debe tener 10 dígitos y empezar por 3" placeholder="Ej. 3001234567" className="w-full bg-background border border-border rounded-lg p-3 text-sm outline-none focus:border-primary transition-colors" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Dirección de envío *</label>
                <input required name="address" type="text" placeholder="Calle, número, barrio" className="w-full bg-background border border-border rounded-lg p-3 text-sm outline-none focus:border-primary transition-colors" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Departamento *</label>
                  <select 
                    required 
                    name="department" 
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg p-3 text-sm outline-none focus:border-primary transition-colors"
                  >
                    <option value="">Selecciona un departamento</option>
                    {Object.keys(COLOMBIA_DATA).map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Ciudad *</label>
                  <select 
                    required 
                    name="city" 
                    className="w-full bg-background border border-border rounded-lg p-3 text-sm outline-none focus:border-primary transition-colors disabled:opacity-50"
                    disabled={!selectedDept}
                  >
                    <option value="">Selecciona una ciudad</option>
                    {selectedDept && (COLOMBIA_DATA as any)[selectedDept].map((city: string) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="pt-2">
                <h3 className="font-display font-bold text-sm uppercase tracking-wider mb-3">Método de Pago</h3>
                <div className="space-y-2">
                  {[
                    { id: "transferencia", name: "Transferencia Bancaria", desc: "Transferencia directa a nuestra cuenta", icon: <Building2 className="size-5" />, color: "bg-blue-500/10 text-blue-400" },
                    { id: "nequi", name: "Nequi", desc: "Paga fácil desde tu celular", icon: <img src="/imagens/nequi-logo.png" alt="Nequi" className="size-6 object-contain" />, color: "bg-purple-500/10 text-purple-400" },
                    { id: "daviplata", name: "Daviplata", desc: "Transferencia por Daviplata", icon: <span className="text-sm font-black">D</span>, color: "bg-red-500/10 text-red-400" },
                    { id: "mercadopago", name: "Mercado Pago", desc: "Paga con tarjeta o PSE", icon: <span className="text-xs font-black">MP</span>, color: "bg-sky-500/10 text-sky-400" },
                  ].map(method => (
                    <button
                      type="button"
                      key={method.id}
                      onClick={() => setSelectedPayment(method.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-lg border transition-all text-left ${
                        selectedPayment === method.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-border/80 hover:bg-card"
                      }`}
                    >
                      <div className={`flex items-center justify-center size-10 rounded-lg ${method.color}`}>
                        {method.icon}
                      </div>
                      <div className={`size-4 rounded-full border-2 flex-shrink-0 ${selectedPayment === method.id ? "border-primary bg-primary" : "border-muted-foreground"}`} />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">{method.name}</p>
                        <p className="text-xs text-muted-foreground">{method.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="border-t border-border pt-4">
                <h3 className="font-display font-bold text-sm uppercase tracking-wider mb-3">Resumen</h3>
                <div className="space-y-2">
                  {items.map(({ product, quantity }) => (
                    <div key={product.slug} className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">{product.name} × {quantity}</span>
                      <span className="font-medium">{formatPrice(product.price * quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-border">
                  <span className="font-display font-bold text-lg">Total</span>
                  <span className="font-display font-bold text-2xl text-primary">{formatPrice(subtotal)}</span>
                </div>
              </div>

              <div className="flex items-start gap-2 text-sm text-muted-foreground mt-4">
                <input
                  type="checkbox"
                  id="terms-checkout"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-1 shrink-0 bg-transparent border-white/20 checked:bg-primary"
                />
                <label htmlFor="terms-checkout" className="leading-5">
                  Acepto que SNAKELAB procese mis datos para mi compra según la{" "}
                  <Link to="/terminos" target="_blank" className="text-primary hover:underline">Política de Privacidad y Términos de Servicio</Link>.
                </label>
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Procesando..." : "Confirmar Pedido"}
              </Button>
            </form>
          </>
        ) : (
          /* Success Step */
          <div className="p-10 text-center">
            <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle className="size-10 text-primary" />
            </div>
            <h2 className="font-display text-3xl font-bold">¡Pedido Confirmado!</h2>
            <p className="mt-4 text-muted-foreground max-w-md mx-auto">
              Tu pedido ha sido recibido exitosamente. Te contactaremos pronto con los detalles de pago.
            </p>
            <div className="mt-6 bg-background border border-border rounded-lg p-4 inline-block">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Código de seguimiento</p>
              <p className="mt-1 font-mono text-2xl font-bold text-primary">{orderCode}</p>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              Guarda este código para consultar el estado de tu pedido en la sección de <strong>Seguimiento</strong>.
            </p>
            <div className="flex gap-4 mt-8 justify-center">
              <Button variant="outline" onClick={handleClose}>Cerrar</Button>
              <Button asChild onClick={handleClose}>
                <a href={`https://wa.me/573214403628?text=${encodeURIComponent(`Hola SNAKE LAB! Acabo de hacer un pedido con código ${orderCode}`)}`} target="_blank" rel="noopener noreferrer">
                  Contactar por WhatsApp
                </a>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}