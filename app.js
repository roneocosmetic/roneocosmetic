/**
 * Roneo Barber Cosmetics - Catálogo Oficial Mobile-First
 * Con selector obligatorio de aroma para Cera Brillo, insignias Top Ventas y checkout directo a Instagram
 */

// 1. Catálogo oficial con fotos reales y variantes de aroma
const PRODUCTS = [
  {
    id: "cera-brillo",
    name: "Cera Acabado Brillo",
    price: 15,
    category: "styling",
    categoryLabel: "Fijación",
    image: "cera-brillo.png",
    subtitle: "Efecto mojado • 150 ML",
    isTopSeller: true,
    topSellerBadge: "🔥 TOP VENTAS",
    hasAromas: true,
    variants: [
      { id: "one-million", name: "One Million" },
      { id: "coca-cola", name: "Coca-Cola" },
      { id: "chicle", name: "Chicle" }
    ]
  },
  {
    id: "crema-rizos",
    name: "Crema de Rizos",
    price: 10,
    category: "care",
    categoryLabel: "Cuidado",
    image: "crema-rizos.png",
    subtitle: "Rizos definidos • 250 ML",
    isTopSeller: true,
    topSellerBadge: "🔥 TOP VENTAS",
    hasAromas: false
  },
  {
    id: "cera-mate",
    name: "Cera Acabado Mate",
    price: 15,
    category: "styling",
    categoryLabel: "Fijación",
    image: "cera-mate.png",
    subtitle: "Mate natural • 150 ML",
    isTopSeller: false,
    hasAromas: false
  },
  {
    id: "keratina-liquida",
    name: "Keratina Líquida",
    price: 10,
    category: "care",
    categoryLabel: "Cuidado",
    image: "keratina-liquida.png",
    subtitle: "Anti-Frizz intensivo • 200 ML",
    isTopSeller: false,
    hasAromas: false
  },
  {
    id: "beard-body-machine",
    name: "Máquina Beard & Body",
    price: 35,
    category: "tools",
    categoryLabel: "Máquinas",
    image: "beard-body-machine.jpg",
    subtitle: "Cuchilla T-Blade • USB-C",
    isTopSeller: false,
    hasAromas: false
  }
];

