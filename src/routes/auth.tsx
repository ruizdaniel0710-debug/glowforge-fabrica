import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Acceso administrador — SNAKELAB" },
      { name: "description", content: "Ingreso al panel de administración de SNAKELAB." },
      { property: "og:title", content: "Acceso — SNAKELAB" },
      { property: "og:description", content: "Ingreso al panel de administración de SNAKELAB." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMsg("Correo o contraseña incorrectos.");
      else navigate({ to: "/admin" });
    } else {
      const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/admin` } });
      setMsg(error ? error.message : "Revisa tu correo para confirmar la cuenta.");
    }
    setLoading(false);
  };

  return (
    <main className="mx-auto max-w-sm px-5 pb-24 pt-36">
      <p className="eyebrow mb-4">Panel SNAKELAB</p>
      <h1 className="font-display text-4xl font-bold uppercase">{mode === "in" ? "Ingresar" : "Crear cuenta"}</h1>
      <form onSubmit={submit} className="mt-8 space-y-3">
        <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Correo" className="w-full border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary" />
        <input required type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña" className="w-full border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary" />
        <Button type="submit" className="w-full" disabled={loading}>{mode === "in" ? "Ingresar" : "Registrarme"}</Button>
      </form>
      {msg && <p className="mt-3 text-sm text-primary">{msg}</p>}
      <button type="button" onClick={() => setMode(mode === "in" ? "up" : "in")} className="mt-5 text-sm text-muted-foreground underline">
        {mode === "in" ? "¿No tienes cuenta? Regístrate" : "Ya tengo cuenta"}
      </button>
    </main>
  );
}
