// Serverless function for Vercel
const express = require('express');
const { createServer } = require('http');
const path = require('path');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');
const { json, urlencoded } = require('body-parser');
const crypto = require('crypto');
const fs = require('fs');
const MemoryStore = require('memorystore')(session);

const app = express();

// Custom error handler middleware
app.use((req, res, next) => {
  try {
    next();
  } catch (error) {
    console.error('Middleware error:', error);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc)
    if (!origin) return callback(null, true);
    
    // Check if origin is allowed
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5000',
      'https://supermarket-stock-management.vercel.app'
    ];
    
    // Add Vercel deployment URL if available
    if (process.env.VERCEL_URL) {
      allowedOrigins.push(`https://${process.env.VERCEL_URL}`);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

app.use(cors(corsOptions));
app.use(json());
app.use(urlencoded({ extended: true }));

// Handle OPTIONS requests for CORS preflight
app.options('*', cors(corsOptions)); 

// Add cookie parser middleware
app.use(require('cookie-parser')());

// Required for Express session
process.env.SESSION_SECRET = process.env.SESSION_SECRET || 'supermarket-stock-manager-secret';
process.env.NODE_ENV = process.env.NODE_ENV || 'production'; // Ensure proper environment for Vercel

// Setup session
const sessionConfig = {
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: new MemoryStore({
    checkPeriod: 86400000 // Prune expired entries every 24h
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    // Allow cookies from any domain in production to fix cross-domain issues
    domain: process.env.NODE_ENV === 'production' ? undefined : undefined
  }
};

// Debug session setup
console.log('Session configuration:', {
  nodeEnv: process.env.NODE_ENV,
  cookieSecure: sessionConfig.cookie.secure,
  cookieSameSite: sessionConfig.cookie.sameSite,
  hasSecret: !!process.env.SESSION_SECRET
});

app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());

// In-memory storage for serverless environment
const users = [
  {
    id: 1,
    username: 'Amarnadh',
    password: hashPassword('Amar.nadi@2004'),
    email: 'namarnadh.9@gmail.com',
    role: 'admin'
  },
  {
    id: 2,
    username: 'user',
    password: hashPassword('password123'),
    email: 'user@example.com',
    role: 'user'
  }
];

const products = [
  {
    id: 1,
    name: 'Milk',
    price: 48.50,
    category: 'Dairy & Eggs',
    quantity: 100,
    description: 'Fresh milk',
    threshold: 20
  },
  // Add more products as needed
];

const transactions = [];

// Passport configuration
passport.use(new LocalStrategy(async (username, password, done) => {
  try {
    const user = users.find(u => u.username === username);
    if (!user || !comparePasswords(password, user.password)) {
      return done(null, false, { message: 'Incorrect username or password' });
    }
    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  const user = users.find(u => u.id === id);
  done(null, user);
});

// Password hashing functions
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${hash}.${salt}`;
}

function comparePasswords(supplied, stored) {
  const [hash, salt] = stored.split('.');
  const suppliedHash = crypto.scryptSync(supplied, salt, 64).toString('hex');
  return hash === suppliedHash;
}

// Authentication middleware
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Not authenticated' });
}

function isAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.role === 'admin') {
    return next();
  }
  res.status(403).json({ message: 'Admin access required' });
}

// API Routes
const apiRouter = express.Router();

// Authentication routes
apiRouter.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    
    req.login(user, (err) => {
      if (err) return next(err);
      return res.json(user);
    });
  })(req, res, next);
});

apiRouter.post('/logout', (req, res) => {
  req.logout(function(err) {
    if (err) return res.status(500).json({ message: 'Logout failed', error: err.message });
    res.status(200).json({ message: 'Logged out successfully' });
  });
});

apiRouter.post('/register', (req, res) => {
  const { username, password, email } = req.body;
  
  // Check if username already exists
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ message: 'Username already exists' });
  }
  
  const newUser = {
    id: users.length + 1,
    username,
    password: hashPassword(password),
    email,
    role: 'user'
  };
  
  users.push(newUser);
  
  req.login(newUser, (err) => {
    if (err) return res.status(500).json({ message: 'Login failed after registration', error: err.message });
    return res.status(201).json(newUser);
  });
});

apiRouter.get('/user', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  // Don't send password to client
  const { password, ...userWithoutPassword } = req.user;
  res.json(userWithoutPassword);
});

// Product routes
apiRouter.get('/products', (req, res) => {
  res.json(products);
});

apiRouter.get('/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const product = products.find(p => p.id === id);
  
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  
  res.json(product);
});

apiRouter.post('/products', isAdmin, (req, res) => {
  const { name, price, category, quantity, description, threshold } = req.body;
  
  const newProduct = {
    id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
    name,
    price: parseFloat(price),
    category,
    quantity: parseInt(quantity),
    description,
    threshold: parseInt(threshold)
  };
  
  products.push(newProduct);
  res.status(201).json(newProduct);
});

apiRouter.put('/products/:id', isAdmin, (req, res) => {
  const id = parseInt(req.params.id);
  const productIndex = products.findIndex(p => p.id === id);
  
  if (productIndex === -1) {
    return res.status(404).json({ message: 'Product not found' });
  }
  
  const updatedProduct = {
    ...products[productIndex],
    ...req.body,
    id, // Ensure ID doesn't change
    price: parseFloat(req.body.price || products[productIndex].price),
    quantity: parseInt(req.body.quantity || products[productIndex].quantity),
    threshold: parseInt(req.body.threshold || products[productIndex].threshold)
  };
  
  products[productIndex] = updatedProduct;
  res.json(updatedProduct);
});

apiRouter.delete('/products/:id', isAdmin, (req, res) => {
  const id = parseInt(req.params.id);
  const productIndex = products.findIndex(p => p.id === id);
  
  if (productIndex === -1) {
    return res.status(404).json({ message: 'Product not found' });
  }
  
  products.splice(productIndex, 1);
  res.status(200).json({ message: 'Product deleted successfully' });
});

// Transaction routes
apiRouter.post('/transactions', isAuthenticated, (req, res) => {
  const { productId, quantity, type } = req.body;
  
  // Find product
  const productIndex = products.findIndex(p => p.id === parseInt(productId));
  if (productIndex === -1) {
    return res.status(404).json({ message: 'Product not found' });
  }
  
  const product = products[productIndex];
  
  // Update stock based on transaction type
  if (type === 'sale') {
    if (product.quantity < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }
    product.quantity -= parseInt(quantity);
  } else if (type === 'restock') {
    product.quantity += parseInt(quantity);
  } else if (type === 'return') {
    product.quantity += parseInt(quantity);
  } else {
    return res.status(400).json({ message: 'Invalid transaction type' });
  }
  
  // Create transaction record
  const totalPrice = (product.price * quantity).toFixed(2);
  const transactionDate = new Date().toISOString();
  
  const newTransaction = {
    id: transactions.length > 0 ? Math.max(...transactions.map(t => t.id)) + 1 : 1,
    productId: parseInt(productId),
    quantity: parseInt(quantity),
    totalPrice,
    type,
    date: transactionDate,
    transactionDate
  };
  
  transactions.push(newTransaction);
  res.status(201).json(newTransaction);
});

apiRouter.get('/transactions', isAuthenticated, (req, res) => {
  res.json(transactions);
});

// Analytics routes
apiRouter.get('/stock', isAuthenticated, (req, res) => {
  // Calculate stock overview
  const totalProducts = products.length;
  const lowStockCount = products.filter(p => p.quantity <= p.threshold).length;
  
  // Calculate total revenue from sales
  const salesTransactions = transactions.filter(t => t.type === 'sale');
  const totalRevenue = salesTransactions.reduce((sum, t) => sum + parseFloat(t.totalPrice), 0).toFixed(2);
  
  // Calculate total items sold
  const totalItemsSold = salesTransactions.reduce((sum, t) => sum + t.quantity, 0);
  
  res.json({
    totalProducts,
    lowStockCount,
    totalRevenue,
    totalItemsSold
  });
});

apiRouter.get('/analytics/sales', isAuthenticated, (req, res) => {
  // Get sales data for the last 7 days
  const now = new Date();
  const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7));
  
  // Filter transactions from the last 7 days
  const recentSales = transactions
    .filter(t => t.type === 'sale' && new Date(t.date) >= sevenDaysAgo)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  
  // Group by day
  const salesByDay = recentSales.reduce((acc, transaction) => {
    const date = new Date(transaction.date).toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = {
        date,
        sales: 0,
        revenue: 0
      };
    }
    acc[date].sales += transaction.quantity;
    acc[date].revenue += parseFloat(transaction.totalPrice);
    return acc;
  }, {});
  
  res.json(Object.values(salesByDay));
});

apiRouter.get('/analytics/top-products', isAuthenticated, (req, res) => {
  // Get top 5 selling products
  const productSales = {};
  
  // Calculate total sales for each product
  transactions
    .filter(t => t.type === 'sale')
    .forEach(t => {
      if (!productSales[t.productId]) {
        productSales[t.productId] = {
          productId: t.productId,
          totalSold: 0,
          revenue: 0
        };
      }
      productSales[t.productId].totalSold += t.quantity;
      productSales[t.productId].revenue += parseFloat(t.totalPrice);
    });
  
  // Add product names
  Object.values(productSales).forEach(item => {
    const product = products.find(p => p.id === item.productId);
    item.name = product ? product.name : 'Unknown Product';
  });
  
  // Sort by total sold and take top 5
  const topProducts = Object.values(productSales)
    .sort((a, b) => b.totalSold - a.totalSold)
    .slice(0, 5);
  
  res.json(topProducts);
});

// User routes
apiRouter.get('/users', isAdmin, (req, res) => {
  // Don't send passwords
  const usersWithoutPasswords = users.map(({ password, ...user }) => user);
  res.json(usersWithoutPasswords);
});

apiRouter.delete('/users/:id', isAdmin, (req, res) => {
  const id = parseInt(req.params.id);
  
  // Don't allow deleting yourself
  if (req.user.id === id) {
    return res.status(400).json({ message: 'Cannot delete your own account' });
  }
  
  const userIndex = users.findIndex(u => u.id === id);
  
  if (userIndex === -1) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  users.splice(userIndex, 1);
  res.status(200).json({ message: 'User deleted successfully' });
});

// Register API router
app.use('/api', apiRouter);

// Health check endpoints
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    vercel: !!process.env.VERCEL,
    vercelUrl: process.env.VERCEL_URL || 'N/A'
  });
});

// Debug endpoint for deployment testing
app.get('/api/debug', (req, res) => {
  const debugInfo = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    headers: req.headers,
    cookies: req.cookies || {},
    session: req.session ? 'Session exists' : 'No session',
    authenticated: req.isAuthenticated ? req.isAuthenticated() : false,
    vercel: {
      isVercel: !!process.env.VERCEL,
      vercelUrl: process.env.VERCEL_URL || 'N/A',
      region: process.env.VERCEL_REGION || 'N/A'
    },
    staticPath: fs.existsSync(path.join(process.cwd(), 'dist/public')) ? 'Exists' : 'Missing'
  };
  
  res.status(200).json(debugInfo);
});

// Handle static files in production mode
if (process.env.NODE_ENV === 'production') {
  // Determine the static files path for Vercel deployment
  const staticPath = path.join(process.cwd(), 'dist/public');
  
  // Check if the directory exists
  if (fs.existsSync(staticPath)) {
    console.log('Serving static files from:', staticPath);
    app.use(express.static(staticPath));
    
    // Serve index.html for all other routes (SPA fallback)
    app.get('*', (req, res) => {
      // Only handle non-API routes
      if (!req.path.startsWith('/api/')) {
        res.sendFile(path.join(staticPath, 'index.html'));
      }
    });
  } else {
    console.warn('Static directory not found:', staticPath);
  }
}

// For Vercel serverless function
module.exports = app;