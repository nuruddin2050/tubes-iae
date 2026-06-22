/**
 * API Client for Tubes IAE Microservices
 * Configurable endpoints mapped to the actual REST and GraphQL schemas of your services.
 */

// Default Configuration - Connecting to actual services by default
const DEFAULT_CONFIG = {
    mockMode: false, // Default to FALSE so it tries to connect to actual coding/backend
    hasuraUrl: 'http://localhost:8080/v1/graphql',
    loginUrl: 'http://localhost:8000/api', // Login-Service (port 8000 default)
    productUrl: 'http://localhost:8001/api', // Product-Service (port 8001 default)
    orderUrl: 'http://localhost:8002/api/v1', // Order-Service (port 8002 default)
    notificationUrl: 'http://localhost:8003/api', // Notification-Service (port 8003 default)
};

// Initialize configuration from localStorage or defaults
function getConfig() {
    const config = {};
    for (const key in DEFAULT_CONFIG) {
        const stored = localStorage.getItem(`config_${key}`);
        if (stored !== null) {
            config[key] = stored === 'true' || stored === 'false' ? stored === 'true' : stored;
        } else {
            config[key] = DEFAULT_CONFIG[key];
            localStorage.setItem(`config_${key}`, DEFAULT_CONFIG[key]);
        }
    }
    return config;
}

function updateConfig(newConfig) {
    for (const key in newConfig) {
        localStorage.setItem(`config_${key}`, newConfig[key]);
    }
}

// ----------------------------------------------------
// MOCK DATA STORE (Failsafe Backup)
// ----------------------------------------------------
const MOCK_CATEGORIES = [
    { id: 1, name: 'Kemasan Kertas', slug: 'kemasan-kertas', description: 'Kemasan ramah lingkungan berbahan kertas daur ulang' },
    { id: 2, name: 'Kemasan Singkong', slug: 'kemasan-singkong', description: 'Kantong nabati berbahan dasar pati singkong yang mudah terurai' },
    { id: 3, name: 'Kemasan Bambu & Kayu', slug: 'kemasan-bambu-kayu', description: 'Wadah premium estetis berbahan bambu dan serat kayu alami' }
];

const MOCK_PRODUCTS = [
    {
        id: 1,
        category_id: 1,
        name: 'Paper Bag Polos Craft M',
        slug: 'paper-bag-polos-craft-m',
        description: 'Paper bag ramah lingkungan berkualitas tinggi, cocok untuk boks makanan, pakaian, dan souvenir belanja.',
        price: 1500,
        stock: 200,
        image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600'
    },
    {
        id: 2,
        category_id: 2,
        name: 'Bio-Plastic Bag Singkong L',
        slug: 'bio-plastic-bag-singkong-l',
        description: 'Kantong belanja organik alternatif plastik, berbahan pati singkong alami. Isi 50 lembar. Kompos belaka!',
        price: 35000,
        stock: 100,
        image: 'https://images.unsplash.com/photo-1607344645866-009c320b63e0?auto=format&fit=crop&q=80&w=600'
    },
    {
        id: 3,
        category_id: 1,
        name: 'Kardus Corrugated Box S',
        slug: 'kardus-corrugated-box-s',
        description: 'Kardus pengiriman bergelombang tebal, ukuran S (20x15x10 cm). Sangat kokoh dan 100% biodegradable.',
        price: 2500,
        stock: 500,
        image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=600'
    }
];

let mockOrders = JSON.parse(localStorage.getItem('mock_orders')) || [];
let mockNotifications = JSON.parse(localStorage.getItem('mock_notifications')) || [];

function saveMockData() {
    localStorage.setItem('mock_orders', JSON.stringify(mockOrders));
    localStorage.setItem('mock_notifications', JSON.stringify(mockNotifications));
}

// ----------------------------------------------------
// NETWORK UTILITIES
// ----------------------------------------------------
async function graphqlRequest(url, query, variables = {}) {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({ query, variables })
    });
    const result = await response.json();
    if (result.errors) {
        throw new Error(result.errors[0].message);
    }
    return result.data;
}

