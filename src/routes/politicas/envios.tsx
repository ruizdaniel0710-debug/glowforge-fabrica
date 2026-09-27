import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/politicas/envios')({
  component: EnviosComponent,
})

function EnviosComponent() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-24 text-white">
      <h1 className="text-4xl font-display font-bold mb-8">Política de Envíos</h1>
      <div className="prose prose-invert max-w-none text-gray-300">
        <p className="mb-4">En SNAKELAB realizamos envíos a todo el territorio nacional.</p>
        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">Tiempos de Despacho</h2>
        <p className="mb-4">Nuestros productos de impresión 3D se fabrican bajo demanda. El tiempo estándar de producción está indicado en la página de cada producto (generalmente entre 2 y 5 días hábiles). Una vez terminado el producto, el envío tarda entre 1 y 3 días hábiles adicionales dependiendo de tu ubicación.</p>
        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">Costos de Envío</h2>
        <p className="mb-4">El costo de envío se calculará automáticamente durante el proceso de pago al ingresar tu dirección.</p>
        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">Seguimiento</h2>
        <p className="mb-4">Una vez tu pedido sea despachado, recibirás un número de guía con el cual podrás rastrear tu paquete desde nuestra página de Seguimiento.</p>
      </div>
    </div>
  )
}
