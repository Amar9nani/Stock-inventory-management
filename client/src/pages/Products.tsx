import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/use-products";
import ProductsTable from "@/components/products/ProductsTable";
import FilterBar from "@/components/products/FilterBar";
import { Product } from "@shared/schema";
import ProductForm from "@/components/products/ProductForm";
import { exportToCSV } from "@/utils/csv";

export default function Products() {
  const { products, isLoading } = useProducts();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [stockStatus, setStockStatus] = useState("");
  const [sortBy, setSortBy] = useState("name_asc");
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);

  const handleAddProduct = () => {
    setIsAddProductOpen(true);
  };

  const handleExportCSV = () => {
    if (products.length > 0) {
      exportToCSV(products, "products");
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
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-medium text-gray-800">Products</h1>
        <p className="text-gray-600">Manage your product inventory</p>
      </div>

      <div className="flex flex-wrap items-center justify-between mb-4">
        <h2 className="text-xl font-medium text-gray-800">Product List</h2>
        <div className="mt-2 sm:mt-0 flex space-x-2">
          <Button onClick={handleAddProduct} className="flex items-center">
            <span className="material-icons text-sm mr-1">add</span>
            Add Product
          </Button>
          <Button
            variant="outline"
            onClick={handleExportCSV}
            className="flex items-center"
          >
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

      <ProductForm
        open={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
      />
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
