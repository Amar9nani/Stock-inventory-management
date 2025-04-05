import { Product } from "@shared/schema";

export function exportToCSV(data: Product[], filename: string) {
  // Define the headers for the CSV file
  const headers = [
    "ID",
    "SKU",
    "Name",
    "Category",
    "Price",
    "Stock Quantity",
    "Items Sold",
    "Description",
  ];

  // Format the data for CSV
  const rows = data.map((product) => [
    product.id.toString(),
    product.sku,
    product.name,
    product.category,
    Number(product.price).toFixed(2),
    product.stockQuantity.toString(),
    product.itemsSold.toString(),
    product.description || "",
  ]);

  // Add headers as the first row
  const csvContent = [headers, ...rows]
    .map((row) => row.map(formatCSVCell).join(","))
    .join("\n");

  // Create a Blob object with the CSV content
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  // Create a temporary link and click it to trigger the download
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${getFormattedDate()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Helper function to format CSV cells (handle commas, quotes, etc.)
function formatCSVCell(value: string): string {
  // If the value contains a comma, a newline, or a double quote, we need to escape it
  if (value.includes(",") || value.includes("\n") || value.includes('"')) {
    // Replace all double quotes with two double quotes
    const escaped = value.replace(/"/g, '""');
    // Wrap the value in double quotes
    return `"${escaped}"`;
  }
  return value;
}

// Helper function to get formatted date for filename
function getFormattedDate(): string {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}
