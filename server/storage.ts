import { 
  Product, 
  InsertProduct, 
  Transaction, 
  InsertTransaction,
  User,
  InsertUser,
  products,
  TransactionType,
  UserRole
} from "@shared/schema";

// Define storage interface
export interface IStorage {
  // Product operations
  getAllProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  
  // Transaction operations
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getAllTransactions(): Promise<Transaction[]>;
  
  // Analytics operations
  getStockOverview(): Promise<{
    totalProducts: number;
    lowStockCount: number;
    totalRevenue: number;
    totalItemsSold: number;
  }>;
  
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
}

// Memory storage implementation
export class MemStorage implements IStorage {
  private products: Map<number, Product>;
  private transactions: Map<number, Transaction>;
  private users: Map<number, User>;
  private productCurrentId: number;
  private transactionCurrentId: number;
  private userCurrentId: number;

  constructor() {
    this.products = new Map();
    this.transactions = new Map();
    this.users = new Map();
    this.productCurrentId = 1;
    this.transactionCurrentId = 1;
    this.userCurrentId = 1;
    
    // Add some initial products and transactions for testing
    this.seedProducts();
    this.seedTransactions();
    this.seedUsers();
  }
  
  // Seed admin user
  private seedUsers() {
    // We don't need to seed users here anymore
    // Users are being created in auth.ts setupAuth function
    console.log("Users will be created by auth.ts");
  }
  
  // Seed transactions
  private seedTransactions() {
    const initialTransactions: Omit<Transaction, 'id'|'transactionDate'>[] = [
      {
        productId: 1,
        quantity: 5,
        totalPrice: "1995.00",
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(), // 1 day ago
        type: "sale"
      },
      {
        productId: 2,
        quantity: 3,
        totalPrice: "747.00",
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
        type: "sale"
      },
      {
        productId: 3,
        quantity: 10,
        totalPrice: "1290.00",
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
        type: "sale"
      },
      {
        productId: 4,
        quantity: 2,
        totalPrice: "1998.00",
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(), // 4 days ago
        type: "sale"
      },
      {
        productId: 5,
        quantity: 7,
        totalPrice: "693.00",
        date: new Date(Date.now()).toISOString(), // today
        type: "sale"
      }
    ];
    
    initialTransactions.forEach(transaction => {
      const id = this.transactionCurrentId++;
      const newTransaction: Transaction = { 
        ...transaction, 
        id,
        transactionDate: new Date() 
      };
      this.transactions.set(id, newTransaction);
    });
  }

  // Seed some initial data
  private seedProducts() {
    const initialProducts: InsertProduct[] = [
      {
        name: "Organic Whole Milk",
        category: "Dairy & Eggs",
        price: "399.00",
        stockQuantity: 42,
        itemsSold: 86,
        description: "Farm fresh organic whole milk",
        sku: "PRD001"
      },
      {
        name: "Fresh French Baguette",
        category: "Bakery",
        price: "249.00",
        stockQuantity: 8,
        itemsSold: 54,
        description: "Freshly baked French baguette",
        sku: "PRD002"
      },
      {
        name: "Organic Banana Bunch",
        category: "Produce",
        price: "129.00",
        stockQuantity: 124,
        itemsSold: 210,
        description: "Organic banana bunch",
        sku: "PRD003"
      },
      {
        name: "Premium Ground Beef",
        category: "Meat & Seafood",
        price: "699.00",
        stockQuantity: 32,
        itemsSold: 45,
        description: "Premium ground beef, 1lb package",
        sku: "PRD004"
      },
      {
        name: "Sparkling Water 12-Pack",
        category: "Beverages",
        price: "99.00",
        stockQuantity: 5,
        itemsSold: 78,
        description: "12-pack of sparkling water",
        sku: "PRD005"
      }
    ];

    initialProducts.forEach(product => {
      this.createProduct(product);
    });
  }

  // Product operations
  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.productCurrentId++;
    const newProduct: Product = { 
      ...product, 
      id,
      stockQuantity: product.stockQuantity ?? 0,
      itemsSold: product.itemsSold ?? 0,
      description: product.description ?? null
    };
    this.products.set(id, newProduct);
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const existingProduct = this.products.get(id);
    if (!existingProduct) return undefined;

    const updatedProduct = { ...existingProduct, ...product };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }

  // Transaction operations
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const id = this.transactionCurrentId++;
    const newTransaction: Transaction = { 
      ...transaction, 
      id,
      transactionDate: new Date(), 
      date: new Date().toISOString(),
      type: transaction.type || "sale"
    };
    
    this.transactions.set(id, newTransaction);
    
    // Update the product sold count and stock quantity
    const product = this.products.get(transaction.productId);
    if (product) {
      const updatedProduct = { 
        ...product, 
        itemsSold: product.itemsSold + transaction.quantity,
        stockQuantity: product.stockQuantity - transaction.quantity
      };
      this.products.set(product.id, updatedProduct);
    }
    
    return newTransaction;
  }

  async getAllTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values());
  }

  // Analytics operations
  async getStockOverview(): Promise<{
    totalProducts: number;
    lowStockCount: number;
    totalRevenue: number;
    totalItemsSold: number;
  }> {
    const products = Array.from(this.products.values());
    const lowStockThreshold = 10;

    const totalProducts = products.length;
    const lowStockCount = products.filter(p => p.stockQuantity <= lowStockThreshold).length;
    const totalItemsSold = products.reduce((sum, p) => sum + p.itemsSold, 0);
    
    // Calculate revenue from transactions to be more accurate
    const totalRevenue = Array.from(this.transactions.values())
      .reduce((sum, t) => sum + Number(t.totalPrice), 0);

    return {
      totalProducts,
      lowStockCount,
      totalRevenue,
      totalItemsSold
    };
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { 
      ...insertUser, 
      id,
      role: insertUser.role || UserRole.USER,
      email: insertUser.email || ""
    };
    this.users.set(id, user);
    return user;
  }
}

export const storage = new MemStorage();
