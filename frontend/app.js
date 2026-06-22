/**
 * Main Application Logic for Tubes IAE Frontend
 * Implements client-side state, view routing, marketplace, shopping cart,
 * order history, and the live status monitor.
 */

// ----------------------------------------------------
// APPLICATION STATE
// ----------------------------------------------------
let state = {
    user: JSON.parse(localStorage.getItem('current_user')) || null,
    products: [],
    categories: [],
    cart: JSON.parse(localStorage.getItem('cart')) || [],
    orders: [],
    notifications: [],
    activeCategory: 'all',
    searchQuery: '',
    systemStatus: {
        hasura: { online: false, latency: 0 },
        login: { online: false, latency: 0 },
        product: { online: false, latency: 0 },
        order: { online: false, latency: 0 },
        notification: { online: false, latency: 0 }
    }
};

// Expose state globally for debugging
window.AppState = state;

// ----------------------------------------------------
// HELPER FUNCTIONS
// ----------------------------------------------------
function formatRupiah(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = '';
    if (type === 'success') icon = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check-circle-2"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>';
    else if (type === 'warning') icon = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-alert-triangle"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12" y1="17" y2="17"/></svg>';
    else icon = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x-circle"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>';

    toast.innerHTML = `${icon} <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'none';
        toast.offsetHeight; // trigger reflow
        toast.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-20px)';
        setTimeout(() => toast.remove(), 500);
    }, 4000);
}

// Save Cart state
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(state.cart));
    updateCartBadges();
}

// Update UI Badge numbers
function updateCartBadges() {
    const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    const badges = document.querySelectorAll('.cart-badge');
    badges.forEach(b => {
        b.textContent = totalItems;
        b.style.display = totalItems > 0 ? 'inline-block' : 'none';
    });
}

// ----------------------------------------------------
// VIEW ROUTER
// ----------------------------------------------------
function switchView(viewId) {
    if (!state.user && viewId !== 'auth') {
        switchView('auth');
        return;
    }

    // Hide all views
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    
    // Deactivate all nav links
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

    // Show target view
    const target = document.getElementById(`view-${viewId}`);
    if (target) target.classList.add('active');

    // Activate corresponding link
    const link = document.querySelector(`.nav-link[data-view="${viewId}"]`);
    if (link) link.classList.add('active');

    // Load data for specific view
    if (viewId === 'marketplace') loadMarketplace();
    else if (viewId === 'cart') renderCart();
    else if (viewId === 'orders') loadOrders();
    else if (viewId === 'notifications') loadNotifications();
    else if (viewId === 'status') refreshSystemStatus();
}

// ----------------------------------------------------
// AUTHENTICATION LOGIC
// ----------------------------------------------------
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const loginBtn = document.getElementById('btn-login-submit');

    loginBtn.disabled = true;
    loginBtn.innerHTML = 'Connecting...';

    try {
        const response = await Api.login(email, password);
        state.user = response.user;
        localStorage.setItem('current_user', JSON.stringify(response.user));
        localStorage.setItem('token', response.token);
        
        showToast(`Selamat datang kembali, ${response.user.name}!`, 'success');
        setupUserWidget();
        switchView('marketplace');
    } catch (err) {
        showToast(err.message || 'Login gagal. Coba lagi.', 'error');
    } finally {
        loginBtn.disabled = false;
        loginBtn.innerHTML = 'Sign In';
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const role = document.getElementById('register-role').value;
    const registerBtn = document.getElementById('btn-register-submit');

    registerBtn.disabled = true;
    registerBtn.innerHTML = 'Registering...';

    try {
        const user = await Api.register(name, email, password, role);
        showToast(`Registrasi sukses! Silakan login.`, 'success');
        toggleAuthCard(false); // Switch back to login card
    } catch (err) {
        showToast(err.message || 'Registrasi gagal.', 'error');
    } finally {
        registerBtn.disabled = false;
        registerBtn.innerHTML = 'Create Account';
    }
}

function handleLogout() {
    state.user = null;
    state.cart = [];
    localStorage.removeItem('current_user');
    localStorage.removeItem('token');
    localStorage.removeItem('cart');
    updateCartBadges();
    
    // Reset Auth forms
    document.getElementById('login-form').reset();
    document.getElementById('register-form').reset();
    
    // Show auth screen
    switchView('auth');
    showToast('Anda telah logout.', 'warning');
}

function setupUserWidget() {
    const widget = document.getElementById('sidebar-user-widget');
    if (!state.user) {
        widget.style.display = 'none';
        return;
    }
    widget.style.display = 'flex';
    
    // Get initials for avatar
    const initials = state.user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    document.getElementById('user-avatar').textContent = initials;
    document.getElementById('user-display-name').textContent = state.user.name;
    document.getElementById('user-display-role').textContent = state.user.role || 'customer';
}

function toggleAuthCard(showRegister) {
    const loginCard = document.getElementById('auth-login-card');
    const registerCard = document.getElementById('auth-register-card');
    if (showRegister) {
        loginCard.style.display = 'none';
        registerCard.style.display = 'block';
    } else {
        loginCard.style.display = 'block';
        registerCard.style.display = 'none';
    }
}

// ----------------------------------------------------
// MARKETPLACE (PRODUCT CATALOG) LOGIC
// ----------------------------------------------------
async function loadMarketplace() {
    const grid = document.getElementById('product-grid');
    grid.innerHTML = '<div class="empty-state"><h3>Loading catalog data...</h3></div>';

    try {
        // Fetch categories first
        state.categories = await Api.getCategories();
        renderCategoryFilters();

        // Fetch products
        state.products = await Api.getProducts();
        renderProducts();
    } catch (err) {
        showToast('Gagal memuat katalog. Menggunakan data cadangan.', 'warning');
        state.products = [];
        grid.innerHTML = '<div class="empty-state"><h3>Katalog gagal dimuat.</h3></div>';
    }
}

function renderCategoryFilters() {
    const list = document.getElementById('category-filter-list');
    if (!list) return;

    // Reset filters and inject 'All'
    list.innerHTML = `
        <li class="filter-pill ${state.activeCategory === 'all' ? 'active' : ''}" data-category="all">
            Semua Produk
        </li>
    `;

    state.categories.forEach(cat => {
        const activeClass = state.activeCategory === String(cat.id) ? 'active' : '';
        list.innerHTML += `
            <li class="filter-pill ${activeClass}" data-category="${cat.id}">
                ${cat.name}
            </li>
        `;
    });

    // Attach listeners
    list.querySelectorAll('.filter-pill').forEach(pill => {
        pill.addEventListener('click', () => {
            list.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            state.activeCategory = pill.getAttribute('data-category');
            renderProducts();
        });
    });
}

function renderProducts() {
    const grid = document.getElementById('product-grid');
    if (!grid) return;

    // Filter products by category and search query
    let filtered = state.products;

    if (state.activeCategory !== 'all') {
        filtered = filtered.filter(p => String(p.category_id) === state.activeCategory);
    }

    if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase();
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(query) || 
            (p.description && p.description.toLowerCase().includes(query))
        );
    }

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search-code"><path d="m13 13.5 2-2.5-2-2.5"/><path d="m21 21-4.3-4.3"/><path d="M9 8.5 7 11l2 2.5"/><circle cx="11" cy="11" r="8"/></svg>
                <h3>Tidak ada produk yang cocok</h3>
                <p>Coba gunakan kata kunci pencarian yang lain.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = '';
    filtered.forEach(p => {
        const cat = state.categories.find(c => c.id === p.category_id);
        const categoryName = cat ? cat.name : 'Organik';
        const isLowStock = p.stock <= 5;
        const defaultImage = 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&q=80&w=600';
        
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-img-wrapper">
                <img class="product-img" src="${p.image || defaultImage}" alt="${p.name}">
                <span class="product-category-tag">${categoryName}</span>
            </div>
            <div class="product-details">
                <h3 class="product-name">${p.name}</h3>
                <p class="product-desc" title="${p.description || ''}">${p.description || 'Tidak ada deskripsi.'}</p>
                <div class="product-footer">
                    <div>
                        <div class="product-price">${formatRupiah(p.price)}</div>
                        <div class="product-stock ${isLowStock ? 'low' : ''}">Stok: ${p.stock} unit</div>
                    </div>
                    <button class="btn-card-add" data-id="${p.id}" title="Tambah ke Keranjang">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shopping-cart"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                    </button>
                </div>
            </div>
        `;
        
        // Add to Cart listener
        card.querySelector('.btn-card-add').addEventListener('click', () => {
            addToCart(p);
        });

        grid.appendChild(card);
    });
}

