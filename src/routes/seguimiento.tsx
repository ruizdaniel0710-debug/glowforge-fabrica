import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { lookupOrder } from "@/lib/orders.functions";
import { lookupCustomRequest, payCustomRequest } from "@/lib/requests.functions";
import { formatPrice } from "@/lib/products";
import { COLOMBIA_DATA } from "@/lib/colombia";
import { Building2, CreditCard, X, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/seguimiento")({
  validateSearch: z.object({ code: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Seguimiento de pedidos — SNAKELAB" },
      { name: "description", content: "Consulta el estado de tu pedido en SNAKELAB." },
      { property: "og:title", content: "Seguimiento de pedidos — SNAKELAB" },
      { property: "og:description", content: "Revisa el estado de envío y producción de tu pedido." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TrackingPage,
});

const fmtDate = (d: string) => new Date(d).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" });
const STORE_FLOW = ["pendiente", "en revisión", "imprimiendo", "enviado"];
const CUSTOM_FLOW = ["recibida", "en revisión", "cotizada", "aprobada", "en impresión", "enviada"];

function TrackingPage() {
  const search = Route.useSearch();
  const lookupStore = useServerFn(lookupOrder);
  const lookupCustom = useServerFn(lookupCustomRequest);
  
  const [code, setCode] = useState(search.code ?? "");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setShowPaymentForm(false);
    
    const cleanCode = code.trim().toUpperCase();
    
    try {
      if (cleanCode.startsWith('SNK-')) {
        const res = await lookupCustom({ data: { code: cleanCode, email: email.trim() } });
        setResult({ type: 'custom', ...res });
      } else {
        const res = await lookupStore({ data: { code: cleanCode, email: email.trim() } });
        setResult({ type: 'store', ...res });
      }
    } catch {
      setError("Revisa el código y el correo e inténtalo de nuevo.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setShowPaymentForm(false);
    // Re-fetch to show updated status
    const syntheticEvent = { preventDefault: () => {} } as FormEvent;
    submit(syntheticEvent);
  };

  const renderStoreOrder = () => {
    const req = result.order;
    const step = STORE_FLOW.indexOf(req.status);
    const items = JSON.parse(req.items || '[]');
    const shipping = JSON.parse(req.shipping_snapshot || '{}');

    return (
      <section className="mt-10 space-y-6">
        <div className="border border-border bg-card p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="font-mono text-xl text-primary">{req.idempotency_key}</h2>
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Realizado {fmtDate(req.created_at)}</span>
          </div>
          {req.status === "cancelado" ? (
            <p className="mt-5 font-display text-2xl uppercase text-primary">Cancelado</p>
          ) : (
            <ol className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {STORE_FLOW.map((s, i) => (
                <li key={s} className={`border-t-2 pt-2 font-mono text-[10px] uppercase tracking-[0.1em] ${i <= step ? "border-primary text-foreground" : "border-border text-muted-foreground"}`}>{s}</li>
              ))}
            </ol>
          )}
          <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
            <span className="text-sm text-muted-foreground">Total Pagado:</span>
            <strong className="font-display text-3xl text-primary">{formatPrice(req.total)}</strong>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="border border-border bg-card p-6">
            <p className="eyebrow mb-3">Productos Adquiridos</p>
            <ul className="space-y-3 mt-4">
              {items.map((item: any, i: number) => (
                <li key={i} className="flex justify-between items-center text-sm border-b border-border/50 pb-2">
                  <span className="text-foreground">{item.name} <span className="text-muted-foreground">x{item.quantity}</span></span>
                  <span className="font-mono text-primary">{formatPrice(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="border border-border bg-card p-6">
            <p className="eyebrow mb-3">Detalles de Envío</p>
            <div className="space-y-1 text-sm text-muted-foreground mt-4">
              <p><strong className="text-foreground">Dirección:</strong> {shipping.address}</p>
              <p><strong className="text-foreground">Ciudad:</strong> {shipping.city}</p>
              <p><strong className="text-foreground">Departamento:</strong> {shipping.department}</p>
            </div>
            <p className="eyebrow mb-3 mt-6">Método de pago</p>
            <p className="text-sm text-muted-foreground uppercase">{req.payment_method}</p>
          </div>
        </div>
      </section>
    );
  };

  const renderCustomRequest = () => {
    const req = result.request;
    const step = CUSTOM_FLOW.indexOf(req.status);
    const shipping = req.shipping_info ? JSON.parse(req.shipping_info) : null;
    const needsPayment = req.status === "cotizada" && req.quoteAmount > 0;

    return (
      <section className="mt-10 space-y-6">
        <div className="border border-border bg-card p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="font-mono text-xl text-primary">{req.code}</h2>
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Cotización {fmtDate(req.createdAt)}</span>
          </div>
          
          {req.status === "cancelada" ? (
            <p className="mt-5 font-display text-2xl uppercase text-primary">Cancelada</p>
          ) : (
            <ol className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-6">
              {CUSTOM_FLOW.map((s, i) => (
                <li key={s} className={`border-t-2 pt-2 font-mono text-[10px] uppercase tracking-[0.1em] ${i <= step ? "border-primary text-foreground" : "border-border text-muted-foreground"}`}>{s}</li>
              ))}
            </ol>
          )}

          {req.quoteAmount > 0 && (
            <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between border-t border-border pt-6 gap-4">
              <div>
                <span className="text-sm text-muted-foreground">Cotización Total:</span>
                <p className="font-display text-3xl text-primary">{formatPrice(req.quoteAmount)}</p>
              </div>
              {needsPayment && (
                <Button size="lg" onClick={() => setShowPaymentForm(true)} className="animate-pulse shadow-[0_0_15px_rgba(var(--primary),0.5)]">
                  Pagar e iniciar impresión
                </Button>
              )}
            </div>
          )}
        </div>

        {shipping && (
          <div className="border border-border bg-card p-6">
            <p className="eyebrow mb-3">Detalles de Envío y Pago</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="space-y-1 text-sm text-muted-foreground">
                <p><strong className="text-foreground">Dirección:</strong> {shipping.address}</p>
                <p><strong className="text-foreground">Ciudad:</strong> {shipping.city}, {shipping.department}</p>
                <p><strong className="text-foreground">Teléfono:</strong> {shipping.phone}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Método de pago:</p>
                <p className="text-sm font-semibold uppercase">{shipping.paymentMethod}</p>
              </div>
            </div>
          </div>
        )}
      </section>
    );
  };

  return (
    <main className="mx-auto max-w-4xl px-5 pb-24 pt-32 lg:px-8">
      <p className="eyebrow mb-4">Pedidos y Cotizaciones</p>
      <h1 className="font-display text-5xl font-bold uppercase leading-none md:text-6xl">Seguimiento</h1>
      <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">Escribe tu código de pedido (ej. SL-XXXX o SNK-XXXX) y el correo que usaste.</p>

      <form onSubmit={submit} className="mt-8 grid gap-3 border border-border bg-card p-5 sm:grid-cols-[1fr_1.4fr_auto]">
        <input required value={code} onChange={(e) => setCode(e.target.value)} placeholder="Ej. SL-XXXX" className="border border-border bg-background/60 px-3 py-2.5 font-mono text-sm uppercase outline-none focus:border-primary" />
        <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Tu correo" className="border border-border bg-background/60 px-3 py-2.5 text-sm outline-none focus:border-primary" />
        <Button type="submit" disabled={loading}>{loading ? "Buscando…" : "Consultar"}</Button>
      </form>
      
      {error && <p className="mt-3 text-sm text-primary">{error}</p>}
      {result && !result.found && <p className="mt-6 text-sm text-primary">No encontramos un registro con ese código y correo.</p>}

      {result && result.found && (
        result.type === 'store' ? renderStoreOrder() : renderCustomRequest()
      )}

      {showPaymentForm && result?.request && (
        <CustomPaymentModal 
          request={result.request} 
          onClose={() => setShowPaymentForm(false)} 
          onSuccess={handlePaymentSuccess} 
        />
      )}
    </main>
  );
}

function CustomPaymentModal({ request, onClose, onSuccess }: { request: any; onClose: () => void; onSuccess: () => void }) {
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedPayment, setSelectedPayment] = useState("transferencia");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const payFn = useServerFn(payCustomRequest);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      await payFn({
        data: {
          id: request.id,
          shipping: {
            phone: formData.get("phone") as string,
            address: formData.get("address") as string,
            department: formData.get("department") as string,
            city: formData.get("city") as string,
            paymentMethod: selectedPayment,
          }
        }
      });
      
      onSuccess();
      
      // Redirect or show WhatsApp based on method
      if (selectedPayment === "wompi") {
        window.open("https://checkout.wompi.co/l/VPOS_6miq11", "_blank");
      } else {
        const msg = encodeURIComponent(`Hola SNAKE LAB! Acabo de aprobar mi cotización ${request.code}. Aquí tienes mi comprobante de pago:`);
        window.open(`https://wa.me/573214403628?text=${msg}`, "_blank");
      }
      
    } catch (err) {
      console.error(err);
      alert("Hubo un error procesando el pago. Inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-card border border-border w-full max-w-2xl rounded-xl shadow-2xl flex flex-col max-h-[95vh] my-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="font-display text-2xl font-bold flex items-center gap-3">
            <CreditCard className="size-6 text-primary" />
            Pagar Cotización
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}><X /></Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg flex gap-3 items-start">
            <AlertCircle className="size-5 text-primary shrink-0 mt-0.5" />
            <p className="text-sm text-gray-300">
              Estás a punto de pagar el pedido <strong className="text-primary">{request.code}</strong>. 
              Por favor, dinos a dónde enviarlo.
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Teléfono de contacto *</label>
            <input required name="phone" type="tel" pattern="^3[0-9]{9}$" title="El teléfono debe tener 10 dígitos y empezar por 3" placeholder="Ej. 3001234567" className="w-full bg-background border border-border rounded-lg p-3 text-sm outline-none focus:border-primary transition-colors" />
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

          <div className="pt-2">
            <h3 className="font-display font-bold text-sm uppercase tracking-wider mb-3">Método de Pago</h3>
            <div className="space-y-2">
              {[
                { id: "wompi", name: "Pagar en línea (Wompi)", desc: "Nequi, Bancolombia, PSE y Tarjetas", icon: <CreditCard className="size-5" />, color: "bg-blue-500/10 text-blue-400" },
                { id: "transferencia", name: "Transferencia Directa", desc: "Acordar pago manualmente (Nequi/Bancolombia)", icon: <Building2 className="size-5" />, color: "bg-green-500/10 text-green-400" },
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

          <div className="border-t border-border pt-4">
            <div className="flex justify-between items-center mt-2">
              <span className="font-display font-bold text-lg">Total a pagar</span>
              <span className="font-display font-bold text-2xl text-primary">{formatPrice(request.quoteAmount)}</span>
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Procesando..." : "Confirmar Pago"}
          </Button>
        </form>
      </div>
    </div>
  );
}
