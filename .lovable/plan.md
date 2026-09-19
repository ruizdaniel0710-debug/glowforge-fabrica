# Plan: tienda SNAKELAB

## Objetivo
Crear una tienda de productos impresos en 3D inspirada en la referencia: estética industrial oscura, acentos rojos, iluminación cian y una impresora 3D como foco visual.

## Qué voy a construir
- Portada a pantalla completa con la impresora 3D, marca SNAKELAB, navegación y acceso al catálogo.
- Sección de cuatro productos variados con imágenes propias y tarjetas interactivas BorderGlow.
- Página individual para cada producto con imagen, descripción, precio, selector de cantidad y compra.
- Carrito lateral desplegable, disponible desde la cabecera, con cantidades, eliminación y total.
- Navegación adaptable a móvil y escritorio, manteniendo el mismo estilo visual.

## Detalles técnicos
- Catálogo compartido y rutas dinámicas `/producto/$slug`.
- Estado del carrito compartido durante la sesión del navegador.
- Integración local del efecto BorderGlow proporcionado, adaptado al sistema visual de SNAKELAB.
- Metadatos únicos para portada y producto, y verificación visual en escritorio y móvil.