function addToCart(product) {
    const existing = state.cart.find(item => item.product.id === product.id);
    if (existing) {
        if (existing.quantity >= product.stock) {
            showToast('Stok produk tidak mencukupi.', 'warning');
            return;
        }
        existing.quantity++;
    } else {
        state.cart.push({ product, quantity: 1 });
    }
    
    saveCart();
    showToast(`${product.name} dimasukkan ke keranjang.`, 'success');
}

// ----------------------------------------------------
// SHOPPING CART LOGIC
// ----------------------------------------------------
function renderCart() {
    const list = document.getElementById('cart-items-list');
    const summary = document.getElementById('cart-summary-panel');
    
    if (state.cart.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shopping-bag"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                <h3>Keranjang Anda Kosong</h3>
                <p>Kembali ke Marketplace untuk menambahkan kemasan ramah lingkungan.</p>
                <button class="btn btn-primary" onclick="switchView('marketplace')">Belanja Sekarang</button>
            </div>
        `;
        summary.innerHTML = `
            <div class="summary-card glass-card">
                <h3>Ringkasan Belanja</h3>
                <hr style="border-color: var(--color-border); margin: 1rem 0;">
                <div class="summary-row">
                    <span>Total Barang</span>
                    <span>0</span>
                </div>
                <div class="summary-row total">
                    <span>Total Harga</span>
                    <span>Rp 0</span>
                </div>
                <button class="btn btn-secondary" style="margin-top: 1rem; width: 100%;" disabled>Checkout</button>
            </div>
        `;
        return;
    }

    // Render cart items
    list.innerHTML = '';
    state.cart.forEach(item => {
        const itemRow = document.createElement('div');
        itemRow.className = 'cart-item';
        const defaultImage = 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&q=80&w=600';
        
        itemRow.innerHTML = `
            <img class="cart-item-img" src="${item.product.image || defaultImage}" alt="${item.product.name}">
            <div class="cart-item-info">
                <h4 class="cart-item-name">${item.product.name}</h4>
                <div class="cart-item-price">${formatRupiah(item.product.price)} / pcs</div>
            </div>
            <div class="cart-item-qty">
                <button class="qty-btn dec" data-id="${item.product.id}">-</button>
                <span class="qty-val">${item.quantity}</span>
                <button class="qty-btn inc" data-id="${item.product.id}">+</button>
            </div>
            <div class="cart-item-total">
                ${formatRupiah(item.product.price * item.quantity)}
            </div>
            <button class="cart-item-delete" data-id="${item.product.id}" title="Hapus">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
            </button>
        `;

        // Listeners for quantity adjusters
        itemRow.querySelector('.dec').addEventListener('click', () => adjustQty(item.product.id, -1));
        itemRow.querySelector('.inc').addEventListener('click', () => adjustQty(item.product.id, 1));
        itemRow.querySelector('.cart-item-delete').addEventListener('click', () => removeCartItem(item.product.id));

        list.appendChild(itemRow);
    });

    // Render summary panel
    const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = state.cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const shipping = 10000; // Flat Rp 10.000
    const total = subtotal + shipping;

    summary.innerHTML = `
        <div class="summary-card glass-card">
            <h3 style="margin-bottom: 1rem;">Ringkasan Belanja</h3>
            <div class="summary-row" style="margin-bottom: 0.75rem;">
                <span>Total Barang</span>
                <span style="font-weight: 600;">${totalItems} pcs</span>
            </div>
            <div class="summary-row" style="margin-bottom: 0.75rem;">
                <span>Subtotal</span>
                <span>${formatRupiah(subtotal)}</span>
            </div>
            <div class="summary-row" style="margin-bottom: 0.75rem;">
                <span>Biaya Pengiriman</span>
                <span>${formatRupiah(shipping)}</span>
            </div>
            <div class="summary-row total" style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--color-border);">
                <span>Total Belanja</span>
                <span style="color: var(--accent-cyan);">${formatRupiah(total)}</span>
            </div>
            <button class="btn btn-primary" id="btn-checkout-submit" style="margin-top: 1.5rem; width: 100%;">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-credit-card"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
                Buat Pesanan Sekarang
            </button>
        </div>
    `;

    document.getElementById('btn-checkout-submit').addEventListener('click', handleCheckout);
}

function adjustQty(productId, delta) {
    const item = state.cart.find(item => item.product.id === productId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
        removeCartItem(productId);
    } else if (item.quantity > item.product.stock) {
        showToast('Stok produk tidak mencukupi.', 'warning');
        item.quantity = item.product.stock;
        saveCart();
        renderCart();
    } else {
        saveCart();
        renderCart();
    }
}

function removeCartItem(productId) {
    const name = state.cart.find(item => item.product.id === productId)?.product.name;
    state.cart = state.cart.filter(item => item.product.id !== productId);
    saveCart();
    renderCart();
    if (name) showToast(`${name} dihapus dari keranjang.`, 'warning');
}

async function handleCheckout() {
    const btn = document.getElementById('btn-checkout-submit');
    btn.disabled = true;
    btn.innerHTML = 'Memproses Pesanan...';

    try {
        const order = await Api.createOrder(state.user.id, state.cart);
        showToast(`Pesanan berhasil dibuat! Kode: ${order.order_code || order.order.order_code}`, 'success');
        
        // Clear cart
        state.cart = [];
        saveCart();
        
        // Go to Orders view
        switchView('orders');
    } catch (err) {
        showToast('Gagal memproses pesanan. Menggunakan Mock Fallback.', 'warning');
        // If live failed but mock mode wasn't on, we toggle mock mode to let checkout proceed
        const config = Api.getConfig();
        if (!config.mockMode) {
            console.warn("Retrying checkout in mock mode...");
            Api.updateConfig({ mockMode: true });
            document.getElementById('mock-mode-checkbox').checked = true;
            await handleCheckout();
        }
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = 'Buat Pesanan Sekarang';
        }
    }
}

// ----------------------------------------------------
// ORDERS HISTORY LOGIC
// ----------------------------------------------------
async function loadOrders() {
    const tbody = document.getElementById('orders-table-body');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem;">Memuat daftar pesanan...</td></tr>';

    try {
        state.orders = await Api.getOrders(state.user.id);
        renderOrders();
    } catch (err) {
        showToast('Gagal mengambil data pesanan.', 'error');
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem; color: var(--color-danger);">Gagal memuat pesanan.</td></tr>';
    }
}

function renderOrders() {
    const tbody = document.getElementById('orders-table-body');
    if (!tbody) return;

    if (state.orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 3rem; color: var(--color-text-muted);">Belum ada riwayat pesanan.</td></tr>';
        return;
    }

    tbody.innerHTML = '';
    state.orders.forEach(order => {
        const dateString = order.created_at;
        
        // Items text summary
        let itemsSummary = '';
        if (order.items && order.items.length > 0) {
            itemsSummary = order.items.map(i => `${i.product_name || 'Item'} (${i.quantity}x)`).join(', ');
        } else {
            itemsSummary = 'Boks Detail Kemasan';
        }

        const tr = document.createElement('tr');
        
        // Payment simulation button or action column
        let actionBtn = '';
        if (order.status === 'pending') {
            actionBtn = `
                <button class="btn btn-accent btn-pay" data-id="${order.id}" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
                    Bayar
                </button>
            `;
        } else {
            actionBtn = `
                <span style="font-size: 0.8rem; color: var(--color-text-muted); display: inline-flex; align-items: center; gap: 4px;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check"><path d="M20 6 9 17l-5-5"/></svg>
                    Paid / Selesai
                </span>
            `;
        }

        tr.innerHTML = `
            <td class="order-code">${order.order_code}</td>
            <td>
                <div style="font-weight: 600;">${dateString}</div>
                <div class="order-items-summary" title="${itemsSummary}">${itemsSummary}</div>
            </td>
            <td>${formatRupiah(order.total_price || order.subtotal)}</td>
            <td>
                <span class="order-badge ${order.status}">
                    ${order.status}
                </span>
            </td>
            <td>
                ${actionBtn}
            </td>
        `;

        const payBtn = tr.querySelector('.btn-pay');
        if (payBtn) {
            payBtn.addEventListener('click', () => simulatePayment(order.id));
        }

        tbody.appendChild(tr);
    });
}

async function simulatePayment(orderId) {
    const payBtn = document.querySelector(`.btn-pay[data-id="${orderId}"]`);
    if (payBtn) {
        payBtn.disabled = true;
        payBtn.innerHTML = 'Verifikasi...';
    }

    try {
        const res = await Api.payOrder(orderId);
        showToast(`Pembayaran pesanan SUKSES via RabbitMQ!`, 'success');
        
        // Refresh orders list
        loadOrders();
    } catch (err) {
        showToast('Gagal memproses simulasi pembayaran.', 'error');
        if (payBtn) {
            payBtn.disabled = false;
            payBtn.innerHTML = 'Bayar';
        }
    }
}

// ----------------------------------------------------
// NOTIFICATIONS LOGIC
// ----------------------------------------------------
async function loadNotifications() {
    const list = document.getElementById('notif-list-container');
    if (!list) return;

    list.innerHTML = '<div class="empty-state"><h3>Memuat notifikasi...</h3></div>';

    try {
        state.notifications = await Api.getNotifications();
        renderNotifications();
    } catch (err) {
        showToast('Gagal mengambil log notifikasi.', 'warning');
        list.innerHTML = '<div class="empty-state"><h3>Gagal memuat log notifikasi.</h3></div>';
    }
}

function renderNotifications() {
    const list = document.getElementById('notif-list-container');
    if (!list) return;

    if (state.notifications.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bell-off"><path d="M13.7 21h.3a1.9 1.9 0 0 1-3 0h.3"/><path d="M18.6 13A2.8 2.8 0 0 0 20 10.5V10a8 8 0 0 0-14.7-4.4"/><path d="M5.3 9.6A2.7 2.7 0 0 0 4 12v1a5.6 5.6 0 0 1-1.3 3.6c-.6.7-.1 1.9.9 1.9h12.8"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
                <h3>Tidak ada notifikasi</h3>
                <p>Notifikasi sistem akan muncul di sini saat Anda melakukan order atau pembayaran.</p>
            </div>
        `;
        return;
    }

    list.innerHTML = '';
    state.notifications.forEach(n => {
        const item = document.createElement('div');
        item.className = 'notif-item';
        
        let typeIcon = '';
        let typeClass = '';
        if (n.type === 'PAYMENT_SUCCESS') {
            typeIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check-circle-2"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>';
            typeClass = 'paid';
        } else {
            typeIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shopping-cart"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>';
            typeClass = 'created';
        }

        item.innerHTML = `
            <div class="notif-icon ${typeClass}">
                ${typeIcon}
            </div>
            <div class="notif-details">
                <p class="notif-msg">${n.message}</p>
                <div class="notif-meta">
                    <span>Oleh: ${n.email}</span>
                    <span>•</span>
                    <span>${n.created_at}</span>
                </div>
            </div>
        `;
        list.appendChild(item);
    });
}

