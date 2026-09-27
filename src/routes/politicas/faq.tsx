import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/politicas/faq')({
  component: FaqComponent,
})

function FaqComponent() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-24 text-white">
      <h1 className="text-4xl font-display font-bold mb-8">Preguntas Frecuentes</h1>
      <div className="prose prose-invert max-w-none text-gray-300 space-y-8">
        <div>
          <h2 className="text-2xl font-semibold text-white mb-2">¿Qué materiales utilizan?</h2>
          <p>Utilizamos principalmente PLA (Ácido Poliláctico), un plástico biodegradable y amigable con el medio ambiente, ideal para objetos decorativos y funcionales. También utilizamos PETG, Resina o TPU dependiendo del pedido personalizado.</p>
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-white mb-2">¿Puedo pedir algo que no está en el catálogo?</h2>
          <p>¡Por supuesto! Tenemos una sección de "Cotización Personalizada" donde puedes adjuntar imágenes de referencia o archivos 3D (.stl) y te enviaremos una cotización detallada.</p>
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-white mb-2">¿Cuánto demora mi pedido?</h2>
          <p>Al ser productos fabricados bajo demanda mediante impresión 3D, cada producto requiere un tiempo de producción (indicado en los detalles de cada producto), generalmente entre 2 y 5 días. Tras finalizar, el envío demora de 1 a 3 días hábiles.</p>
        </div>
      </div>
    </div>
  )
}
