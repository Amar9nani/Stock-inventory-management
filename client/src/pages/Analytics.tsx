import { useAnalytics } from "@/hooks/use-analytics";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Analytics() {
  const [salesTimeRange, setSalesTimeRange] = useState("30days");
  const [topProductsTimeRange, setTopProductsTimeRange] = useState("month");
  const [salesChartType, setSalesChartType] = useState("area");

  const {
    stockOverview,
    isStockOverviewLoading,
    salesData,
    isSalesDataLoading,
    topProducts,
    isTopProductsLoading,
  } = useAnalytics();

  // Format data for sales chart
  const formattedSalesData = salesData.map((item: any) => ({
    date: new Date(item.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    revenue: Number(item.revenue),
    items: item.itemsSold,
  }));

  // Format data for top products chart
  const topProductsData = topProducts.map((product: any) => ({
    name: product.name,
    value: product.itemsSold,
    revenue: Number(product.price) * product.itemsSold,
  }));

  // Colors for pie chart
  const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-medium text-gray-800">Sales Analytics</h1>
        <p className="text-gray-600">
          Analyze your sales performance and inventory metrics
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-3xl font-semibold text-gray-800 mt-2">
                {isStockOverviewLoading
                  ? "Loading..."
                  : `$${stockOverview?.totalRevenue?.toFixed(2) || "0.00"}`}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Items Sold</p>
              <p className="text-3xl font-semibold text-gray-800 mt-2">
                {isStockOverviewLoading
                  ? "Loading..."
                  : stockOverview?.totalItemsSold || 0}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">
                Average Order Value
              </p>
              <p className="text-3xl font-semibold text-gray-800 mt-2">
                {isStockOverviewLoading
                  ? "Loading..."
                  : stockOverview?.totalItemsSold
                  ? `$${(
                      stockOverview.totalRevenue / stockOverview.totalItemsSold
                    ).toFixed(2)}`
                  : "$0.00"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-wrap justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-800">
              Sales Performance
            </h3>
            <div className="flex space-x-2 mt-2 sm:mt-0">
              <Tabs
                value={salesChartType}
                onValueChange={setSalesChartType}
                className="w-[260px]"
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="area">Area</TabsTrigger>
                  <TabsTrigger value="line">Line</TabsTrigger>
                  <TabsTrigger value="bar">Bar</TabsTrigger>
                </TabsList>
              </Tabs>
              <Select
                value={salesTimeRange}
                onValueChange={setSalesTimeRange}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 Days</SelectItem>
                  <SelectItem value="30days">Last 30 Days</SelectItem>
                  <SelectItem value="3months">Last 3 Months</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="h-80">
            {isSalesDataLoading ? (
              <div className="h-full flex items-center justify-center">
                <p>Loading data...</p>
              </div>
            ) : formattedSalesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                {salesChartType === "area" ? (
                  <AreaChart
                    data={formattedSalesData}
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
                ) : salesChartType === "line" ? (
                  <LineChart data={formattedSalesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, "Revenue"]} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="hsl(var(--primary))"
                      activeDot={{ r: 8 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="items"
                      stroke="hsl(var(--chart-2))"
                    />
                  </LineChart>
                ) : (
                  <BarChart data={formattedSalesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, "Revenue"]} />
                    <Legend />
                    <Bar
                      dataKey="revenue"
                      fill="hsl(var(--primary))"
                      name="Revenue"
                    />
                  </BarChart>
                )}
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center border border-dashed border-gray-300 rounded-md">
                <div className="text-center">
                  <span className="material-icons text-gray-400 text-4xl mb-2">
                    insert_chart
                  </span>
                  <p className="text-gray-500">No sales data available</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top Products and Category Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Top Products Chart */}
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-800">
                Top Selling Products
              </h3>
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

            <div className="h-64">
              {isTopProductsLoading ? (
                <div className="h-full flex items-center justify-center">
                  <p>Loading data...</p>
                </div>
              ) : topProductsData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={topProductsData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {topProductsData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, "Units Sold"]} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center border border-dashed border-gray-300 rounded-md">
                  <div className="text-center">
                    <span className="material-icons text-gray-400 text-4xl mb-2">
                      pie_chart
                    </span>
                    <p className="text-gray-500">No product data available</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Category Analysis */}
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-800">
                Revenue by Category
              </h3>
              <Select defaultValue="month">
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

            <div className="h-64">
              {isTopProductsLoading ? (
                <div className="h-full flex items-center justify-center">
                  <p>Loading data...</p>
                </div>
              ) : topProductsData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topProductsData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={100} />
                    <Tooltip formatter={(value) => [`$${value}`, "Revenue"]} />
                    <Bar
                      dataKey="revenue"
                      fill="hsl(var(--chart-2))"
                      name="Revenue"
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center border border-dashed border-gray-300 rounded-md">
                  <div className="text-center">
                    <span className="material-icons text-gray-400 text-4xl mb-2">
                      bar_chart
                    </span>
                    <p className="text-gray-500">No category data available</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
