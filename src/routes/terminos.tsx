import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/terminos")({
  head: () => ({
    meta: [{ title: "Términos y Privacidad — SNAKELAB" }],
  }),
  component: LegalPage,
});

function LegalPage() {
  return (
    <main className="min-h-screen pt-24 pb-12 px-5 max-w-4xl mx-auto font-sans text-gray-300">
      <Link to="/" className="text-primary hover:underline mb-8 inline-block">&larr; Volver a la tienda</Link>
      
      <h1 className="text-3xl font-display font-bold text-white mb-8">Términos y Condiciones / Política de Privacidad</h1>
      
      <section className="mb-10 space-y-4">
        <h2 className="text-xl font-bold text-white border-b border-white/10 pb-2">1. Política de Tratamiento de Datos Personales (Ley 1581 de 2012)</h2>
        <p>
          En cumplimiento con la Ley 1581 de 2012 y el Decreto 1377 de 2013 de Colombia (Habeas Data), 
          te informamos que los datos personales que suministres en este sitio (nombre, correo, celular, 
          ciudad y dirección) serán utilizados única y exclusivamente para:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>Procesar, cotizar y enviar tus pedidos impresos en 3D.</li>
          <li>Comunicarnos contigo respecto al estado de tu solicitud o compra.</li>
          <li>Cumplir con obligaciones tributarias y logísticas de envío.</li>
        </ul>
        <p>
          Tus datos <strong>no</strong> serán vendidos, compartidos ni utilizados para enviar spam. 
          Como titular, tienes derecho a conocer, actualizar, rectificar y solicitar la eliminación 
          de tus datos enviando un correo al administrador de SNAKELAB.
        </p>
      </section>

      <section className="mb-10 space-y-4">
        <h2 className="text-xl font-bold text-white border-b border-white/10 pb-2">2. Propiedad Intelectual y Modelos 3D</h2>
        <p>
          Al usar nuestro servicio de <strong>cotización de impresión 3D a medida</strong>, el cliente 
          declara tener los derechos de impresión o uso personal sobre el archivo (.STL, .OBJ, etc.) proporcionado.
        </p>
        <p>
          En el catálogo de la tienda, <strong>SNAKELAB cobra única y exclusivamente por el servicio 
          de manufactura, horas de impresión, materiales utilizados (PLA, PETG, etc.), y post-procesado</strong>, 
          y no por la propiedad intelectual o derechos de autor de diseños de terceros o franquicias. 
          Cualquier figura basada en cultura pop es un "Fan Art" y se considera como un servicio 
          de impresión bajo demanda por parte del cliente.
        </p>
      </section>

      <section className="mb-10 space-y-4">
        <h2 className="text-xl font-bold text-white border-b border-white/10 pb-2">3. Envíos y Tiempos de Producción</h2>
        <p>
          Dado que operamos con tecnología de impresión 3D capa por capa, cada pieza es fabricada 
          bajo demanda tras la confirmación del pago.
        </p>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>Los tiempos de producción varían entre 2 a 7 días hábiles según la cola de impresión y la complejidad.</li>
          <li>La calidad de la superficie incluirá las líneas características del proceso FDM (Modelado por Deposición Fundida).</li>
          <li>Una vez despachado el paquete, el tiempo de entrega depende de la transportadora a nivel nacional.</li>
        </ul>
      </section>
      
      <section className="mb-10 space-y-4">
        <h2 className="text-xl font-bold text-white border-b border-white/10 pb-2">4. Garantías y Devoluciones</h2>
        <p>
          Ofrecemos garantía por defectos graves de fabricación que impidan la función de la pieza. 
          No nos hacemos responsables por daños causados durante el envío o por el mal uso/caídas 
          que el cliente le dé a los objetos de plástico. En caso de piezas frágiles, el cliente 
          asume el riesgo de transporte aunque garantizamos el mejor embalaje posible.
        </p>
      </section>
      
    </main>
  );
}
