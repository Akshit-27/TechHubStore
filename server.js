const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
// Serve static frontend files from current directory
app.use(express.static(__dirname));

const dataFilePath = path.join(__dirname, 'data', 'products.json');

// Helper to read data
function readProducts() {
    try {
        const data = fs.readFileSync(dataFilePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
}

// Helper to write data
function writeProducts(products) {
    fs.writeFileSync(dataFilePath, JSON.stringify(products, null, 2), 'utf8');
}

// ----- API ENDPOINTS -----

// GET: All products
app.get('/api/products', (req, res) => {
    const products = readProducts();
    res.json(products);
});

// POST: Add new product (Requires basic generic auth 'admin123')
// Disclaimer: Extremely basic auth meant for simple prototype protection
const checkAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader === 'Bearer admin123') {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized. Incorrect Admin Password.' });
    }
};

app.post('/api/products', checkAuth, (req, res) => {
    const products = readProducts();
    const newProduct = {
        id: Date.now(), // simple unique id
        name: req.body.name,
        category: req.body.category,
        price: parseFloat(req.body.price),
        description: req.body.description,
        image: req.body.image || 'https://via.placeholder.com/400x300?text=No+Image'
    };
    
    products.push(newProduct);
    writeProducts(products);
    res.status(201).json(newProduct);
});

// PUT: Update Product
app.put('/api/products/:id', checkAuth, (req, res) => {
    const products = readProducts();
    const productId = parseInt(req.params.id);
    const index = products.findIndex(p => p.id === productId);
    
    if (index !== -1) {
        products[index] = {
            ...products[index],
            name: req.body.name,
            category: req.body.category,
            price: parseFloat(req.body.price),
            description: req.body.description,
            image: req.body.image || products[index].image
        };
        writeProducts(products);
        res.json(products[index]);
    } else {
        res.status(404).json({ error: 'Product not found' });
    }
});

// DELETE: Remove Product
app.delete('/api/products/:id', checkAuth, (req, res) => {
    const products = readProducts();
    const productId = parseInt(req.params.id);
    const updatedProducts = products.filter(p => p.id !== productId);
    
    if (products.length !== updatedProducts.length) {
        writeProducts(updatedProducts);
        res.json({ message: 'Product deleted' });
    } else {
        res.status(404).json({ error: 'Product not found' });
    }
});

// Admin validation endpoint (mock)
app.post('/api/auth', (req, res) => {
    const { password } = req.body;
    if (password === 'admin123') {
        res.json({ token: 'admin123' });
    } else {
        res.status(401).json({ error: 'Invalid password' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
