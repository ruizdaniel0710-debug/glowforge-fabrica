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
];

export const formatPrice = (price: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(price);

export const getProduct = (slug: string) => products.find((product) => product.slug === slug);
