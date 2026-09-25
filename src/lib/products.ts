export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  comparePrice?: number;
  shortDescription: string;
  description: string;
  material: string;
  dimensions: string;
  image: string;
  images: string[];
  colors?: string[];
  sizes?: string[];
  productionDays?: number;
};

export const products: Product[] = [
  {
    id: "18",
    slug: "flexi-animals",
    name: "Flexi Animals",
    category: "Tendencia",
    price: 6000,
    comparePrice: 10000,
    shortDescription: "Colección de adorables animales articulados y flexibles.",
    description: "**Flexi Animals** es una colección de adorables animales articulados y flexibles, pensados para jugar, coleccionar y regalar.",
    material: "PLA",
    dimensions: "Varios tamaños",
    image: "/uploads/images/cover_image-1788283929064-462217625.jpg",
    images: [
      "/uploads/images/cover_image-1788283929064-462217625.jpg",
      "/uploads/images/images-1788283479368-430813442.jpg"
    ],
    colors: ["#808080", "#c4a35a", "#1a1a2e", "#ff5f57"],
    sizes: ["10cm", "15cm", "20cm", "30cm"],
    productionDays: 4,
  },
  {
    id: "19",
    slug: "soporte-para-mandos-ps5-xbox",
    name: "Soporte para Mandos PS5 - XBOX",
    category: "Soportes para Controles",
    price: 30000,
    comparePrice: 60000,
    shortDescription: "Soportes para mantener tus controles organizados y seguros.",
    description: "**Soportes para Mandos PS5 y Xbox** diseñados para mantener tus controles organizados, seguros y siempre a la mano.",
    material: "PLA",
    dimensions: "Estándar",
    image: "/uploads/images/cover_image-1789499680778-774100578.jpg",
    images: [
      "/uploads/images/cover_image-1789499680778-774100578.jpg",
      "/uploads/images/images-1789499681569-472731152.jpg",
      "/uploads/images/images-1789499681691-499192089.jpg",
      "/uploads/images/images-1789499681779-919773570.jpg",
      "/uploads/images/images-1789499681825-949358512.jpg",
      "/uploads/images/images-1789499681898-288281121.jpg"
    ],
    colors: ["#e53935", "#1565c0", "#000000"],
    sizes: ["Estándar"],
    productionDays: 4,
  },
  {
    id: "20",
    slug: "figuras-estilo-crochet",
    name: "Figuras estilo crochet",
    category: "Tendencia",
    price: 55000,
    comparePrice: 70000,
    shortDescription: "Hermosas figuras coleccionables impresas con textura estilo crochet.",
    description: "Figuras con un acabado especial que imita el tejido de crochet, combinando la precisión de la impresión 3D con un look artesanal.",
    material: "PLA",
    dimensions: "12cm - 20cm",
    image: "/uploads/images/cover_image-1789500289203-967354465.jpg",
    images: [
      "/uploads/images/cover_image-1789500289203-967354465.jpg",
      "/uploads/images/images-1789500289315-194773776.jpg",
      "/uploads/images/images-1789500289358-8930894.jpg",
      "/uploads/images/images-1789500289415-99380394.jpg",
      "/uploads/images/images-1789500289454-34106740.jpg",
      "/uploads/images/images-1789500289499-595147197.jpg"
    ],
    colors: ["#fdd835", "#ffffff"],
    sizes: ["12cm", "15cm", "20cm"],
    productionDays: 3,
  },
  {
    id: "21",
    slug: "pato-verso",
    name: "Pato Verso",
    category: "Tendencia",
    price: 70000,
    comparePrice: 90000,
    shortDescription: "Colección única de patos con estilos y temáticas diferentes.",
    description: "Una serie de patos coleccionables únicos en su estilo, impresos en alta calidad para decorar cualquier espacio.",
    material: "PLA, Resina",
    dimensions: "10cm - 20cm",
    image: "/uploads/images/images-1789501359680-519572941.jpg",
    images: [
      "/uploads/images/images-1789501359680-519572941.jpg",
      "/uploads/images/images-1789501359543-643301763.jpg",
      "/uploads/images/images-1789501359745-211558234.jpg",
      "/uploads/images/images-1789501359772-793551024.jpg",
      "/uploads/images/images-1789501359810-548197441.jpg"
    ],
    colors: ["#ff9800", "#000000", "#ffffff"],
    sizes: ["10cm", "15cm", "20cm"],
    productionDays: 4,
  },
  {
    id: "22",
    slug: "clickers",
    name: "Clickers",
    category: "Tendencia",
    price: 35000,
    comparePrice: 45000,
    shortDescription: "Figuras inspiradas en la popular serie, con gran nivel de detalle.",
    description: "Figuras hiperrealistas inspiradas en los infectados Clickers, con texturas y formas que replican los detalles escalofriantes.",
    material: "PLA",
    dimensions: "15cm - 40cm",
    image: "/uploads/images/cover_image-1789499887434-656579980.jpg",
    images: [
      "/uploads/images/cover_image-1789499887434-656579980.jpg",
      "/uploads/images/images-1789499887473-549896768.jpg",
      "/uploads/images/images-1789499887524-547486980.jpg",
      "/uploads/images/images-1789499887570-110345139.jpg"
    ],
    colors: ["#e53935", "#7b1fa2", "#00bcd4", "#4caf50", "#ff9800", "#212121"],
    sizes: ["15cm", "25cm", "40cm"],
    productionDays: 2,
  },
  {
    id: "23",
    slug: "porta-vasos-latas",
    name: "Porta Vasos/Latas",
    category: "Decoración",
    price: 40000,
    comparePrice: 55000,
    shortDescription: "Portavasos temáticos y funcionales impresos en 3D.",
    description: "Portavasos con diseños únicos para mantener tus bebidas seguras y darle estilo a tu mesa.",
    material: "PLA",
    dimensions: "10cm - 15cm",
    image: "/uploads/images/cover_image-1789501887196-304273610.jpg",
    images: [
      "/uploads/images/cover_image-1789501887196-304273610.jpg",
      "/uploads/images/images-1789501887248-917784353.jpg",
      "/uploads/images/images-1789501887285-342221849.jpg",
      "/uploads/images/images-1789501887352-364896044.jpg",
      "/uploads/images/images-1789501887406-106717595.jpg"
    ],
    colors: ["#795548", "#4caf50", "#8d6e63"],
    sizes: ["10cm", "15cm"],
    productionDays: 3,
  },
  {
    id: "24",
    slug: "tu-diseno-personalizado",
    name: "Tu Diseño Personalizado",
    category: "Personalizados",
    price: 50000,
    comparePrice: undefined,
    shortDescription: "Envíanos tu idea o archivo 3D y lo hacemos realidad.",
    description: "Envíanos tu idea o archivo 3D y lo hacemos realidad. Cotización según complejidad y tamaño.",
    material: "PLA, PETG, Resina, TPU",
    dimensions: "Según diseño",
    image: "/uploads/images/custom.jpg",
    images: [
      "/uploads/images/custom.jpg"
    ],
    colors: ["#9c27b0", "#00bcd4", "#ff5722", "#4caf50"],
    sizes: ["Según diseño"],
    productionDays: 7,
  }
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