// ----------------------------------------------------
// SYSTEM HEALTH STATUS & DIAGRAM MONITOR
// ----------------------------------------------------
async function refreshSystemStatus() {
    const config = Api.getConfig();
    
    // Read local/live settings and update UI form values
    document.getElementById('mock-mode-checkbox').checked = config.mockMode;
    document.getElementById('url-hasura').value = config.hasuraUrl;
    document.getElementById('url-login').value = config.loginUrl;
    document.getElementById('url-product').value = config.productUrl;
    document.getElementById('url-order').value = config.orderUrl;
    document.getElementById('url-notif').value = config.notificationUrl;

    if (config.mockMode) {
        // In mock mode, we force all service states to look 'online' or mock active
        updateDiagramNodeState('hasura', true);
        updateDiagramNodeState('login', true);
        updateDiagramNodeState('product', true);
        updateDiagramNodeState('order', true);
        updateDiagramNodeState('notification', true);
        
        updateStatusBadge('badge-hasura-status', true, '0ms');
        updateStatusBadge('badge-login-status', true, '0ms');
        updateStatusBadge('badge-product-status', true, '0ms');
        updateStatusBadge('badge-order-status', true, '0ms');
        updateStatusBadge('badge-notif-status', true, '0ms');
        return;
    }

    // Ping services in parallel
    const checks = [
        { key: 'hasura', url: config.hasuraUrl },
        { key: 'login', url: config.loginUrl },
        { key: 'product', url: config.productUrl },
        { key: 'order', url: config.orderUrl },
        { key: 'notification', url: config.notificationUrl }
    ];

    for (const c of checks) {
        updateStatusBadge(`badge-${c.key}-status`, 'loading');
        
        Api.checkServiceHealth(c.key, c.url).then(res => {
            state.systemStatus[c.key] = res;
            updateDiagramNodeState(c.key, res.online);
            updateStatusBadge(`badge-${c.key}-status`, res.online, res.online ? `${res.latency}ms` : res.error);
        });
    }
}

