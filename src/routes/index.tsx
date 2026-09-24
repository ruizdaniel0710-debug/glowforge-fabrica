import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowDown, ArrowRight, Box, Layers3, Ruler } from "lucide-react";
import heroImage from "@/assets/snakelab-hero.jpg";
import heroPrintingVideo from "@/assets/snakelab-hero-printing.mp4.asset.json";
import { CustomOrder } from "@/components/custom-order";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { products } from "@/lib/products";

// No head() here: the home route inherits title/description/og/twitter from
// __root.tsx, and ships no og:image so serve-time hosting can inject the
// project's social preview (explicit og:image or latest screenshot).
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SNAKELAB — Objetos impresos en 3D" },
      { name: "description", content: "Piezas impresas en 3D con carácter: coleccionables, decoración y objetos funcionales." },
      { property: "og:title", content: "SNAKELAB — Objetos impresos en 3D" },
      { property: "og:description", content: "Piezas impresas en 3D con carácter, diseñadas y fabricadas capa por capa." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

// IMPORTANT: Replace this placeholder. See ./README.md for routing conventions.
function Index() {
  return (
    <main>
      <section className="hero-shell relative min-h-[92svh] overflow-hidden border-b border-border pt-18">
        <video
          className="hero-media absolute inset-0 h-full w-full object-cover object-center"
          autoPlay
          loop
          muted
          playsInline
          poster={heroImage}
          aria-label="Impresora 3D SNAKELAB fabricando un dragón mecánico"
        >
          <source src={heroPrintingVideo.url} type="video/mp4" />
        </video>
        <div className="hero-vignette absolute inset-0" />
        <div className="hero-grid absolute inset-0 opacity-30" />
        <div className="relative z-10 mx-auto flex min-h-[calc(92svh-4.5rem)] max-w-7xl flex-col justify-between px-5 py-10 lg:px-8 lg:py-14">
          <div className="flex justify-between gap-6">
            <div className="hidden items-start gap-3 sm:flex"><span className="mt-1.5 size-2 rounded-full bg-primary shadow-signal"/><p className="font-mono text-[10px] uppercase leading-5 tracking-[0.18em] text-muted-foreground">Sistema en línea<br/>Bogotá, COL</p></div>
            <p className="ml-auto max-w-[220px] text-right font-mono text-[10px] uppercase leading-5 tracking-[0.18em] text-muted-foreground">Diseño digital<br/>Fabricación física</p>
          </div>
          <div className="max-w-3xl py-16 md:py-24">
            <p className="eyebrow mb-5">Laboratorio de impresión 3D</p>
            <h1 className="font-display text-[clamp(4rem,12vw,10rem)] font-extrabold uppercase leading-[0.72]">Ideas que<br/><span className="text-outline">toman forma.</span></h1>
            <p className="mt-8 max-w-md text-base leading-7 text-muted-foreground md:text-lg">Objetos con carácter, fabricados capa por capa. Diseñamos lo imposible y lo convertimos en algo que puedes tocar.</p>
            <Button size="lg" className="mt-8" asChild><Link to="/" hash="productos">Explorar productos <ArrowRight /></Link></Button>
          </div>
          <div className="flex items-end justify-between border-t border-border/60 pt-5">
            <div className="flex gap-8 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground"><span>PLA / PETG</span><span className="hidden sm:inline">Precisión 0.12 mm</span><span className="hidden sm:inline">Hecho en Colombia</span></div>
            <ArrowDown className="size-5 animate-bounce text-primary" />
          </div>
        </div>
      </section>

      <section id="productos" className="scroll-mt-18 px-5 py-24 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
            <div><p className="eyebrow mb-4">Serie 001 — Catálogo</p><h2 className="font-display text-5xl font-bold uppercase md:text-7xl">Piezas <span className="text-muted-foreground">destacadas</span></h2></div>
            <p className="max-w-sm text-sm leading-6 text-muted-foreground">Colecciones pequeñas, acabados precisos y objetos pensados para durar más allá de la tendencia.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product, index) => <ProductCard key={product.slug} product={product} index={index} />)}
          </div>
        </div>
      </section>

      <section id="personalizado" className="scroll-mt-18 border-t border-border px-5 pb-24 lg:px-8 lg:pb-32">
        <div className="mx-auto max-w-7xl pt-20 lg:pt-24">
          <CustomOrder />
        </div>
      </section>

      <section id="proceso" className="scroll-mt-18 border-y border-border bg-secondary/40">
        <div className="mx-auto grid max-w-7xl md:grid-cols-[0.9fr_1.1fr]">
          <div className="border-b border-border px-5 py-20 md:border-b-0 md:border-r lg:px-8 lg:py-28">
            <p className="eyebrow mb-5">De píxeles a materia</p><h2 className="font-display text-5xl font-bold uppercase leading-none md:text-7xl">Capa.<br/>Precisión.<br/><span className="text-primary">Objeto.</span></h2>
          </div>
          <div className="divide-y divide-border">
            {[{n:"01", icon:Ruler, title:"Diseño", text:"Modelamos y preparamos cada geometría para una fabricación precisa."},{n:"02", icon:Layers3, title:"Impresión", text:"Calibramos material, temperatura y resolución para cada pieza."},{n:"03", icon:Box, title:"Acabado", text:"Revisamos, ensamblamos y empacamos cada objeto individualmente."}].map((step) => (
              <div key={step.n} className="grid grid-cols-[44px_1fr_auto] items-start gap-4 px-5 py-8 lg:px-10">
                <span className="font-mono text-xs text-primary">{step.n}</span><div><h3 className="font-display text-2xl font-semibold uppercase">{step.title}</h3><p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{step.text}</p></div><step.icon className="size-6 text-muted-foreground" strokeWidth={1.2}/>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="px-5 py-10 lg:px-8"><div className="mx-auto flex max-w-7xl flex-col gap-5 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between"><p className="font-display text-xl font-bold tracking-[0.15em]">SNAKE<span className="text-primary">LAB</span></p><p className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">© 2026 — Fabricado capa por capa</p></div></footer>
    </main>
  );
}
