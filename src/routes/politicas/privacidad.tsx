import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/politicas/privacidad')({
  component: PrivacidadComponent,
})

function PrivacidadComponent() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-24 text-white">
      <h1 className="text-4xl font-display font-bold mb-8">Política de Privacidad</h1>
      <div className="prose prose-invert max-w-none text-gray-300">
        <p className="mb-4">En SNAKELAB, nos tomamos muy en serio la privacidad de tus datos.</p>
        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">Uso de la Información</h2>
        <p className="mb-4">La información recopilada se utiliza exclusivamente para procesar tus pedidos, personalizar tu experiencia, mejorar nuestro servicio y comunicarnos contigo acerca de actualizaciones importantes o promociones.</p>
        <h2 className="text-2xl font-semibold text-white mt-8 mb-4">Protección de Datos</h2>
        <p className="mb-4">Implementamos estrictas medidas de seguridad técnicas y administrativas para proteger tu información personal contra pérdidas, robos, accesos no autorizados y divulgación.</p>
        <p className="mt-8 text-sm text-gray-500">Última actualización: Septiembre de 2026</p>
      </div>
    </div>
  )
}
