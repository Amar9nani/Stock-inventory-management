import { pgTable, text, serial, numeric, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Product table definition
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  stockQuantity: integer("stock_quantity").notNull().default(0),
  itemsSold: integer("items_sold").notNull().default(0),
  description: text("description"),
  sku: text("sku").notNull().unique(),
});

// Transaction table definition
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  totalPrice: numeric("total_price", { precision: 10, scale: 2 }).notNull(),
  transactionDate: timestamp("transaction_date").notNull().defaultNow(),
});

// Insert schemas
export const insertProductSchema = createInsertSchema(products).omit({ id: true });
export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true });

// Types
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

// Extend product schema for validation
export const productValidationSchema = insertProductSchema.extend({
  name: z.string().min(3, "Product name must be at least 3 characters"),
  price: z.coerce.number().min(0.01, "Price must be greater than 0"),
  stockQuantity: z.coerce.number().min(0, "Stock quantity cannot be negative"),
  category: z.string().min(1, "Category is required"),
});

// Stock status enum
export enum StockStatus {
  CRITICAL = "critical",
  LOW = "low",
  NORMAL = "normal",
  OVERSTOCKED = "overstocked",
}

// Category enum
export enum ProductCategory {
  DAIRY = "Dairy & Eggs",
  BAKERY = "Bakery",
  PRODUCE = "Produce",
  MEAT = "Meat & Seafood",
  BEVERAGES = "Beverages",
  OTHER = "Other",
}

// Users table definition
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
