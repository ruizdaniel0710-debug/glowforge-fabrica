import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { checkIsAdmin, listCustomRequests, updateCustomRequest, REQUEST_STATUSES } from "@/lib/requests.functions";
import { formatPrice } from "@/lib/products";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Panel de solicitudes — SNAKELAB" },
      { name: "description", content: "Gestiona las solicitudes personalizadas y cotizaciones de SNAKELAB." },
      { property: "og:title", content: "Panel — SNAKELAB" },
      { property: "og:description", content: "Gestión de solicitudes personalizadas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

type Req = Awaited<ReturnType<typeof listCustomRequests>>[number];

function AdminPage() {
  const navigate = useNavigate();
  const isAdminFn = useServerFn(checkIsAdmin);
  const listFn = useServerFn(listCustomRequests);
  const admin = useQuery({ queryKey: ["is-admin"], queryFn: () => isAdminFn() });
  const list = useQuery({ queryKey: ["custom-requests"], queryFn: () => listFn(), enabled: !!admin.data?.isAdmin });

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  return (
    <main className="mx-auto max-w-6xl px-5 pb-24 pt-32 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-4">Panel SNAKELAB</p>
          <h1 className="font-display text-5xl font-bold uppercase">Solicitudes</h1>
        </div>
        <Button variant="outline" onClick={signOut}>Cerrar sesión</Button>
      </div>
      {admin.isLoading && <p className="mt-8 text-sm text-muted-foreground">Cargando…</p>}
      {admin.data && !admin.data.isAdmin && <p className="mt-8 text-sm text-primary">Tu cuenta no tiene permisos de administrador.</p>}
      {list.data?.length === 0 && <p className="mt-8 text-sm text-muted-foreground">Aún no hay solicitudes.</p>}
      <div className="mt-8 space-y-6">
        {list.data?.map((r) => <RequestCard key={r.id} req={r} />)}
      </div>
    </main>
  );
}

function RequestCard({ req }: { req: Req }) {
  const qc = useQueryClient();
  const updateFn = useServerFn(updateCustomRequest);
  const [status, setStatus] = useState(req.status);
  const [amount, setAmount] = useState(req.quote_amount?.toString() ?? "");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await updateFn({
        data: {
          id: req.id,
          status: status as (typeof REQUEST_STATUSES)[number],
          amount: amount.trim() ? Math.round(Number(amount)) : null,
          message: message.trim() || undefined,
        },
      });
      setMessage("");
      await qc.invalidateQueries({ queryKey: ["custom-requests"] });
    } finally {
      setSaving(false);
    }
  };

  return (
    <article className="grid gap-6 border border-border bg-card p-6 lg:grid-cols-2">
      <div>
        <div className="flex flex-wrap items-baseline gap-3">
          <h2 className="font-mono text-lg text-primary">{req.code}</h2>
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{new Date(req.created_at).toLocaleString("es-CO")}</span>
        </div>
        <p className="mt-2 text-sm">{req.customer_name} · <a href={`mailto:${req.email}`} className="text-primary underline">{req.email}</a></p>
        <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{req.notes || "Sin notas."}</p>
        <ul className="mt-4 space-y-1 text-sm">
          {req.files.map((f) => (
            <li key={f.name}>{f.url ? <a href={f.url} target="_blank" rel="noreferrer" className="text-primary underline">{f.name}</a> : f.name}</li>
          ))}
        </ul>
        {req.request_replies.length > 0 && (
          <ul className="mt-5 space-y-3">
            {req.request_replies.map((m) => (
              <li key={m.id} className="border-l-2 border-primary pl-3 text-sm">
                <span className="font-mono text-[10px] uppercase text-muted-foreground">{new Date(m.created_at).toLocaleString("es-CO")}{m.amount != null && ` · ${formatPrice(m.amount)}`}</span>
                <p className="whitespace-pre-wrap">{m.message}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="space-y-3">
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full border border-border bg-background px-3 py-2.5 text-sm">
          {REQUEST_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <input type="number" min={0} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Precio cotizado (COP)" className="w-full border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" />
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} maxLength={1000} placeholder="Respuesta para el cliente (opcional)" className="w-full resize-none border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" />
        <Button className="w-full" onClick={save} disabled={saving}>{saving ? "Guardando…" : "Guardar y responder"}</Button>
      </div>
    </article>
  );
}
