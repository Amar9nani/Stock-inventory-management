import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import ProductsTable from "../products/ProductsTable";
import FilterBar from "../products/FilterBar";
import { useState } from "react";
import { Product } from "@shared/schema";
import { exportToCSV } from "@/utils/csv";

export default function StockOverview() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [stockStatus, setStockStatus] = useState("");
  const [sortBy, setSortBy] = useState("name_asc");

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["/api/products"],
  });

  const handleAddProduct = () => {
    // This will be implemented in the Products page
    window.location.href = "/products";
  };

  const handleExportCSV = () => {
    if (products.length > 0) {
      exportToCSV(products, "stock_overview");
    }
  };

  // Filter and sort products
  const filteredProducts = filterAndSortProducts(products, {
    search,
    category,
    stockStatus,
    sortBy,
  });

  return (
    <div className="mb-8">
      <div className="flex flex-wrap items-center justify-between mb-4">
        <h2 className="text-xl font-medium text-gray-800">Stock Overview</h2>
        <div className="mt-2 sm:mt-0 flex space-x-2">
          <Button onClick={handleAddProduct} className="flex items-center">
            <span className="material-icons text-sm mr-1">add</span>
            Add Product
          </Button>
          <Button variant="outline" onClick={handleExportCSV} className="flex items-center">
            <span className="material-icons text-sm mr-1">file_download</span>
            Export CSV
          </Button>
        </div>
      </div>

      <FilterBar
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
        stockStatus={stockStatus}
        setStockStatus={setStockStatus}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      <ProductsTable products={filteredProducts} isLoading={isLoading} />
    </div>
  );
}

// Helper function to filter and sort products
function filterAndSortProducts(
  products: Product[],
  filters: {
    search: string;
    category: string;
    stockStatus: string;
    sortBy: string;
  }
): Product[] {
  const { search, category, stockStatus, sortBy } = filters;

  // First filter the products
  let filtered = [...products];

  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(
      (product) =>
        product.name.toLowerCase().includes(searchLower) ||
        product.sku.toLowerCase().includes(searchLower)
    );
  }

  if (category) {
    filtered = filtered.filter((product) => product.category === category);
  }

  if (stockStatus) {
    filtered = filtered.filter((product) => {
      if (stockStatus === "low") {
        return product.stockQuantity <= 10;
      } else if (stockStatus === "normal") {
        return product.stockQuantity > 10 && product.stockQuantity <= 100;
      } else if (stockStatus === "overstocked") {
        return product.stockQuantity > 100;
      }
      return true;
    });
  }

  // Then sort the products
  return filtered.sort((a, b) => {
    switch (sortBy) {
      case "name_asc":
        return a.name.localeCompare(b.name);
      case "name_desc":
        return b.name.localeCompare(a.name);
      case "stock_asc":
        return a.stockQuantity - b.stockQuantity;
      case "stock_desc":
        return b.stockQuantity - a.stockQuantity;
      case "price_asc":
        return Number(a.price) - Number(b.price);
      case "price_desc":
        return Number(b.price) - Number(a.price);
      default:
        return 0;
    }
  });
}
