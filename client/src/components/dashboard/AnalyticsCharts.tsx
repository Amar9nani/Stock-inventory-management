import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

export default function AnalyticsCharts() {
  const [revenueTimeRange, setRevenueTimeRange] = useState("6months");
  const [topProductsTimeRange, setTopProductsTimeRange] = useState("month");

  const { data: salesData = [], isLoading: isSalesLoading } = useQuery({
    queryKey: ["/api/analytics/sales"],
  });

  const { data: topProducts = [], isLoading: isTopProductsLoading } = useQuery({
    queryKey: ["/api/analytics/top-products"],
  });

  // Format data for revenue chart
  const revenueData = salesData.map((item: any) => ({
    date: new Date(item.date).toLocaleDateString("en-US", { month: 'short', day: 'numeric' }),
    revenue: Number(item.revenue),
  }));

  // Format data for top products chart
  const topProductsData = topProducts.map((product: any) => ({
    name: product.name,
    sold: product.itemsSold,
    revenue: Number(product.price) * product.itemsSold,
  }));

  return (
    <div>
      <h2 className="text-xl font-medium text-gray-800 mb-4">Sales Analytics</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-800">Monthly Revenue</h3>
              <Select
                value={revenueTimeRange}
                onValueChange={setRevenueTimeRange}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6months">Last 6 Months</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isSalesLoading ? (
              <div className="h-64 flex items-center justify-center">
                <p>Loading data...</p>
              </div>
            ) : revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart
                  data={revenueData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value}`, "Revenue"]} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary) / 0.2)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center border border-dashed border-gray-300 rounded-md">
                <div className="text-center">
                  <span className="material-icons text-gray-400 text-4xl mb-2">insert_chart</span>
                  <p className="text-gray-500">No revenue data available</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Products Chart */}
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-800">Top Selling Products</h3>
              <Select
                value={topProductsTimeRange}
                onValueChange={setTopProductsTimeRange}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="3months">Last 3 Months</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isTopProductsLoading ? (
              <div className="h-64 flex items-center justify-center">
                <p>Loading data...</p>
              </div>
            ) : topProductsData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={topProductsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sold" name="Units Sold" fill="hsl(var(--chart-1))" />
                  <Bar dataKey="revenue" name="Revenue ($)" fill="hsl(var(--chart-2))" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center border border-dashed border-gray-300 rounded-md">
                <div className="text-center">
                  <span className="material-icons text-gray-400 text-4xl mb-2">pie_chart</span>
                  <p className="text-gray-500">No product data available</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