function updateDiagramNodeState(nodeId, online) {
    const circle = document.getElementById(`diag-node-${nodeId}`);
    if (circle) {
        circle.classList.remove('online', 'offline');
        circle.classList.add(online ? 'online' : 'offline');
    }
}

function updateStatusBadge(badgeId, status, meta = '') {
    const badge = document.getElementById(badgeId);
    if (!badge) return;

    if (status === 'loading') {
        badge.className = 'status-pill';
        badge.style.backgroundColor = 'rgba(255,255,255,0.05)';
        badge.style.color = 'var(--color-text-muted)';
        badge.innerHTML = '<span class="pulse-dot"></span> Checking...';
    } else if (status === true) {
        badge.className = 'status-pill status-online';
        badge.innerHTML = `<span class="pulse-dot"></span> ONLINE (${meta})`;
    } else {
        badge.className = 'status-pill status-offline';
        badge.innerHTML = `<span class="pulse-dot"></span> OFFLINE`;
        badge.title = meta; // error message on hover
    }
}

function saveConfigSettings(e) {
    e.preventDefault();
    const newConfig = {
        mockMode: document.getElementById('mock-mode-checkbox').checked,
        hasuraUrl: document.getElementById('url-hasura').value,
        loginUrl: document.getElementById('url-login').value,
        productUrl: document.getElementById('url-product').value,
        orderUrl: document.getElementById('url-order').value,
        notificationUrl: document.getElementById('url-notif').value,
    };
    
    Api.updateConfig(newConfig);
    showToast('Konfigurasi berhasil disimpan!', 'success');
    refreshSystemStatus();
}

