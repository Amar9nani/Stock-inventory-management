import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductCategory } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface FilterBarProps {
  search: string;
  setSearch: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
  stockStatus: string;
  setStockStatus: (value: string) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
}

export default function FilterBar({
  search,
  setSearch,
  category,
  setCategory,
  stockStatus,
  setStockStatus,
  sortBy,
  setSortBy,
}: FilterBarProps) {
  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-4">
          <div className="w-full md:w-auto flex-1 md:flex-none">
            <Label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-icons text-gray-400 text-sm">search</span>
              </div>
              <Input
                id="search"
                type="text"
                className="pl-10"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="w-full sm:w-1/2 md:w-auto">
            <Label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category" className="w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Object.values(ProductCategory).map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full sm:w-1/2 md:w-auto">
            <Label htmlFor="stockStatus" className="block text-sm font-medium text-gray-700 mb-1">
              Stock Status
            </Label>
            <Select value={stockStatus} onValueChange={setStockStatus}>
              <SelectTrigger id="stockStatus" className="w-[180px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="low">Low Stock</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="overstocked">Overstocked</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-full sm:w-1/2 md:w-auto">
            <Label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </Label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger id="sortBy" className="w-[180px]">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name_asc">Name (A-Z)</SelectItem>
                <SelectItem value="name_desc">Name (Z-A)</SelectItem>
                <SelectItem value="stock_asc">Stock (Low to High)</SelectItem>
                <SelectItem value="stock_desc">Stock (High to Low)</SelectItem>
                <SelectItem value="price_asc">Price (Low to High)</SelectItem>
                <SelectItem value="price_desc">Price (High to Low)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
