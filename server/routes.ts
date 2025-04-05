import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  productValidationSchema, 
  insertTransactionSchema,
  StockStatus
} from "@shared/schema";
import { z } from "zod";
import { setupAuth, isAuthenticated, isAdmin } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);
  
  // API Routes
  const apiRouter = express.Router();

  // Products routes - view is public
  apiRouter.get("/products", async (req: Request, res: Response) => {
    try {
      const products = await storage.getAllProducts();
      return res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      return res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  apiRouter.get("/products/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }

      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      return res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      return res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  apiRouter.post("/products", isAdmin, async (req: Request, res: Response) => {
    try {
      const validatedData = productValidationSchema.safeParse(req.body);
      if (!validatedData.success) {
        return res.status(400).json({ 
          message: "Invalid product data", 
          errors: validatedData.error.errors 
        });
      }

      const newProduct = await storage.createProduct(validatedData.data);
      return res.status(201).json(newProduct);
    } catch (error) {
      console.error("Error creating product:", error);
      return res.status(500).json({ message: "Failed to create product" });
    }
  });

  apiRouter.put("/products/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }

      // Partial validation for update
      const validatedData = productValidationSchema.partial().safeParse(req.body);
      if (!validatedData.success) {
        return res.status(400).json({ 
          message: "Invalid product data", 
          errors: validatedData.error.errors 
        });
      }

      const updatedProduct = await storage.updateProduct(id, validatedData.data);
      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }

      return res.json(updatedProduct);
    } catch (error) {
      console.error("Error updating product:", error);
      return res.status(500).json({ message: "Failed to update product" });
    }
  });

  apiRouter.delete("/products/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }

      const success = await storage.deleteProduct(id);
      if (!success) {
        return res.status(404).json({ message: "Product not found" });
      }

      return res.status(204).send();
    } catch (error) {
      console.error("Error deleting product:", error);
      return res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Transactions routes - requires authentication
  apiRouter.post("/transactions", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const validatedData = insertTransactionSchema.safeParse(req.body);
      if (!validatedData.success) {
        return res.status(400).json({ 
          message: "Invalid transaction data", 
          errors: validatedData.error.errors 
        });
      }

      const newTransaction = await storage.createTransaction(validatedData.data);
      return res.status(201).json(newTransaction);
    } catch (error) {
      console.error("Error creating transaction:", error);
      return res.status(500).json({ message: "Failed to create transaction" });
    }
  });

  // Stock overview route - requires authentication
  apiRouter.get("/stock", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const overview = await storage.getStockOverview();
      return res.json(overview);
    } catch (error) {
      console.error("Error fetching stock overview:", error);
      return res.status(500).json({ message: "Failed to fetch stock overview" });
    }
  });

  // Analytics routes - requires authentication
  apiRouter.get("/analytics/sales", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Get transactions and aggregate by date
      const transactions = await storage.getAllTransactions();
      
      // Create a map to aggregate sales by date
      const salesByDate = new Map<string, { revenue: number; itemsSold: number }>();
      
      transactions.forEach(transaction => {
        const date = new Date(transaction.transactionDate).toISOString().split('T')[0];
        
        if (!salesByDate.has(date)) {
          salesByDate.set(date, { revenue: 0, itemsSold: 0 });
        }
        
        const currentSales = salesByDate.get(date)!;
        salesByDate.set(date, {
          revenue: currentSales.revenue + Number(transaction.totalPrice),
          itemsSold: currentSales.itemsSold + transaction.quantity
        });
      });
      
      // Convert map to array of objects
      const salesData = Array.from(salesByDate.entries()).map(([date, data]) => ({
        date,
        ...data
      }));
      
      // Sort by date
      salesData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      return res.json(salesData);
    } catch (error) {
      console.error("Error fetching sales analytics:", error);
      return res.status(500).json({ message: "Failed to fetch sales analytics" });
    }
  });

  apiRouter.get("/analytics/top-products", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const products = await storage.getAllProducts();
      
      // Sort products by items sold (descending)
      const topProducts = [...products]
        .sort((a, b) => b.itemsSold - a.itemsSold)
        .slice(0, 5); // Get top 5
      
      return res.json(topProducts);
    } catch (error) {
      console.error("Error fetching top products:", error);
      return res.status(500).json({ message: "Failed to fetch top products" });
    }
  });

  // Register API routes with /api prefix
  app.use("/api", apiRouter);

  const httpServer = createServer(app);
  return httpServer;
}
