import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { TransactionType } from "@shared/schema";

type Transaction = {
  id: number;
  productId: number;
  quantity: number;
  totalPrice: string;
  type: string;
  date: string;
  transactionDate: string;
};

export default function Transactions() {
  // Fetch transactions data
  const { data: transactions = [], isLoading, error } = useQuery({
    queryKey: ["/api/transactions"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/transactions");
      return await res.json();
    }
  });

  // Create a function to format transaction type badges
  const getTransactionBadge = (type: string) => {
    switch (type) {
      case TransactionType.SALE:
        return <Badge className="bg-green-500">Sale</Badge>;
      case TransactionType.RESTOCK:
        return <Badge className="bg-blue-500">Restock</Badge>;
      case TransactionType.RETURN:
        return <Badge className="bg-orange-500">Return</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  // Format price with ₹ symbol
  const formatPrice = (price: string) => {
    return `₹${price}`;
  };

  // Format date to a readable format
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd MMM yyyy, hh:mm a");
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Transaction History</h1>
        <p className="text-muted-foreground">View all transaction records</p>
      </div>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-6">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : error ? (
            <div className="text-destructive text-center p-6">
              Failed to load transactions. Please try again.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Product ID</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Total Price</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6">
                      No transactions found
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((transaction: Transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{transaction.id}</TableCell>
                      <TableCell>{transaction.productId}</TableCell>
                      <TableCell>{transaction.quantity}</TableCell>
                      <TableCell>{formatPrice(transaction.totalPrice)}</TableCell>
                      <TableCell>{getTransactionBadge(transaction.type)}</TableCell>
                      <TableCell>{formatDate(transaction.date)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}