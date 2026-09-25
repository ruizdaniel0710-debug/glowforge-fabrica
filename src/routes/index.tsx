import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowDown, ArrowRight, Box, Layers3, Ruler } from "lucide-react";
import heroPrintingVideo from "@/assets/snakelab-hero-printing.mp4";

import { CustomOrder } from "@/components/custom-order";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { listProducts } from "@/lib/catalog.functions";

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
  loader: () => listProducts(),
  component: Index,
});

// IMPORTANT: Replace this placeholder. See ./README.md for routing conventions.
function Index() {
  const products = Route.useLoaderData();

  return (
    <main className="relative">
      {/* Floating WhatsApp Button */}
      <a 
        href="https://wa.me/573214403628" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg hover:scale-110 hover:shadow-xl transition-all duration-300"
        title="Contáctanos en WhatsApp"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
        </svg>
      </a>

      <section className="hero-shell relative min-h-[92svh] overflow-hidden border-b border-border pt-18">
        <video
          className="hero-media absolute inset-0 h-full w-full object-cover object-center"
          autoPlay
          loop
          muted
          playsInline
          aria-label="Impresora 3D SNAKELAB fabricando un dragón mecánico"
        >
          <source src={heroPrintingVideo} type="video/mp4" />
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
            <div className="flex flex-wrap gap-4 mt-8">
              <Button size="lg" asChild><Link to="/" hash="productos">Explorar productos <ArrowRight className="ml-2 w-4 h-4" /></Link></Button>
              <Button size="lg" variant="outline" className="gap-2 bg-transparent hover:bg-white/5 border-white/20 text-white" asChild>
                <a href="https://www.instagram.com/snakelab.site/" target="_blank" rel="noopener noreferrer">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                  Instagram
                </a>
              </Button>
            </div>
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


    </main>
  );
}
