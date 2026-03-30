document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const loginView = document.getElementById('login-view');
    const dashboardView = document.getElementById('dashboard-view');
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('login-error');
    const logoutBtn = document.getElementById('logoutBtn');
    
    const productTableBody = document.getElementById('productTableBody');
    const addNewBtn = document.getElementById('addNewBtn');
    const productModal = document.getElementById('productModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const productForm = document.getElementById('productForm');
    const modalTitle = document.getElementById('modalTitle');

    // Image Upload Elements
    const prodImageFile = document.getElementById('prodImageFile');
    const prodImageBase64 = document.getElementById('prodImageBase64');
    const imagePreview = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');

    // Default Products mapped to new strict categories
    const defaultProducts = [
        { id: 1, name: "Ryzen 5 Custom Build", category: "Assembled computers", price: 35000, description: "High-performance assembled desktop for work and gaming.", image: "https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=400" },
        { id: 2, name: "Mechanical Keyboard", category: "Computer peripherals parts", price: 2500, description: "RGB Mechanical Keyboard with blue switches.", image: "https://images.unsplash.com/photo-1595225476474-87563907a212?w=400" },
        { id: 3, name: "Dell Inspiron 15", category: "Laptops", price: 45000, description: "Modern thin and light laptop.", image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400" },
        { id: 4, name: "Wireless Laptop Mouse", category: "Laptop accessories", price: 650, description: "Ergonomic wireless mouse.", image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400" }
    ];

    // State
    let authToken = localStorage.getItem('adminToken') || null;
    let products = JSON.parse(localStorage.getItem('products')) || defaultProducts;

    // Save defaults to storage if missing
    if (!localStorage.getItem('products')) {
        localStorage.setItem('products', JSON.stringify(products));
    }

    // Init Auth
    if (authToken) { showDashboard(); }

    // Login logic
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const pwd = document.getElementById('password').value;
        if (pwd === 'admin123') {
            authToken = 'admin_logged_in';
            localStorage.setItem('adminToken', authToken);
            loginError.style.display = 'none';
            showDashboard();
        } else {
            loginError.style.display = 'block';
        }
    });

    // Logout
    logoutBtn.addEventListener('click', () => {
        authToken = null;
        localStorage.removeItem('adminToken');
        dashboardView.style.display = 'none';
        loginView.style.display = 'flex';
        document.getElementById('password').value = '';
    });

    function showDashboard() {
        loginView.style.display = 'none';
        dashboardView.style.display = 'block';
        renderTable();
    }

    function renderTable() {
        productTableBody.innerHTML = '';
        if (products.length === 0) {
            productTableBody.innerHTML = `<tr><td colspan="5" class="text-center">No products found. Add one!</td></tr>`;
            return;
        }

        products.forEach(prod => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="product-image-cell"><img src="${prod.image}" alt="${prod.name}"></td>
                <td><strong>${prod.name}</strong><br><small style="color:var(--text-light)">${prod.description.substring(0,30)}...</small></td>
                <td><span class="section-badge" style="margin:0; padding:4px 8px; font-size:0.75rem;">${prod.category}</span></td>
                <td>₹${prod.price}</td>
                <td class="action-btns">
                    <button class="btn btn-outline btn-sm edit-btn" data-id="${prod.id}"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn btn-outline btn-sm delete-btn" data-id="${prod.id}" style="color:red; border-color:red;"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;
            productTableBody.appendChild(tr);
        });

        document.querySelectorAll('.edit-btn').forEach(btn => btn.addEventListener('click', (e) => openModal(parseInt(e.currentTarget.dataset.id))));
        document.querySelectorAll('.delete-btn').forEach(btn => btn.addEventListener('click', (e) => deleteProduct(parseInt(e.currentTarget.dataset.id))));
    }

    // Image Compression & File Reading Logic
    prodImageFile.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if(!file) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                // Compress via HTML5 Canvas
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 500;
                
                let width = img.width;
                let height = img.height;
                
                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }
                
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                // Get Base64 String (JPEG format, 70% quality reduces filesize heavily)
                const dataUrl = canvas.toDataURL('image/jpeg', 0.7); 
                
                prodImageBase64.value = dataUrl;
                previewImg.src = dataUrl;
                imagePreview.style.display = 'block';
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });


    addNewBtn.addEventListener('click', () => openModal());
    closeModalBtn.addEventListener('click', () => {
        productModal.classList.remove('active');
        productForm.reset();
    });

    function openModal(id = null) {
        productForm.reset();
        document.getElementById('prodId').value = '';
        prodImageBase64.value = '';
        imagePreview.style.display = 'none';
        
        if (id) {
            modalTitle.innerText = 'Edit Product';
            const prod = products.find(p => p.id === id);
            if (prod) {
                document.getElementById('prodId').value = prod.id;
                document.getElementById('prodName').value = prod.name;
                document.getElementById('prodCategory').value = prod.category;
                document.getElementById('prodPrice').value = prod.price;
                document.getElementById('prodDesc').value = prod.description;
                
                // Set image
                prodImageBase64.value = prod.image;
                previewImg.src = prod.image;
                imagePreview.style.display = 'block';
                
                // We cannot pre-fill a file input `<input type="file">` for security reasons in JS,
                // so we just show the existing image preview which is powered by the base64 hidden input.
            }
        } else {
            modalTitle.innerText = 'List New Product';
        }
        productModal.classList.add('active');
    }

    productForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('prodId').value;
        const base64Image = document.getElementById('prodImageBase64').value || 'https://via.placeholder.com/400x300?text=No+Image';
        
        const newProd = {
            id: id ? parseInt(id) : Date.now(),
            name: document.getElementById('prodName').value,
            category: document.getElementById('prodCategory').value,
            price: parseFloat(document.getElementById('prodPrice').value),
            description: document.getElementById('prodDesc').value,
            image: base64Image
        };

        if (id) {
            const index = products.findIndex(p => p.id === parseInt(id));
            if (index !== -1) products[index] = newProd;
        } else {
            products.push(newProd);
        }

        try {
            localStorage.setItem('products', JSON.stringify(products));
            productModal.classList.remove('active');
            renderTable();
        } catch(err) {
            // LocalStorage Full Trap!
            alert("Error: Storage Quota Exceeded. You have uploaded too many products for a browser demo!");
        }
    });

    function deleteProduct(id) {
        if (!confirm("Are you sure you want to delete this product?")) return;
        products = products.filter(p => p.id !== id);
        localStorage.setItem('products', JSON.stringify(products));
        renderTable();
    }
});
