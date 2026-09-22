import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { FileUp, Trash2, UploadCloud } from "lucide-react";
import { useCart } from "@/components/cart-context";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/products";
import customImage from "@/assets/product-organizer.jpg";

const ACCEPTED = ".stl,.obj,.3mf,.step,.stp,.zip,image/*";
const MAX_FILES = 8;
const MAX_SIZE = 25 * 1024 * 1024;

const formatSize = (bytes: number) =>
  bytes > 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

export function CustomOrder() {
  const { addItem } = useCart();
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const mergeFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const list = Array.from(incoming);
    const tooBig = list.find((file) => file.size > MAX_SIZE);
    if (tooBig) {
      setError(`"${tooBig.name}" supera los 25 MB. Comprímelo en .zip e inténtalo de nuevo.`);
      return;
    }
    setError(null);
    setFiles((current) => {
      const next = [...current];
      for (const file of list) {
        if (next.length >= MAX_FILES) break;
        if (!next.some((item) => item.name === file.name && item.size === file.size)) next.push(file);
      }
      return next;
    });
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    mergeFiles(event.dataTransfer.files);
  };

  const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
    mergeFiles(event.target.files);
    event.target.value = "";
  };

  const submit = () => {
    if (files.length === 0) {
      setError("Sube al menos una foto o un archivo 3D para pedir la cotización.");
      return;
    }
    const trimmedNotes = notes.trim().slice(0, 600);
    const product: Product = {
      slug: `personalizado-${Date.now()}`,
      name: "Pedido personalizado",
      category: "Personalizado",
      price: 0,
      shortDescription: `${files.length} archivo${files.length > 1 ? "s" : ""}: ${files.map((file) => file.name).join(", ")}`,
      description: trimmedNotes || "Sin notas adicionales.",
      material: "Por definir",
      dimensions: "Por definir",
      image: customImage,
    };
    addItem(product);
    setFiles([]);
    setNotes("");
    setError(null);
  };

  return (
    <div className="grid gap-8 border border-border bg-card p-6 lg:grid-cols-[1.1fr_1fr] lg:p-10">
      <div>
        <p className="eyebrow mb-4">Serie 000 — A tu medida</p>
        <h3 className="font-display text-4xl font-bold uppercase leading-none md:text-5xl">
          Tu idea,<br /><span className="text-primary">impresa.</span>
        </h3>
        <p className="mt-5 max-w-md text-sm leading-6 text-muted-foreground">
          Sube tus fotos de referencia o tus archivos 3D (STL, OBJ, 3MF, STEP) y te enviamos una cotización con material,
          tiempo de impresión y precio final.
        </p>
        <ul className="mt-6 space-y-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          <li>01 / Revisión del modelo sin costo</li>
          <li>02 / Respuesta en menos de 24 horas</li>
          <li>03 / Hasta 8 archivos, 25 MB cada uno</li>
        </ul>
      </div>

      <div>
        <div
          onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center border border-dashed px-5 py-10 text-center transition-colors ${dragging ? "border-primary bg-primary/5" : "border-border bg-background/60"}`}
        >
          <UploadCloud className="size-7 text-primary" strokeWidth={1.4} />
          <p className="mt-4 text-sm text-foreground">Arrastra tus fotos o archivos STL aquí</p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">STL · OBJ · 3MF · STEP · JPG · PNG</p>
          <Button type="button" variant="outline" className="mt-5" onClick={() => inputRef.current?.click()}>
            <FileUp /> Seleccionar archivos
          </Button>
          <input ref={inputRef} type="file" multiple accept={ACCEPTED} onChange={handleInput} className="sr-only" aria-label="Subir fotos o archivos 3D" />
        </div>

        {files.length > 0 && (
          <ul className="mt-4 divide-y divide-border border border-border">
            {files.map((file) => (
              <li key={`${file.name}-${file.size}`} className="flex items-center justify-between gap-3 px-3 py-2.5">
                <span className="min-w-0 flex-1 truncate text-sm">{file.name}</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{formatSize(file.size)}</span>
                <button type="button" onClick={() => setFiles((current) => current.filter((item) => item !== file))} aria-label={`Quitar ${file.name}`} className="text-muted-foreground transition-colors hover:text-primary">
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <textarea
          value={notes}
          maxLength={600}
          onChange={(event) => setNotes(event.target.value)}
          rows={4}
          placeholder="Cuéntanos tamaño, color, material o cantidad que necesitas."
          className="mt-4 w-full resize-none border border-border bg-background/60 px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
        />

        {error && <p className="mt-3 text-sm text-primary">{error}</p>}

        <Button className="mt-4 w-full" onClick={submit}>Pedir cotización</Button>
        <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Precio a confirmar tras revisar los archivos</p>
      </div>
    </div>
  );
}
