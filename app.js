const products = [
    { 
        id: 1, 
        name: "Máquina Beard & Body", 
        price: 35.00, 
        desc: "Recorta y define tu barba con precisión, acabado profesional en casa.", 
        image: "beard-body-machine.jpg", 
        features: ["Apurado extremo", "Para barba y cuerpo", "Inalámbrica recargable"] 
    },
    { 
        id: 2, 
        name: "Cera Acabado Mate", 
        price: 15.00, 
        desc: "Cera de acabado completamente mate y fijación controlada - 150ml.", 
        image: "cera-mate.png", 
        features: ["Acabado natural sin brillo", "Volumen y movimiento", "Textura y control"] 
    },
    { 
        id: 3, 
        name: "Cera Acabado Brillo", 
        price: 15.00, 
        desc: "Pomada con base acuosa, efecto mojado y fijación flexible - 150ml.", 
        image: "cera-brillo.png", 
        hasAroma: true, 
        features: ["Efecto mojado", "Fijación flexible", "3 aromas disponibles"] 
    },
    { 
        id: 4, 
        name: "Crema de Rizos", 
        price: 10.00, 
        desc: "Tratamiento capilar que contribuye a definir rizos y controlar encrespamiento - 250ml.", 
        image: "crema-rizos.png", 
        features: ["Define rizos", "Control encrespamiento", "Sin aclarado"] 
    },
    { 
        id: 5, 
        name: "Keratina Líquida", 
        price: 10.00, 
        desc: "Tratamiento diario para cabellos encrespados, uso sobre cabello húmedo - 200ml.", 
        image: "keratina-liquida.png", 
        features: ["Reparación intensiva", "Anti-frizz", "Suavidad"] 
    }
];

let cart = {};
let selectedProductForAroma = null;

function renderProducts() {
    const grid = document.getElementById('product-grid');
    if (!grid) return;
    
    grid.innerHTML = products.map(p => `
        <div class="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden flex flex-col justify-between shadow-lg">
            <div>
                <div class="relative h-48 bg-zinc-950 flex items-center justify-center p-4">
                    <img src="${p.image}" alt="${p.name}" class="max-h-full max-w-full object-contain">
                    <div class="absolute top-3 right-3 bg-black/80 border border-zinc-700 text-orange-500 font-black px-3 py-1 rounded-xl text-sm">
                        ${p.price.toFixed(2)} €
                    </div>
                </div>
                <div class="p-5">
                    <h3 class="font-bold text-base text-white mb-2">${p.name}</h3>
                    <p class="text-xs text-zinc-400 mb-4">${p.desc}</p>
                    <div class="space-y-1.5 border-t border-zinc-800 pt-3">
                        ${p.features.map(f => `<div class="text-[11px] text-zinc-400 flex items-center gap-2"><i class="fas fa-check text-orange-500"></i> ${f}</div>`).join('')}
                    </div>
                </div>
            </div>
            <div class="p-5 pt-0">
                <button onclick="handleAddToCart(${p.id})" class="w-full bg-zinc-800 hover:bg-orange-500 hover:text-black text-white font-bold py-3 rounded-xl text-xs transition flex items-center justify-center gap-2 border border-zinc-700">
                    <i class="fas fa-plus"></i> Añadir a la Cesta
                </button>
            </div>
        </div>
    `).join('');
}

function handleAddToCart(productId) {
    const product = products.find(p => p.id == productId);
    if (product.hasAroma) {
        selectedProductForAroma = productId;
        document.getElementById('aroma-modal').classList.remove('hidden');
    } else {
        addCartItem(productId, null);
    }
}

function closeAromaModal() {
    document.getElementById('aroma-modal').classList.add('hidden');
    selectedProductForAroma = null;
}

function confirmAddAroma() {
    const aroma = document.querySelector('input[name="aroma"]:checked').value;
    addCartItem(selectedProductForAroma, aroma);
    closeAromaModal();
}

function addCartItem(productId, aroma) {
    const key = aroma ? `${productId}_${aroma}` : `${productId}`;
    cart[key] = cart[key] || { productId: productId, qty: 0, aroma: aroma };
    cart[key].qty += 1;
    updateCartUI();
}

function changeQuantity(key, delta) {
    if (cart[key]) {
        cart[key].qty += delta;
        if (cart[key].qty <= 0) delete cart[key];
        updateCartUI();
    }
}

function updateCartUI() {
    let totalCount = 0, totalPrice = 0, html = '';
    for (const [key, item] of Object.entries(cart)) {
        const p = products.find(prod => prod.id == item.productId);
        if (p) {
            totalCount += item.qty;
            let sub = p.price * item.qty;
            totalPrice += sub;
            html += `
                <div class="py-3 flex justify-between items-center">
                    <div>
                        <h4 class="font-bold text-sm text-white">${p.name}</h4>
                        ${item.aroma ? `<span class="text-[11px] text-orange-500">Aroma: ${item.aroma}</span><br>` : ''}
                        <span class="text-xs text-zinc-400">${p.price.toFixed(2)} € x ${item.qty}</span>
                    </div>
                    <div class="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-xl p-1">
                        <button onclick="changeQuantity('${key}', -1)" class="w-7 h-7 bg-zinc-800 rounded-lg text-white font-bold">-</button>
                        <span class="text-sm font-bold w-4 text-center">${item.qty}</span>
                        <button onclick="changeQuantity('${key}', 1)" class="w-7 h-7 bg-zinc-800 rounded-lg text-white font-bold">+</button>
                    </div>
                </div>`;
        }
    }
    document.getElementById('cart-badge').innerText = totalCount;
    document.getElementById('cart-total').innerText = totalPrice.toFixed(2) + ' €';
    document.getElementById('modal-total').innerText = totalPrice.toFixed(2) + ' €';
    document.getElementById('cart-items-container').innerHTML = totalCount === 0 ? `<div class="text-center py-12 text-zinc-600 text-xs">Tu cesta está vacía</div>` : html;
}

function openCartModal() { document.getElementById('cart-modal').classList.remove('hidden'); }
function closeCartModal() { document.getElementById('cart-modal').classList.add('hidden'); }

function copyOrderAndOpenInstagram() {
    let totalCount = Object.values(cart).reduce((acc, item) => acc + item.qty, 0);
    if (totalCount === 0) return alert("Añade algún producto primero");

    let text = "¡Hola! Me gustaría hacer el siguiente pedido:\n\n";
    let total = 0;
    for (const item of Object.values(cart)) {
        const p = products.products ? null : products.find(prod => prod.id == item.productId);
        if (p) {
            let sub = p.price * item.qty;
            total += sub;
            let aromaText = item.aroma ? ` [Aroma: ${item.aroma}]` : '';
            text += `▪ ${item.qty}x ${p.name}${aromaText} (${sub.toFixed(2)} €)\n`;
        }
    }
    text += `\nTotal: ${total.toFixed(2)} €\n¿Hay disponibilidad?`;

    navigator.clipboard.writeText(text).then(() => {
        closeCartModal();
        document.getElementById('custom-alert').classList.remove('hidden');
    });
}

function closeAlertAndRedirect() {
    document.getElementById('custom-alert').classList.add('hidden');
    window.location.href = "https://ig.me/m/roneo_barber";
}

// Ejecutar al cargar
renderProducts();
