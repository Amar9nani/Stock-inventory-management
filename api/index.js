// Serverless function for Vercel
const express = require('express');
const cors = require('cors');
const { json, urlencoded } = require('body-parser');
const memorystore = require('memorystore');
const session = require('express-session');
const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');
const crypto = require('crypto');
const util = require('util');

// Initialize Express
const app = express();
const MemoryStore = memorystore(session);

// Enable CORS with options
app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = [
      'https://' + (process.env.VERCEL_URL || ''),
      process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : '',
      process.env.FRONTEND_URL || '',
      'http://localhost:3000',
      'http://localhost:5000'
    ].filter(Boolean);
    
    callback(null, origin === undefined || allowedOrigins.includes(origin));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Add basic middleware
app.use(json());
app.use(urlencoded({ extended: true }));

// Set environment variables if not already set
process.env.SESSION_SECRET = process.env.SESSION_SECRET || 'supermarket-stock-manager-secret';
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

// Handle preflight OPTIONS requests (important for CORS)
app.options('*', cors());

// Create Promise-based utility functions
const scryptAsync = util.promisify(crypto.scrypt);

try {
  // Configure session
  const sessionStore = new MemoryStore({
    checkPeriod: 86400000 // prune expired entries every 24h
  });

  // Setup session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    }
  }));

  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());

  // In-memory storage for the serverless function
  const users = new Map();
  const products = new Map();
  const transactions = new Map();

  // Add default admin user
  const adminUsername = "Amarnadh";
  const adminPassword = "Amar.nadi@2004";
  
  // Function to hash passwords
  async function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const derivedKey = await scryptAsync(password, salt, 64);
    return derivedKey.toString('hex') + '.' + salt;
  }
  
  // Function to compare passwords
  async function comparePasswords(supplied, stored) {
    const [hash, salt] = stored.split('.');
    const derivedKey = await scryptAsync(supplied, salt, 64);
    return crypto.timingSafeEqual(
      Buffer.from(hash, 'hex'),
      derivedKey
    );
  }
  
  // Set up admin user if not exists
  (async function() {
    if (!users.has(adminUsername)) {
      const hashedPassword = await hashPassword(adminPassword);
      users.set(adminUsername, {
        id: 1,
        username: adminUsername,
        password: hashedPassword,
        email: "namarnadh.9@gmail.com",
        role: "admin"
      });
      console.log("Admin user created successfully");
    }
  })();
  
  // Configure Passport local strategy
  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      const user = users.get(username);
      if (!user) {
        return done(null, false, { message: 'Invalid username or password' });
      }
      
      const isValid = await comparePasswords(password, user.password);
      if (!isValid) {
        return done(null, false, { message: 'Invalid username or password' });
      }
      
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }));
  
  // Serialize user to session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  // Deserialize user from session
  passport.deserializeUser((id, done) => {
    try {
      // Find user by id (simple version for serverless)
      const user = Array.from(users.values()).find(u => u.id === id);
      done(null, user || null);
    } catch (error) {
      done(error);
    }
  });
  
  // Auth routes
  app.post('/api/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) {
        return res.status(500).json({ message: 'Authentication error', details: err.message });
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || 'Invalid username or password' });
      }
      
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: 'Login error', details: err.message });
        }
        return res.json({
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        });
      });
    })(req, res, next);
  });
  
  app.post('/api/logout', (req, res) => {
    req.logout(function(err) {
      if (err) {
        return res.status(500).json({ message: 'Logout failed', details: err.message });
      }
      res.status(200).json({ message: 'Logged out successfully' });
    });
  });
  
  app.get('/api/user', (req, res) => {
    if (req.isAuthenticated()) {
      return res.json({
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role
      });
    }
    return res.status(401).json({ message: 'Not authenticated' });
  });
  
  app.post('/api/register', async (req, res) => {
    try {
      const { username, password, email } = req.body;
      
      // Check if user already exists
      if (users.has(username)) {
        return res.status(400).json({ message: 'Username already exists' });
      }
      
      // Create new user
      const hashedPassword = await hashPassword(password);
      const newUser = {
        id: users.size + 1,
        username,
        password: hashedPassword,
        email,
        role: 'user'
      };
      
      users.set(username, newUser);
      
      // Login the new user
      req.login(newUser, (err) => {
        if (err) {
          return res.status(500).json({ message: 'Login failed after registration', details: err.message });
        }
        
        return res.status(201).json({
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role
        });
      });
    } catch (error) {
      res.status(500).json({ 
        message: 'Registration failed', 
        details: error.message 
      });
    }
  });
  
  // Middleware to check if user is authenticated
  function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: 'Authentication required' });
  }
  
  // Middleware to check if user is admin
  function isAdmin(req, res, next) {
    if (req.isAuthenticated() && req.user.role === 'admin') {
      return next();
    }
    res.status(403).json({ message: 'Admin access required' });
  }
  
  // Simple product data
  products.set(1, { id: 1, name: "Organic Whole Milk", category: "Dairy & Eggs", price: 89, stockQuantity: 45, itemsSold: 120 });
  products.set(2, { id: 2, name: "Whole Wheat Bread", category: "Bakery", price: 45, stockQuantity: 30, itemsSold: 80 });
  products.set(3, { id: 3, name: "Organic Banana Bunch", category: "Produce", price: 59, stockQuantity: 25, itemsSold: 150 });
  products.set(4, { id: 4, name: "Fresh Chicken Breast", category: "Meat & Seafood", price: 199, stockQuantity: 15, itemsSold: 75 });
  products.set(5, { id: 5, name: "Mineral Water (1L)", category: "Beverages", price: 20, stockQuantity: 60, itemsSold: 200 });
  
  // Product routes
  app.get('/api/products', (req, res) => {
    res.json(Array.from(products.values()));
  });
  
  app.get('/api/products/:id', (req, res) => {
    const product = products.get(parseInt(req.params.id));
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  });
  
  app.post('/api/products', isAdmin, (req, res) => {
    const newId = products.size + 1;
    const newProduct = { id: newId, ...req.body, itemsSold: 0 };
    products.set(newId, newProduct);
    res.status(201).json(newProduct);
  });
  
  app.put('/api/products/:id', isAdmin, (req, res) => {
    const id = parseInt(req.params.id);
    const product = products.get(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    const updatedProduct = { ...product, ...req.body };
    products.set(id, updatedProduct);
    res.json(updatedProduct);
  });
  
  app.delete('/api/products/:id', isAdmin, (req, res) => {
    const id = parseInt(req.params.id);
    if (!products.has(id)) {
      return res.status(404).json({ message: 'Product not found' });
    }
    products.delete(id);
    res.status(204).send();
  });
  
  // Transaction routes
  app.get('/api/transactions', isAuthenticated, (req, res) => {
    res.json(Array.from(transactions.values()));
  });
  
  app.post('/api/transactions', isAuthenticated, (req, res) => {
    const { productId, quantity, type } = req.body;
    const product = products.get(productId);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const newId = transactions.size + 1;
    const totalPrice = product.price * quantity;
    const date = new Date().toISOString().split('T')[0];
    
    const newTransaction = {
      id: newId,
      productId,
      quantity,
      totalPrice,
      type,
      date,
      transactionDate: date
    };
    
    transactions.set(newId, newTransaction);
    
    // Update product stock
    if (type === 'sale') {
      product.stockQuantity -= quantity;
      product.itemsSold += quantity;
    } else if (type === 'restock') {
      product.stockQuantity += quantity;
    } else if (type === 'return') {
      product.stockQuantity += quantity;
      product.itemsSold -= quantity;
    }
    
    products.set(productId, product);
    
    res.status(201).json(newTransaction);
  });
  
  // Analytics routes
  app.get('/api/stock', isAuthenticated, (req, res) => {
    const allProducts = Array.from(products.values());
    const totalProducts = allProducts.length;
    const lowStockCount = allProducts.filter(p => p.stockQuantity < 20).length;
    
    // Calculate total revenue and items sold
    const totalRevenue = allProducts.reduce((sum, p) => sum + (p.itemsSold * p.price), 0);
    const totalItemsSold = allProducts.reduce((sum, p) => sum + p.itemsSold, 0);
    
    res.json({
      totalProducts,
      lowStockCount,
      totalRevenue,
      totalItemsSold
    });
  });
  
  app.get('/api/analytics/sales', isAuthenticated, (req, res) => {
    // Generate 7 days of sample data
    const sales = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      sales.push({
        date: dateStr,
        revenue: Math.floor(Math.random() * 10000) + 1000,
        items: Math.floor(Math.random() * 100) + 50
      });
    }
    
    res.json(sales);
  });
  
  app.get('/api/analytics/top-products', isAuthenticated, (req, res) => {
    const topProducts = Array.from(products.values())
      .sort((a, b) => b.itemsSold - a.itemsSold)
      .slice(0, 5)
      .map(p => ({
        name: p.name,
        sales: p.itemsSold,
        revenue: p.itemsSold * p.price
      }));
    
    res.json(topProducts);
  });
  
  // User management routes
  app.get('/api/users', isAdmin, (req, res) => {
    const userList = Array.from(users.values()).map(u => ({
      id: u.id,
      username: u.username,
      email: u.email,
      role: u.role
    }));
    
    res.json(userList);
  });
  
  app.delete('/api/users/:id', isAdmin, (req, res) => {
    const id = parseInt(req.params.id);
    const userToDelete = Array.from(users.values()).find(u => u.id === id);
    
    if (!userToDelete) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Don't delete yourself
    if (req.user && req.user.id === id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    
    users.delete(userToDelete.username);
    res.status(204).send();
  });

} catch (error) {
  // Handle any setup errors
  app.use((req, res) => {
    res.status(500).json({ 
      error: 'Server initialization failed', 
      details: error.message,
      stack: error.stack
    });
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// For Vercel serverless function
module.exports = app;