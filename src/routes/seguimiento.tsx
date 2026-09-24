import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { lookupCustomRequest, REQUEST_STATUSES } from "@/lib/requests.functions";
import { formatPrice } from "@/lib/products";

export const Route = createFileRoute("/seguimiento")({
  validateSearch: z.object({ code: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Seguimiento de pedidos personalizados — SNAKELAB" },
      { name: "description", content: "Consulta el estado de tu pedido personalizado de impresión 3D, tus notas y la cotización de SNAKELAB." },
      { property: "og:title", content: "Seguimiento de pedidos — SNAKELAB" },
      { property: "og:description", content: "Revisa el estado y las respuestas de cotización de tu pedido personalizado." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TrackingPage,
});

type Result = Awaited<ReturnType<typeof lookupCustomRequest>>;
const fmtDate = (d: string) => new Date(d).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" });
const FLOW = REQUEST_STATUSES.filter((s) => s !== "cancelada");

function TrackingPage() {
  const search = Route.useSearch();
  const lookup = useServerFn(lookupCustomRequest);
  const [code, setCode] = useState(search.code ?? "");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      setResult(await lookup({ data: { code: code.trim(), email: email.trim() } }));
    } catch {
      setError("Revisa el código y el correo e inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const req = result?.found ? result.request : null;
  const step = req ? FLOW.indexOf(req.status as (typeof FLOW)[number]) : -1;

  return (
    <main className="mx-auto max-w-4xl px-5 pb-24 pt-32 lg:px-8">
      <p className="eyebrow mb-4">Pedidos personalizados</p>
      <h1 className="font-display text-5xl font-bold uppercase leading-none md:text-6xl">Seguimiento</h1>
      <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">Escribe el código que recibiste al enviar tu solicitud y el correo que usaste.</p>

      <form onSubmit={submit} className="mt-8 grid gap-3 border border-border bg-card p-5 sm:grid-cols-[1fr_1.4fr_auto]">
        <input required value={code} onChange={(e) => setCode(e.target.value)} placeholder="SNK-XXXXXX" className="border border-border bg-background/60 px-3 py-2.5 font-mono text-sm uppercase outline-none focus:border-primary" />
        <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Tu correo" className="border border-border bg-background/60 px-3 py-2.5 text-sm outline-none focus:border-primary" />
        <Button type="submit" disabled={loading}>{loading ? "Buscando…" : "Consultar"}</Button>
      </form>
      {error && <p className="mt-3 text-sm text-primary">{error}</p>}
      {result && !result.found && <p className="mt-6 text-sm text-primary">No encontramos una solicitud con ese código y correo.</p>}

      {req && result?.found && (
        <section className="mt-10 space-y-6">
          <div className="border border-border bg-card p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="font-mono text-xl text-primary">{req.code}</h2>
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Enviada {fmtDate(req.createdAt)}</span>
            </div>
            {req.status === "cancelada" ? (
              <p className="mt-5 font-display text-2xl uppercase text-primary">Cancelada</p>
            ) : (
              <ol className="mt-6 grid grid-cols-3 gap-2 sm:grid-cols-6">
                {FLOW.map((s, i) => (
                  <li key={s} className={`border-t-2 pt-2 font-mono text-[10px] uppercase tracking-[0.1em] ${i <= step ? "border-primary text-foreground" : "border-border text-muted-foreground"}`}>{s}</li>
                ))}
              </ol>
            )}
            {req.quoteAmount != null && (
              <p className="mt-6 text-sm">Cotización: <strong className="font-display text-3xl text-primary">{formatPrice(req.quoteAmount)}</strong></p>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="border border-border bg-card p-6">
              <p className="eyebrow mb-3">Tus notas</p>
              <p className="whitespace-pre-wrap text-sm leading-6">{req.notes || "Sin notas."}</p>
              <p className="eyebrow mb-2 mt-6">Archivos</p>
              <ul className="space-y-1 text-sm text-muted-foreground">{req.files.map((f) => <li key={f}>· {f}</li>)}</ul>
            </div>
            <div className="border border-border bg-card p-6">
              <p className="eyebrow mb-3">Respuestas de SNAKELAB</p>
              {result.replies.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aún no hay respuestas. Te contestamos en menos de 24 horas.</p>
              ) : (
                <ul className="space-y-4">
                  {result.replies.map((r) => (
                    <li key={r.id} className="border-l-2 border-primary pl-3">
                      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{fmtDate(r.created_at)}{r.amount != null && ` · ${formatPrice(r.amount)}`}</p>
                      <p className="mt-1 whitespace-pre-wrap text-sm leading-6">{r.message}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