async function restRequest(url, method = 'GET', data = null, token = null) {
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
        method,
        headers
    };
    if (data) {
        options.body = JSON.stringify(data);
    }
    const response = await fetch(url, options);
    const result = await response.json();
    if (!response.ok) {
        throw new Error(result.message || `REST request failed with status ${response.status}`);
    }
    return result;
}

// ----------------------------------------------------
// CORE API EXPORTS
// ----------------------------------------------------
const Api = {
    getConfig,
    updateConfig,

    // Health checks
    async checkServiceHealth(name, url) {
        try {
            const start = Date.now();
            let checkUrl = url;
            if (name === 'hasura') {
                checkUrl = url.replace('/v1/graphql', '/healthz');
            } else if (name === 'order') {
                checkUrl = `${url}/orders`;
            } else if (name === 'product') {
                checkUrl = `${url}/products`;
            } else if (name === 'login') {
                checkUrl = `${url}/auth/login`; // Ping login route or public route
            }
            
            // Fetch with 3s timeout
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), 3000);
            
            await fetch(checkUrl, { 
                method: 'GET',
                mode: 'no-cors', 
                signal: controller.signal 
            });
            
            clearTimeout(id);
            return { online: true, latency: Date.now() - start };
        } catch (e) {
            return { online: false, error: e.message };
        }
    },

    // Authentication Services
    async login(email, password) {
        const config = getConfig();
        if (config.mockMode) {
            if (email === "user@bajamas.com" && password === "password123") {
                return {
                    user: { id: 1, name: "Nuruddin Bajamas", email, role: "customer" },
                    token: "mock-jwt-token-12345"
                };
            } else if (email === "admin@bajamas.com" && password === "admin123") {
                return {
                    user: { id: 2, name: "Admin Bajamas", email, role: "admin" },
                    token: "mock-jwt-token-67890"
                };
            } else {
                throw new Error("Email atau password mock salah. (Hint: user@bajamas.com / password123)");
            }
        }

        // Call the actual REST API: POST /api/auth/login
        const res = await restRequest(`${config.loginUrl}/auth/login`, 'POST', { email, password });
        if (res.success && res.data) {
            return {
                user: res.data.user,
                token: res.data.token
            };
        } else {
            throw new Error(res.message || "Email atau password salah.");
        }
    },

    async register(name, email, password, role = "customer") {
        const config = getConfig();
        if (config.mockMode) {
            return { id: 99, name, email, role };
        }

        // Call the actual REST API: POST /api/auth/register
        const res = await restRequest(`${config.loginUrl}/auth/register`, 'POST', { name, email, password, role });
        if (res.success && res.data) {
            return res.data.user;
        } else {
            throw new Error(res.message || "Gagal mendaftar akun baru.");
        }
    },

    // Catalog Services
    async getCategories() {
        const config = getConfig();
        if (config.mockMode) {
            return MOCK_CATEGORIES;
        }

        try {
            // Call the actual REST API: GET /api/categories
            const res = await restRequest(`${config.productUrl}/categories`);
            if (res.success && res.data) {
                return res.data;
            }
            return res;
        } catch (e) {
            console.warn("Live API Get Categories failed, falling back to mock", e.message);
            return MOCK_CATEGORIES;
        }
    },

    async getProducts() {
        const config = getConfig();
        if (config.mockMode) {
            return MOCK_PRODUCTS;
        }

        try {
            // Call the actual REST API: GET /api/products
            const res = await restRequest(`${config.productUrl}/products`);
            const productsList = res.success && res.data ? res.data : res;
            
            // Map images to the products for high-end look
            return productsList.map(p => {
                const mockMatch = MOCK_PRODUCTS.find(mp => mp.name.toLowerCase().includes(p.name.toLowerCase()));
                return {
                    ...p,
                    image: mockMatch ? mockMatch.image : 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&q=80&w=600'
                };
            });
        } catch (e) {
            console.warn("Live API Get Products failed, falling back to mock", e.message);
            return MOCK_PRODUCTS;
        }
    },

    // Order Services
    async getOrders(userId) {
        const config = getConfig();
        if (config.mockMode) {
            return mockOrders.filter(o => o.user_id === userId);
        }

        try {
            const token = localStorage.getItem('token');
            // Call the actual REST API: GET /api/v1/orders/user/{userId}
            const res = await restRequest(`${config.orderUrl}/orders/user/${userId}`, 'GET', null, token);
            return res.data || res;
        } catch (e) {
            console.warn("Live API Get Orders failed, falling back to mock", e.message);
            return mockOrders.filter(o => o.user_id === userId);
        }
    },

    async createOrder(userId, items) {
        const config = getConfig();
        const token = localStorage.getItem('token');
        
        // Match actual parameters expected by StoreOrderRequest
        const payloadItems = items.map(item => ({
            product_id: parseInt(item.product.id),
            product_name: item.product.name,
            price: parseFloat(item.product.price),
            quantity: parseInt(item.quantity)
        }));

        if (config.mockMode) {
            const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
            const newOrder = {
                id: mockOrders.length + 1001,
                order_code: `ORD-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(1000 + Math.random()*9000)}`,
                user_id: userId,
                status: 'pending',
                subtotal: subtotal,
                total_price: subtotal,
                created_at: new Date().toLocaleString(),
                updated_at: new Date().toLocaleString(),
                items: items.map((item, idx) => ({
                    id: idx + 1,
                    product_id: item.product.id,
                    product_name: item.product.name,
                    price: item.product.price,
                    quantity: item.quantity,
                    subtotal: item.product.price * item.quantity
                }))
            };
            mockOrders.unshift(newOrder);
            
            // Add notification
            const newNotification = {
                id: mockNotifications.length + 1,
                user_id: String(userId),
                email: "user@bajamas.com",
                type: "ORDER_CREATED",
                message: `Pesanan baru ${newOrder.order_code} berhasil dibuat! Menunggu pembayaran.`,
                status: "sent",
                created_at: new Date().toLocaleString()
            };
            mockNotifications.unshift(newNotification);
            saveMockData();
            return newOrder;
        }

        // Call actual REST API: POST /api/v1/orders
        const res = await restRequest(`${config.orderUrl}/orders`, 'POST', {
            user_id: userId,
            items: payloadItems
        }, token);
        return res.data || res;
    },

    // Payment Simulation
    async payOrder(orderId) {
        const config = getConfig();
        const token = localStorage.getItem('token');
        
        if (config.mockMode) {
            const order = mockOrders.find(o => o.id === parseInt(orderId));
            if (order) {
                order.status = 'paid';
                order.updated_at = new Date().toLocaleString();
                
                const newNotification = {
                    id: mockNotifications.length + 1,
                    user_id: String(order.user_id),
                    email: "user@bajamas.com",
                    type: "PAYMENT_SUCCESS",
                    message: `Pembayaran pesanan ${order.order_code} SUKSES. Status pesanan berubah menjadi PAID.`,
                    status: "sent",
                    created_at: new Date().toLocaleString()
                };
                mockNotifications.unshift(newNotification);
                saveMockData();
                return { success: true, order };
            }
            throw new Error("Order not found");
        }

        // Call the actual REST API to update status: PATCH /api/v1/orders/{id}/status
        const res = await restRequest(`${config.orderUrl}/orders/${orderId}/status`, 'PATCH', {
            status: 'paid'
        }, token);
        return { success: true, order: res.data || res };
    },

    // Notification Services
    async getNotifications() {
        const config = getConfig();
        if (config.mockMode) {
            return mockNotifications;
        }

        // GraphQL Query for Notifications via Hasura gateway
        const query = `
            query {
                notifications {
                    id
                    user_id
                    email
                    type
                    message
                    status
                    created_at
                }
            }
        `;
        try {
            const data = await graphqlRequest(config.hasuraUrl, query);
            return data.notifications;
        } catch (e) {
            console.warn("Live API Get Notifications failed, falling back to mock", e.message);
            return mockNotifications;
        }
    }
};

window.Api = Api;