// 2. Estado de la aplicación
const AppState = {
  cart: {}, // { [cartKey]: { productId, aroma, qty } }
  activeCategory: 'all',
  selectedAromas: {
    'cera-brillo': 'One Million' // Aroma seleccionado por defecto
  },

  init() {
    this.loadCart();
    this.renderProducts();
    this.updateCartUI();
    this.setupEventListeners();
  },

  loadCart() {
    try {
      const saved = localStorage.getItem('roneo_cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.cart = {};
        for (const [key, item] of Object.entries(parsed)) {
          if (typeof item === 'number') {
            this.cart[key] = { productId: key, aroma: null, qty: item };
          } else if (item && typeof item === 'object') {
            this.cart[key] = item;
          }
        }
      }
    } catch (e) {
      console.warn("No se pudo cargar el carrito:", e);
      this.cart = {};
    }
  },

  saveCart() {
    try {
      localStorage.setItem('roneo_cart', JSON.stringify(this.cart));
    } catch (e) {
      console.warn("No se pudo guardar el carrito:", e);
    }
  },

  selectAroma(productId, aromaName) {
    this.selectedAromas[productId] = aromaName;
    this.renderProducts();
  },

  addToCart(productId, qty = 1, forceAroma = null) {
    const prod = PRODUCTS.find(p => p.id === productId);
    if (!prod) return;

    let aroma = forceAroma;
    if (prod.hasAromas && !aroma) {
      aroma = this.selectedAromas[productId] || prod.variants[0].name;
    }

    // Clave única según producto y aroma (permite pedir varios aromas de la misma cera)
    const cartKey = aroma ? `${productId}__${aroma.replace(/\s+/g, '_')}` : productId;

    if (!this.cart[cartKey]) {
      this.cart[cartKey] = {
        productId: productId,
        aroma: aroma,
        qty: 0
      };
    }

    this.cart[cartKey].qty += qty;
    this.saveCart();
    this.updateCartUI();
    this.renderProducts();

    if (navigator.vibrate) {
      navigator.vibrate(35);
    }

    const itemLabel = aroma ? `${prod.name} (${aroma})` : prod.name;
    showToast(`✓ Añadido: ${itemLabel}`);
  },

  decrementCartItem(cartKey) {
    if (!this.cart[cartKey]) return;
    this.cart[cartKey].qty -= 1;
    if (this.cart[cartKey].qty <= 0) {
      delete this.cart[cartKey];
    }
    this.saveCart();
    this.updateCartUI();
    this.renderProducts();
  },

  incrementCartItem(cartKey) {
    if (!this.cart[cartKey]) return;
    this.cart[cartKey].qty += 1;
    this.saveCart();
    this.updateCartUI();
    this.renderProducts();
  },

  removeFromCart(cartKey) {
    delete this.cart[cartKey];
    this.saveCart();
    this.updateCartUI();
    this.renderProducts();
    showToast(`Producto eliminado`);
  },

  getTotalItems() {
    return Object.values(this.cart).reduce((sum, item) => sum + (item.qty || 0), 0);
  },

  getTotalPrice() {
    return Object.values(this.cart).reduce((total, item) => {
      const prod = PRODUCTS.find(p => p.id === item.productId);
      return total + (prod ? prod.price * item.qty : 0);
    }, 0);
  },

  // Obtener cantidad total en carrito para un producto (suma todos sus aromas)
  getProductTotalInCart(productId) {
    return Object.values(this.cart)
      .filter(item => item.productId === productId)
      .reduce((sum, item) => sum + item.qty, 0);
  },

  // 3. Renderizado de las tarjetas con selector de aroma y fotos completas
  renderProducts() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;

    let filtered = PRODUCTS;
    if (this.activeCategory === 'top') {
      filtered = PRODUCTS.filter(p => p.isTopSeller);
    } else if (this.activeCategory !== 'all') {
      filtered = PRODUCTS.filter(p => p.category === this.activeCategory);
    }

    const countBadge = document.getElementById('productCount');
    if (countBadge) {
      countBadge.textContent = `${filtered.length} artículos`;
    }

    grid.innerHTML = filtered.map(prod => {
      const isTop = prod.isTopSeller;
      const currentAroma = this.selectedAromas[prod.id] || (prod.hasAromas ? prod.variants[0].name : null);
      const activeCartKey = currentAroma ? `${prod.id}__${currentAroma.replace(/\s+/g, '_')}` : prod.id;
      const inCartQty = this.cart[activeCartKey] ? this.cart[activeCartKey].qty : 0;
      const totalProdQty = this.getProductTotalInCart(prod.id);

      return `
        <article class="product-card ${isTop ? 'top-seller-card' : ''}" data-id="${prod.id}">
          <!-- Imagen de producto real íntegra -->
          <div class="card-visual-wrapper" onclick="AppState.openLightbox('${prod.id}')" title="Toca para ampliar foto">
            ${isTop ? `
              <div class="top-seller-badge" aria-label="Producto Top Ventas">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                  <path d="M12 23c6.075 0 11-4.925 11-11C23 6 18 1 12 1S1 6 1 12c0 6.075 4.925 11 11 11zm1.2-18.4c.5 1.5 1.5 2.7 2.8 3.4 1.2.7 1.8 1.9 1.7 3.2-.2 1.6-1.5 2.8-3.1 2.8H14v2.5c0 1.4-1.1 2.5-2.5 2.5S9 17.9 9 16.5V14H8.4C6.8 14 5.5 12.8 5.3 11.2c-.1-1.3.5-2.5 1.7-3.2 1.3-.7 2.3-1.9 2.8-3.4.4.9 1.1 1.7 2 2.1.8-.4 1.5-1.2 2-2.1z"/>
                </svg>
                <span>${prod.topSellerBadge}</span>
              </div>
            ` : ''}

            <img src="${prod.image}" alt="${prod.name}" class="product-poster-img" loading="lazy">

            <div class="zoom-badge-hint">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
              <span>Ver ampliado</span>
            </div>
          </div>

          <!-- Selector de Aroma Obligatorio (para Cera Acabado Brillo) -->
          ${prod.hasAromas ? `
            <div class="card-aroma-block">
              <div class="aroma-label-text">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7z"></path><circle cx="12" cy="9" r="2.5"></circle></svg>
                Elige tu aroma: <strong class="current-aroma-highlight">${currentAroma}</strong>
              </div>
              <div class="aroma-pills-row" role="radiogroup" aria-label="Variantes de aroma">
                ${prod.variants.map(v => `
                  <button 
                    type="button" 
                    role="radio" 
                    aria-checked="${currentAroma === v.name}"
                    class="aroma-pill-btn ${currentAroma === v.name ? 'active' : ''}" 
                    onclick="AppState.selectAroma('${prod.id}', '${v.name}')">
                    ${v.name}
                  </button>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <!-- Barra de acción de compra -->
          <div class="card-action-bar">
            <div class="card-title-price-group">
              <div class="card-title-row">
                <h3 class="card-product-title">${prod.name}</h3>
                ${isTop ? `<span class="mini-top-star" title="Top Ventas">★</span>` : ''}
              </div>
              <span class="card-product-subtitle">
                ${prod.hasAromas ? `Aroma: <strong>${currentAroma}</strong>` : prod.subtitle}
              </span>
            </div>

            <div class="card-purchase-controls">
              <span class="card-price-tag">${prod.price} €</span>

              ${inCartQty > 0 ? `
                <div class="card-qty-controls">
                  <button type="button" aria-label="Restar una unidad" onclick="AppState.decrementCartItem('${activeCartKey}')">−</button>
                  <span class="qty-number">${inCartQty}</span>
                  <button type="button" aria-label="Añadir otra unidad" onclick="AppState.incrementCartItem('${activeCartKey}')">+</button>
                </div>
              ` : `
                <button type="button" class="add-btn ${isTop ? 'add-btn-top' : ''}" onclick="AppState.addToCart('${prod.id}', 1, '${currentAroma || ''}')">
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  <span>Añadir</span>
                </button>
              `}
            </div>
          </div>
        </article>
      `;
    }).join('');
  },

  // 4. Actualización del carrito visual
  updateCartUI() {
    const totalItems = this.getTotalItems();
    const totalPrice = this.getTotalPrice();

    const floatingWrapper = document.getElementById('floatingCartWrapper');
    const cartCountBadge = document.getElementById('cartCountBadge');
    const cartTotalBar = document.getElementById('cartTotalBar');

    if (cartCountBadge) {
      cartCountBadge.textContent = totalItems;
      cartCountBadge.classList.remove('pulse-badge');
      void cartCountBadge.offsetWidth;
      cartCountBadge.classList.add('pulse-badge');
    }

    if (cartTotalBar) {
      cartTotalBar.textContent = `${totalPrice} €`;
    }

    if (floatingWrapper) {
      if (totalItems > 0) {
        floatingWrapper.classList.add('visible');
      } else {
        floatingWrapper.classList.remove('visible');
      }
    }

    // Modal / Drawer
    const drawerBadge = document.getElementById('drawerItemsBadge');
    const drawerTotal = document.getElementById('drawerTotalPrice');
    const drawerBody = document.getElementById('cartDrawerBody');
    const checkoutBtn = document.getElementById('checkoutInstagramBtn');

    if (drawerBadge) drawerBadge.textContent = `${totalItems} ${totalItems === 1 ? 'producto' : 'productos'}`;
    if (drawerTotal) drawerTotal.textContent = `${totalPrice} €`;

    if (drawerBody) {
      if (totalItems === 0) {
        drawerBody.innerHTML = `
          <div class="empty-cart-state">
            <svg viewBox="0 0 24 24" width="46" height="46" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            <h3>Tu cesta está vacía</h3>
            <p>Selecciona los productos de barbería que desees para encargar y recoger en mano.</p>
          </div>
        `;
        if (checkoutBtn) checkoutBtn.style.opacity = '0.5';
        if (checkoutBtn) checkoutBtn.style.pointerEvents = 'none';
      } else {
        if (checkoutBtn) checkoutBtn.style.opacity = '1';
        if (checkoutBtn) checkoutBtn.style.pointerEvents = 'auto';

        drawerBody.innerHTML = Object.entries(this.cart).map(([cartKey, item]) => {
          const prod = PRODUCTS.find(p => p.id === item.productId);
          if (!prod) return '';
          const itemTotal = prod.price * item.qty;

          return `
            <div class="cart-item-card">
              <img src="${prod.image}" alt="${prod.name}" class="cart-item-img">
              <div class="cart-item-info">
                <div class="cart-item-title">
                  ${prod.name}
                  ${prod.isTopSeller ? '<span class="mini-star">★</span>' : ''}
                </div>
                ${item.aroma ? `
                  <div class="cart-item-aroma-tag">
                    <span class="aroma-dot"></span> Aroma: <strong>${item.aroma}</strong>
                  </div>
                ` : ''}
                <div class="cart-item-unit-price">${prod.price} € c/u</div>
                <div class="cart-item-total">${itemTotal} €</div>
              </div>
              <div class="cart-item-actions">
                <div class="cart-qty-pill">
                  <button type="button" onclick="AppState.decrementCartItem('${cartKey}')">−</button>
                  <span>${item.qty}</span>
                  <button type="button" onclick="AppState.incrementCartItem('${cartKey}')">+</button>
                </div>
                <button type="button" class="remove-item-btn" title="Eliminar" onclick="AppState.removeFromCart('${cartKey}')">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </div>
            </div>
          `;
        }).join('');
      }
    }
  },

  // 5. Visor Lightbox con selector de aroma integrado
  openLightbox(productId) {
    const prod = PRODUCTS.find(p => p.id === productId);
    if (!prod) return;

    const modalContent = document.getElementById('detailModalContent');
    const modalOverlay = document.getElementById('detailModalOverlay');
    const currentAroma = this.selectedAromas[prod.id] || (prod.hasAromas ? prod.variants[0].name : null);

    modalContent.innerHTML = `
      <div class="lightbox-container">
        <img src="${prod.image}" alt="${prod.name}" class="lightbox-img">
        
        ${prod.hasAromas ? `
          <div class="lightbox-aroma-picker">
            <span class="picker-title">Aroma elegido: <strong>${currentAroma}</strong></span>
            <div class="aroma-pills-row">
              ${prod.variants.map(v => `
                <button 
                  type="button" 
                  class="aroma-pill-btn ${currentAroma === v.name ? 'active' : ''}" 
                  onclick="AppState.selectAroma('${prod.id}', '${v.name}'); AppState.openLightbox('${prod.id}');">
                  ${v.name}
                </button>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <div class="lightbox-bar">
          <div class="lightbox-info">
            <h4>${prod.name} ${prod.isTopSeller ? '🔥' : ''}</h4>
            <span class="lightbox-price">${prod.price} €</span>
          </div>
          <button type="button" class="lightbox-add-btn" onclick="AppState.addToCart('${prod.id}', 1, '${currentAroma || ''}'); AppState.closeLightbox();">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Añadir al carrito (${prod.price} €)
          </button>
        </div>
      </div>
    `;

    modalOverlay.classList.add('active');
  },

  closeLightbox() {
    const modalOverlay = document.getElementById('detailModalOverlay');
    if (modalOverlay) modalOverlay.classList.remove('active');
  },

  // 6. Proceso de Checkout directo a Instagram con Aroma, Recogida Gratis y Total
  checkoutInstagram() {
    const totalItems = this.getTotalItems();
    if (totalItems === 0) {
      showToast("Tu carrito está vacío");
      return;
    }

    const clientNameInput = document.getElementById('clientNameInput');
    const clientName = clientNameInput ? clientNameInput.value.trim() : '';

    // Formatear líneas de pedido detalladas con aroma si aplica
    let productLines = [];
    Object.values(this.cart).forEach(item => {
      const prod = PRODUCTS.find(p => p.id === item.productId);
      if (prod) {
        const itemSubtotal = prod.price * item.qty;
        if (item.aroma) {
          productLines.push(`• ${item.qty}x ${prod.name} (Aroma: ${item.aroma}) - ${itemSubtotal} €`);
        } else {
          productLines.push(`• ${item.qty}x ${prod.name} - ${itemSubtotal} €`);
        }
      }
    });

    const totalPrice = this.getTotalPrice();

    // Mensaje preescrito solicitado con recogida en tienda gratis y total
    let messageText = `Hola, quiero encargar:\n${productLines.join('\n')}\n\n`;
    if (clientName) {
      messageText = `Hola, soy ${clientName}. Quiero encargar:\n${productLines.join('\n')}\n\n`;
    }

    messageText += `Recogida en tienda: Gratis\n`;
    messageText += `Total a pagar en mano: ${totalPrice} €\n`;
    messageText += `Quedamos para recoger y pagar en mano en la barbería.`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(messageText).catch(() => {});
    }

    const instagramChatUrl = "https://ig.me/m/roneo_barber";
    showToast("📋 ¡Pedido copiado! Abriendo Instagram...");

    try {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        window.location.href = instagramChatUrl;
      } else {
        window.open(instagramChatUrl, '_blank');
      }
    } catch (e) {
      window.location.href = instagramChatUrl;
    }
  },

  // 7. Event listeners
  setupEventListeners() {
    const catPills = document.querySelectorAll('.cat-pill');
    catPills.forEach(pill => {
      pill.addEventListener('click', (e) => {
        catPills.forEach(p => p.classList.remove('active'));
        e.target.classList.add('active');
        this.activeCategory = e.target.getAttribute('data-category');
        this.renderProducts();
      });
    });

    const floatingCartBtn = document.getElementById('floatingCartBtn');
    const cartOverlay = document.getElementById('cartOverlay');
    const closeCartBtn = document.getElementById('closeCartBtn');

    if (floatingCartBtn) {
      floatingCartBtn.addEventListener('click', () => {
        cartOverlay.classList.add('active');
      });
    }

    if (closeCartBtn) {
      closeCartBtn.addEventListener('click', () => {
        cartOverlay.classList.remove('active');
      });
    }

    if (cartOverlay) {
      cartOverlay.addEventListener('click', (e) => {
        if (e.target === cartOverlay) {
          cartOverlay.classList.remove('active');
        }
      });
    }

    const closeDetailBtn = document.getElementById('closeDetailBtn');
    const detailOverlay = document.getElementById('detailModalOverlay');
    if (closeDetailBtn) {
      closeDetailBtn.addEventListener('click', () => this.closeLightbox());
    }
    if (detailOverlay) {
      detailOverlay.addEventListener('click', (e) => {
        if (e.target === detailOverlay) {
          this.closeLightbox();
        }
      });
    }

    const checkoutBtn = document.getElementById('checkoutInstagramBtn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
        this.checkoutInstagram();
      });
    }
  }
};

// 8. Toast Notifications
let toastTimeout = null;
function showToast(message, icon = '✓') {
  const toast = document.getElementById('toastNotification');
  const toastMsg = document.getElementById('toastMessage');
  const toastIco = document.getElementById('toastIcon');

  if (!toast || !toastMsg) return;

  toastMsg.textContent = message;
  if (toastIco) toastIco.textContent = icon;

  toast.classList.add('show');

  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 2600);
}

document.addEventListener('DOMContentLoaded', () => {
  AppState.init();
});
