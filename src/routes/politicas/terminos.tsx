import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/politicas/terminos')({
  component: TerminosComponent,
})

function TerminosComponent() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-24 text-white">
      <h1 className="text-4xl font-display font-bold mb-8">Términos y Condiciones</h1>
      <div className="prose prose-invert max-w-none text-gray-300">
        <p className="mb-4">Al acceder y utilizar el sitio web de SNAKELAB, aceptas los siguientes términos y condiciones.</p>
        
        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">1. Productos y Naturaleza de la Impresión 3D</h2>
        <p className="mb-4">Nuestros productos son fabricados mediante tecnología de impresión 3D FDM o Resina. Debido a la naturaleza de este proceso de manufactura capa por capa, los productos pueden presentar líneas de impresión visibles y ligeras imperfecciones menores que no afectan la integridad estructural ni la estética general de la pieza. Cada pieza es única.</p>
        
        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">2. Políticas de Devolución</h2>
        <p className="mb-4">Se aceptan devoluciones únicamente en caso de defectos estructurales o daños ocurridos durante el envío, reportados dentro de los 3 días posteriores a la recepción del pedido con su respectiva evidencia fotográfica.</p>
        <p className="mb-4">No se aceptan devoluciones en pedidos de piezas personalizadas.</p>
        
        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">3. Modificaciones</h2>
        <p className="mb-4">SNAKELAB se reserva el derecho de modificar los precios y el catálogo de productos en cualquier momento sin previo aviso.</p>
      </div>
    </div>
  )
}
