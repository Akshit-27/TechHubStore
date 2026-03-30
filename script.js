document.addEventListener('DOMContentLoaded', () => {
    const header = document.getElementById('header');

    // Sticky Header Logic
    const handleScroll = () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    // Smooth Scrolling for Anchors
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // --- SHOPPING CART & DYNAMIC PRODUCT LOGIC ---

    const categories = [
        { name: "Assembled computers", icon: "fa-desktop" },
        { name: "Computer peripherals parts", icon: "fa-keyboard" },
        { name: "Laptops", icon: "fa-laptop" },
        { name: "Laptop accessories", icon: "fa-headphones" },
        { name: "Printers", icon: "fa-print" },
        { name: "Anti-virus & ERP software's", icon: "fa-shield-halved" }
    ];

    // Default products if local storage is empty
    const defaultProducts = [
        { id: 1, name: "Ryzen 5 Custom Build", category: "Assembled computers", price: 35000, description: "High-performance assembled desktop for work and gaming.", image: "https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=400" },
        { id: 2, name: "Mechanical Keyboard", category: "Computer peripherals parts", price: 2500, description: "RGB Mechanical Keyboard with blue switches.", image: "https://images.unsplash.com/photo-1595225476474-87563907a212?w=400" },
        { id: 3, name: "Dell Inspiron 15", category: "Laptops", price: 45000, description: "Modern thin and light laptop.", image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400" },
        { id: 4, name: "Wireless Laptop Mouse", category: "Laptop accessories", price: 650, description: "Ergonomic wireless mouse.", image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400" }
    ];

    let products = JSON.parse(localStorage.getItem('products')) || defaultProducts;
    if (!localStorage.getItem('products')) {
        localStorage.setItem('products', JSON.stringify(products));
    }

    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    const productGrid = document.getElementById('productGrid');
    const floatingCartBtn = document.getElementById('floatingCartBtn');
    const cartOverlay = document.getElementById('cartOverlay');
    const closeCartBtn = document.getElementById('closeCartBtn');
    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotalEl = document.getElementById('cartTotal');
    const cartCountBadge = document.getElementById('cartCountBadge');
    const whatsappCheckoutBtn = document.getElementById('whatsappCheckoutBtn');

    // Shop Section Header Text hooks
    const shopHeader = document.querySelector('#shop .section-header h2');
    const shopSubtitle = document.querySelector('#shop .section-subtitle');

    // 1. Render Categories View
    function renderCategories() {
        if (!productGrid) return;

        // Reset headers
        if(shopHeader) shopHeader.innerText = "Shop by Category";
        if(shopSubtitle) shopSubtitle.innerHTML = "Select a category to browse our curated inventory.";

        productGrid.innerHTML = '';
        categories.forEach(cat => {
            const card = document.createElement('div');
            card.className = 'service-card product-card text-center';
            card.style.cursor = 'pointer';
            card.style.display = 'flex';
            card.style.flexDirection = 'column';
            card.style.alignItems = 'center';
            card.style.justifyContent = 'center';
            
            card.innerHTML = `
                <div class="service-icon" style="margin: 0 auto 16px;"><i class="fa-solid ${cat.icon}"></i></div>
                <h3 style="margin-bottom:8px; font-size:1.125rem;">${cat.name}</h3>
                <p style="color:var(--text-light); font-size: 0.875rem;">Click to explore</p>
            `;
            
            card.addEventListener('click', () => {
                renderProducts(cat.name);
            });
            productGrid.appendChild(card);
        });
    }

    // 2. Render Products View (Filtering by Category)
    function renderProducts(categoryName) {
        if (!productGrid) return;
        
        // Always refresh storage strictly to get any new products added by another admin tab
        products = JSON.parse(localStorage.getItem('products')) || products;

        // Change Text and add a Back Button
        if(shopHeader) shopHeader.innerText = categoryName;
        if(shopSubtitle) {
            shopSubtitle.innerHTML = `<button class="btn btn-outline btn-sm" id="backToCategoriesBtn" style="margin-top:20px; font-size: 0.875rem;"><i class="fa-solid fa-arrow-left" style="margin-right:8px;"></i> Back to Categories</button>`;
            document.getElementById('backToCategoriesBtn').addEventListener('click', renderCategories);
        }

        const filteredProducts = products.filter(p => p.category === categoryName);
        
        productGrid.innerHTML = '';
        if (filteredProducts.length === 0) {
            productGrid.innerHTML = '<p class="text-center" style="grid-column: 1/-1; padding: 40px 0;">No products available in this category yet.</p>';
            return;
        }

        filteredProducts.forEach(prod => {
            const card = document.createElement('div');
            card.className = 'service-card product-card';
            card.style.padding = '0';
            card.style.overflow = 'hidden';
            card.style.display = 'flex';
            card.style.flexDirection = 'column';

            card.innerHTML = `
                <img src="${prod.image}" alt="${prod.name}" style="width:100%; height:200px; object-fit:cover;">
                <div style="padding: 24px; flex-grow: 1; display:flex; flex-direction:column;">
                    <span class="section-badge" style="font-size:0.7rem; margin-bottom:8px; align-self:flex-start;">${prod.category}</span>
                    <h3 style="margin-bottom:8px; font-size:1.125rem;">${prod.name}</h3>
                    <p style="margin-bottom:16px; flex-grow:1; color: var(--text-light);">${prod.description}</p>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:auto;">
                        <span style="font-size:1.25rem; font-weight:bold; color:var(--primary-color);">₹${prod.price}</span>
                        <button class="btn btn-primary btn-sm add-to-cart-btn" data-id="${prod.id}" style="padding: 8px 16px;"><i class="fa-solid fa-plus" style="margin-right:8px;"></i> Add</button>
                    </div>
                </div>
            `;
            productGrid.appendChild(card);
        });

        document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => addToCart(parseInt(e.currentTarget.dataset.id)));
        });
    }

    function updateCartUI() {
        if(!floatingCartBtn) return;
        
        // Update badge
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (totalItems > 0) {
            cartCountBadge.style.display = 'block';
            cartCountBadge.innerText = totalItems;
        } else {
            cartCountBadge.style.display = 'none';
        }

        // Render Cart items
        cartItemsContainer.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="text-center" style="margin-top:40px; color:var(--text-light);">Your cart is empty.</p>';
        } else {
            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                total += itemTotal;
                
                const div = document.createElement('div');
                div.style.display = 'flex';
                div.style.justifyContent = 'space-between';
                div.style.alignItems = 'center';
                div.style.padding = '12px 0';
                div.style.borderBottom = '1px solid #E2E8F0';
                
                div.innerHTML = `
                    <div style="flex-grow:1;">
                        <h4 style="font-size:1rem; margin-bottom:4px;">${item.name}</h4>
                        <div style="color:var(--text-light); font-size:0.875rem;">₹${item.price} x ${item.quantity}</div>
                    </div>
                    <div style="font-weight:bold; margin-right: 16px;">₹${itemTotal}</div>
                    <button class="btn btn-outline btn-sm remove-cart-btn" data-id="${item.id}" style="padding: 4px 8px; color:red; border-color:red;"><i class="fa-solid fa-trash"></i></button>
                `;
                cartItemsContainer.appendChild(div);
            });
        }
        
        cartTotalEl.innerText = '₹' + total;

        document.querySelectorAll('.remove-cart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => removeFromCart(parseInt(e.currentTarget.dataset.id)));
        });
    }

    function addToCart(id) {
        products = JSON.parse(localStorage.getItem('products')) || products;

        const product = products.find(p => p.id === id);
        if (!product) return;

        const cartItem = cart.find(item => item.id === id);
        if (cartItem) {
            cartItem.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartUI();
        
        // Open cart to show user
        cartOverlay.classList.add('active');
    }

    function removeFromCart(id) {
        cart = cart.filter(item => item.id !== id);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartUI();
    }

    // Modal Events
    if(floatingCartBtn) {
        floatingCartBtn.addEventListener('click', () => {
            cartOverlay.classList.add('active');
        });
        closeCartBtn.addEventListener('click', () => {
            cartOverlay.classList.remove('active');
        });
        
        cartOverlay.addEventListener('click', (e) => {
            if(e.target === cartOverlay) cartOverlay.classList.remove('active');
        });
    }

    // WhatsApp Checkout
    if(whatsappCheckoutBtn) {
        whatsappCheckoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                alert("Your cart is empty!");
                return;
            }

            let message = "Hello Innovative Infosys! I would like to place an order:%0A%0A";
            let total = 0;
            
            cart.forEach(item => {
                const rowTotal = item.price * item.quantity;
                total += rowTotal;
                message += `- ${item.name} (x${item.quantity}) = ₹${rowTotal}%0A`;
            });
            
            message += `%0A*Total: ₹${total}*%0A%0APlease let me know the payment options and delivery details.`;
            
            // Redirect to WhatsApp
            window.open(`https://wa.me/918275529990?text=${message}`, '_blank');
            
            // Auto Clear Cart
            cart = [];
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartUI();
            cartOverlay.classList.remove('active');
        });
    }

    // Init Storefront View
    renderCategories();
    updateCartUI();
});
