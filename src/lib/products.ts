import astronautImage from "@/assets/product-astronaut.jpg";
import dragonImage from "@/assets/product-dragon.jpg";
import organizerImage from "@/assets/product-organizer.jpg";
import planterImage from "@/assets/product-planter.jpg";

export type Product = {
  slug: string;
  name: string;
  category: string;
  price: number;
  shortDescription: string;
  description: string;
  material: string;
  dimensions: string;
  image: string;
};

export const products: Product[] = [
  {
    slug: "dragon-articulado",
    name: "Dragón Articulado Crystal",
    category: "Coleccionables",
    price: 45000,
    shortDescription: "Dragón flexible articulado, uno de los modelos más vendidos del mundo maker.",
    description:
      "El clásico dragón articulado de los mercados de impresión 3D: cuerpo segmentado que se mueve con total fluidez, sin soportes ni ensamblaje. Impreso en PLA de alta calidad, ideal como pieza de escritorio o regalo.",
    material: "PLA premium",
    dimensions: "30 × 12 × 8 cm",
    image: dragonImage,
  },
  {
    slug: "maceta-auto-riego",
    name: "Maceta Auto Riego Geométrica",
    category: "Hogar",
    price: 35000,
    shortDescription: "Maceta facetada con sistema de autorriego por mecha, muy popular en impresión 3D.",
    description:
      "Maceta de diseño geométrico con depósito de autorriego: el recipiente interior queda suspendido sobre la reserva de agua y la planta absorbe la humedad que necesita. Un modelo probado y reproducido por miles de impresoras en todo el mundo.",
    material: "PLA resistente a humedad",
    dimensions: "15 × 15 × 13 cm",
    image: planterImage,
  },
  {
    slug: "organizador-hexagonal",
    name: "Organizador Hexagonal Modular",
    category: "Escritorio",
    price: 55000,
    shortDescription: "Sistema modular de almacenamiento para escritorio, impreso pieza a pieza.",
    description:
      "Organizador de escritorio de celdas hexagonales apilables y conectables, inspirado en los sistemas modulares más vendidos en tiendas de impresión 3D. Configura tu propia distribución para herramientas, cables y accesorios.",
    material: "PETG técnico",
    dimensions: "30 × 10 × 12 cm",
    image: organizerImage,
  },
  {
    slug: "casco-astronauta",
    name: "Figura Astronauta Lunar",
    category: "Decoración",
    price: 60000,
    shortDescription: "Figura decorativa de astronauta sobre la luna, decoración trending de impresión 3D.",
    description:
      "Figura decorativa de astronauta apoyado sobre una luna craterizada: uno de los diseños más replicados y vendidos en plataformas de modelos 3D. Acabado en dos tonos para resaltar el visor y la superficie lunar.",
    material: "PLA seda y mate",
    dimensions: "20 × 18 × 25 cm",
    image: astronautImage,
  },
  {
    slug: "pulpo-articulado",
    name: "Pulpo Articulado Fidget",
    category: "Coleccionables",
    price: 28000,
    shortDescription: "Pulpo flexible con tentáculos móviles, un clásico anti-estrés impreso en una sola pieza.",
    description:
      "Pulpo articulado impreso en una sola pieza, sin ensamblaje: cada tentáculo se dobla y gira con suavidad. Uno de los modelos más descargados e impresos del mundo maker, ideal como juguete sensorial o regalo de escritorio.",
    material: "PLA seda",
    dimensions: "12 × 12 × 6 cm",
    image: dragonImage,
  },
  {
    slug: "lampara-espiral",
    name: "Lámpara Espiral Vase Mode",
    category: "Hogar",
    price: 52000,
    shortDescription: "Pantalla impresa en modo espiral que difunde la luz cálida en patrones suaves.",
    description:
      "Pantalla de lámpara impresa en vase mode: una sola pared continua que deja pasar la luz creando un patrón espiral en la pared. Compatible con portalámparas E27 y bombillas LED de bajo calor.",
    material: "PLA translúcido",
    dimensions: "16 × 16 × 24 cm",
    image: planterImage,
  },
  {
    slug: "soporte-audifonos",
    name: "Soporte de Audífonos Minimal",
    category: "Escritorio",
    price: 32000,
    shortDescription: "Soporte de escritorio para audífonos con base antideslizante y paso de cable.",
    description:
      "Soporte en voladizo para audífonos con base contrapesada, superficie de contacto ancha para no marcar la diadema y canal trasero para recoger el cable. Impreso en PETG para resistir el uso diario.",
    material: "PETG técnico",
    dimensions: "12 × 10 × 28 cm",
    image: organizerImage,
  },
  {
    slug: "portalapices-engranajes",
    name: "Portalápices de Engranajes",
    category: "Decoración",
    price: 38000,
    shortDescription: "Portalápices con engranajes funcionales que giran al mover la pieza superior.",
    description:
      "Portalápices con mecanismo de engranajes impresos y ensamblados en sitio: al girar el anillo superior todo el tren de engranajes se mueve. Pieza de exhibición para escritorios de ingeniería y diseño.",
    material: "PLA mate bicolor",
    dimensions: "11 × 11 × 14 cm",
    image: astronautImage,
  },
];

export const formatPrice = (price: number) =>
  price <= 0
    ? "A cotizar"
    : new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(price);

export const getProduct = (slug: string) => products.find((product) => product.slug === slug);
