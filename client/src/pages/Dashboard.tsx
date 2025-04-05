import { useQuery } from "@tanstack/react-query";
import StatsCard from "@/components/dashboard/StatsCard";
import StockOverview from "@/components/dashboard/StockOverview";
import AnalyticsCharts from "@/components/dashboard/AnalyticsCharts";

export default function Dashboard() {
  const { data: stockOverview, isLoading } = useQuery({
    queryKey: ["/api/stock"],
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-medium text-gray-800">Dashboard</h1>
        <p className="text-gray-600">Overview of your supermarket stock</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Total Products"
          value={isLoading ? "..." : stockOverview?.totalProducts || 0}
          change="+5% from last month"
          icon="inventory_2"
          iconColor="text-primary"
        />
        <StatsCard
          title="Low Stock Items"
          value={isLoading ? "..." : stockOverview?.lowStockCount || 0}
          change="+2 since yesterday"
          changeType="increase"
          icon="warning"
          iconColor="text-warning-main"
        />
        <StatsCard
          title="Total Revenue"
          value={
            isLoading
              ? "..."
              : `$${stockOverview?.totalRevenue?.toFixed(2) || "0.00"}`
          }
          change="+12.5% from last month"
          icon="payments"
          iconColor="text-success-main"
        />
        <StatsCard
          title="Items Sold"
          value={isLoading ? "..." : stockOverview?.totalItemsSold || 0}
          change="+7.2% from last week"
          icon="shopping_cart"
          iconColor="text-primary"
        />
      </div>

      {/* Stock Overview */}
      <StockOverview />

      {/* Analytics Charts */}
      <AnalyticsCharts />
    </div>
  );
}
