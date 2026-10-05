# 💈 Roneo Barber Cosmetics — Catálogo Web Móvil

Catálogo interactivo y visual tipo *mobile-first e-commerce* para **Roneo Barber Cosmetics**, diseñado específicamente para pantallas de smartphone (iPhone y Android) con estética oscura premium de barbería y checkout directo al chat de Instagram (`https://ig.me/m/roneo_barber`).

---

## 🚀 Características Implementadas

1. **Cabecera Explicativa Integrada:**
   - Mensaje destacado en la parte superior:  
     > *"Para comprar, añade los productos que quieras al carrito y pulsa en finalizar. Se abrirá automáticamente un mensaje de Instagram listo para enviar con tu pedido para recoger y pagar en mano en la barbería."*

2. **Listado de Productos Oficiales (Cuadrícula Móvil 2 Columnas):**
   - **Keratina Líquida** — `10 €` (Tratamiento reconstructor y antifrizz)
   - **Cera Brillo** — `15 €` (Pomada fijación media-fuerte con brillo clásico)
   - **Crema Rizos** — `10 €` (Definición e hidratación sin apelmazar)
   - **Cera Mate** — `15 €` (Pasta fijación fuerte y acabado mate seco)
   - **Beard & Body Machine** — `35 €` (Recortadora profesional T-Blade con batería de litio)

3. **Experiencia de Carrito de Compras Móvil:**
   - Botón directo de `Añadir` en cada tarjeta de producto.
   - Controles de cantidad interactivos (`-` `1` `+`) directamente en la tarjeta una vez añadido.
   - **Barra flotante inferior adhesiva** con indicador de cantidad animado (*badge bounce*), total acumulado y botón `Ver Carrito`.
   - **Cesta estilo Drawer / Bottom Sheet iOS**: Deslizable hacia arriba con desglose por producto, selector de cantidad, eliminación rápida y campo opcional para el nombre del cliente.

4. **Checkout Directo a Instagram:**
   - Al pulsar `Finalizar Pedido en Instagram`:
     - Compila el pedido con todos los artículos seleccionados, cantidades y precio total.
     - Formato:  
       ```text
       Hola, quiero encargar:
       • 1x Keratina Líquida (10 €)
       • 2x Cera Mate (30 €)

       Total: 40 €
       Quedamos para recoger y pagar en mano en la barbería.
       ```
     - Copia automáticamente el pedido completo al portapapeles.
     - Redirige directamente a `https://ig.me/m/roneo_barber`, abriendo la aplicación de Instagram en móviles.

5. **Diseño Visual de Barbería:**
   - Paleta oscura (*obsidian dark* `#0a0b0e`, grafito, detalles en dorado ámbar `#d8a24a`).
   - Soporte para áreas seguras de iPhone (*Safe Area Insets* para notch y barra inferior).
   - Efectos de desenfoque *glassmorphism*, microinteracciones táctiles y soporte de vibración háptica.
   - Modal de detalle ampliado al pulsar sobre la imagen o el título de cualquier artículo.

---

## 📁 Estructura del Proyecto

```text
roneo-barber-cosmetics/
├── index.html       # Estructura semántica HTML5 optimizada para móviles
├── style.css        # Hoja de estilos moderna, tema oscuro de barbería y responsive
├── app.js           # Lógica del carrito, estado, modal y conexión con Instagram
└── README.md        # Documentación de uso y despliegue
```

---

## 📱 Cómo Probar en Local

Puedes abrir el archivo directamente en tu navegador habitual:
- Haz doble clic en `index.html` o ábrelo en Google Chrome, Microsoft Edge o Safari.
- Para simular la vista de un **iPhone**:
  1. Pulsa `F12` en tu navegador.
  2. Haz clic en el icono de **Dispositivos Móviles** (o pulsa `Ctrl + Shift + M`).
  3. Selecciona un modelo como **iPhone 14 Pro / iPhone 15**.

---

## 🌐 Cómo Publicarlo para la Bio de Instagram

Para poner este enlace en la biografía de `@roneo_barber`, puedes subir estos archivos gratuitamente a:
- **Vercel** o **Netlify**: Simplemente arrastra la carpeta `roneo-barber-cosmetics` y obtendrás un enlace inmediato tipo `roneo-barber.vercel.app`.
- **GitHub Pages**: Subir al repositorio y activar Pages en los ajustes.