// ----------------------------------------------------
// SYSTEM BOOT INTRO SEQUENCE
// ----------------------------------------------------
function runBootSequence() {
    const introScreen = document.getElementById('intro-screen');
    const progressBar = document.getElementById('intro-progress-bar');
    const percentageText = document.getElementById('intro-percentage');
    const ticker = document.getElementById('intro-status-ticker');

    if (!introScreen) return;

    // Initially hide the main app content with a fade effect
    const appContainer = document.querySelector('.app-container');
    if (appContainer) {
        appContainer.style.opacity = '0';
        appContainer.style.transition = 'opacity 0.8s ease-in-out';
    }

    let progress = 0;
    const interval = setInterval(() => {
        // Variable progress rate to feel like authentic systems loading
        let increment = Math.floor(Math.random() * 4) + 1; // 1-4%
        if (progress > 20 && progress < 35) increment = Math.random() > 0.4 ? 1 : 0; // slow down for Hasura gateway connection
        if (progress > 50 && progress < 65) increment = Math.random() > 0.3 ? 2 : 1; // microservice check
        if (progress > 85) increment = 1; // crawl towards finish line

        progress += increment;
        if (progress > 100) progress = 100;

        if (progressBar) progressBar.style.width = `${progress}%`;
        if (percentageText) percentageText.textContent = `${progress}%`;

        // Typewriter dynamic status messages based on current completion
        if (ticker) {
            if (progress < 12) {
                ticker.textContent = "» Preparing sustainable catalog environment...";
            } else if (progress < 25) {
                ticker.textContent = "» Rooting organic botanical nodes...";
            } else if (progress < 40) {
                ticker.textContent = "» Feeding connection pools to Login-Service (Port 8000)...";
            } else if (progress < 55) {
                ticker.textContent = "» Sprouting product assets from Product-Service (Port 8001)...";
            } else if (progress < 70) {
                ticker.textContent = "» Nurturing transaction flows on Order-Service (Port 8002)...";
            } else if (progress < 82) {
                ticker.textContent = "» Syncing PostgreSQL database soil layers...";
            } else if (progress < 92) {
                ticker.textContent = "» Watering notification listeners via RabbitMQ...";
            } else if (progress < 100) {
                ticker.textContent = "» Harvesting security authorization keys...";
            } else {
                ticker.textContent = "» BAJAMAS Sustainable E-Commerce: Ready.";
            }
        }

        if (progress === 100) {
            clearInterval(interval);
            
            // Short delay after completing boot to display the success message
            setTimeout(() => {
                introScreen.classList.add('fade-out');
                if (appContainer) {
                    appContainer.style.opacity = '1';
                }
                
                // Cleanup screen element after animation ends
                setTimeout(() => {
                    introScreen.remove();
                }, 800);
            }, 800);
        }
    }, 45); // Takes approx. 3.5 - 4.5 seconds to complete
}

