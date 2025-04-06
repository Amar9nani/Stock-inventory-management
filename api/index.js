// Simplified serverless function for Vercel
const express = require('express');
const path = require('path');
const cors = require('cors');
const { json, urlencoded } = require('body-parser');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

// Initialize express
const app = express();

// Global error handler for uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

// Custom error handler middleware
app.use((req, res, next) => {
  try {
    next();
  } catch (error) {
    console.error('Middleware error:', error);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

// CORS configuration for Vercel deployment
const corsOptions = {
  origin: function (origin, callback) {
    // Allow all origins for Vercel deployment
    callback(null, true);
  },
  credentials: true
};

app.use(cors(corsOptions));
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(cookieParser());

// Handle OPTIONS requests for CORS preflight
app.options('*', cors(corsOptions));

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'supermarket-stock-manager-secret';

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
  {
    id: 2,
    name: 'Bread',
    price: 25.00,
    category: 'Bakery',
    quantity: 50,
    description: 'Whole wheat bread',
    threshold: 10
  },
  {
    id: 3,
    name: 'Eggs',
    price: 60.00,
    category: 'Dairy & Eggs',
    quantity: 200,
    description: 'Free-range eggs (dozen)',
    threshold: 30
  }
];

const transactions = [];

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

// JWT Authentication
function generateToken(user) {
  const { password, ...userWithoutPassword } = user;
  return jwt.sign(userWithoutPassword, JWT_SECRET, { expiresIn: '24h' });
}

function verifyToken(req, res, next) {
  // Get token from cookies, authorization header, or query parameter
  const token = req.cookies.token || 
                (req.headers.authorization && req.headers.authorization.split(' ')[1]) || 
                req.query.token;
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

function isAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  res.status(403).json({ message: 'Admin access required' });
}

// API Routes
const apiRouter = express.Router();

// Authentication routes
apiRouter.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = users.find(u => u.username === username);
    if (!user || !comparePasswords(password, user.password)) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = generateToken(user);
    
    // Set token as HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'none'
    });
    
    // Don't send password to client
    const { password: _, ...userWithoutPassword } = user;
    res.status(200).json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
});

apiRouter.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ message: 'Logged out successfully' });
});

apiRouter.post('/register', (req, res) => {
  try {
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
    
    // Generate token
    const token = generateToken(newUser);
    
    // Set token as HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'none'
    });
    
    // Don't send password to client
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
});

apiRouter.get('/user', verifyToken, (req, res) => {
  res.json(req.user);
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

apiRouter.post('/products', verifyToken, isAdmin, (req, res) => {
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

apiRouter.put('/products/:id', verifyToken, isAdmin, (req, res) => {
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

apiRouter.delete('/products/:id', verifyToken, isAdmin, (req, res) => {
  const id = parseInt(req.params.id);
  const productIndex = products.findIndex(p => p.id === id);
  
  if (productIndex === -1) {
    return res.status(404).json({ message: 'Product not found' });
  }
  
  products.splice(productIndex, 1);
  res.status(200).json({ message: 'Product deleted successfully' });
});

// Transaction routes
apiRouter.post('/transactions', verifyToken, (req, res) => {
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

apiRouter.get('/transactions', verifyToken, (req, res) => {
  res.json(transactions);
});

// Analytics routes
apiRouter.get('/stock', verifyToken, (req, res) => {
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

apiRouter.get('/analytics/sales', verifyToken, (req, res) => {
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

apiRouter.get('/analytics/top-products', verifyToken, (req, res) => {
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
apiRouter.get('/users', verifyToken, isAdmin, (req, res) => {
  // Don't send passwords
  const usersWithoutPasswords = users.map(({ password, ...user }) => user);
  res.json(usersWithoutPasswords);
});

apiRouter.delete('/users/:id', verifyToken, isAdmin, (req, res) => {
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

// Register API router
app.use('/api', apiRouter);

// For Vercel serverless function
module.exports = app;