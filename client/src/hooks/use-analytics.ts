import { useQuery } from "@tanstack/react-query";

export function useAnalytics() {
  // Get stock overview data
  const {
    data: stockOverview,
    isLoading: isStockOverviewLoading,
    isError: isStockOverviewError,
    error: stockOverviewError,
  } = useQuery({
    queryKey: ["/api/stock"],
  });

  // Get sales analytics data
  const {
    data: salesData = [],
    isLoading: isSalesDataLoading,
    isError: isSalesDataError,
    error: salesDataError,
  } = useQuery({
    queryKey: ["/api/analytics/sales"],
  });

  // Get top products data
  const {
    data: topProducts = [],
    isLoading: isTopProductsLoading,
    isError: isTopProductsError,
    error: topProductsError,
  } = useQuery({
    queryKey: ["/api/analytics/top-products"],
  });

  return {
    stockOverview,
    isStockOverviewLoading,
    isStockOverviewError,
    stockOverviewError,
    
    salesData,
    isSalesDataLoading,
    isSalesDataError,
    salesDataError,
    
    topProducts,
    isTopProductsLoading,
    isTopProductsError,
    topProductsError,
  };
}