// ----------------------------------------------------
// BOOTSTRAP INITIALIZATION
// ----------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    // Run badass intro sequence
    runBootSequence();

    // Add toast container dynamically
    if (!document.getElementById('toast-container')) {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    // Set default auth display card
    toggleAuthCard(false);

    // Initialize sidebar user profile widget
    setupUserWidget();

    // Check login state
    if (state.user) {
        switchView('marketplace');
    } else {
        switchView('auth');
    }

    updateCartBadges();

    // Global navigation view routing
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const viewId = link.getAttribute('data-view');
            switchView(viewId);
        });
    });

    // Form Submissions
    document.getElementById('login-form')?.addEventListener('submit', handleLogin);
    document.getElementById('register-form')?.addEventListener('submit', handleRegister);
    document.getElementById('config-form')?.addEventListener('submit', saveConfigSettings);

    // Link switcher inside auth views
    document.getElementById('link-goto-register')?.addEventListener('click', (e) => {
        e.preventDefault();
        toggleAuthCard(true);
    });
    document.getElementById('link-goto-login')?.addEventListener('click', (e) => {
        e.preventDefault();
        toggleAuthCard(false);
    });

    // Sidebar Logout action
    document.getElementById('btn-logout')?.addEventListener('click', (e) => {
        e.preventDefault();
        handleLogout();
    });

    // Catalog Search Event
    document.getElementById('catalog-search')?.addEventListener('input', (e) => {
        state.searchQuery = e.target.value;
        renderProducts();
    });

    // Handle initial mock state changes
    document.getElementById('mock-mode-checkbox')?.addEventListener('change', (e) => {
        Api.updateConfig({ mockMode: e.target.checked });
        showToast(`Mock Mode ${e.target.checked ? 'AKTIF' : 'NON-AKTIF'}`, e.target.checked ? 'success' : 'warning');
        refreshSystemStatus();
    });
});
