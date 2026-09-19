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
    slug: "dragon-cyber",
    name: "Dragón Cyber",
    category: "Coleccionables",
    price: 189000,
    shortDescription: "Figura articulada de alto detalle en acabado dual.",
    description:
      "Una pieza articulada de gran formato, impresa por secciones para lograr movimiento fluido y detalles mecánicos definidos. Cada unidad se ensambla y revisa a mano.",
    material: "PLA+ mate",
    dimensions: "32 × 24 × 20 cm",
    image: dragonImage,
  },
  {
    slug: "maceta-orbita",
    name: "Maceta Órbita",
    category: "Hogar",
    price: 69000,
    shortDescription: "Geometría modular para plantas de interior.",
    description:
      "Maceta facetada con recipiente interior removible y drenaje integrado. Su textura de capas aporta un acabado técnico que contrasta con el follaje natural.",
    material: "PLA reciclado",
    dimensions: "16 × 16 × 14 cm",
    image: planterImage,
  },
  {
    slug: "dock-nexus",
    name: "Dock Nexus",
    category: "Escritorio",
    price: 119000,
    shortDescription: "Organizador modular para tu estación creativa.",
    description:
      "Un sistema compacto para mantener herramientas, notas y accesorios en orden. Sus módulos encajan entre sí y permiten adaptar la distribución a tu espacio.",
    material: "PETG técnico",
    dimensions: "28 × 12 × 15 cm",
    image: organizerImage,
  },
  {
    slug: "casco-apollo",
    name: "Casco Apollo",
    category: "Decoración",
    price: 149000,
    shortDescription: "Busto espacial con acabado de colección.",
    description:
      "Escultura decorativa inspirada en la exploración espacial, producida en varias piezas para conservar líneas limpias y una presencia contundente.",
    material: "PLA seda y mate",
    dimensions: "21 × 18 × 26 cm",
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